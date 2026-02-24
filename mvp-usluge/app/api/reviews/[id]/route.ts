import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateReviewSchema, respondToReviewSchema } from "@/lib/validations/reviews";
import { updateUserAverageRating } from "@/lib/utils";
import { UserRole } from "@prisma/client";

/**
 * GET /api/reviews/[id]
 * Vraća detalje jedne ocene
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        target: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        booking: {
          select: {
            id: true,
            scheduledDate: true,
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return errorResponse("Ocena nije pronađena", 404);
    }

    return successResponse(review);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/reviews/[id]
 * Izmena ocene (klijent) ili dodavanje odgovora (pružalac)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Pronađi ocenu
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!existingReview) {
      return errorResponse("Ocena nije pronađena", 404);
    }

    const body = await req.json();

    // Proveri da li je odgovor pružaoca ili izmena ocene
    const isResponse = "response" in body;
    const isAuthor = existingReview.authorId === user.id;
    const isTarget = existingReview.targetId === user.id;

    if (isResponse) {
      // ODGOVOR PRUŽAOCA
      if (!isTarget && user.role !== UserRole.ADMIN) {
        return errorResponse(
          "Samo pružalac može odgovoriti na ocenu",
          403
        );
      }

      const validatedData = respondToReviewSchema.parse(body);

      const updatedReview = await prisma.review.update({
        where: { id: params.id },
        data: {
          response: validatedData.response,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // TODO: Poslati notifikaciju klijentu

      return successResponse(
        updatedReview,
        "Odgovor je uspešno dodat"
      );
    } else {
      // IZMENA OCENE (KLIJENT)
      if (!isAuthor && user.role !== UserRole.ADMIN) {
        return errorResponse(
          "Možete izmeniti samo svoje ocene",
          403
        );
      }

      // Proveri da li je prošlo više od 7 dana
      const createdAt = new Date(existingReview.createdAt);
      const now = new Date();
      const daysSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCreation > 7) {
        return errorResponse(
          "Ocene se mogu menjati samo u roku od 7 dana",
          400
        );
      }

      const validatedData = updateReviewSchema.parse(body);

      const updatedReview = await prisma.review.update({
        where: { id: params.id },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
        include: {
          target: {
            select: {
              id: true,
            },
          },
        },
      });

      // Ako se promenila ocena, ažuriraj prosek
      if (validatedData.rating) {
        await updateUserAverageRating(updatedReview.target.id);
      }

      return successResponse(
        updatedReview,
        "Ocena je uspešno izmenjena"
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/reviews/[id]
 * Briše ocenu (samo admin ili autor u roku od 24h)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        target: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!review) {
      return errorResponse("Ocena nije pronađena", 404);
    }

    // Samo autor ili admin mogu obrisati
    if (review.authorId !== user.id && user.role !== UserRole.ADMIN) {
      return errorResponse("Nemate dozvolu da obrišete ovu ocenu", 403);
    }

    // Autor može obrisati samo u roku od 24h
    if (review.authorId === user.id && user.role !== UserRole.ADMIN) {
      const createdAt = new Date(review.createdAt);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation > 24) {
        return errorResponse(
          "Ocene se mogu brisati samo u roku od 24h",
          400
        );
      }
    }

    await prisma.review.delete({
      where: { id: params.id },
    });

    // Ažuriraj prosečnu ocenu
    await updateUserAverageRating(review.target.id);

    return successResponse(null, "Ocena je obrisana");
  } catch (error) {
    return handleApiError(error);
  }
}
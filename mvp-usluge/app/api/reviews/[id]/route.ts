import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateReviewSchema, respondToReviewSchema } from "@/lib/validations/reviews";
import { updateUserAverageRating } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { validateUUID, sanitizeText } from '@/lib/sanitize';

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Vraća detalje jedne ocene
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalji ocene
 *       404:
 *         description: Ocena nije pronađena
 *   patch:
 *     summary: Ažurira ocenu ili dodaje odgovor
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ocena ažurirana
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Ocena nije pronađena
 *   delete:
 *     summary: Briše ocenu
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ocena obrisana
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Ocena nije pronađena
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🛡 VALIDACIJA UUID
    if (!validateUUID((await params).id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    const review = await prisma.review.findUnique({
      where: { id: (await params).id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID((await params).id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    // Pronađi ocenu
    const existingReview = await prisma.review.findUnique({
      where: { id: (await params).id },
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
        console.warn(`IDOR attempt: User ${user.id} tried to respond to review ${(await params).id}`);
        return errorResponse(
          "Samo pružalac može odgovoriti na ocenu",
          403
        );
      }

      // 🛡 XSS ZAŠTITA - Sanitizuj odgovor
      const sanitizedBody = {
        ...body,
        response: body.response ? sanitizeText(body.response) : undefined,
      };

      const validatedData = respondToReviewSchema.parse(sanitizedBody);

      const updatedReview = await prisma.review.update({
        where: { id: (await params).id },
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
        console.warn(`IDOR attempt: User ${user.id} tried to modify review ${(await params).id}`);
        return errorResponse(
          "Možete izmeniti samo svoje ocene",
          403
        );
      }

      // 🛡 XSS ZAŠTITA - Sanitizuj komentar
      const sanitizedBody = {
        ...body,
        comment: body.comment ? sanitizeText(body.comment) : undefined,
      };

      const validatedData = updateReviewSchema.parse(sanitizedBody);
      // Proveri da li je prošlo više od 7 dana
      const createdAt = new Date(existingReview.createdAt);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const EDIT_WINDOW_HOURS = 7 * 24; // 7 dana

      if (hoursSinceCreation > EDIT_WINDOW_HOURS) {
        return errorResponse(
          "Ocene se mogu menjati samo u roku od 7 dana",
          400
        );
      }


      const updatedReview = await prisma.review.update({
        where: { id: (await params).id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID((await params).id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    const review = await prisma.review.findUnique({
      where: { id: (await params).id },
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
      console.warn(`IDOR attempt: User ${user.id} tried to delete review ${(await params).id}`);
      return errorResponse("Nemate dozvolu da obrišete ovu ocenu", 403);
    }

    // Autor može obrisati samo u roku od 7 dana
    if (review.authorId === user.id && user.role !== UserRole.ADMIN) {
      const createdAt = new Date(review.createdAt);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const DELETE_WINDOW_HOURS = 7 * 24; // 7 dana

      if (hoursSinceCreation > DELETE_WINDOW_HOURS) {
        return errorResponse(
          "Ocene se mogu brisati samo u roku od 7 dana",
          400
        );
      }
    }

    await prisma.review.delete({
      where: { id: (await params).id },
    });

    // Ažuriraj prosečnu ocenu
    await updateUserAverageRating(review.target.id);

    return successResponse(null, "Ocena je obrisana");
  } catch (error) {
    return handleApiError(error);
  }
}
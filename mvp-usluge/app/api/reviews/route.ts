import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createReviewSchema } from "@/lib/validations/reviews";
import { updateUserAverageRating } from "@/lib/utils";
import { UserRole, BookingStatus } from "@prisma/client";
import { sendNewReviewNotification } from '@/lib/email';
import { sanitizeText } from '@/lib/sanitize';

/**
 * GET /api/reviews
 * Vraća ocene
 * Query parametri:
 * - targetId: ID pružaoca (za prikaz ocena na profilu)
 * - serviceId: ID usluge (za prikaz ocena za uslugu)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const serviceId = searchParams.get("serviceId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (targetId) {
      where.targetId = targetId;
    }

    if (serviceId) {
      where.booking = {
        serviceId: serviceId,
      };
    }

    const reviews = await prisma.review.findMany({
      where,
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
          },
        },
        booking: {
          select: {
            id: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Izračunaj statistiku
    const stats = {
      total: reviews.length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
      distribution: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };

    return successResponse({ reviews, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Kreira novu ocenu
 *     description: Zaštićena ruta - samo CLIENT može ocenjivati COMPLETED usluge
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: Odličan servis!
 *     responses:
 *       201:
 *         description: Ocena uspešno kreirana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Rezervacija nije završena ili već postoji ocena
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Samo klijenti mogu ocenjivati
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Samo klijenti mogu ostavljati ocene
    if (user.role !== UserRole.CLIENT) {
      return errorResponse("Samo klijenti mogu ocenjivati usluge", 403);
    }

    // Validacija
    const body = await req.json();

    // 🛡 XSS ZAŠTITA - Sanitizuj komentar
    const sanitizedBody = {
      ...body,
      comment: body.comment ? sanitizeText(body.comment) : undefined,
    };

    const validatedData = createReviewSchema.parse(sanitizedBody);

    // Pronađi rezervaciju
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        service: {
          select: {
            providerId: true,
          },
        },
        review: true, // Proveri da li već postoji ocena
      },
    });

    if (!booking) {
      return errorResponse("Rezervacija nije pronađena", 404);
    }

    // Proveri da li je korisnik vlasnik rezervacije
    if (booking.clientId !== user.id) {
      return errorResponse("Možete oceniti samo svoje rezervacije", 403);
    }

    // Proveri da li je rezervacija završena
    if (booking.status !== BookingStatus.COMPLETED) {
      return errorResponse(
        "Možete oceniti samo završene usluge",
        400
      );
    }

    // Može se oceniti samo u roku od 7 dana od završetka usluge
    const completedAt = new Date(booking.updatedAt);
    const now = new Date();
    const daysSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCompletion > 7) {
      return errorResponse(
        "Usluga se može oceniti najkasnije 7 dana nakon završetka.",
        400
      );
    }

    // Proveri da li već postoji ocena
    if (booking.review) {
      return errorResponse(
        "Već ste ocenili ovu uslugu. Možete je izmeniti.",
        409
      );
    }

    // Kreiraj ocenu
    const review = await prisma.review.create({
      data: {
        authorId: user.id,
        targetId: booking.service.providerId,
        bookingId: validatedData.bookingId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
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
            email: true,
          },
        },
        booking: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Ažuriraj prosečnu ocenu pružaoca
    await updateUserAverageRating(booking.service.providerId);

    // 🆕 Pošalji notifikaciju pružaocu
    try {
      const providerName = review.target.companyName ||
        `${review.target.firstName} ${review.target.lastName}`;

      await sendNewReviewNotification(
        review.target.email as string, // Cast because select doesn't include email but we need it
        providerName,
        {
          clientName: `${review.author.firstName} ${review.author.lastName}`,
          serviceName: review.booking.service.name,
          rating: review.rating,
          comment: review.comment || undefined,
          reviewId: review.id,
        }
      );
    } catch (error) {
      console.error('Failed to send review notification:', error);
    }
    return successResponse(
      review,
      "Hvala vam na oceni!",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
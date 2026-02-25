import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Uzmi javne informacije o korisniku/pružaocu
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Javne informacije o korisniku
 *       404:
 *         description: Korisnik nije pronađen
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        averageRating: true,
        bio: true,
        city: true,
        latitude: true,
        longitude: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      return errorResponse("Korisnik nije pronađen", 404);
    }

    // Fetch total reviews for this user
    const reviewsCount = await prisma.review.count({
      where: { targetId: id },
    });

    return successResponse({
      ...user,
      totalReviews: reviewsCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

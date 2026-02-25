import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * @swagger
 * /api/reviews/{id}/report:
 *   post:
 *     summary: Prijavljuje neprikladnu ocenu
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
 *         description: Ocena prijavljeno za pregled
 *       401:
 *         description: Neautorizovan pristup
 *       404:
 *         description: Ocena nije pronađena
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    const review = await prisma.review.findUnique({
      where: { id: (await params).id },
    });

    if (!review) {
      return errorResponse("Ocena nije pronađena", 404);
    }

    // TODO: Implementirati sistem prijavljivanja
    // - Kreirati Report model
    // - Čuvati prijave u bazi
    // - Slati notifikaciju admin-u
    // - Automatski sakrivati sadržaj nakon 3+ prijave

    // Za sada samo vraćamo success
    return successResponse(
      null,
      "Hvala vam na prijavi. Naš tim će pregledati sadržaj."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * POST /api/reviews/[id]/report
 * Prijavljuje neprikladnu ocenu
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
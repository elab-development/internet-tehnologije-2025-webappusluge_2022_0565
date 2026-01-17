import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

/**
 * GET /api/auth/check-email?email=test@example.com
 * Provera da li email već postoji u sistemu
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return errorResponse("Email parametar je obavezan", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return successResponse({
      available: !existingUser,
      message: existingUser
        ? "Email je već registrovan"
        : "Email je dostupan",
    });
  } catch (error) {
    return errorResponse("Greška pri proveri email-a", 500);
  }
}
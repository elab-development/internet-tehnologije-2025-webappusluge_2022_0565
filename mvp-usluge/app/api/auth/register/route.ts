import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-utils";
import { UserRole } from "@prisma/client";

/**
 * POST /api/auth/register
 * Registracija novog korisnika
 * 
 * Body:
 * {
 *   email: string,
 *   password: string,
 *   firstName: string,
 *   lastName: string,
 *   phone?: string,
 *   role?: "CLIENT" | "FREELANCER" | "COMPANY",
 *   companyName?: string (obavezno za COMPANY),
 *   pib?: string (obavezno za COMPANY)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validacija sa Zod
    const validatedData = registerSchema.parse(body);

    // Dodatna validacija za COMPANY ulogu
    if (validatedData.role === UserRole.COMPANY) {
      if (!validatedData.companyName) {
        return errorResponse("Naziv preduzeća je obavezan za COMPANY ulogu", 400);
      }
      if (!validatedData.pib) {
        return errorResponse("PIB je obavezan za COMPANY ulogu", 400);
      }
    }

    // Proveri da li email već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse("Email adresa je već registrovana", 409);
    }

    // Hash lozinke
    const hashedPassword = await hash(validatedData.password, 10);

    // Kreiraj korisnika
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: validatedData.role,
        companyName: validatedData.companyName,
        pib: validatedData.pib,
        isVerified: false, // Email verifikacija će biti implementirana kasnije
        isActive: true,
      },
      // Ne vraćaj lozinku
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyName: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return successResponse(
      user,
      "Nalog je uspešno kreiran. Proverite email za verifikaciju.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
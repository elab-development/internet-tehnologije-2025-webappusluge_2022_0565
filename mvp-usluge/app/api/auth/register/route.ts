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
import { sendWelcomeEmail } from '@/lib/email';
import { applyRateLimit, authRateLimit } from '@/lib/rate-limit';
import { sanitizeText, validateEmail, containsSQLInjection } from '@/lib/sanitize';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registracija novog korisnika
 *     description: Kreira novi korisnički nalog sa validacijom podataka
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: marko@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: marko123
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 example: Marko
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 example: Marković
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[0-9]{9,15}$'
 *                 example: '+381601234567'
 *               role:
 *                 type: string
 *                 enum: [CLIENT, FREELANCER, COMPANY]
 *                 default: CLIENT
 *               companyName:
 *                 type: string
 *                 description: Obavezno za COMPANY ulogu
 *               pib:
 *                 type: string
 *                 pattern: '^[0-9]{9}$'
 *                 description: Obavezno za COMPANY ulogu
 *     responses:
 *       201:
 *         description: Nalog uspešno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       409:
 *         description: Email već postoji
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validaciona greška
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    // 🛡 RATE LIMITING (5 pokušaja u 15 minuta)
    const rateLimitResult = await applyRateLimit(req, authRateLimit);

    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Parse request body
    const body = await req.json();

    // 🛡 XSS ZAŠTITA - Sanitizuj input
    const sanitizedBody = {
      ...body,
      firstName: body.firstName ? sanitizeText(body.firstName) : undefined,
      lastName: body.lastName ? sanitizeText(body.lastName) : undefined,
      companyName: body.companyName ? sanitizeText(body.companyName) : undefined,
    };

    // 🛡 SQL INJECTION ZAŠTITA - Dodatna validacija
    if (body.email) {
      if (!validateEmail(body.email)) {
        return errorResponse('Nevalidna email adresa', 400);
      }

      if (containsSQLInjection(body.email)) {
        console.warn(`SQL Injection attempt detected: ${body.email}`);
        return errorResponse('Nevalidan input', 400);
      }
    }

    // Validacija sa Zod
    const validatedData = registerSchema.parse(sanitizedBody);

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

    // 🆕 Pošalji welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Ne blokiraj registraciju ako email ne uspe
    }

    return successResponse(
      user,
      "Nalog je uspešno kreiran. Proverite email za verifikaciju.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
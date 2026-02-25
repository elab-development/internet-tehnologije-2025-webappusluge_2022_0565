import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

/**
 * @swagger
 * /api/auth/check-email:
 *   get:
 *     summary: Proverava dostupnost email adrese
 *     description: Javna ruta - vraća da li je email dostupan za registraciju
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email adresa za proveru
 *     responses:
 *       200:
 *         description: Provera uspešna
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: Email parametar je obavezan
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
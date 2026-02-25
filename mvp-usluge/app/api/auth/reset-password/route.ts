import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { hash } from "bcryptjs";

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetuje lozinku sa validnim tokenom
 *     description: Javna ruta - resetuje lozinku korisnika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token iz forgot-password email-a
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: noveLozinka123
 *     responses:
 *       200:
 *         description: Lozinka uspešno promenjena
 *       400:
 *         description: Token nevalidan, istekao ili već iskorišćen
 *       404:
 *         description: Korisnik nije pronađen
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return errorResponse("Nedostaju podaci", 400);
        }

        if (newPassword.length < 6) {
            return errorResponse("Lozinka mora imati najmanje 6 karaktera", 400);
        }

        const decoded: any = verifyToken(token);

        if (!decoded || decoded.purpose !== 'reset_password') {
            return errorResponse("Token je nevalidan ili je istekao", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email: decoded.email }
        });

        if (!user) {
            return errorResponse("Korisnik nije pronađen", 404);
        }

        // Sigurnosna provera: da li je token iskorišten (hash lozinke iz tokena se ne poklapa više)
        if (decoded.hash !== user.password.substring(0, 10)) {
            return errorResponse("Token je već iskorišćen", 400);
        }

        // Hash-uj novu lozinku
        const hashedPassword = await hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return successResponse(null, "Lozinka je uspešno promenjena", 200);
    } catch (error) {
        console.error("Password reset error:", error);
        return errorResponse("Došlo je do greške prilikom resetovanja lozinke", 500);
    }
}

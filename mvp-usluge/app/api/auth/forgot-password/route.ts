import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { sendPasswordReset } from "@/lib/email";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Zahtev za resetovanje lozinke
 *     description: Javna ruta - šalje email sa linkom za resetovanje
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: marko@gmail.com
 *     responses:
 *       200:
 *         description: Email poslat (ili kažnjava da je poslat čak i ako korisnik ne postoji)
 *       400:
 *         description: Email je obavezan
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        console.log('🔐 Forgot password request for:', email);

        if (!email) {
            return errorResponse("Email adresa je obavezna", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Vraćamo success čak i ako korsinik ne postoji radi bezbednosti (da se ne otkrije ko ima nalog)
        if (!user) {
            console.log('ℹ️ User not found for email:', email);
            return successResponse(null, "Ukoliko postoji nalog sa ovom e-mail adresom, poslat je link za resetovanje lozinke.", 200);
        }

        console.log('✅ User found:', user.firstName, user.email);

        // Token sadrži i hesiranu lozinku - kada korisnik promeni lozinku, token se ne može ponovo iskoristiti
        const tokenPayload = {
            email: user.email,
            purpose: 'reset_password',
            hash: user.password.substring(0, 10) // Dodajemo deo hash-a lozinke kako bi token prestao da važi po resetovanju
        };

        const token = signToken(tokenPayload, '1h'); // Važi 1h
        console.log('🔑 Token generated, attempting to send email...');

        const emailResult = await sendPasswordReset(user.email, user.firstName, token);

        console.log('📨 Email send result:', {
            success: emailResult.success,
            hasError: !!emailResult.error,
            note: 'Email redirekcija: ' + user.email + ' → risticcaleksandra@gmail.com (Resend besplatni plan)',
        });

        return successResponse(null, "Ukoliko postoji nalog sa ovom e-mail adresom, poslat je link za resetovanje lozinke.", 200);
    } catch (error) {
        console.error("❌ Forgot password error:", error);
        return errorResponse("Došlo je do greške prilikom obrade zahteva", 500);
    }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { sendPasswordReset } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return errorResponse("Email adresa je obavezna", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Vraćamo success čak i ako korsinik ne postoji radi bezbednosti (da se ne otkrije ko ima nalog)
        if (!user) {
            return successResponse(null, "Ukoliko postoji nalog sa ovom e-mail adresom, poslat je link za resetovanje lozinke.", 200);
        }

        // Token sadrži i hesiranu lozinku - kada korisnik promeni lozinku, token se ne može ponovo iskoristiti
        const tokenPayload = {
            email: user.email,
            purpose: 'reset_password',
            hash: user.password.substring(0, 10) // Dodajemo deo hash-a lozinke kako bi token prestao da važi po resetovanju
        };

        const token = signToken(tokenPayload, '1h'); // Važi 1h
        await sendPasswordReset(user.email, user.firstName, token);

        return successResponse(null, "Ukoliko postoji nalog sa ovom e-mail adresom, poslat je link za resetovanje lozinke.", 200);
    } catch (error) {
        console.error("Forgot password error:", error);
        return errorResponse("Došlo je do greške prilikom obrade zahteva", 500);
    }
}

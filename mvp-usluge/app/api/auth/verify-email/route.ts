import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return errorResponse("Nedostaje token", 400);
        }

        const decoded = verifyToken(token);

        if (!decoded || decoded.purpose !== 'verify_email') {
            return errorResponse("Token je nevalidan ili je istekao", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email: decoded.email }
        });

        if (!user) {
            return errorResponse("Korisnik nije pronađen", 404);
        }

        if (user.isVerified) {
            return successResponse(null, "Email je već verifikovan", 200);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                emailVerified: new Date()
            }
        });

        return successResponse(null, "E-mail adresa uspešno verifikovana.", 200);
    } catch (error) {
        console.error("Email verification error:", error);
        return errorResponse("Došlo je do greške prilikom verifikacije", 500);
    }
}

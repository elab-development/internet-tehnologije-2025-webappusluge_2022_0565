import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const profileSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: z.string().max(20).optional(),
    bio: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    address: z.string().max(200).optional(),
    companyName: z.string().max(100).optional(),
    pib: z.string().length(9).optional(),
    profileImage: z.string().url().max(500).optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return errorResponse("Neautorizovan pristup", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                bio: true,
                city: true,
                address: true,
                companyName: true,
                pib: true,
                isActive: true,
                profileImage: true,
            }
        });

        if (!user) {
            return errorResponse("Korisnik nije pronađen", 404);
        }

        return successResponse({ user });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return errorResponse("Neautorizovan pristup", 401);
        }

        const body = await req.json();
        const validatedData = profileSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: validatedData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                bio: true,
                city: true,
                address: true,
                companyName: true,
                pib: true,
                profileImage: true,
            }
        });

        return successResponse({ user: updatedUser }, "Profil uspešno ažuriran", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return errorResponse("Neautorizovan pristup", 401);
        }

        // Deaktivacija (soft-delete) po postulatima zahteva F-1
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { isActive: false }
        });

        return successResponse(null, "Nalog uspešno deaktiviran", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

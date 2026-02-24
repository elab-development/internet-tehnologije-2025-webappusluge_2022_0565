import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
        return errorResponse('Forbidden', 403);
    }

    const { isActive } = await req.json();

    if (params.id === user.id) {
        return errorResponse('Ne možete deaktivirati sopstveni nalog', 400);
    }

    const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: { isActive },
    });

    return successResponse(updatedUser, `Nalog je ${isActive ? 'aktiviran' : 'deaktiviran'}`);
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
        return errorResponse('Forbidden', 403);
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true,
            _count: { select: { bookingsAsClient: true, bookingsAsProvider: true } }
        }
    });

    return successResponse({ users });
}

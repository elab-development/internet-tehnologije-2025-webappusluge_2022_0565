import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { validateUUID } from '@/lib/sanitize';

/**
 * DELETE /api/calendar/working-hours/[id]
 * Briše radno vreme
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (!validateUUID(params.id)) {
            return errorResponse('Nevalidan ID format', 400);
        }

        const workingHours = await prisma.workingHours.findUnique({
            where: { id: params.id },
        });

        if (!workingHours) {
            return errorResponse('Radno vreme nije pronađeno', 404);
        }

        // Proveri vlasništvo
        if (workingHours.userId !== user.id) {
            return errorResponse('Nemate dozvolu da obrišete ovo radno vreme', 403);
        }

        await prisma.workingHours.delete({
            where: { id: params.id },
        });

        return successResponse(null, 'Radno vreme obrisano');
    } catch (error) {
        return handleApiError(error);
    }
}

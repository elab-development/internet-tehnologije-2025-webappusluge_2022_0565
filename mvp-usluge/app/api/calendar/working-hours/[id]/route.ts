import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { validateUUID } from '@/lib/sanitize';

/**
 * @swagger
 * /api/calendar/working-hours/{id}:
 *   delete:
 *     summary: Briše radno vreme
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Radno vreme obrisano
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Radno vreme nije pronađeno
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (!validateUUID((await params).id)) {
            return errorResponse('Nevalidan ID format', 400);
        }

        const workingHours = await prisma.workingHours.findUnique({
            where: { id: (await params).id },
        });

        if (!workingHours) {
            return errorResponse('Radno vreme nije pronađeno', 404);
        }

        // Proveri vlasništvo
        if (workingHours.userId !== user.id) {
            return errorResponse('Nemate dozvolu da obrišete ovo radno vreme', 403);
        }

        await prisma.workingHours.delete({
            where: { id: (await params).id },
        });

        return successResponse(null, 'Radno vreme obrisano');
    } catch (error) {
        return handleApiError(error);
    }
}

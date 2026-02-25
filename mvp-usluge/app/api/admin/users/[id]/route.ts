import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Aktivira/deaktivira korisnika
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Nalog aktiviran/deaktiviran
 *       400:
 *         description: Ne možete deaktivirati sopstveni nalog
 *       403:
 *         description: Samo administratori mogu pristupiti
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
        return errorResponse('Forbidden', 403);
    }

    const { isActive } = await req.json();
    const resolvedParams = await params;

    if (resolvedParams.id === user.id) {
        return errorResponse('Ne možete deaktivirati sopstveni nalog', 400);
    }

    const updatedUser = await prisma.user.update({
        where: { id: resolvedParams.id },
        data: { isActive },
    });

    return successResponse(updatedUser, `Nalog je ${isActive ? 'aktiviran' : 'deaktiviran'}`);
}

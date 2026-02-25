import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { validateUUID, sanitizeText } from '@/lib/sanitize';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateWorkerSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^\+?[0-9]{9,15}$/).optional().or(z.literal('')),
    position: z.string().min(2).max(100).optional(),
    specializations: z.array(z.string()).optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Vraća detalje jednog radnika
 *     tags: [Workers]
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
 *         description: Detalji radnika
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate pristup
 *       404:
 *         description: Radnik nije pronađen
 *   patch:
 *     summary: Ažurira radnika
 *     tags: [Workers]
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
 *         description: Radnik ažuriran
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Radnik nije pronađen
 *   delete:
 *     summary: Briše radnika
 *     tags: [Workers]
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
 *         description: Radnik deaktiviran
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Radnik nije pronađen
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (!validateUUID(id)) {
            return errorResponse('Nevalidan ID format', 400);
        }

        const worker = await prisma.worker.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
                services: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
                bookings: {
                    where: {
                        status: {
                            in: ['PENDING', 'CONFIRMED'],
                        },
                    },
                    select: {
                        id: true,
                        scheduledDate: true,
                        scheduledTime: true,
                        status: true,
                        service: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        scheduledDate: 'asc',
                    },
                },
            },
        });

        if (!worker) {
            return errorResponse('Radnik nije pronađen', 404);
        }

        // Proveri vlasništvo
        if (worker.companyId !== user.id && user.role !== UserRole.ADMIN) {
            return errorResponse('Nemate pristup ovom radniku', 403);
        }

        return successResponse(worker);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/workers/[id]
 * Ažurira radnika
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (user.role !== UserRole.COMPANY) {
            return errorResponse('Samo preduzeća mogu menjati radnike', 403);
        }

        if (!validateUUID(id)) {
            return errorResponse('Nevalidan ID format', 400);
        }

        const existingWorker = await prisma.worker.findUnique({
            where: { id },
        });

        if (!existingWorker) {
            return errorResponse('Radnik nije pronađen', 404);
        }

        // Proveri vlasništvo
        if (existingWorker.companyId !== user.id) {
            return errorResponse('Nemate dozvolu da izmenite ovog radnika', 403);
        }

        const body = await req.json();

        // Sanitizacija
        const sanitizedBody = {
            ...body,
            firstName: body.firstName ? sanitizeText(body.firstName) : undefined,
            lastName: body.lastName ? sanitizeText(body.lastName) : undefined,
            position: body.position ? sanitizeText(body.position) : undefined,
        };

        const validatedData = updateWorkerSchema.parse(sanitizedBody);

        const emailToSave = validatedData.email === '' ? null : validatedData.email;
        const phoneToSave = validatedData.phone === '' ? null : validatedData.phone;

        const dataToUpdate: any = { ...validatedData };
        if (validatedData.email !== undefined) dataToUpdate.email = emailToSave;
        if (validatedData.phone !== undefined) dataToUpdate.phone = phoneToSave;

        const updatedWorker = await prisma.worker.update({
            where: { id },
            data: dataToUpdate,
            include: {
                services: true,
            },
        });

        return successResponse(updatedWorker, 'Radnik uspešno ažuriran');
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/workers/[id]
 * Briše radnika (soft delete - postavlja isActive na false)
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (user.role !== UserRole.COMPANY) {
            return errorResponse('Samo preduzeća mogu brisati radnike', 403);
        }

        if (!validateUUID(id)) {
            return errorResponse('Nevalidan ID format', 400);
        }

        const worker = await prisma.worker.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['PENDING', 'CONFIRMED'],
                        },
                    },
                },
            },
        });

        if (!worker) {
            return errorResponse('Radnik nije pronađen', 404);
        }

        // Proveri vlasništvo
        if (worker.companyId !== user.id) {
            return errorResponse('Nemate dozvolu da obrišete ovog radnika', 403);
        }

        // Proveri da li ima aktivnih rezervacija
        if (worker.bookings.length > 0) {
            return errorResponse(
                'Ne možete obrisati radnika sa aktivnim rezervacijama. Prvo deaktivirajte radnika.',
                400
            );
        }

        // Hard delete - potpuno uklanja radnika iz sistema
        await prisma.worker.delete({
            where: { id },
        });

        return successResponse(null, 'Radnik uspešno obrisan');
    } catch (error) {
        return handleApiError(error);
    }
}

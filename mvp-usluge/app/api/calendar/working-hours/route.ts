import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

/**
 * Validaciona šema za radno vreme
 */
const workingHoursSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    isActive: z.boolean().optional(),
});

/**
 * @swagger
 * /api/calendar/working-hours:
 *   get:
 *     summary: Vraća radno vreme trenutnog pružaoca
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista radnih vremena
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        // Samo pružaoci mogu imati radno vreme
        if (user.role !== UserRole.FREELANCER && user.role !== UserRole.COMPANY) {
            return errorResponse('Samo pružaoci mogu definisati radno vreme', 403);
        }

        const workingHours = await prisma.workingHours.findMany({
            where: { userId: user.id },
            orderBy: { dayOfWeek: 'asc' },
        });

        // Grupiši po danima
        const groupedByDay = Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            dayName: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'][i],
            slots: workingHours.filter((wh: any) => wh.dayOfWeek === i),
        }));

        return successResponse({ workingHours: groupedByDay });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * @swagger
 * /api/calendar/working-hours:
 *   post:
 *     summary: Kreira novo radno vreme
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (user.role !== UserRole.FREELANCER && user.role !== UserRole.COMPANY) {
            return errorResponse('Samo pružaoci mogu definisati radno vreme', 403);
        }

        const body = await req.json();
        const validatedData = workingHoursSchema.parse(body);

        // Proveri da li se vreme ne preklapa
        const existingSlots = await prisma.workingHours.findMany({
            where: {
                userId: user.id,
                dayOfWeek: validatedData.dayOfWeek,
                isActive: true,
            },
        });

        // Jednostavna provera preklapanja
        for (const slot of existingSlots) {
            if (
                (validatedData.startTime >= slot.startTime && validatedData.startTime < slot.endTime) ||
                (validatedData.endTime > slot.startTime && validatedData.endTime <= slot.endTime) ||
                (validatedData.startTime <= slot.startTime && validatedData.endTime >= slot.endTime)
            ) {
                return errorResponse('Radno vreme se preklapa sa postojećim', 400);
            }
        }

        const workingHours = await prisma.workingHours.create({
            data: {
                userId: user.id,
                ...validatedData,
            },
        });

        return successResponse(workingHours, 'Radno vreme uspešno dodato', 201);
    } catch (error) {
        return handleApiError(error);
    }
}

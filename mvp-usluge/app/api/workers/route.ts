import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { sanitizeText } from '@/lib/sanitize';

/**
 * Validaciona šema za radnika
 */
const workerSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^\+?[0-9]{9,15}$/).optional().or(z.literal('')),
    position: z.string().min(2).max(100),
    specializations: z.array(z.string()).optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Vraća listu radnika preduzeća
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista radnika
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        // Samo COMPANY može imati radnike
        if (user.role !== UserRole.COMPANY) {
            return errorResponse('Samo preduzeća mogu upravljati radnicima', 403);
        }

        const { searchParams } = new URL(req.url);
        const isActiveParam = searchParams.get('isActive');

        const where: any = {
            companyId: user.id,
        };

        if (isActiveParam !== null) {
            where.isActive = isActiveParam === 'true';
        }

        const workers = await prisma.worker.findMany({
            where,
            include: {
                services: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return successResponse({ workers });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * @swagger
 * /api/workers:
 *   post:
 *     summary: Kreira novog radnika u preduzeću
 *     description: Zaštićena ruta - samo COMPANY korisnici mogu dodavati radnike. Maksimalno 100 radnika po preduzeću.
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - position
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Milan
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Milanović
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *                 example: milan@company.com
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[0-9]{9,15}$'
 *                 nullable: true
 *                 example: "+381601234567"
 *               position:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Senior Frizer
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Muško šišanje
 *                   - Farbanje
 *                   - Tretmani
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://example.com/worker.jpg"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Radnik uspešno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Nevaljani podaci ili dostignut maksimalan broj radnika
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Samo preduzeća mogu dodavati radnike
 *       409:
 *         description: Radnik sa ovim email-om već postoji
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        if (user.role !== UserRole.COMPANY) {
            return errorResponse('Samo preduzeća mogu dodavati radnike', 403);
        }

        // Proveri limit (max 100 radnika)
        const workerCount = await prisma.worker.count({
            where: { companyId: user.id },
        });

        if (workerCount >= 100) {
            return errorResponse('Dostignut maksimalan broj radnika (100)', 400);
        }

        const body = await req.json();

        // Sanitizacija
        const sanitizedBody = {
            ...body,
            firstName: sanitizeText(body.firstName),
            lastName: sanitizeText(body.lastName),
            position: sanitizeText(body.position),
        };

        const validatedData = workerSchema.parse(sanitizedBody);

        // Proveri da li email već postoji (ako je prosleđen)
        if (validatedData.email) {
            const existingWorker = await prisma.worker.findFirst({
                where: {
                    companyId: user.id,
                    email: validatedData.email,
                },
            });

            if (existingWorker) {
                return errorResponse('Radnik sa ovim email-om već postoji', 409);
            }
        }

        // Convert empty strings to null for unique/optional fields if Prisma requires
        const emailToSave = validatedData.email || null;
        const phoneToSave = validatedData.phone || null;

        const worker = await prisma.worker.create({
            data: {
                ...validatedData,
                email: emailToSave,
                phone: phoneToSave,
                companyId: user.id,
            },
            include: {
                services: true,
            },
        });

        return successResponse(worker, 'Radnik uspešno dodat', 201);
    } catch (error) {
        return handleApiError(error);
    }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { parse, format, addMinutes, isWithinInterval } from 'date-fns';

/**
 * @swagger
 * /api/calendar/availability:
 *   get:
 *     summary: Vraća dostupne termine za pružaoca
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 60
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const providerId = searchParams.get('providerId');
        const dateStr = searchParams.get('date');
        const duration = parseInt(searchParams.get('duration') || '60');

        if (!providerId || !dateStr) {
            return errorResponse('providerId i date su obavezni', 400);
        }

        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();

        // Pronađi radno vreme za taj dan
        const workingHours = await prisma.workingHours.findMany({
            where: {
                userId: providerId,
                dayOfWeek,
                isActive: true,
            },
        });

        if (workingHours.length === 0) {
            return successResponse({
                date: dateStr,
                availableSlots: [],
                message: 'Pružalac ne radi tog dana',
            });
        }

        // Pronađi sve rezervacije za taj dan
        const bookings = await prisma.booking.findMany({
            where: {
                providerId,
                scheduledDate: date,
                status: {
                    in: ['PENDING', 'CONFIRMED'],
                },
            },
            select: {
                scheduledTime: true,
                service: {
                    select: {
                        duration: true,
                    },
                },
            },
        });

        // Generiši sve moguće slotove
        const availableSlots: string[] = [];

        for (const wh of workingHours) {
            let currentTime = parse(wh.startTime, 'HH:mm', new Date());
            const endTime = parse(wh.endTime, 'HH:mm', new Date());

            while (currentTime < endTime) {
                const slotTime = format(currentTime, 'HH:mm');
                const slotEndTime = addMinutes(currentTime, duration);

                // Proveri da li se preklapa sa postojećim rezervacijama
                const isBooked = bookings.some((booking) => {
                    const bookingStart = parse(booking.scheduledTime, 'HH:mm', new Date());
                    const bookingEnd = addMinutes(bookingStart, booking.service.duration);

                    return (
                        isWithinInterval(currentTime, { start: bookingStart, end: bookingEnd }) ||
                        isWithinInterval(slotEndTime, { start: bookingStart, end: bookingEnd }) ||
                        (currentTime <= bookingStart && slotEndTime >= bookingEnd)
                    );
                });

                if (!isBooked && slotEndTime <= endTime) {
                    availableSlots.push(slotTime);
                }

                currentTime = addMinutes(currentTime, 30); // Slotovi na svakih 30 minuta
            }
        }

        return successResponse({
            date: dateStr,
            dayOfWeek,
            dayName: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'][dayOfWeek],
            availableSlots,
            workingHours: workingHours.map((wh: any) => ({
                startTime: wh.startTime,
                endTime: wh.endTime,
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}

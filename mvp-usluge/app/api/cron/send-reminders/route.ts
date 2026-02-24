import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendBookingReminder } from '@/lib/email';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import { sr } from 'date-fns/locale';

/**
 * @swagger
 * /api/cron/send-reminders:
 *   post:
 *     summary: Šalje podsetnik emailove za rezervacije sutra
 *     description: Cron job koji se pokreće svaki dan i šalje podsetnik 24h pre termina
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Podsetnike poslati uspešno
 *       401:
 *         description: Unauthorized (zahteva CRON_SECRET)
 */
export async function POST(req: NextRequest) {
    try {
        // 🔒 Zaštita: proveri CRON_SECRET
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Pronađi sve CONFIRMED rezervacije za sutra
        const tomorrow = addDays(new Date(), 1);
        const tomorrowStart = startOfDay(tomorrow);
        const tomorrowEnd = endOfDay(tomorrow);

        const bookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                scheduledDate: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd,
                },
            },
            include: {
                client: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                provider: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        phone: true,
                        address: true,
                    },
                },
                service: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        console.log(`Found ${bookings.length} bookings for tomorrow`);

        // Pošalji podsetnik za svaku rezervaciju
        const results = await Promise.allSettled(
            bookings.map(async (booking) => {
                const providerName = booking.provider.companyName ||
                    `${booking.provider.firstName} ${booking.provider.lastName}`;

                return sendBookingReminder(
                    booking.client.email,
                    booking.client.firstName,
                    {
                        providerName,
                        serviceName: booking.service.name,
                        scheduledDate: format(new Date(booking.scheduledDate), 'dd.MM.yyyy', { locale: sr }),
                        scheduledTime: booking.scheduledTime,
                        providerPhone: (booking.provider as any).phone || undefined,
                        providerAddress: (booking.provider as any).address || undefined,
                    }
                );
            })
        );

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        console.log(`Reminders sent: ${successful} successful, ${failed} failed`);

        return NextResponse.json({
            success: true,
            data: {
                total: bookings.length,
                successful,
                failed,
            },
            message: `Sent ${successful} reminders successfully`,
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

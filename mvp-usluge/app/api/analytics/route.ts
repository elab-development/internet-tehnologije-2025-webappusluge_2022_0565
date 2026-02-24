import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { sr } from 'date-fns/locale';

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Vraća analitiku za trenutnog korisnika
 *     description: Statistika rezervacija, prihoda i ocena (za pružaoce i admin-a)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analitika uspešno vraćena
 *       401:
 *         description: Neautorizovan pristup
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Neautorizovan pristup', 401);
        }

        // Samo pružaoci (FREELANCER, COMPANY) i ADMIN mogu pristupiti analitici
        if (user.role !== UserRole.FREELANCER && user.role !== UserRole.COMPANY && user.role !== UserRole.ADMIN) {
            return errorResponse('Nemate pristup analitici', 403);
        }

        // Datum opseg (poslednih 6 meseci)
        const sixMonthsAgo = subMonths(new Date(), 6);

        // ============================================
        // 1. REZERVACIJE PO MESECIMA
        // ============================================
        const bookingsByMonth = await prisma.booking.groupBy({
            by: ['scheduledDate'],
            where: user.role === UserRole.ADMIN
                ? { scheduledDate: { gte: sixMonthsAgo } }
                : {
                    providerId: user.id,
                    scheduledDate: { gte: sixMonthsAgo },
                },
            _count: {
                id: true,
            },
        });

        // Grupiši po mesecima
        const monthlyBookings = new Map<string, number>();
        bookingsByMonth.forEach((booking) => {
            const month = format(new Date(booking.scheduledDate), 'MMM yyyy', { locale: sr });
            monthlyBookings.set(month, (monthlyBookings.get(month) || 0) + booking._count.id);
        });

        const bookingsChartData = Array.from(monthlyBookings.entries()).map(([month, count]) => ({
            month,
            count,
        }));

        // ============================================
        // 2. DISTRIBUCIJA OCENA
        // ============================================
        const ratingDistribution = await prisma.review.groupBy({
            by: ['rating'],
            where: user.role === UserRole.ADMIN
                ? {}
                : { targetId: user.id },
            _count: {
                id: true,
            },
            orderBy: {
                rating: 'asc',
            },
        });

        const ratingsChartData = [1, 2, 3, 4, 5].map((rating) => {
            const found = ratingDistribution.find((r) => r.rating === rating);
            return {
                rating: `${rating}★`,
                count: found?._count.id || 0,
            };
        });

        // ============================================
        // 3. PRIHOD PO MESECIMA (simulacija - u realnom sistemu bi bio payment tracking)
        // ============================================
        const completedBookings = await prisma.booking.findMany({
            where: user.role === UserRole.ADMIN
                ? {
                    status: 'COMPLETED',
                    scheduledDate: { gte: sixMonthsAgo },
                }
                : {
                    providerId: user.id,
                    status: 'COMPLETED',
                    scheduledDate: { gte: sixMonthsAgo },
                },
            include: {
                service: {
                    select: {
                        price: true,
                    },
                },
            },
        });

        const monthlyRevenue = new Map<string, number>();
        completedBookings.forEach((booking) => {
            const month = format(new Date(booking.scheduledDate), 'MMM yyyy', { locale: sr });
            const revenue = Number(booking.service.price);
            monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + revenue);
        });

        const revenueChartData = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
            month,
            revenue,
        }));

        // ============================================
        // 4. USLUGE PO KATEGORIJAMA (samo za admin)
        // ============================================
        let servicesByCategoryData: Array<{ category: string; count: number }> = [];
        if (user.role === UserRole.ADMIN) {
            const servicesByCategory = await prisma.service.groupBy({
                by: ['categoryId'],
                where: { isActive: true },
                _count: {
                    id: true,
                },
            });

            const categories = await prisma.category.findMany({
                where: {
                    id: {
                        in: servicesByCategory.map((s) => s.categoryId),
                    },
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            servicesByCategoryData = servicesByCategory.map((item) => {
                const category = categories.find((c) => c.id === item.categoryId);
                return {
                    category: category?.name || 'Nepoznato',
                    count: item._count.id,
                };
            });
        }

        // ============================================
        // 5. KLJUČNE METRIKE
        // ============================================
        const [totalBookings, totalRevenue, averageRating, totalServices] = await Promise.all([
            prisma.booking.count({
                where: user.role === UserRole.ADMIN ? {} : { providerId: user.id },
            }),
            prisma.booking.count({
                where: user.role === UserRole.ADMIN
                    ? { status: 'COMPLETED' }
                    : { providerId: user.id, status: 'COMPLETED' },
            }),
            prisma.review.aggregate({
                where: user.role === UserRole.ADMIN ? {} : { targetId: user.id },
                _avg: {
                    rating: true,
                },
            }),
            prisma.service.count({
                where: user.role === UserRole.ADMIN
                    ? { isActive: true }
                    : { providerId: user.id, isActive: true },
            }),
        ]);

        // Izračunaj ukupan prihod iz completed bookings
        const calculatedRevenue = completedBookings.reduce(
            (sum, booking) => sum + Number(booking.service.price),
            0
        );

        return successResponse({
            metrics: {
                totalBookings,
                totalRevenue: calculatedRevenue,
                averageRating: averageRating._avg.rating
                    ? Number(averageRating._avg.rating.toFixed(2))
                    : 0,
                totalServices,
            },
            charts: {
                bookingsByMonth: bookingsChartData,
                ratingDistribution: ratingsChartData,
                revenueByMonth: revenueChartData,
                servicesByCategory: servicesByCategoryData,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

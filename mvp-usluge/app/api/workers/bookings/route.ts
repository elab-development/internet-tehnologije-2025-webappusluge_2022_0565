import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';

/**
 * @swagger
 * /api/workers/bookings:
 *   get:
 *     summary: Vraća sve zakazane termine za radnike preduzeća
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista zakazanih termina za sve radnike
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Samo preduzeća mogu pristupiti
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse('Neautorizovan pristup', 401);
    }

    // Samo COMPANY može videti sve termine svojih radnika
    if (user.role !== UserRole.COMPANY) {
      return errorResponse('Samo preduzeća mogu pristupiti kolektivnom kalendaru', 403);
    }

    // Pronađi sve radnike preduzeća
    const workers = await prisma.worker.findMany({
      where: { companyId: user.id },
      select: { id: true, firstName: true, lastName: true },
    });

    const workerIds = workers.map(w => w.id);

    // Pronađi sve termine za te radnike
    const bookings = await prisma.booking.findMany({
      where: {
        workerId: {
          in: workerIds,
        },
      },
      include: {
        worker: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    // Formatiraj rezultate
    const formattedBookings = bookings
      .filter(booking => booking.worker)
      .map(booking => ({
        id: booking.id,
        workerName: `${booking.worker!.firstName} ${booking.worker!.lastName}`,
        serviceName: booking.service.name,
        scheduledDate: booking.scheduledDate.toISOString().split('T')[0],
        scheduledTime: booking.scheduledTime,
        status: booking.status,
        clientName: `${booking.client.firstName} ${booking.client.lastName}`,
      }));

    return successResponse({ bookings: formattedBookings });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateBookingStatusSchema } from "@/lib/validations/booking";
import { UserRole, BookingStatus } from "@prisma/client";
import { validateUUID } from '@/lib/sanitize';
import { sendBookingConfirmation, sendBookingCancellation } from '@/lib/email';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Vraća detalje jedne rezervacije
 *     tags: [Bookings]
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
 *         description: Detalji rezervacije
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate pristup ovoj rezervaciji
 *       404:
 *         description: Rezervacija nije pronađena
 *   patch:
 *     summary: Menja status rezervacije
 *     tags: [Bookings]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED]
 *               providerNotes:
 *                 type: string
 *               workerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Status promenjen
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Rezervacija nije pronađena
 *   delete:
 *     summary: Briše rezervaciju
 *     tags: [Bookings]
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
 *         description: Rezervacija obrisana
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Rezervacija nije pronađena
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID(id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            locationType: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
          },
        },
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            phone: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            response: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return errorResponse("Rezervacija nije pronađena", 404);
    }

    // 🛡 IDOR ZAŠTITA - Proveri pristup
    if (
      booking.clientId !== user.id &&
      booking.providerId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      console.warn(`IDOR attempt: User ${user.id} tried to access booking ${id}`);
      return errorResponse("Nemate pristup ovoj rezervaciji", 403);
    }

    return successResponse(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/bookings/[id]
 * Menja status rezervacije
 * - Pružalac: može potvrditi/odbiti/završiti
 * - Klijent: može otkazati
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID(id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    // Pronađi rezervaciju
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!existingBooking) {
      return errorResponse("Rezervacija nije pronađena", 404);
    }

    // Validacija
    const body = await req.json();
    const validatedData = updateBookingStatusSchema.parse(body);

    // Business logika zavisno od uloge i željenog statusa
    const isProvider = existingBooking.providerId === user.id;
    const isClient = existingBooking.clientId === user.id;

    if (!isProvider && !isClient && user.role !== UserRole.ADMIN) {
      console.warn(`IDOR attempt: User ${user.id} tried to modify booking ${id}`);
      return errorResponse("Nemate pristup ovoj rezervaciji", 403);
    }

    // Provera dozvoljenih akcija
    if (validatedData.status === BookingStatus.CONFIRMED && !isProvider) {
      return errorResponse("Samo pružalac može potvrditi rezervaciju", 403);
    }

    if (validatedData.status === BookingStatus.REJECTED && !isProvider) {
      return errorResponse("Samo pružalac može odbiti rezervaciju", 403);
    }

    if (validatedData.status === BookingStatus.COMPLETED && !isProvider) {
      return errorResponse("Samo pružalac može označiti rezervaciju kao završenu", 403);
    }

    if (validatedData.status === BookingStatus.CANCELLED) {
      // Klijent može otkazati samo 24h pre termina
      if (isClient) {
        const scheduledDateTime = new Date(existingBooking.scheduledDate);
        const [hours, minutes] = existingBooking.scheduledTime.split(":");
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

        const now = new Date();
        const hoursUntilBooking =
          (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilBooking < 24) {
          // Strike sistem
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { strikes: { increment: 1 } },
            select: { strikes: true }
          });

          if (updatedUser.strikes >= 3) {
            const banDate = new Date();
            banDate.setDate(banDate.getDate() + 7);

            await prisma.user.update({
              where: { id: user.id },
              data: {
                bannedUntil: banDate,
                strikes: 0 // Resetuj strike-ove nakom ban-a
              }
            });
            console.log(`Korisnik ${user.id} suspendovan na 7 dana zbog 3 kasna otkazivanja.`);
          }
        }
      }
    }

    // Proveri da li je status već takav
    if (existingBooking.status === validatedData.status) {
      return errorResponse("Rezervacija već ima ovaj status", 400);
    }

    // Proveri da li se može promeniti status
    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED],
      CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      COMPLETED: [], // Ne može se menjati
      CANCELLED: [], // Ne može se menjati
      REJECTED: [], // Ne može se menjati
    };

    if (!allowedTransitions[existingBooking.status].includes(validatedData.status)) {
      return errorResponse(
        `Ne možete promeniti status iz ${existingBooking.status} u ${validatedData.status}`,
        400
      );
    }

    // Ažuriraj rezervaciju
    const dataToUpdate: any = {
      status: validatedData.status,
      providerNotes: validatedData.providerNotes,
    };

    if (validatedData.workerId !== undefined) {
      dataToUpdate.workerId = validatedData.workerId;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    // 🆕 Pošalji email notifikacije
    try {
      if (validatedData.status === BookingStatus.CONFIRMED) {
        // Potvrda klijentu
        const providerName = updatedBooking.provider.companyName ||
          `${updatedBooking.provider.firstName} ${updatedBooking.provider.lastName}`;

        await sendBookingConfirmation(
          updatedBooking.client.email,
          updatedBooking.client.firstName,
          {
            providerName,
            serviceName: updatedBooking.service.name,
            scheduledDate: format(new Date(updatedBooking.scheduledDate), 'dd.MM.yyyy', { locale: sr }),
            scheduledTime: updatedBooking.scheduledTime,
            providerPhone: (updatedBooking.provider as any).phone || undefined,
            providerAddress: (updatedBooking.provider as any).address || undefined,
          }
        );
      } else if (validatedData.status === BookingStatus.CANCELLED) {
        // Notifikacija o otkazivanju
        const cancelledBy = isClient ? 'client' : 'provider';
        const recipientEmail = isClient ? updatedBooking.provider.email : updatedBooking.client.email;
        const recipientName = isClient
          ? (updatedBooking.provider.companyName || `${updatedBooking.provider.firstName} ${updatedBooking.provider.lastName}`)
          : updatedBooking.client.firstName;

        await sendBookingCancellation(
          recipientEmail,
          recipientName,
          {
            serviceName: updatedBooking.service.name,
            scheduledDate: format(new Date(updatedBooking.scheduledDate), 'dd.MM.yyyy', { locale: sr }),
            scheduledTime: updatedBooking.scheduledTime,
            cancelledBy,
            reason: validatedData.providerNotes || undefined,
          }
        );
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
    const messages: Record<BookingStatus, string> = {
      CONFIRMED: "Rezervacija je potvrđena",
      REJECTED: "Rezervacija je odbijena",
      COMPLETED: "Rezervacija je označena kao završena",
      CANCELLED: "Rezervacija je otkazana",
      PENDING: "",
    };

    return successResponse(
      updatedBooking,
      messages[validatedData.status]
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/bookings/[id]
 * Briše rezervaciju (samo ako je PENDING ili CANCELLED)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID(id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return errorResponse("Rezervacija nije pronađena", 404);
    }

    // Samo klijent ili admin mogu obrisati
    if (booking.clientId !== user.id && user.role !== UserRole.ADMIN) {
      return errorResponse("Nemate dozvolu da obrišete ovu rezervaciju", 403);
    }

    // Može se obrisati samo ako je CANCELLED ili REJECTED
    if (booking.status !== "CANCELLED" && booking.status !== "REJECTED") {
      return errorResponse(
        "Možete obrisati samo otkazane ili odbijene rezervacije",
        400
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return successResponse(null, "Rezervacija je obrisana");
  } catch (error) {
    return handleApiError(error);
  }
}
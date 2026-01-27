import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateBookingStatusSchema } from "@/lib/validations/booking";
import { UserRole, BookingStatus } from "@prisma/client";

/**
 * GET /api/bookings/[id]
 * Vraća detalje jedne rezervacije
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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

    // Proveri pristup (samo klijent ili pružalac mogu videti)
    if (
      booking.clientId !== user.id &&
      booking.providerId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Pronađi rezervaciju
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
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
          return errorResponse(
            "Rezervaciju možete otkazati najmanje 24h pre zakazanog termina",
            400
          );
        }

        // Evidentiraj otkazivanje (za statistiku)
        // TODO: Implementirati sistem upozorenja (3 otkazivanja = suspenzija)
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
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        providerNotes: validatedData.providerNotes,
      },
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
          },
        },
      },
    });

    // TODO: Poslati email notifikaciju

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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return errorResponse("Rezervacija nije pronađena", 404);
    }

    // Samo klijent ili admin mogu obrisati
    if (booking.clientId !== user.id && user.role !== UserRole.ADMIN) {
      return errorResponse("Nemate dozvolu da obrišete ovu rezervaciju", 403);
    }

    // Može se obrisati samo ako je CANCELLED ili REJECTED
    if (![BookingStatus.CANCELLED, BookingStatus.REJECTED].includes(booking.status)) {
      return errorResponse(
        "Možete obrisati samo otkazane ili odbijene rezervacije",
        400
      );
    }

    await prisma.booking.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Rezervacija je obrisana");
  } catch (error) {
    return handleApiError(error);
  }
}
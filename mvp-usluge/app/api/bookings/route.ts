import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createBookingSchema } from "@/lib/validations/booking";
import { UserRole, BookingStatus } from "@prisma/client";

/**
 * GET /api/bookings
 * Vraća rezervacije trenutnog korisnika
 * - Klijent: rezervacije koje je napravio
 * - Pružalac: rezervacije za njegove usluge
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Where uslovi zavisno od uloge
    const where: any =
      user.role === UserRole.CLIENT
        ? { clientId: user.id }
        : { providerId: user.id };

    // Filter po statusu (opciono)
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
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
          },
        },
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    return successResponse({ bookings });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/bookings
 * Kreira novu rezervaciju
 * Dozvoljeno samo za CLIENT ulogu
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Samo klijenti mogu kreirati rezervacije
    if (user.role !== UserRole.CLIENT) {
      return errorResponse(
        "Samo klijenti mogu zakazivati termine",
        403
      );
    }

    // Validacija
    const body = await req.json();
    const validatedData = createBookingSchema.parse(body);

    // Proveri da li usluga postoji
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        provider: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!service) {
      return errorResponse("Usluga nije pronađena", 404);
    }

    if (!service.isActive) {
      return errorResponse("Usluga nije dostupna", 400);
    }

    // Proveri da li korisnik pokušava da zakaže svoju uslugu
    if (service.providerId === user.id) {
      return errorResponse(
        "Ne možete zakazati sopstvenu uslugu",
        400
      );
    }

    // Proveri maksimalan broj aktivnih rezervacija (10)
    const activeBookingsCount = await prisma.booking.count({
      where: {
        clientId: user.id,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (activeBookingsCount >= 10) {
      return errorResponse(
        "Dostignut maksimalan broj aktivnih rezervacija (10)",
        400
      );
    }

    // Proveri da li je termin već zauzet (za istog pružaoca)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        providerId: service.providerId,
        scheduledDate: new Date(validatedData.scheduledDate),
        scheduledTime: validatedData.scheduledTime,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (conflictingBooking) {
      return errorResponse(
        "Ovaj termin je već zauzet. Molimo izaberite drugi.",
        409
      );
    }

    // Ako je workerId prosleđen, proveri da li radnik postoji i pripada pružaocu
    if (validatedData.workerId) {
      const worker = await prisma.worker.findFirst({
        where: {
          id: validatedData.workerId,
          companyId: service.providerId,
          isActive: true,
        },
      });

      if (!worker) {
        return errorResponse(
          "Radnik nije pronađen ili nije dostupan",
          404
        );
      }
    }

    // Kreiraj rezervaciju
    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        providerId: service.providerId,
        serviceId: validatedData.serviceId,
        scheduledDate: new Date(validatedData.scheduledDate),
        scheduledTime: validatedData.scheduledTime,
        clientNotes: validatedData.clientNotes,
        workerId: validatedData.workerId,
        status: BookingStatus.PENDING,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
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
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Poslati email notifikaciju pružaocu

    return successResponse(
      booking,
      "Rezervacija je uspešno kreirana. Čeka se potvrda pružaoca.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
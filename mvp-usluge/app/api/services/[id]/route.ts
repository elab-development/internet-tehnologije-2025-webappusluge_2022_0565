import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateServiceSchema } from "@/lib/validations/service";
import { UserRole } from "@prisma/client";

/**
 * GET /api/services/[id]
 * Javna ruta - vraća detalje jedne usluge
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            role: true,
            averageRating: true,
            totalReviews: true,
            city: true,
            address: true,
            phone: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        workers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            specializations: true,
          },
        },
      },
    });

    if (!service) {
      return errorResponse("Usluga nije pronađena", 404);
    }

    return successResponse(service);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/services/[id]
 * Zaštićena ruta - izmena usluge
 * Dozvoljeno samo vlasniku usluge
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Pronađi uslugu
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService) {
      return errorResponse("Usluga nije pronađena", 404);
    }

    // Proveri vlasništvo
    if (existingService.providerId !== user.id && user.role !== UserRole.ADMIN) {
      return errorResponse(
        "Nemate dozvolu da izmenite ovu uslugu",
        403
      );
    }

    // Validacija
    const body = await req.json();
    const validatedData = updateServiceSchema.parse(body);

    // Ako se menja kategorija, proveri da li postoji
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return errorResponse("Kategorija ne postoji", 404);
      }
    }

    // Izmeni uslugu
    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return successResponse(
      updatedService,
      "Usluga je uspešno izmenjena"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/services/[id]
 * Zaštićena ruta - brisanje usluge (soft delete)
 * Dozvoljeno samo vlasniku usluge
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

    // Pronađi uslugu
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
      },
    });

    if (!existingService) {
      return errorResponse("Usluga nije pronađena", 404);
    }

    // Proveri vlasništvo
    if (existingService.providerId !== user.id && user.role !== UserRole.ADMIN) {
      return errorResponse(
        "Nemate dozvolu da obrišete ovu uslugu",
        403
      );
    }

    // Proveri da li ima aktivnih rezervacija
    if (existingService.bookings.length > 0) {
      return errorResponse(
        "Ne možete obrisati uslugu sa aktivnim rezervacijama",
        400
      );
    }

    // Soft delete (postavi isActive na false)
    await prisma.service.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return successResponse(
      null,
      "Usluga je uspešno obrisana"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
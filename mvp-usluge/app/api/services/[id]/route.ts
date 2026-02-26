import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateServiceSchema } from "@/lib/validations/service";
import { UserRole } from "@prisma/client";
import { validateUUID } from '@/lib/sanitize';

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Vraća detalje jedne usluge
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalji usluge
 *       404:
 *         description: Usluga nije pronađena
 *   put:
 *     summary: Ažurira uslugu
 *     tags: [Services]
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
 *         description: Usluga ažurirana
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Usluga nije pronađena
 *   delete:
 *     summary: Briše uslugu
 *     tags: [Services]
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
 *         description: Usluga obrisana
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nemate dozvolu
 *       404:
 *         description: Usluga nije pronađena
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;

    console.log(`[GET /api/services/${serviceId}] Fetching service...`);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
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
            verifiedAt: true,
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
      console.warn(`[GET /api/services/${serviceId}] Service not found`);
      return errorResponse("Usluga nije pronađena", 404);
    }

    console.log(`[GET /api/services/${serviceId}] Service found successfully`);
    return successResponse(service);
  } catch (error) {
    console.error(`[GET /api/services] Error:`, error instanceof Error ? error.message : String(error));
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID (SQL Injection zaštita)
    if (!validateUUID((await params).id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    // Pronađi uslugu
    const existingService = await prisma.service.findUnique({
      where: { id: (await params).id },
    });

    if (!existingService) {
      return errorResponse("Usluga nije pronađena", 404);
    }

    // 🛡 IDOR ZAŠTITA - Proveri vlasništvo
    if (existingService.providerId !== user.id && user.role !== UserRole.ADMIN) {
      console.warn(`IDOR attempt: User ${user.id} tried to modify service ${(await params).id} owned by ${existingService.providerId}`);
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
      where: { id: (await params).id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // 🛡 VALIDACIJA UUID
    if (!validateUUID((await params).id)) {
      return errorResponse("Nevalidan ID format", 400);
    }

    // Pronađi uslugu
    const existingService = await prisma.service.findUnique({
      where: { id: (await params).id },
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

    // 🛡 IDOR ZAŠTITA - Proveri vlasništvo
    if (existingService.providerId !== user.id && user.role !== UserRole.ADMIN) {
      console.warn(`IDOR attempt: User ${user.id} tried to delete service ${(await params).id} owned by ${existingService.providerId}`);
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
      where: { id: (await params).id },
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
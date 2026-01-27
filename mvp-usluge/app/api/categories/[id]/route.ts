import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateCategorySchema } from "@/lib/validations/category";
import { UserRole } from "@prisma/client";

/**
 * GET /api/categories/[id]
 * Javna ruta - vraća detalje jedne kategorije
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            _count: {
              select: { services: true },
            },
          },
        },
        services: {
          where: { isActive: true },
          take: 10,
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                averageRating: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      return errorResponse("Kategorija nije pronađena", 404);
    }

    return successResponse({
      ...category,
      servicesCount: category._count.services,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/categories/[id]
 * Zaštićena ruta - izmena kategorije
 * Dozvoljeno samo za ADMIN
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

    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Samo administratori mogu menjati kategorije", 403);
    }

    // Pronađi kategoriju
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return errorResponse("Kategorija nije pronađena", 404);
    }

    // Validacija
    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    // Ako se menja slug, proveri da li već postoji
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return errorResponse("Kategorija sa ovim slug-om već postoji", 409);
      }
    }

    // Ako se menja parentId, proveri validnost
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId === params.id) {
        return errorResponse("Kategorija ne može biti sopstveni roditelj", 400);
      }

      if (validatedData.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: validatedData.parentId },
        });

        if (!parentCategory) {
          return errorResponse("Roditeljska kategorija ne postoji", 404);
        }

        // Proveri da roditeljska kategorija nema svog roditelja
        if (parentCategory.parentId) {
          return errorResponse(
            "Nije dozvoljeno kreirati podkategorije trećeg nivoa",
            400
          );
        }
      }
    }

    // Ažuriraj kategoriju
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    return successResponse(updatedCategory, "Kategorija je uspešno izmenjena");
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/categories/[id]
 * Zaštićena ruta - brisanje kategorije
 * Dozvoljeno samo za ADMIN
 * Ne može se obrisati kategorija koja ima usluge
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

    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Samo administratori mogu brisati kategorije", 403);
    }

    // Pronađi kategoriju
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            services: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return errorResponse("Kategorija nije pronađena", 404);
    }

    // Proveri da li ima povezanih usluga
    if (category._count.services > 0) {
      return errorResponse(
        `Ne možete obrisati kategoriju koja ima ${category._count.services} usluga. Prvo premestite usluge u drugu kategoriju.`,
        400
      );
    }

    // Proveri da li ima podkategorija
    if (category._count.children > 0) {
      return errorResponse(
        `Ne možete obrisati kategoriju koja ima ${category._count.children} podkategorija.`,
        400
      );
    }

    // Obriši kategoriju
    await prisma.category.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Kategorija je uspešno obrisana");
  } catch (error) {
    return handleApiError(error);
  }
}
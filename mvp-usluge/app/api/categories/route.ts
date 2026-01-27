import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createCategorySchema } from "@/lib/validations/category";
import { UserRole } from "@prisma/client";

/**
 * GET /api/categories
 * Javna ruta - vraća sve kategorije sa hijerarhijom
 * Query parametri:
 * - parentId: Filtriraj po roditeljskoj kategoriji
 * - includeChildren: Uključi podkategorije (default: true)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const includeChildren = searchParams.get("includeChildren") !== "false";

    // Ako je parentId null ili "null", vraćamo root kategorije
    const where: any = {};
    
    if (parentId === "null" || parentId === null) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        // Podkategorije (children)
        children: includeChildren
          ? {
              include: {
                _count: {
                  select: { services: true },
                },
              },
            }
          : false,
        // Broj usluga u kategoriji
        _count: {
          select: { services: true },
        },
        // Roditeljska kategorija
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Grupiši u hijerarhijsku strukturu
    const categoriesWithHierarchy = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconUrl: category.iconUrl,
      parentId: category.parentId,
      parent: category.parent,
      servicesCount: category._count.services,
      childrenCount: category.children ? category.children.length : 0,
      children: category.children
        ? category.children.map((child) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            iconUrl: child.iconUrl,
            servicesCount: child._count.services,
          }))
        : [],
    }));

    return successResponse({ categories: categoriesWithHierarchy });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/categories
 * Zaštićena ruta - kreira novu kategoriju
 * Dozvoljeno samo za ADMIN
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Samo admin može kreirati kategorije
    if (user.role !== UserRole.ADMIN) {
      return errorResponse("Samo administratori mogu kreirati kategorije", 403);
    }

    // Validacija
    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    // Proveri da li slug već postoji
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategory) {
      return errorResponse("Kategorija sa ovim slug-om već postoji", 409);
    }

    // Ako ima parentId, proveri da li roditeljska kategorija postoji
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return errorResponse("Roditeljska kategorija ne postoji", 404);
      }

      // Proveri da roditeljska kategorija nema svog roditelja (max 2 nivoa)
      if (parentCategory.parentId) {
        return errorResponse(
          "Nije dozvoljeno kreirati podkategorije trećeg nivoa",
          400
        );
      }
    }

    // Kreiraj kategoriju
    const category = await prisma.category.create({
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

    return successResponse(category, "Kategorija je uspešno kreirana", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
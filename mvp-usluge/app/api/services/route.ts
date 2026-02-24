import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createServiceSchema } from "@/lib/validations/service";
import { UserRole } from "@prisma/client";

/**
 * GET /api/services
 * Javna ruta - vraća listu svih aktivnih usluga
 * 
 * Query parametri:
 * - categoryId?: string (filter po kategoriji)
 * - providerId?: string (filter po pružaocu)
 * - search?: string (pretraga po nazivu/opisu)
 * - page?: number (paginacija)
 * - limit?: number (broj rezultata po stranici)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Query parametri
    const categoryId = searchParams.get("categoryId");
    const providerId = searchParams.get("providerId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Prisma where uslovi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch usluga sa paginacijom
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              role: true,
              averageRating: true,
              city: true,
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
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.service.count({ where }),
    ]);

    return successResponse({
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/services
 * Zaštićena ruta - kreira novu uslugu
 * Dozvoljeno samo za FREELANCER i COMPANY
 */
export async function POST(req: NextRequest) {
  try {
    // Provera autentifikacije
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Neautorizovan pristup", 401);
    }

    // Provera uloge
    if (!([UserRole.FREELANCER, UserRole.COMPANY] as UserRole[]).includes(user.role)) {
      return errorResponse(
        "Samo pružaoci usluga mogu kreirati usluge",
        403
      );
    }

    // Parse i validacija body-ja
    const body = await req.json();
    const validatedData = createServiceSchema.parse(body);

    // Proveri da li kategorija postoji
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return errorResponse("Kategorija ne postoji", 404);
    }

    // Proveri limit usluga
    const serviceCount = await prisma.service.count({
      where: {
        providerId: user.id,
        isActive: true,
      },
    });

    const maxServices = user.role === UserRole.FREELANCER ? 50 : 200;

    if (serviceCount >= maxServices) {
      return errorResponse(
        `Dostignut maksimalan broj usluga (${maxServices})`,
        400
      );
    }

    // Kreiraj uslugu
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        providerId: user.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            role: true,
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
      service,
      "Usluga je uspešno kreirana",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
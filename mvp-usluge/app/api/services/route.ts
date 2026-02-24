import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createServiceSchema } from "@/lib/validations/service";
import { UserRole } from "@prisma/client";

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Vraća listu svih aktivnih usluga
 *     description: Javna ruta - pretraga i filtriranje usluga sa paginacijom
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter po kategoriji
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter po pružaocu
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pretraga po nazivu/opisu
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Broj stranice
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Broj rezultata po stranici
 *     responses:
 *       200:
 *         description: Lista usluga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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
 * @swagger
 * /api/services:
 *   post:
 *     summary: Kreira novu uslugu
 *     description: Zaštićena ruta - samo FREELANCER i COMPANY
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - duration
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: Muško šišanje
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Profesionalno muško šišanje sa stilizovanjem
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 1500
 *               pricingType:
 *                 type: string
 *                 enum: [FIXED, HOURLY]
 *                 default: FIXED
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 480
 *                 example: 45
 *               locationType:
 *                 type: string
 *                 enum: [ONSITE, CLIENT_LOCATION, ONLINE]
 *                 default: ONSITE
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Usluga uspešno kreirana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       401:
 *         description: Neautorizovan pristup
 *       403:
 *         description: Nedovoljna prava pristupa
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
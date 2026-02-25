import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Vraća OpenAPI specifikaciju
 *     description: Javna ruta - vraća OpenAPI 3.0.0 specifikaciju za sve API rute
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specifikacija u JSON formatu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
    return NextResponse.json(swaggerSpec);
}

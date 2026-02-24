import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Proverava status aplikacije i database konekcije
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplikacija je zdrava
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime u sekundama
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: Aplikacija nije zdrava
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 error:
 *                   type: string
 */
export async function GET() {
    try {
        // Proveri database konekciju
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 503 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * @swagger
 * /api/cron/run-migrations:
 *   post:
 *     summary: Pokrenuti Prisma migracije na Vercel-u
 *     description: Cron job koji se pokreće svakih 12 sati i primenjuje pending migracije
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Migracije su primenjene uspešno
 *       401:
 *         description: Unauthorized (zahteva CRON_SECRET)
 *       500:
 *         description: Greška tokom primene migracija
 */
async function POST(req: NextRequest) {
  try {
    // 🔒 Zaštita: proveri CRON_SECRET
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting Prisma migrations...');

    // Pokreni migracije
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate deploy --skip-generate',
      {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      }
    );

    console.log('✅ Migrations completed:', stdout);

    if (stderr) {
      console.warn('⚠️  Migration warnings:', stderr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Prisma migrations completed successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ Migration failed:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Migration execution failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export { POST };
export const GET = POST;

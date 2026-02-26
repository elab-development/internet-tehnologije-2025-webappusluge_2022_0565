import { NextRequest, NextResponse } from 'next/server';
import { checkAndUpdateCompanyVerification } from '@/lib/verification';

/**
 * @swagger
 * /api/cron/verify-companies:
 *   get:
 *     summary: Proverava i ažurira verifikaciju preduzeća
 *     description: Cron job - proverava da li su preduzeća verifikovana
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verifikacija obavljena
 *       401:
 *         description: Unauthorized (zahteva CRON_SECRET)
 *   post:
 *     summary: Proverava i ažurira verifikaciju preduzeća
 *     description: Cron job - proverava da li su preduzeća verifikovana
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verifikacija obavljena
 *       401:
 *         description: Unauthorized (zahteva CRON_SECRET)
 */
export async function GET(req: NextRequest) {
    try {
        // 🔒 Zaštita endpoint-a
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const results = await checkAndUpdateCompanyVerification();

        return NextResponse.json({
            success: true,
            message: 'Verifikacija preduzeća uspešno proverena',
            data: results,
        });
    } catch (error) {
        console.error('Verification cron job error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export const POST = GET;

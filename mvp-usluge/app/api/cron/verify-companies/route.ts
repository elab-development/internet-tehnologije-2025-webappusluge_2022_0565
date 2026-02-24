import { NextRequest, NextResponse } from 'next/server';
import { checkAndUpdateCompanyVerification } from '@/lib/verification';

export async function POST(req: NextRequest) {
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

import { NextRequest } from 'next/server';
import { applyRateLimit, authRateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-utils';

/**
 * 🛡 RATE LIMITING za login endpoint
 * Zaštita od brute-force napada
 */
export async function POST(req: NextRequest) {
    // Primeni rate limit
    const rateLimitResult = await applyRateLimit(req, authRateLimit);

    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    // Redirect na NextAuth signin
    return errorResponse('Use /api/auth/signin instead', 400);
}

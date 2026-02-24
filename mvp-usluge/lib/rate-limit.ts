import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Inicijalizuj Redis klijenta
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

/**
 * 🛡 RATE LIMITING
 * Različiti limiti za različite endpoint-e
 */

// Strict rate limit za auth endpoint-e (brute-force zaštita)
export const authRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 pokušaja u 15 minuta
        analytics: true,
        prefix: 'ratelimit:auth',
    })
    : null;

// Normalan rate limit za API endpoint-e
export const apiRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 zahteva po minuti
        analytics: true,
        prefix: 'ratelimit:api',
    })
    : null;

// Strogi rate limit za kreiranje resursa
export const createRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 kreiranja po satu
        analytics: true,
        prefix: 'ratelimit:create',
    })
    : null;

/**
 * Helper funkcija za primenu rate limit-a
 */
export async function applyRateLimit(
    req: NextRequest,
    ratelimit: Ratelimit | null
): Promise<{ success: boolean; response?: NextResponse }> {
    if (!ratelimit) {
        // Ako Redis nije konfigurisan, dozvoli zahtev
        return { success: true };
    }

    // Uzmi IP adresu ili fallback na 'anonymous'
    const ip = (req as any).ip ?? req.headers.get('x-forwarded-for') ?? 'anonymous';

    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    error: 'Previše zahteva. Pokušajte ponovo kasnije.',
                    rateLimit: {
                        limit,
                        remaining: 0,
                        reset: new Date(reset).toISOString(),
                    },
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                    },
                }
            ),
        };
    }

    return { success: true };
}

/**
 * Helper za dobijanje IP adrese
 */
export function getClientIP(req: NextRequest): string {
    return (
        (req as any).ip ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
    );
}

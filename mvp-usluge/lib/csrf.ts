import { NextRequest } from 'next/server';

/**
 * 🛡 CSRF ZAŠTITA
 * Provera Origin i Referer header-a
 */
export function validateCSRF(req: NextRequest): boolean {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');

    // Dozvoli samo zahteve sa istog origin-a
    if (origin) {
        try {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                console.warn(`CSRF attempt: Origin ${originHost} does not match host ${host}`);
                return false;
            }
        } catch {
            return false;
        }
    }

    // Proveri referer (fallback)
    if (referer && !origin) {
        try {
            const refererHost = new URL(referer).host;
            if (refererHost !== host) {
                console.warn(`CSRF attempt: Referer ${refererHost} does not match host ${host}`);
                return false;
            }
        } catch {
            return false;
        }
    }

    return true;
}

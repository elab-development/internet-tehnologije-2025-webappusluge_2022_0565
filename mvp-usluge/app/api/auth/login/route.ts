import { NextRequest } from 'next/server';
import { applyRateLimit, authRateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-utils';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: ⚠️ Zastarelo - koristi /api/auth/signin
 *     description: |
 *       Ovaj endpoint više NIJE korišćen. Umesto toga koristite NextAuth.js signIn funkciju direktno ili /api/auth/signin endpoint.
 *
 *       Prijavljivanje se obavlja kroz NextAuth.js sa sledećim credentials:
 *       - email: email korisnika
 *       - password: lozinka korisnika (heširana sa bcrypt)
 *
 *       **NextAuth.js signIn primer:**
 *       ```javascript
 *       import { signIn } from "next-auth/react";
 *
 *       await signIn("credentials", {
 *         email: "user@example.com",
 *         password: "password123"
 *       });
 *       ```
 *     tags: [Auth]
 *     deprecated: true
 *     responses:
 *       400:
 *         description: Endpoint je zastareo - koristi /api/auth/signin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

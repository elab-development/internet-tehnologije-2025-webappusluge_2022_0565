import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Vraća podatke trenutne sesije
 *     description: Zaštićena ruta - vraća podatke prijavljenog korisnika ili null
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Korisnik je prijavljen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [CLIENT, FREELANCER, COMPANY, ADMIN]
 *                     isVerified:
 *                       type: boolean
 *       401:
 *         description: Korisnik nije prijavljen
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get session" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * GET /api/auth/session
 * Vraća trenutnog korisnika ili null
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
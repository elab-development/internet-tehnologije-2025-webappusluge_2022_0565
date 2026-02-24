import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { validateCSRF } from "./lib/csrf";

/**
 * Middleware za zaštitu ruta
 * Automatski proverava JWT token za sve rute koje počinju sa /api/
 * (osim /api/auth/*)
 */
export default withAuth(
  function middleware(req) {
    // 🛡 CSRF zaštita za POST/PUT/DELETE zahteve
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (!validateCSRF(req)) {
        return NextResponse.json(
          { success: false, error: 'CSRF validation failed' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Provera da li korisnik ima pristup
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Javne rute (ne zahtevaju autentifikaciju)
        const publicApiRoutes = [
          "/api/auth",
          "/api/services",
          "/api/categories",
          "/api/health",
          "/api/docs",
          "/api/geocode",
        ];

        // Proveri da li je ruta javna
        const isPublicRoute = publicApiRoutes.some((route) =>
          path.startsWith(route)
        );

        // GET zahtevi za services su javni
        if (path.startsWith("/api/services") && req.method === "GET") {
          return true;
        }

        // Ostale API rute zahtevaju autentifikaciju
        if (path.startsWith("/api/") && !isPublicRoute) {
          return !!token;
        }

        // Sve ostale rute su dozvoljene
        return true;
      },
    },
  }
);

/**
 * Konfiguracija - koje rute middleware štiti
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/(dashboard)/:path*",
  ],
};
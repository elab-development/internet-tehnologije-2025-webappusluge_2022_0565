import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware za zaštitu ruta
 * Automatski proverava JWT token za sve rute koje počinju sa /api/
 * (osim /api/auth/*)
 */
export default withAuth(
  function middleware(req) {
    // Middleware se izvršava nakon uspešne autentifikacije
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
          "/api/services", // GET je javan
          "/api/categories",
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
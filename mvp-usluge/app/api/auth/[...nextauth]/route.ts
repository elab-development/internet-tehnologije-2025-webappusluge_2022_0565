import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth API route handler
 * Automatski kreira sve potrebne auth endpoint-e:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET/POST /api/auth/session
 * - GET/POST /api/auth/csrf
 * - GET/POST /api/auth/callback/:provider
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
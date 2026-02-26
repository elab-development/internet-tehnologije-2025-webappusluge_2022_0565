import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Server-side helper za dobijanje trenutnog korisnika
 * Koristi se u Server Components i API rutama
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Server-side helper za proveru autentifikacije
 * Redirektuje na login ako korisnik nije prijavljen
 *
 * NAPOMENA: Na Vercel-u getServerSession() može biti spora zbog cold starts
 * Dodaj mali delay da se session stabilizuje na serveru
 */
export async function requireAuth() {
  // Čekaj malo da se session stabilizuje nakon login-a
  // Ovo je važno na Vercel-u gde getServerSession() može biti spora
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

/**
 * Server-side helper za proveru uloge
 * Redirektuje na unauthorized ako korisnik nema potrebnu ulogu
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Client-side helper za proveru da li je korisnik prijavljen
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAuthenticated(user: any): boolean {
  return !!user;
}

/**
 * Client-side helper za proveru uloge
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasRole(user: any, roles: UserRole[]): boolean {
  return user && roles.includes(user.role);
}
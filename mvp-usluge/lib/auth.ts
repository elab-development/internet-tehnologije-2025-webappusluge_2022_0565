import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

/**
 * NextAuth konfiguracija
 * Koristi JWT strategiju za session management
 */
export const authOptions: NextAuthOptions = {
  // Session strategija
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 sata
  },

  // Stranice
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      /**
       * Authorize funkcija - proverava kredencijale
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email i lozinka su obavezni");
        }

        // Pronađi korisnika u bazi
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Korisnik ne postoji");
        }

        // Proveri da li je nalog aktivan
        if (!user.isActive) {
          throw new Error("Nalog je deaktiviran");
        }

        // Proveri lozinku
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Pogrešna lozinka");
        }

        // Vrati korisnika (bez lozinke)
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],

  /**
   * Callbacks - modifikuju JWT token i session
   */
  callbacks: {
    /**
     * JWT callback - poziva se kada se kreira/ažurira token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.isVerified = user.isVerified;
      }
      return token;
    },

    /**
     * Session callback - poziva se kada se pristupa session-u
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },

  // Debug mode (samo u development-u)
  debug: process.env.NODE_ENV === "development",
};
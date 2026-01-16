import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

/**
 * Proširenje NextAuth tipova
 * Dodaje custom polja u session i JWT
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isVerified: boolean;
  }
}
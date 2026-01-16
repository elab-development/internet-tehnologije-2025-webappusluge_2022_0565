"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Client-side SessionProvider wrapper
 * Omogućava pristup session-u u client komponentama
 */
export default function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
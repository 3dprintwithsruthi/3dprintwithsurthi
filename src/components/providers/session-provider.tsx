"use client";

/**
 * Wraps app with NextAuth SessionProvider for client-side session access
 */
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

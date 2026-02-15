/**
 * NextAuth API route handler and getServerSession helper
 */
import NextAuth from "next-auth";
import { authOptions } from "@/auth/config";

export const handler = NextAuth(authOptions);

export const getServerSession = () =>
  import("next-auth").then((m) => m.getServerSession(authOptions));

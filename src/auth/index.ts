/**
 * NextAuth API route handler and getServerSession helper
 * authOptions is lazy-loaded to prevent Prisma from running at build time
 */
import NextAuth from "next-auth";

// Lazy-load authOptions so Prisma queries only run at runtime
let cachedHandler: any = null;

async function getAuthHandler() {
  if (!cachedHandler) {
    const { authOptions } = await import("@/auth/config");
    cachedHandler = NextAuth(authOptions);
  }
  return cachedHandler;
}

export const handler = async (...args: any[]) => {
  const authHandler = await getAuthHandler();
  return authHandler(...args);
};

export const getServerSession = async () => {
  const { authOptions } = await import("@/auth/config");
  const { getServerSession: getServerSessionFn } = await import("next-auth");
  return getServerSessionFn(authOptions);
};

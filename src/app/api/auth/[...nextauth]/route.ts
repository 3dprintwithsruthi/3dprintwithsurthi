/**
 * NextAuth API route – handles /api/auth/* (signin, signout, session, etc.)
 */
import { handler as nextAuthHandler } from "@/auth";

export const GET = nextAuthHandler;
export const POST = nextAuthHandler;

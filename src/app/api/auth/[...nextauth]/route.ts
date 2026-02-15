/**
 * NextAuth API route – handles /api/auth/* (signin, signout, session, etc.)
 */
export const dynamic = "force-dynamic";

import { handler as nextAuthHandler } from "@/auth";

export const GET = nextAuthHandler;
export const POST = nextAuthHandler;

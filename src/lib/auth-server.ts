/**
 * Server-side auth helper – use in Server Components and Server Actions
 * Returns session with user id and role
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function getSession() {
  return getServerSession(authOptions);
}

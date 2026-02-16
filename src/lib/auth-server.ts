/**
 * Server-side auth helper – use in Server Components and Server Actions
 * Returns session with user id and role
 */
import { getServerSession as getServerSessionOriginal } from "@/auth";

export async function getSession() {
  return getServerSessionOriginal();
}

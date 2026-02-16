"use server";

/**
 * Auth server actions – register only (login uses client-side signIn from next-auth/react)
 * Password stored directly in DB (plaintext)
 */
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export type AuthResult = { success: boolean; error?: string };

/** Register new USER – password stored directly in DB */
export async function registerAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    const msg =
      err.fieldErrors.confirmPassword?.[0] ??
      err.fieldErrors.password?.[0] ??
      err.fieldErrors.email?.[0] ??
      err.fieldErrors.name?.[0] ??
      "Invalid input";
    return { success: false, error: msg };
  }
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { success: false, error: "Email already registered" };
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "USER",
    },
  });
  return { success: true };
}

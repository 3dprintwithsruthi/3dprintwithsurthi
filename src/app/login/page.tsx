/**
 * Login page – Welcome Back, User/Admin toggle, test credentials, gradient theme
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; callbackUrl?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "ADMIN" ? "/admin" : "/");
  }
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card-rounded p-8 shadow-xl">
        {/* Gradient icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-1 text-center text-gray-600">Sign in to your account</p>
        {params.registered === "1" && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Registration successful. Please log in.
          </p>
        )}
        <LoginForm callbackUrl={params.callbackUrl ?? "/"} />
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-indigo-600 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

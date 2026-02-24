"use client";

/**
 * Login form – single form for all users (no role toggle), email + password, Sign In
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }
    setError("Login failed");
  }

  return (
    <div className="mt-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 rounded-xl"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 rounded-xl"
              {...form.register("password")}
            />
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-white hover:from-indigo-700 hover:to-purple-700"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl py-6 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors font-semibold"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
      </div>
    </div>
  );
}

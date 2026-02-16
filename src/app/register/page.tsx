/**
 * Registration – new USER only; password stored directly in DB
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/");
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card-rounded p-8">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-gray-600">Register as a customer</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

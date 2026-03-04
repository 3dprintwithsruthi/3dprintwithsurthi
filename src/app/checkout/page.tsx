/**
 * Checkout – address form, dummy payment, place order
 * Middleware ensures user is logged in
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-l from-indigo-100 to-purple-50 blur-[100px] opacity-60 rounded-bl-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">Secure Checkout</h1>
          <p className="text-lg text-gray-500 font-medium">Complete your order with end-to-end encryption. Your data is always safe.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-4 sm:p-8 lg:p-10 shadow-xl shadow-indigo-100/50 border border-white/80">
          <CheckoutForm />
        </div>

      </div>
    </div>
  );
}

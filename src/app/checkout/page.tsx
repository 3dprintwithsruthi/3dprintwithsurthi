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
  if (!session) redirect("/login?callbackUrl=/checkout");
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
        <p className="mt-2 text-gray-600">Complete your order with our secure payment gateway or choose cash on delivery.</p>
      </div>
      <CheckoutForm />
    </div>
  );
}

/**
 * Checkout – address form, dummy payment, place order
 * Middleware ensures user is logged in
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/checkout");
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-gray-600">Enter shipping address. Payment is only on cash on delivery.</p>
      <CheckoutForm />
    </div>
  );
}

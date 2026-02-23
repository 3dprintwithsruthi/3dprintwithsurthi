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
    <div className="bg-[#f8f6fc] min-h-[calc(100vh-4rem)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <CheckoutForm />
      </div>
    </div>
  );
}

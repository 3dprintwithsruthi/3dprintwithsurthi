/**
 * Full cart page – left: cart items (rounded cards), right: Order Summary panel
 * Matches reference: Proceed to Checkout gradient, Continue Shopping, policy checkmarks
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { CartPageClient } from "./cart-page-client";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CartPageClient />
    </div>
  );
}

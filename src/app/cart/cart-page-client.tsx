"use client";

/**
 * Cart page content – items list + Order Summary side panel
 */
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const TAX_RATE = 0.18;
const SHIPPING = 49; // Matches order action

export function CartPageClient() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING;

  return (
    <>
      <Link href="/products" className="inline-flex text-sm font-medium text-indigo-600 hover:underline mb-6">
        ← Continue Shopping
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? "s" : ""} in cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Left: cart items */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="card-rounded p-12 text-center">
              <p className="text-gray-500">Your cart is empty.</p>
              <Button asChild className="mt-4">
                <Link href="/products">Browse products</Link>
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.productId} className="card-rounded flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.image ? (
                      <Image src={getOptimizedImageUrl(item.image)} alt={item.name} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900">{item.name}</h2>
                    <p className="text-sm text-indigo-600 mt-0.5">{formatPrice(item.price)} each</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          type="button"
                          className="h-9 w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          className="h-9 w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={clearCart}
              >
                Clear Entire Cart
              </button>
            </>
          )}
        </div>

        {/* Right: Order Summary */}
        {items.length > 0 && (
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card-rounded p-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(SHIPPING)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-bold text-indigo-600">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-white hover:from-indigo-700 hover:to-purple-700">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-indigo-700">
                <li className="flex items-center gap-2">✓ Free shipping on all orders</li>
                <li className="flex items-center gap-2">✓ 30-day return policy</li>
                <li className="flex items-center gap-2">✓ Secure checkout</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

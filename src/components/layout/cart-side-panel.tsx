"use client";

/**
 * Cart side summary panel – slide-over from right, total, tax, shipping
 */
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media"; // added import
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const TAX_RATE = 0.18;
const SHIPPING = 49;

export function CartSidePanel() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING;

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        aria-hidden
        onClick={closeCart}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Cart</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            ×
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 rounded-xl border p-3">
                  {item.image && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={getOptimizedImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        className="h-7 w-7 rounded border text-sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="h-7 w-7 rounded border text-sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-2 text-xs text-red-600 hover:underline"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4 card-rounded m-4 mt-0">
            <div className="space-y-1 text-sm">
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
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button className="w-full" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cart" onClick={closeCart}>
                  View full cart
                </Link>
              </Button>
              <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={clearCart}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

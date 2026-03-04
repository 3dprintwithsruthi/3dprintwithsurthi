"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";

const TAX_RATE = 0;
const SHIPPING = 0;

export function CartSidePanel() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    couponCode,
    discount
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const totalBeforeDiscount = subtotal + tax + SHIPPING;
  const actualDiscount = Math.min(discount, totalBeforeDiscount);
  const total = totalBeforeDiscount - actualDiscount;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* Slide-over Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Your Cart</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-xl font-semibold text-gray-900">Your cart is empty</p>
              <p className="text-gray-500 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
              <Button asChild className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={closeCart}>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                  {item.image ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                      <Image
                        src={getOptimizedImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/product/${item.productId}`} onClick={closeCart}>
                          <h3 className="font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="font-bold text-gray-900 shrink-0">{formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1 text-ellipsis">
                        Qty {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-5 drop-shadow-sm">

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              {TAX_RATE > 0 && (
                <div className="flex justify-between items-center">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs tracking-wide uppercase">
                  {SHIPPING === 0 ? "Free" : formatPrice(SHIPPING)}
                </span>
              </div>

              {couponCode && (
                <div className="flex justify-between items-center text-indigo-600">
                  <div className="flex items-center gap-2">
                    <span>Discount applied</span>
                    <span className="bg-indigo-100 text-indigo-700 font-mono text-[10px] px-1.5 py-0.5 rounded">{couponCode}</span>
                  </div>
                  <span className="font-medium border-b border-indigo-200 border-dashed">
                    -{formatPrice(actualDiscount)}
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-200 my-1" />

              <div className="flex justify-between items-end pt-1">
                <span className="text-base text-gray-900 font-semibold">Total</span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    {formatPrice(total)}
                  </span>
                  <span className="text-[10px] text-gray-500">Including taxes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative z-20">
              <Button
                asChild
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 text-base font-bold shadow-lg shadow-indigo-200 group relative overflow-hidden"
              >
                <Link href="/checkout" onClick={closeCart}>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl border-gray-200 hover:bg-gray-50 hover:text-indigo-600 h-11 font-semibold transition-colors">
                <Link href="/cart" onClick={closeCart}>
                  View full cart details
                </Link>
              </Button>

            </div>
            <button
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors mx-auto mt-2 pb-2"
              onClick={clearCart}
            >
              Empty Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

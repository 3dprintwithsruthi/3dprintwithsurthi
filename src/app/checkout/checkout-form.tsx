"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import { placeOrderAction } from "@/app/actions/order";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { validateCouponAction } from "@/app/actions/coupon";
import { User, MapPin, Tag, CreditCard, ShieldCheck, Lock, Phone } from "lucide-react";

export function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const router = useRouter();
  const { items, clearCart, couponCode, discount, applyCoupon, clearCoupon } = useCartStore();

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    },
  });

  const cartPayload = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    price: i.price,
    customInput: i.customInput ?? {},
  }));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = 0;
  const shipping = 0;
  const totalBeforeDiscount = subtotal + tax + shipping;
  const actualDiscount = Math.min(discount, totalBeforeDiscount);
  const total = totalBeforeDiscount - actualDiscount;

  async function handleApplyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    setIsApplying(true);
    const res = await validateCouponAction(couponInput.trim());
    setIsApplying(false);
    if (res.success && res.discountValue !== undefined) {
      applyCoupon(couponInput.trim().toUpperCase(), res.discountValue);
      setCouponInput("");
    } else {
      setCouponError(res.error || "Invalid coupon");
    }
  }

  async function onSubmit(data: AddressInput) {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    const formData = new FormData();
    formData.set("fullName", data.fullName);
    formData.set("addressLine1", data.addressLine1);
    formData.set("addressLine2", data.addressLine2 ?? "");
    formData.set("city", data.city);
    formData.set("state", data.state);
    formData.set("pincode", data.pincode);
    formData.set("phone", data.phone);
    formData.set("cartJson", JSON.stringify(cartPayload));

    // Default to ONLINE based on the Cashfree Secure Payments mock
    formData.set("paymentMethod", "ONLINE");

    if (couponCode) {
      formData.set("couponCode", couponCode);
      formData.set("discount", discount.toString());
    }

    const result = await placeOrderAction(formData);
    if (result.success && result.orderId) {
      clearCart();
      clearCoupon();

      if (result.paymentSessionId) {
        // Direct redirect bypassing the /payment route entirely!
        try {
          const { load } = await import("@cashfreepayments/cashfree-js");
          const cashfree = await load({ mode: result.env as "sandbox" | "production" });
          await cashfree?.checkout({
            paymentSessionId: result.paymentSessionId,
            redirectTarget: "_self" // Redirect directly to Cashfree's payment page
          });
        } catch (err) {
          console.error("Failed to load cashfree SDK for redirect", err);
          router.push(`/checkout/payment?session_id=${result.paymentSessionId}&order_id=${result.orderId}&env=${result.env}`);
        }
      } else {
        router.push(`/orders?placed=${result.orderId}`);
      }

      router.refresh();
      return;
    }

    // Always refresh the router on error so standard navigation to /orders breaks the client cache
    // since the database transaction might have committed a 'Rejected' order.
    router.refresh();
    setError(result.error ?? "Failed to place order");
  }

  if (items.length === 0) {
    return (
      <div className="card-rounded mt-6 p-6 text-center shadow-sm bg-white border border-gray-100 p-12">
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
        <Button className="mt-6" asChild>
          <a href="/products">Browse products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start font-sans">
      <div className="lg:col-span-8 space-y-6">
        <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-100 flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-violet-500 rounded-xl flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                <Input id="fullName" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="John Doe" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input id="phone" className="pl-9 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="9876543210" {...form.register("phone")} />
                </div>
                {form.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-violet-500 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addressLine1" className="text-sm font-semibold text-gray-700">Address Line 1 *</Label>
                <Input id="addressLine1" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="House no., Building name" {...form.register("addressLine1")} />
                {form.formState.errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.addressLine1.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="addressLine2" className="text-sm font-semibold text-gray-700">Address Line 2 (Optional)</Label>
                <Input id="addressLine2" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="Street, Area, Landmark" {...form.register("addressLine2")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
                  <Input id="city" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="Mumbai" {...form.register("city")} />
                  {form.formState.errors.city && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State *</Label>
                  <Input id="state" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="Maharashtra" {...form.register("state")} />
                  {form.formState.errors.state && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">Pincode *</Label>
                <Input id="pincode" className="mt-1.5 focus-visible:ring-violet-500 rounded-lg text-gray-900 h-11" placeholder="400001" {...form.register("pincode")} />
                {form.formState.errors.pincode && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{form.formState.errors.pincode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Coupon Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-[#48C08A] rounded-xl flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Discount Coupon</h2>
            </div>

            {couponCode ? (
              <div className="mt-2 flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                <span className="font-semibold tracking-wide text-emerald-800">{couponCode} applied!</span>
                <button type="button" onClick={clearCoupon} className="text-sm text-emerald-600 font-medium hover:underline px-2 py-1">Remove</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-11 rounded-lg focus-visible:ring-emerald-500 border-gray-200 text-gray-800 flex-1"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplying || !couponInput.trim()}
                  className="h-11 px-8 rounded-lg bg-[#48C08A] hover:bg-[#3ea576] text-white font-semibold shadow-sm transition-colors border-0"
                >
                  {isApplying ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            </div>

            <div className="w-full relative bg-violet-50/60 border-2 border-violet-500 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-violet-50">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 rounded-full border-[5px] border-violet-600 bg-white shadow-sm flex shrink-0"></div>
                <div>
                  <h3 className="font-bold text-gray-900">Secure Online Payment</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">UPI, Cards, Net Banking & More</p>
                </div>
              </div>
              <div className="h-8 w-8 text-[#48C08A] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center text-xs font-medium text-gray-500 gap-1.5">
              <Lock className="h-3 w-3 text-amber-500 shrink-0" />
              Your payment information is encrypted and secure
            </div>
          </div>
        </form>

        <Button
          type="submit"
          form="checkout-form"
          className="w-full h-[3.25rem] text-lg font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all border-0"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Processing…" : `Proceed to Payment - ${formatPrice(total)}`}
        </Button>
      </div>

      <div className="lg:col-span-4 mt-8 lg:mt-0 lg:sticky lg:top-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between items-start text-sm">
                <span className="text-gray-600 pr-4">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-3 pb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium tracking-wide">Subtotal</span>
              <span className="text-gray-700 font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium tracking-wide">Tax (18%)</span>
              <span className="text-gray-700 font-semibold">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium tracking-wide">Shipping</span>
              <span className="text-gray-700 font-semibold">{formatPrice(shipping)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 font-medium tracking-wide">Discount</span>
                <span className="text-emerald-600 font-semibold">-{formatPrice(actualDiscount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-5 mb-2">
            <span className="text-xl font-bold text-gray-900 tracking-tight">Total</span>
            <span className="text-xl font-bold text-violet-600 tracking-tight">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="bg-violet-50/50 rounded-2xl p-5 shadow-sm space-y-3 mt-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <ShieldCheck className="h-[18px] w-[18px] text-emerald-500" strokeWidth={2} />
            256-bit SSL Encryption
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
            <CreditCard className="h-[18px] w-[18px] text-violet-500" strokeWidth={2} />
            PCI DSS Compliant
          </div>
        </div>
      </div>
    </div>
  );
}

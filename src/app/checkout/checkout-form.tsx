"use client";

/**
 * Professional Checkout Form with Cashfree Integration & Coupon Support
 * Features: Address validation, coupon application, online payment only
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import { placeOrderAction, validateCouponAction } from "@/app/actions/order";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Package, MapPin, Phone, User, Tag, Loader2, CheckCircle, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const TAX_RATE = 0.18;
const SHIPPING_FLAT = 49;

export function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const router = useRouter();
  const { items, clearCart } = useCartStore();

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

  // Calculate order summary
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? couponApplied.discount : 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const shipping = SHIPPING_FLAT;
  const total = subtotal - discount + tax + shipping;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const result = await validateCouponAction(couponCode, subtotal);

      if (result.success && result.discount !== undefined) {
        setCouponApplied({
          code: couponCode,
          discount: result.discount,
          type: result.discountType || "FIXED",
        });
        setCouponError(null);
      } else {
        setCouponError(result.error || "Invalid coupon code");
        setCouponApplied(null);
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError(null);
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
    formData.set("paymentMethod", "ONLINE");

    // Add coupon if applied
    if (couponApplied) {
      formData.set("couponCode", couponApplied.code);
    }

    const result = await placeOrderAction(formData);
    if (result.success && result.orderId) {
      if (result.paymentSessionId) {
        // Redirect to Cashfree payment page
        router.push(`/checkout/payment?session_id=${result.paymentSessionId}&order_id=${result.orderId}`);
        return;
      }
      clearCart();
      router.push(`/orders?placed=${result.orderId}`);
      router.refresh();
      return;
    }
    setError(result.error ?? "Failed to place order");
  }

  if (items.length === 0) {
    return (
      <div className="card-rounded mt-6 p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
          <Package className="h-10 w-10 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Your cart is empty</h3>
        <p className="mt-2 text-gray-600">Add some amazing 3D printed products to get started!</p>
        <Button className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" asChild>
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left: Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Customer Details */}
          <div className="card-rounded p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    className="rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                    {...form.register("phone")}
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-rounded p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
                  Address Line 1 *
                </Label>
                <Input
                  id="addressLine1"
                  placeholder="House no., Building name"
                  className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  {...form.register("addressLine1")}
                />
                {form.formState.errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.addressLine1.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="addressLine2" className="text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </Label>
                <Input
                  id="addressLine2"
                  placeholder="Street, Area, Landmark"
                  className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  {...form.register("addressLine2")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    {...form.register("state")}
                  />
                  {form.formState.errors.state && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                  Pincode *
                </Label>
                <Input
                  id="pincode"
                  placeholder="400001"
                  className="mt-1.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  {...form.register("pincode")}
                />
                {form.formState.errors.pincode && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.pincode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="card-rounded p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Discount Coupon</h2>
            </div>

            {!couponApplied ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={couponLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {couponLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {couponError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <XCircle className="h-4 w-4" />
                    {couponError}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Coupon Applied!</p>
                      <p className="text-sm text-green-700">
                        Code: <span className="font-mono font-bold">{couponApplied.code}</span> - You saved {formatPrice(discount)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveCoupon}
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method - Online Only */}
          <div className="card-rounded p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="rounded-xl border-2 border-indigo-600 bg-indigo-50 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-600">
                    <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Secure Online Payment</p>
                    <p className="text-sm text-gray-600">UPI, Cards, Net Banking & More</p>
                  </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              🔒 Your payment information is encrypted and secure
            </p>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-6 text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Proceed to Payment - ${formatPrice(total)}`
            )}
          </Button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <div className="card-rounded sticky top-24 p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-gray-200"></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount</span>
                <span>- {formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-gray-200"></div>
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">{formatPrice(total)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 rounded-lg bg-green-50 p-2 text-center">
              <p className="text-sm font-semibold text-green-700">
                You're saving {formatPrice(discount)}! 🎉
              </p>
            </div>
          )}
          <div className="mt-6 space-y-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

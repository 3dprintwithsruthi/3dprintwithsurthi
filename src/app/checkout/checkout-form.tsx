"use client";

/**
 * Checkout form – address (Zod), place order action, cart in JSON
 */
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

export function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);
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

    const result = await placeOrderAction(formData);
    if (result.success && result.orderId) {
      clearCart();
      router.push(`/orders?placed=${result.orderId}`);
      router.refresh();
      return;
    }
    setError(result.error ?? "Failed to place order");
  }

  if (items.length === 0) {
    return (
      <div className="card-rounded mt-6 p-6 text-center">
        <p className="text-gray-600">Your cart is empty. Add products from the store.</p>
        <Button className="mt-4" asChild>
          <a href="/products">Browse products</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="card-rounded mt-6 space-y-4 p-6">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <div>
        <Label htmlFor="fullName">Full name *</Label>
        <Input id="fullName" className="mt-1" {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.fullName.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="addressLine1">Address line 1 *</Label>
        <Input id="addressLine1" className="mt-1" {...form.register("addressLine1")} />
        {form.formState.errors.addressLine1 && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.addressLine1.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
        <Input id="addressLine2" className="mt-1" {...form.register("addressLine2")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" className="mt-1" {...form.register("city")} />
          {form.formState.errors.city && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.city.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input id="state" className="mt-1" {...form.register("state")} />
          {form.formState.errors.state && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.state.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pincode">Pincode (6 digits) *</Label>
          <Input id="pincode" className="mt-1" {...form.register("pincode")} />
          {form.formState.errors.pincode && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.pincode.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone (10 digits) *</Label>
          <Input id="phone" className="mt-1" {...form.register("phone")} />
          {form.formState.errors.phone && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500">Payment: only Cash on Delivery.</p>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}

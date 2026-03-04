"use client";

/**
 * Add to cart – quantity + dynamic custom fields; validates stock
 */
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomFieldDef } from "@/types";
import type { CustomInputValue } from "@/types";
import { ShoppingCart, Edit3, Plus, Minus } from "lucide-react";

type Props = {
  productId: string;
  name: string;
  price: number;
  maxStock: number;
  customFields: CustomFieldDef[];
  image?: string;
};

export function AddToCartSection({
  productId,
  name,
  price,
  maxStock,
  customFields,
  image,
}: Props) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [quantity, setQuantity] = useState(1);
  const [customInput, setCustomInput] = useState<CustomInputValue>({});

  const handleAdd = () => {
    const qty = Math.max(1, Math.min(quantity, maxStock));
    // Provide a default empty object or similar for CustomInput if tracking customized configurations
    addItem({
      productId,
      name,
      price,
      quantity: qty,
      customInput: Object.keys(customInput).length ? customInput : undefined,
      maxStock,
      image,
    });
    openCart();
  };

  if (!session) {
    return (
      <div className="w-full bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center">
        <div className="bg-indigo-100 p-3 rounded-full mb-4">
          <ShoppingCart className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Login to Add to Cart</h3>
        <p className="text-sm text-gray-600 mb-6">You must be signed in to purchase items or customize 3D prints.</p>
        <Button asChild size="lg" className="h-12 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-bold text-white shadow-md">
          <Link href={`/login?callbackUrl=/products/${productId}`}>
            Proceed to Login
          </Link>
        </Button>
      </div>
    );
  }

  if (maxStock === 0) return null;

  return (
    <div className="w-full space-y-6">

      {/* Custom Fields Input Container */}
      {customFields.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-2">
            <Edit3 className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">Customise Options</span>
          </div>

          {customFields.map((field) => (
            <div key={field.key} className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
              <Label htmlFor={field.key} className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>{field.label}</span>
                {field.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>}
              </Label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.key}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 min-h-[100px] resize-y"
                  rows={3}
                  placeholder={field.placeholder || "Enter your specific requirements..."}
                  value={(customInput[field.key] as string) ?? ""}
                  onChange={(e) =>
                    setCustomInput((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  className="h-12 rounded-xl border-gray-200 bg-white ring-offset-white focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm text-base placeholder:text-gray-400"
                  required={field.required}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={(customInput[field.key] as string) ?? ""}
                  onChange={(e) =>
                    setCustomInput((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Area Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4">

        {/* Quantity Selector */}
        <div className="flex items-center w-full sm:w-auto p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="flex flex-1 items-center justify-center min-w-[3rem] px-2 text-center text-lg font-bold text-gray-900 tabular-nums">
            {quantity}
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600"
            onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
            disabled={quantity >= maxStock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={handleAdd}
          disabled={maxStock === 0}
          className="h-14 flex-1 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold text-lg border-none"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>

    </div>
  );
}

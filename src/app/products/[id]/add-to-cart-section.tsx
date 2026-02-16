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
      <div className="mt-6">
        <Link href="/login">
          <Button>Login to add to cart</Button>
        </Link>
      </div>
    );
  }

  if (maxStock === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {customFields.length > 0 && (
        <div className="space-y-3">
          <p className="font-medium text-gray-700">Customisation</p>
          {customFields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label} {field.required && "*"}
              </Label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.key}
                  className="input-rounded mt-1 w-full px-3 py-2"
                  rows={2}
                  placeholder={field.placeholder}
                  value={(customInput[field.key] as string) ?? ""}
                  onChange={(e) =>
                    setCustomInput((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  className="mt-1"
                  required={field.required}
                  placeholder={field.placeholder}
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="qty">Quantity</Label>
          <input
            id="qty"
            type="number"
            min={1}
            max={maxStock}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            className="input-rounded w-20 px-2 py-1 text-center"
          />
        </div>
        <Button onClick={handleAdd} disabled={maxStock === 0}>
          Add to cart
        </Button>
      </div>
    </div>
  );
}

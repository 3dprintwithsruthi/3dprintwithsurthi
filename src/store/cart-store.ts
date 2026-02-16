"use client";

/**
 * Cart state – add/remove, quantity, total, tax, shipping
 * Persisted in sessionStorage; used for checkout
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomInput: (productId: string, customInput: CartItem["customInput"]) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const qty = item.quantity ?? 1;
          if (existing) {
            const newQty = Math.min(existing.quantity + qty, item.maxStock);
            if (newQty <= 0) return state;
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: newQty, customInput: item.customInput ?? i.customInput }
                  : i
              ),
            };
          }
          if (qty <= 0 || qty > item.maxStock) return state;
          return {
            items: [...state.items, { ...item, quantity: qty }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter((i) => i.productId !== productId) };
          return {
            items: state.items.map((i) => {
              if (i.productId !== productId) return i;
              const qty = Math.min(quantity, i.maxStock);
              return { ...i, quantity: qty };
            }),
          };
        }),
      setCustomInput: (productId, customInput) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, customInput } : i
          ),
        })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      clearCart: () => set({ items: [], isCartOpen: false }),
    }),
    { name: "cart-3dprint", skipHydration: true }
  )
);

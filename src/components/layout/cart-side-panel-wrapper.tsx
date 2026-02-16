"use client";

import dynamic from "next/dynamic";

const CartSidePanel = dynamic(
  () => import("@/components/layout/cart-side-panel").then((m) => ({ default: m.CartSidePanel })),
  { ssr: false }
);

export function CartSidePanelWrapper() {
  return <CartSidePanel />;
}

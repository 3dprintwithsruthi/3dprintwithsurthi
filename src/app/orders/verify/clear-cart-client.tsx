"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function ClearCartClient() {
    const clearCart = useCartStore((s) => s.clearCart);
    const clearCoupon = useCartStore((s) => s.clearCoupon);

    useEffect(() => {
        // Run once on payment success
        clearCart();
        clearCoupon();
    }, [clearCart, clearCoupon]);

    return null;
}

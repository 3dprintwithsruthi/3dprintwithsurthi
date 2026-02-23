"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackSiteVisitAction, trackProductViewAction } from "@/app/actions/analytics";

export function AnalyticsTracker() {
    const pathname = usePathname();

    // Track global visits per session using sessionStorage
    useEffect(() => {
        const tracked = sessionStorage.getItem("site_visited");
        if (!tracked) {
            sessionStorage.setItem("site_visited", "true");
            trackSiteVisitAction();
        }
    }, []);

    // Track product views when navigating to /products/[id]
    useEffect(() => {
        if (pathname && pathname.startsWith("/products/")) {
            const parts = pathname.split("/");
            if (parts.length === 3 && parts[1] === "products") {
                const productId = parts[2];

                // Prevent tracking multiple times for same product in same session, to avoid spam
                const viewedProducts = JSON.parse(sessionStorage.getItem("viewed_products") || "[]");
                if (!viewedProducts.includes(productId)) {
                    viewedProducts.push(productId);
                    sessionStorage.setItem("viewed_products", JSON.stringify(viewedProducts));
                    trackProductViewAction(productId);
                }
            }
        }
    }, [pathname]);

    return null;
}

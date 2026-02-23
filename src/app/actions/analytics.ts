"use server";

import { prisma } from "@/lib/db";

export async function trackSiteVisitAction() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Using try-catch because if db schema isn't fully generated yet, we don't want the app to crash
        await (prisma as any).siteMetric.upsert({
            where: { date: today },
            create: { date: today, visits: 1 },
            update: { visits: { increment: 1 } },
        });
    } catch (e) {
        console.error("Failed to track visit", e);
    }
}

export async function trackProductViewAction(productId: string) {
    try {
        await (prisma as any).product.update({
            where: { id: productId },
            data: { views: { increment: 1 } },
        });
    } catch (e) {
        console.error("Failed to track view", e);
    }
}

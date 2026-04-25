export * from "./auth";
export * from "./client";
export * from "./orders";
export * from "./shipments";
export * from "./tracking";
export * from "./pickups";
export * from "./webhooks";

import { createOrder as triggerCreateOrder } from "./orders";
import { prisma } from "@/lib/db";

export async function pushOrderToShiprocket(orderId: string) {
    // DUMMY MODE: Do nothing, safely exit so main checkout flow isn't affected.
    console.log(`[DUMMY MODE] Skipped pushing order ${orderId} to Shiprocket.`);
    return;
}

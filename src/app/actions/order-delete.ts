"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { OrderActionResult } from "./order";

/**
 * Delete an order completely
 * Warning: This removes all associated data including items and revenue
 */
export async function deleteOrderAction(orderId: string): Promise<OrderActionResult> {
    const session = await getSession();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.order.delete({
            where: { id: orderId },
        });

        revalidatePath("/admin/analytics");
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}

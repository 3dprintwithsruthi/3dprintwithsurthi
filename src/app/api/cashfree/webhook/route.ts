import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
import cashfree from "@/lib/cashfree";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-webhook-signature") || "";
        const timestamp = request.headers.get("x-webhook-timestamp") || "";

        try {
            // Throw error if signature is invalid
            cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        } catch (err: any) {
            console.error("Invalid webhook signature:", err?.message || err);
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { type, data } = payload;

        console.log("Cashfree webhook received:", type, data?.payment?.order_id);

        if (type === "PAYMENT_SUCCESS_WEBHOOK") {
            const { order_id, payment_status, cf_payment_id } = data.payment;

            // Idempotency check: Process only if payment_status is SUCCESS
            if (payment_status === "SUCCESS") {
                const existingOrder = await prisma.order.findUnique({
                    where: { id: order_id },
                    include: { orderItems: true }
                });

                if (existingOrder && existingOrder.paymentStatus !== "PAID") {
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id: order_id },
                            data: {
                                paymentStatus: "PAID",
                                paymentId: String(cf_payment_id),
                                status: "Accepted" // Update Supabase Status enum
                            },
                        });
                        for (const item of existingOrder.orderItems) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });
                        }
                    });

                    console.log(`Order ${order_id} marked as PAID and stock decremented. Pushing to Shiprocket...`);
                    // Ensure shiprocket only gets hit once
                    await pushOrderToShiprocket(order_id);
                } else {
                    console.log(`Order ${order_id} is already PAID or does not exist, ignoring webhook.`);
                }
            }
        }

        if (type === "PAYMENT_FAILED_WEBHOOK") {
            const { order_id } = data.payment;

            await prisma.order.update({
                where: { id: order_id },
                data: {
                    paymentStatus: "FAILED",
                    status: "Rejected"
                },
            });

            console.log(`Order ${order_id} marked as FAILED`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Webhook processing error:", error?.message || error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

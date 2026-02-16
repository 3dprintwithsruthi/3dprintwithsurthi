/**
 * Cashfree Webhook Handler
 * Receives payment status updates from Cashfree
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Verify Cashfree webhook signature
function verifyWebhookSignature(
    rawBody: string,
    signature: string,
    timestamp: string
): boolean {
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) return false;

    const signatureData = `${timestamp}${rawBody}`;
    const computedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(signatureData)
        .digest("base64");

    return computedSignature === signature;
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-webhook-signature") || "";
        const timestamp = request.headers.get("x-webhook-timestamp") || "";

        // Verify signature
        if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
            console.error("Invalid webhook signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { type, data } = payload;

        console.log("Cashfree webhook received:", type, data);

        // Handle payment success
        if (type === "PAYMENT_SUCCESS_WEBHOOK") {
            const { order_id, payment_status, cf_payment_id } = data.payment;

            if (payment_status === "SUCCESS") {
                await prisma.order.update({
                    where: { id: order_id },
                    data: {
                        paymentStatus: "PAID",
                        paymentId: cf_payment_id,
                    },
                });

                console.log(`Order ${order_id} marked as PAID`);
            }
        }

        // Handle payment failure
        if (type === "PAYMENT_FAILED_WEBHOOK") {
            const { order_id } = data.payment;

            await prisma.order.update({
                where: { id: order_id },
                data: {
                    paymentStatus: "FAILED",
                },
            });

            console.log(`Order ${order_id} marked as FAILED`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * Payment Verification Page - Verifies Cashfree payment status
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import cashfree from "@/lib/cashfree";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
import { CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { ClearCartClient } from "./clear-cart-client";
import { sendOrderStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    searchParams: { order_id?: string };
}

export default async function VerifyPaymentPage({ searchParams }: PageProps) {
    const orderId = searchParams.order_id;

    if (!orderId) {
        redirect("/orders");
    }

    // Fetch order from database
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order) {
        redirect("/orders");
    }

    // If payment method is COD, redirect to orders
    if (order.paymentMethod === "COD") {
        redirect(`/orders?placed=${orderId}`);
    }

    // Verify payment status with Cashfree
    let paymentStatus = "PENDING";
    let paymentVerified = false;

    try {
        if (order) {
            const response = await cashfree.PGOrderFetchPayments(orderId);

            if (response.data && response.data.length > 0) {
                const latestPayment = response.data[0];
                paymentStatus = latestPayment.payment_status || "PENDING";

                if (paymentStatus === "SUCCESS") {
                    paymentVerified = true;

                    // If it was just marked PAID, push to Shiprocket and decrement stock
                    if (order.paymentStatus !== "PAID") {
                        await prisma.$transaction(async (tx) => {
                            await tx.order.update({
                                where: { id: orderId },
                                data: {
                                    paymentStatus: "PAID",
                                    paymentId: String(latestPayment.cf_payment_id),
                                    status: "Accepted"
                                },
                            });
                            for (const item of order.orderItems) {
                                await tx.product.update({
                                    where: { id: item.productId },
                                    data: { stock: { decrement: item.quantity } },
                                });
                            }
                        });

                        await pushOrderToShiprocket(orderId);
                        
                        // Send confirmation email
                        await sendOrderStatusEmail(order as any, "Accepted");
                    }
                } else if (["FAILED", "CANCELLED", "USER_DROPPED", "VOID"].includes(paymentStatus)) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            paymentStatus: "FAILED",
                            status: "Rejected"
                        },
                    });
                }
            }
        }
    } catch (error) {
        console.error("Payment verification error:", error);
    }

    const isFailure = ["FAILED", "CANCELLED", "USER_DROPPED", "VOID"].includes(paymentStatus);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-10 pb-20">
            <div className="card-rounded max-w-md w-full p-8 text-center bg-white shadow-2xl relative overflow-hidden border border-gray-100">
                {paymentVerified ? (
                    <>
                        <ClearCartClient />
                        {/* Decorative Background for Paytm/GPay Style */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#48C08A]/10 to-transparent pointer-events-none" />

                        {/* Animated Green Checkmark */}
                        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
                            {/* Outer Ping */}
                            <div className="absolute inset-0 rounded-full bg-[#48C08A] opacity-20 animate-ping" />
                            {/* Inner Circle */}
                            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#48C08A] to-[#2fac6f] shadow-2xl shadow-[#48C08A]/40 flex-shrink-0 transition-transform hover:scale-105 duration-300 transform animate-in zoom-in-50">
                                <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
                                <Sparkles className="absolute -top-1 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
                            </div>
                        </div>

                        <h2 className="mb-2 text-3xl font-black text-gray-900 tracking-tight">Payment Successful!</h2>
                        <p className="mb-8 text-gray-600 font-medium">
                            Your order has been confirmed securely.
                            <br />
                            <span className="text-sm font-mono text-gray-400 mt-2 inline-block bg-gray-50 px-3 py-1 rounded-md border border-gray-100">TXNID: {orderId}</span>
                        </p>
                        <a
                            href={`/orders?placed=${orderId}`}
                            className="inline-flex w-full justify-center items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-indigo-500/30"
                        >
                            View Order Details
                        </a>
                    </>
                ) : isFailure ? (
                    <>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Unsuccessful</h2>
                        <p className="mb-6 text-gray-600">
                            {paymentStatus === "USER_DROPPED" 
                                ? "You closed the payment window before completing the transaction." 
                                : "Unfortunately, your payment could not be processed."} Please try again.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="/checkout"
                                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700"
                            >
                                Try Again
                            </a>
                            <a
                                href="/orders"
                                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                View Orders
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment is Pending</h2>
                        <p className="mb-6 text-gray-600">
                            We are waiting for final confirmation from your bank or Cashfree terminal. This can take a few moments.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

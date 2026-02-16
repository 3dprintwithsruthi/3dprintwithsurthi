/**
 * Payment Verification Page - Verifies Cashfree payment status
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import cashfree from "@/lib/cashfree";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
        if (order.paymentSessionId) {
            const response = await cashfree.PGOrderFetchPayments("2023-08-01", orderId);

            if (response.data && response.data.length > 0) {
                const latestPayment = response.data[0];
                paymentStatus = latestPayment.payment_status || "PENDING";

                if (paymentStatus === "SUCCESS") {
                    paymentVerified = true;

                    // Update order payment status
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            paymentStatus: "PAID",
                            paymentId: latestPayment.cf_payment_id,
                        },
                    });
                } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            paymentStatus: "FAILED",
                        },
                    });
                }
            }
        }
    } catch (error) {
        console.error("Payment verification error:", error);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 px-4">
            <div className="card-rounded max-w-md p-8 text-center">
                {paymentVerified ? (
                    <>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Successful!</h2>
                        <p className="mb-6 text-gray-600">
                            Your order has been confirmed. Order ID: <span className="font-mono text-sm">{orderId}</span>
                        </p>
                        <a
                            href={`/orders?placed=${orderId}`}
                            className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            View Order Details
                        </a>
                    </>
                ) : paymentStatus === "FAILED" || paymentStatus === "CANCELLED" ? (
                    <>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Failed</h2>
                        <p className="mb-6 text-gray-600">
                            Unfortunately, your payment could not be processed. Please try again or choose a different payment method.
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
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Verifying Payment</h2>
                        <p className="mb-6 text-gray-600">
                            Please wait while we confirm your payment status...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

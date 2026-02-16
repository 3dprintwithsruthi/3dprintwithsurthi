"use client";

/**
 * Cashfree Payment Page - Loads Cashfree Drop-in Checkout
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");

    useEffect(() => {
        if (!sessionId || !orderId) {
            setError("Invalid payment session");
            setLoading(false);
            return;
        }

        const initializePayment = async () => {
            try {
                // Load Cashfree SDK
                const cashfree = await load({
                    mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
                });

                if (!cashfree) {
                    throw new Error("Failed to load Cashfree SDK");
                }

                // Initialize checkout
                const checkoutOptions = {
                    paymentSessionId: sessionId,
                    returnUrl: `${window.location.origin}/orders/verify?order_id=${orderId}`,
                };

                cashfree.checkout(checkoutOptions).then((result: any) => {
                    if (result.error) {
                        console.error("Payment error:", result.error);
                        setError(result.error.message || "Payment failed");
                        setLoading(false);
                    }
                    if (result.redirect) {
                        console.log("Payment will redirect");
                    }
                    if (result.paymentDetails) {
                        console.log("Payment completed:", result.paymentDetails);
                    }
                });
            } catch (err) {
                console.error("Payment initialization error:", err);
                setError(err instanceof Error ? err.message : "Failed to initialize payment");
                setLoading(false);
            }
        };

        initializePayment();
    }, [sessionId, orderId]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 px-4">
                <div className="card-rounded max-w-md p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Error</h2>
                    <p className="mb-6 text-gray-600">{error}</p>
                    <button
                        onClick={() => router.push("/checkout")}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-700 hover:to-purple-700"
                    >
                        Return to Checkout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 px-4">
            <div className="card-rounded max-w-md p-8 text-center">
                {loading && (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Loading Payment Gateway</h2>
                        <p className="mb-6 text-gray-600">Please wait while we securely connect you to our payment partner...</p>
                        <div className="space-y-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <span>256-bit SSL Encryption</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                <CreditCard className="h-4 w-4 text-indigo-600" />
                                <span>PCI DSS Compliant</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

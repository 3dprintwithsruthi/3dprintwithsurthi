/**
 * Invoice/Receipt Page for Paid Orders
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { formatPrice, decimalToNumber } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    params: { orderId: string };
}

export default async function InvoicePage({ params }: PageProps) {
    const session = await getSession();
    if (!session) redirect("/login");

    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order) redirect("/orders");

    // Check if user owns this order or is admin
    const userId = (session.user as { id?: string })?.id;
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
    if (order.userId !== userId && !isAdmin) {
        redirect("/orders");
    }

    // Only show invoice for paid orders
    if (order.paymentStatus !== "PAID") {
        redirect(`/orders?placed=${order.id}`);
    }

    const subtotal = decimalToNumber(order.subtotal);
    const discount = decimalToNumber(order.discount);
    const tax = decimalToNumber(order.tax);
    const shipping = decimalToNumber(order.shipping);
    const total = decimalToNumber(order.totalAmount);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 py-12 print:bg-white">
            <div className="mx-auto max-w-4xl px-4">
                {/* Print Button */}
                <div className="mb-4 flex justify-end print:hidden">
                    <PrintButton />
                </div>

                {/* Invoice */}
                <div className="card-rounded bg-white p-8 shadow-2xl print:shadow-none print:border print:border-gray-300">
                    {/* Header */}
                    <div className="mb-8 flex items-start justify-between border-b pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Invoice #: <span className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Date: {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                3D Print with Sruthi
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">Custom 3D Printing Services</p>
                            <p className="text-sm text-gray-600">India</p>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="font-semibold text-green-900">Payment Successful</span>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                        <h3 className="mb-2 font-semibold text-gray-900">Bill To:</h3>
                        <div className="rounded-lg bg-gray-50 p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">{order.address}</pre>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                        <h3 className="mb-4 font-semibold text-gray-900">Order Items:</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Item</th>
                                    <th className="pb-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">Price</th>
                                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderItems.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-3 text-sm text-gray-900">{item.product.name}</td>
                                        <td className="py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                                        <td className="py-3 text-right text-sm text-gray-700">
                                            {formatPrice(decimalToNumber(item.price))}
                                        </td>
                                        <td className="py-3 text-right text-sm font-semibold text-gray-900">
                                            {formatPrice(decimalToNumber(item.price) * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="ml-auto max-w-sm space-y-2">
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Subtotal:</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm font-semibold text-green-600">
                                <span>Discount {order.couponCode && `(${order.couponCode})`}:</span>
                                <span>- {formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Tax (GST 18%):</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Shipping:</span>
                            <span>{formatPrice(shipping)}</span>
                        </div>
                        <div className="border-t-2 border-gray-300 pt-2">
                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                <span>Total Amount:</span>
                                <span className="text-indigo-600">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-8 rounded-lg bg-indigo-50 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-700">Payment Method:</span>
                                <p className="text-gray-900">Online Payment</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Payment ID:</span>
                                <p className="font-mono text-gray-900">{order.paymentId || "N/A"}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Order Status:</span>
                                <p className="font-semibold text-indigo-600">{order.status}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Payment Status:</span>
                                <p className="font-semibold text-green-600">PAID</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 border-t pt-6 text-center text-sm text-gray-600">
                        <p className="font-semibold">Thank you for your business!</p>
                        <p className="mt-2">For any queries, please contact us at support@3dprintwithsruthi.com</p>
                        <p className="mt-4 text-xs text-gray-500">
                            This is a computer-generated invoice and does not require a signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

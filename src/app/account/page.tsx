/**
 * User Account Page - Profile, Orders, Delete Account
 */
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountDeleteButton } from "./delete-button";
import { Package, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const session = await getSession();
    if (!session || !session.user?.email) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        }
    });

    if (!user) redirect("/login");

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="card-rounded p-6 bg-white shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.role}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            {user && (user as any).phone && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                                    <p className="text-gray-900">{(user as any).phone}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Member Since</label>
                                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                            <AccountDeleteButton />
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Recent Orders
                        </h2>
                        <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                            View All Orders
                        </Link>
                    </div>

                    {user.orders.length > 0 ? (
                        <div className="space-y-4">
                            {user.orders.map((order) => (
                                <Link key={order.id} href={`/orders?placed=${order.id}`} className="block">
                                    <div className="card-rounded p-4 bg-white hover:shadow-md transition border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-mono text-gray-500">#{order.id.slice(-8)}</span>
                                                <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No orders yet</p>
                            <Button asChild variant="ghost" className="mt-2 text-indigo-600 hover:bg-indigo-50">
                                <Link href="/products">Start Shopping</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
import { Package, User, ChevronRight, ShieldCheck, Mail, Calendar, Phone } from "lucide-react";

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
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">My Account</h1>
                        <p className="text-gray-500 text-lg">Manage your profile, settings, and view recent orders.</p>
                    </div>
                    {user.role === "ADMIN" && (
                        <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 shadow-md">
                            <Link href="/admin">Go to Admin Dashboard</Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">

                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                                        <span className="text-2xl font-black">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`h-2 w-2 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500' : 'bg-green-500'}`} />
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{user.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Email Address</label>
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{user.email}</p>
                                        </div>
                                    </div>
                                    {(user as any).phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Phone Number</label>
                                                <p className="text-sm font-semibold text-gray-900">{(user as any).phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Member Since</label>
                                            <p className="text-sm font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100">
                            <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                                Danger Zone
                            </h3>
                            <p className="text-xs text-red-600/80 mb-4 leading-relaxed">
                                Permanently delete your account and all associated data. This action cannot be reversed.
                            </p>
                            <AccountDeleteButton />
                        </div>
                    </div>

                    {/* Right Column - Recent Orders */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Orders</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Your latest purchases and print jobs</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="rounded-full border-gray-200 text-gray-600 font-semibold hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50">
                                    <Link href="/orders">
                                        View All History
                                    </Link>
                                </Button>
                            </div>

                            {user.orders.length > 0 ? (
                                <div className="space-y-4">
                                    {user.orders.map((order) => {
                                        let statusColor = 'bg-blue-50 text-blue-700 border-blue-100';
                                        if (order.status === 'Delivered') statusColor = 'bg-green-50 text-green-700 border-green-100';
                                        if (order.status === 'Rejected' || order.status === 'Cancelled') statusColor = 'bg-red-50 text-red-700 border-red-100';
                                        if (order.status === 'Paid') statusColor = 'bg-purple-50 text-purple-700 border-purple-100';

                                        return (
                                            <Link key={order.id} href={`/orders?placed=${order.id}`} className="block group">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-indigo-200 transition-all duration-300 group-hover:shadow-md">

                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">#{order.id.slice(-8)}</span>
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-600">
                                                                {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-gray-100 pt-4 sm:pt-0 mt-4 sm:mt-0 border-t sm:border-t-0">
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                                                            <p className="font-black text-gray-900 text-lg tracking-tight">{formatPrice(order.totalAmount)}</p>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-colors">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </div>
                                                    </div>

                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                        <Package className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
                                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't placed any 3D print orders yet. Explore our catalog to get started.</p>
                                    <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-sm">
                                        <Link href="/products">Browse Catalog</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Admin Coupon Management Page
 */
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { CouponManagementClient } from "./coupon-management-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCouponsPage() {
    const session = await getSession();
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
        redirect("/");
    }

    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { orders: true },
            },
        },
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
                <p className="mt-2 text-gray-600">Create and manage discount coupons for your store</p>
            </div>
            <CouponManagementClient coupons={coupons} />
        </div>
    );
}

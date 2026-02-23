import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { createCouponAction, deleteCouponAction } from "@/app/actions/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function AdminCouponsPage() {
    const session = await getSession();
    if ((session?.user as any)?.role !== "ADMIN") redirect("/");

    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="card-rounded p-6">
                    <h2 className="text-xl font-semibold mb-2">Create New Coupon</h2>
                    <p className="text-sm text-gray-500 mb-4">Add a new discount code for your customers.</p>
                    <form action={async (formData) => {
                        "use server";
                        await createCouponAction(formData);
                    }} className="space-y-4">
                        <div>
                            <Label htmlFor="code">Coupon Code</Label>
                            <Input id="code" name="code" placeholder="e.g. SAVE20" required className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="discountValue">Discount Value (₹)</Label>
                            <Input id="discountValue" name="discountValue" type="number" min="1" step="0.01" placeholder="e.g. 100" required className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full">Create Coupon</Button>
                    </form>
                </div>

                <div className="card-rounded p-6">
                    <h2 className="text-xl font-semibold mb-6">Active Coupons</h2>
                    {coupons.length === 0 ? (
                        <p className="text-sm text-gray-500">No coupons created yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900">{coupon.code}</p>
                                        <p className="text-sm text-green-600">-{formatPrice(Number(coupon.discountValue))}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Created: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(coupon.createdAt)}
                                        </p>
                                    </div>
                                    <form action={async () => {
                                        "use server";
                                        await deleteCouponAction(coupon.id);
                                    }}>
                                        <Button variant="destructive" size="sm" type="submit">Delete</Button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

/**
 * Coupon Management Client Component
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    createCouponAction,
    toggleCouponStatusAction,
    deleteCouponAction
} from "@/app/actions/coupon";
import {
    Tag,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Calendar,
    TrendingUp,
    Percent,
    DollarSign
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Coupon = {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: any;
    minOrderValue: any;
    maxDiscount: any;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    expiresAt: Date | null;
    createdAt: Date;
    _count: {
        orders: number;
    };
};

export function CouponManagementClient({ coupons }: { coupons: Coupon[] }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleCreateCoupon(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await createCouponAction(formData);

        if (result.success) {
            setShowCreateForm(false);
            router.refresh();
        } else {
            setError(result.error || "Failed to create coupon");
        }

        setLoading(false);
    }

    async function handleToggleStatus(couponId: string, isActive: boolean) {
        await toggleCouponStatusAction(couponId, !isActive);
        router.refresh();
    }

    async function handleDelete(couponId: string) {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        await deleteCouponAction(couponId);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            {/* Create Coupon Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Coupon
                </Button>
            </div>

            {/* Create Coupon Form */}
            {showCreateForm && (
                <div className="card-rounded p-6">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Create New Coupon</h2>
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <form action={handleCreateCoupon} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="SAVE20"
                                    required
                                    className="mt-1.5 uppercase"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="20% off on all orders"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discountType">Discount Type *</Label>
                                <select
                                    id="discountType"
                                    name="discountType"
                                    required
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="discountValue">Discount Value *</Label>
                                <Input
                                    id="discountValue"
                                    name="discountValue"
                                    type="number"
                                    step="0.01"
                                    placeholder="20"
                                    required
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="minOrderValue">Min Order Value (₹)</Label>
                                <Input
                                    id="minOrderValue"
                                    name="minOrderValue"
                                    type="number"
                                    step="0.01"
                                    placeholder="500"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                                <Input
                                    id="maxDiscount"
                                    name="maxDiscount"
                                    type="number"
                                    step="0.01"
                                    placeholder="100"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="usageLimit">Usage Limit</Label>
                                <Input
                                    id="usageLimit"
                                    name="usageLimit"
                                    type="number"
                                    placeholder="100 (leave empty for unlimited)"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="expiresAt">Expires At</Label>
                                <Input
                                    id="expiresAt"
                                    name="expiresAt"
                                    type="datetime-local"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                {loading ? "Creating..." : "Create Coupon"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateForm(false)}
                                className="rounded-lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                    <div
                        key={coupon.id}
                        className={`card-rounded p-6 ${!coupon.isActive ? "opacity-60" : ""
                            }`}
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-indigo-600" />
                                <span className="font-mono text-lg font-bold text-gray-900">
                                    {coupon.code}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                    className="text-gray-500 hover:text-gray-700"
                                    title={coupon.isActive ? "Deactivate" : "Activate"}
                                >
                                    {coupon.isActive ? (
                                        <ToggleRight className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {coupon.description && (
                            <p className="mb-3 text-sm text-gray-600">{coupon.description}</p>
                        )}

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                {coupon.discountType === "PERCENTAGE" ? (
                                    <Percent className="h-4 w-4 text-indigo-600" />
                                ) : (
                                    <DollarSign className="h-4 w-4 text-indigo-600" />
                                )}
                                <span className="font-semibold text-gray-900">
                                    {coupon.discountType === "PERCENTAGE"
                                        ? `${coupon.discountValue}% OFF`
                                        : `₹${coupon.discountValue} OFF`}
                                </span>
                            </div>

                            {coupon.minOrderValue && (
                                <div className="text-gray-600">
                                    Min Order: {formatPrice(parseFloat(coupon.minOrderValue.toString()))}
                                </div>
                            )}

                            {coupon.maxDiscount && coupon.discountType === "PERCENTAGE" && (
                                <div className="text-gray-600">
                                    Max Discount: {formatPrice(parseFloat(coupon.maxDiscount.toString()))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="h-4 w-4" />
                                <span>
                                    Used: {coupon.usedCount}
                                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
                                </span>
                            </div>

                            {coupon.expiresAt && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <span
                                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${coupon.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {coupon.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {coupons.length === 0 && !showCreateForm && (
                <div className="card-rounded p-12 text-center">
                    <Tag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No coupons yet</h3>
                    <p className="mt-2 text-gray-600">Create your first coupon to offer discounts to customers</p>
                </div>
            )}
        </div>
    );
}

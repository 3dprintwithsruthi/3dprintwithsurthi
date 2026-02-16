"use server";

/**
 * Coupon management actions - Admin only
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { Decimal } from "@prisma/client/runtime/library";

export type CouponActionResult = {
    success: boolean;
    error?: string;
    couponId?: string;
};

/** Create a new coupon */
export async function createCouponAction(formData: FormData): Promise<CouponActionResult> {
    const session = await getSession();
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Only admin can create coupons" };
    }

    try {
        const code = (formData.get("code") as string)?.toUpperCase();
        const description = formData.get("description") as string;
        const discountType = formData.get("discountType") as string;
        const discountValue = parseFloat(formData.get("discountValue") as string);
        const minOrderValue = formData.get("minOrderValue") as string;
        const maxDiscount = formData.get("maxDiscount") as string;
        const usageLimit = formData.get("usageLimit") as string;
        const expiresAt = formData.get("expiresAt") as string;

        if (!code || !discountType || !discountValue) {
            return { success: false, error: "Code, discount type, and discount value are required" };
        }

        // Check if code already exists
        const existing = await prisma.coupon.findUnique({
            where: { code },
        });

        if (existing) {
            return { success: false, error: "Coupon code already exists" };
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                description: description || null,
                discountType,
                discountValue: new Decimal(discountValue),
                minOrderValue: minOrderValue ? new Decimal(parseFloat(minOrderValue)) : null,
                maxDiscount: maxDiscount ? new Decimal(parseFloat(maxDiscount)) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true,
            },
        });

        revalidatePath("/admin/coupons");
        return { success: true, couponId: coupon.id };
    } catch (error) {
        console.error("Create coupon error:", error);
        return { success: false, error: "Failed to create coupon" };
    }
}

/** Update coupon status */
export async function toggleCouponStatusAction(
    couponId: string,
    isActive: boolean
): Promise<CouponActionResult> {
    const session = await getSession();
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Only admin can update coupons" };
    }

    try {
        await prisma.coupon.update({
            where: { id: couponId },
            data: { isActive },
        });

        revalidatePath("/admin/coupons");
        return { success: true, couponId };
    } catch (error) {
        console.error("Toggle coupon error:", error);
        return { success: false, error: "Failed to update coupon" };
    }
}

/** Delete coupon */
export async function deleteCouponAction(couponId: string): Promise<CouponActionResult> {
    const session = await getSession();
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Only admin can delete coupons" };
    }

    try {
        await prisma.coupon.delete({
            where: { id: couponId },
        });

        revalidatePath("/admin/coupons");
        return { success: true, couponId };
    } catch (error) {
        console.error("Delete coupon error:", error);
        return { success: false, error: "Failed to delete coupon" };
    }
}

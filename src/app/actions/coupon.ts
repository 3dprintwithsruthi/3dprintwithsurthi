"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function validateCouponAction(code: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        return { success: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
        return { success: false, error: "This coupon is no longer active" };
    }

    return { success: true, discountValue: Number(coupon.discountValue) };
}

export async function createCouponAction(formData: FormData) {
    const session = await getSession();
    if ((session?.user as any)?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const code = formData.get("code") as string;
    const discountValue = Number(formData.get("discountValue"));

    if (!code || isNaN(discountValue) || discountValue <= 0) {
        return { success: false, error: "Invalid input" };
    }

    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountValue,
                isActive: true,
            }
        });
        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create coupon or code already exists" };
    }
}

export async function deleteCouponAction(id: string) {
    const session = await getSession();
    if ((session?.user as any)?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.coupon.delete({ where: { id } });
        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete coupon" };
    }
}

export async function toggleCouponStatusAction(id: string, isActive: boolean) {
    const session = await getSession();
    if ((session?.user as any)?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.coupon.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update coupon status" };
    }
}

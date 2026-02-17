"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

/**
 * Delete current user account
 * Warning: This removes all data associated with the user
 */
export async function deleteAccountAction(): Promise<{ success: boolean; error?: string }> {
    const session = await getSession();
    if (!session || !session.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.user.delete({
            where: { email: session.user.email },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}

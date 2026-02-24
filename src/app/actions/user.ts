"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";

export async function deleteAccountAction() {
    const session = await getSession();

    if (!session?.user?.email) {
        return { success: false, error: "Not logged in" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Attempt to delete user. Prisma should cascade delete orders if configured in schema.
        await prisma.user.delete({
            where: { id: user.id },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function adminDeleteUserAction(userId: string) {
    const session = await getSession();

    if ((session?.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (user.role === "ADMIN") {
            return { success: false, error: "Cannot delete another admin" };
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Internal server error" };
    }
}

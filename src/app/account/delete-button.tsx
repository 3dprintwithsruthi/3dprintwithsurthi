"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { deleteAccountAction } from "@/app/actions/user";
import { Trash2 } from "lucide-react";

export function AccountDeleteButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete() {
        if (!confirm("Are you sure you want to delete your account? This will permanently remove all your data including orders. This action cannot be undone.")) return;

        startTransition(async () => {
            // First try to delete account on server
            const result = await deleteAccountAction();

            if (result.success) {
                // Then sign out client-side
                await signOut({ redirect: false });
                // Redirect to home
                router.push("/");
                router.refresh();
            } else {
                alert("Failed to delete account " + (result.error || ""));
            }
        });
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full justify-start text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-100"
        >
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? "Deleting..." : "Delete Account"}
        </Button>
    );
}

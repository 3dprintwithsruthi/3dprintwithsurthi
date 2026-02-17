"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/actions/order-delete";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete() {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

        startTransition(async () => {
            const result = await deleteOrderAction(orderId);
            if (result.success) {
                // Optionally show success toast
                router.refresh();
            } else {
                alert("Failed to delete order");
            }
        });
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
            title="Delete Order"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}

"use client";

/**
 * Admin only – update order status; triggers email via server action
 * Has loading state and optimistic UI to prevent double-clicks
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/app/actions/order";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Accepted",
  "InProgress",
  "Shipped",
  "Delivered",
  "Rejected",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "⏳ Pending",
  Accepted: "✅ Accepted",
  InProgress: "🖨️ In Progress",
  Shipped: "🚚 Shipped",
  Delivered: "📦 Delivered",
  Rejected: "❌ Rejected",
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState<OrderStatus>(currentStatus);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === optimisticStatus) return;

    const previous = optimisticStatus;
    setOptimisticStatus(newStatus); // Optimistic update

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (!result.success) {
        console.error("Status update failed:", result.error);
        setOptimisticStatus(previous); // Revert on failure
        alert(`Failed to update status: ${result.error}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="relative flex items-center gap-2">
      <select
        value={optimisticStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
          isPending
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-200 bg-white text-gray-800 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-300 focus:outline-none cursor-pointer"
        }`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {isPending && (
        <svg className="h-4 w-4 animate-spin text-indigo-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
    </div>
  );
}

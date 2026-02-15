"use client";

/**
 * Admin only – update order status; triggers email via server action
 */
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

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as OrderStatus;
    if (status === currentStatus) return;
    await updateOrderStatusAction(orderId, status);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

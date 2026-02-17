/**
 * Admin order management – list all, view custom inputs, update status
 */
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { OrderStatusSelect } from "./order-status-select";
import { DeleteOrderButton } from "./delete-order-button";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      orderItems: { include: { product: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-gray-600">Update status to trigger email to customer.</p>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card-rounded overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-gray-50/50 p-4">
              <div>
                <span className="font-mono text-sm text-gray-500">#{order.id.slice(-8)}</span>
                <p className="font-medium">
                  {order.user.name} – {order.user.email}
                  {(order.user as any).phone && <span className="ml-2 text-gray-600 font-medium">({(order.user as any).phone})</span>}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString()} · {formatPrice(order.totalAmount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                <DeleteOrderButton orderId={order.id} />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">Address: {order.address}</p>
              <ul className="mt-4 space-y-2">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>
                      {item.product.name} × {item.quantity} @ {formatPrice(item.price)}
                      {item.customInput && typeof item.customInput === "object" && Object.keys(item.customInput).length > 0 && (
                        <span className="ml-2 text-gray-500">
                          Custom: {JSON.stringify(item.customInput)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <p className="py-12 text-center text-gray-500">No orders yet.</p>
      )}
    </div>
  );
}

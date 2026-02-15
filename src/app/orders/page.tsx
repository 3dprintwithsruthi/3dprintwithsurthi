/**
 * Order history – user's orders, status; fully SSR
 */
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.email || !(session.user as { id?: string }).id) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: { include: { product: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {params.placed && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Order placed successfully.
        </p>
      )}
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card-rounded overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
                <div>
                  <span className="font-mono text-sm text-gray-500">#{order.id.slice(-8)}</span>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} – {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="divide-y p-4">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span>
                      {item.product.name} × {item.quantity}
                      {item.customInput && Object.keys(item.customInput as object).length > 0 && (
                        <span className="ml-2 text-gray-500">
                          ({JSON.stringify(item.customInput)})
                        </span>
                      )}
                    </span>
                    <span>{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

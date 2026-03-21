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
      user: { select: { id: true, name: true, email: true } },
      orderItems: { include: { product: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-gray-600">Update status to trigger email to customer.</p>

      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="card-rounded overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-gray-50/50 p-4">
              <div>
                <span className="font-mono text-sm text-gray-500">#{order.id.slice(-8)}</span>
                <p className="font-medium">
                  {order.user.name} – {order.user.email}
                  {(order.user as any).phone && <span className="ml-2 text-gray-600 font-medium">({(order.user as any).phone})</span>}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(order.createdAt).toLocaleString()} · {formatPrice(order.totalAmount)}
                </p>
                <div className="flex gap-2 items-center text-xs font-bold">
                  <span className={`px-2.5 py-1 rounded ${order.paymentMethod === 'ONLINE' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                    {order.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                <DeleteOrderButton orderId={order.id} />
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Shipping Address</h4>
                {(() => {
                  try {
                    const addr = JSON.parse(order.address);
                    return (
                      <div className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 shadow-sm inline-block min-w-[280px]">
                        <p className="font-bold text-gray-900 text-base">{addr.fullName}</p>
                        <hr className="my-2 border-gray-100" />
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>{addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span></p>
                        <p className="pt-2 mt-2 border-t border-gray-100 font-medium text-gray-900 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {addr.phone}
                        </p>
                      </div>
                    );
                  } catch (e) {
                    return <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100">{order.address}</p>;
                  }
                })()}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-6 mb-3">Order Items</h4>
              <ul className="space-y-3">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{item.product.name}</span> 
                      <span className="text-gray-500 mx-2">× {item.quantity}</span>
                      
                      {item.customInput && typeof item.customInput === "object" && Object.keys(item.customInput).length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-200">
                          {Object.entries(item.customInput).map(([key, val]) => (
                            <div key={key} className="text-sm">
                              <span className="text-gray-500">{key}:</span> <span className="font-medium text-indigo-700">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {formatPrice(item.price)}
                    </div>
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

import { getShiprocketToken } from "@/lib/shiprocket/auth";
import { ShiprocketOrderActions } from "./orders-table";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function ShiprocketDashboard() {
  let authStatus = false;
  let authError = "";
  try {
    const token = await getShiprocketToken();
    if (token) authStatus = true;
  } catch (error: any) {
    authError = error.message;
  }

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: true,
        orderItems: {
          include: { product: true },
        },
      },
    });
  } catch (error: any) {
    console.error("Prisma Database Connection Failed:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Shiprocket Dashboard</h1>
        <p className="text-gray-500">
          Manage your Shiprocket shipments, generate AWBs, and track orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${authStatus ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">API Status</p>
              <h3 className="text-xl font-bold">{authStatus ? "Connected" : "Disconnected"}</h3>
              {!authStatus && <p className="text-xs text-red-500 truncate max-w-[200px]" title={authError}>{authError}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Ready to Ship Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Shiprocket ID</th>
                <th className="px-6 py-3 font-medium">AWB Number</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono">
                    <span className="truncate block max-w-[100px]" title={order.id}>{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    {order.user.name} <br />
                    <span className="text-xs text-gray-500">{order.user.email}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    ₹{order.totalAmount.toString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {order.shiprocketOrderId || "-"}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    {order.awbNumber || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ShiprocketOrderActions 
                      orderId={order.id}
                      shiprocketOrderId={order.shiprocketOrderId}
                      shiprocketShipmentId={order.shiprocketShipmentId}
                      awbNumber={order.awbNumber}
                      address={order.address}
                    />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

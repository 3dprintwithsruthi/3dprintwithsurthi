/**
 * Admin product analytics – most sold, revenue per product, low stock
 */
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function AdminAnalyticsPage() {
  const [productsWithOrders, lowStock] = await Promise.all([
    prisma.product.findMany({
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 10, gt: 0 } },
      orderBy: { stock: "asc" },
    }),
  ]);

  const withStats = productsWithOrders.map((p) => {
    const sold = p.orderItems.reduce((s, i) => s + i.quantity, 0);
    const revenue = p.orderItems.reduce(
      (s, i) => s + Number(i.price) * i.quantity,
      0
    );
    return { ...p, sold, revenue };
  });
  const mostSold = [...withStats].sort((a, b) => b.sold - a.sold).slice(0, 10);
  const byRevenue = [...withStats].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-gray-600">Most sold, revenue per product, low stock.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card-rounded p-6">
          <h2 className="font-semibold text-gray-900">Most sold (top 10)</h2>
          <ul className="mt-4 space-y-2">
            {mostSold.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span>{p.sold} sold</span>
              </li>
            ))}
            {mostSold.length === 0 && <li className="text-gray-500">No sales yet.</li>}
          </ul>
        </div>
        <div className="card-rounded p-6">
          <h2 className="font-semibold text-gray-900">Revenue by product (top 10)</h2>
          <ul className="mt-4 space-y-2">
            {byRevenue.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span>{formatPrice(p.revenue)}</span>
              </li>
            ))}
            {byRevenue.length === 0 && <li className="text-gray-500">No revenue yet.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8 card-rounded p-6">
        <h2 className="font-semibold text-gray-900">Low stock warning (&lt; 10)</h2>
        <ul className="mt-4 space-y-2">
          {lowStock.map((p) => (
            <li key={p.id} className="flex justify-between text-sm">
              <Link href={`/admin/products/${p.id}`} className="font-medium text-indigo-600 hover:underline">
                {p.name}
              </Link>
              <span className="text-amber-600 font-medium">{p.stock} left</span>
            </li>
          ))}
          {lowStock.length === 0 && <li className="text-gray-500">No low stock items.</li>}
        </ul>
      </div>
    </div>
  );
}

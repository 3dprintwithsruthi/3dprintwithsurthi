import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media";
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  // Aggregate Metrics over all time (in a real app you'd filter by date range)
  const [siteMetrics, orders, revenueResult, mostViewedProducts] = await Promise.all([
    (prisma as any).siteMetric.findMany({ select: { visits: true } }).catch(() => []),
    prisma.order.count({ where: { status: { not: "Rejected" } } }),
    prisma.order.aggregate({
      where: { status: { not: "Rejected" } },
      _sum: { totalAmount: true },
    }),
    (prisma as any).product.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, name: true, images: true, views: true, price: true, _count: { select: { orderItems: true } } }
    }).catch(() => []),
  ]);

  const totalSessions = siteMetrics.reduce((sum: number, metric: any) => sum + metric.visits, 0) || 1; // 1 to prevent div by 0
  const totalSales = Number(revenueResult._sum.totalAmount || 0);
  const totalOrders = orders;
  const conversionRate = ((totalOrders / totalSessions) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">Track your store's traffic and conversions.</p>
      </div>

      {/* Shopify-like unified stats card */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x p-2">

        {/* Sessions */}
        <div className="flex-1 p-4 hover:bg-gray-50 transition cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-600 border-b border-dashed border-gray-300 inline-block">Sessions</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{totalSessions === 1 && siteMetrics.length === 0 ? 0 : totalSessions}</h3>
                <span className="flex items-center text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="h-4 w-4 mr-0.5" /> 100%
                </span>
              </div>
            </div>
            {/* Dummy Sparkline */}
            <div className="h-10 w-24 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full stroke-blue-500 fill-blue-50" preserveAspectRatio="none">
                <path d="M0,40 L0,35 L10,38 L20,30 L30,35 L40,10 L50,30 L60,32 L70,30 L80,25 L90,28 L100,20 L100,40 Z" strokeWidth="0" />
                <polyline points="0,35 10,38 20,30 30,35 40,10 50,30 60,32 70,30 80,25 90,28 100,20" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="flex-1 p-4 hover:bg-gray-50 transition cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-600 border-b border-dashed border-gray-300 inline-block">Total sales</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</h3>
                <span className="flex items-center text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="h-4 w-4 mr-0.5" /> 100%
                </span>
              </div>
            </div>
            {/* Dummy Sparkline */}
            <div className="h-10 w-24 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full stroke-blue-500 fill-blue-50" preserveAspectRatio="none">
                <path d="M0,40 L0,38 L15,38 L25,15 L30,38 L100,38 L100,40 Z" strokeWidth="0" />
                <polyline points="0,38 15,38 25,15 30,38 100,38" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="flex-1 p-4 hover:bg-gray-50 transition cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-600 border-b border-dashed border-gray-300 inline-block">Orders</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                <span className="flex items-center text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="h-4 w-4 mr-0.5" /> 100%
                </span>
              </div>
            </div>
            {/* Dummy Sparkline */}
            <div className="h-10 w-24 flex items-end">
              <svg viewBox="0 0 100 40" className="w-full h-full stroke-blue-500 fill-blue-50" preserveAspectRatio="none">
                <path d="M0,40 L0,39 L40,39 L45,10 L50,39 L100,39 L100,40 Z" strokeWidth="0" />
                <polyline points="0,39 40,39 45,10 50,39 100,39" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="flex-1 p-4 hover:bg-gray-50 transition cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-600 border-b border-dashed border-gray-300 inline-block">Conversion rate</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{isNaN(Number(conversionRate)) ? "0.0" : conversionRate}%</h3>
                <span className="flex items-center text-sm font-medium text-gray-500">
                  --
                </span>
              </div>
            </div>
            {/* Dummy Sparkline */}
            <div className="h-10 w-24 flex items-start justify-end flex-col relative">
              <AlertCircle className="h-4 w-4 text-gray-400 absolute top-[-5px] right-6" />
              <ChevronDown className="h-4 w-4 text-gray-400 absolute top-[-5px] right-0" />
              <svg viewBox="0 0 100 40" className="w-full h-8 mt-2 stroke-blue-500 fill-blue-50" preserveAspectRatio="none">
                <path d="M0,40 L0,39 L10,39 L15,35 L20,39 L100,39 L100,40 Z" strokeWidth="0" />
                <polyline points="0,39 10,39 15,35 20,39 100,39" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Most Viewed Products Table */}
      <h2 className="text-lg font-bold text-gray-900 mt-10 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-indigo-600" /> Most Viewed Products
      </h2>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total Views</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Units Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mostViewedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No product views tracked yet. Data will appear as users browse your store.
                </td>
              </tr>
            ) : (
              mostViewedProducts.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border">
                        {p.images && p.images[0] ? (
                          <Image src={getOptimizedImageUrl(p.images[0])} fill sizes="40px" alt={p.name} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">{formatPrice(p.price)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">{p.views} <span className="text-xs text-gray-400 font-normal ml-1">views</span></td>
                  <td className="text-right py-3 px-4 text-gray-600">{p._count.orderItems}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

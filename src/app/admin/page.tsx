/**
 * Admin dashboard – Admin Dashboard title, Add Product, KPI cards, quick actions
 */
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { formatPrice } from "@/lib/utils";
import { Package, Users, ShoppingBag, IndianRupee, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [productCount, userCount, orderCount, revenueResult] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { not: "Rejected" } },
      _sum: { totalAmount: true },
    }),
  ]);

  const revenue = Number(revenueResult._sum.totalAmount ?? 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage your e-commerce platform</p>
        </div>
        <Button asChild className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-rounded relative p-6">
          <div className="absolute right-4 top-4 rounded-lg bg-blue-100 p-2">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{productCount}</p>
        </div>
        <div className="card-rounded relative p-6">
          <div className="absolute right-4 top-4 rounded-lg bg-green-100 p-2">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>
        <div className="card-rounded relative p-6">
          <div className="absolute right-4 top-4 rounded-lg bg-purple-100 p-2">
            <ShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orderCount}</p>
        </div>
        <div className="card-rounded relative p-6">
          <div className="absolute right-4 top-4 rounded-lg bg-amber-100 p-2">
            <IndianRupee className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">{formatPrice(revenue)}</p>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Link href="/admin/products">
          <div className="card-rounded flex flex-col items-center p-8 text-center transition hover:shadow-xl">
            <div className="rounded-xl bg-blue-100 p-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Manage Products</h3>
            <p className="mt-1 text-sm text-gray-500">Add, edit, delete products</p>
          </div>
        </Link>
        <Link href="/admin/customers">
          <div className="card-rounded flex flex-col items-center p-8 text-center transition hover:shadow-xl">
            <div className="rounded-xl bg-green-100 p-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">View Customers</h3>
            <p className="mt-1 text-sm text-gray-500">See all customer data</p>
          </div>
        </Link>
        <Link href="/admin/analytics">
          <div className="card-rounded flex flex-col items-center p-8 text-center transition hover:shadow-xl">
            <div className="rounded-xl bg-amber-100 p-4">
              <BarChart3 className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Product performance</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

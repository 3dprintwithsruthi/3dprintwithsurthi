/**
 * Admin customer management – Customer Data grid of cards (avatar, name, email, orders, Active)
 */
import { prisma } from "@/lib/db";
import { Mail, Phone, Calendar, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customer Data</h1>
      <p className="mt-1 text-gray-600">Users and their order count.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, index) => (
          <div key={u.id} className="card-rounded p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-500">ID: {u.id.slice(-6)}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                {u.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                N/A
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 shrink-0 text-gray-400" />
                {u._count.orders} orders
              </li>
            </ul>
            <div className="mt-4">
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Active
              </span>
              {u.role === "ADMIN" && (
                <span className="ml-2 inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  Admin
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

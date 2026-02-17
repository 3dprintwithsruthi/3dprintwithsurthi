/**
 * Admin product management – list, add, edit, delete
 */
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteProductButton } from "./delete-product-button";
import { getOptimizedImageUrl } from "@/lib/media";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orderItems: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left text-sm font-medium text-gray-700">Image</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Stock</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Sold</th>
              <th className="p-3 text-right text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  {p.images[0] ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                      <Image src={getOptimizedImageUrl(p.images[0])} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <span className={p.stock < 10 ? "text-amber-600 font-medium" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">{p._count.orderItems}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/products/${p.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteProductButton productId={p.id} productName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <p className="py-12 text-center text-gray-500">No products. Add one to get started.</p>
      )}
    </div>
  );
}

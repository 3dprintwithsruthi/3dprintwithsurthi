/**
 * Product detail – images, video, description, price, stock, dynamic custom fields
 * Add to cart with custom input stored in OrderItem.customInput
 */
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { formatPrice } from "@/lib/utils";
import type { CustomFieldDef } from "@/types";
import { AddToCartSection } from "./add-to-cart-section";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const customFields = (product.customFields as CustomFieldDef[] | null) ?? [];
  const priceNum = Number(product.price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Media */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width:768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.slice(1, 5).map((url, i) => (
                <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
          {product.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                src={product.videoUrl}
                title="Product video"
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Info + Add to cart */}
        <div className="card-rounded p-6">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-2xl text-indigo-600 font-semibold">{formatPrice(product.price)}</p>
          {product.description && (
            <p className="mt-4 text-gray-600 whitespace-pre-wrap">{product.description}</p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Stock: {product.stock} {product.stock < 10 && product.stock > 0 && "(Low stock)"}
          </p>
          {product.stock === 0 && (
            <p className="mt-2 text-red-600 font-medium">Out of stock – cannot add to cart.</p>
          )}

          <AddToCartSection
            productId={product.id}
            name={product.name}
            price={priceNum}
            maxStock={product.stock}
            customFields={customFields}
            image={product.images[0]}
          />
        </div>
      </div>
    </div>
  );
}

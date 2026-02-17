/**
 * Product detail – images, video, description, price, stock, dynamic custom fields
 * Add to cart with custom input stored in OrderItem.customInput
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { CustomFieldDef } from "@/types";
import { AddToCartSection } from "./add-to-cart-section";
import { ProductGallery } from "./product-gallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product = null;

  try {
    product = await prisma.product.findUnique({ where: { id } });
  } catch (err) {
    console.error("Failed to fetch product:", err);
  }

  if (!product) notFound();

  const customFields = (product.customFields as CustomFieldDef[] | null) ?? [];
  const priceNum = Number(product.price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Media */}
        {/* Media */}
        <ProductGallery
          images={product.images}
          videoUrl={product.videoUrl}
          productName={product.name}
        />

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

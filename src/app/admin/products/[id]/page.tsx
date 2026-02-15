/**
 * Admin – edit product
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Edit product</h1>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          stock: product.stock,
          images: product.images,
          videoUrl: product.videoUrl ?? "",
          customFields: ((product.customFields as unknown) as import("@/types").CustomFieldDef[]) ?? [],
        }}
      />
    </div>
  );
}

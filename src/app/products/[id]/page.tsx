/**
 * Product detail – images, video, description, price, stock, dynamic custom fields
 * Add to cart with custom input stored in OrderItem.customInput
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { CustomFieldDef } from "@/types";
import { AddToCartSection } from "./add-to-cart-section";
import { getOptimizedImageUrl } from "@/lib/media";
import { ProductGallery } from "./product-gallery";
import { ShieldCheck, Truck, Package, RotateCcw } from "lucide-react";
import Link from "next/link";

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
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 items-start">

          {/* Left Column - Media Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              videoUrl={product.videoUrl}
              productName={product.name}
            />
          </div>

          {/* Right Column - Info + Add to cart */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">

              {/* Product Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">{product.name}</h1>

                <div className="flex items-center gap-4 mb-6">
                  <p className="text-4xl font-black text-indigo-600 tracking-tight">{formatPrice(product.price)}</p>
                  {isOutOfStock ? (
                    <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : product.stock < 10 ? (
                    <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                      Only {product.stock} Left
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                      In Stock
                    </span>
                  )}
                </div>

                {product.description && (
                  <div className="prose prose-sm sm:prose-base text-gray-600 max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

              {/* Add to Cart Section */}
              <div className="mt-8 flex-1">
                {isOutOfStock ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <p className="font-bold text-red-800 text-lg mb-1">Out of stock</p>
                    <p className="text-red-600 text-sm">We are currently reproducing this item. Please check back later.</p>
                  </div>
                ) : (
                  <AddToCartSection
                    productId={product.id}
                    name={product.name}
                    price={priceNum}
                    maxStock={product.stock}
                    customFields={customFields}
                    image={getOptimizedImageUrl(product.images[0])}
                  />
                )}
              </div>

              {/* Trust Features */}
              <div className="mt-10 pt-8 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Fast Shipping</p>
                    <p className="text-xs text-gray-500 mt-0.5">Dispatched within 48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500 mt-0.5">100% encrypted transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Premium Quality</p>
                    <p className="text-xs text-gray-500 mt-0.5">Rigorous structural checks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500 mt-0.5">7 day return policy</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

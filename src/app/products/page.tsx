/**
 * Product listing – grid, pagination, sort, filter (SSR)
 */
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@prisma/client";
import { getOptimizedImageUrl } from "@/lib/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 12;

type SearchParams = { q?: string; sort?: string; page?: string };

function buildProductsUrl(params: SearchParams, page: number): string {
  const u = new URL("/products", "http://localhost");
  if (params.q) u.searchParams.set("q", params.q);
  if (params.sort) u.searchParams.set("sort", params.sort);
  u.searchParams.set("page", String(page));
  return u.pathname + u.search;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const query = (params.q ?? "").trim();
  const sort = params.sort ?? "newest";

  const where = query
    ? { stock: { gt: 0 }, OR: [{ name: { contains: query, mode: "insensitive" as const } }, { description: { contains: query, mode: "insensitive" as const } }] }
    : { stock: { gt: 0 } };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  let products: Product[] = [];
  let total: number = 0;
  let dbError: boolean = false;

  try {
    const [p, t] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);
    products = p;
    total = t;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    dbError = true;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 md:text-4xl">Discover Premium 3D Prints</h1>
        <p className="mt-2 text-gray-600">Handcrafted quality products, expertly designed and printed</p>
        <form action="/products" method="GET" className="mx-auto mt-6 max-w-md">
          <input type="hidden" name="sort" value={sort} />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search products..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
            />
          </div>
        </form>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=newest` : "/products"}>
          <Button variant={sort === "newest" ? "default" : "outline"} size="sm" className="rounded-xl">Newest</Button>
        </Link>
        <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_asc` : "/products?sort=price_asc"}>
          <Button variant={sort === "price_asc" ? "default" : "outline"} size="sm" className="rounded-xl">Price: Low to High</Button>
        </Link>
        <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_desc` : "/products?sort=price_desc"}>
          <Button variant={sort === "price_desc" ? "default" : "outline"} size="sm" className="rounded-xl">Price: High to Low</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dbError ? (
          <div className="col-span-full rounded-lg bg-amber-50 p-8 text-center">
            <p className="text-amber-800">
              Database temporarily unavailable. Please try again in a moment.
            </p>
          </div>
        ) : (
          <>
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <article className="card-rounded overflow-hidden transition hover:shadow-2xl group">
                  <div className="relative aspect-square bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={getOptimizedImageUrl(product.images[0])}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-gray-400">
                        <span className="text-sm">No Image</span>
                        <svg className="mt-1 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                        Low stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-4">
                    <div>
                      <h2 className="font-semibold text-gray-900">{product.name}</h2>
                      <p className="mt-1 text-indigo-600 font-medium">{formatPrice(product.price)}</p>
                    </div>
                    <span className="text-gray-400 group-hover:text-indigo-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  {product.stock === 0 && <p className="px-4 pb-4 text-sm text-red-600">Out of stock</p>}
                </article>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="col-span-full py-12 text-center text-gray-500">No products found.</p>
            )}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link href={buildProductsUrl(params, page - 1)}>Previous</Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline">
              <Link href={buildProductsUrl(params, page + 1)}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

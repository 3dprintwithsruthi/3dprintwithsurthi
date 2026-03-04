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
import { Search, SlidersHorizontal, ArrowRight, Package, Loader2 } from "lucide-react";

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
    : {}; // Show all products, even out of stock, so users can see catalog

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
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Header */}
      <section className="bg-white border-b border-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Discover Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">3D Prints</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of handcrafted precision models, architectural miniatures, and functional 3D accessories.
          </p>

          {/* Search Bar */}
          <form action="/products" method="GET" className="mx-auto mt-8 max-w-xl relative group">
            <input type="hidden" name="sort" value={sort} />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name, category, or description..."
              className="w-full h-14 rounded-full border border-gray-200 bg-white py-3 pl-12 pr-32 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
          <span className="font-semibold text-gray-900">Filters & Sorting</span>
          <SlidersHorizontal className="h-5 w-5 text-gray-500" />
        </div>

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 hidden lg:block space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Sort By
            </h3>
            <div className="flex flex-col gap-2">
              <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=newest` : "/products"}>
                <div className={`p-3 rounded-xl border cursor-pointer transition-all ${sort === "newest" ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold" : "bg-white border-gray-100 text-gray-600 hover:border-indigo-100 hover:bg-indigo-50/50"}`}>
                  ✨ Newest Arrivals
                </div>
              </Link>
              <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_asc` : "/products?sort=price_asc"}>
                <div className={`p-3 rounded-xl border cursor-pointer transition-all ${sort === "price_asc" ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold" : "bg-white border-gray-100 text-gray-600 hover:border-indigo-100 hover:bg-indigo-50/50"}`}>
                  💵 Price: Low to High
                </div>
              </Link>
              <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_desc` : "/products?sort=price_desc"}>
                <div className={`p-3 rounded-xl border cursor-pointer transition-all ${sort === "price_desc" ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold" : "bg-white border-gray-100 text-gray-600 hover:border-indigo-100 hover:bg-indigo-50/50"}`}>
                  💎 Price: High to Low
                </div>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Filters (visible only on mobile via horizontal scroll) */}
        <div className="lg:hidden flex flex-nowrap overflow-x-auto gap-3 pb-4 snap-x no-scrollbar -mt-8">
          <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=newest` : "/products"} className="snap-start shrink-0">
            <Button variant={sort === "newest" ? "default" : "outline"} className={`rounded-full shadow-sm ${sort === "newest" ? 'bg-indigo-600' : ''}`}>Newest</Button>
          </Link>
          <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_asc` : "/products?sort=price_asc"} className="snap-start shrink-0">
            <Button variant={sort === "price_asc" ? "default" : "outline"} className={`rounded-full shadow-sm ${sort === "price_asc" ? 'bg-indigo-600' : ''}`}>Price: Low - High</Button>
          </Link>
          <Link href={query ? `/products?q=${encodeURIComponent(query)}&sort=price_desc` : "/products?sort=price_desc"} className="snap-start shrink-0">
            <Button variant={sort === "price_desc" ? "default" : "outline"} className={`rounded-full shadow-sm ${sort === "price_desc" ? 'bg-indigo-600' : ''}`}>Price: High - Low</Button>
          </Link>
        </div>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {query ? `Search results for "${query}"` : "All Products"}
            </h2>
            <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
              {total} {total === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          {dbError ? (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-3xl border border-red-100 text-center">
              <Loader2 className="h-10 w-10 text-red-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
              <p className="text-red-600 mt-2 max-w-sm">
                Our database is temporarily unavailable. Please refresh the page in a moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group h-full flex">
                    <article className={`flex flex-col w-full bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 ${isOutOfStock ? 'opacity-80 grayscale-[0.2]' : ''}`}>

                      {/* Image Container */}
                      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                        {product.images[0] ? (
                          <Image
                            src={getOptimizedImageUrl(product.images[0])}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-100">
                            <Package className="h-12 w-12 mb-2" />
                            <span className="text-sm font-medium">No Image Found</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                          {isOutOfStock ? (
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              Out of Stock
                            </span>
                          ) : product.stock < 5 ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              Only {product.stock} left
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                          {product.description || "Premium 3D printed item"}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xl font-black text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <div className={`p-2 rounded-xl transition-colors ${isOutOfStock ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                            <ArrowRight className="h-5 w-5 -rotate-45" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}

              {products.length === 0 && !dbError && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">We couldn't find anything matching "{query}". Try adjusting your search or filters.</p>
                  <Button asChild className="mt-6 rounded-full" variant="outline">
                    <Link href="/products">Clear Search</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-1">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm" className="rounded-l-full rounded-r-none h-10 px-5 text-gray-700">
                  <Link href={buildProductsUrl(params, page - 1)}>Prev</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="rounded-l-full rounded-r-none h-10 px-5 bg-gray-50">
                  Prev
                </Button>
              )}

              <div className="flex items-center px-4 h-10 border-y border-gray-200 bg-white text-sm font-semibold text-gray-700">
                Page {page} of {totalPages}
              </div>

              {page < totalPages ? (
                <Button asChild variant="outline" size="sm" className="rounded-r-full rounded-l-none h-10 px-5 text-gray-700">
                  <Link href={buildProductsUrl(params, page + 1)}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="rounded-r-full rounded-l-none h-10 px-5 bg-gray-50">
                  Next
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

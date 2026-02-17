/**
 * Default home page for both user and admin – Hero, Features, Featured Products
 * Navbar logo links to / (this page)
 */
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Sparkles, ArrowRight, FileCheck, TrendingUp, Shield } from "lucide-react";
import type { Product } from "@prisma/client";
import { getOptimizedImageUrl } from "@/lib/media";

const FEATURED_TAKE = 6;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let featured: Product[] = [];
  let totalProducts: number = 0;
  let dbError: boolean = false;

  try {
    const [f, t] = await Promise.all([
      prisma.product.findMany({
        take: FEATURED_TAKE,
        orderBy: { createdAt: "desc" },
        where: { stock: { gt: 0 } },
      }),
      prisma.product.count({ where: { stock: { gt: 0 } } }),
    ]);
    featured = f;
    totalProducts = t;
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    dbError = true;
  }

  const heroImages = featured.slice(0, 4).map((p) => p.images[0]).filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Hero – gradient background, headline, CTAs, glass card */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50/50 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">

            {/* Left Content */}
            <div className="flex-1 max-w-2xl space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-purple-700 shadow-sm backdrop-blur-sm border border-purple-100">
                <Sparkles className="h-4 w-4" />
                <span>Custom 3D Printing 2026</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl leading-tight">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Print Your Ideas,
                </span>
                <span className="block text-gray-900 mt-2">
                  Into Reality.
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-lg text-lg text-gray-600 sm:text-xl leading-relaxed">
                Custom 3D printed products tailored to your needs. From prototypes to personalized gifts, we bring your imagination to life with precision and care.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="h-12 px-8 rounded-full bg-indigo-600 text-base shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all">
                  <Link href="/products" prefetch>
                    Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                  <Link href="/#featured" prefetch>
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Social Proof - Moved here for better mobile/desktop flow */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-gray-600">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm"
                      style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff)` }}
                      aria-hidden
                    />
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-gray-900 font-bold text-base">1,000+</span>
                  <span className="text-xs text-gray-500">Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right Image Grid - Made Larger & Responsive */}
            <div className="flex-1 flex justify-center lg:justify-end relative mt-8 lg:mt-0">
              {/* Decorative blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 blur-3xl rounded-full -z-10" />

              <div className="relative w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[540px]">
                <div className="aspect-square rounded-3xl border border-white/60 bg-white/40 p-4 shadow-2xl backdrop-blur-xl rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
                  <div className="grid grid-cols-2 gap-3 h-full">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-inner">
                        {heroImages[i] ? (
                          <Image
                            src={getOptimizedImageUrl(heroImages[i] as string)}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-110"
                            sizes="(max-width: 768px) 170px, 250px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                            <span className="text-xl font-bold">3D</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="card-rounded p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
                <FileCheck className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Custom 3D Prints</h3>
              <p className="mt-2 text-gray-600">Personalize every design to your exact specifications</p>
            </div>
            <div className="card-rounded p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Fast Production</h3>
              <p className="mt-2 text-gray-600">Quick turnaround on all your 3D printing needs</p>
            </div>
            <div className="card-rounded p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100">
                <Shield className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Quality Guaranteed</h3>
              <p className="mt-2 text-gray-600">Premium materials and precision printing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="border-t border-gray-100 bg-gradient-to-b from-white to-indigo-50/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-2 text-gray-600">Handpicked items just for you</p>
          {dbError ? (
            <div className="mt-8 rounded-lg bg-amber-50 p-6 text-center">
              <p className="text-amber-800">
                Database temporarily unavailable. Please try again in a moment.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} prefetch className="group">
                    <article className="card-rounded overflow-hidden transition hover:shadow-2xl">
                      <div className="relative aspect-square bg-gray-100">
                        {product.images[0] ? (
                          <Image
                            src={getOptimizedImageUrl(product.images[0])}
                            alt={product.name}
                            fill
                            className="object-cover transition group-hover:scale-105"
                            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
                        )}
                        {product.stock < 10 && product.stock > 0 && (
                          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                            Low stock
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-indigo-600 font-medium">{formatPrice(product.price)}</p>
                        {product.stock === 0 && (
                          <p className="mt-1 text-sm text-red-600">Out of stock</p>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
              {featured.length === 0 && (
                <p className="py-12 text-center text-gray-500">No products yet. Check back soon!</p>
              )}
            </>
          )}
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/products" prefetch>View all products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

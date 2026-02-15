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

const FEATURED_TAKE = 6;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [featured, totalProducts] = await Promise.all([
    prisma.product.findMany({
      take: FEATURED_TAKE,
      orderBy: { createdAt: "desc" },
      where: { stock: { gt: 0 } },
    }),
    prisma.product.count({ where: { stock: { gt: 0 } } }),
  ]);

  const heroImages = featured.slice(0, 4).map((p) => p.images[0]).filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Hero – gradient background, headline, CTAs, glass card */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50/50 pt-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Custom 3D Printing 2026
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Print Your Ideas,
                </span>
                <br />
                <span className="text-purple-800">Into Reality</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                Custom 3D printed products tailored to your needs. From prototypes to personalized gifts, we bring your imagination to life.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/products" prefetch>
                    Explore Products <ArrowRight className="ml-2 inline h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                  <Link href="/#featured" prefetch>
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            {/* Glass card with 4 image placeholders */}
            <div className="flex-shrink-0">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-xl backdrop-blur-md">
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      {heroImages[i] ? (
                        <Image
                          src={heroImages[i] as string}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 40vw, 220px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <span className="text-3xl">3D</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 1000+ Happy Customers */}
          <div className="mt-10 flex items-center justify-end gap-3 text-sm text-gray-600">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500 shadow"
                  aria-hidden
                />
              ))}
            </div>
            <span className="font-medium">1000+ Happy Customers</span>
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
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} prefetch className="group">
                <article className="card-rounded overflow-hidden transition hover:shadow-2xl">
                  <div className="relative aspect-square bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
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

/**
 * Default home page for both user and admin – Hero, Features, Featured Products
 * Ultra-premium design matching the new UI/UX
 */
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Sparkles, ArrowRight, FileCheck, TrendingUp, Shield, Package, CheckCircle2 } from "lucide-react";
import type { Product } from "@prisma/client";
import { getOptimizedImageUrl } from "@/lib/media";

const FEATURED_TAKE = 8;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let featured: Product[] = [];
  let dbError: boolean = false;

  try {
    const f = await prisma.product.findMany({
      take: FEATURED_TAKE,
      orderBy: { createdAt: "desc" },
      where: { stock: { gt: 0 } },
    });
    featured = f;
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    dbError = true;
  }

  const heroImages = featured.slice(0, 4).map((p) => p.images[0]).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 lg:pt-32 lg:pb-40 border-b border-gray-100">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 blur-[100px] rounded-full mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">

            {/* Left Content */}
            <div className="flex-1 max-w-2xl text-center lg:text-left z-10 mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm border border-indigo-100/50 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Premium Quality 3D Printing Services</span>
              </div>

              <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
                  Bring Your Ideas
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-1">
                  Into Reality.
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-lg sm:text-x text-gray-600 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                The premier destination for high-quality <strong className="font-semibold text-indigo-900">3d print sruthi</strong> designs, precision models, and personalized custom prints. Built for creators, by creators.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Button asChild size="lg" className="h-14 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                  <Link href="/products" prefetch>
                    Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-gray-200 text-gray-700 font-bold text-base hover:bg-gray-50 hover:text-indigo-600 transition-all duration-300">
                  <Link href="/#featured" prefetch>
                    View Featured
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 animate-in fade-in duration-1000 delay-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full border-2 border-white shadow-md z-10 transition-transform hover:-translate-y-1 hover:z-20"
                      style={{
                        backgroundImage: `url(https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff&size=100)`,
                        backgroundSize: 'cover'
                      }}
                      aria-hidden
                    />
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 text-amber-400">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
                  </div>
                  <span className="text-sm font-medium text-gray-600">Loved by <strong className="text-gray-900">1,000+</strong> creators</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Gallery */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:max-w-none relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="relative aspect-[4/3] rounded-[2rem] bg-gray-50 shadow-2xl overflow-hidden border border-white p-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50" />
                <div className="grid grid-cols-2 gap-2 h-full w-full relative z-10">
                  {heroImages.length >= 4 ? heroImages.slice(0, 4).map((img, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-2xl bg-white shadow-sm ${i === 0 ? 'rounded-tl-[1.5rem]' : i === 1 ? 'rounded-tr-[1.5rem]' : i === 2 ? 'rounded-bl-[1.5rem]' : 'rounded-br-[1.5rem]'}`}>
                      <Image
                        src={getOptimizedImageUrl(img as string)}
                        alt="3D Print Gallery"
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  )) : (
                    <div className="col-span-2 relative h-full w-full rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                      <Image src="/logo.png" alt="Sruthi 3D Print" width={200} height={200} className="opacity-20 object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce hover:animate-none">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">100% Quality</p>
                  <p className="text-xs text-gray-500 font-medium">Satisfaction Guarantee</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Value Proposition */}
      <section className="py-20 bg-gray-50/50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why choose Sruthi 3D Print?</h2>
            <p className="text-lg text-gray-600">We don't just print plastics; we engineer precision artifacts. Every order goes through rigorous quality control.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileCheck,
                color: "text-purple-600",
                bg: "bg-purple-100",
                title: "Custom 3D Designs",
                desc: "Personalize every 3d print sruthi design to your exact specifications. From functional prototypes to aesthetic art."
              },
              {
                icon: TrendingUp,
                color: "text-indigo-600",
                bg: "bg-indigo-100",
                title: "Fast Production",
                desc: "Quick turnaround on all your 3D printing needs utilizing modern, high-speed filament engines."
              },
              {
                icon: Shield,
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                title: "Quality Guaranteed",
                desc: "Premium materials, high structural infill, and perfect layer adhesion on every single print."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`h-16 w-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section id="featured" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Featured Collection</h2>
              <p className="text-lg text-gray-600">Handpicked masterpieces, popular models, and community favorites.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full font-bold group hidden md:flex hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200">
              <Link href="/products" prefetch>
                View all models <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {dbError ? (
            <div className="rounded-3xl bg-red-50 border border-red-100 p-12 text-center">
              <h3 className="text-xl font-bold text-red-800 mb-2">Connection Interrupted</h3>
              <p className="text-red-600">Our product database is temporarily unavailable. Please try again in a moment.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} prefetch className="group h-full flex">
                    <article className="flex flex-col w-full bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200">

                      {/* Image Area */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {product.images[0] ? (
                          <Image
                            src={getOptimizedImageUrl(product.images[0])}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-100">
                            <Package className="h-12 w-12 mb-2" />
                            <span className="text-sm font-medium">No Image</span>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                          {product.stock === 0 && (
                            <span className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              Out of stock
                            </span>
                          )}
                          {product.stock > 0 && product.stock <= 5 && (
                            <span className="px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              Low stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex flex-col flex-1 p-6">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                          <span className="text-xl font-black text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${product.stock === 0 ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                            <ShoppingCartIcon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {featured.length === 0 && !dbError && (
                <div className="py-24 text-center rounded-3xl border border-dashed border-gray-200">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">No products yet</h3>
                  <p className="text-gray-500 mt-2">We're getting our collection ready. Check back soon!</p>
                </div>
              )}

              <div className="mt-12 text-center md:hidden">
                <Button asChild size="lg" className="w-full rounded-full font-bold">
                  <Link href="/products" prefetch>View all models</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Ready Action Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to print your imagination?</h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">Join hundreds of satisfied customers who trust Sruthi 3D Print for their highly detailed functional parts and stunning artwork.</p>
          <Button asChild size="lg" className="h-14 px-10 rounded-full bg-white text-indigo-900 hover:bg-gray-50 font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-300">
            <Link href="/products">Explore The Shop</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Quick inline icon specifically for the product cards
function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

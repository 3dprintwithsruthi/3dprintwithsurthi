/**
 * Dynamic sitemap for SEO
 */
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = process.env.NEXTAUTH_URL ?? "https://3dprintwithsruthi.com";

  // Attempt to fetch products; if the database isn't available at build time
  // (for example during Vercel builds), fall back to an empty list so the
  // sitemap generation doesn't fail the entire build.
  let products: { id: string; createdAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({ select: { id: true, createdAt: true } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("sitemap: failed to fetch products, continuing without product URLs", err);
    products = [];
  }

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    ...products.map((p) => ({
      url: `${base}/products/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

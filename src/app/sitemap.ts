/**
 * Dynamic sitemap for SEO
 */
import { prisma } from "@/lib/db";

export default async function sitemap() {
  const base = process.env.NEXTAUTH_URL ?? "https://3dprintwithsruthi.com";
  const products = await prisma.product.findMany({
    select: { id: true, createdAt: true },
  });

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

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://3dprintwithsruthi.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/checkout/', '/orders/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

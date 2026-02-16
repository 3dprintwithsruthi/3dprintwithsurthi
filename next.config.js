/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '**' },
      { protocol: 'https', hostname: 'tse*.mm.bing.net', pathname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;

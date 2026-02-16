/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;

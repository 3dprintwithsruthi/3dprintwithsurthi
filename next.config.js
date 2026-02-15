/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '**' },
      { protocol: 'http', hostname: '**', pathname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;

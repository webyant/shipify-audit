/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@shopify-audit/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.shopify.com' },
      { protocol: 'https', hostname: '**.myshopify.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;

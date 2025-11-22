import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
  },

  // Logging for better debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

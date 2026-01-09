import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Reduce bundle size - optimize all heavy packages
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@monaco-editor/react',
      'sonner',
      'react-hotkeys-hook',
      'react-resizable-panels',
    ],
  },
  // Production optimizations
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Optimize font loading (enabled by default in Next.js 13+)
  // Power optimizations
  poweredByHeader: false,
  // React strict mode for better performance
  reactStrictMode: true,
};

export default nextConfig;

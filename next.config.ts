import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
     serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

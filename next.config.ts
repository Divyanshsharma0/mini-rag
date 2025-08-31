import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore pdf-parse test files that cause build issues
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    config.externals = {
      ...config.externals,
      canvas: 'canvas',
    };

    // Add fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
    };

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'canvas'],
  },
};

export default nextConfig;

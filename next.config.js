/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Fix for webpack cache serialization issues
    config.cache = false
    
    // Handle critical dependency warnings
    config.module.exprContextCritical = false
    
    return config
  },
  experimental: {
    // Disable font optimization to prevent Google Fonts issues
    optimizeFonts: false,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // No output export for test environment - enables dev server with API routes
  distDir: '.next', // Use default .next directory for dev server
  trailingSlash: false, // Disable trailing slash for dev server
  
  // Environment variables for testing
  env: {
    PLATFORM_OWNER_ACCESS_REQUIRED: 'true',
    ACCESS_CONTROL_ENABLED: 'true'
  },

  // Enhanced webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for test environment
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all'
        }
      }
    };

    return config;
  },

  // Enhanced image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for performance
  experimental: {
    swcMinify: true,
    esmExternals: true,
  },

  // Custom page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate build ID
  generateBuildId: async () => {
    return `test-${Date.now()}`;
  }
};

// Conditionally apply PWA wrapper only when PWA is enabled
const isPWAEnabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_PWA !== 'true';

if (isPWAEnabled) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    fallbacks: {
      document: '/offline.html',
    },
  });
  module.exports = withPWA(nextConfig);
} else {
  // Export clean Next.js config without PWA wrapper for test/development
  module.exports = nextConfig;
}
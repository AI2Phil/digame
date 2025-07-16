/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '.next',
  trailingSlash: false,
  output: 'standalone',
  
  // Environment variables for testing
  env: {
    PLATFORM_OWNER_ACCESS_REQUIRED: 'true',
    ACCESS_CONTROL_ENABLED: 'true'
  },

  // Simplified webpack configuration to avoid JSX runtime conflicts
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure proper JSX handling
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
      'react/jsx-runtime': 'react/jsx-runtime',
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

  // Remove conflicting experimental settings
  experimental: {
    // Remove swcMinify from experimental since it's already set at top level
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
    return `build-${Date.now()}`;
  },

  // Ensure proper JSX runtime configuration
  compiler: {
    emotion: false,
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

module.exports = nextConfig;
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

  // Memory-optimized webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Memory optimization for CI builds
    if (!dev && process.env.CI) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
      
      // Reduce memory usage during build
      config.optimization.minimize = true;
      config.optimization.concatenateModules = false;
    }

    // Ensure proper JSX handling
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
      'react/jsx-runtime': 'react/jsx-runtime',
    };

    return config;
  },

  // Optimized image configuration for CI
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization during CI builds to save memory
    unoptimized: process.env.CI === 'true',
  },

  // Memory-optimized experimental settings
  experimental: {
    esmExternals: true,
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
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

  // Memory-optimized compiler settings
  compiler: {
    emotion: false,
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during builds to save memory (run separately)
  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true',
  },

  // Disable TypeScript checking during builds (run separately)
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
};

module.exports = nextConfig;
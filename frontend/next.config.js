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

  // Enhanced memory-optimized webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Aggressive memory optimization for CI builds
    if (!dev && process.env.CI) {
      // Reduce memory usage during build
      config.optimization = {
        ...config.optimization,
        minimize: true,
        concatenateModules: false,
        // More aggressive chunk splitting for CI
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Smaller chunks to reduce memory pressure
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
              maxSize: 150000, // Limit vendor chunk size
            },
            // Split large pages into separate chunks
            pages: {
              test: /[\\/]pages[\\/]/,
              name: 'pages',
              priority: -5,
              chunks: 'all',
              maxSize: 100000,
            }
          },
        },
        // Reduce memory usage
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };

      // Suppress verbose webpack output in CI
      config.stats = 'errors-warnings';
      config.infrastructureLogging = {
        level: 'error',
      };
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

  // Enhanced experimental settings for CI
  experimental: {
    esmExternals: true,
    // Optimize for CI environment
    workerThreads: false,
    cpus: process.env.CI ? 1 : undefined, // Single CPU for CI, auto for local
    // Reduce memory usage during static generation
    isrMemoryCacheSize: process.env.CI ? 0 : 50 * 1024 * 1024, // Disable ISR cache in CI
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

  // Enhanced compiler settings for CI
  compiler: {
    emotion: false,
    removeConsole: process.env.NODE_ENV === 'production',
    // Remove debug info in CI builds
    reactRemoveProperties: process.env.CI ? true : false,
  },

  // Disable ESLint during builds to save memory (run separately)
  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true',
  },

  // Disable TypeScript checking during builds (run separately)
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },

  // Reduce build output verbosity in CI
  onDemandEntries: {
    maxInactiveAge: process.env.CI ? 25 * 1000 : 60 * 1000,
    pagesBufferLength: process.env.CI ? 2 : 5,
  },

  // CI-specific optimizations
  ...(process.env.CI && {
    // Reduce static generation concurrency in CI
    staticPageGenerationTimeout: 120, // 2 minutes timeout
    // Optimize for CI memory constraints
    generateEtags: false,
    // Reduce build output
    productionBrowserSourceMaps: false,
  }),
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
  fallbacks: {
    document: '/offline.html',
  },
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  
  // Custom routing configuration
  async rewrites() {
    return [
      // Platform Owner routing
      {
        source: '/platform-owner',
        destination: '/platform-owner/index'
      },
      // Ensure all platform-owner routes are properly handled
      {
        source: '/platform-owner/:path*',
        destination: '/platform-owner/:path*'
      }
    ];
  },

  // Enhanced headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        source: '/platform-owner/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Environment variables
  env: {
    PLATFORM_OWNER_ACCESS_REQUIRED: 'true',
    ACCESS_CONTROL_ENABLED: 'true'
  },

  // Enhanced webpack configuration for Core Web Vitals
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size and splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
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
        },
        platformOwner: {
          test: /[\\/]pages[\\/]platform-owner[\\/]/,
          name: 'platform-owner',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -5,
          reuseExistingChunk: true
        }
      }
    };

    // Add bundle analyzer in development
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Optimize for production
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },

  // Enhanced image optimization for Core Web Vitals
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced experimental features for performance
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    
    // Enable SWC minification
    swcMinify: true,
    
    // Enable modern JavaScript features
    esmExternals: true,
    
    // Optimize server components
    serverComponentsExternalPackages: ['sharp'],
    
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'recharts'],
    
    // Enable turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },

  // Redirects for better SEO and user experience
  async redirects() {
    return [
      // Redirect old platform admin routes to new platform-owner routes
      {
        source: '/admin/platform/:path*',
        destination: '/platform-owner/:path*',
        permanent: true
      },
      {
        source: '/platform-admin/:path*',
        destination: '/platform-owner/:path*',
        permanent: true
      }
    ];
  },

  // Custom page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],


  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate build ID
  generateBuildId: async () => {
    return `platform-owner-${Date.now()}`;
  }
};

module.exports = withPWA(nextConfig);

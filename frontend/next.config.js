/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
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

  // Custom headers for security
  async headers() {
    return [
      {
        source: '/platform-owner/:path*',
        headers: [
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
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
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

  // Webpack configuration for better performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        platformOwner: {
          test: /[\\/]pages[\\/]platform-owner[\\/]/,
          name: 'platform-owner',
          priority: 10,
          reuseExistingChunk: true
        }
      }
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/webp', 'image/avif']
  },

  // Experimental features
  experimental: {
    // Enable app directory if using Next.js 13+
    // appDir: true,
    
    // Optimize CSS
    optimizeCss: true,
    
    // Enable SWC minification
    swcMinify: true
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

  // Trailing slash configuration
  trailingSlash: false,

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate build ID
  generateBuildId: async () => {
    return `platform-owner-${Date.now()}`;
  }
};

module.exports = nextConfig;

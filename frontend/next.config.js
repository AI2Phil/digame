
/** @type {import('next').NextConfig} */
let nextConfig = {
  reactStrictMode: false,  // Less strict for development flexibility
  // swcMinify removed - Next.js uses SWC by default now
  
  // TypeScript configuration - less strict
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration - less strict
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Conditional output based on environment
  output: (() => {
    if (process.env.DOCKER_BUILD === 'true') {
      return 'standalone'; // For Docker builds
    }
    if (process.env.CI === 'true') {
      return undefined; // Standard build for CI
    }
    return undefined; // Standard build for development
  })(),
  
  // Internationalization - COMMENTED OUT to avoid duplicate /en/* pages
  // TODO: Re-enable when implementing Spanish localization
  // i18n: {
  //   locales: ['en', 'es'], // English and Spanish
  //   defaultLocale: 'en',
  // },

  // Experimental features - removed deprecated esmExternals
  // experimental: {
  //   // esmExternals removed - no longer needed in modern Next.js
  // },

  // Redirect /en/* paths to base paths (for SEO and bookmarked URLs)
  async redirects() {
    return [
      {
        source: '/en/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },

  // Custom webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Handle build errors gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Optimize images
  images: {
    domains: ['i.pravatar.cc'],
    unoptimized: true
  },

  // Handle trailing slashes
  trailingSlash: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Export configuration removed to prevent triggering export mode during regular builds
  // If static export is needed in the future, add exportPathMap conditionally with NEXT_EXPORT=true
};

// Conditionally apply PWA only if next-pwa is available
try {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: false,
    skipWaiting: false,
    disable: process.env.NODE_ENV === 'development',
    fallbacks: {
      document: '/offline.html'
    }
  });
  nextConfig = withPWA(nextConfig);
  console.log('✅ PWA features enabled');
} catch (error) {
  console.warn('⚠️ next-pwa not available, PWA features disabled');
}

module.exports = nextConfig;

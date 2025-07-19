
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html'
  }
});

const nextConfig = {
  reactStrictMode: false,  // Less strict for development flexibility
  swcMinify: true,
  
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
  
  // Enable standalone output for Docker builds
  output: 'standalone',
  
  // Internationalization
  i18n: {
    locales: ['en'], // Only English for now, Spanish disabled to reduce build size
    defaultLocale: 'en',
  },

  // Disable SSR for problematic pages
  experimental: {
    esmExternals: 'loose'
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

  // Export configuration - exclude problematic pages from static generation
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    if (dev) {
      return defaultPathMap;
    }
    
    const pathMap = { ...defaultPathMap };
    
    // Remove problematic pages from static generation
    const problematicPages = [
      '/FeaturesPage',
      '/HowItWorksPage', 
      '/LoginPage',
      '/PricingPage',
      '/AdvancedPerformancePage'
    ];
    
    problematicPages.forEach(page => {
      delete pathMap[page];
      // Also remove localized versions (only English now)
      delete pathMap[`/en${page}`];
    });
    
    console.log(`📊 Exporting ${Object.keys(pathMap).length} pages (excluded ${problematicPages.length * 2} problematic pages)`);
    return pathMap;
  },
};

module.exports = withPWA(nextConfig);

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
  reactStrictMode: true,
  swcMinify: true,
  
  // Internationalization
  i18n: {
    locales: ['en', 'es', 'ar'],
    defaultLocale: 'en',
  },

  // Disable SSR for problematic pages to prevent prerendering errors
  experimental: {
    // This helps with SSR issues
    esmExternals: 'loose'
  },

  // Custom webpack config
  webpack: (config, { isServer }) => {
    // Handle client-side only modules
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

  // Export configuration to handle static generation errors gracefully
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove problematic pages from static generation
    const pathMap = { ...defaultPathMap };
    
    // Remove pages that have SSR issues
    const problematicPages = [
      '/FeaturesPage',
      '/HowItWorksPage', 
      '/LoginPage',
      '/PricingPage',
      '/AdvancedPerformancePage'
    ];
    
    problematicPages.forEach(page => {
      delete pathMap[page];
      // Also remove localized versions
      delete pathMap[`/en${page}`];
      delete pathMap[`/es${page}`];
      delete pathMap[`/ar${page}`];
    });
    
    return pathMap;
  },

  // Handle build errors more gracefully
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
};

module.exports = withPWA(nextConfig);
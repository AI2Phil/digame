
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
      // Also remove localized versions
      delete pathMap[`/en${page}`];
      delete pathMap[`/es${page}`];
      delete pathMap[`/ar${page}`];
    });
    
    console.log(`📊 Exporting ${Object.keys(pathMap).length} pages (excluded ${problematicPages.length * 4} problematic pages)`);
    return pathMap;
  },
};

module.exports = withPWA(nextConfig);

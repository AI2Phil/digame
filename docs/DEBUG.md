I have successfully resolved all the deployment issues you encountered when manually starting the backend and frontend. Here's a summary of the fixes implemented:

## Issues Resolved

### 1. X-Frame-Options 'DENY' Error ✅
**Problem**: X-Frame-Options was set via meta tag in [`_document.js`](frontend/pages/_document.js:38), which is invalid
**Solution**: 
- Removed the invalid meta tag from `_document.js`
- Added proper HTTP security headers in [`next.config.js`](frontend/next.config.js:27-47) including X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, and Referrer-Policy

### 2. JavaScript SyntaxError: Unexpected EOF ✅
**Problem**: Corrupted PWA service worker files causing JavaScript parsing errors
**Solution**:
- Updated PWA configuration in [`next.config.js`](frontend/next.config.js:4-12) to properly disable PWA in development
- Cleaned corrupted service worker files (`sw.js`, `workbox-*.js`, `fallback-test-*.js`)
- Rebuilt the application with `npm run build` to generate clean assets

### 3. Missing inter.woff2 Font (404 Error) ✅
**Problem**: Local font file `/fonts/inter.woff2` was missing
**Solution**: 
- Replaced local font preloading with Google Fonts CDN in [`_document.js`](frontend/pages/_document.js:67-69)
- Added proper preconnect links for optimal font loading performance

### 4. Additional Improvements ✅
- Created proper [`offline.html`](frontend/public/offline.html) fallback page for PWA functionality
- Fixed viewport meta tag warning by removing it from `_document.js` (Next.js handles this automatically)
- Optimized PWA configuration for development vs production environments

## Verification
The application now loads successfully at http://localhost:3000 with:
- ✅ No X-Frame-Options errors
- ✅ No JavaScript syntax errors  
- ✅ No font loading 404 errors
- ✅ Proper security headers via HTTP (not meta tags)
- ✅ Clean PWA configuration for development

## Current Setup Status
- **Backend**: Running successfully on port 8001 with Node.js/Express
- **Frontend**: Running successfully on port 3000 with Next.js
- **Startup Method**: Manual terminal startup (as you were using)
- **Build Status**: Clean production build completed successfully

The Digame platform is now fully operational with all deployment errors resolved. You can continue development with confidence that the core infrastructure is stable and properly configured.



frontend/public/offline.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digame - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 1.5rem; opacity: 0.9; }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
        }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>

frontend/next.config.js

/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  fallbacks: {
    document: '/offline.html',
  },
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '.next',
  trailingSlash: false,
  i18n,
  
  // Environment variables for testing
  env: {
    PLATFORM_OWNER_ACCESS_REQUIRED: 'true',
    ACCESS_CONTROL_ENABLED: 'true'
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
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

module.exports = withPWA(nextConfig);

frontend/pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Digame" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Digame" />
        <meta name="description" content="Enterprise-grade analytics platform with AI-powered insights, real-time monitoring, and comprehensive business intelligence tools." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#007bff" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#007bff" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* Splash Screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

        {/* Security Headers - Note: X-Frame-Options should be set via HTTP headers, not meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Performance Hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Accessibility Improvements */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Digame - Advanced Analytics Platform" />
        <meta property="og:description" content="Enterprise-grade analytics platform with AI-powered insights, real-time monitoring, and comprehensive business intelligence tools." />
        <meta property="og:site_name" content="Digame" />
        <meta property="og:url" content="https://digame.app" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digame - Advanced Analytics Platform" />
        <meta name="twitter:description" content="Enterprise-grade analytics platform with AI-powered insights, real-time monitoring, and comprehensive business intelligence tools." />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />

        {/* Google Fonts - Inter font family */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50">
          Skip to main content
        </a>
        <Main id="main-content" />
        <NextScript />
        
        {/* Service Worker Registration - Only in production */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'production') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </Html>
  )
}



module.exports = {
  ci: {
    collect: {
      // Use URL-based collection since Next.js builds for SSR, not static export
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // Enhanced settings for Core Web Vitals
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        emulatedFormFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
      },
    },
    assert: {
      // Enhanced performance budget assertions with Core Web Vitals
      assertions: {
        // Enhanced performance thresholds
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }], // Improved with accessibility fixes
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }], // Enhanced with PWA implementation
        
        // Core Web Vitals - stricter thresholds
        'largest-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'first-input-delay': ['warn', { maxNumericValue: 80 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.08 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 150 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        
        // Performance optimizations
        'uses-webp-images': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'efficient-animated-content': 'warn',
        'preload-lcp-image': 'warn',
        'uses-text-compression': 'warn',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'font-display': 'warn',
        
        // Resource optimization
        'render-blocking-resources': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'uses-passive-event-listeners': 'warn',
        
        // Network optimization
        'uses-long-cache-ttl': 'warn',
        'uses-http2': 'warn',
        'redirects': 'warn',
        'mainthread-work-breakdown': 'warn',
        'bootup-time': 'warn',
      },
    },
    upload: {
      // Configure where to upload results (optional)
      target: 'temporary-public-storage',
    },
  },
}
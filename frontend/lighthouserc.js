module.exports = {
  ci: {
    collect: {
      // Use URL-based collection since Next.js builds for SSR, not static export
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      // Performance budget assertions
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
      },
    },
    upload: {
      // Configure where to upload results (optional)
      target: 'temporary-public-storage',
    },
  },
}
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Increase timeouts to allow React hydration to complete
    maxWaitForFcp: 20 * 1000,
    maxWaitForLoad: 45 * 1000,
    
    // Add pause after load to ensure React hydration is complete
    pauseAfterFcpMs: 2000,
    pauseAfterLoadMs: 3000,
    
    // Skip audits that are prone to DOM access issues
    skipAudits: [
      'unused-css-rules', // Can cause DOM access issues with dynamic CSS
      'unsized-images', // Can cause DOM measurement issues
    ],
    
    // Use provided throttling for more stable results
    throttlingMethod: 'provided',
    
    // Form factor and screen emulation
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    
    // Additional Chrome flags for stability and DOM access
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI,VizDisplayCompositor',
      '--disable-ipc-flooding-protection',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-domain-reliability',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list'
    ]
  }
};
import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Function to get the dynamic port
function getTestPort(): string {
  try {
    const portFile = path.join(__dirname, '.test-port');
    if (fs.existsSync(portFile)) {
      return fs.readFileSync(portFile, 'utf8').trim();
    }
  } catch (e) {
    // Fallback to default port
  }
  return process.env.FRONTEND_PORT || '3000';
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI and locally for better reliability */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Global timeout for each test */
  timeout: 60000, // 60 seconds
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'] // Add list reporter for better console output
  ],
  /* Global setup and teardown - disabled in CI since services are managed by CI workflow */
  globalSetup: process.env.CI ? undefined : require.resolve('./tests/global-setup.js'),
  globalTeardown: process.env.CI ? undefined : require.resolve('./tests/global-teardown.js'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
    /* Action timeout */
    actionTimeout: 15000, // 15 seconds for actions
    /* Navigation timeout */
    navigationTimeout: 30000, // 30 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Enhanced Firefox configuration for portal interference issues
        actionTimeout: 30000, // Increased timeout for Firefox
        launchOptions: {
          firefoxUserPrefs: {
            // Disable some Firefox features that might interfere with testing
            'dom.disable_beforeunload': true,
            'dom.disable_open_during_load': true,
            'dom.popup_maximum': 0,
            'privacy.trackingprotection.enabled': false,
            'dom.ipc.plugins.enabled.libflashplayer.so': false,
          }
        }
      },
      retries: 3, // Extra retries for Firefox portal issues
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-extensions',
            '--disable-gpu',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
          ]
        }
      },
      retries: 3, // Extra retries for Edge
      timeout: 120000, // Longer timeout for Edge (2 minutes)
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
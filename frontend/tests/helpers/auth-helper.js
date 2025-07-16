/**
 * Authentication Helper for E2E Tests
 * Provides test authentication utilities to bypass auth for testing
 */

const { chromium } = require('@playwright/test');

// Test user credentials
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    tenant_id: 1
  },
  user: {
    email: 'user@test.com', 
    password: 'user123',
    role: 'user',
    tenant_id: 1
  },
  mfa_user: {
    email: 'test.mfa@example.com',
    password: 'TestPassword123!',
    role: 'user',
    tenant_id: 1
  }
};

// Test authentication token (for API requests)
const TEST_AUTH_TOKEN = 'test-auth-token-e2e-testing';

/**
 * Create test authentication headers
 */
function getTestAuthHeaders() {
  return {
    'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Test-Mode': 'true',
    'X-Tenant-ID': '1'
  };
}

/**
 * Setup test authentication for a page
 */
async function setupTestAuth(page, userType = 'user') {
  const user = TEST_USERS[userType];
  
  // Set test authentication cookies/localStorage
  await page.addInitScript(() => {
    // Set test mode flag
    window.TEST_MODE = true;
    
    // Set test authentication token
    localStorage.setItem('auth_token', 'test-auth-token-e2e-testing');
    localStorage.setItem('user_id', '1');
    localStorage.setItem('tenant_id', '1');
    localStorage.setItem('user_role', 'user');
    
    // Set test user data
    localStorage.setItem('user_data', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      tenant_id: 1,
      subscription_tier: 'team',
      onboardingCompleted: true
    }));
  });

  // Intercept authentication requests and return success
  await page.route('**/auth/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    console.log(`🔐 Auth intercept: ${method} ${url}`);
    
    if (url.includes('/auth/login')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: TEST_AUTH_TOKEN,
          user: user,
          message: 'Login successful'
        })
      });
    } else if (url.includes('/auth/verify')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          user: user
        })
      });
    } else {
      await route.continue();
    }
  });

  // Intercept ALL requests to the API base URL for MFA endpoints
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/api/security/mfa/status')) {
      console.log(`🔐 MFA status intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mfa_enabled: false,
          device_count: 0,
          devices: [],
          ip_restrictions_enabled: false,
          ip_restriction_count: 0,
          security_level: 'basic'
        })
      });
    } else if (url.includes('/api/security/mfa/devices')) {
      console.log(`🔐 MFA devices intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    } else if (url.includes('/api/security/mfa/setup')) {
      console.log(`🔐 MFA setup intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          secret_key: 'JBSWY3DPEHPK3PXP',
          backup_codes: ['123456', '789012', '345678', '901234', '567890']
        })
      });
    } else if (url.includes('/api/security/mfa/verify')) {
      console.log(`🔐 MFA verify intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          backup_codes: ['123456', '789012', '345678', '901234', '567890']
        })
      });
    } else if (url.includes('/api/workflow-automation/health')) {
      console.log(`🔧 Workflow health intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          service: 'workflow-automation',
          timestamp: new Date().toISOString(),
          features: [
            'workflow_templates',
            'workflow_instances',
            'automation_rules',
            'workflow_actions',
            'analytics'
          ]
        })
      });
    } else if (url.includes('/api/security/dashboard')) {
      console.log(`🛡️ Security dashboard intercept: ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          security_score: 85,
          threats_detected: 0,
          mfa_adoption: 0,
          last_updated: new Date().toISOString(),
          security_metrics: {
            total_users: 1,
            active_sessions: 1,
            failed_logins_24h: 0,
            mfa_enabled_users: 0,
            security_alerts: []
          }
        })
      });
    } else {
      await route.continue();
    }
  });

  // For Microsoft Edge and direct API calls, also intercept context-level requests
  if (page.context) {
    await page.context().route('**/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      if (url.includes('/api/security/mfa/status')) {
        console.log(`🔐 Context MFA status intercept: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            mfa_enabled: false,
            device_count: 0,
            devices: [],
            ip_restrictions_enabled: false,
            ip_restriction_count: 0,
            security_level: 'basic'
          })
        });
      } else if (url.includes('/api/workflow-automation/health')) {
        console.log(`🔧 Context Workflow health intercept: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'healthy',
            service: 'workflow-automation',
            timestamp: new Date().toISOString(),
            features: [
              'workflow_templates',
              'workflow_instances',
              'automation_rules',
              'workflow_actions',
              'analytics'
            ]
          })
        });
      } else if (url.includes('/api/security/dashboard')) {
        console.log(`🛡️ Context Security dashboard intercept: ${method} ${url}`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            security_score: 85,
            threats_detected: 0,
            mfa_adoption: 0,
            last_updated: new Date().toISOString(),
            security_metrics: {
              total_users: 1,
              active_sessions: 1,
              failed_logins_24h: 0,
              mfa_enabled_users: 0,
              security_alerts: []
            }
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  // Note: All API interceptions are now handled by the comprehensive **/* handler above
}

/**
 * Login via UI (for tests that need actual login flow)
 */
async function loginViaUI(page, userType = 'user') {
  const user = TEST_USERS[userType];
  
  await page.goto('http://localhost:3001/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(user.email);
  }
  if (await passwordInput.isVisible()) {
    await passwordInput.fill(user.password);
  }
  
  // Submit login
  const loginButton = page.locator('button[type="submit"], button:has-text("Login")');
  await loginButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Create authenticated API request context
 */
async function createAuthenticatedContext(browser) {
  const context = await browser.newContext({
    extraHTTPHeaders: getTestAuthHeaders()
  });
  
  return context;
}

module.exports = {
  TEST_USERS,
  TEST_AUTH_TOKEN,
  getTestAuthHeaders,
  setupTestAuth,
  loginViaUI,
  createAuthenticatedContext
};
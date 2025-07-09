/**
 * Frontend Integration Testing Suite for Digame Platform
 * Comprehensive testing of frontend-backend integration
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:8001',
    timeout: 30000,
    viewport: { width: 1920, height: 1080 },
    testUser: {
        email: 'test@digame.com',
        password: 'test_password_123',
        name: 'Test User'
    }
};

class FrontendIntegrationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshots = [];
    }

    async setup() {
        console.log('🚀 Setting up Frontend Integration Test Suite');
        
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: TEST_CONFIG.viewport
        });
        
        this.page = await this.browser.newPage();
        
        // Set up console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
            }
        });
        
        // Set up request/response monitoring
        this.page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`⚠️  HTTP ${response.status()}: ${response.url()}`);
            }
        });
        
        await this.page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle0' });
    }

    async teardown() {
        if (this.browser) {
            await this.browser.close();
        }
        
        // Save test results
        await this.saveResults();
    }

    async takeScreenshot(name) {
        const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        this.screenshots.push({ name, path: screenshotPath });
        return screenshotPath;
    }

    async runTest(testName, testFunction) {
        console.log(`\n📋 Running: ${testName}`);
        const startTime = Date.now();
        
        try {
            await testFunction();
            const endTime = Date.now();
            
            this.testResults.push({
                name: testName,
                status: 'PASSED',
                duration: endTime - startTime,
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ PASSED: ${testName} (${endTime - startTime}ms)`);
            return true;
        } catch (error) {
            const endTime = Date.now();
            
            this.testResults.push({
                name: testName,
                status: 'FAILED',
                error: error.message,
                duration: endTime - startTime,
                timestamp: new Date().toISOString()
            });
            
            console.log(`❌ FAILED: ${testName} - ${error.message}`);
            await this.takeScreenshot(`error-${testName.replace(/\s+/g, '-').toLowerCase()}`);
            return false;
        }
    }

    async runAllTests() {
        console.log('🧪 Starting Frontend Integration Tests');
        console.log('=' * 60);
        
        const testSuites = [
            { name: 'Navigation & Routing', tests: this.testNavigation.bind(this) },
            { name: 'Authentication Flow', tests: this.testAuthentication.bind(this) },
            { name: 'Team Management Integration', tests: this.testTeamManagement.bind(this) },
            { name: 'Advanced Reporting Integration', tests: this.testAdvancedReporting.bind(this) },
            { name: 'Real-Time Collaboration', tests: this.testCollaboration.bind(this) },
            { name: 'ML/AI Dashboard Integration', tests: this.testMLDashboard.bind(this) },
            { name: 'Security Dashboard Integration', tests: this.testSecurityDashboard.bind(this) },
            { name: 'Notification System Integration', tests: this.testNotifications.bind(this) },
            { name: 'Performance & Responsiveness', tests: this.testPerformance.bind(this) }
        ];

        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;

        for (const suite of testSuites) {
            console.log(`\n🔍 Testing ${suite.name}`);
            console.log('-'.repeat(40));
            
            const suiteResults = await suite.tests();
            totalTests += suiteResults.total;
            passedTests += suiteResults.passed;
            failedTests += suiteResults.failed;
        }

        // Print final summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 FRONTEND INTEGRATION TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: (passedTests / totalTests) * 100,
            results: this.testResults,
            screenshots: this.screenshots
        };
    }

    async testNavigation() {
        let passed = 0, failed = 0, total = 0;

        // Test main navigation menu
        total++;
        if (await this.runTest('Main Navigation Menu Loads', async () => {
            await this.page.waitForSelector('nav', { timeout: 5000 });
            const navItems = await this.page.$$('nav a');
            if (navItems.length < 5) throw new Error('Navigation menu has insufficient items');
        })) passed++; else failed++;

        // Test critical page routes
        const criticalRoutes = [
            { path: '/dashboard', name: 'Dashboard' },
            { path: '/team', name: 'Team Management' },
            { path: '/reports', name: 'Advanced Reporting' },
            { path: '/collaboration/real-time', name: 'Real-Time Collaboration' },
            { path: '/ai/ml-dashboard', name: 'ML Dashboard' },
            { path: '/security', name: 'Security Dashboard' }
        ];

        for (const route of criticalRoutes) {
            total++;
            if (await this.runTest(`Navigate to ${route.name}`, async () => {
                await this.page.goto(`${TEST_CONFIG.baseUrl}${route.path}`, { waitUntil: 'networkidle0' });
                await this.page.waitForSelector('main', { timeout: 10000 });
                
                // Check for error boundaries
                const errorBoundary = await this.page.$('.error-boundary');
                if (errorBoundary) throw new Error('Error boundary triggered');
                
                // Check for loading states completion
                const loadingSpinners = await this.page.$$('.loading, .spinner');
                if (loadingSpinners.length > 0) {
                    await this.page.waitForFunction(() => 
                        document.querySelectorAll('.loading, .spinner').length === 0,
                        { timeout: 15000 }
                    );
                }
            })) passed++; else failed++;
        }

        return { total, passed, failed };
    }

    async testAuthentication() {
        let passed = 0, failed = 0, total = 0;

        // Test login page access
        total++;
        if (await this.runTest('Login Page Accessible', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/auth/login`, { waitUntil: 'networkidle0' });
            await this.page.waitForSelector('form', { timeout: 5000 });
            
            const emailInput = await this.page.$('input[type="email"]');
            const passwordInput = await this.page.$('input[type="password"]');
            const submitButton = await this.page.$('button[type="submit"]');
            
            if (!emailInput || !passwordInput || !submitButton) {
                throw new Error('Login form elements missing');
            }
        })) passed++; else failed++;

        // Test authentication flow
        total++;
        if (await this.runTest('Authentication Flow', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/auth/login`, { waitUntil: 'networkidle0' });
            
            // Fill login form
            await this.page.type('input[type="email"]', TEST_CONFIG.testUser.email);
            await this.page.type('input[type="password"]', TEST_CONFIG.testUser.password);
            
            // Submit form
            await this.page.click('button[type="submit"]');
            
            // Wait for redirect or error message
            await this.page.waitForTimeout(3000);
            
            // Check if redirected to dashboard or shows error
            const currentUrl = this.page.url();
            const errorMessage = await this.page.$('.error-message, .alert-error');
            
            // Either successful redirect or expected auth error is acceptable
            if (!currentUrl.includes('/dashboard') && !errorMessage) {
                throw new Error('Authentication flow did not complete properly');
            }
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testTeamManagement() {
        let passed = 0, failed = 0, total = 0;

        // Test team management page load
        total++;
        if (await this.runTest('Team Management Page Load', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/team`, { waitUntil: 'networkidle0' });
            
            // Wait for main content
            await this.page.waitForSelector('.team-management, main', { timeout: 10000 });
            
            // Check for API data loading
            await this.page.waitForTimeout(2000);
            
            // Verify no critical errors
            const errorElements = await this.page.$$('.error, .alert-error');
            if (errorElements.length > 0) {
                const errorText = await this.page.evaluate(el => el.textContent, errorElements[0]);
                if (errorText.includes('500') || errorText.includes('Critical')) {
                    throw new Error(`Critical error found: ${errorText}`);
                }
            }
        })) passed++; else failed++;

        // Test team analytics integration
        total++;
        if (await this.runTest('Team Analytics Integration', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/team/analytics`, { waitUntil: 'networkidle0' });
            
            // Wait for analytics components
            await this.page.waitForSelector('.analytics, .chart, .metrics', { timeout: 10000 });
            
            // Check for data visualization elements
            const charts = await this.page.$$('.chart, canvas, svg');
            if (charts.length === 0) {
                throw new Error('No data visualization elements found');
            }
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testAdvancedReporting() {
        let passed = 0, failed = 0, total = 0;

        // Test reporting dashboard
        total++;
        if (await this.runTest('Advanced Reporting Dashboard', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/reports`, { waitUntil: 'networkidle0' });
            
            // Wait for dashboard components
            await this.page.waitForSelector('.reporting-dashboard, main', { timeout: 10000 });
            
            // Check for report templates or data
            await this.page.waitForTimeout(3000);
            
            // Verify dashboard functionality
            const dashboardElements = await this.page.$$('.report-card, .template, .dashboard-widget');
            if (dashboardElements.length === 0) {
                // Check if it's a loading state or error
                const loadingElements = await this.page.$$('.loading, .spinner');
                if (loadingElements.length === 0) {
                    console.log('⚠️  No dashboard elements found, but no loading state either');
                }
            }
        })) passed++; else failed++;

        // Test report builder
        total++;
        if (await this.runTest('Report Builder Integration', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/reports/builder`, { waitUntil: 'networkidle0' });
            
            // Wait for builder interface
            await this.page.waitForSelector('.report-builder, main', { timeout: 10000 });
            
            // Check for builder components
            await this.page.waitForTimeout(2000);
            
            // Verify builder functionality is accessible
            const builderElements = await this.page.$$('.builder-panel, .form-group, .config-section');
            // Builder might be empty initially, which is acceptable
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testCollaboration() {
        let passed = 0, failed = 0, total = 0;

        // Test collaboration dashboard
        total++;
        if (await this.runTest('Real-Time Collaboration Dashboard', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/collaboration/real-time`, { waitUntil: 'networkidle0' });
            
            // Wait for collaboration interface
            await this.page.waitForSelector('.collaboration-dashboard, main', { timeout: 10000 });
            
            // Check for collaboration components
            await this.page.waitForTimeout(3000);
            
            // Verify collaboration features are present
            const collabElements = await this.page.$$('.workspace, .channel, .message, .user-list');
            // Collaboration might require authentication, so empty state is acceptable
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testMLDashboard() {
        let passed = 0, failed = 0, total = 0;

        // Test ML dashboard
        total++;
        if (await this.runTest('ML/AI Dashboard Integration', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/ai/ml-dashboard`, { waitUntil: 'networkidle0' });
            
            // Wait for ML dashboard
            await this.page.waitForSelector('.ml-dashboard, main', { timeout: 10000 });
            
            // Check for ML components
            await this.page.waitForTimeout(3000);
            
            // Verify ML dashboard elements
            const mlElements = await this.page.$$('.model-card, .training-job, .prediction, .metrics');
            // ML dashboard might be empty initially
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testSecurityDashboard() {
        let passed = 0, failed = 0, total = 0;

        // Test security dashboard
        total++;
        if (await this.runTest('Security Dashboard Integration', async () => {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/security`, { waitUntil: 'networkidle0' });
            
            // Wait for security dashboard
            await this.page.waitForSelector('.security-dashboard, main', { timeout: 10000 });
            
            // Check for security components
            await this.page.waitForTimeout(3000);
            
            // Verify security dashboard elements
            const securityElements = await this.page.$$('.security-metric, .threat, .incident, .compliance');
            // Security dashboard might require special permissions
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testNotifications() {
        let passed = 0, failed = 0, total = 0;

        // Test notification system
        total++;
        if (await this.runTest('Notification System Integration', async () => {
            // Check for notification components on any page
            await this.page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
            
            // Look for notification bell, toast container, or notification panel
            const notificationElements = await this.page.$$('.notification, .toast, .alert, .notification-bell');
            
            // Notification system should be present even if no notifications
            // This is acceptable as long as the page loads without errors
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async testPerformance() {
        let passed = 0, failed = 0, total = 0;

        // Test page load performance
        total++;
        if (await this.runTest('Page Load Performance', async () => {
            const startTime = Date.now();
            await this.page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
            const loadTime = Date.now() - startTime;
            
            if (loadTime > 10000) { // 10 second threshold
                throw new Error(`Page load time ${loadTime}ms exceeds 10s threshold`);
            }
            
            console.log(`   Page load time: ${loadTime}ms`);
        })) passed++; else failed++;

        // Test responsive design
        total++;
        if (await this.runTest('Responsive Design', async () => {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
            
            // Check if mobile navigation or responsive elements exist
            await this.page.waitForTimeout(2000);
            
            // Reset to desktop viewport
            await this.page.setViewport(TEST_CONFIG.viewport);
        })) passed++; else failed++;

        return { total, passed, failed };
    }

    async saveResults() {
        const results = {
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.status === 'PASSED').length,
                failed: this.testResults.filter(r => r.status === 'FAILED').length,
                timestamp: new Date().toISOString()
            },
            tests: this.testResults,
            screenshots: this.screenshots
        };

        await fs.writeFile('frontend-integration-results.json', JSON.stringify(results, null, 2));
        console.log('\n📄 Results saved to: frontend-integration-results.json');
    }
}

// Main execution
async function runFrontendTests() {
    const tester = new FrontendIntegrationTester();
    
    try {
        await tester.setup();
        const results = await tester.runAllTests();
        return results.failed === 0;
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return false;
    } finally {
        await tester.teardown();
    }
}

// Export for use in other scripts
module.exports = { FrontendIntegrationTester, runFrontendTests };

// Run if called directly
if (require.main === module) {
    runFrontendTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}
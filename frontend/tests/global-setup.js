/**
 * Playwright Global Setup
 * Ensures backend services are running before tests start
 */

const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Check if backend is already running
  const isBackendRunning = await checkBackendHealth();
  
  if (!isBackendRunning) {
    console.log('📡 Backend not detected, starting backend services...');
    await startBackendServices();
  } else {
    console.log('✅ Backend is already running');
  }
  
  // Verify services are ready
  await verifyServices();
  
  console.log('✅ Global setup completed successfully');
}

async function checkBackendHealth() {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Check both possible health endpoints
    let response = await page.goto('http://localhost:8000/api/health', {
      waitUntil: 'networkidle',
      timeout: 5000
    }).catch(() => null);
    
    if (!response || !response.ok()) {
      response = await page.goto('http://localhost:8000/health', {
        waitUntil: 'networkidle',
        timeout: 5000
      }).catch(() => null);
    }
    
    await browser.close();
    return response && response.ok();
  } catch (error) {
    return false;
  }
}

async function startBackendServices() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting Node.js Express backend service...');
    
    // Navigate to backend directory
    const backendDir = path.resolve(__dirname, '../../backend');
    
    // Start backend using Node.js
    const backend = spawn('node', ['src/server.js'], {
      cwd: backendDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: '8000',
        NODE_ENV: 'production',
        TESTING: 'true'
      }
    });
    
    // Handle backend output
    backend.stdout.on('data', (data) => {
      console.log(`Backend: ${data.toString().trim()}`);
    });
    
    backend.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data.toString().trim()}`);
    });
    
    backend.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });
    
    // Store backend PID for cleanup
    const pidFile = path.join(path.resolve(__dirname, '../../'), '.test-backend-pid');
    fs.writeFileSync(pidFile, backend.pid.toString());
    
    // Wait a bit for the service to start
    setTimeout(() => {
      resolve(backend);
    }, 5000);
  });
}

async function verifyServices() {
  console.log('🔍 Verifying services are ready...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Add error handling
  page.on('pageerror', (error) => {
    console.log('Page error during setup:', error.message);
  });
  
  let retries = 30;
  let backendReady = false;
  
  // Wait for backend to be ready
  while (retries > 0 && !backendReady) {
    try {
      // Try /api/health first, then fallback to /health
      let response = await page.goto('http://localhost:8000/api/health', {
        waitUntil: 'networkidle',
        timeout: 2000
      }).catch(() => null);
      
      if (!response || !response.ok()) {
        response = await page.goto('http://localhost:8000/health', {
          waitUntil: 'networkidle',
          timeout: 2000
        }).catch(() => null);
      }
      
      if (response && response.ok()) {
        try {
          const healthData = await response.json();
          if (healthData.status === 'healthy' || healthData.status === 'ok') {
            console.log('✅ Backend health check passed');
            backendReady = true;
          }
        } catch (jsonError) {
          // If JSON parsing fails but response is OK, consider it healthy
          console.log('✅ Backend responding (non-JSON response)');
          backendReady = true;
        }
      }
    } catch (error) {
      console.log(`⏳ Waiting for backend... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
  }
  
  if (!backendReady) {
    await browser.close();
    throw new Error('Backend failed to start within timeout period');
  }
  
  // Test API endpoints
  try {
    const apiResponse = await page.goto('http://localhost:8000/api/health', {
      waitUntil: 'networkidle',
      timeout: 5000
    });
    
    if (apiResponse && apiResponse.ok()) {
      console.log('✅ API health check passed');
    } else {
      console.log('⚠️  API health check failed, but continuing...');
    }
  } catch (error) {
    console.log('⚠️  API endpoint test failed:', error.message);
  }
  
  // Test security dashboard endpoint
  try {
    const securityResponse = await page.goto('http://localhost:8000/api/security/dashboard', {
      waitUntil: 'networkidle',
      timeout: 5000
    });
    
    if (securityResponse && securityResponse.ok()) {
      console.log('✅ Security dashboard endpoint accessible');
    } else {
      console.log('⚠️  Security dashboard endpoint test failed, but continuing...');
    }
  } catch (error) {
    console.log('⚠️  Security dashboard test failed:', error.message);
  }
  
  await browser.close();
}

module.exports = globalSetup;
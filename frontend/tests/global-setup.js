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
    
    const response = await page.goto('http://localhost:8000/health', {
      waitUntil: 'networkidle',
      timeout: 5000
    });
    
    await browser.close();
    return response && response.ok();
  } catch (error) {
    return false;
  }
}

async function startBackendServices() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting backend service...');
    
    // Navigate to project root (assuming we're in frontend/tests)
    const projectRoot = path.resolve(__dirname, '../../');
    
    // Start backend using uvicorn
    const backend = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: projectRoot,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
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
    const pidFile = path.join(projectRoot, '.test-backend-pid');
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
      const response = await page.goto('http://localhost:8000/health', {
        waitUntil: 'networkidle',
        timeout: 2000
      });
      
      if (response && response.ok()) {
        const healthData = await response.json();
        if (healthData.status === 'healthy') {
          console.log('✅ Backend health check passed');
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
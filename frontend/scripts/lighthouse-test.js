#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const net = require('net');
const sleep = promisify(setTimeout);

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

// Function to find an available port
async function findAvailablePort(startPort = 3001) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available port found');
}

async function runLighthouseTest() {
  console.log('🚀 Starting Next.js server for Lighthouse testing...');
  
  // Find an available port
  const port = await findAvailablePort(3001);
  console.log(`📡 Using port ${port} for testing`);
  
  // Start the Next.js server on the available port
  const server = spawn('npm', ['run', 'start', '--', '-p', port.toString()], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  let serverReady = false;
  let serverOutput = '';
  
  // Monitor server output to know when it's ready
  server.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log('Server stdout:', output.trim());
    
    if (output.includes('Ready on') || output.includes('started server on') || output.includes(`localhost:${port}`)) {
      serverReady = true;
      console.log('✅ Next.js server is ready');
    }
  });

  server.stderr.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log('Server stderr:', output.trim());
    
    if (output.includes('EADDRINUSE')) {
      console.error('❌ Port is already in use');
      server.kill();
      process.exit(1);
    }
  });

  server.on('error', (err) => {
    console.error('❌ Server spawn error:', err);
    process.exit(1);
  });

  server.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Server exited with code ${code}, signal ${signal}`);
      console.error('Server output:', serverOutput);
      process.exit(1);
    }
  });

  // Wait for server to be ready (max 60 seconds)
  let attempts = 0;
  while (!serverReady && attempts < 120) {
    await sleep(500);
    attempts++;
    
    if (attempts % 10 === 0) {
      console.log(`⏳ Waiting for server... (${attempts * 0.5}s)`);
    }
  }

  if (!serverReady) {
    console.error('❌ Server failed to start within 60 seconds');
    console.error('Server output:', serverOutput);
    server.kill();
    process.exit(1);
  }

  // Additional wait to ensure server is fully ready
  await sleep(3000);

  console.log('🔍 Running Lighthouse audit...');
  
  // Run Lighthouse
  const lighthouse = spawn('npx', [
    'lighthouse',
    `http://localhost:${port}`,
    '--config-path=./lighthouse.config.js',
    '--output=html',
    '--output-path=./lighthouse-report.html'
  ], {
    stdio: 'inherit'
  });

  lighthouse.on('close', (code) => {
    console.log(`🏁 Lighthouse finished with code ${code}`);
    
    // Kill the server
    server.kill();
    
    if (code === 0) {
      console.log('✅ Performance test completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Lighthouse test failed');
      process.exit(code);
    }
  });

  lighthouse.on('error', (err) => {
    console.error('❌ Lighthouse error:', err);
    server.kill();
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Terminating processes...');
    server.kill();
    lighthouse.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.kill();
    lighthouse.kill();
    process.exit(0);
  });
}

runLighthouseTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
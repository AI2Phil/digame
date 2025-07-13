const { spawn } = require('child_process');
const findAvailablePort = require('./find-port');
const fs = require('fs');
const path = require('path');

async function startTestServer() {
  try {
    // Find an available port starting from 3001
    const port = await findAvailablePort(3001);
    console.log(`Starting test server on port ${port}`);
    
    // Copy test config
    const testConfigPath = path.join(__dirname, '..', 'next.config.test.js');
    const configPath = path.join(__dirname, '..', 'next.config.js');
    
    if (fs.existsSync(testConfigPath)) {
      fs.copyFileSync(testConfigPath, configPath);
      console.log('Copied test configuration');
    }
    
    // Start the dev server
    const devServer = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // Write the port to a file for Playwright to read
    fs.writeFileSync(path.join(__dirname, '..', '.test-port'), port.toString());
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('Terminating test server...');
      devServer.kill();
      // Clean up port file
      try {
        fs.unlinkSync(path.join(__dirname, '..', '.test-port'));
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    
    process.on('SIGINT', () => {
      console.log('Terminating test server...');
      devServer.kill();
      // Clean up port file
      try {
        fs.unlinkSync(path.join(__dirname, '..', '.test-port'));
      } catch (e) {
        // Ignore cleanup errors
      }
      process.exit(0);
    });
    
    devServer.on('exit', (code) => {
      console.log(`Test server exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('Error starting test server:', error);
    process.exit(1);
  }
}

startTestServer();
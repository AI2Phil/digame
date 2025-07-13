/**
 * Playwright Global Teardown
 * Cleans up backend services after tests complete
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  console.log('🧹 Starting global teardown for E2E tests...');
  
  try {
    // Navigate to project root (assuming we're in frontend/tests)
    const projectRoot = path.resolve(__dirname, '../../');
    const pidFile = path.join(projectRoot, '.test-backend-pid');
    
    // Check if we started a backend process
    if (fs.existsSync(pidFile)) {
      const pid = fs.readFileSync(pidFile, 'utf8').trim();
      
      if (pid) {
        console.log(`🛑 Stopping backend process (PID: ${pid})`);
        
        try {
          // Try graceful shutdown first
          process.kill(parseInt(pid), 'SIGTERM');
          
          // Wait a bit for graceful shutdown
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if process is still running
          try {
            process.kill(parseInt(pid), 0); // Check if process exists
            // If we get here, process is still running, force kill
            console.log('🔨 Force killing backend process...');
            process.kill(parseInt(pid), 'SIGKILL');
          } catch (error) {
            // Process already terminated
            console.log('✅ Backend process terminated gracefully');
          }
        } catch (error) {
          console.log('⚠️  Error stopping backend process:', error.message);
        }
        
        // Clean up PID file
        fs.unlinkSync(pidFile);
        console.log('🗑️  Cleaned up PID file');
      }
    } else {
      console.log('ℹ️  No test backend PID file found (backend may have been running already)');
    }
    
    // Additional cleanup - kill any remaining uvicorn processes that might be test-related
    try {
      const { execSync } = require('child_process');
      
      // Kill any uvicorn processes on port 8000 (be careful not to kill production services)
      try {
        execSync('lsof -ti:8000 | xargs kill -9', { stdio: 'ignore' });
        console.log('🧹 Cleaned up any remaining processes on port 8000');
      } catch (error) {
        // No processes found or already cleaned up
      }
    } catch (error) {
      console.log('⚠️  Error during additional cleanup:', error.message);
    }
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't throw error to avoid failing the test run
  }
}

module.exports = globalTeardown;
const fs = require('fs');
const path = require('path');

/**
 * Service discovery utility for backend port management
 */
class ServiceDiscovery {
  constructor() {
    this.serviceFile = path.join(__dirname, '../../.service-info.json');
  }

  /**
   * Register the backend service with its port
   * @param {number} port - The port the backend is running on
   */
  registerService(port) {
    const serviceInfo = {
      backend: {
        port: port,
        url: `http://localhost:${port}`,
        status: 'running',
        startTime: new Date().toISOString(),
        pid: process.pid
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      fs.writeFileSync(this.serviceFile, JSON.stringify(serviceInfo, null, 2));
      console.log(`📝 Service registered at port ${port}`);
    } catch (error) {
      console.error('❌ Failed to register service:', error);
    }
  }

  /**
   * Get the current service information
   * @returns {Object|null} Service information or null if not found
   */
  getServiceInfo() {
    try {
      if (fs.existsSync(this.serviceFile)) {
        const data = fs.readFileSync(this.serviceFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Failed to read service info:', error);
    }
    return null;
  }

  /**
   * Clean up service registration
   */
  unregisterService() {
    try {
      if (fs.existsSync(this.serviceFile)) {
        fs.unlinkSync(this.serviceFile);
        console.log('🧹 Service unregistered');
      }
    } catch (error) {
      console.error('❌ Failed to unregister service:', error);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const cleanup = () => {
      console.log('\n🛑 Shutting down backend server...');
      this.unregisterService();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', () => this.unregisterService());
  }
}

module.exports = ServiceDiscovery;
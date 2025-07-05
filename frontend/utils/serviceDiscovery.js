/**
 * Frontend Service Discovery Utility
 * Automatically detects the backend server port and URL
 */

const DEFAULT_PORTS = [4000, 8001, 8000, 3001, 5000];
const CACHE_KEY = 'backend_service_info';
const CACHE_DURATION = 30000; // 30 seconds

class FrontendServiceDiscovery {
  constructor() {
    this.cachedInfo = null;
    this.lastCheck = 0;
  }

  /**
   * Get cached service info if still valid
   */
  getCachedInfo() {
    const now = Date.now();
    if (this.cachedInfo && (now - this.lastCheck) < CACHE_DURATION) {
      return this.cachedInfo;
    }
    return null;
  }

  /**
   * Check if a port is available and has the backend service
   */
  async checkPort(port) {
    try {
      const response = await fetch(`http://localhost:${port}/service-info`, {
        method: 'GET',
        timeout: 2000,
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          port: data.port || port,
          url: data.url || `http://localhost:${port}`,
          status: data.status || 'active',
          available: true
        };
      }
    } catch (error) {
      // Port not available or service not running
      return { port, available: false };
    }
    return { port, available: false };
  }

  /**
   * Discover the backend service automatically
   */
  async discoverBackendService() {
    // Check cache first
    const cached = this.getCachedInfo();
    if (cached) {
      return cached;
    }

    console.log('🔍 Discovering backend service...');

    // Try each port in sequence
    for (const port of DEFAULT_PORTS) {
      console.log(`   Checking port ${port}...`);
      const result = await this.checkPort(port);
      
      if (result.available) {
        console.log(`✅ Backend service found on port ${port}`);
        
        // Cache the result
        this.cachedInfo = {
          port: result.port,
          url: result.url,
          status: result.status,
          discoveredAt: new Date().toISOString()
        };
        this.lastCheck = Date.now();
        
        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(this.cachedInfo));
        }
        
        return this.cachedInfo;
      }
    }

    // If no service found, try localStorage cache
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log(`📦 Using cached backend info: ${parsed.url}`);
          return parsed;
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    // Fallback to default
    console.log('⚠️  No backend service found, using default port 4000');
    return {
      port: 4000,
      url: 'http://localhost:4000',
      status: 'unknown',
      discoveredAt: new Date().toISOString()
    };
  }

  /**
   * Get the backend API URL
   */
  async getBackendUrl() {
    const serviceInfo = await this.discoverBackendService();
    return serviceInfo.url;
  }

  /**
   * Clear cache and force rediscovery
   */
  clearCache() {
    this.cachedInfo = null;
    this.lastCheck = 0;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }
}

// Create singleton instance
const serviceDiscovery = new FrontendServiceDiscovery();

export default serviceDiscovery;
export { FrontendServiceDiscovery };
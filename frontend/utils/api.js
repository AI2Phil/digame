/**
 * Dynamic API Utility
 * Automatically discovers and connects to the backend service
 */

import serviceDiscovery from './serviceDiscovery';

class DynamicAPI {
  constructor() {
    this.baseUrl = null;
    this.initialized = false;
  }

  /**
   * Initialize the API with dynamic backend discovery
   */
  async initialize() {
    if (this.initialized && this.baseUrl) {
      return this.baseUrl;
    }

    try {
      this.baseUrl = await serviceDiscovery.getBackendUrl();
      this.initialized = true;
      console.log(`🔗 API initialized with backend: ${this.baseUrl}`);
      return this.baseUrl;
    } catch (error) {
      console.error('❌ Failed to initialize API:', error);
      // Fallback to environment variable or default
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      this.initialized = true;
      return this.baseUrl;
    }
  }

  /**
   * Make an API request with automatic backend discovery
   */
  async request(endpoint, options = {}) {
    await this.initialize();

    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // If we get a connection error, try to rediscover the backend
      if (!response.ok && response.status >= 500) {
        console.log('🔄 Backend connection issue, attempting rediscovery...');
        serviceDiscovery.clearCache();
        await this.initialize();
        
        // Retry with new URL
        const retryUrl = `${this.baseUrl}${endpoint}`;
        return await fetch(retryUrl, defaultOptions);
      }
      
      return response;
    } catch (error) {
      // Network error - try to rediscover backend
      console.log('🔄 Network error, attempting backend rediscovery...');
      serviceDiscovery.clearCache();
      await this.initialize();
      
      // Retry with new URL
      const retryUrl = `${this.baseUrl}${endpoint}`;
      return await fetch(retryUrl, defaultOptions);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get current backend URL
   */
  async getBackendUrl() {
    await this.initialize();
    return this.baseUrl;
  }

  /**
   * Force rediscovery of backend service
   */
  async rediscover() {
    serviceDiscovery.clearCache();
    this.initialized = false;
    this.baseUrl = null;
    return await this.initialize();
  }
}

// Create singleton instance
const api = new DynamicAPI();

export default api;
export { DynamicAPI };
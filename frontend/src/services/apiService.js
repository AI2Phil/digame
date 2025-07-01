/**
 * Dynamic API Service - Automatically detects correct backend port
 * Prevents hardcoded port issues and makes the application more robust
 */

class ApiService {
  constructor() {
    this.baseUrl = null;
    this.isInitialized = false;
    this.commonPorts = [8001, 8000, 3001, 5000, 4000]; // Common backend ports
  }

  /**
   * Dynamically detect the correct backend port
   */
  async initialize() {
    if (this.isInitialized && this.baseUrl) {
      return this.baseUrl;
    }

    // First try environment variable
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      try {
        await this.testConnection(envUrl);
        this.baseUrl = envUrl;
        this.isInitialized = true;
        console.log(`[API Service] Using environment URL: ${envUrl}`);
        return this.baseUrl;
      } catch (error) {
        console.warn(`[API Service] Environment URL ${envUrl} failed, trying auto-detection`);
      }
    }

    // Auto-detect by testing common ports
    for (const port of this.commonPorts) {
      const testUrl = `http://localhost:${port}`;
      try {
        await this.testConnection(testUrl);
        this.baseUrl = testUrl;
        this.isInitialized = true;
        console.log(`[API Service] Auto-detected backend at: ${testUrl}`);
        return this.baseUrl;
      } catch (error) {
        console.log(`[API Service] Port ${port} not available, trying next...`);
      }
    }

    // Fallback to default
    this.baseUrl = 'http://localhost:8001';
    console.warn(`[API Service] No backend detected, using fallback: ${this.baseUrl}`);
    return this.baseUrl;
  }

  /**
   * Test if a backend URL is responding
   */
  async testConnection(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        // 404 is acceptable - means server is running but endpoint doesn't exist
        return true;
      }
      throw new Error(`Server responded with status: ${response.status}`);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Connection timeout');
      }
      throw error;
    }
  }

  /**
   * Get the base URL, initializing if necessary
   */
  async getBaseUrl() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.baseUrl;
  }

  /**
   * Make an authenticated API request
   */
  async request(endpoint, options = {}) {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add authentication token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      return response;
    } catch (error) {
      console.error(`[API Service] Request failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Reset the service (useful for testing or when backend changes)
   */
  reset() {
    this.baseUrl = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
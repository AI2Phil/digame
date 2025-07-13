/**
 * API Client Configuration with Retry Logic
 * Handles backend connection issues and provides fallback mechanisms
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 seconds

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export const apiClient: ApiClientConfig = {
  baseURL: `${API_BASE_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Fetch with retry logic and error handling
 */
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`API call failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s between retries
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};

/**
 * Health check function to verify backend connectivity
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetchWithRetry('/health', {}, 1);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * API helper functions
 */
export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithRetry(endpoint);
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  },

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithRetry(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithRetry(endpoint, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  },
};

/**
 * Security Dashboard API
 */
export const securityApi = {
  async getDashboard() {
    return api.get('/api/security/dashboard');
  },
  
  async getHealth() {
    return api.get('/health');
  },
  
  async getAlerts() {
    return api.get('/api/security/alerts');
  },
  
  async getMetrics() {
    return api.get('/api/security/metrics');
  },
};

export default api;
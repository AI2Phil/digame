/**
 * API Client Configuration
 * Centralized HTTP client for all API requests
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage or context
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant ID if available
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', error.response.data);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common request patterns
export const apiHelpers = {
  /**
   * GET request with query parameters
   */
  get: async <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  /**
   * POST request with data
   */
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  /**
   * PUT request with data
   */
  put: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  /**
   * PATCH request with data
   */
  patch: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);
    return response.data;
  },

  /**
   * Upload file with progress tracking
   */
  upload: async <T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Download file
   */
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Export the configured client
export { apiClient };
export default apiClient;
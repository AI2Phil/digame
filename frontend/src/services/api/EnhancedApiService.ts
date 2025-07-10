import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend Axios config to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
    _retry?: boolean;
  }
}

// Types for enhanced API service
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTimeout: number;
  enableOfflineSupport: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoffFactor: number;
  maxDelay: number;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
  isRetryable: boolean;
  timestamp: number;
}

export interface OfflineQueueItem {
  id: string;
  config: AxiosRequestConfig;
  timestamp: number;
  retryCount: number;
}

// Enhanced API Service Class
export class EnhancedApiService {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private offlineQueue: OfflineQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private requestDeduplication: Map<string, Promise<any>> = new Map();
  private authToken: string | null = null;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      enableOfflineSupport: true,
      ...config
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListeners();
    this.startCacheCleanup();
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request timestamp for monitoring
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error) => Promise.reject(this.createApiError(error))
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log performance metrics
        const duration = Date.now() - response.config.metadata?.startTime;
        this.logPerformanceMetric(response.config.url || '', duration);

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshAuthToken();
            originalRequest.headers.Authorization = `Bearer ${this.authToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.handleAuthenticationError();
            return Promise.reject(this.createApiError(refreshError));
          }
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Enhanced GET method with caching and deduplication
  async get<T = any>(
    url: string, 
    config: AxiosRequestConfig = {},
    options: { 
      enableCache?: boolean;
      cacheTimeout?: number;
      enableDeduplication?: boolean;
    } = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey('GET', url, config.params);
    const enableCache = options.enableCache ?? this.config.enableCaching;
    const enableDeduplication = options.enableDeduplication ?? true;

    // Check cache first
    if (enableCache) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check for duplicate requests
    if (enableDeduplication && this.requestDeduplication.has(cacheKey)) {
      return this.requestDeduplication.get(cacheKey);
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>('GET', url, undefined, config);

    // Store for deduplication
    if (enableDeduplication) {
      this.requestDeduplication.set(cacheKey, requestPromise);
    }

    try {
      const response = await requestPromise;

      // Cache the response
      if (enableCache) {
        this.setCache(cacheKey, response, options.cacheTimeout);
      }

      return response;
    } finally {
      // Clean up deduplication
      if (enableDeduplication) {
        this.requestDeduplication.delete(cacheKey);
      }
    }
  }

  // Enhanced POST method
  async post<T = any>(
    url: string, 
    data?: any, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.executeRequest<T>('POST', url, data, config);
  }

  // Enhanced PUT method
  async put<T = any>(
    url: string, 
    data?: any, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.executeRequest<T>('PUT', url, data, config);
  }

  // Enhanced DELETE method
  async delete<T = any>(
    url: string, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.executeRequest<T>('DELETE', url, undefined, config);
  }

  // Execute request with retry logic and offline support
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const requestConfig: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url,
      data,
      ...config,
    };

    // Handle offline scenarios
    if (!this.isOnline && this.config.enableOfflineSupport) {
      if (method === 'GET') {
        // Try to serve from cache for GET requests
        const cacheKey = this.generateCacheKey(method, url, config.params);
        const cachedData = this.getFromCache<T>(cacheKey, true); // Allow stale data
        if (cachedData) {
          return cachedData;
        }
      } else {
        // Queue non-GET requests for later
        this.addToOfflineQueue(requestConfig);
        throw this.createApiError(new Error('Request queued for when online'), 'OFFLINE_QUEUED');
      }
    }

    return this.executeWithRetry<T>(requestConfig);
  }

  // Execute request with retry logic
  private async executeWithRetry<T>(
    config: AxiosRequestConfig,
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      const apiError = this.createApiError(error);

      // Determine if we should retry
      if (this.shouldRetry(apiError, retryCount)) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.sleep(delay);
        return this.executeWithRetry<T>(config, retryCount + 1);
      }

      throw apiError;
    }
  }

  // Determine if request should be retried
  private shouldRetry(error: ApiError, retryCount: number): boolean {
    if (retryCount >= this.config.retryAttempts) {
      return false;
    }

    // Retry on network errors, timeouts, and 5xx errors
    return error.isRetryable;
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = this.config.retryDelay;
    const backoffFactor = 2;
    const maxDelay = 30000; // 30 seconds

    const delay = baseDelay * Math.pow(backoffFactor, retryCount);
    return Math.min(delay, maxDelay);
  }

  // Create standardized API error
  private createApiError(error: any, code?: string): ApiError {
    const axiosError = error as AxiosError;
    
    let message = 'An unexpected error occurred';
    let status: number | undefined;
    let details: any;
    let isRetryable = false;

    if (axiosError.response) {
      // Server responded with error status
      status = axiosError.response.status;
      const responseData = axiosError.response.data as any;
      message = responseData?.message || axiosError.message;
      details = responseData;
      isRetryable = status >= 500 || status === 429; // Retry on server errors and rate limits
    } else if (axiosError.request) {
      // Network error
      message = 'Network error - please check your connection';
      isRetryable = true;
    } else if (axiosError.code === 'ECONNABORTED') {
      // Timeout error
      message = 'Request timeout - please try again';
      isRetryable = true;
    } else {
      message = axiosError.message || message;
    }

    return {
      message,
      code: code || axiosError.code || 'UNKNOWN_ERROR',
      status,
      details,
      isRetryable,
      timestamp: Date.now(),
    };
  }

  // Cache management methods
  private generateCacheKey(method: string, url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  private getFromCache<T>(key: string, allowStale: boolean = false): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (!allowStale && now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T, timeout?: number): void {
    const cacheTimeout = timeout || this.config.cacheTimeout;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTimeout,
    };
    this.cache.set(key, entry);
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      this.cache.forEach((entry, key) => {
        if (now > entry.expiresAt) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.cache.delete(key));
    }, 60000); // Clean up every minute
  }

  // Offline queue management
  private addToOfflineQueue(config: AxiosRequestConfig): void {
    const queueItem: OfflineQueueItem = {
      id: this.generateUniqueId(),
      config,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.offlineQueue.push(queueItem);
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        await this.axiosInstance(item.config);
      } catch (error) {
        // Re-queue if retryable
        if (item.retryCount < this.config.retryAttempts) {
          item.retryCount++;
          this.offlineQueue.push(item);
        }
      }
    }
  }

  // Authentication methods
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private async refreshAuthToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshTokenPromise;
      this.authToken = newToken;
      return newToken;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    // Implementation depends on your auth system
    // This is a placeholder - replace with actual token refresh logic
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const newToken = response.data.access_token;
    localStorage.setItem('accessToken', newToken);
    return newToken;
  }

  private handleAuthenticationError(): void {
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Emit event for app to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  // Utility methods
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logPerformanceMetric(url: string, duration: number): void {
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow API request: ${url} took ${duration}ms`);
    }
  }

  // Public utility methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  isOffline(): boolean {
    return !this.isOnline;
  }
}

// Create singleton instance
export const apiService = new EnhancedApiService();

// Export convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig, options?: any) => 
    apiService.get<T>(url, config, options),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiService.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiService.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiService.delete<T>(url, config),
  setAuthToken: (token: string) => apiService.setAuthToken(token),
  clearCache: () => apiService.clearCache(),
  getCacheStats: () => apiService.getCacheStats(),
  getOfflineQueueSize: () => apiService.getOfflineQueueSize(),
  isOffline: () => apiService.isOffline(),
};

export default apiService;
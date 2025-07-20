/**
 * Dynamic API Configuration
 * Centralized configuration for API endpoints with environment detection
 */

// Detect environment and set appropriate API base URL
const getApiBaseUrl = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Try to detect backend port from current URL or environment
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    // Default to port 8000 for backend
    return `${currentProtocol}//${currentHost}:8000`;
  }
  
  // Server-side default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  
  // Common headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoint mappings - map frontend calls to actual backend endpoints
  ENDPOINTS: {
    // Admin endpoints
    ADMIN_USERS_STATS: '/admin/users/stats',
    ADMIN_USERS_BULK: '/admin/users/bulk-action',
    ADMIN_USERS_COMPREHENSIVE: '/admin/users/comprehensive',
    ADMIN_USER_DETAIL: '/admin/users',
    ADMIN_ONBOARDING_ANALYTICS: '/admin/onboarding/analytics/detailed',
    ADMIN_SYSTEM_ANALYTICS: '/admin/system/analytics/detailed',
    
    // AI endpoints
    AI_COMMUNICATION_FEATURES: '/ai/communication-style/features',
    AI_COMMUNICATION_HISTORY: '/ai/communication-style/history',
    AI_COMMUNICATION_ANALYZE: '/ai/communication-style/analyze',
    AI_EMAIL_FEATURES: '/ai/email-analysis/feature-check',
    AI_EMAIL_HISTORY: '/ai/email-analysis/history',
    AI_EMAIL_ANALYZE: '/ai/email-analysis/analyze',
    AI_LANGUAGE_FEATURES: '/ai/language/features',
    AI_MEETING_FEATURES: '/ai/meeting-insights/features',
    AI_WRITING_FEATURES: '/ai/writing-assistance/features',
    
    // Workflow endpoints
    WORKFLOW_TEMPLATES: '/api/workflow-automation/templates',
    WORKFLOW_MARKETPLACE: '/api/workflow-marketplace',
    
    // Analytics endpoints
    ADVANCED_BEHAVIORAL_ANALYSIS: '/api/v1/advanced-behavioral-analysis/analyze',
    ANALYTICS_REPORTS: '/analytics/reports',
    
    // Other endpoints
    NOTIFICATIONS: '/api/notifications',
    PERFORMANCE: '/api/performance',
    INTEGRATIONS: '/api/v1/integrations',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

// Helper function to get endpoint by key
export const getEndpoint = (key) => {
  return API_CONFIG.ENDPOINTS[key] || key;
};

// API client with automatic URL building
export const apiClient = {
  get: async (endpoint, params = {}, options = {}) => {
    const url = buildApiUrl(getEndpoint(endpoint), params);
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...API_CONFIG.HEADERS, ...options.headers },
      signal: options.signal,
    });
    return response;
  },
  
  post: async (endpoint, data = {}, options = {}) => {
    const url = buildApiUrl(getEndpoint(endpoint));
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...API_CONFIG.HEADERS, ...options.headers },
      body: JSON.stringify(data),
      signal: options.signal,
    });
    return response;
  },
  
  put: async (endpoint, data = {}, options = {}) => {
    const url = buildApiUrl(getEndpoint(endpoint));
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...API_CONFIG.HEADERS, ...options.headers },
      body: JSON.stringify(data),
      signal: options.signal,
    });
    return response;
  },
  
  delete: async (endpoint, options = {}) => {
    const url = buildApiUrl(getEndpoint(endpoint));
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...API_CONFIG.HEADERS, ...options.headers },
      signal: options.signal,
    });
    return response;
  },
};

// Legacy support - function to replace hardcoded URLs
export const replaceApiUrl = (originalUrl) => {
  // Extract the path from hardcoded URLs
  try {
    const url = new URL(originalUrl);
    const path = url.pathname + url.search;
    
    // Map common incorrect paths to correct ones
    const pathMappings = {
      '/api/admin/': '/admin/',
      '/api/ai/': '/ai/',
      '/api/workflow-automation/': '/api/workflow-automation/',
      '/api/v1/': '/api/v1/',
    };
    
    let correctedPath = path;
    Object.entries(pathMappings).forEach(([incorrect, correct]) => {
      if (correctedPath.startsWith(incorrect)) {
        correctedPath = correctedPath.replace(incorrect, correct);
      }
    });
    
    return `${API_CONFIG.BASE_URL}${correctedPath}`;
  } catch (error) {
    // If URL parsing fails, assume it's already a path
    return `${API_CONFIG.BASE_URL}${originalUrl}`;
  }
};

export default API_CONFIG;
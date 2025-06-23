// Enhanced API client with authentication support
// Handles JWT tokens, automatic token refresh, and error handling

const BASE_URL = 'http://localhost:8000'; // Full URL for backend API

// Token management utilities
const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Token refresh function
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
};

// Create headers with authentication
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Enhanced fetch with automatic token refresh
const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit,
  includeAuth: boolean = true
): Promise<Response> => {
  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...createHeaders(includeAuth),
      ...options.headers,
    },
  });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && includeAuth && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the request with the new token
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...createHeaders(true),
          ...options.headers,
        },
      });
    }
  }

  return response;
};

export const apiClient = {
  get: async <T>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    const response = await authenticatedFetch(endpoint, {
      method: 'GET',
    }, includeAuth);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
  },

  post: async <T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> => {
    const response = await authenticatedFetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
  },

  put: async <T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> => {
    const response = await authenticatedFetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
  },

  delete: async <T>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    const response = await authenticatedFetch(endpoint, {
      method: 'DELETE',
    }, includeAuth);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage);
    }
    
    // Handle empty responses for DELETE operations
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  },
};

// Export token management utilities for use in components
export { getAccessToken, getRefreshToken, setTokens, clearTokens };

// Define types based on backend models (simplified for brevity)
// Ideally, these would be shared or generated from the OpenAPI spec

export interface ProductivityChartDataPoint {
    date: string; // Assuming date strings for simplicity in frontend
    score: number;
}

export interface ProductivityChart {
    title: string;
    data: ProductivityChartDataPoint[];
}

export interface ActivityBreakdownItem {
    activity_name: string;
    duration_minutes: number;
    percentage: number;
}

export interface ActivityBreakdown {
    title: string;
    data: ActivityBreakdownItem[];
}

export interface ProductivityMetric {
    name: string;
    value: string;
    trend: string;
}

export interface ProductivityMetricsGroup {
    title: string;
    metrics: ProductivityMetric[];
}

export interface RecentActivityItem {
    id: string;
    description: string;
    timestamp: string; // Assuming datetime strings
    status: string;
}

export interface RecentActivities {
    title: string;
    activities: RecentActivityItem[];
}

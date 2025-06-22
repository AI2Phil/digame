// A very simple API client for now
// In a real app, this would use axios or a more robust fetch wrapper,
// handle errors, transformations, authentication headers, etc.

const BASE_URL = '/api/v1'; // Adjust if your FastAPI backend is served differently

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  },
};

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

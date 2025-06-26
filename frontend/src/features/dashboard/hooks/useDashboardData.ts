import { useState, useEffect } from 'react';
import {
  apiClient,
  ProductivityChart,
  ActivityBreakdown,
  ProductivityMetricsGroup,
  RecentActivities
} from '../../../services/apiClient';

// Generic hook for fetching data
function useDataFetcher<T>(endpoint: string) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiClient.get<T>(endpoint);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, isLoading, error };
}

// Specific hooks for each dashboard component
export const useProductivityChartData = () =>
  useDataFetcher<ProductivityChart>('/dashboard/productivity-chart');

export const useActivityBreakdownData = () =>
  useDataFetcher<ActivityBreakdown>('/dashboard/activity-breakdown');

export const useProductivityMetricsData = () =>
  useDataFetcher<ProductivityMetricsGroup>('/dashboard/metrics');

export const useRecentActivitiesData = () =>
  useDataFetcher<RecentActivities>('/dashboard/recent-activities');

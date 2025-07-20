import { useState, useEffect } from 'react';

// SSR-safe hook factory
const createSSRSafeHook = (defaultData = null) => {
  return () => {
    const [data, setData] = useState(defaultData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call - replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(defaultData);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      // Only run on client side to avoid SSR issues
      if (typeof window !== 'undefined') {
        refetch();
      } else {
        // On server side, just set loading to false with default data
        setIsLoading(false);
      }
    }, []);

    return { data, isLoading, error, refetch };
  };
};

// Platform Performance Metrics Hook
export const usePlatformPerformanceMetrics = createSSRSafeHook({
  avg_response_time: 120,
  response_time_trend: -15,
  response_time_history: [145, 132, 128, 120, 115, 120, 118],
  throughput_rps: 156,
  throughput_trend: 23,
  throughput_history: [120, 135, 142, 150, 148, 156, 160],
  error_rate: 0.1,
  error_rate_trend: -0.05,
  error_rate_history: [0.15, 0.12, 0.08, 0.1, 0.09, 0.1, 0.08],
  uptime_percentage: 99.9,
  uptime_trend: 0.1,
  uptime_history: [99.8, 99.9, 99.9, 99.9, 99.8, 99.9, 99.9]
});

// System Resource Metrics Hook
export const useSystemResourceMetrics = createSSRSafeHook({
  cpu_usage: 45,
  cpu_cores: 8,
  cpu_history: [42, 48, 45, 50, 43, 45, 47],
  memory_usage: 62,
  memory_total: '16 GB',
  memory_available: '6.1 GB',
  memory_history: [58, 60, 62, 65, 61, 62, 64],
  disk_usage: 34,
  disk_total: '500 GB',
  disk_available: '330 GB',
  disk_history: [32, 33, 34, 35, 33, 34, 36],
  network_usage: 28,
  network_bandwidth: '1 Gbps',
  network_throughput: '280 Mbps',
  network_history: [25, 27, 28, 30, 26, 28, 29]
});

// Database Performance Metrics Hook
export const useDatabasePerformanceMetrics = createSSRSafeHook({
  active_connections: 45,
  max_connections: 100,
  connection_usage_percentage: 45,
  avg_query_time: 25,
  slow_queries_count: 3,
  query_time_trend: -5,
  cache_hit_rate: 94.5,
  cache_hit_rate_trend: 2.1
});

// Network Metrics Hook
export const useNetworkMetrics = createSSRSafeHook({
  network_in: 125,
  network_out: 89,
  bandwidth_utilization: 28,
  active_connections: 1234,
  connection_pool_usage: 85,
  avg_latency: 45,
  packet_loss: 0.01
});

// Performance Alerts Hook
export const usePerformanceAlerts = createSSRSafeHook({
  alerts: [
    {
      severity: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 80% for the last 10 minutes'
    },
    {
      severity: 'resolved',
      title: 'Response Time Improved',
      description: 'Average response time decreased by 15ms in the last hour'
    },
    {
      severity: 'info',
      title: 'Traffic Spike Detected',
      description: 'Request volume increased by 40% compared to usual patterns'
    }
  ]
});

// General Analytics Hook
export const useAnalytics = createSSRSafeHook({
  pageViews: 12543,
  uniqueVisitors: 8921,
  bounceRate: 23.4,
  avgSessionDuration: 245,
  conversionRate: 3.2
});

export default {
  usePlatformPerformanceMetrics,
  useSystemResourceMetrics,
  useDatabasePerformanceMetrics,
  useNetworkMetrics,
  usePerformanceAlerts,
  useAnalytics
};
/**
 * Analytics React Hook
 * Provides easy access to analytics data and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, AnalyticsResponse, AnomalyResponse, PredictionResponse, InsightsReportResponse } from '../services/api/analytics';

// Query keys for React Query
export const ANALYTICS_QUERY_KEYS = {
  userBehavior: 'analytics-user-behavior',
  anomalies: 'analytics-anomalies',
  revenuePrediction: 'analytics-revenue-prediction',
  churnPrediction: 'analytics-churn-prediction',
  insightsReport: 'analytics-insights-report',
  performanceMetrics: 'analytics-performance-metrics',
  mlModelsStatus: 'analytics-ml-models-status',
  healthCheck: 'analytics-health-check',
  dashboards: 'analytics-dashboards',
  dashboard: 'analytics-dashboard',
  widgetData: 'analytics-widget-data',
  analyticsModels: 'analytics-models',
  performanceMetricsList: 'analytics-performance-metrics-list',
  roiCalculations: 'analytics-roi-calculations',
  benchmarks: 'analytics-benchmarks',
  analyticsDashboard: 'analytics-dashboard-data',
  insights: 'analytics-insights',
  userSegmentation: 'analytics-user-segmentation',
  userJourney: 'analytics-user-journey',
  contentAnalytics: 'analytics-content-analytics',
  conversionAnalytics: 'analytics-conversion-analytics',
  systemResources: 'analytics-system-resources',
  databasePerformance: 'analytics-database-performance',
  networkMetrics: 'analytics-network-metrics',
  performanceAlerts: 'analytics-performance-alerts',
} as const;

// Hook for user behavior analytics
export const useUserBehaviorAnalytics = (params: { user_id?: number; days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.userBehavior, params],
    queryFn: () => analyticsApi.analyzeUserBehavior(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for anomaly detection
export const useAnomalyDetection = (params: { metric?: string; days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.anomalies, params],
    queryFn: () => analyticsApi.detectAnomalies(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Hook for revenue prediction
export const useRevenuePrediction = (params: { days_ahead?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.revenuePrediction, params],
    queryFn: () => analyticsApi.predictRevenue(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for churn prediction
export const useChurnPrediction = (params: { user_id?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.churnPrediction, params],
    queryFn: () => analyticsApi.predictChurn(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!params.user_id, // Only run if user_id is provided
  });
};

// Hook for insights report
export const useInsightsReport = (params: { days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.insightsReport, params],
    queryFn: () => analyticsApi.generateInsightsReport(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for platform performance metrics
export const usePlatformPerformanceMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.performanceMetrics],
    queryFn: () => analyticsApi.getPlatformPerformanceMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for ML models status
export const useMLModelsStatus = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.mlModelsStatus],
    queryFn: () => analyticsApi.getMLModelsStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for analytics health check
export const useAnalyticsHealthCheck = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.healthCheck],
    queryFn: () => analyticsApi.healthCheck(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Hook for dashboards management
export const useDashboards = (params: { skip?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.dashboards, params],
    queryFn: () => analyticsApi.getDashboards(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for single dashboard
export const useDashboard = (dashboardId: number | undefined) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.dashboard, dashboardId],
    queryFn: () => analyticsApi.getDashboard(dashboardId!),
    enabled: !!dashboardId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for widget data
export const useWidgetData = (widgetId: number | undefined, filters?: Record<string, any>) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.widgetData, widgetId, filters],
    queryFn: () => analyticsApi.getWidgetData(widgetId!, filters),
    enabled: !!widgetId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for analytics models
export const useAnalyticsModels = (params: { model_type?: string; category?: string; active_only?: boolean } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.analyticsModels, params],
    queryFn: () => analyticsApi.getAnalyticsModels(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for performance metrics list
export const usePerformanceMetricsList = (params: {
  metric_type?: string;
  category?: string;
  entity_type?: string;
  entity_id?: number;
  limit?: number;
  dimension_filters?: Record<string, any>;
} = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.performanceMetricsList, params],
    queryFn: () => analyticsApi.getPerformanceMetrics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for ROI calculations
export const useROICalculations = (params: { entity_type?: string; entity_id?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.roiCalculations, params],
    queryFn: () => analyticsApi.getROICalculations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for benchmarks
export const useBenchmarks = (params: {
  metric_name: string;
  category?: string;
  industry_segment?: string;
  region?: string;
  company_size?: string;
}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.benchmarks, params],
    queryFn: () => analyticsApi.getBenchmarks(params),
    enabled: !!params.metric_name,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for analytics dashboard data
export const useAnalyticsDashboardData = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.analyticsDashboard],
    queryFn: () => analyticsApi.getAnalyticsDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for AI-powered insights
export const useAnalyticsInsights = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.insights],
    queryFn: () => analyticsApi.generateInsights(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook for user segmentation analytics
export const useUserSegmentation = (params: { days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.userSegmentation, params],
    queryFn: () => analyticsApi.getUserSegmentation(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user journey analysis
export const useUserJourneyAnalysis = (params: { days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.userJourney, params],
    queryFn: () => analyticsApi.getUserJourneyAnalysis(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for content analytics
export const useContentAnalytics = (params: { days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.contentAnalytics, params],
    queryFn: () => analyticsApi.getContentAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for conversion analytics
export const useConversionAnalytics = (params: { days?: number } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.conversionAnalytics, params],
    queryFn: () => analyticsApi.getConversionAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for system resource metrics
export const useSystemResourceMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.systemResources],
    queryFn: () => analyticsApi.getSystemResourceMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for database performance metrics
export const useDatabasePerformanceMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.databasePerformance],
    queryFn: () => analyticsApi.getDatabasePerformanceMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Hook for network metrics
export const useNetworkMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.networkMetrics],
    queryFn: () => analyticsApi.getNetworkMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Hook for performance alerts
export const usePerformanceAlerts = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.performanceAlerts],
    queryFn: () => analyticsApi.getPerformanceAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Mutation hooks for data modification

// Hook for creating dashboard
export const useCreateDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.createDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboards] });
    },
  });
};

// Hook for updating dashboard
export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dashboardId, dashboard }: { dashboardId: number; dashboard: any }) =>
      analyticsApi.updateDashboard(dashboardId, dashboard),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboards] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboard, variables.dashboardId] });
    },
  });
};

// Hook for deleting dashboard
export const useDeleteDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.deleteDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboards] });
    },
  });
};

// Hook for creating widget
export const useCreateWidget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.createWidget,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboard, variables.dashboard_id] });
    },
  });
};

// Hook for updating widget
export const useUpdateWidget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ widgetId, widget }: { widgetId: number; widget: any }) =>
      analyticsApi.updateWidget(widgetId, widget),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.widgetData, variables.widgetId] });
    },
  });
};

// Hook for deleting widget
export const useDeleteWidget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.deleteWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.dashboards] });
    },
  });
};

// Hook for training model
export const useTrainModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ modelId, params }: { modelId: number; params?: any }) =>
      analyticsApi.trainModel(modelId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.analyticsModels] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.mlModelsStatus] });
    },
  });
};

// Hook for making prediction
export const useMakePrediction = () => {
  return useMutation({
    mutationFn: ({ modelId, params }: { modelId: number; params: any }) =>
      analyticsApi.makePrediction(modelId, params),
  });
};

// Hook for recording performance metric
export const useRecordPerformanceMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.recordPerformanceMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.performanceMetricsList] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.performanceMetrics] });
    },
  });
};

// Hook for creating ROI calculation
export const useCreateROICalculation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.createROICalculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.roiCalculations] });
    },
  });
};

// Custom hook for real-time analytics updates
export const useRealTimeAnalytics = (interval: number = 30000) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  const startRealTime = useCallback(() => {
    setIsRealTime(true);
  }, []);

  const stopRealTime = useCallback(() => {
    setIsRealTime(false);
  }, []);

  useEffect(() => {
    if (!isRealTime) return;

    const intervalId = setInterval(() => {
      // Invalidate real-time queries
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.performanceMetrics] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.anomalies] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.userBehavior] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.healthCheck] });
    }, interval);

    return () => clearInterval(intervalId);
  }, [isRealTime, interval, queryClient]);

  return {
    isRealTime,
    startRealTime,
    stopRealTime,
  };
};

// Custom hook for analytics configuration
export const useAnalyticsConfig = () => {
  const queryClient = useQueryClient();
  
  const configureAnalytics = useMutation({
    mutationFn: analyticsApi.configureAnalytics,
    onSuccess: () => {
      // Invalidate relevant queries after configuration change
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.mlModelsStatus] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.healthCheck] });
    },
  });

  return {
    configureAnalytics,
  };
};

// Export all hooks
export default {
  useUserBehaviorAnalytics,
  useAnomalyDetection,
  useRevenuePrediction,
  useChurnPrediction,
  useInsightsReport,
  usePlatformPerformanceMetrics,
  useMLModelsStatus,
  useAnalyticsHealthCheck,
  useDashboards,
  useDashboard,
  useWidgetData,
  useAnalyticsModels,
  usePerformanceMetricsList,
  useROICalculations,
  useBenchmarks,
  useAnalyticsDashboardData,
  useAnalyticsInsights,
  useUserSegmentation,
  useUserJourneyAnalysis,
  useContentAnalytics,
  useConversionAnalytics,
  useSystemResourceMetrics,
  useDatabasePerformanceMetrics,
  useNetworkMetrics,
  usePerformanceAlerts,
  useCreateDashboard,
  useUpdateDashboard,
  useDeleteDashboard,
  useCreateWidget,
  useUpdateWidget,
  useDeleteWidget,
  useTrainModel,
  useMakePrediction,
  useRecordPerformanceMetric,
  useCreateROICalculation,
  useRealTimeAnalytics,
  useAnalyticsConfig,
};
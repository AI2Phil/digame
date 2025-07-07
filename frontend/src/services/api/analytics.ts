/**
 * Analytics API Service
 * Connects frontend analytics components to backend advanced analytics endpoints
 */

import { apiClient } from './client';

export interface AnalyticsRequest {
  analytics_type: string;
  user_id?: number;
  days?: number;
  parameters?: Record<string, any>;
}

export interface AnalyticsResponse {
  analytics_type: string;
  timestamp: string;
  data: Record<string, any>;
  confidence: number;
  insights: string[];
  recommendations: string[];
}

export interface AnomalyResponse {
  timestamp: string;
  metric_name: string;
  value: number;
  expected_range: [number, number];
  anomaly_score: number;
  severity: string;
  description: string;
}

export interface PredictionResponse {
  metric: string;
  predicted_value: number;
  confidence_interval: [number, number];
  prediction_date: string;
  model_accuracy: number;
  factors: Array<Record<string, any>>;
}

export interface InsightsReportResponse {
  report_date: string;
  period_days: number;
  user_behavior: Record<string, any>;
  anomalies: Array<Record<string, any>>;
  churn_analysis: Record<string, any>;
  revenue_prediction?: Record<string, any>;
  key_insights: string[];
  recommendations: string[];
  ml_enabled: boolean;
}

export interface DashboardData {
  id?: number;
  name: string;
  description?: string;
  tags?: string[];
  layout: LayoutItem[];
  widgets: WidgetConfig[];
}

export interface LayoutItem {
  widget_config_id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface WidgetConfig {
  id?: number;
  widget_type: string;
  title: string;
  data_source_config: DataSourceConfig;
  display_options: Record<string, any>;
}

export interface DataSourceConfig {
  type: string;
  params: Record<string, any>;
}

class AnalyticsAPI {
  // Advanced Analytics Endpoints
  
  /**
   * Analyze user behavior patterns with ML clustering
   */
  async analyzeUserBehavior(params: {
    user_id?: number;
    days?: number;
  } = {}): Promise<AnalyticsResponse> {
    const response = await apiClient.get('/advanced-analytics/user-behavior', {
      params
    });
    return response.data;
  }

  /**
   * Detect anomalies in platform metrics using ML models
   */
  async detectAnomalies(params: {
    metric?: string;
    days?: number;
  } = {}): Promise<AnomalyResponse[]> {
    const response = await apiClient.get('/advanced-analytics/anomaly-detection', {
      params: {
        metric: params.metric || 'user_activity',
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Predict future revenue using ML models
   */
  async predictRevenue(params: {
    days_ahead?: number;
  } = {}): Promise<PredictionResponse> {
    const response = await apiClient.get('/advanced-analytics/revenue-prediction', {
      params: {
        days_ahead: params.days_ahead || 30
      }
    });
    return response.data;
  }

  /**
   * Predict user churn probability with risk assessment
   */
  async predictChurn(params: {
    user_id?: number;
  } = {}): Promise<any> {
    const response = await apiClient.get('/advanced-analytics/churn-prediction', {
      params
    });
    return response.data;
  }

  /**
   * Generate comprehensive analytics insights report
   */
  async generateInsightsReport(params: {
    days?: number;
  } = {}): Promise<InsightsReportResponse> {
    const response = await apiClient.get('/advanced-analytics/insights-report', {
      params: {
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Get platform performance metrics and optimization suggestions
   */
  async getPlatformPerformanceMetrics(): Promise<any> {
    const response = await apiClient.get('/advanced-analytics/performance-metrics');
    return response.data;
  }

  /**
   * Get status of ML models and capabilities
   */
  async getMLModelsStatus(): Promise<any> {
    const response = await apiClient.get('/advanced-analytics/ml-models/status');
    return response.data;
  }

  /**
   * Configure advanced analytics settings
   */
  async configureAnalytics(config: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/advanced-analytics/configure', config);
    return response.data;
  }

  /**
   * Health check for analytics services and dependencies
   */
  async healthCheck(): Promise<any> {
    const response = await apiClient.get('/advanced-analytics/health');
    return response.data;
  }

  // Dashboard Management Endpoints

  /**
   * Get all dashboards for the current user
   */
  async getDashboards(params: {
    skip?: number;
    limit?: number;
  } = {}): Promise<DashboardData[]> {
    const response = await apiClient.get('/api/analytics/dashboards', {
      params: {
        skip: params.skip || 0,
        limit: params.limit || 100
      }
    });
    return response.data;
  }

  /**
   * Get a specific dashboard by ID
   */
  async getDashboard(dashboardId: number): Promise<DashboardData> {
    const response = await apiClient.get(`/api/analytics/dashboards/${dashboardId}`);
    return response.data;
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(dashboard: Omit<DashboardData, 'id'>): Promise<DashboardData> {
    const response = await apiClient.post('/api/analytics/dashboards', dashboard);
    return response.data;
  }

  /**
   * Update an existing dashboard
   */
  async updateDashboard(dashboardId: number, dashboard: Partial<DashboardData>): Promise<DashboardData> {
    const response = await apiClient.put(`/api/analytics/dashboards/${dashboardId}`, dashboard);
    return response.data;
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(dashboardId: number): Promise<void> {
    await apiClient.delete(`/api/analytics/dashboards/${dashboardId}`);
  }

  /**
   * Update dashboard layout
   */
  async updateDashboardLayout(dashboardId: number, layout: LayoutItem[]): Promise<DashboardData> {
    const response = await apiClient.put(`/api/analytics/dashboards/${dashboardId}/layout`, {
      layout
    });
    return response.data;
  }

  // Widget Management Endpoints

  /**
   * Create a new widget
   */
  async createWidget(widget: WidgetConfig & { dashboard_id: number }): Promise<WidgetConfig> {
    const response = await apiClient.post('/api/analytics/widgets', widget);
    return response.data;
  }

  /**
   * Update an existing widget
   */
  async updateWidget(widgetId: number, widget: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const response = await apiClient.put(`/api/analytics/widgets/${widgetId}`, widget);
    return response.data;
  }

  /**
   * Delete a widget
   */
  async deleteWidget(widgetId: number): Promise<void> {
    await apiClient.delete(`/api/analytics/widgets/${widgetId}`);
  }

  /**
   * Get widget data based on its configuration
   */
  async getWidgetData(widgetId: number, filters?: Record<string, any>): Promise<any> {
    const response = await apiClient.get(`/api/analytics/widgets/${widgetId}/data`, {
      params: filters
    });
    return response.data;
  }

  // Analytics Models Management

  /**
   * Get analytics models for the tenant
   */
  async getAnalyticsModels(params: {
    model_type?: string;
    category?: string;
    active_only?: boolean;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/api/analytics/models', {
      params
    });
    return response.data;
  }

  /**
   * Create a new analytics model
   */
  async createAnalyticsModel(modelData: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/api/analytics/models', modelData);
    return response.data;
  }

  /**
   * Train an analytics model
   */
  async trainModel(modelId: number, params: {
    triggered_by?: string;
  } = {}): Promise<any> {
    const response = await apiClient.post(`/api/analytics/models/${modelId}/train`, params);
    return response.data;
  }

  /**
   * Make a prediction using a trained model
   */
  async makePrediction(modelId: number, params: {
    entity_type: string;
    entity_id: number;
    input_features: Record<string, any>;
    prediction_horizon_days?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/api/analytics/models/${modelId}/predict`, params);
    return response.data;
  }

  // Performance Metrics

  /**
   * Record a performance metric
   */
  async recordPerformanceMetric(metricData: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/api/analytics/performance-metrics', metricData);
    return response.data;
  }

  /**
   * Get performance metrics with filtering
   */
  async getPerformanceMetrics(params: {
    metric_type?: string;
    category?: string;
    entity_type?: string;
    entity_id?: number;
    limit?: number;
    dimension_filters?: Record<string, any>;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/api/analytics/performance-metrics', {
      params
    });
    return response.data;
  }

  // ROI Calculations

  /**
   * Create a new ROI calculation
   */
  async createROICalculation(roiData: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/api/analytics/roi-calculations', roiData);
    return response.data;
  }

  /**
   * Get ROI calculations
   */
  async getROICalculations(params: {
    entity_type?: string;
    entity_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/api/analytics/roi-calculations', {
      params
    });
    return response.data;
  }

  /**
   * Calculate portfolio ROI across multiple entities
   */
  async calculatePortfolioROI(entityIds: number[]): Promise<any> {
    const response = await apiClient.post('/api/analytics/roi-calculations/portfolio', {
      entity_ids: entityIds
    });
    return response.data;
  }

  // Comparative Benchmarking

  /**
   * Add new benchmark data
   */
  async addBenchmarkData(benchmarkData: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/api/analytics/benchmarks', benchmarkData);
    return response.data;
  }

  /**
   * Get relevant benchmarks
   */
  async getBenchmarks(params: {
    metric_name: string;
    category?: string;
    industry_segment?: string;
    region?: string;
    company_size?: string;
  }): Promise<any[]> {
    const response = await apiClient.get('/api/analytics/benchmarks', {
      params
    });
    return response.data;
  }

  /**
   * Compare performance metric with benchmarks
   */
  async compareWithBenchmarks(metricId: number, benchmarkParams?: Record<string, any>): Promise<any[]> {
    const response = await apiClient.post(`/api/analytics/performance-metrics/${metricId}/compare`, {
      benchmark_params: benchmarkParams
    });
    return response.data;
  }

  // Analytics Dashboard Data

  /**
   * Get comprehensive analytics dashboard data
   */
  async getAnalyticsDashboard(): Promise<any> {
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  }

  /**
   * Generate AI-powered insights from analytics data
   */
  async generateInsights(): Promise<any[]> {
    const response = await apiClient.get('/api/analytics/insights');
    return response.data;
  }

  // Multi-dimensional Metrics

  /**
   * Calculate multi-dimensional metrics based on model configuration
   */
  async calculateMultiDimensionalMetrics(modelId: number, dataRecords: Record<string, any>[]): Promise<any[]> {
    const response = await apiClient.post(`/api/analytics/models/${modelId}/multi-dimensional`, {
      data_records: dataRecords
    });
    return response.data;
  }

  // Additional Analytics Endpoints for Component Integration

  /**
   * Get user segmentation analytics
   */
  async getUserSegmentation(params: { days?: number } = {}): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/user-segmentation', {
      params: {
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Get user journey analysis
   */
  async getUserJourneyAnalysis(params: { days?: number } = {}): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/user-journey', {
      params: {
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(params: { days?: number } = {}): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/content-analytics', {
      params: {
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Get conversion analytics
   */
  async getConversionAnalytics(params: { days?: number } = {}): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/conversion-analytics', {
      params: {
        days: params.days || 30
      }
    });
    return response.data;
  }

  /**
   * Get system resource metrics
   */
  async getSystemResourceMetrics(): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/system-resources');
    return response.data;
  }

  /**
   * Get database performance metrics
   */
  async getDatabasePerformanceMetrics(): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/database-performance');
    return response.data;
  }

  /**
   * Get network metrics
   */
  async getNetworkMetrics(): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/network-metrics');
    return response.data;
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(): Promise<any> {
    const response = await apiClient.get('/api/analytics/advanced-analytics/performance-alerts');
    return response.data;
  }

  // Dashboard Export and Sharing

  /**
   * Export dashboard data in various formats
   */
  async exportDashboard(dashboardId: number, format: string = 'json'): Promise<any> {
    const response = await apiClient.get(`/api/analytics/dashboards/${dashboardId}/export`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    });
    return response.data;
  }

  /**
   * Share dashboard with other users
   */
  async shareDashboard(dashboardId: number, shareData: {
    user_emails?: string[];
    permissions: string;
    expires_at?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/api/analytics/dashboards/${dashboardId}/share`, shareData);
    return response.data;
  }

  /**
   * Revoke dashboard share access
   */
  async revokeDashboardShare(dashboardId: number, shareId: number): Promise<void> {
    await apiClient.delete(`/api/analytics/dashboards/${dashboardId}/share/${shareId}`);
  }
}

export const analyticsApi = new AnalyticsAPI();
export default analyticsApi;
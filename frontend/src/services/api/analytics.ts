import { apiClient } from '../apiClient';

export interface Dashboard {
  id: number;
  dashboard_uuid: string;
  tenant_id: number;
  user_id: number;
  name: string;
  description?: string;
  tags: string[];
  layout: LayoutItem[];
  widgets: Widget[];
  created_at: string;
  updated_at: string;
}

export interface LayoutItem {
  widget_config_id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface Widget {
  id: number;
  widget_uuid: string;
  dashboard_id: number;
  tenant_id: number;
  widget_type: string;
  title: string;
  data_source_config: {
    type: string;
    params: Record<string, any>;
  };
  display_options: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WidgetData {
  widget_id: number;
  widget_title: string;
  widget_type: string;
  widget_uuid: string;
  data_source_config: any;
  display_options: any;
  data: any;
  metadata: {
    widget_created: string;
    widget_updated: string;
    data_source_type: string;
    data_count?: number;
    data_type: string;
    has_error?: boolean;
    error_message?: string;
    personalized?: boolean;
    user_context_keys?: string[];
  };
  last_updated: string;
  cache_info: {
    from_cache: boolean;
    refresh_requested: boolean;
  };
}

export interface DashboardFilters {
  filters?: Record<string, any>;
  timeRange?: {
    start_date?: string;
    end_date?: string;
    period?: string;
  };
  refresh_cache?: boolean;
}

export interface ReportSchedule {
  id: number;
  schedule_uuid: string;
  tenant_id: number;
  report_definition_id: number;
  cron_schedule: string;
  recipients: string[];
  is_active: boolean;
  next_run_time?: string;
  last_run_time?: string;
  last_run_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportDefinition {
  id: number;
  definition_uuid: string;
  tenant_id: number;
  user_id: number;
  name: string;
  description?: string;
  report_type: string;
  content_blocks: ReportContentBlock[];
  global_filters: ReportFilter[];
  output_format: string;
  created_at: string;
  updated_at: string;
}

export interface ReportContentBlock {
  title?: string;
  block_type: string;
  data_source?: {
    type: string;
    query_params: Record<string, any>;
  };
  display_options: Record<string, any>;
  text_content?: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

class AnalyticsApi {
  // Dashboard Management
  async getDashboards(): Promise<Dashboard[]> {
    return await apiClient.get<Dashboard[]>('/analytics/dashboards');
  }

  async getDashboard(id: number): Promise<Dashboard> {
    return await apiClient.get<Dashboard>(`/analytics/dashboards/${id}`);
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    return await apiClient.post<Dashboard>('/analytics/dashboards', dashboard);
  }

  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    return await apiClient.put<Dashboard>(`/analytics/dashboards/${id}`, dashboard);
  }

  async deleteDashboard(id: number): Promise<void> {
    await apiClient.delete<void>(`/analytics/dashboards/${id}`);
  }

  async updateDashboardLayout(id: number, layout: LayoutItem[]): Promise<Dashboard> {
    return await apiClient.put<Dashboard>(`/analytics/dashboards/${id}/layout`, layout);
  }

  // Widget Management
  async createWidget(widget: Partial<Widget>): Promise<Widget> {
    return await apiClient.post<Widget>('/analytics/dashboards/widgets', widget);
  }

  async updateWidget(id: number, widget: Partial<Widget>): Promise<Widget> {
    return await apiClient.put<Widget>(`/analytics/widgets/${id}`, widget);
  }

  async deleteWidget(id: number): Promise<void> {
    await apiClient.delete<void>(`/analytics/widgets/${id}`);
  }

  async getWidgetData(widgetId: number, options: DashboardFilters = {}): Promise<WidgetData> {
    // Note: apiClient.get doesn't support params option, so we'll build query string manually
    const queryParams = new URLSearchParams();
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        queryParams.append(`filters.${key}`, String(value));
      });
    }
    if (options.timeRange) {
      Object.entries(options.timeRange).forEach(([key, value]) => {
        queryParams.append(`timeRange.${key}`, String(value));
      });
    }
    if (options.refresh_cache) {
      queryParams.append('refresh_cache', String(options.refresh_cache));
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/analytics/widgets/${widgetId}/data${queryString ? `?${queryString}` : ''}`;
    return await apiClient.get<WidgetData>(endpoint);
  }

  async getWidgetDataBatch(widgetIds: number[], options: DashboardFilters = {}): Promise<Record<number, WidgetData>> {
    return await apiClient.post<Record<number, WidgetData>>('/analytics/widgets/batch-data', {
      widget_ids: widgetIds,
      ...options
    });
  }

  // Report Management
  async getReportDefinitions(): Promise<ReportDefinition[]> {
    return await apiClient.get<ReportDefinition[]>('/analytics/reports/definitions');
  }

  async createReportDefinition(report: Partial<ReportDefinition>): Promise<ReportDefinition> {
    return await apiClient.post<ReportDefinition>('/analytics/reports/definitions', report);
  }

  async updateReportDefinition(id: number, report: Partial<ReportDefinition>): Promise<ReportDefinition> {
    return await apiClient.put<ReportDefinition>(`/analytics/reports/definitions/${id}`, report);
  }

  async deleteReportDefinition(id: number): Promise<void> {
    await apiClient.delete<void>(`/analytics/reports/definitions/${id}`);
  }

  // Report Scheduling
  async getReportSchedules(): Promise<ReportSchedule[]> {
    return await apiClient.get<ReportSchedule[]>('/analytics/reports/schedules');
  }

  async createReportSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    return await apiClient.post<ReportSchedule>('/analytics/reports/schedules', schedule);
  }

  async updateReportSchedule(id: number, schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    return await apiClient.put<ReportSchedule>(`/analytics/reports/schedules/${id}`, schedule);
  }

  async deleteReportSchedule(id: number): Promise<void> {
    await apiClient.delete<void>(`/analytics/reports/schedules/${id}`);
  }

  // Report Generation
  async generateReport(reportId: number, options: {
    output_format?: string;
    filters?: Record<string, any>;
    time_range?: any;
  } = {}): Promise<{ report_id: string; download_url: string }> {
    return await apiClient.post<{ report_id: string; download_url: string }>(`/analytics/reports/generate/${reportId}`, options);
  }

  async generateAdHocReport(definition: Partial<ReportDefinition>, options: {
    output_format?: string;
    filters?: Record<string, any>;
  } = {}): Promise<{ report_id: string; download_url: string }> {
    return await apiClient.post<{ report_id: string; download_url: string }>('/analytics/reports/generate-adhoc', {
      ad_hoc_definition: definition,
      ...options
    });
  }

  // Dashboard Export
  async exportDashboard(dashboardId: number, options: {
    format: 'pdf' | 'png' | 'json';
    include_data?: boolean;
    time_range?: any;
    filters?: Record<string, any>;
  }): Promise<{ download_url: string }> {
    return await apiClient.post<{ download_url: string }>(`/analytics/dashboards/${dashboardId}/export`, options);
  }

  // Dashboard Templates
  async getDashboardTemplates(): Promise<Dashboard[]> {
    return await apiClient.get<Dashboard[]>('/analytics/dashboard-templates');
  }

  async createDashboardFromTemplate(templateId: number, name: string): Promise<Dashboard> {
    return await apiClient.post<Dashboard>('/analytics/dashboards/from-template', {
      template_id: templateId,
      name
    });
  }

  // Dashboard Sharing
  async shareDashboard(dashboardId: number, options: {
    share_type: 'public' | 'private';
    recipients?: string[];
    permissions?: string[];
    expires_at?: string;
  }): Promise<{ share_url: string; share_token: string }> {
    return await apiClient.post<{ share_url: string; share_token: string }>(`/analytics/dashboards/${dashboardId}/share`, options);
  }

  async revokeDashboardShare(dashboardId: number, shareToken: string): Promise<void> {
    await apiClient.delete<void>(`/analytics/dashboards/${dashboardId}/share/${shareToken}`);
  }

  // Performance Metrics
  async getPerformanceMetrics(filters: {
    metric_type?: string;
    category?: string;
    entity_type?: string;
    entity_id?: number;
    limit?: number;
    [key: string]: any; // For dimension filters
  } = {}): Promise<any[]> {
    // Build query string manually since apiClient.get doesn't support params
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/analytics/metrics${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ metrics: any[] }>(endpoint);
    return response.metrics;
  }

  async createPerformanceMetric(metric: any): Promise<any> {
    const response = await apiClient.post<{ metric: any }>('/analytics/metrics', metric);
    return response.metric;
  }

  // Analytics Models
  async getAnalyticsModels(filters: {
    model_type?: string;
    category?: string;
    active_only?: boolean;
  } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/analytics/models${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ models: any[] }>(endpoint);
    return response.models;
  }

  // Predictions
  async getPredictions(filters: {
    model_id?: number;
    entity_type?: string;
    entity_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/analytics/predictions${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ predictions: any[] }>(endpoint);
    return response.predictions;
  }

  // ROI Calculations
  async getROICalculations(filters: {
    entity_type?: string;
    entity_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/analytics/roi${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ roi_calculations: any[] }>(endpoint);
    return response.roi_calculations;
  }
}

export const analyticsApi = new AnalyticsApi();
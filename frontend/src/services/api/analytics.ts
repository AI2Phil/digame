import { apiClient } from './client';

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
    const response = await apiClient.get('/analytics/dashboards');
    return response.data;
  }

  async getDashboard(id: number): Promise<Dashboard> {
    const response = await apiClient.get(`/analytics/dashboards/${id}`);
    return response.data;
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await apiClient.post('/analytics/dashboards', dashboard);
    return response.data;
  }

  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await apiClient.put(`/analytics/dashboards/${id}`, dashboard);
    return response.data;
  }

  async deleteDashboard(id: number): Promise<void> {
    await apiClient.delete(`/analytics/dashboards/${id}`);
  }

  async updateDashboardLayout(id: number, layout: LayoutItem[]): Promise<Dashboard> {
    const response = await apiClient.put(`/analytics/dashboards/${id}/layout`, layout);
    return response.data;
  }

  // Widget Management
  async createWidget(widget: Partial<Widget>): Promise<Widget> {
    const response = await apiClient.post('/analytics/dashboards/widgets', widget);
    return response.data;
  }

  async updateWidget(id: number, widget: Partial<Widget>): Promise<Widget> {
    const response = await apiClient.put(`/analytics/widgets/${id}`, widget);
    return response.data;
  }

  async deleteWidget(id: number): Promise<void> {
    await apiClient.delete(`/analytics/widgets/${id}`);
  }

  async getWidgetData(widgetId: number, options: DashboardFilters = {}): Promise<WidgetData> {
    const response = await apiClient.get(`/analytics/widgets/${widgetId}/data`, {
      params: options
    });
    return response.data;
  }

  async getWidgetDataBatch(widgetIds: number[], options: DashboardFilters = {}): Promise<Record<number, WidgetData>> {
    const response = await apiClient.post('/analytics/widgets/batch-data', {
      widget_ids: widgetIds,
      ...options
    });
    return response.data;
  }

  // Report Management
  async getReportDefinitions(): Promise<ReportDefinition[]> {
    const response = await apiClient.get('/analytics/reports/definitions');
    return response.data;
  }

  async createReportDefinition(report: Partial<ReportDefinition>): Promise<ReportDefinition> {
    const response = await apiClient.post('/analytics/reports/definitions', report);
    return response.data;
  }

  async updateReportDefinition(id: number, report: Partial<ReportDefinition>): Promise<ReportDefinition> {
    const response = await apiClient.put(`/analytics/reports/definitions/${id}`, report);
    return response.data;
  }

  async deleteReportDefinition(id: number): Promise<void> {
    await apiClient.delete(`/analytics/reports/definitions/${id}`);
  }

  // Report Scheduling
  async getReportSchedules(): Promise<ReportSchedule[]> {
    const response = await apiClient.get('/analytics/reports/schedules');
    return response.data;
  }

  async createReportSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const response = await apiClient.post('/analytics/reports/schedules', schedule);
    return response.data;
  }

  async updateReportSchedule(id: number, schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const response = await apiClient.put(`/analytics/reports/schedules/${id}`, schedule);
    return response.data;
  }

  async deleteReportSchedule(id: number): Promise<void> {
    await apiClient.delete(`/analytics/reports/schedules/${id}`);
  }

  // Report Generation
  async generateReport(reportId: number, options: {
    output_format?: string;
    filters?: Record<string, any>;
    time_range?: any;
  } = {}): Promise<{ report_id: string; download_url: string }> {
    const response = await apiClient.post(`/analytics/reports/generate/${reportId}`, options);
    return response.data;
  }

  async generateAdHocReport(definition: Partial<ReportDefinition>, options: {
    output_format?: string;
    filters?: Record<string, any>;
  } = {}): Promise<{ report_id: string; download_url: string }> {
    const response = await apiClient.post('/analytics/reports/generate-adhoc', {
      ad_hoc_definition: definition,
      ...options
    });
    return response.data;
  }

  // Dashboard Export
  async exportDashboard(dashboardId: number, options: {
    format: 'pdf' | 'png' | 'json';
    include_data?: boolean;
    time_range?: any;
    filters?: Record<string, any>;
  }): Promise<{ download_url: string }> {
    const response = await apiClient.post(`/analytics/dashboards/${dashboardId}/export`, options);
    return response.data;
  }

  // Dashboard Templates
  async getDashboardTemplates(): Promise<Dashboard[]> {
    const response = await apiClient.get('/analytics/dashboard-templates');
    return response.data;
  }

  async createDashboardFromTemplate(templateId: number, name: string): Promise<Dashboard> {
    const response = await apiClient.post('/analytics/dashboards/from-template', {
      template_id: templateId,
      name
    });
    return response.data;
  }

  // Dashboard Sharing
  async shareDashboard(dashboardId: number, options: {
    share_type: 'public' | 'private';
    recipients?: string[];
    permissions?: string[];
    expires_at?: string;
  }): Promise<{ share_url: string; share_token: string }> {
    const response = await apiClient.post(`/analytics/dashboards/${dashboardId}/share`, options);
    return response.data;
  }

  async revokeDashboardShare(dashboardId: number, shareToken: string): Promise<void> {
    await apiClient.delete(`/analytics/dashboards/${dashboardId}/share/${shareToken}`);
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
    const response = await apiClient.get('/analytics/metrics', { params: filters });
    return response.data.metrics;
  }

  async createPerformanceMetric(metric: any): Promise<any> {
    const response = await apiClient.post('/analytics/metrics', metric);
    return response.data.metric;
  }

  // Analytics Models
  async getAnalyticsModels(filters: {
    model_type?: string;
    category?: string;
    active_only?: boolean;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/analytics/models', { params: filters });
    return response.data.models;
  }

  // Predictions
  async getPredictions(filters: {
    model_id?: number;
    entity_type?: string;
    entity_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/analytics/predictions', { params: filters });
    return response.data.predictions;
  }

  // ROI Calculations
  async getROICalculations(filters: {
    entity_type?: string;
    entity_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const response = await apiClient.get('/analytics/roi', { params: filters });
    return response.data.roi_calculations;
  }
}

export const analyticsApi = new AnalyticsApi();
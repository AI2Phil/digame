import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface PerformanceMetric {
  id: number;
  tenant_id: number;
  metric_name: string;
  metric_category: string;
  metric_type: string;
  value: number;
  unit?: string;
  source?: string;
  tags: Record<string, any>;
  dimensions: Record<string, any>;
  timestamp: string;
}

export interface QueryPerformance {
  id: number;
  tenant_id: number;
  query_hash: string;
  query_text: string;
  query_type: string;
  execution_time_ms: number;
  rows_examined?: number;
  rows_returned?: number;
  endpoint?: string;
  user_id?: number;
  database_name?: string;
  table_names: string[];
  is_slow_query: boolean;
  optimization_suggestions?: string[];
  timestamp: string;
}

export interface UserExperienceMetric {
  id: number;
  tenant_id: number;
  user_id?: number;
  session_id: string;
  page_url: string;
  action_type: string;
  load_time_ms?: number;
  device_type?: string;
  browser?: string;
  error_occurred: boolean;
  error_message?: string;
  bounce: boolean;
  timestamp: string;
}

export interface SystemHealthCheck {
  id: number;
  tenant_id: number;
  check_name: string;
  check_type: string;
  component: string;
  status: string;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface PerformanceAlert {
  id: number;
  tenant_id: number;
  alert_name: string;
  metric_name: string;
  alert_type: string;
  severity: string;
  threshold_value: number;
  threshold_operator: string;
  notification_channels: string[];
  description: string;
  status: string;
  created_at: string;
}

export interface PerformanceIncident {
  id: number;
  tenant_id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  priority: string;
  status: string;
  affected_users_count?: number;
  affected_components: string[];
  business_impact?: string;
  started_at: string;
  resolved_at?: string;
}

export interface PerformanceOptimization {
  id: number;
  tenant_id: number;
  optimization_type: string;
  component: string;
  title: string;
  description: string;
  current_performance: Record<string, any>;
  expected_improvement: Record<string, any>;
  effort_estimate: string;
  priority_score: number;
  implementation_status: string;
  created_at: string;
  implemented_at?: string;
}

export interface DashboardData {
  time_range_hours: number;
  system_metrics: Record<string, {
    current: number;
    average: number;
    max: number;
    min: number;
    sample_count: number;
  }>;
  database_performance: {
    total_queries: number;
    slow_queries_count: number;
    slow_query_percentage: number;
    avg_execution_time_ms: number;
    p95_execution_time_ms: number;
    p99_execution_time_ms: number;
  };
  user_experience: {
    total_interactions: number;
    avg_load_time_ms: number;
    error_rate_percent: number;
    bounce_rate_percent: number;
    unique_users: number;
  };
  active_alerts: PerformanceAlert[];
  recent_incidents: PerformanceIncident[];
  trends: {
    response_time_trend: string;
    error_rate_trend: string;
    throughput_trend: string;
  };
  last_updated: string;
}

export interface SystemHealthStatus {
  overall_status: string;
  components: Record<string, {
    status: string;
    last_check: string;
    response_time_ms: number;
    error_message?: string;
  }>;
  last_check: string;
}

export interface QueryOptimizationRecommendation {
  query_hash: string;
  query_text: string;
  query_type: string;
  frequency: number;
  avg_execution_time_ms: number;
  max_execution_time_ms: number;
  impact_score: number;
  tables: string[];
  optimization_suggestions: string[];
  priority: string;
}

export interface UserExperienceInsights {
  time_range_hours: number;
  total_interactions: number;
  error_rate_percent: number;
  bounce_rate_percent: number;
  slow_pages: Array<{
    page: string;
    avg_load_time_ms: number;
    sample_count: number;
    p95_load_time_ms: number;
  }>;
  device_performance: Record<string, {
    avg_load_time_ms: number;
    sample_count: number;
  }>;
  recommendations: string[];
}

class PerformanceApi {
  private baseURL: string;
  private tenantId: number = 1; // Default tenant ID

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/performance`;
  }

  setTenantId(tenantId: number) {
    this.tenantId = tenantId;
  }

  // Performance Metrics
  async recordMetric(data: {
    metric_name: string;
    value: number;
    metric_category?: string;
    metric_type?: string;
    unit?: string;
    source?: string;
    tags?: Record<string, any>;
    dimensions?: Record<string, any>;
  }) {
    return axios.post(`${this.baseURL}/metrics?tenant_id=${this.tenantId}`, data);
  }

  async recordBulkMetrics(metrics: Array<{
    metric_name: string;
    value: number;
    metric_category?: string;
    metric_type?: string;
    unit?: string;
    source?: string;
    tags?: Record<string, any>;
    dimensions?: Record<string, any>;
  }>) {
    return axios.post(`${this.baseURL}/metrics/bulk?tenant_id=${this.tenantId}`, {
      metrics
    });
  }

  // Query Performance
  async recordQueryPerformance(data: {
    query_text: string;
    execution_time_ms: number;
    rows_examined?: number;
    rows_returned?: number;
    endpoint?: string;
    user_id?: number;
    database_name?: string;
    table_names?: string[];
  }) {
    return axios.post(`${this.baseURL}/query-performance?tenant_id=${this.tenantId}`, data);
  }

  async getQueryOptimizationRecommendations(limit: number = 20) {
    return axios.get<QueryOptimizationRecommendation[]>(
      `${this.baseURL}/query-optimization?tenant_id=${this.tenantId}&limit=${limit}`
    );
  }

  // User Experience
  async recordUserExperience(data: {
    user_id?: number;
    session_id: string;
    page_url: string;
    action_type: string;
    load_time_ms?: number;
    device_type?: string;
    browser?: string;
    error_occurred?: boolean;
    error_message?: string;
  }) {
    return axios.post(`${this.baseURL}/user-experience?tenant_id=${this.tenantId}`, data);
  }

  async getUserExperienceInsights(timeRangeHours: number = 24) {
    return axios.get<UserExperienceInsights>(
      `${this.baseURL}/user-experience/insights?tenant_id=${this.tenantId}&time_range_hours=${timeRangeHours}`
    );
  }

  // System Health
  async getSystemHealth() {
    return axios.get<SystemHealthStatus>(
      `${this.baseURL}/health/status?tenant_id=${this.tenantId}`
    );
  }

  async performHealthCheck(data: {
    check_name: string;
    check_type: string;
    component: string;
  }) {
    return axios.post(`${this.baseURL}/health/check?tenant_id=${this.tenantId}`, data);
  }

  // Dashboard
  async getDashboard(timeRangeHours: number = 24) {
    return axios.get<DashboardData>(
      `${this.baseURL}/dashboard?tenant_id=${this.tenantId}&time_range_hours=${timeRangeHours}`
    );
  }

  // Alerts
  async createAlert(data: {
    alert_name: string;
    threshold_value?: number;
    threshold_operator: string;
    severity: string;
    notification_channels?: string[];
  }) {
    return axios.post(`${this.baseURL}/alerts?tenant_id=${this.tenantId}`, data);
  }

  async checkAlerts() {
    return axios.get(`${this.baseURL}/alerts/check?tenant_id=${this.tenantId}`);
  }

  // Incidents
  async createIncident(data: {
    title: string;
    description?: string;
    severity: string;
    category?: string;
    priority: string;
    affected_users_count?: number;
    affected_components?: string[];
    business_impact?: string;
  }) {
    return axios.post(`${this.baseURL}/incidents?tenant_id=${this.tenantId}`, data);
  }

  async updateIncident(incidentId: number, data: {
    status?: string;
    resolution_notes?: string;
    resolved_by?: number;
  }) {
    return axios.put(`${this.baseURL}/incidents/${incidentId}?tenant_id=${this.tenantId}`, data);
  }

  // Optimizations
  async createOptimization(data: {
    optimization_type: string;
    component: string;
    title: string;
    description: string;
    current_performance: Record<string, any>;
    expected_improvement: Record<string, any>;
    effort_estimate?: string;
  }) {
    return axios.post(`${this.baseURL}/optimizations?tenant_id=${this.tenantId}`, data);
  }

  async getOptimizations(status?: string, limit: number = 50) {
    const params = new URLSearchParams({ tenant_id: this.tenantId.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    return axios.get<PerformanceOptimization[]>(`${this.baseURL}/optimizations?${params}`);
  }

  async updateOptimization(optimizationId: number, data: {
    implementation_status?: string;
    implementation_notes?: string;
    implemented_by?: number;
  }) {
    return axios.put(`${this.baseURL}/optimizations/${optimizationId}?tenant_id=${this.tenantId}`, data);
  }

  // Reports
  async generateReport(data: {
    report_type: string;
    time_range_hours: number;
    include_sections?: string[];
    format?: string;
  }) {
    return axios.post(`${this.baseURL}/reports?tenant_id=${this.tenantId}`, data);
  }

  // Real-time metrics
  async getRealTimeMetrics(metricNames?: string[]) {
    const params = new URLSearchParams({ tenant_id: this.tenantId.toString() });
    if (metricNames) {
      metricNames.forEach(name => params.append('metric_names', name));
    }
    
    return axios.get(`${this.baseURL}/real-time/metrics?${params}`);
  }

  // Health check
  async getServiceHealth() {
    return axios.get(`${this.baseURL}/health`);
  }
}

export const performanceApi = new PerformanceApi();
export default performanceApi;
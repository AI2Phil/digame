"""
Performance monitoring schemas for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime


# Base schemas for performance metrics
class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., description="Name of the performance metric")
    metric_category: str = Field(..., description="Category (system, database, api, user_experience)")
    metric_type: str = Field(..., description="Type (counter, gauge, histogram, timer)")
    value: float = Field(..., description="Metric value")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    source: Optional[str] = Field(None, description="Source component or service")
    tags: Optional[Dict[str, Any]] = Field(None, description="Additional metadata tags")
    dimensions: Optional[Dict[str, Any]] = Field(None, description="Dimensional data")


class PerformanceMetricCreate(PerformanceMetricBase):
    """Schema for creating performance metrics"""
    pass


class PerformanceMetricResponse(PerformanceMetricBase):
    """Schema for performance metric response"""
    id: int
    tenant_id: int
    timestamp: datetime
    collection_interval: int
    aggregation_period: Optional[str] = None
    sample_count: int

    model_config = {"from_attributes": True}
class QueryPerformanceBase(BaseModel):
    query_text: str = Field(..., description="SQL query text")
    execution_time_ms: float = Field(..., description="Execution time in milliseconds")
    rows_examined: Optional[int] = Field(None, description="Number of rows examined")
    rows_returned: Optional[int] = Field(None, description="Number of rows returned")
    endpoint: Optional[str] = Field(None, description="API endpoint that triggered query")
    database_name: Optional[str] = Field(None, description="Database name")
    table_names: Optional[List[str]] = Field(None, description="Tables accessed")


class QueryPerformanceCreate(QueryPerformanceBase):
    """Schema for creating query performance records"""
    user_id: Optional[int] = None


class QueryPerformanceResponse(QueryPerformanceBase):
    """Schema for query performance response"""
    id: int
    tenant_id: int
    query_hash: str
    query_type: str
    user_id: Optional[int] = None
    cpu_time_ms: Optional[float] = None
    memory_usage_bytes: Optional[int] = None
    io_operations: Optional[int] = None
    timestamp: datetime
    is_slow_query: bool
    optimization_suggestions: Optional[List[str]] = None
    index_recommendations: Optional[List[str]] = None

    model_config = {"from_attributes": True}
class UserExperienceMetricBase(BaseModel):
    page_url: str = Field(..., description="Page URL")
    action_type: str = Field(..., description="Action type (page_load, click, form_submit)")
    component: Optional[str] = Field(None, description="UI component")
    load_time_ms: Optional[float] = Field(None, description="Load time in milliseconds")
    first_contentful_paint_ms: Optional[float] = Field(None, description="First contentful paint")
    largest_contentful_paint_ms: Optional[float] = Field(None, description="Largest contentful paint")
    cumulative_layout_shift: Optional[float] = Field(None, description="Cumulative layout shift")
    first_input_delay_ms: Optional[float] = Field(None, description="First input delay")
    device_type: Optional[str] = Field(None, description="Device type")
    browser: Optional[str] = Field(None, description="Browser")
    operating_system: Optional[str] = Field(None, description="Operating system")
    error_occurred: bool = Field(False, description="Whether an error occurred")
    error_message: Optional[str] = Field(None, description="Error message if any")


class UserExperienceMetricCreate(UserExperienceMetricBase):
    """Schema for creating user experience metrics"""
    user_id: Optional[int] = None
    session_id: str = Field(..., description="Session ID")


class UserExperienceMetricResponse(UserExperienceMetricBase):
    """Schema for user experience metric response"""
    id: int
    tenant_id: int
    user_id: Optional[int] = None
    session_id: str
    screen_resolution: Optional[str] = None
    connection_type: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    timestamp: datetime
    user_rating: Optional[int] = None
    bounce: bool
    conversion: bool
    error_stack: Optional[str] = None

    model_config = {"from_attributes": True}
class SystemHealthCheckBase(BaseModel):
    check_name: str = Field(..., description="Name of the health check")
    check_type: str = Field(..., description="Type of check (database, api, service, external)")
    component: str = Field(..., description="Component being checked")


class SystemHealthCheckCreate(SystemHealthCheckBase):
    """Schema for creating health checks"""
    check_interval_seconds: int = Field(300, description="Check interval in seconds")
    timeout_seconds: int = Field(30, description="Timeout in seconds")


class SystemHealthCheckResponse(SystemHealthCheckBase):
    """Schema for health check response"""
    id: int
    tenant_id: int
    status: str
    response_time_ms: Optional[float] = None
    success: bool
    error_message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    next_check_at: Optional[datetime] = None
    check_interval_seconds: int
    timeout_seconds: int

    model_config = {"from_attributes": True}
class PerformanceAlertBase(BaseModel):
    alert_name: str = Field(..., description="Alert name")
    alert_type: str = Field(..., description="Alert type (threshold, anomaly, trend)")
    severity: str = Field(..., description="Severity (low, medium, high, critical)")
    threshold_value: Optional[float] = Field(None, description="Threshold value")
    threshold_operator: str = Field(">", description="Threshold operator")
    threshold_duration_minutes: int = Field(5, description="Duration before triggering")
    notification_channels: Optional[List[str]] = Field(None, description="Notification channels")
    notification_frequency_minutes: int = Field(60, description="Notification frequency")
    description: Optional[str] = Field(None, description="Alert description")


class PerformanceAlertCreate(PerformanceAlertBase):
    """Schema for creating performance alerts"""
    pass


class PerformanceAlertResponse(PerformanceAlertBase):
    """Schema for performance alert response"""
    id: int
    tenant_id: int
    metric_id: Optional[int] = None
    status: str
    triggered_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    last_notification_at: Optional[datetime] = None
    current_value: Optional[float] = None
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
class PerformanceIncidentBase(BaseModel):
    title: str = Field(..., description="Incident title")
    description: Optional[str] = Field(None, description="Incident description")
    severity: str = Field(..., description="Severity (low, medium, high, critical)")
    category: Optional[str] = Field(None, description="Category (performance, availability, error_rate)")
    priority: str = Field("medium", description="Priority (low, medium, high, urgent)")
    affected_users_count: Optional[int] = Field(None, description="Number of affected users")
    affected_components: Optional[List[str]] = Field(None, description="Affected components")
    business_impact: Optional[str] = Field(None, description="Business impact level")


class PerformanceIncidentCreate(PerformanceIncidentBase):
    """Schema for creating performance incidents"""
    pass


class PerformanceIncidentUpdate(BaseModel):
    """Schema for updating performance incidents"""
    status: Optional[str] = None
    priority: Optional[str] = None
    root_cause: Optional[str] = None
    resolution_notes: Optional[str] = None
    prevention_measures: Optional[List[str]] = None
    assigned_to: Optional[int] = None
    escalated_to: Optional[int] = None


class PerformanceIncidentResponse(PerformanceIncidentBase):
    """Schema for performance incident response"""
    id: int
    tenant_id: int
    alert_id: Optional[int] = None
    health_check_id: Optional[int] = None
    status: str
    root_cause: Optional[str] = None
    resolution_notes: Optional[str] = None
    prevention_measures: Optional[List[str]] = None
    started_at: datetime
    detected_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    assigned_to: Optional[int] = None
    escalated_to: Optional[int] = None
    communication_log: Optional[List[Dict[str, Any]]] = None
    external_communication: Optional[str] = None

    model_config = {"from_attributes": True}
class PerformanceOptimizationBase(BaseModel):
    optimization_type: str = Field(..., description="Type (query, index, caching, scaling)")
    component: str = Field(..., description="Component to optimize")
    title: str = Field(..., description="Optimization title")
    description: str = Field(..., description="Optimization description")
    current_performance: Dict[str, Any] = Field(..., description="Current performance metrics")
    expected_improvement: Dict[str, Any] = Field(..., description="Expected improvements")
    effort_estimate: str = Field("medium", description="Effort estimate (low, medium, high)")
    implementation_steps: Optional[List[str]] = Field(None, description="Implementation steps")
    rollback_plan: Optional[str] = Field(None, description="Rollback plan")


class PerformanceOptimizationCreate(PerformanceOptimizationBase):
    """Schema for creating performance optimizations"""
    target_completion: Optional[datetime] = None
    dependencies: Optional[List[int]] = None


class PerformanceOptimizationUpdate(BaseModel):
    """Schema for updating performance optimizations"""
    implementation_status: Optional[str] = None
    actual_improvement: Optional[Dict[str, Any]] = None
    success_metrics: Optional[Dict[str, Any]] = None
    approval_status: Optional[str] = None
    rejection_reason: Optional[str] = None


class PerformanceOptimizationResponse(PerformanceOptimizationBase):
    """Schema for performance optimization response"""
    id: int
    tenant_id: int
    priority_score: float
    implementation_status: str
    implemented_at: Optional[datetime] = None
    implemented_by: Optional[int] = None
    actual_improvement: Optional[Dict[str, Any]] = None
    success_metrics: Optional[Dict[str, Any]] = None
    identified_at: datetime
    target_completion: Optional[datetime] = None
    dependencies: Optional[List[int]] = None
    related_incidents: Optional[List[int]] = None
    approval_status: str
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    model_config = {"from_attributes": True}
class PerformanceDashboardResponse(BaseModel):
    """Schema for performance dashboard data"""
    time_range_hours: int
    system_metrics: Dict[str, Any]
    database_performance: Dict[str, Any]
    user_experience: Dict[str, Any]
    active_alerts: List[Dict[str, Any]]
    recent_incidents: List[Dict[str, Any]]
    trends: Dict[str, Any]
    last_updated: datetime


class SystemHealthStatusResponse(BaseModel):
    """Schema for system health status"""
    overall_status: str
    components: Dict[str, Dict[str, Any]]
    last_check: Optional[datetime] = None


class QueryOptimizationRecommendation(BaseModel):
    """Schema for query optimization recommendations"""
    query_hash: str
    query_text: str
    query_type: str
    frequency: int
    avg_execution_time_ms: float
    max_execution_time_ms: float
    impact_score: float
    tables: List[str]
    optimization_suggestions: List[str]
    priority: str


class UserExperienceInsightsResponse(BaseModel):
    """Schema for user experience insights"""
    time_range_hours: int
    total_interactions: int
    error_rate_percent: float
    bounce_rate_percent: float
    slow_pages: List[Dict[str, Any]]
    device_performance: Dict[str, Dict[str, Any]]
    recommendations: List[str]


# Performance baseline schemas
class PerformanceBaselineResponse(BaseModel):
    """Schema for performance baseline response"""
    id: int
    tenant_id: int
    metric_name: str
    component: Optional[str] = None
    time_period: str
    mean_value: Optional[float] = None
    median_value: Optional[float] = None
    p95_value: Optional[float] = None
    p99_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    std_deviation: Optional[float] = None
    sample_count: Optional[int] = None
    confidence_level: float
    valid_from: datetime
    valid_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
class MonitoringConfigurationBase(BaseModel):
    metric_collection_interval: int = Field(60, description="Metric collection interval in seconds")
    health_check_interval: int = Field(300, description="Health check interval in seconds")
    alert_evaluation_interval: int = Field(60, description="Alert evaluation interval in seconds")
    data_retention_days: int = Field(90, description="Data retention period in days")
    enable_real_time_monitoring: bool = Field(True, description="Enable real-time monitoring")
    enable_predictive_alerts: bool = Field(False, description="Enable predictive alerting")


class MonitoringConfigurationUpdate(MonitoringConfigurationBase):
    """Schema for updating monitoring configuration"""
    pass


class MonitoringConfigurationResponse(MonitoringConfigurationBase):
    """Schema for monitoring configuration response"""
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
class BulkMetricCreate(BaseModel):
    """Schema for bulk metric creation"""
    metrics: List[PerformanceMetricCreate]


class BulkMetricResponse(BaseModel):
    """Schema for bulk metric creation response"""
    success_count: int
    error_count: int
    errors: List[str]


# Performance report schemas
class PerformanceReportRequest(BaseModel):
    """Schema for performance report requests"""
    report_type: str = Field(..., description="Report type (summary, detailed, trends)")
    time_range_hours: int = Field(24, description="Time range in hours")
    include_metrics: List[str] = Field([], description="Specific metrics to include")
    include_components: List[str] = Field([], description="Specific components to include")
    format: str = Field("json", description="Report format (json, csv, pdf)")


class PerformanceReportResponse(BaseModel):
    """Schema for performance report response"""
    report_id: str
    report_type: str
    generated_at: datetime
    time_range: Dict[str, datetime]
    summary: Dict[str, Any]
    detailed_data: Optional[Dict[str, Any]] = None
    recommendations: List[str]
    download_url: Optional[str] = None


# Real-time monitoring schemas
class RealTimeMetricUpdate(BaseModel):
    """Schema for real-time metric updates"""
    metric_name: str
    value: float
    timestamp: datetime
    source: Optional[str] = None
    tags: Optional[Dict[str, Any]] = None


class RealTimeAlertNotification(BaseModel):
    """Schema for real-time alert notifications"""
    alert_id: int
    alert_name: str
    severity: str
    current_value: float
    threshold_value: float
    message: str
    triggered_at: datetime
    component: Optional[str] = None
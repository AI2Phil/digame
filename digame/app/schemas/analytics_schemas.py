from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

# --- Base Schemas to handle common fields ---
class BaseAuditModel(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TenantAssociatedModel(BaseModel):
    tenant_id: int

# --- PerformanceMetric Schemas ---
class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., example="Task Completion Rate")
    display_name: str = Field(..., example="Task Completion Rate (%)")
    description: Optional[str] = None
    metric_type: str = Field(..., example="productivity") # productivity, quality, efficiency, engagement
    category: str = Field(..., example="user") # user, project, team, system
    entity_type: str = Field(..., example="user")
    entity_id: int = Field(..., example=1)
    dimensions_values: Optional[Dict[str, Any]] = Field(None, example={"project_id": 10, "priority": "high"})
    measurement_unit: str = Field(..., example="%")
    calculation_method: str = Field(..., example="ratio") # sum, average, ratio, etc.
    current_value: float
    previous_value: Optional[float] = None
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None
    period_start: datetime
    period_end: datetime
    period_type: str = Field(..., example="weekly") # daily, weekly, monthly, quarterly
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    data_completeness: Optional[float] = Field(default=1.0)
    data_accuracy: Optional[float] = Field(default=1.0)
    confidence_score: Optional[float] = Field(default=1.0)
    predicted_by_model_id: Optional[int] = None

class PerformanceMetricCreate(PerformanceMetricBase):
    measured_by_user_id: Optional[int] = None

class PerformanceMetricUpdate(BaseModel):
    metric_name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    metric_type: Optional[str] = None
    category: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    dimensions_values: Optional[Dict[str, Any]] = None
    measurement_unit: Optional[str] = None
    calculation_method: Optional[str] = None
    current_value: Optional[float] = None
    previous_value: Optional[float] = None
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    period_type: Optional[str] = None
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    data_completeness: Optional[float] = None
    data_accuracy: Optional[float] = None
    confidence_score: Optional[float] = None
    predicted_by_model_id: Optional[int] = None
    measured_by_user_id: Optional[int] = None

class PerformanceMetricInDB(PerformanceMetricBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    metric_uuid: str
    trend_direction: Optional[str] = None
    trend_percentage: Optional[float] = None
    trend_significance: Optional[str] = None
    alert_status: Optional[str] = None
    measured_by_user_id: Optional[int] = None

    class Config:
        orm_mode = True

class BenchmarkComparisonInput(BaseModel):
    performance_metric_id: int
    # Optional: specific parameters to narrow down benchmark search
    benchmark_filter_params: Optional[Dict[str, Any]] = Field(None, example={"industry_segment": "SaaS", "region": "North America"})

class BenchmarkComparisonResult(BaseModel):
    performance_metric_name: str
    performance_metric_value: float
    performance_metric_unit: Optional[str] = None
    benchmark_name: str
    benchmark_value: float
    benchmark_unit: Optional[str] = None
    benchmark_value_type: str
    difference: Optional[float] = None
    comparison_unit: Optional[str] = None
    difference_comment: Optional[str] = None


# --- AnalyticsModel Schemas ---
class AnalyticsModelBase(BaseModel):
    name: str = Field(..., example="User Churn Predictor")
    display_name: str = Field(..., example="User Churn Prediction Model")
    description: Optional[str] = None
    model_type: str = Field(..., example="churn_prediction") # performance, roi, productivity, churn
    category: str = Field(..., example="predictive") # predictive, descriptive, prescriptive
    algorithm: str = Field(..., example="random_forest_classifier")
    features: List[str] = Field(default_factory=list, example=["login_frequency", "feature_usage_rate"])
    target_variable: str = Field(..., example="has_churned")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, example={"n_estimators": 100, "max_depth": 10})
    dimensions: List[str] = Field(default_factory=list, example=["user_segment", "country"]) # For multi-dimensional metrics
    metrics: List[str] = Field(default_factory=list, example=["churn_rate", "avg_session_length"]) # For multi-dimensional metrics/multi-output models
    aggregation_types: Dict[str, str] = Field(default_factory=dict, example={"churn_rate": "mean", "avg_session_length": "mean"})
    training_data_source: str = Field(..., example="user_activity_table")
    training_period_days: int = Field(default=90)
    retrain_frequency_days: int = Field(default=7)
    validation_split: float = Field(default=0.2)
    status: Optional[str] = Field(default="draft") # draft, training, trained, deployed, deprecated
    version: Optional[str] = Field(default="1.0.0")
    is_active: Optional[bool] = Field(default=True)
    is_production: Optional[bool] = Field(default=False)

class AnalyticsModelCreate(AnalyticsModelBase):
    pass # created_by_user_id will be handled in the service/router

class AnalyticsModelUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    model_type: Optional[str] = None
    category: Optional[str] = None
    algorithm: Optional[str] = None
    features: Optional[List[str]] = None
    target_variable: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    dimensions: Optional[List[str]] = None
    metrics: Optional[List[str]] = None
    aggregation_types: Optional[Dict[str, str]] = None
    training_data_source: Optional[str] = None
    training_period_days: Optional[int] = None
    retrain_frequency_days: Optional[int] = None
    validation_split: Optional[float] = None
    status: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None
    is_production: Optional[bool] = None

class AnalyticsModelInDB(AnalyticsModelBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    model_uuid: str
    accuracy_score: Optional[float] = None
    precision_score: Optional[float] = None
    recall_score: Optional[float] = None
    f1_score: Optional[float] = None
    r2_score: Optional[float] = None
    mae_score: Optional[float] = None
    rmse_score: Optional[float] = None
    last_trained_at: Optional[datetime] = None
    training_duration_seconds: Optional[int] = None
    training_samples_count: Optional[int] = None
    prediction_count: Optional[int] = 0
    last_prediction_at: Optional[datetime] = None
    created_by_user_id: int

    class Config:
        orm_mode = True

# --- AnalyticsPrediction Schemas ---
class AnalyticsPredictionBase(BaseModel):
    model_id: int
    entity_type: str = Field(..., example="user")
    entity_id: int = Field(..., example=123)
    input_features: Dict[str, Any] = Field(..., example={"login_frequency": 0.8, "feature_usage_rate": 0.5})
    prediction_horizon_days: Optional[int] = None
    # benchmark_params for make_prediction_with_benchmark
    benchmark_params: Optional[Dict[str, Any]] = Field(None, description="Parameters to find relevant benchmark for comparison")


class AnalyticsPredictionCreate(AnalyticsPredictionBase):
    pass # created_by_user_id will be handled in the service/router

class AnalyticsPredictionInDB(AnalyticsPredictionBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    prediction_uuid: str
    prediction_type: str # e.g., performance, churn, roi - derived from model
    feature_importance: Optional[Dict[str, float]] = None
    predicted_value: Optional[float] = None
    predicted_values_multi_dim: Optional[Any] = None # Can be list or dict
    confidence_score: Optional[float] = None
    prediction_interval_lower: Optional[float] = None
    prediction_interval_upper: Optional[float] = None
    benchmark_comparison_data: Optional[Dict[str, Any]] = None
    prediction_date: datetime
    expires_at: Optional[datetime] = None
    actual_value: Optional[float] = None
    prediction_error: Optional[float] = None
    is_validated: Optional[bool] = False
    validation_date: Optional[datetime] = None
    raw_prediction_output: Optional[Any] = None
    view_count: Optional[int] = 0
    last_viewed_at: Optional[datetime] = None
    created_by_user_id: Optional[int] = None # Can be system generated

    class Config:
        orm_mode = True


# --- ROICalculation Schemas ---
class ROIMetricLink(BaseModel):
    roi_field_to_update: str = Field(..., example="cost_savings") # Must match a field in ROICalculation
    source_type: str = Field(..., example="performance_metric") # "performance_metric" or "analytics_prediction"
    source_id: int = Field(..., example=1)
    value_path: str = Field(..., example="current_value") # Attribute name or key in JSON
    multiplier: Optional[float] = Field(default=1.0)
    default_value: Optional[float] = Field(default=0.0) # Value if source/path is invalid

class ROICalculationBase(BaseModel):
    entity_type: str = Field(..., example="project")
    entity_id: int = Field(..., example=1)
    calculation_name: str = Field(..., example="Q1 Project Alpha ROI")
    description: Optional[str] = None
    period_start: datetime
    period_end: datetime

    initial_investment: Optional[Decimal] = Field(default=Decimal("0.0"))
    operational_costs: Optional[Decimal] = Field(default=Decimal("0.0"))
    labor_costs: Optional[Decimal] = Field(default=Decimal("0.0"))
    technology_costs: Optional[Decimal] = Field(default=Decimal("0.0"))
    training_costs: Optional[Decimal] = Field(default=Decimal("0.0"))
    other_costs: Optional[Decimal] = Field(default=Decimal("0.0"))

    revenue_increase: Optional[Decimal] = Field(default=Decimal("0.0"))
    cost_savings: Optional[Decimal] = Field(default=Decimal("0.0"))
    productivity_gains: Optional[Decimal] = Field(default=Decimal("0.0"))
    efficiency_gains: Optional[Decimal] = Field(default=Decimal("0.0"))
    quality_improvements: Optional[Decimal] = Field(default=Decimal("0.0"))
    risk_reduction: Optional[Decimal] = Field(default=Decimal("0.0"))
    other_benefits: Optional[Decimal] = Field(default=Decimal("0.0"))

    calculation_method: Optional[str] = Field(default="simple")
    discount_rate: Optional[float] = Field(default=0.1)
    assumptions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    data_sources: Optional[List[str]] = Field(default_factory=list)
    analytics_model_id: Optional[int] = None
    metric_links: Optional[List[ROIMetricLink]] = Field(None, description="Links to metrics/predictions for dynamic value population")

class ROICalculationCreate(ROICalculationBase):
    pass # calculated_by_user_id handled in service/router

class ROICalculationUpdate(BaseModel): # For potentially re-calculating or adjusting
    description: Optional[str] = None
    # Allow updating cost/benefit fields, then recalculate
    initial_investment: Optional[Decimal] = None
    operational_costs: Optional[Decimal] = None
    # ... (other cost/benefit fields) ...
    revenue_increase: Optional[Decimal] = None
    # ...
    assumptions: Optional[Dict[str, Any]] = None
    metric_links: Optional[List[ROIMetricLink]] = None # Allow updating links for recalculation

class ROICalculationInDB(ROICalculationBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    calculation_uuid: str
    period_days: int
    total_investment: Decimal
    total_benefits: Decimal
    roi_percentage: float
    net_present_value: Optional[Decimal] = None
    payback_period_months: Optional[float] = None
    internal_rate_return: Optional[float] = None
    confidence_level: Optional[float] = None
    validation_status: Optional[str] = "pending"
    validation_notes: Optional[str] = None
    prediction_accuracy: Optional[float] = None # If linked model provides it
    calculated_by_user_id: int
    approved_by_user_id: Optional[int] = None
    approved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }

# --- ComparativeBenchmark Schemas ---
class ComparativeBenchmarkBase(BaseModel):
    name: str = Field(..., example="Industry Average Task Completion Time")
    description: Optional[str] = None
    category: str = Field(..., example="performance_kpi")
    source: Optional[str] = Field(None, example="Global Dev Report 2024")
    metric_name: str = Field(..., example="task_completion_time_hours")
    entity_type: Optional[str] = Field(None, example="task")
    industry_segment: Optional[str] = Field(None, example="Software Development")
    region: Optional[str] = Field(None, example="Global")
    company_size: Optional[str] = Field(None, example="Any")
    benchmark_value: float
    value_type: Optional[str] = Field(default="average") # average, median, percentile_75
    unit: Optional[str] = Field(None, example="hours")
    period_start_date: Optional[datetime] = None
    period_end_date: Optional[datetime] = None
    data_freshness_date: Optional[datetime] = None
    confidence_level: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    sample_size: Optional[int] = None
    dimensions: Optional[Dict[str, Any]] = Field(None, example={"programming_language": "Python"})
    is_active: Optional[bool] = True

class ComparativeBenchmarkCreate(ComparativeBenchmarkBase):
    tenant_id: Optional[int] = None # Can be global (None) or tenant-specific

class ComparativeBenchmarkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = None
    metric_name: Optional[str] = None
    benchmark_value: Optional[float] = None
    # ... other updatable fields
    is_active: Optional[bool] = None

class ComparativeBenchmarkInDB(ComparativeBenchmarkBase, BaseAuditModel):
    id: int
    benchmark_uuid: str
    tenant_id: Optional[int] = None # Included for response clarity
    created_by_user_id: Optional[int] = None

    class Config:
        orm_mode = True

# --- Dashboard & Reporting Schemas (Conceptual) ---

# Widget Configuration
class DashboardWidgetDataSource(BaseModel):
    type: str # e.g., "performance_metric", "analytics_prediction", "roi_calculation", "benchmark_comparison"
    query_params: Dict[str, Any] # Specific parameters to fetch data, e.g., metric_name, model_id, entity_id
    # For multi-dimensional, might include group_by dimensions, aggregation_type

class DashboardWidgetConfigBase(BaseModel):
    widget_type: str = Field(..., example="line_chart") # e.g., "kpi_card", "line_chart", "bar_chart", "table"
    title: str
    data_source: DashboardWidgetDataSource
    display_options: Optional[Dict[str, Any]] = Field(default_factory=dict) # e.g., color, time_range, axes_labels

class DashboardWidgetConfigCreate(DashboardWidgetConfigBase):
    pass

class DashboardWidgetConfigInDB(DashboardWidgetConfigBase, BaseAuditModel):
    id: int # Assuming these are stored and have IDs
    widget_uuid: str

    class Config:
        orm_mode = True

# Dashboard Layout and Structure
class DashboardLayoutItem(BaseModel):
    widget_id: int # Reference to a stored DashboardWidgetConfig
    x: int # Grid position X
    y: int # Grid position Y
    w: int # Width in grid units
    h: int # Height in grid units
    static: Optional[bool] = False # If the widget can be moved/resized

class AnalyticsDashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: List[DashboardLayoutItem] = Field(default_factory=list)
    # Could also store a list of widget configurations directly if not managed separately
    # widgets: List[DashboardWidgetConfigBase] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)

class AnalyticsDashboardCreate(AnalyticsDashboardBase):
    pass # user_id handled by service

class AnalyticsDashboardInDB(AnalyticsDashboardBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    dashboard_uuid: str
    user_id: int # Owner of the dashboard

    class Config:
        orm_mode = True

# --- Reporting Schemas ---
class ReportFilter(BaseModel):
    field: str
    operator: str # e.g., "eq", "gt", "lt", "in", "like"
    value: Any

class ReportDefinitionBase(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: str # e.g., "performance_summary", "roi_analysis", "prediction_accuracy"
    data_sources: List[DashboardWidgetDataSource] # Re-use for specifying data content
    filters: Optional[List[ReportFilter]] = Field(default_factory=list)
    output_format: str = Field(default="pdf") # pdf, csv, xlsx
    # visual_elements: Optional[List[str]] # e.g., list of chart types or sections to include

class ReportDefinitionCreate(ReportDefinitionBase):
    pass # user_id handled by service

class ReportDefinitionInDB(ReportDefinitionBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    definition_uuid: str
    user_id: int

    class Config:
        orm_mode = True

class ReportScheduleBase(BaseModel):
    report_definition_id: int
    cron_schedule: str = Field(..., example="0 0 * * MON") # e.g., weekly on Monday at midnight
    recipients: List[str] = Field(default_factory=list, example=["user@example.com"]) # Email addresses
    is_active: bool = True

class ReportScheduleCreate(ReportScheduleBase):
    pass

class ReportScheduleInDB(ReportScheduleBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    schedule_uuid: str
    next_run_time: Optional[datetime] = None
    last_run_time: Optional[datetime] = None
    last_run_status: Optional[str] = None # success, failed

    class Config:
        orm_mode = True

class GeneratedReportInfo(BaseModel):
    report_id: str # Could be a file ID or internal ID
    report_name: str
    generated_at: datetime
    file_format: str
    file_size_kb: Optional[float] = None
    download_url: Optional[str] = None # If applicable

class ReportExportRequest(BaseModel):
    report_definition_id: Optional[int] = None # For existing definition
    ad_hoc_definition: Optional[ReportDefinitionBase] = None # For on-the-fly reports
    output_format: Optional[str] = "pdf" # Override format if needed
    # Ensure either report_definition_id or ad_hoc_definition is provided

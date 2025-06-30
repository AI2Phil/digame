from pydantic import BaseModel, Field, RootModel
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
    metric_name: str = Field(..., description="Task Completion Rate")
    display_name: str = Field(..., description="Task Completion Rate (%)")
    description: Optional[str] = None
    metric_type: str = Field(..., description="productivity, quality, efficiency, engagement")
    category: str = Field(..., description="user, project, team, system")
    entity_type: str = Field(..., description="user")
    entity_id: int = Field(..., description="Entity ID")
    dimensions_values: Optional[Dict[str, Any]] = Field(None, description="Additional dimensions")
    measurement_unit: str = Field(..., description="Unit of measurement")
    calculation_method: str = Field(..., description="sum, average, ratio, etc.")
    current_value: float
    previous_value: Optional[float] = None
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None
    period_start: datetime
    period_end: datetime
    period_type: str = Field(..., description="daily, weekly, monthly, quarterly")
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
        from_attributes = True

class BenchmarkComparisonInput(BaseModel):
    performance_metric_id: int
    # Optional: specific parameters to narrow down benchmark search
    benchmark_filter_params: Optional[Dict[str, Any]] = Field(None, description="Filter parameters for benchmark search")

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

class BenchmarkComparisonInputOptional(BaseModel): # New schema
    benchmark_filter_params: Optional[Dict[str, Any]] = Field(None, description="Filter parameters for benchmark")


# --- AnalyticsModel Schemas ---
class AnalyticsModelBase(BaseModel):
    name: str = Field(..., description="Model name")
    display_name: str = Field(..., description="Display name for the model")
    description: Optional[str] = None
    model_type: str = Field(..., description="performance, roi, productivity, churn")
    category: str = Field(..., description="predictive, descriptive, prescriptive")
    algorithm: str = Field(..., description="Algorithm used")
    features: List[str] = Field(default_factory=list, description="List of feature names")
    target_variable: str = Field(..., description="Target variable name")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, description="Model hyperparameters")
    dimensions: List[str] = Field(default_factory=list, description="Dimensions for multi-dimensional metrics")
    metrics: List[str] = Field(default_factory=list, description="Metrics for multi-output models")
    aggregation_types: Dict[str, str] = Field(default_factory=dict, description="Aggregation types for metrics")
    training_data_source: str = Field(..., description="Data source for training")
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
    model_path: Optional[str] = None
    training_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- AnalyticsPrediction Schemas ---
class AnalyticsPredictionBase(BaseModel):
    model_id: int
    entity_type: str = Field(..., description="Type of entity")
    entity_id: int = Field(..., description="Entity ID")
    input_features: Dict[str, Any] = Field(..., description="Input features for prediction")
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
        from_attributes = True


# --- ROICalculation Schemas ---
class ROIMetricLink(BaseModel):
    roi_field_to_update: str = Field(..., description="Field to update in ROICalculation")
    source_type: str = Field(..., description="performance_metric or analytics_prediction")
    source_id: int = Field(..., description="Source ID")
    value_path: str = Field(..., description="Attribute name or key in JSON")
    multiplier: Optional[float] = Field(default=1.0)
    default_value: Optional[float] = Field(default=0.0) # Value if source/path is invalid

class ROICalculationBase(BaseModel):
    entity_type: str = Field(..., description="Type of entity")
    entity_id: int = Field(..., description="Entity ID")
    calculation_name: str = Field(..., description="Name of the calculation")
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
    calculation_name: Optional[str] = None
    description: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    initial_investment: Optional[Decimal] = None
    operational_costs: Optional[Decimal] = None
    labor_costs: Optional[Decimal] = None
    technology_costs: Optional[Decimal] = None
    training_costs: Optional[Decimal] = None
    other_costs: Optional[Decimal] = None
    revenue_increase: Optional[Decimal] = None
    cost_savings: Optional[Decimal] = None
    productivity_gains: Optional[Decimal] = None
    efficiency_gains: Optional[Decimal] = None
    quality_improvements: Optional[Decimal] = None
    risk_reduction: Optional[Decimal] = None
    other_benefits: Optional[Decimal] = None
    calculation_method: Optional[str] = None
    discount_rate: Optional[float] = None
    assumptions: Optional[Dict[str, Any]] = None
    data_sources: Optional[List[str]] = None
    analytics_model_id: Optional[int] = None
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
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }

# --- ComparativeBenchmark Schemas ---
class ComparativeBenchmarkBase(BaseModel):
    name: str = Field(..., description="Benchmark name")
    description: Optional[str] = None
    category: str = Field(..., description="Benchmark category")
    source: Optional[str] = Field(None, description="Data source")
    metric_name: str = Field(..., description="Metric name")
    entity_type: Optional[str] = Field(None, description="Entity type")
    industry_segment: Optional[str] = Field(None, description="Industry segment")
    region: Optional[str] = Field(None, description="Geographic region")
    company_size: Optional[str] = Field(None, description="Company size")
    benchmark_value: float
    value_type: Optional[str] = Field(default="average") # average, median, percentile_75
    unit: Optional[str] = Field(None, description="Unit of measurement")
    period_start_date: Optional[datetime] = None
    period_end_date: Optional[datetime] = None
    data_freshness_date: Optional[datetime] = None
    confidence_level: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    sample_size: Optional[int] = None
    dimensions: Optional[Dict[str, Any]] = Field(None, description="Additional dimensions")
    is_active: Optional[bool] = True

class ComparativeBenchmarkCreate(ComparativeBenchmarkBase):
    tenant_id: Optional[int] = None # Can be global (None) or tenant-specific

class ComparativeBenchmarkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = None
    metric_name: Optional[str] = None
    entity_type: Optional[str] = None
    industry_segment: Optional[str] = None
    region: Optional[str] = None
    company_size: Optional[str] = None
    benchmark_value: Optional[float] = None
    value_type: Optional[str] = None
    unit: Optional[str] = None
    period_start_date: Optional[datetime] = None
    period_end_date: Optional[datetime] = None
    data_freshness_date: Optional[datetime] = None
    confidence_level: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    sample_size: Optional[int] = None
    dimensions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    # tenant_id is not updatable via this schema directly, it's handled by creation context

class ComparativeBenchmarkInDB(ComparativeBenchmarkBase, BaseAuditModel):
    id: int
    benchmark_uuid: str
    tenant_id: Optional[int] = None # Included for response clarity
    created_by_user_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Dashboard & Reporting Schemas (Conceptual) ---

# Widget Configuration
class DashboardWidgetDataSource(BaseModel):
    type: str = Field(..., description="performance_metric, analytics_prediction, roi_calculation, benchmark_comparison")
    query_params: Dict[str, Any] = Field(..., description="Parameters to fetch data")
    # For multi-dimensional, might include group_by dimensions, aggregation_type

class DashboardWidgetConfigBase(BaseModel):
    widget_type: str = Field(..., description="kpi_card, line_chart, bar_chart, table")
    title: str
    data_source: DashboardWidgetDataSource
    display_options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Display options")

class DashboardWidgetConfigCreate(DashboardWidgetConfigBase):
    pass

class DashboardWidgetConfigUpdate(BaseModel):
    widget_type: Optional[str] = None
    title: Optional[str] = None
    data_source: Optional[DashboardWidgetDataSource] = None
    display_options: Optional[Dict[str, Any]] = None

class DashboardWidgetConfigInDB(DashboardWidgetConfigBase, BaseAuditModel):
    id: int # Assuming these are stored and have IDs
    widget_uuid: str

    class Config:
        from_attributes = True

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

class AnalyticsDashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[List[DashboardLayoutItem]] = None
    tags: Optional[List[str]] = None

class AnalyticsDashboardInDB(AnalyticsDashboardBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    dashboard_uuid: str
    user_id: int # Owner of the dashboard

    class Config:
        from_attributes = True

# --- Reporting Schemas ---
class ReportFilter(BaseModel):
    field: str
    operator: str # e.g., "eq", "gt", "lt", "in", "like"
    value: Any

# Report Content Block
class ReportContentBlock(BaseModel):
    title: Optional[str] = Field(None, description="Block title")
    block_type: str = Field(..., description="chart, table, kpi_summary, text")
    data_source: Optional[DashboardWidgetDataSource] = None # Source of data for this block, not needed for "text" type
    display_options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Display options")
    text_content: Optional[str] = Field(None, description="Text content for text blocks")

    class Config:
        from_attributes = True


class ReportDefinitionBase(BaseModel):
    name: str = Field(..., description="Report name")
    description: Optional[str] = None
    report_type: str = Field(default="generic", description="Report type for categorization")
    content_blocks: List[ReportContentBlock] = Field(default_factory=list)
    global_filters: Optional[List[ReportFilter]] = Field(default_factory=list, description="Filters applied to all applicable data sources in content blocks")
    output_format: str = Field(default="pdf") # Default output format: pdf, csv, json_data
    # visual_elements was too vague, replaced by content_blocks

class ReportDefinitionCreate(ReportDefinitionBase):
    pass # user_id handled by service

class ReportDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    report_type: Optional[str] = None
    content_blocks: Optional[List[ReportContentBlock]] = None
    global_filters: Optional[List[ReportFilter]] = None
    output_format: Optional[str] = None

class ReportDefinitionInDB(ReportDefinitionBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    definition_uuid: str
    user_id: int

    class Config:
        from_attributes = True

class ReportScheduleBase(BaseModel):
    report_definition_id: int
    cron_schedule: str = Field(..., description="Cron schedule expression")
    recipients: List[str] = Field(default_factory=list, description="Email addresses")
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
        from_attributes = True

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

class MultiDimensionalDataRecord(RootModel[Dict[str, Any]]):
    # This is a flexible schema, assuming records are dicts.
    # Specific expected fields would depend on the AnalyticsModel's dimensions and metrics.
    # Example: {"date": "2023-01-01", "country": "US", "department": "Sales", "revenue": 100, "sessions": 50}
    root: Dict[str, Any] # Allows any dict structure for a record

class MultiDimensionalDataPayload(BaseModel):
    records: List[MultiDimensionalDataRecord] = Field(..., description="List of data records for multi-dimensional analysis.")


# --- Dashboard Schemas (Revisiting and Finalizing) ---

# Renaming DashboardWidgetDataSource to WidgetDataSourceConfig for clarity
class WidgetDataSourceConfig(BaseModel):
    type: str = Field(..., description="Source type: performance_metric, analytics_prediction, roi_calculation")
    params: Dict[str, Any] = Field(..., description="Parameters to query the data source")

# Renaming DashboardWidgetConfigBase to WidgetConfigBase
class WidgetConfigBase(BaseModel):
    widget_type: str = Field(..., description="Type of widget: kpi_card, line_chart")
    title: str = Field(..., description="Widget title")
    data_source_config: WidgetDataSourceConfig = Field(..., description="Configuration for the widget's data source")
    display_options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Visual display options for the widget")

class WidgetConfigCreate(WidgetConfigBase):
    # dashboard_id will be set by path parameter or context in service
    pass

class WidgetConfigUpdate(BaseModel):
    widget_type: Optional[str] = None
    title: Optional[str] = None
    data_source_config: Optional[WidgetDataSourceConfig] = None
    display_options: Optional[Dict[str, Any]] = None

class WidgetConfigInDB(WidgetConfigBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    widget_uuid: str
    dashboard_id: int # Explicitly show it's linked

    class Config:
        from_attributes = True

# Renaming DashboardLayoutItem to LayoutItem
class LayoutItem(BaseModel):
    widget_config_id: int = Field(..., description="ID of the DashboardWidgetConfig this layout item refers to")
    x: int = Field(..., description="Grid position X (column)")
    y: int = Field(..., description="Grid position Y (row)")
    w: int = Field(..., description="Width in grid units")
    h: int = Field(..., description="Height in grid units")
    static: Optional[bool] = Field(default=False, description="If true, widget cannot be moved or resized by user")

# Renaming AnalyticsDashboardBase to DashboardBase
class DashboardBase(BaseModel):
    name: str = Field(..., description="Dashboard name")
    description: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list, description="Dashboard tags")

class DashboardCreate(DashboardBase):
    # user_id and tenant_id will be set from context in service
    # Initial layout and widgets can be empty or specified
    layout: Optional[List[LayoutItem]] = Field(default_factory=list)
    # Widgets can be created along with the dashboard or added later
    widgets: Optional[List[WidgetConfigCreate]] = Field(default_factory=list, description="Initial widgets")


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    layout: Optional[List[LayoutItem]] = None # To update layout separately is also an option

class DashboardInDB(DashboardBase, BaseAuditModel, TenantAssociatedModel):
    id: int
    dashboard_uuid: str
    user_id: int
    layout: List[LayoutItem] = Field(default_factory=list) # Ensure layout is always present, even if empty
    widgets: List[WidgetConfigInDB] = Field(default_factory=list) # Full widget configs embedded

    class Config:
        from_attributes = True

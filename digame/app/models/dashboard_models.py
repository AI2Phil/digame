from pydantic import BaseModel
from typing import List, Dict, Any
import datetime

class ProductivityChartDataPoint(BaseModel):
    date: datetime.date
    score: float

class ProductivityChart(BaseModel):
    title: str
    data: List[ProductivityChartDataPoint]

class ActivityBreakdownItem(BaseModel):
    activity_name: str
    duration_minutes: int
    percentage: float

class ActivityBreakdown(BaseModel):
    title: str
    data: List[ActivityBreakdownItem]

class ProductivityMetric(BaseModel):
    name: str
    value: str # Value can be string to accommodate various formats e.g., "5 tasks", "3h 30m"
    trend: str # e.g., "+5%", "-2 tasks"

class ProductivityMetricsGroup(BaseModel):
    title: str
    metrics: List[ProductivityMetric]

class RecentActivityItem(BaseModel):
    id: str
    description: str
    timestamp: datetime.datetime
    status: str # e.g., "Completed", "In Progress"

class RecentActivities(BaseModel):
    title: str
    activities: List[RecentActivityItem]

# Models for Advanced Analytics Dashboard Customization
class WidgetConfig(BaseModel):
    id: str # Unique ID for the widget instance on a dashboard
    widget_type: str # e.g., "performance_forecast", "benchmark_comparison", "roi_summary_chart"
    title: str
    size: str # e.g., "small", "medium", "large", "1x1", "2x1"
    position: Dict[str, int] # e.g., {"x": 0, "y": 0} for grid layout
    settings: Dict[str, Any] = {} # Widget-specific settings, e.g., { "metric_ids": [1,2], "time_period": "30d" }

class DashboardLayout(BaseModel):
    columns: int
    widgets: List[WidgetConfig]

class CustomDashboard(BaseModel):
    id: str # UUID for the dashboard
    tenant_id: int
    user_id: int # Owner of the dashboard
    name: str
    description: Optional[str] = None
    layout: DashboardLayout
    is_default: bool = False
    created_at: datetime.datetime
    updated_at: datetime.datetime

# Models for displaying Advanced Analytics Data
class AdvancedPerformanceDataPoint(BaseModel):
    timestamp: datetime.datetime
    value: float
    dimension_values: Optional[Dict[str, str]] = None # e.g. {"region": "NA", "product": "X"}

class AdvancedPerformanceSeries(BaseModel):
    metric_name: str
    series_label: str # For legend, e.g., "Actual Performance - Product X" or "Forecasted - Overall"
    data_points: List[AdvancedPerformanceDataPoint]
    unit: Optional[str] = None

class PerformanceForecastData(BaseModel):
    title: str
    forecast_horizon_days: int
    series: List[AdvancedPerformanceSeries] # Could include actuals and forecast

class BenchmarkComparisonData(BaseModel):
    metric_name: str
    entity_value: float
    benchmark_value: float
    benchmark_name: str
    difference: float
    unit: Optional[str] = None
    notes: Optional[str] = None # e.g. "Above industry average by 15%"

class ROIDashboardData(BaseModel):
    title: str
    total_roi_percentage: float
    total_investment: float
    total_benefits: float
    top_performing_projects: List[Dict[str, Any]] # e.g. [{"name": "Project Alpha", "roi": 150.0}]
    roi_trend: List[AdvancedPerformanceDataPoint] # ROI over time

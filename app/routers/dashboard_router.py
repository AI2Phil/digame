from fastapi import APIRouter, Depends, HTTPException, Query # Assuming HTTPException for auth later
from typing import Dict

from app.models.dashboard_models import (
    ProductivityChart, ActivityBreakdown,
    ProductivityMetricsGroup, RecentActivities,
    CustomDashboard, DashboardLayout, WidgetConfig, # Added Custom Dashboard Models
    PerformanceForecastData, BenchmarkComparisonData, ROIDashboardData, AdvancedPerformanceSeries # Added Advanced Analytics Data Models
)
from app.services.dashboard_service import DashboardService, get_dashboard_service
from typing import List, Optional # For list type hinting and Optional


# Placeholder for an auth dependency - replace with actual auth later
# This should ideally return a User object or at least user_id and tenant_id
class MockUser:
    def __init__(self, id: str, tenant_id: int):
        self.id = id
        self.tenant_id = tenant_id

async def get_current_user() -> MockUser:
    # In a real app, this would come from a token or session
    return MockUser(id="user123", tenant_id=1)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["dashboard"],
    # dependencies=[Depends(get_current_active_user)] # Add actual auth dependency later
)

# --- Standard Dashboard Endpoints (Existing) ---
@router.get("/productivity-chart", response_model=ProductivityChart)
async def read_productivity_chart(
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_productivity_chart_data(user_id=current_user.id)

@router.get("/activity-breakdown", response_model=ActivityBreakdown)
async def read_activity_breakdown(
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_activity_breakdown(user_id=current_user.id)

@router.get("/metrics", response_model=ProductivityMetricsGroup)
async def read_productivity_metrics(
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_productivity_metrics(user_id=current_user.id)

@router.get("/recent-activities", response_model=RecentActivities)
async def read_recent_activities(
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_recent_activities(user_id=current_user.id)

# --- Advanced Analytics Data Endpoints ---
@router.get("/advanced/multi-dim-performance", response_model=List[AdvancedPerformanceSeries])
async def read_multi_dim_performance(
    metric_ids: List[int] = Query(...), # Example: ?metric_ids=1&metric_ids=2
    time_period: str = Query("30d"),
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_multi_dimensional_performance_data(user_id=current_user.id, metric_ids=metric_ids, time_period=time_period)

@router.get("/advanced/performance-forecast", response_model=PerformanceForecastData)
async def read_performance_forecast(
    model_id: int,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_performance_forecast_data(user_id=current_user.id, model_id=model_id)

@router.get("/advanced/benchmark-comparison", response_model=List[BenchmarkComparisonData])
async def read_benchmark_comparison(
    entity_id: int,
    metric_name: str,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_benchmark_comparison_data(user_id=current_user.id, entity_id=entity_id, metric_name=metric_name)

@router.get("/advanced/roi-overview", response_model=ROIDashboardData)
async def read_roi_overview(
    project_ids: List[int] = Query(...), # Example: ?project_ids=1&project_ids=2
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_roi_dashboard_data(user_id=current_user.id, project_ids=project_ids)


# --- Custom Dashboard Management Endpoints ---
@router.post("/custom", response_model=CustomDashboard, status_code=201)
async def create_custom_dashboard(
    name: str,
    description: Optional[str] = None,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.create_custom_dashboard(tenant_id=current_user.tenant_id, user_id=current_user.id, name=name, description=description)

@router.get("/custom/{dashboard_id}", response_model=CustomDashboard)
async def get_custom_dashboard(
    dashboard_id: str,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    dashboard = await service.get_custom_dashboard(dashboard_id=dashboard_id, user_id=current_user.id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found or not accessible")
    return dashboard

@router.get("/custom", response_model=List[CustomDashboard])
async def list_user_custom_dashboards(
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return await service.get_user_custom_dashboards(user_id=current_user.id, tenant_id=current_user.tenant_id)

@router.put("/custom/{dashboard_id}/layout", response_model=CustomDashboard)
async def update_dashboard_layout(
    dashboard_id: str,
    layout: DashboardLayout,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    dashboard = await service.update_custom_dashboard_layout(dashboard_id=dashboard_id, user_id=current_user.id, layout=layout)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found or failed to update")
    return dashboard

@router.post("/custom/{dashboard_id}/widgets", response_model=CustomDashboard)
async def add_widget_to_dashboard(
    dashboard_id: str,
    widget: WidgetConfig,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    dashboard = await service.add_widget_to_dashboard(dashboard_id=dashboard_id, user_id=current_user.id, widget_config=widget)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found or failed to add widget")
    return dashboard

@router.delete("/custom/{dashboard_id}/widgets/{widget_id}", response_model=CustomDashboard)
async def remove_widget_from_dashboard(
    dashboard_id: str,
    widget_id: str,
    current_user: MockUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    dashboard = await service.remove_widget_from_dashboard(dashboard_id=dashboard_id, user_id=current_user.id, widget_id=widget_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard or widget not found, or failed to remove widget")
    return dashboard

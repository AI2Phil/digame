from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from ..database import get_db
from ..services.analytics_service import AnalyticsService, get_analytics_service
from ..services.dashboard_service_custom import CustomDashboardService, get_custom_dashboard_service # Import custom dashboard service
from ..schemas import analytics_schemas as schemas # Renamed for clarity
from ..models.user import User # Assuming User model for current_user dependency
from ..auth.auth_dependencies import get_current_active_user # Placeholder for auth

router = APIRouter(
    prefix="/advanced-analytics",
    tags=["Advanced Analytics"],
    responses={404: {"description": "Not found"}},
)

# --- Performance Metrics Endpoints ---

@router.post(
    "/performance-metrics/",
    response_model=schemas.PerformanceMetricInDB,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new performance metric"
)
async def record_performance_metric(
    metric_data: schemas.PerformanceMetricCreate,
    db: Session = Depends(get_db),
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user) # Requires tenant_id from user or context
):
    # Assuming tenant_id can be derived from current_user or a header/token
    # For now, let's assume a placeholder or that service handles it if not in metric_data
    # This will need proper tenant handling based on your auth setup
    tenant_id = current_user.tenant_id # Example: user has a tenant_id attribute
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    # Add tenant_id to metric_data if not already present or to ensure it's correct
    # metric_data_dict = metric_data.dict()
    # metric_data_dict["tenant_id"] = tenant_id
    # No, service method expects tenant_id as separate arg

    created_metric = service.record_performance_metric(
        tenant_id=tenant_id,
        metric_data=metric_data.dict(),
        measured_by_user_id=current_user.id
    )
    return created_metric

@router.get(
    "/performance-metrics/",
    response_model=List[schemas.PerformanceMetricInDB],
    summary="List performance metrics"
)
async def list_performance_metrics(
    metric_type: Optional[str] = None,
    category: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    metrics = service.get_performance_metrics(
        tenant_id=tenant_id,
        metric_type=metric_type,
        category=category,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit
    )
    return metrics

@router.get(
    "/performance-metrics/{metric_id}",
    response_model=schemas.PerformanceMetricInDB,
    summary="Get a specific performance metric by ID"
)
async def get_performance_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    # In a real scenario, the service method should also take tenant_id for security
    # For now, assuming get_performance_metrics (if adapted) or a new get_by_id method handles it.
    # Let's assume a get_performance_metric_by_id method in service for this example
    # metric = service.get_performance_metric_by_id(metric_id=metric_id, tenant_id=tenant_id)

    # Using existing get_performance_metrics and filtering locally (less ideal for single fetch)
    metrics = service.get_performance_metrics(tenant_id=tenant_id, limit=10000) # Fetch more to find one
    metric = next((m for m in metrics if m.id == metric_id), None)

    if not metric:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Performance metric not found")
    return metric


@router.post(
    "/performance-metrics/compare-benchmark/",
    response_model=List[schemas.BenchmarkComparisonResult],
    summary="Compare a performance metric with benchmarks"
)
async def compare_metric_with_benchmarks(
    comparison_input: schemas.BenchmarkComparisonInput,
    db: Session = Depends(get_db),
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")

    try:
        comparisons = service.compare_performance_metric_with_benchmarks(
            performance_metric_id=comparison_input.performance_metric_id,
            tenant_id=tenant_id,
            benchmark_params=comparison_input.benchmark_filter_params
        )
        return comparisons
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Analytics Models Endpoints (Placeholder) ---
@router.post("/models/", response_model=schemas.AnalyticsModelInDB, summary="Create an analytics model")
async def create_analytics_model_endpoint(model_data: schemas.AnalyticsModelCreate, service: AnalyticsService = Depends(get_analytics_service), current_user: User = Depends(get_current_active_user)):
    tenant_id = current_user.tenant_id
    # Actual implementation would call service.create_analytics_model
    raise HTTPException(status_code=501, detail="Not Implemented")

# --- Predictions Endpoints (Placeholder) ---
@router.post("/predictions/", response_model=schemas.AnalyticsPredictionInDB, summary="Make an analytics prediction")
async def make_analytics_prediction_endpoint(prediction_data: schemas.AnalyticsPredictionCreate, service: AnalyticsService = Depends(get_analytics_service), current_user: User = Depends(get_current_active_user)):
    tenant_id = current_user.tenant_id
    # Actual implementation would call service.make_prediction or make_prediction_with_benchmark
    raise HTTPException(status_code=501, detail="Not Implemented")

# --- ROI Calculations Endpoints (Placeholder) ---
@router.post("/roi-calculations/", response_model=schemas.ROICalculationInDB, summary="Create an ROI calculation")
async def create_roi_calculation_endpoint(roi_data: schemas.ROICalculationCreate, service: AnalyticsService = Depends(get_analytics_service), current_user: User = Depends(get_current_active_user)):
    tenant_id = current_user.tenant_id
    # Actual implementation would call service.create_roi_calculation
    raise HTTPException(status_code=501, detail="Not Implemented")

# --- Comparative Benchmarks Endpoints (Placeholder) ---
@router.post("/benchmarks/", response_model=schemas.ComparativeBenchmarkInDB, summary="Add a comparative benchmark")
async def add_comparative_benchmark_endpoint(benchmark_data: schemas.ComparativeBenchmarkCreate, service: AnalyticsService = Depends(get_analytics_service), current_user: User = Depends(get_current_active_user)):
    # tenant_id for benchmark can be None (global) or specific.
    # If benchmark_data.tenant_id is None, it's global. Otherwise, it's for that tenant.
    # Access control might be needed here for who can create global vs tenant benchmarks.
    # For now, assume current_user.id is passed as created_by_user_id
    raise HTTPException(status_code=501, detail="Not Implemented")


# --- Custom Analytics Dashboards Endpoints ---
dashboard_service_dependency = Depends(get_custom_dashboard_service)

@router.post(
    "/dashboards/",
    response_model=schemas.AnalyticsDashboardInDB,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new custom analytics dashboard"
)
async def create_analytics_dashboard(
    dashboard_data: schemas.AnalyticsDashboardCreate,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    return service.create_dashboard(tenant_id=tenant_id, user_id=current_user.id, dashboard_data=dashboard_data)

@router.get(
    "/dashboards/",
    response_model=List[schemas.AnalyticsDashboardInDB],
    summary="List custom analytics dashboards for the current user"
)
async def list_analytics_dashboards(
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    return service.get_dashboards_by_user(user_id=current_user.id, tenant_id=tenant_id)

@router.get(
    "/dashboards/{dashboard_id}",
    response_model=schemas.AnalyticsDashboardInDB,
    summary="Get a specific custom analytics dashboard"
)
async def get_analytics_dashboard(
    dashboard_id: int,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    dashboard = service.get_dashboard(dashboard_id=dashboard_id, tenant_id=tenant_id)
    if not dashboard or dashboard.user_id != current_user.id: # Basic ownership check
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found or access denied")
    return dashboard

@router.put(
    "/dashboards/{dashboard_id}",
    response_model=schemas.AnalyticsDashboardInDB,
    summary="Update a custom analytics dashboard"
)
async def update_analytics_dashboard(
    dashboard_id: int,
    dashboard_update_data: schemas.AnalyticsDashboardUpdate,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    updated_dashboard = service.update_dashboard(
        dashboard_id=dashboard_id,
        tenant_id=tenant_id,
        user_id=current_user.id,
        dashboard_update_data=dashboard_update_data
    )
    if not updated_dashboard:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found or access denied")
    return updated_dashboard

@router.delete(
    "/dashboards/{dashboard_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a custom analytics dashboard"
)
async def delete_analytics_dashboard(
    dashboard_id: int,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    success = service.delete_dashboard(dashboard_id=dashboard_id, tenant_id=tenant_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found or access denied")
    return

# --- Dashboard Widgets Endpoints ---
@router.post(
    "/widgets/",
    response_model=schemas.DashboardWidgetConfigInDB, # Changed from DashboardWidget to DashboardWidgetConfigInDB
    status_code=status.HTTP_201_CREATED,
    summary="Create a new dashboard widget configuration"
)
async def create_dashboard_widget(
    widget_data: schemas.DashboardWidgetConfigCreate, # Changed from DashboardWidgetCreate
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    return service.create_widget(tenant_id=tenant_id, widget_data=widget_data)

@router.get(
    "/widgets/{widget_id}",
    response_model=schemas.DashboardWidgetConfigInDB, # Changed
    summary="Get a specific dashboard widget configuration"
)
async def get_dashboard_widget(
    widget_id: int,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    widget = service.get_widget(widget_id=widget_id, tenant_id=tenant_id)
    if not widget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget not found")
    return widget

@router.get(
    "/widgets/{widget_id}/data",
    # Define a specific response model for widget data if it becomes complex
    # For now, using Dict or Any
    response_model=Dict[str, Any],
    summary="Fetch data for a specific dashboard widget"
)
async def get_dashboard_widget_data(
    widget_id: int,
    service: CustomDashboardService = dashboard_service_dependency,
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    try:
        # Pass current_user if widget data needs to be user-contextual
        widget_data = await service.get_widget_data(widget_id=widget_id, tenant_id=tenant_id) #, current_user=current_user)
        return widget_data
    except HTTPException as e: # Propagate HTTP exceptions from service
        raise e
    except Exception as e: # Catch other errors
        # Log the error e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching widget data.")


# --- Reporting Endpoints (Conceptual Placeholder) ---
# POST /reports/definitions/
# GET /reports/definitions/
# POST /reports/schedules/
# POST /reports/export/

# TODO: Add other CRUD endpoints for each entity (AnalyticsModel, Prediction, ROI, Benchmark)
# TODO: Add endpoints for training models, etc.
# TODO: Implement proper tenant isolation and authorization in all endpoints.
# TODO: Refine error handling and response codes.
# TODO: Integrate with actual User model and auth dependencies.
# The current_user dependency is a placeholder for a real auth system.
# Tenant ID handling needs to be robust based on the application's multi-tenancy strategy.
pass

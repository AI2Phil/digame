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
@router.post("/models/", response_model=schemas.AnalyticsModelInDB, status_code=status.HTTP_201_CREATED, summary="Create an analytics model")
async def create_analytics_model_endpoint(
    model_data: schemas.AnalyticsModelCreate,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    created_model = service.create_analytics_model(
        tenant_id=tenant_id,
        model_data=model_data.dict(),
        created_by_user_id=current_user.id
    )
    return created_model

@router.get("/models/", response_model=List[schemas.AnalyticsModelInDB], summary="List analytics models")
async def list_analytics_models_endpoint(
    model_type: Optional[str] = None,
    category: Optional[str] = None,
    active_only: bool = True,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    models = service.get_analytics_models(
        tenant_id=tenant_id,
        model_type=model_type,
        category=category,
        active_only=active_only
    )
    return models

@router.get("/models/{model_id}", response_model=schemas.AnalyticsModelInDB, summary="Get a specific analytics model")
async def get_analytics_model_endpoint(
    model_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    model = service.get_model_by_id(model_id=model_id, tenant_id=tenant_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analytics model with id {model_id} not found.")
    return model

@router.put("/models/{model_id}", response_model=schemas.AnalyticsModelInDB, summary="Update an analytics model")
async def update_analytics_model_endpoint(
    model_id: int,
    model_update_data: schemas.AnalyticsModelUpdate, # Schema to be created
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    updated_model = service.update_analytics_model( # Method to be created in service
        model_id=model_id,
        tenant_id=tenant_id,
        model_update_data=model_update_data,
        updated_by_user_id=current_user.id
    )
    if not updated_model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analytics model with id {model_id} not found or update failed.")
    return updated_model

@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an analytics model")
async def delete_analytics_model_endpoint(
    model_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    success = service.delete_analytics_model( # Method to be created in service
        model_id=model_id,
        tenant_id=tenant_id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analytics model with id {model_id} not found or delete failed.")
    return

@router.post("/models/{model_id}/train", response_model=schemas.AnalyticsTrainingJobInDB, summary="Train an analytics model") # Assuming a schema for Training Job
async def train_analytics_model_endpoint(
    model_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id # Used to verify model ownership/access before training
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    # Verify model exists and belongs to tenant before triggering training
    model = service.get_model_by_id(model_id=model_id, tenant_id=tenant_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analytics model with id {model_id} not found for this tenant.")

    try:
        # The train_model service method is async
        training_job = await service.train_model(
            model_id=model_id,
            triggered_by="api_user",
            triggered_by_user_id=current_user.id
        )
        return training_job
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Log error e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error training model: {str(e)}")

# --- Predictions Endpoints ---
@router.post("/predictions/", response_model=schemas.AnalyticsPredictionInDB, status_code=status.HTTP_201_CREATED, summary="Make an analytics prediction")
async def make_analytics_prediction_endpoint(
    prediction_data: schemas.AnalyticsPredictionCreate, # This schema might need adjustment based on service method
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    # The service method `make_prediction` expects:
    # model_id: int, entity_type: str, entity_id: int, input_features: Dict[str, Any], ...
    # The schema AnalyticsPredictionCreate likely needs to contain these fields.
    # Assuming prediction_data contains these fields directly or nested.
    # For this example, let's assume prediction_data has attributes like model_id, entity_type, etc.

    # Example: Unpacking prediction_data (adjust based on actual AnalyticsPredictionCreate schema)
    # This might need refinement based on how AnalyticsPredictionCreate is defined.
    # If it's designed to directly map to what make_prediction needs (excluding tenant_id, user_id).

    # Let's assume AnalyticsPredictionCreate has: model_id, entity_type, entity_id, input_features, prediction_horizon_days
    # And the service will handle the creation of the AnalyticsPrediction DB model.

    try:
        # The make_prediction service method is async
        prediction_result = await service.make_prediction(
            model_id=prediction_data.model_id,
            entity_type=prediction_data.entity_type,
            entity_id=prediction_data.entity_id,
            input_features=prediction_data.input_features,
            prediction_horizon_days=prediction_data.prediction_horizon_days,
            created_by_user_id=current_user.id
            # tenant_id is implicitly handled by the model associated with model_id in the service,
            # or could be passed if service logic required it for prediction context directly.
            # For now, assume the model (model_id) is already tenant-scoped.
        )
        return prediction_result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Log error e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error making prediction.")

@router.get("/predictions/", response_model=List[schemas.AnalyticsPredictionInDB], summary="List analytics predictions")
async def list_analytics_predictions_endpoint(
    model_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    limit: int = 50,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    predictions = service.get_predictions(
        tenant_id=tenant_id,
        model_id=model_id,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit
    )
    return predictions

@router.get("/predictions/{prediction_id}", response_model=schemas.AnalyticsPredictionInDB, summary="Get a specific analytics prediction")
async def get_analytics_prediction_endpoint(
    prediction_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    prediction = service.get_prediction_by_id( # Method to be created in service
        prediction_id=prediction_id,
        tenant_id=tenant_id
    )
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Analytics prediction with id {prediction_id} not found.")
    return prediction

# --- ROI Calculations Endpoints ---
@router.post("/roi-calculations/", response_model=schemas.ROICalculationInDB, status_code=status.HTTP_201_CREATED, summary="Create an ROI calculation")
async def create_roi_calculation_endpoint(
    roi_data: schemas.ROICalculationCreate,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    created_roi_calculation = service.create_roi_calculation(
        tenant_id=tenant_id,
        roi_data=roi_data.dict(), # Pass the whole dict
        calculated_by_user_id=current_user.id
    )
    return created_roi_calculation

@router.get("/roi-calculations/", response_model=List[schemas.ROICalculationInDB], summary="List ROI calculations")
async def list_roi_calculations_endpoint(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    limit: int = 50,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    calculations = service.get_roi_calculations(
        tenant_id=tenant_id,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit
    )
    return calculations

@router.get("/roi-calculations/{calculation_id}", response_model=schemas.ROICalculationInDB, summary="Get a specific ROI calculation")
async def get_roi_calculation_endpoint(
    calculation_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    calculation = service.get_roi_calculation_by_id( # Method to be created in service
        calculation_id=calculation_id,
        tenant_id=tenant_id
    )
    if not calculation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ROI calculation with id {calculation_id} not found.")
    return calculation

@router.put("/roi-calculations/{calculation_id}", response_model=schemas.ROICalculationInDB, summary="Update an ROI calculation")
async def update_roi_calculation_endpoint(
    calculation_id: int,
    roi_update_data: schemas.ROICalculationUpdate, # Schema to be created
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    updated_calculation = service.update_roi_calculation( # Method to be created in service
        calculation_id=calculation_id,
        tenant_id=tenant_id,
        roi_update_data=roi_update_data,
        updated_by_user_id=current_user.id
    )
    if not updated_calculation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ROI calculation with id {calculation_id} not found or update failed.")
    return updated_calculation

@router.delete("/roi-calculations/{calculation_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an ROI calculation")
async def delete_roi_calculation_endpoint(
    calculation_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found for current user.")

    success = service.delete_roi_calculation( # Method to be created in service
        calculation_id=calculation_id,
        tenant_id=tenant_id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ROI calculation with id {calculation_id} not found or delete failed.")
    return

# --- Comparative Benchmarks Endpoints ---
@router.post("/benchmarks/", response_model=schemas.ComparativeBenchmarkInDB, status_code=status.HTTP_201_CREATED, summary="Add a comparative benchmark")
async def add_comparative_benchmark_endpoint(
    benchmark_data: schemas.ComparativeBenchmarkCreate,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    # tenant_id for benchmark can be None (global) or specific.
    # The ComparativeBenchmarkCreate schema should include an optional tenant_id.
    # If benchmark_data.tenant_id is provided, it's a tenant-specific benchmark.
    # If not, it's a global benchmark.
    # Access control for creating global vs. tenant-specific benchmarks might be needed (e.g., admin role for global).
    # For now, we'll pass the tenant_id from benchmark_data if present, or None.

    # The service method add_benchmark_data expects `tenant_id` as an argument.
    # The schema ComparativeBenchmarkCreate should ideally have `tenant_id: Optional[int]`
    # Let's assume benchmark_data might contain tenant_id.
    # If benchmark_data.tenant_id is None, it implies a global benchmark.
    # The service method `add_benchmark_data` takes `tenant_id: Optional[int]`.

    tenant_id_for_benchmark = benchmark_data.tenant_id # Assumes this field exists in the schema

    # Simple authorization: only allow users to create benchmarks for their own tenant or global if they are admin (not implemented here)
    if tenant_id_for_benchmark is not None and tenant_id_for_benchmark != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create benchmarks for another tenant.")

    created_benchmark = service.add_benchmark_data(
        benchmark_data=benchmark_data.dict(), # Pass the whole dict
        tenant_id=tenant_id_for_benchmark, # Pass the tenant_id from the payload (can be None)
        created_by_user_id=current_user.id
    )
    return created_benchmark

@router.get("/benchmarks/", response_model=List[schemas.ComparativeBenchmarkInDB], summary="List comparative benchmarks")
async def list_comparative_benchmarks_endpoint(
    metric_name: Optional[str] = None, # Specific filter for benchmarks
    category: Optional[str] = None,
    industry_segment: Optional[str] = None,
    region: Optional[str] = None,
    company_size: Optional[str] = None,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user) # tenant_id from current_user used to fetch global + tenant-specific
):
    tenant_id = current_user.tenant_id # This will be used to fetch tenant-specific + global benchmarks
    # The service.get_benchmarks method already handles filtering for global (tenant_id=None) and specific tenant_id.
    # It needs metric_name to be effective, though.
    if not metric_name: # Making metric_name mandatory for listing, or adjust service layer
        # Alternatively, the service could list all benchmarks for a tenant + global if metric_name is None,
        # but that might be too broad. For now, let's assume metric_name is usually provided for context.
        # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query parameter 'metric_name' is required.")
        pass # Allowing no metric_name to list all benchmarks scoped to tenant/global

    benchmarks = service.get_benchmarks(
        metric_name=metric_name,
        tenant_id=tenant_id, # Pass current user's tenant_id for scoping
        category=category,
        industry_segment=industry_segment,
        region=region,
        company_size=company_size
    )
    return benchmarks

@router.get("/benchmarks/{benchmark_id}", response_model=schemas.ComparativeBenchmarkInDB, summary="Get a specific comparative benchmark")
async def get_comparative_benchmark_endpoint(
    benchmark_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user) # tenant_id for access check
):
    # Benchmarks can be global (tenant_id is None) or tenant-specific.
    # A user should be able to fetch any global benchmark, or a benchmark specific to their tenant.
    benchmark = service.get_benchmark_by_id( # Method to be created in service
        benchmark_id=benchmark_id,
        tenant_id=current_user.tenant_id # Pass tenant_id to check access
    )
    if not benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comparative benchmark with id {benchmark_id} not found or not accessible.")
    return benchmark

@router.put("/benchmarks/{benchmark_id}", response_model=schemas.ComparativeBenchmarkInDB, summary="Update a comparative benchmark")
async def update_comparative_benchmark_endpoint(
    benchmark_id: int,
    benchmark_update_data: schemas.ComparativeBenchmarkUpdate, # Schema to be created
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    # Similar to creation, updates need to respect tenant ownership or admin rights for global benchmarks.
    # The service method will need to handle this logic.
    # We pass current_user.tenant_id to the service to check if the user is allowed to update this benchmark.
    updated_benchmark = service.update_benchmark( # Method to be created in service
        benchmark_id=benchmark_id,
        benchmark_update_data=benchmark_update_data,
        requesting_tenant_id=current_user.tenant_id, # For access check
        updated_by_user_id=current_user.id
    )
    if not updated_benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comparative benchmark with id {benchmark_id} not found or update failed.")
    return updated_benchmark

@router.delete("/benchmarks/{benchmark_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a comparative benchmark")
async def delete_comparative_benchmark_endpoint(
    benchmark_id: int,
    service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    # Similar access control logic as update.
    success = service.delete_benchmark( # Method to be created in service
        benchmark_id=benchmark_id,
        requesting_tenant_id=current_user.tenant_id # For access check
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Comparative benchmark with id {benchmark_id} not found or delete failed.")
    return

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

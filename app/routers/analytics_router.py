"""
Advanced Analytics router for predictive performance modeling and ROI measurement
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import uuid # Added for UUID generation in mocks

from ..services.analytics_service import get_analytics_service, AnalyticsService # Ensure AnalyticsService is imported for type hinting if needed by get_analytics_service_instance
from ..models.analytics import AnalyticsModel, AnalyticsPrediction, ROICalculation, PerformanceMetric
from ..schemas import analytics_schemas # Import your schemas

# Mock dependencies for development
# In a real app, these would connect to your actual database and auth systems
def get_db():
    """Mock database session"""
    return None

def get_current_user():
    """Mock current user"""
    class MockUser:
        def __init__(self):
            self.id = 1
            self.email = "user@example.com"
            self.full_name = "Test User"
    return MockUser()

def get_current_tenant():
    """Mock current tenant"""
    return 1

router = APIRouter(prefix="/analytics", tags=["advanced-analytics"])

# Analytics Models Endpoints

@router.get("/models", response_model=dict)
async def get_analytics_models(
    model_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get analytics models for tenant"""
    
    # Mock analytics models data
    models = [
        {
            "id": 1,
            "model_uuid": "model-123e4567-e89b-12d3-a456-426614174000",
            "name": "user_performance_predictor",
            "display_name": "User Performance Predictor",
            "description": "Predicts user performance based on activity patterns and engagement metrics",
            "model_type": "performance",
            "category": "predictive",
            "algorithm": "random_forest_regressor",
            "features": ["hours_worked", "tasks_completed", "meetings_attended", "experience_years"],
            "target_variable": "performance_score",
            "status": "trained",
            "is_active": True,
            "is_production": True,
            "accuracy_score": 0.87,
            "r2_score": 0.82,
            "mae_score": 5.2,
            "prediction_count": 1250,
            "last_trained_at": "2025-05-20T10:30:00Z",
            "last_prediction_at": "2025-05-24T09:45:00Z",
            "created_at": "2025-05-01T14:20:00Z"
        },
        {
            "id": 2,
            "model_uuid": "model-456e7890-e89b-12d3-a456-426614174001",
            "name": "productivity_optimizer",
            "display_name": "Productivity Optimizer",
            "description": "Analyzes productivity patterns and suggests optimization strategies",
            "model_type": "productivity",
            "category": "prescriptive",
            "algorithm": "linear_regression",
            "features": ["focus_time_hours", "interruptions_count", "tools_used", "collaboration_score"],
            "target_variable": "productivity_index",
            "status": "trained",
            "is_active": True,
            "is_production": False,
            "accuracy_score": 0.79,
            "r2_score": 0.75,
            "mae_score": 8.1,
            "prediction_count": 890,
            "last_trained_at": "2025-05-22T16:15:00Z",
            "last_prediction_at": "2025-05-24T08:30:00Z",
            "created_at": "2025-05-10T11:45:00Z"
        }
    ]
    
    # Apply filters
    if model_type:
        models = [m for m in models if m["model_type"] == model_type]
    
    if category:
        models = [m for m in models if m["category"] == category]
    
    if active_only:
        models = [m for m in models if m["is_active"]]
    
    # Apply pagination
    total = len(models)
    models = models[skip:skip + limit]
    
    return {
        "success": True,
        "models": models,
        "total": total,
        "skip": skip,
        "limit": limit,
        "model_types": ["performance", "productivity", "roi", "churn", "engagement"],
        "categories": ["predictive", "descriptive", "prescriptive"],
        "algorithms": ["linear_regression", "random_forest_regressor", "random_forest_classifier", "logistic_regression"]
    }

@router.post("/models", response_model=dict)
async def create_analytics_model(
    model_data: dict,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new analytics model"""
    
    try:
        # Mock model creation
        model_info = {
            "id": 4, # Placeholder ID
            "model_uuid": str(uuid.uuid4()), # Generate a UUID
            "tenant_id": tenant_id,
            "name": model_data.get("name", "new_model"),
            "display_name": model_data.get("display_name", "New Model"),
            "description": model_data.get("description"),
            "model_type": model_data.get("model_type", "performance"),
            "category": model_data.get("category", "predictive"),
            "algorithm": model_data.get("algorithm", "linear_regression"),
            "features": model_data.get("features", []),
            "target_variable": model_data.get("target_variable", "target"),
            "hyperparameters": model_data.get("hyperparameters", {}),
            "dimensions": model_data.get("dimensions", []), # New field
            "metrics": model_data.get("metrics", []), # New field
            "aggregation_types": model_data.get("aggregation_types", {}), # New field
            "training_data_source": model_data.get("training_data_source", "user_activities"),
            "training_period_days": model_data.get("training_period_days", 90),
            "retrain_frequency_days": model_data.get("retrain_frequency_days", 7),
            "validation_split": model_data.get("validation_split", 0.2),
            "status": "draft",
            "is_active": True,
            "is_production": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "created_by_user_id": current_user.id,
            "accuracy_score": None, # Initialize performance metrics
            "precision_score": None,
            "recall_score": None,
            "f1_score": None,
            "r2_score": None,
            "mae_score": None,
            "rmse_score": None,
            "last_trained_at": None,
            "prediction_count": 0,
            "last_prediction_at": None
        }
        
        return {
            "success": True,
            "message": "Analytics model created successfully",
            "model": model_info
        }
        
    except Exception as e:
        logging.error(f"Failed to create analytics model: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create analytics model")

@router.post("/models/{model_id}/train", response_model=dict)
async def train_model(
    model_id: int,
    training_config: dict,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Train an analytics model"""
    
    # Mock training job initiation
    training_job = {
        "id": 1,
        "job_uuid": "job-123e4567-e89b-12d3-a456-426614174000",
        "model_id": model_id,
        "job_type": training_config.get("job_type", "retrain"),
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
        "training_config": training_config,
        "triggered_by": "user",
        "triggered_by_user_id": current_user.id
    }
    
    return {
        "success": True,
        "message": "Model training started",
        "training_job": training_job
    }

@router.post("/models/{model_id}/predict", response_model=dict)
async def make_prediction(
    model_id: int,
    prediction_data: dict,
    benchmark_params: Optional[Dict[str, Any]] = None, # For benchmark comparison
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Make a prediction using a trained model, optionally with benchmark comparison."""
    
    # Mock prediction
    # This mock needs to be more sophisticated to reflect potential multi-dim output
    # and benchmark data based on the service layer changes.

    mock_predicted_value_single = 78.5
    mock_predicted_values_multi_dim = None
    mock_benchmark_data = None

    # Simulate multi-dim output if model_id implies it (e.g. model_id == 3)
    if model_id == 3: # Arbitrary condition for mock multi-dim
        mock_predicted_value_single = None # Or a summary value
        mock_predicted_values_multi_dim = [
            {"dims": {"region": "NA", "product_line": "X"}, "metric": "sales_forecast", "value": 1200.50},
            {"dims": {"region": "EMEA", "product_line": "X"}, "metric": "sales_forecast", "value": 950.75}
        ]

    if benchmark_params:
        mock_benchmark_data = {
            "benchmark_name": "Industry Average Q1 Sales",
            "benchmark_value": (mock_predicted_value_single or 1000) * 0.9, # Mock benchmark value
            "entity_value": mock_predicted_value_single or 1000,
            "difference": (mock_predicted_value_single or 1000) * 0.1,
            "unit": "units"
        }

    prediction = {
        "id": 1, # Placeholder
        "prediction_uuid": str(uuid.uuid4()),
        "model_id": model_id,
        "entity_type": prediction_data.get("entity_type", "user"),
        "entity_id": prediction_data.get("entity_id", 1),
        "prediction_type": "performance", # This might come from the model in a real scenario
        "input_features": prediction_data.get("input_features", {}),
        "predicted_value": mock_predicted_value_single,
        "predicted_values_multi_dim": mock_predicted_values_multi_dim,
        "confidence_score": 0.84,
        "prediction_interval_lower": mock_predicted_value_single * 0.9 if mock_predicted_value_single else None,
        "prediction_interval_upper": mock_predicted_value_single * 1.1 if mock_predicted_value_single else None,
        "benchmark_comparison_data": mock_benchmark_data,
        "prediction_horizon_days": prediction_data.get("prediction_horizon_days"),
        "prediction_date": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat() if prediction_data.get("prediction_horizon_days") else None,
        "feature_importance": { # Assuming this is still relevant
            "experience_years": 0.35,
            "tasks_completed": 0.28,
        },
        "raw_prediction_output": {"detail": "Raw output from model..."} # Mock raw output
    }
    
    return {
        "success": True,
        "message": "Prediction generated successfully",
        "prediction": prediction
    }

@router.get("/predictions", response_model=dict)
async def get_predictions(
    model_id: Optional[int] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get predictions for tenant"""
    
    # Mock predictions data - updated to reflect new fields
    predictions = [
        {
            "id": 1,
            "prediction_uuid": "pred-123e4567-e89b-12d3-a456-426614174000",
            "model_id": 1,
            "model_name": "user_performance_predictor",
            "entity_type": "user",
            "entity_id": 101,
            "prediction_type": "performance",
            "predicted_value": 78.5,
            "predicted_values_multi_dim": None, # Example for single value prediction
            "benchmark_comparison_data": {
                 "benchmark_name": "Team Average Performance",
                 "benchmark_value": 75.0,
                 "entity_value": 78.5,
                 "difference": 3.5,
                 "unit": "%"
            },
            "confidence_score": 0.84,
            "prediction_date": "2025-05-24T09:45:00Z",
            "is_validated": False,
            "actual_value": None,
            "prediction_error": None,
            "raw_prediction_output": {"detail": "Model raw output for pred 1..."}
        },
        {
            "id": 2,
            "prediction_uuid": "pred-456e7890-e89b-12d3-a456-426614174001",
            "model_id": 2, # Assume this is a simple model
            "model_name": "productivity_optimizer",
            "entity_type": "user",
            "entity_id": 102,
            "prediction_type": "productivity",
            "predicted_value": 65.2,
            "predicted_values_multi_dim": None,
            "benchmark_comparison_data": None,
            "confidence_score": 0.79,
            "prediction_date": "2025-05-24T08:30:00Z",
            "is_validated": True,
            "actual_value": 67.1,
            "prediction_error": 1.9,
            "raw_prediction_output": None
        },
        {
            "id": 3,
            "prediction_uuid": "pred-789f0123-e89b-12d3-a456-426614174002",
            "model_id": 3, # Assume this is a multi-dim model
            "model_name": "multi_dim_sales_forecaster",
            "entity_type": "product_line",
            "entity_id": 201,
            "prediction_type": "sales_forecast",
            "predicted_value": None, # No single value for this mock
            "predicted_values_multi_dim": [
                {"dims": {"region": "NA"}, "metric": "units_forecasted", "value": 1500},
                {"dims": {"region": "EMEA"}, "metric": "units_forecasted", "value": 1200},
            ],
            "benchmark_comparison_data": None,
            "confidence_score": 0.88,
            "prediction_date": "2025-05-24T10:15:00Z",
            "is_validated": False,
            "actual_value": None,
            "prediction_error": None,
            "raw_prediction_output": {"detail": "Multi-dim raw output for pred 3..."}
        }
    ]
    
    # Apply filters
    if model_id:
        predictions = [p for p in predictions if p["model_id"] == model_id]
    
    if entity_type:
        predictions = [p for p in predictions if p["entity_type"] == entity_type]
    
    if entity_id:
        predictions = [p for p in predictions if p["entity_id"] == entity_id]
    
    # Apply pagination
    total = len(predictions)
    predictions = predictions[skip:skip + limit]
    
    return {
        "success": True,
        "predictions": predictions,
        "total": total,
        "skip": skip,
        "limit": limit
    }

# Comparative Benchmark Endpoints

@router.post("/benchmarks", response_model=analytics_schemas.ComparativeBenchmarkInDB, status_code=201)
async def create_benchmark(
    benchmark_data: analytics_schemas.ComparativeBenchmarkCreate,
    current_user=Depends(get_current_user),
    # tenant_id can be part of benchmark_data if it's for a specific tenant, or None for global
    # For this endpoint, let's assume tenant_id in ComparativeBenchmarkCreate schema handles this.
    # If benchmark_data.tenant_id is None, it's a global benchmark (requires admin check in service).
    # If benchmark_data.tenant_id is set, it must match current_tenant (or user must be admin).
    requesting_tenant_id: int = Depends(get_current_tenant), # The tenant of the user making the request
    db: Session = Depends(get_db)
):
    """Create new comparative benchmark data."""
    analytics_service = get_analytics_service_instance(db)
    
    # Authorization: If tenant_id is specified in benchmark_data, it should match the user's tenant,
    # unless the user is an admin (admin check not implemented here).
    if benchmark_data.tenant_id is not None and benchmark_data.tenant_id != requesting_tenant_id:
        # Non-admin user trying to create a benchmark for another tenant.
        # Or, if benchmark_data.tenant_id is None (global), specific admin check would be needed in service.
        # For simplicity, the service add_benchmark_data will just use the tenant_id provided.
        # A more robust check for creating tenant-specific benchmarks:
        pass # Service will handle it, or further checks can be added if user roles are available.

    # Mocking the service call for now, replace with actual call
    # new_benchmark = analytics_service.add_benchmark_data(
    #     benchmark_data=benchmark_data.dict(),
    #     tenant_id=benchmark_data.tenant_id, # Passed from schema
    #     created_by_user_id=current_user.id
    # )
    # return new_benchmark

    # Mock response:
    mock_db_benchmark = analytics_schemas.ComparativeBenchmarkInDB(
        id=1, # Example ID
        benchmark_uuid=str(uuid.uuid4()),
        created_by_user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **benchmark_data.dict()
    )
    return mock_db_benchmark

@router.get("/benchmarks", response_model=List[analytics_schemas.ComparativeBenchmarkInDB])
async def list_benchmarks(
    metric_name: Optional[str] = Query(None, description="Filter by metric name, e.g., task_completion_time_hours"),
    category: Optional[str] = Query(None),
    industry_segment: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    company_size: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant), # User's tenant for filtering
    db: Session = Depends(get_db)
):
    """List comparative benchmarks. Filters by user's tenant and allows further filtering."""
    analytics_service = get_analytics_service_instance(db)
    # benchmarks = analytics_service.get_benchmarks(
    #     metric_name=metric_name,
    #     tenant_id=tenant_id, # Pass user's tenant to get global + their tenant's benchmarks
    #     category=category,
    #     industry_segment=industry_segment,
    #     region=region,
    #     company_size=company_size
    # )
    # # Apply pagination after fetching, or implement in service for DB-level pagination
    # return benchmarks[skip : skip + limit]

    # Mock response:
    mock_benchmarks_list = [
        analytics_schemas.ComparativeBenchmarkInDB(
            id=1, benchmark_uuid=str(uuid.uuid4()), name="Industry Avg Task Time", metric_name=metric_name or "task_completion_time",
            category=category or "efficiency", benchmark_value=5.5, unit="hours", tenant_id=None, # Global
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        analytics_schemas.ComparativeBenchmarkInDB(
            id=2, benchmark_uuid=str(uuid.uuid4()), name="Sales Team Quota Attainment (SaaS)", metric_name=metric_name or "quota_attainment_rate",
            category=category or "sales_performance", industry_segment=industry_segment or "SaaS",
            benchmark_value=0.85, unit="ratio", tenant_id=tenant_id, # Tenant specific
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        )
    ]
    # Simple mock filtering:
    if metric_name:
        mock_benchmarks_list = [b for b in mock_benchmarks_list if b.metric_name == metric_name]
    # ... add other filters for mock if needed ...
    return mock_benchmarks_list[skip : skip + limit]

@router.get("/benchmarks/{benchmark_id}", response_model=analytics_schemas.ComparativeBenchmarkInDB)
async def get_benchmark(
    benchmark_id: int,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant), # User's tenant
    db: Session = Depends(get_db)
):
    """Get a specific comparative benchmark by ID."""
    analytics_service = get_analytics_service_instance(db)
    # benchmark = analytics_service.get_benchmark_by_id(benchmark_id=benchmark_id, tenant_id=tenant_id)
    # if not benchmark:
    #     raise HTTPException(status_code=404, detail="Benchmark not found or not accessible")
    # return benchmark
    
    # Mock response:
    mock_benchmark = analytics_schemas.ComparativeBenchmarkInDB(
        id=benchmark_id, benchmark_uuid=str(uuid.uuid4()), name=f"Benchmark {benchmark_id}",
        metric_name="some_metric", category="some_category", benchmark_value=100.0,
        tenant_id=None if benchmark_id % 2 == 0 else tenant_id, # Mix global and tenant-specific for mock
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    if mock_benchmark.tenant_id is not None and mock_benchmark.tenant_id != tenant_id:
         # Simulate tenant access check for mock, service layer would do this properly
        raise HTTPException(status_code=404, detail="Benchmark not found or not accessible by this tenant")
    return mock_benchmark

@router.put("/benchmarks/{benchmark_id}", response_model=analytics_schemas.ComparativeBenchmarkInDB)
async def update_benchmark_details( # Renamed from update_benchmark to avoid conflict if any
    benchmark_id: int,
    benchmark_update_data: analytics_schemas.ComparativeBenchmarkUpdate,
    current_user=Depends(get_current_user),
    requesting_tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Update an existing comparative benchmark."""
    analytics_service = get_analytics_service_instance(db)
    # updated_benchmark = analytics_service.update_benchmark(
    #     benchmark_id=benchmark_id,
    #     benchmark_update_data=benchmark_update_data,
    #     requesting_tenant_id=requesting_tenant_id,
    #     updated_by_user_id=current_user.id
    # )
    # if not updated_benchmark:
    #     raise HTTPException(status_code=404, detail="Benchmark not found or update failed (check permissions for global benchmarks)")
    # return updated_benchmark

    # Mock response:
    # First, get a mock existing benchmark to "update"
    mock_existing_benchmark_data = {
        "id": benchmark_id, "benchmark_uuid": str(uuid.uuid4()), "name": f"Old Benchmark Name {benchmark_id}",
        "metric_name": "old_metric", "category": "old_category", "benchmark_value": 50.0,
        "tenant_id": requesting_tenant_id, # Assume it's tenant specific for successful mock update
        "created_at": datetime.utcnow() - timedelta(days=1), "updated_at": datetime.utcnow() - timedelta(days=1),
        "created_by_user_id": current_user.id, "is_active": True
    }
    # Apply updates from benchmark_update_data
    update_payload_dict = benchmark_update_data.dict(exclude_unset=True)
    for key, value in update_payload_dict.items():
        if key in mock_existing_benchmark_data: # Only update existing keys for this simple mock
            mock_existing_benchmark_data[key] = value
    mock_existing_benchmark_data["updated_at"] = datetime.utcnow()

    updated_mock_benchmark = analytics_schemas.ComparativeBenchmarkInDB(**mock_existing_benchmark_data)
    return updated_mock_benchmark


@router.delete("/benchmarks/{benchmark_id}", status_code=204)
async def delete_benchmark_record( # Renamed from delete_benchmark
    benchmark_id: int,
    current_user=Depends(get_current_user),
    requesting_tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Delete a comparative benchmark."""
    analytics_service = get_analytics_service_instance(db)
    # success = analytics_service.delete_benchmark(
    #     benchmark_id=benchmark_id,
    #     requesting_tenant_id=requesting_tenant_id
    # )
    # if not success:
    #     raise HTTPException(status_code=404, detail="Benchmark not found or delete failed (check permissions for global benchmarks)")
    # return # No content for 204

    # Mock: Assume success if benchmark_id is odd (simulating it's a tenant-specific one)
    if benchmark_id % 2 != 0:
        logging.info(f"Mock deleting benchmark {benchmark_id} for tenant {requesting_tenant_id}")
        return
    else:
        # Simulate not found or permission issue for global (even IDs in mock)
        raise HTTPException(status_code=404, detail="Mock: Benchmark not found or delete failed")

@router.post("/performance_metrics/{metric_id}/compare_benchmarks", response_model=List[analytics_schemas.BenchmarkComparisonResult])
async def compare_metric_to_benchmarks(
    metric_id: int,
    comparison_input: Optional[analytics_schemas.BenchmarkComparisonInputOptional] = None, # Allow empty body for default comparison
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Compare a specific performance metric against relevant benchmarks."""
    analytics_service = get_analytics_service_instance(db)

    benchmark_params = comparison_input.benchmark_filter_params if comparison_input and comparison_input.benchmark_filter_params else {}

    # results = analytics_service.compare_performance_metric_with_benchmarks(
    #     performance_metric_id=metric_id,
    #     tenant_id=tenant_id,
    #     benchmark_params=benchmark_params
    # )
    # if not results: # Could be no metric, or no matching benchmarks
    #     # Check if metric exists first to give a better error
    #     metric_check = db.query(PerformanceMetric).filter(PerformanceMetric.id == metric_id, PerformanceMetric.tenant_id == tenant_id).first()
    #     if not metric_check:
    #          raise HTTPException(status_code=404, detail=f"PerformanceMetric with id {metric_id} not found for tenant {tenant_id}")
    #     # If metric exists but no benchmarks found, return empty list or specific message
    # return results

    # Mock response:
    # Simulate fetching the performance metric first
    mock_metric = analytics_schemas.PerformanceMetricInDB(
        id=metric_id, metric_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
        metric_name="user_productivity_score", display_name="User Productivity Score",
        metric_type="productivity", category="user", entity_type="user", entity_id=101,
        dimensions_values={"department": "Sales", "region": "NA"}, measurement_unit="%",
        current_value=85.5, period_start=datetime.utcnow(), period_end=datetime.utcnow(), period_type="weekly",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )

    mock_comparison_results = [
        analytics_schemas.BenchmarkComparisonResult(
            performance_metric_name=mock_metric.metric_name,
            performance_metric_value=mock_metric.current_value,
            performance_metric_unit=mock_metric.measurement_unit,
            benchmark_name="Industry Average Productivity (Sales, NA)",
            benchmark_value=80.0,
            benchmark_unit="%",
            benchmark_value_type="average",
            difference=mock_metric.current_value - 80.0,
            comparison_unit="%"
        ),
        analytics_schemas.BenchmarkComparisonResult(
            performance_metric_name=mock_metric.metric_name,
            performance_metric_value=mock_metric.current_value,
            performance_metric_unit=mock_metric.measurement_unit,
            benchmark_name="Global Top Quartile Productivity",
            benchmark_value=90.0,
            benchmark_unit="%",
            benchmark_value_type="percentile_75",
            difference=mock_metric.current_value - 90.0,
            comparison_unit="%"
        )
    ]
    # Filter mock results based on benchmark_params if any were provided (simplified mock filtering)
    if benchmark_params and benchmark_params.get("industry_segment") == "SaaS":
        return [mock_comparison_results[0]] # Just return one for this specific mock filter

    return mock_comparison_results


@router.post("/roi", response_model=analytics_schemas.ROICalculationInDB, status_code=201)
async def create_roi_calculation(
    roi_data: analytics_schemas.ROICalculationCreate,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new ROI calculation."""
    analytics_service = get_analytics_service_instance(db)
    # new_roi_calc = analytics_service.create_roi_calculation(
    #     tenant_id=tenant_id,
    #     roi_data=roi_data.dict(),
    #     calculated_by_user_id=current_user.id
    # )
    # return new_roi_calc

    # Mock response:
    # Simulate the calculation that happens in the service
    from decimal import Decimal
    mock_total_investment = (
        roi_data.initial_investment + roi_data.operational_costs + roi_data.labor_costs +
        roi_data.technology_costs + roi_data.training_costs + roi_data.other_costs
    )
    mock_total_benefits = (
        roi_data.revenue_increase + roi_data.cost_savings + roi_data.productivity_gains +
        roi_data.efficiency_gains + roi_data.quality_improvements + roi_data.risk_reduction +
        roi_data.other_benefits
    )
    mock_roi_percentage = 0.0
    if mock_total_investment > 0:
        mock_roi_percentage = float((mock_total_benefits - mock_total_investment) / mock_total_investment * 100)

    mock_db_roi = analytics_schemas.ROICalculationInDB(
        id=1, calculation_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
        calculated_by_user_id=current_user.id,
        created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
        period_days=(roi_data.period_end - roi_data.period_start).days,
        total_investment=mock_total_investment,
        total_benefits=mock_total_benefits,
        roi_percentage=mock_roi_percentage,
        # NPV, payback etc. would also be calculated by the model's method
        **roi_data.dict()
    )
    return mock_db_roi


@router.get("/roi", response_model=List[analytics_schemas.ROICalculationInDB])
async def get_roi_calculations(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get ROI calculations for tenant"""
    
    # Mock ROI calculations
    roi_calculations = [
        {
            "id": 1,
            "calculation_uuid": "roi-123e4567-e89b-12d3-a456-426614174000",
            "entity_type": "project",
            "entity_id": 101,
            "calculation_name": "CRM Implementation ROI",
            "total_investment": 50000,
            "total_benefits": 75000,
            "roi_percentage": 50.0,
            "roi_category": "excellent",
            "created_at": "2025-05-15T10:00:00Z"
        },
        {
            "id": 2,
            "calculation_uuid": "roi-456e7890-e89b-12d3-a456-426614174001",
            "entity_type": "project",
            "entity_id": 102,
            "calculation_name": "Training Program ROI",
            "total_investment": 25000,
            "total_benefits": 35000,
            "roi_percentage": 40.0,
            "roi_category": "good",
            "created_at": "2025-05-20T14:30:00Z"
        }
    ]
    
    # Apply filters
    if entity_type:
        roi_calculations = [r for r in roi_calculations if r["entity_type"] == entity_type]
    
    if entity_id:
        roi_calculations = [r for r in roi_calculations if r["entity_id"] == entity_id]
    
    # Apply pagination
    total = len(roi_calculations)
    roi_calculations = roi_calculations[skip:skip + limit]
    
    return {
        "success": True,
        "roi_calculations": roi_calculations,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/models/{model_id}/multi_dimensional_summary", response_model=dict)
async def get_multi_dimensional_summary(
    model_id: int,
    data_payload: analytics_schemas.MultiDimensionalDataPayload, # Schema for input data
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant), # Ensure tenant context
    db: Session = Depends(get_db)
):
    """
    Calculates and aggregates multi-dimensional metrics based on a model's configuration
    using the provided data.
    """
    analytics_service = get_analytics_service_instance(db)
    try:
        # This is where you'd call the actual service method.
        # For now, we'll mock the response based on what the service might return.
        # results = analytics_service.calculate_multi_dimensional_metrics(
        #     model_id=model_id,
        #     data_records=data_payload.records
        # )
        # To make the mock more dynamic, let's use the model_id to vary the response slightly.
        mock_results = []
        if model_id == 1: # Example, model 1 has specific dimensions/metrics
            mock_results = [
                {"dimensions": {"country": "USA", "department": "Sales"}, "metrics": {"revenue": 10000, "conversion_rate": 0.05}},
                {"dimensions": {"country": "USA", "department": "Marketing"}, "metrics": {"lead_count": 500, "cost_per_lead": 10}},
                {"dimensions": {"country": "CAN", "department": "Sales"}, "metrics": {"revenue": 8000, "conversion_rate": 0.04}},
            ]
        elif model_id == 3: # From a previous example, multi_dim_sales_forecaster
             mock_results = [
                {"dimensions": {"region": "NA", "product_line": "X"}, "metrics": {"sales_forecast": 1200.50, "units_forecasted": 120}},
                {"dimensions": {"region": "EMEA", "product_line": "X"}, "metrics": {"sales_forecast": 950.75, "units_forecasted": 95}}
             ]
        else:
            mock_results = [
                {"dimensions": {"generic_dim": "A"}, "metrics": {"generic_metric": 100}},
                {"dimensions": {"generic_dim": "B"}, "metrics": {"generic_metric": 150}},
            ]

        return {
            "success": True,
            "model_id": model_id,
            "summary_results": mock_results,
            "record_count_processed": len(data_payload.records)
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error calculating multi-dimensional summary for model {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate multi-dimensional summary.")


@router.post("/metrics", response_model=dict)
async def record_performance_metric(
    metric_data: dict,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Record a performance metric"""
    analytics_service = get_analytics_service_instance(db)
    
    # This would be the actual service call:
    # new_metric = analytics_service.record_performance_metric(
    #     tenant_id=tenant_id,
    #     metric_data=metric_data.dict(), # Convert Pydantic model to dict
    #     measured_by_user_id=current_user.id
    # )
    # return {"success": True, "message": "Performance metric recorded successfully", "metric": new_metric}

    # Mock response reflecting the schema:
    mock_metric_db = analytics_schemas.PerformanceMetricInDB(
        id=123, # Example ID
        metric_uuid=str(uuid.uuid4()),
        tenant_id=tenant_id,
        measured_by_user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        trend_direction="stable",
        alert_status="normal",
        # Spread the data from the input schema
        **metric_data.dict()
    )
    # Calculate trend for the mock response as the model would
    # This is a bit of a hack for mock, ideally the model's method is tested elsewhere
    if mock_metric_db.previous_value is not None and mock_metric_db.previous_value != 0:
        change = mock_metric_db.current_value - mock_metric_db.previous_value
        trend_percentage = (change / mock_metric_db.previous_value) * 100
        mock_metric_db.trend_percentage = trend_percentage
        if abs(trend_percentage) < 1: mock_metric_db.trend_direction = "stable"
        elif trend_percentage > 0: mock_metric_db.trend_direction = "increasing"
        else: mock_metric_db.trend_direction = "decreasing"

    return {
        "success": True,
        "message": "Performance metric recorded successfully (mocked)",
        "metric": mock_metric_db.dict()
    }

@router.get("/metrics", response_model=dict) # Added response_model for consistency
async def get_performance_metrics(
    request: Request, # To access raw query parameters for dimensions
    metric_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics for tenant.
    Allows filtering by standard fields and dynamic dimension_key=value query parameters.
    Example: /metrics?metric_type=productivity&dimension_department=Sales&dimension_region=NA
    """
    analytics_service = get_analytics_service_instance(db)

    dimension_filters = {}
    for key, value in request.query_params.items():
        if key.startswith("dimension_"):
            dimension_name = key.replace("dimension_", "", 1)
            dimension_filters[dimension_name] = value

    # Actual service call (currently mocked below)
    # metrics_from_db = analytics_service.get_performance_metrics(
    #     tenant_id=tenant_id,
    #     metric_type=metric_type,
    #     category=category,
    #     entity_type=entity_type,
    #     entity_id=entity_id,
    #     limit=limit,
    #     dimension_filters=dimension_filters # Pass collected filters
    # )
    # total_count = len(metrics_from_db) # This would need a separate count query for proper pagination in real app
    # paginated_metrics = metrics_from_db[skip : skip + limit] # Simplistic pagination for now

    # Mock data for demonstration:
    all_metrics_mock = [
        analytics_schemas.PerformanceMetricInDB(
            id=1, metric_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
            metric_name="user_productivity_score", display_name="User Productivity Score",
            metric_type="productivity", category="user", entity_type="user", entity_id=101,
            dimensions_values={"department": "Sales", "region": "NA", "experience_level": "Senior"},
            measurement_unit="%", calculation_method="average",
            current_value=85.5, previous_value=82.0, baseline_value=75.0, target_value=80.0,
            trend_direction="increasing", trend_percentage=4.27, trend_significance="minor",
            period_start=datetime(2025, 5, 1), period_end=datetime(2025, 5, 7), period_type="weekly",
            alert_status="normal", created_at=datetime.utcnow(), updated_at=datetime.utcnow(), measured_by_user_id=current_user.id
        ),
        analytics_schemas.PerformanceMetricInDB(
            id=2, metric_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
            metric_name="project_completion_rate", display_name="Project Completion Rate",
            metric_type="efficiency", category="project", entity_type="project", entity_id=201,
            dimensions_values={"project_type": "Internal", "priority": "High"},
            measurement_unit="%", calculation_method="percentage",
            current_value=92.0, previous_value=90.0, baseline_value=85.0, target_value=90.0,
            trend_direction="increasing", trend_percentage=2.22, trend_significance="minor",
            period_start=datetime(2025, 4, 1), period_end=datetime(2025, 4, 30), period_type="monthly",
            alert_status="normal", created_at=datetime.utcnow(), updated_at=datetime.utcnow(), measured_by_user_id=current_user.id
        ),
        analytics_schemas.PerformanceMetricInDB(
            id=3, metric_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
            metric_name="user_engagement_score", display_name="User Engagement Score",
            metric_type="engagement", category="user", entity_type="user", entity_id=102,
            dimensions_values={"department": "Marketing", "region": "EMEA"},
            measurement_unit="score", calculation_method="weighted_average",
            current_value=78.0, target_value=85.0,
            period_start=datetime(2025, 5, 1), period_end=datetime(2025, 5, 7), period_type="weekly",
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(), measured_by_user_id=current_user.id
        ),
         analytics_schemas.PerformanceMetricInDB(
            id=4, metric_uuid=str(uuid.uuid4()), tenant_id=tenant_id,
            metric_name="user_productivity_score", display_name="User Productivity Score", # Same name, different entity/dims
            metric_type="productivity", category="user", entity_type="user", entity_id=103, # Different entity_id
            dimensions_values={"department": "Sales", "region": "APAC", "experience_level": "Junior"}, # Different region
            measurement_unit="%", calculation_method="average",
            current_value=72.1, target_value=70.0,
            period_start=datetime(2025, 5, 1), period_end=datetime(2025, 5, 7), period_type="weekly",
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(), measured_by_user_id=current_user.id
        )
    ]

    # Apply standard filters (mocked)
    filtered_metrics = all_metrics_mock
    if metric_type:
        filtered_metrics = [m for m in filtered_metrics if m.metric_type == metric_type]
    if category:
        filtered_metrics = [m for m in filtered_metrics if m.category == category]
    if entity_type:
        filtered_metrics = [m for m in filtered_metrics if m.entity_type == entity_type]
    if entity_id:
        filtered_metrics = [m for m in filtered_metrics if m.entity_id == entity_id]

    # Apply dimension filters (mocked)
    if dimension_filters:
        temp_metrics = []
        for metric in filtered_metrics:
            match = True
            if metric.dimensions_values:
                for dim_key, dim_value in dimension_filters.items():
                    if str(metric.dimensions_values.get(dim_key)) != dim_value:
                        match = False
                        break
            else:
                match = False
            if match:
                temp_metrics.append(metric)
        filtered_metrics = temp_metrics

    total = len(filtered_metrics)
    paginated_metrics = filtered_metrics[skip : skip + limit]
    
    return {
        "success": True,
        "metrics": [metric.dict() for metric in paginated_metrics], # Ensure Pydantic models are dicts for response
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/dashboard", response_model=dict)
async def get_analytics_dashboard(
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard data"""
    
    # Mock dashboard data
    dashboard = {
        "models": {
            "total": 5,
            "active": 4,
            "trained": 3,
            "training_rate": 60.0
        },
        "predictions": {
            "total": 2450,
            "recent": 125,
            "daily_average": 17.9,
            "accuracy_rate": 84.2
        },
        "roi": {
            "total_calculations": 15,
            "average_roi": 42.5,
            "roi_category": "good",
            "positive_roi_count": 13
        },
        "metrics": {
            "total": 450,
            "categories": {
                "productivity": 180,
                "performance": 150,
                "efficiency": 120
            }
        },
        "trends": {
            "model_adoption": "increasing",
            "prediction_accuracy": "improving",
            "roi_performance": "stable"
        },
        "insights": [
            {
                "type": "positive",
                "category": "model_performance",
                "title": "High Model Accuracy",
                "description": "Your analytics models are performing well with an average accuracy of 84.2%",
                "recommendation": "Consider deploying more models to production to leverage this high accuracy."
            },
            {
                "type": "info",
                "category": "prediction_usage",
                "title": "Active Prediction Usage",
                "description": "125 predictions made in the last week",
                "recommendation": "Consider automating frequent predictions to improve efficiency."
            }
        ]
    }
    
    return {
        "success": True,
        "dashboard": dashboard,
        "generated_at": datetime.utcnow().isoformat()
    }

# Background task functions

async def mock_training_process(model_id: int, training_config: dict):
    """Mock background training process"""
    import asyncio
    await asyncio.sleep(3)  # Simulate training time
    logging.info(f"Completed training for model {model_id} with config {training_config}")


def get_analytics_service_instance(db: Session):
    """Get analytics service instance"""
    return get_analytics_service(db)

# Dashboard Configuration Endpoints

DASHBOARD_TAG = "Analytics Dashboards"

@router.post("/dashboards", response_model=analytics_schemas.DashboardInDB, tags=[DASHBOARD_TAG], status_code=201)
async def create_new_dashboard(
    dashboard_data: analytics_schemas.DashboardCreate,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new analytics dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # dashboard = analytics_service.create_dashboard(tenant_id=tenant_id, user_id=current_user.id, dashboard_data=dashboard_data)
    # return dashboard
    # Mock response:
    mock_dashboard = analytics_schemas.DashboardInDB(
        id=1, dashboard_uuid=str(uuid.uuid4()), tenant_id=tenant_id, user_id=current_user.id,
        name=dashboard_data.name, description=dashboard_data.description, tags=dashboard_data.tags,
        layout=[analytics_schemas.LayoutItem(widget_config_id=idx+1, x=0,y=idx*2,w=4,h=2) for idx in range(len(dashboard_data.widgets or []))],
        widgets=[
            analytics_schemas.WidgetConfigInDB(
                id=idx+1, widget_uuid=str(uuid.uuid4()), dashboard_id=1, tenant_id=tenant_id,
                created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
                **w.dict()
            ) for idx, w in enumerate(dashboard_data.widgets or [])
        ],
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    return mock_dashboard

@router.get("/dashboards", response_model=List[analytics_schemas.DashboardInDB], tags=[DASHBOARD_TAG])
async def list_user_dashboards(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """List dashboards for the current user."""
    analytics_service = get_analytics_service_instance(db)
    # dashboards = analytics_service.get_dashboards_by_user(tenant_id=tenant_id, user_id=current_user.id, skip=skip, limit=limit)
    # return dashboards
    # Mock response:
    return [
        analytics_schemas.DashboardInDB(
            id=i, dashboard_uuid=str(uuid.uuid4()), tenant_id=tenant_id, user_id=current_user.id,
            name=f"Dashboard {i}", layout=[], widgets=[], created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ) for i in range(1, 3)
    ]

@router.get("/dashboards/{dashboard_id}", response_model=analytics_schemas.DashboardInDB, tags=[DASHBOARD_TAG])
async def get_dashboard_details(
    dashboard_id: int,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get a specific dashboard by ID."""
    analytics_service = get_analytics_service_instance(db)
    # dashboard = analytics_service.get_dashboard(dashboard_id=dashboard_id, tenant_id=tenant_id, user_id=current_user.id)
    # if not dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found")
    # return dashboard
    # Mock response:
    mock_widget1 = analytics_schemas.WidgetConfigInDB(id=1, widget_uuid=str(uuid.uuid4()), dashboard_id=dashboard_id, tenant_id=tenant_id, widget_type="kpi_card", title="Total Sales", data_source_config={"type":"metric", "params": {"name": "sales"}}, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    mock_layout1 = analytics_schemas.LayoutItem(widget_config_id=1, x=0,y=0,w=2,h=1)
    return analytics_schemas.DashboardInDB(
        id=dashboard_id, dashboard_uuid=str(uuid.uuid4()), tenant_id=tenant_id, user_id=current_user.id,
        name=f"Specific Dashboard {dashboard_id}", layout=[mock_layout1], widgets=[mock_widget1], created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )


@router.put("/dashboards/{dashboard_id}", response_model=analytics_schemas.DashboardInDB, tags=[DASHBOARD_TAG])
async def update_dashboard_details(
    dashboard_id: int,
    dashboard_update: analytics_schemas.DashboardUpdate,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Update dashboard properties (name, description, tags, layout)."""
    analytics_service = get_analytics_service_instance(db)
    # updated_dashboard = analytics_service.update_dashboard(dashboard_id=dashboard_id, tenant_id=tenant_id, user_id=current_user.id, dashboard_update_data=dashboard_update)
    # if not updated_dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found or update failed")
    # return updated_dashboard
    # Mock response:
    # Get a mock existing dashboard and apply updates
    mock_existing_dashboard = analytics_schemas.DashboardInDB(
        id=dashboard_id, dashboard_uuid=str(uuid.uuid4()), tenant_id=tenant_id, user_id=current_user.id,
        name=f"Old Dashboard Name {dashboard_id}", layout=[], widgets=[], created_at=datetime.utcnow()-timedelta(days=1), updated_at=datetime.utcnow()-timedelta(days=1)
    )
    update_data = dashboard_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(mock_existing_dashboard, key, value)
    mock_existing_dashboard.updated_at = datetime.utcnow()
    return mock_existing_dashboard


@router.put("/dashboards/{dashboard_id}/layout", response_model=analytics_schemas.DashboardInDB, tags=[DASHBOARD_TAG])
async def update_single_dashboard_layout( # Renamed to avoid conflict
    dashboard_id: int,
    layout_data: List[analytics_schemas.LayoutItem],
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Update the layout of widgets on a dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # dashboard = analytics_service.update_dashboard_layout(dashboard_id, tenant_id, current_user.id, layout_data)
    # if not dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found or layout update failed")
    # return dashboard
    # Mock:
    mock_dashboard = analytics_schemas.DashboardInDB(
        id=dashboard_id, dashboard_uuid=str(uuid.uuid4()), tenant_id=tenant_id, user_id=current_user.id,
        name=f"Dashboard with Layout {dashboard_id}", layout=layout_data, widgets=[], # Assume widgets exist and are referenced by layout_data
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    return mock_dashboard


@router.delete("/dashboards/{dashboard_id}", tags=[DASHBOARD_TAG], status_code=204)
async def delete_single_dashboard( # Renamed
    dashboard_id: int,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Delete a dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # success = analytics_service.delete_dashboard(dashboard_id, tenant_id, current_user.id)
    # if not success:
    #     raise HTTPException(status_code=404, detail="Dashboard not found or delete failed")
    # Mock:
    if dashboard_id <=0: raise HTTPException(status_code=404, detail="Mock dashboard not found")
    return # No content

@router.post("/dashboards/{dashboard_id}/widgets", response_model=analytics_schemas.WidgetConfigInDB, tags=[DASHBOARD_TAG], status_code=201)
async def add_widget_to_a_dashboard( # Renamed
    dashboard_id: int,
    widget_data: analytics_schemas.WidgetConfigCreate,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Add a new widget to a dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # widget = analytics_service.add_widget_to_dashboard(dashboard_id, tenant_id, current_user.id, widget_data)
    # if not widget:
    #     raise HTTPException(status_code=404, detail="Dashboard not found or failed to add widget")
    # return widget
    # Mock:
    return analytics_schemas.WidgetConfigInDB(
        id=99, widget_uuid=str(uuid.uuid4()), dashboard_id=dashboard_id, tenant_id=tenant_id,
        created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
        **widget_data.dict()
    )

@router.put("/dashboards/{dashboard_id}/widgets/{widget_id}", response_model=analytics_schemas.WidgetConfigInDB, tags=[DASHBOARD_TAG])
async def update_widget_on_a_dashboard( # Renamed
    dashboard_id: int, # Used for context, ownership check via service
    widget_id: int,
    widget_update_data: analytics_schemas.WidgetConfigUpdate,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Update an existing widget on a dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # Ensure dashboard_id from path matches widget's actual dashboard_id as an extra check if needed,
    # though service method `update_widget_on_dashboard` should handle ownership via user_id & widget_id's dashboard.
    # widget = analytics_service.update_widget_on_dashboard(widget_id, tenant_id, current_user.id, widget_update_data)
    # if not widget:
    #     raise HTTPException(status_code=404, detail="Widget not found or update failed")
    # return widget
    # Mock:
    mock_widget_data = widget_update_data.dict(exclude_unset=True)
    base_widget_data = {
        "id":widget_id, "widget_uuid":str(uuid.uuid4()), "dashboard_id":dashboard_id, "tenant_id":tenant_id,
        "widget_type": mock_widget_data.get("widget_type", "kpi_card"), # Get from update or default
        "title": mock_widget_data.get("title", f"Updated Widget {widget_id}"),
        "data_source_config": mock_widget_data.get("data_source_config", {"type":"metric", "params":{"name":"default"}}),
        "display_options": mock_widget_data.get("display_options", {}),
        "created_at":datetime.utcnow()-timedelta(hours=1), "updated_at":datetime.utcnow()
    }
    return analytics_schemas.WidgetConfigInDB(**base_widget_data)


@router.delete("/dashboards/{dashboard_id}/widgets/{widget_id}", tags=[DASHBOARD_TAG], status_code=204)
async def remove_widget_from_a_dashboard( # Renamed
    dashboard_id: int, # For context
    widget_id: int,
    current_user=Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Remove a widget from a dashboard."""
    analytics_service = get_analytics_service_instance(db)
    # success = analytics_service.remove_widget_from_dashboard(widget_id, tenant_id, current_user.id)
    # if not success:
    #     raise HTTPException(status_code=404, detail="Widget not found or delete failed")
    # Mock:
    if widget_id <=0: raise HTTPException(status_code=404, detail="Mock widget not found")
    return # No content
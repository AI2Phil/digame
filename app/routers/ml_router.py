"""
AI/ML Router for Model Management, Training, and Prediction APIs
Comprehensive machine learning lifecycle management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.auth.auth_dependencies import get_current_user, MockDBUser
from app.models.ml_models import (
    MLModel, TrainingJob, ModelPrediction, ModelEvaluation,
    ModelDeployment, DatasetMetadata, ExperimentRun,
    ModelType, ModelStatus, TrainingStatus
)
from app.services.ml_service import (
    MLModelService, TrainingService, PredictionService, MLAnalyticsService
)

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

# Pydantic Models for Request/Response

class ModelCreateRequest(BaseModel):
    name: str = Field(..., description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: str = Field(..., description="Model type (classification, regression, time_series, clustering)")
    algorithm: str = Field(..., description="Algorithm used")
    version: Optional[str] = Field("1.0.0", description="Model version")
    hyperparameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model hyperparameters")
    feature_columns: Optional[List[str]] = Field(default_factory=list, description="Feature column names")
    target_column: Optional[str] = Field(None, description="Target column name")

class ModelUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    algorithm: Optional[str] = None
    version: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    feature_columns: Optional[List[str]] = None
    target_column: Optional[str] = None

class ModelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    model_type: str
    algorithm: str
    version: str
    status: str
    accuracy_score: Optional[float]
    precision_score: Optional[float]
    recall_score: Optional[float]
    f1_score: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    last_trained_at: Optional[datetime]

    class Config:
        from_attributes = True

class TrainingJobCreateRequest(BaseModel):
    model_id: int = Field(..., description="Model ID to train")
    job_name: str = Field(..., description="Training job name")
    training_config: Dict[str, Any] = Field(..., description="Training configuration")
    dataset_path: Optional[str] = Field(None, description="Path to training dataset")
    dataset_size: Optional[int] = Field(None, description="Size of training dataset")

class TrainingJobResponse(BaseModel):
    id: int
    model_id: int
    job_name: str
    status: str
    progress_percentage: Optional[float]
    current_epoch: Optional[int]
    total_epochs: Optional[int]
    training_loss: Optional[float]
    validation_loss: Optional[float]
    training_accuracy: Optional[float]
    validation_accuracy: Optional[float]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    model_id: int = Field(..., description="Model ID for prediction")
    input_data: Dict[str, Any] = Field(..., description="Input data for prediction")

class PredictionResponse(BaseModel):
    id: int
    prediction_id: str
    model_id: int
    predicted_value: Any
    confidence_score: Optional[float]
    model_version: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionFeedbackRequest(BaseModel):
    actual_value: Any = Field(..., description="Actual value for feedback")
    feedback_score: Optional[float] = Field(None, description="Feedback score (0-1)")

class TrainingProgressUpdate(BaseModel):
    current_epoch: Optional[int] = None
    progress_percentage: Optional[float] = None
    training_loss: Optional[float] = None
    validation_loss: Optional[float] = None
    training_accuracy: Optional[float] = None
    validation_accuracy: Optional[float] = None

class TrainingCompletionData(BaseModel):
    final_accuracy: Optional[float] = None
    final_loss: Optional[float] = None
    model_metrics: Optional[Dict[str, float]] = None

# Model Management Endpoints

@router.post("/models", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_data: ModelCreateRequest,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Create a new ML model"""
    service = MLModelService(db)
    model = service.create_model(model_data.dict(), current_user.id)
    return model

@router.get("/models", response_model=List[ModelResponse])
async def list_models(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """List user's ML models"""
    service = MLModelService(db)
    models = service.list_models(current_user.id, skip, limit)
    return models

@router.get("/models/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get a specific ML model"""
    service = MLModelService(db)
    model = service.get_model(model_id, current_user.id)
    return model

@router.put("/models/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: int,
    model_data: ModelUpdateRequest,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Update an ML model"""
    service = MLModelService(db)
    # Filter out None values
    update_data = {k: v for k, v in model_data.dict().items() if v is not None}
    model = service.update_model(model_id, update_data, current_user.id)
    return model

@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Delete an ML model"""
    service = MLModelService(db)
    service.delete_model(model_id, current_user.id)

@router.get("/models/{model_id}/metrics")
async def get_model_metrics(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get comprehensive model metrics and statistics"""
    service = MLModelService(db)
    metrics = service.get_model_metrics(model_id, current_user.id)
    return metrics

# Training Management Endpoints

@router.post("/training-jobs", response_model=TrainingJobResponse, status_code=status.HTTP_201_CREATED)
async def create_training_job(
    job_data: TrainingJobCreateRequest,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Create a new training job"""
    service = TrainingService(db)
    job = service.create_training_job(job_data.dict(), current_user.id)
    return job

@router.get("/training-jobs", response_model=List[TrainingJobResponse])
async def list_training_jobs(
    model_id: Optional[int] = Query(None, description="Filter by model ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """List training jobs"""
    service = TrainingService(db)
    jobs = service.list_training_jobs(current_user.id, model_id, skip, limit)
    return jobs

@router.get("/training-jobs/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get a specific training job"""
    service = TrainingService(db)
    job = service.get_training_job(job_id, current_user.id)
    return job

@router.post("/training-jobs/{job_id}/start", response_model=TrainingJobResponse)
async def start_training_job(
    job_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Start a training job"""
    service = TrainingService(db)
    job = service.start_training_job(job_id, current_user.id)
    
    # In a real implementation, you would add a background task here
    # background_tasks.add_task(run_training_job, job_id)
    
    return job

@router.put("/training-jobs/{job_id}/progress", response_model=TrainingJobResponse)
async def update_training_progress(
    job_id: int,
    progress_data: TrainingProgressUpdate,
    db: Session = Depends(get_db)
):
    """Update training job progress (typically called by training process)"""
    service = TrainingService(db)
    # Filter out None values
    update_data = {k: v for k, v in progress_data.dict().items() if v is not None}
    job = service.update_training_progress(job_id, update_data)
    return job

@router.post("/training-jobs/{job_id}/complete", response_model=TrainingJobResponse)
async def complete_training_job(
    job_id: int,
    completion_data: TrainingCompletionData,
    db: Session = Depends(get_db)
):
    """Complete a training job (typically called by training process)"""
    service = TrainingService(db)
    job = service.complete_training_job(job_id, completion_data.dict())
    return job

# Prediction Endpoints

@router.post("/predictions", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def make_prediction(
    prediction_data: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Make a prediction using a trained model"""
    service = PredictionService(db)
    prediction = service.make_prediction(prediction_data.dict(), current_user.id)
    return prediction

@router.get("/predictions", response_model=List[PredictionResponse])
async def list_predictions(
    model_id: Optional[int] = Query(None, description="Filter by model ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """List predictions"""
    service = PredictionService(db)
    predictions = service.list_predictions(current_user.id, model_id, skip, limit)
    return predictions

@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get a specific prediction"""
    service = PredictionService(db)
    prediction = service.get_prediction(prediction_id, current_user.id)
    return prediction

@router.put("/predictions/{prediction_id}/feedback", response_model=PredictionResponse)
async def update_prediction_feedback(
    prediction_id: str,
    feedback_data: PredictionFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Update prediction with actual results and feedback"""
    service = PredictionService(db)
    prediction = service.update_prediction_feedback(
        prediction_id, feedback_data.dict(), current_user.id
    )
    return prediction

# Analytics and Insights Endpoints

@router.get("/analytics/overview")
async def get_ml_overview(
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get comprehensive ML overview and statistics"""
    service = MLAnalyticsService(db)
    overview = service.get_user_ml_overview(current_user.id)
    return overview

@router.get("/analytics/models/{model_id}/performance-trends")
async def get_model_performance_trends(
    model_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get model performance trends over time"""
    service = MLAnalyticsService(db)
    trends = service.get_model_performance_trends(model_id, current_user.id, days)
    return trends

# Model Deployment Endpoints

@router.post("/models/{model_id}/deploy")
async def deploy_model(
    model_id: int,
    deployment_config: Dict[str, Any] = {},
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Deploy a trained model"""
    # Verify model exists and is trained
    model_service = MLModelService(db)
    model = model_service.get_model(model_id, current_user.id)
    
    if model.status != ModelStatus.TRAINED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model must be trained before deployment. Current status: {model.status}"
        )
    
    try:
        # Create deployment record
        deployment = ModelDeployment(
            model_id=model_id,
            deployment_name=deployment_config.get("name", f"{model.name}_deployment"),
            environment=deployment_config.get("environment", "production"),
            endpoint_url=deployment_config.get("endpoint_url"),
            deployment_config=deployment_config,
            is_active=True,
            created_by=current_user.id
        )
        
        db.add(deployment)
        
        # Update model status
        model.status = ModelStatus.DEPLOYED
        
        db.commit()
        db.refresh(deployment)
        
        return {
            "deployment_id": deployment.id,
            "model_id": model_id,
            "deployment_name": deployment.deployment_name,
            "environment": deployment.environment,
            "endpoint_url": deployment.endpoint_url,
            "status": "deployed",
            "deployed_at": deployment.deployed_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deploy model: {str(e)}"
        )

@router.get("/models/{model_id}/deployments")
async def list_model_deployments(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """List deployments for a specific model"""
    # Verify model exists
    model_service = MLModelService(db)
    model_service.get_model(model_id, current_user.id)
    
    deployments = db.query(ModelDeployment).filter(
        ModelDeployment.model_id == model_id
    ).all()
    
    return [
        {
            "id": d.id,
            "deployment_name": d.deployment_name,
            "environment": d.environment,
            "endpoint_url": d.endpoint_url,
            "is_active": d.is_active,
            "created_at": d.created_at.isoformat(),
            "updated_at": d.updated_at.isoformat() if d.updated_at else None
        } for d in deployments
    ]

@router.delete("/deployments/{deployment_id}")
async def undeploy_model(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Undeploy a model"""
    deployment = db.query(ModelDeployment).filter(
        ModelDeployment.id == deployment_id
    ).first()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    # Verify user owns the model
    model_service = MLModelService(db)
    model_service.get_model(deployment.model_id, current_user.id)
    
    try:
        deployment.is_active = False
        deployment.updated_at = datetime.utcnow()
        
        # If this was the only active deployment, update model status
        active_deployments = db.query(ModelDeployment).filter(
            ModelDeployment.model_id == deployment.model_id,
            ModelDeployment.is_active == True,
            ModelDeployment.id != deployment_id
        ).count()
        
        if active_deployments == 0:
            model = db.query(MLModel).filter(MLModel.id == deployment.model_id).first()
            if model:
                model.status = ModelStatus.TRAINED
        
        db.commit()
        
        return {"message": "Model undeployed successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to undeploy model: {str(e)}"
        )

# Health Check and Status Endpoints

@router.get("/health")
async def health_check():
    """Health check for ML service"""
    return {
        "status": "healthy",
        "service": "ml-api",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/status")
async def get_ml_service_status(
    db: Session = Depends(get_db),
    current_user: MockDBUser = Depends(get_current_user)
):
    """Get ML service status and statistics"""
    # Get basic counts
    total_models = db.query(MLModel).filter(MLModel.created_by == current_user.id).count()
    total_jobs = db.query(TrainingJob).filter(TrainingJob.created_by == current_user.id).count()
    total_predictions = db.query(ModelPrediction).filter(ModelPrediction.created_by == current_user.id).count()
    
    # Get running jobs
    running_jobs = db.query(TrainingJob).filter(
        TrainingJob.created_by == current_user.id,
        TrainingJob.status == TrainingStatus.RUNNING
    ).count()
    
    return {
        "service_status": "operational",
        "user_statistics": {
            "total_models": total_models,
            "total_training_jobs": total_jobs,
            "total_predictions": total_predictions,
            "running_training_jobs": running_jobs
        },
        "timestamp": datetime.utcnow().isoformat()
    }
"""
Machine Learning Service for AI/ML API Management
Comprehensive service layer for model management, training, and prediction
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import uuid
import os
import pickle
import joblib
import numpy as np
from fastapi import HTTPException, status

from app.models.ml_models import (
    MLModel, TrainingJob, ModelPrediction, ModelEvaluation, 
    ModelDeployment, DatasetMetadata, ExperimentRun,
    ModelType, ModelStatus, TrainingStatus
)
from app.models.user import User

class MLModelService:
    """Service for ML model management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_model(self, model_data: Dict[str, Any], user_id: int) -> MLModel:
        """Create a new ML model"""
        try:
            model = MLModel(
                name=model_data["name"],
                description=model_data.get("description"),
                model_type=ModelType(model_data["model_type"]),
                algorithm=model_data["algorithm"],
                version=model_data.get("version", "1.0.0"),
                hyperparameters=model_data.get("hyperparameters", {}),
                feature_columns=model_data.get("feature_columns", []),
                target_column=model_data.get("target_column"),
                created_by=user_id
            )
            
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)
            
            return model
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create model: {str(e)}"
            )
    
    def get_model(self, model_id: int, user_id: int) -> MLModel:
        """Get a specific model"""
        model = self.db.query(MLModel).filter(
            and_(MLModel.id == model_id, MLModel.created_by == user_id)
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        return model
    
    def list_models(self, user_id: int, skip: int = 0, limit: int = 100) -> List[MLModel]:
        """List user's models"""
        return self.db.query(MLModel).filter(
            MLModel.created_by == user_id
        ).offset(skip).limit(limit).all()
    
    def update_model(self, model_id: int, model_data: Dict[str, Any], user_id: int) -> MLModel:
        """Update a model"""
        model = self.get_model(model_id, user_id)
        
        for key, value in model_data.items():
            if hasattr(model, key) and key not in ['id', 'created_by', 'created_at']:
                setattr(model, key, value)
        
        model.updated_at = datetime.utcnow()
        
        try:
            self.db.commit()
            self.db.refresh(model)
            return model
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update model: {str(e)}"
            )
    
    def delete_model(self, model_id: int, user_id: int) -> bool:
        """Delete a model"""
        model = self.get_model(model_id, user_id)
        
        try:
            # Clean up model files if they exist
            if model.model_path and os.path.exists(str(model.model_path)):
                os.remove(str(model.model_path))
            
            self.db.delete(model)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete model: {str(e)}"
            )
    
    def get_model_metrics(self, model_id: int, user_id: int) -> Dict[str, Any]:
        """Get comprehensive model metrics"""
        model = self.get_model(model_id, user_id)
        
        # Get training jobs
        training_jobs = self.db.query(TrainingJob).filter(
            TrainingJob.model_id == model_id
        ).order_by(desc(TrainingJob.created_at)).limit(10).all()
        
        # Get recent predictions
        predictions = self.db.query(ModelPrediction).filter(
            ModelPrediction.model_id == model_id
        ).order_by(desc(ModelPrediction.created_at)).limit(100).all()
        
        # Get evaluations
        evaluations = self.db.query(ModelEvaluation).filter(
            ModelEvaluation.model_id == model_id
        ).order_by(desc(ModelEvaluation.evaluated_at)).all()
        
        # Get deployments
        deployments = self.db.query(ModelDeployment).filter(
            ModelDeployment.model_id == model_id
        ).all()
        
        # Calculate metrics
        total_predictions = len(predictions)
        avg_confidence = np.mean([p.confidence_score for p in predictions if p.confidence_score]) if predictions else 0
        
        # Prediction accuracy (where actual values are available)
        accurate_predictions = sum(1 for p in predictions if p.is_correct is True)
        accuracy_rate = accurate_predictions / total_predictions if total_predictions > 0 else 0
        
        return {
            "model_info": {
                "id": model.id,
                "name": model.name,
                "type": model.model_type,
                "algorithm": model.algorithm,
                "status": model.status,
                "version": model.version
            },
            "performance_metrics": {
                "accuracy_score": model.accuracy_score,
                "precision_score": model.precision_score,
                "recall_score": model.recall_score,
                "f1_score": model.f1_score,
                "mse_score": model.mse_score,
                "mae_score": model.mae_score,
                "r2_score": model.r2_score
            },
            "usage_statistics": {
                "total_predictions": total_predictions,
                "avg_confidence": avg_confidence,
                "accuracy_rate": accuracy_rate,
                "total_training_jobs": len(training_jobs),
                "total_evaluations": len(evaluations),
                "active_deployments": len([d for d in deployments if d.is_active])
            },
            "recent_training_jobs": [
                {
                    "id": job.id,
                    "status": job.status,
                    "progress": job.progress_percentage,
                    "started_at": job.started_at.isoformat() if job.started_at else None,
                    "duration": job.duration_seconds
                } for job in training_jobs
            ],
            "recent_evaluations": [
                {
                    "id": eval.id,
                    "name": eval.evaluation_name,
                    "accuracy": eval.accuracy,
                    "evaluated_at": eval.evaluated_at.isoformat()
                } for eval in evaluations
            ]
        }

class TrainingService:
    """Service for model training management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_training_job(self, job_data: Dict[str, Any], user_id: int) -> TrainingJob:
        """Create a new training job"""
        # Verify model exists and user owns it
        model = self.db.query(MLModel).filter(
            and_(MLModel.id == job_data["model_id"], MLModel.created_by == user_id)
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        try:
            job = TrainingJob(
                model_id=job_data["model_id"],
                job_name=job_data["job_name"],
                training_config=job_data["training_config"],
                dataset_path=job_data.get("dataset_path"),
                dataset_size=job_data.get("dataset_size"),
                total_epochs=job_data["training_config"].get("epochs", 10),
                created_by=user_id
            )
            
            self.db.add(job)
            self.db.commit()
            self.db.refresh(job)
            
            return job
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create training job: {str(e)}"
            )
    
    def start_training_job(self, job_id: int, user_id: int) -> TrainingJob:
        """Start a training job"""
        job = self.db.query(TrainingJob).filter(
            and_(TrainingJob.id == job_id, TrainingJob.created_by == user_id)
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        if job.status != TrainingStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Job is not in pending status. Current status: {job.status}"
            )
        
        try:
            job.status = TrainingStatus.RUNNING
            job.started_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(job)
            
            # Here you would typically start the actual training process
            # This could be done asynchronously using Celery or similar
            
            return job
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to start training job: {str(e)}"
            )
    
    def update_training_progress(self, job_id: int, progress_data: Dict[str, Any]) -> TrainingJob:
        """Update training job progress"""
        job = self.db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        try:
            # Update progress fields
            if "current_epoch" in progress_data:
                job.current_epoch = progress_data["current_epoch"]
            if "progress_percentage" in progress_data:
                job.progress_percentage = progress_data["progress_percentage"]
            if "training_loss" in progress_data:
                job.training_loss = progress_data["training_loss"]
            if "validation_loss" in progress_data:
                job.validation_loss = progress_data["validation_loss"]
            if "training_accuracy" in progress_data:
                job.training_accuracy = progress_data["training_accuracy"]
            if "validation_accuracy" in progress_data:
                job.validation_accuracy = progress_data["validation_accuracy"]
            
            job.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(job)
            
            return job
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update training progress: {str(e)}"
            )
    
    def complete_training_job(self, job_id: int, completion_data: Dict[str, Any]) -> TrainingJob:
        """Complete a training job"""
        job = self.db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        try:
            job.status = TrainingStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.duration_seconds = int((job.completed_at - job.started_at).total_seconds()) if job.started_at else None
            
            # Update final metrics
            if "final_accuracy" in completion_data:
                job.training_accuracy = completion_data["final_accuracy"]
            if "final_loss" in completion_data:
                job.training_loss = completion_data["final_loss"]
            
            # Update the associated model
            model = self.db.query(MLModel).filter(MLModel.id == job.model_id).first()
            if model:
                model.status = ModelStatus.TRAINED
                model.last_trained_at = datetime.utcnow()
                
                # Update model performance metrics if provided
                if "model_metrics" in completion_data:
                    metrics = completion_data["model_metrics"]
                    for key, value in metrics.items():
                        if hasattr(model, key):
                            setattr(model, key, value)
            
            self.db.commit()
            self.db.refresh(job)
            
            return job
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to complete training job: {str(e)}"
            )
    
    def get_training_job(self, job_id: int, user_id: int) -> TrainingJob:
        """Get a specific training job"""
        job = self.db.query(TrainingJob).filter(
            and_(TrainingJob.id == job_id, TrainingJob.created_by == user_id)
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        return job
    
    def list_training_jobs(self, user_id: int, model_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[TrainingJob]:
        """List training jobs"""
        query = self.db.query(TrainingJob).filter(TrainingJob.created_by == user_id)
        
        if model_id:
            query = query.filter(TrainingJob.model_id == model_id)
        
        return query.order_by(desc(TrainingJob.created_at)).offset(skip).limit(limit).all()

class PredictionService:
    """Service for model predictions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def make_prediction(self, prediction_data: Dict[str, Any], user_id: int) -> ModelPrediction:
        """Make a prediction using a trained model"""
        model_id = prediction_data["model_id"]
        
        # Verify model exists and is trained
        model = self.db.query(MLModel).filter(
            and_(MLModel.id == model_id, MLModel.created_by == user_id)
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        if model.status != ModelStatus.TRAINED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model is not trained. Current status: {model.status}"
            )
        
        try:
            # Generate prediction ID
            prediction_id = str(uuid.uuid4())
            
            # Here you would load the actual model and make predictions
            # For now, we'll simulate the prediction process
            input_data = prediction_data["input_data"]
            
            # Simulate prediction (replace with actual model inference)
            predicted_value = self._simulate_prediction(model, input_data)
            confidence_score = np.random.uniform(0.7, 0.95)  # Simulated confidence
            
            prediction = ModelPrediction(
                model_id=model_id,
                prediction_id=prediction_id,
                input_data=input_data,
                predicted_value=predicted_value,
                confidence_score=confidence_score,
                model_version=model.version,
                created_by=user_id
            )
            
            self.db.add(prediction)
            self.db.commit()
            self.db.refresh(prediction)
            
            return prediction
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to make prediction: {str(e)}"
            )
    
    def _simulate_prediction(self, model: MLModel, input_data: Dict[str, Any]) -> Any:
        """Simulate prediction based on model type"""
        if model.model_type == ModelType.CLASSIFICATION:
            # Simulate classification prediction
            classes = ["class_a", "class_b", "class_c"]
            return np.random.choice(classes)
        elif model.model_type == ModelType.REGRESSION:
            # Simulate regression prediction
            return float(np.random.uniform(0, 100))
        elif model.model_type == ModelType.TIME_SERIES:
            # Simulate time series prediction
            return [float(np.random.uniform(0, 100)) for _ in range(7)]  # 7-day forecast
        else:
            return {"prediction": "simulated_result"}
    
    def get_prediction(self, prediction_id: str, user_id: int) -> ModelPrediction:
        """Get a specific prediction"""
        prediction = self.db.query(ModelPrediction).filter(
            and_(ModelPrediction.prediction_id == prediction_id, ModelPrediction.created_by == user_id)
        ).first()
        
        if not prediction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found"
            )
        
        return prediction
    
    def list_predictions(self, user_id: int, model_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[ModelPrediction]:
        """List predictions"""
        query = self.db.query(ModelPrediction).filter(ModelPrediction.created_by == user_id)
        
        if model_id:
            query = query.filter(ModelPrediction.model_id == model_id)
        
        return query.order_by(desc(ModelPrediction.created_at)).offset(skip).limit(limit).all()
    
    def update_prediction_feedback(self, prediction_id: str, feedback_data: Dict[str, Any], user_id: int) -> ModelPrediction:
        """Update prediction with actual results and feedback"""
        prediction = self.get_prediction(prediction_id, user_id)
        
        try:
            if "actual_value" in feedback_data:
                prediction.actual_value = feedback_data["actual_value"]
                
                # Calculate if prediction was correct (for classification)
                if isinstance(prediction.predicted_value, str) and isinstance(prediction.actual_value, str):
                    prediction.is_correct = prediction.predicted_value == prediction.actual_value
            
            if "feedback_score" in feedback_data:
                prediction.feedback_score = feedback_data["feedback_score"]
            
            self.db.commit()
            self.db.refresh(prediction)
            
            return prediction
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update prediction feedback: {str(e)}"
            )

class MLAnalyticsService:
    """Service for ML analytics and insights"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_ml_overview(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive ML overview for a user"""
        # Get model statistics
        models = self.db.query(MLModel).filter(MLModel.created_by == user_id).all()
        
        models_by_type: Dict[str, int] = {}
        
        # Count models by type
        for model in models:
            model_type = model.model_type.value
            if model_type not in models_by_type:
                models_by_type[model_type] = 0
            models_by_type[model_type] += 1
        
        model_stats = {
            "total_models": len(models),
            "trained_models": len([m for m in models if m.status == ModelStatus.TRAINED]),
            "deployed_models": len([m for m in models if m.status == ModelStatus.DEPLOYED]),
            "models_by_type": models_by_type
        }
        
        # Get training job statistics
        training_jobs = self.db.query(TrainingJob).filter(TrainingJob.created_by == user_id).all()
        
        training_stats = {
            "total_jobs": len(training_jobs),
            "completed_jobs": len([j for j in training_jobs if j.status == TrainingStatus.COMPLETED]),
            "running_jobs": len([j for j in training_jobs if j.status == TrainingStatus.RUNNING]),
            "failed_jobs": len([j for j in training_jobs if j.status == TrainingStatus.FAILED])
        }
        
        # Get prediction statistics
        predictions = self.db.query(ModelPrediction).filter(ModelPrediction.created_by == user_id).all()
        
        prediction_stats = {
            "total_predictions": len(predictions),
            "avg_confidence": np.mean([p.confidence_score for p in predictions if p.confidence_score]) if predictions else 0,
            "predictions_with_feedback": len([p for p in predictions if p.actual_value is not None]),
            "accuracy_rate": len([p for p in predictions if p.is_correct is True]) / len(predictions) if predictions else 0
        }
        
        # Get recent activity
        recent_models = self.db.query(MLModel).filter(
            MLModel.created_by == user_id
        ).order_by(desc(MLModel.created_at)).limit(5).all()
        
        recent_predictions = self.db.query(ModelPrediction).filter(
            ModelPrediction.created_by == user_id
        ).order_by(desc(ModelPrediction.created_at)).limit(10).all()
        
        return {
            "model_statistics": model_stats,
            "training_statistics": training_stats,
            "prediction_statistics": prediction_stats,
            "recent_activity": {
                "recent_models": [
                    {
                        "id": m.id,
                        "name": m.name,
                        "type": m.model_type.value,
                        "status": m.status.value,
                        "created_at": m.created_at.isoformat()
                    } for m in recent_models
                ],
                "recent_predictions": [
                    {
                        "id": p.prediction_id,
                        "model_id": p.model_id,
                        "confidence": p.confidence_score,
                        "created_at": p.created_at.isoformat()
                    } for p in recent_predictions
                ]
            }
        }
    
    def get_model_performance_trends(self, model_id: int, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get model performance trends over time"""
        model = self.db.query(MLModel).filter(
            and_(MLModel.id == model_id, MLModel.created_by == user_id)
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Get predictions from the last N days
        start_date = datetime.utcnow() - timedelta(days=days)
        predictions = self.db.query(ModelPrediction).filter(
            and_(
                ModelPrediction.model_id == model_id,
                ModelPrediction.created_at >= start_date
            )
        ).order_by(ModelPrediction.created_at).all()
        
        # Group predictions by day
        daily_stats = {}
        for prediction in predictions:
            date_key = prediction.created_at.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "prediction_count": 0,
                    "confidence_scores": [],
                    "correct_predictions": 0,
                    "total_with_feedback": 0
                }
            
            daily_stats[date_key]["prediction_count"] += 1
            if prediction.confidence_score:
                daily_stats[date_key]["confidence_scores"].append(prediction.confidence_score)
            if prediction.is_correct is True:
                daily_stats[date_key]["correct_predictions"] += 1
            if prediction.actual_value is not None:
                daily_stats[date_key]["total_with_feedback"] += 1
        
        # Calculate daily metrics
        trend_data = []
        for date_key, stats in daily_stats.items():
            avg_confidence = np.mean(stats["confidence_scores"]) if stats["confidence_scores"] else 0
            accuracy = stats["correct_predictions"] / stats["total_with_feedback"] if stats["total_with_feedback"] > 0 else None
            
            trend_data.append({
                "date": date_key,
                "prediction_count": stats["prediction_count"],
                "avg_confidence": avg_confidence,
                "accuracy": accuracy
            })
        
        return {
            "model_id": model_id,
            "model_name": model.name,
            "period_days": days,
            "trend_data": sorted(trend_data, key=lambda x: x["date"])
        }
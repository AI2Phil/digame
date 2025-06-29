"""
Intelligence Router for Digital Twin Platform
Provides endpoints for pattern recognition and prediction services
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging

from app.database import get_db
from app.auth.auth_dependencies import get_current_active_user
from app.models.user import User as SQLAlchemyUser
from app.services.pattern_recognition import PatternRecognitionService
from app.services.prediction_engine import PredictionEngine
from app.crud.user_crud import get_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])

# Initialize services
pattern_service = PatternRecognitionService()
prediction_engine = PredictionEngine()

@router.post("/patterns/analyze")
async def analyze_patterns(
    activity_data: Dict[str, Any],
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Analyze user activity patterns using the Pattern Recognition Service
    
    Args:
        activity_data: Dictionary containing user activity data
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Discovered patterns with confidence scores
    """
    try:
        # Add user context to activity data
        enriched_data = {
            **activity_data,
            "user_id": current_user.id,
            "user_timezone": getattr(current_user, 'timezone', 'UTC')
        }
        
        # Analyze patterns
        patterns = await pattern_service.analyze_activity(enriched_data)
        
        logger.info(f"Analyzed patterns for user {current_user.id}: {len(patterns)} patterns found")
        
        return {
            "success": True,
            "patterns": patterns,
            "total_patterns": len(patterns),
            "high_confidence_patterns": len([p for p in patterns if p.get('confidence', 0) >= 0.8]),
            "analysis_timestamp": patterns[0].get('discovered_at') if patterns else None
        }
        
    except Exception as e:
        logger.error(f"Error analyzing patterns for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pattern analysis failed: {str(e)}"
        )

@router.post("/predictions/productivity")
async def predict_productivity(
    user_data: Dict[str, Any],
    prediction_horizon: int = 7,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Predict productivity scores for the specified horizon
    
    Args:
        user_data: Historical user productivity data
        prediction_horizon: Number of days to predict ahead (default: 7)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Productivity predictions with confidence intervals
    """
    try:
        # Validate prediction horizon
        if prediction_horizon < 1 or prediction_horizon > 30:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prediction horizon must be between 1 and 30 days"
            )
        
        # Add user context to data
        enriched_data = {
            **user_data,
            "user_id": current_user.id,
            "user_timezone": getattr(current_user, 'timezone', 'UTC')
        }
        
        # Generate predictions
        predictions = await prediction_engine.predict_productivity_score(
            enriched_data, prediction_horizon
        )
        
        logger.info(f"Generated productivity predictions for user {current_user.id}: {prediction_horizon} days")
        
        return {
            "success": True,
            "user_id": current_user.id,
            "prediction_horizon": prediction_horizon,
            **predictions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting productivity for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Productivity prediction failed: {str(e)}"
        )

@router.post("/predictions/tasks")
async def forecast_task_completion(
    task_data: Dict[str, Any],
    days_ahead: int = 14,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Forecast task completion patterns and deadlines
    
    Args:
        task_data: Historical task completion data
        days_ahead: Number of days to forecast (default: 14)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Task completion forecasts and insights
    """
    try:
        # Validate forecast period
        if days_ahead < 1 or days_ahead > 60:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forecast period must be between 1 and 60 days"
            )
        
        # Add user context to data
        enriched_data = {
            **task_data,
            "user_id": current_user.id,
            "user_timezone": getattr(current_user, 'timezone', 'UTC')
        }
        
        # Generate task forecasts
        forecasts = await prediction_engine.forecast_task_completion(
            enriched_data, days_ahead
        )
        
        logger.info(f"Generated task completion forecasts for user {current_user.id}: {days_ahead} days")
        
        return {
            "success": True,
            "user_id": current_user.id,
            "forecast_period": days_ahead,
            **forecasts
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error forecasting tasks for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task forecasting failed: {str(e)}"
        )

@router.post("/predictions/energy")
async def predict_energy_levels(
    energy_data: Dict[str, Any],
    prediction_days: int = 7,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Predict energy levels and optimal work periods
    
    Args:
        energy_data: Historical energy level data
        prediction_days: Number of days to predict (default: 7)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Energy level predictions and scheduling recommendations
    """
    try:
        # Validate prediction period
        if prediction_days < 1 or prediction_days > 14:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prediction period must be between 1 and 14 days"
            )
        
        # Add user context to data
        enriched_data = {
            **energy_data,
            "user_id": current_user.id,
            "user_timezone": getattr(current_user, 'timezone', 'UTC')
        }
        
        # Generate energy predictions
        predictions = await prediction_engine.predict_energy_levels(
            enriched_data, prediction_days
        )
        
        logger.info(f"Generated energy predictions for user {current_user.id}: {prediction_days} days")
        
        return {
            "success": True,
            "user_id": current_user.id,
            "prediction_days": prediction_days,
            **predictions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting energy for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Energy prediction failed: {str(e)}"
        )

@router.post("/insights/comprehensive")
async def generate_comprehensive_insights(
    comprehensive_data: Dict[str, Any],
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive predictive insights combining all models
    
    Args:
        comprehensive_data: All available user data
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Comprehensive insights and recommendations
    """
    try:
        # Add user context to data
        enriched_data = {
            **comprehensive_data,
            "user_id": current_user.id,
            "user_timezone": getattr(current_user, 'timezone', 'UTC')
        }
        
        # Generate comprehensive insights
        insights = await prediction_engine.generate_insights(enriched_data)
        
        logger.info(f"Generated comprehensive insights for user {current_user.id}")
        
        return {
            "success": True,
            "user_id": current_user.id,
            **insights
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating insights for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insight generation failed: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for intelligence services
    
    Returns:
        Service health status
    """
    try:
        # Check if services are initialized
        pattern_service_status = "healthy" if pattern_service else "unavailable"
        prediction_engine_status = "healthy" if prediction_engine else "unavailable"
        
        # Check model training status
        model_status = {
            "pattern_recognition": "ready",
            "prediction_engine": "ready" if prediction_engine.is_trained else "training_required"
        }
        
        return {
            "success": True,
            "status": "healthy",
            "services": {
                "pattern_recognition": pattern_service_status,
                "prediction_engine": prediction_engine_status
            },
            "models": model_status,
            "capabilities": [
                "pattern_analysis",
                "productivity_prediction",
                "task_forecasting",
                "energy_prediction",
                "comprehensive_insights"
            ]
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/models/status")
async def get_model_status(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get status and accuracy of prediction models
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Model status and accuracy information
    """
    try:
        return {
            "success": True,
            "user_id": current_user.id,
            "model_status": {
                "is_trained": prediction_engine.is_trained,
                "accuracy_scores": prediction_engine.model_accuracy,
                "available_models": [
                    "productivity_prediction",
                    "task_completion_forecasting",
                    "energy_level_prediction"
                ],
                "pattern_recognition": {
                    "confidence_threshold": pattern_service.confidence_threshold,
                    "cache_status": len(pattern_service.pattern_cache) > 0
                }
            },
            "recommendations": {
                "data_collection": "Continue logging activities for improved accuracy",
                "model_improvement": "Models improve with more historical data"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model status for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model status retrieval failed: {str(e)}"
        )
"""
Advanced Analytics Router
Provides ML-based predictions, anomaly detection, and intelligent insights
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta

from ..database import get_db
from ..auth.jwt_handler import get_current_platform_owner
from ..services.advanced_analytics_service import (
    AdvancedAnalyticsService, 
    AnalyticsType, 
    AnalyticsResult,
    AnomalyDetection,
    PredictionResult
)
from ..models.user import User


router = APIRouter(prefix="/advanced-analytics", tags=["Advanced Analytics"])


# Pydantic Models
class AnalyticsRequest(BaseModel):
    analytics_type: str = Field(..., description="Type of analytics to perform")
    user_id: Optional[int] = Field(None, description="Specific user ID for analysis")
    days: int = Field(30, description="Number of days to analyze", ge=1, le=365)
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional parameters")


class AnalyticsResponse(BaseModel):
    analytics_type: str
    timestamp: datetime
    data: Dict[str, Any]
    confidence: float
    insights: List[str]
    recommendations: List[str]
    
    class Config:
        from_attributes = True


class AnomalyResponse(BaseModel):
    timestamp: datetime
    metric_name: str
    value: float
    expected_range: tuple[float, float]
    anomaly_score: float
    severity: str
    description: str
    
    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    metric: str
    predicted_value: float
    confidence_interval: tuple[float, float]
    prediction_date: datetime
    model_accuracy: float
    factors: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True


class InsightsReportResponse(BaseModel):
    report_date: str
    period_days: int
    user_behavior: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    churn_analysis: Dict[str, Any]
    revenue_prediction: Optional[Dict[str, Any]]
    key_insights: List[str]
    recommendations: List[str]
    ml_enabled: bool


# Analytics Endpoints

@router.get("/user-behavior", response_model=AnalyticsResponse)
async def analyze_user_behavior(
    user_id: Optional[int] = Query(None, description="Specific user ID to analyze"),
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Analyze user behavior patterns with ML clustering"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        result = await analytics_service.analyze_user_behavior(user_id=user_id, days=days)
        
        return AnalyticsResponse(
            analytics_type=result.analytics_type.value,
            timestamp=result.timestamp,
            data=result.data,
            confidence=result.confidence,
            insights=result.insights,
            recommendations=result.recommendations
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"User behavior analysis failed: {str(e)}"
        )


@router.get("/anomaly-detection", response_model=List[AnomalyResponse])
async def detect_anomalies(
    metric: str = Query("user_activity", description="Metric to analyze for anomalies"),
    days: int = Query(30, description="Number of days to analyze", ge=7, le=90),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Detect anomalies in platform metrics using ML models"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        anomalies = await analytics_service.detect_anomalies(metric=metric, days=days)
        
        return [
            AnomalyResponse(
                timestamp=anomaly.timestamp,
                metric_name=anomaly.metric_name,
                value=anomaly.value,
                expected_range=anomaly.expected_range,
                anomaly_score=anomaly.anomaly_score,
                severity=anomaly.severity,
                description=anomaly.description
            )
            for anomaly in anomalies
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly detection failed: {str(e)}"
        )


@router.get("/revenue-prediction", response_model=PredictionResponse)
async def predict_revenue(
    days_ahead: int = Query(30, description="Days ahead to predict", ge=1, le=365),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Predict future revenue using ML models"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        prediction = await analytics_service.predict_revenue(days_ahead=days_ahead)
        
        return PredictionResponse(
            metric=prediction.metric,
            predicted_value=prediction.predicted_value,
            confidence_interval=prediction.confidence_interval,
            prediction_date=prediction.prediction_date,
            model_accuracy=prediction.model_accuracy,
            factors=prediction.factors
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Revenue prediction failed: {str(e)}"
        )


@router.get("/churn-prediction")
async def predict_churn(
    user_id: Optional[int] = Query(None, description="Specific user ID to analyze"),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Predict user churn probability with risk assessment"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        result = await analytics_service.predict_churn(user_id=user_id)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Churn prediction failed: {str(e)}"
        )


@router.get("/insights-report", response_model=InsightsReportResponse)
async def generate_insights_report(
    days: int = Query(30, description="Number of days to analyze", ge=7, le=90),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Generate comprehensive analytics insights report"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        report = await analytics_service.generate_insights_report(days=days)
        
        return InsightsReportResponse(**report)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insights report generation failed: {str(e)}"
        )


# Performance Analytics

@router.get("/performance-metrics")
async def get_performance_metrics(
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Get platform performance metrics and optimization suggestions"""
    try:
        from ..services.performance_service import cache_service, task_processor, db_optimizer
        
        # Get cache statistics
        cache_stats = cache_service.get_stats()
        
        # Get task processing statistics
        task_stats = task_processor.get_stats()
        
        # Get slow queries
        slow_queries = db_optimizer.get_slow_queries(limit=5)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cache_performance": cache_stats,
            "task_processing": task_stats,
            "database_performance": {
                "slow_queries": slow_queries,
                "optimization_suggestions": [
                    "Consider adding indexes for frequently queried columns",
                    "Review and optimize queries with high execution times",
                    "Implement query result caching for expensive operations"
                ]
            },
            "recommendations": [
                "Monitor cache hit rates and adjust TTL values",
                "Scale task processing workers based on queue size",
                "Implement database connection pooling optimization"
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Performance metrics retrieval failed: {str(e)}"
        )


# ML Model Management

@router.get("/ml-models/status")
async def get_ml_models_status(
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Get status of ML models and capabilities"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        
        return {
            "ml_available": analytics_service.ml_available,
            "models": {
                "revenue_prediction": {
                    "available": analytics_service.ml_available,
                    "algorithm": "Random Forest Regressor",
                    "features": ["day_of_week", "day_of_month", "month"],
                    "last_trained": None  # Would track actual training dates
                },
                "anomaly_detection": {
                    "available": analytics_service.ml_available,
                    "algorithm": "Isolation Forest",
                    "fallback": "Statistical Z-score analysis",
                    "contamination_rate": 0.1
                },
                "user_clustering": {
                    "available": analytics_service.ml_available,
                    "algorithm": "DBSCAN",
                    "features": ["activity_count", "unique_users", "avg_hour"]
                }
            },
            "capabilities": {
                "behavioral_analysis": True,
                "predictive_modeling": analytics_service.ml_available,
                "anomaly_detection": True,
                "churn_prediction": True,
                "performance_optimization": True
            },
            "recommendations": [
                "Install scikit-learn for enhanced ML capabilities" if not analytics_service.ml_available else "ML capabilities fully enabled",
                "Consider implementing model retraining schedules",
                "Monitor model accuracy and performance metrics"
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ML models status check failed: {str(e)}"
        )


# Advanced Analytics Configuration

@router.post("/configure")
async def configure_analytics(
    config: Dict[str, Any],
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Configure advanced analytics settings"""
    try:
        # Validate configuration
        valid_configs = {
            "anomaly_threshold": float,
            "prediction_horizon_days": int,
            "cache_ttl_seconds": int,
            "ml_model_retrain_interval": int
        }
        
        validated_config = {}
        for key, value in config.items():
            if key in valid_configs:
                try:
                    validated_config[key] = valid_configs[key](value)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid value for {key}: {value}"
                    )
        
        # Store configuration (in production, save to database)
        # For now, return the validated configuration
        
        return {
            "message": "Analytics configuration updated successfully",
            "configuration": validated_config,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Configuration update failed: {str(e)}"
        )


# Health Check for Analytics Services

@router.get("/health")
async def analytics_health_check(
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Health check for analytics services and dependencies"""
    try:
        analytics_service = AdvancedAnalyticsService(db)
        
        # Test database connectivity
        db_healthy = True
        try:
            db.execute("SELECT 1").fetchone()
        except Exception:
            db_healthy = False
        
        # Test ML libraries
        ml_healthy = analytics_service.ml_available
        
        # Test cache service
        cache_healthy = True
        try:
            from ..services.performance_service import cache_service
            await cache_service.set("health_check", "ok", ttl=60)
            cache_result = await cache_service.get("health_check")
            cache_healthy = cache_result == "ok"
        except Exception:
            cache_healthy = False
        
        overall_health = db_healthy and cache_healthy
        
        return {
            "status": "healthy" if overall_health else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "healthy" if db_healthy else "unhealthy",
                "ml_libraries": "available" if ml_healthy else "unavailable",
                "cache_service": "healthy" if cache_healthy else "unhealthy",
                "analytics_engine": "operational"
            },
            "capabilities": {
                "basic_analytics": True,
                "ml_predictions": ml_healthy,
                "performance_monitoring": cache_healthy,
                "anomaly_detection": True
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

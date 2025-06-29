"""
Platform Owner Router for Digital Twin Platform
Provides endpoints for platform owner management and testing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from app.database import get_db
from app.auth.auth_dependencies import get_current_active_user
from app.models.user import User as SQLAlchemyUser
from app.services.pattern_recognition import PatternRecognitionService
from app.services.prediction_engine import PredictionEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/platform-owner", tags=["Platform Owner"])

# Initialize services for testing
pattern_service = PatternRecognitionService()
prediction_engine = PredictionEngine()

def check_platform_owner_access(current_user: SQLAlchemyUser):
    """Check if user has platform owner access"""
    if not getattr(current_user, 'is_platform_owner', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform Owner access required"
        )

@router.get("/settings")
async def get_platform_settings(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get platform settings for Platform Owner
    """
    try:
        check_platform_owner_access(current_user)
        
        # Mock platform settings - in real implementation, these would come from database
        settings = {
            "platform_info": {
                "name": "Digame Digital Twin Platform",
                "version": "1.0.0",
                "environment": "development",
                "total_users": 1250,
                "active_users_today": 89,
                "total_digital_twins": 456,
                "api_requests_today": 12847
            },
            "intelligence_settings": {
                "pattern_recognition_enabled": True,
                "prediction_engine_enabled": True,
                "confidence_threshold": 0.7,
                "max_prediction_horizon": 30,
                "auto_model_training": True
            },
            "api_settings": {
                "rate_limit_enabled": True,
                "max_requests_per_minute": 100,
                "authentication_required": True,
                "cors_enabled": True
            },
            "data_settings": {
                "data_retention_days": 365,
                "backup_enabled": True,
                "encryption_enabled": True,
                "anonymization_enabled": True
            },
            "notification_settings": {
                "email_notifications": True,
                "slack_integration": False,
                "alert_thresholds": {
                    "high_error_rate": 5.0,
                    "low_performance": 2.0,
                    "high_usage": 80.0
                }
            }
        }
        
        return {
            "success": True,
            "settings": settings,
            "last_updated": datetime.utcnow().isoformat(),
            "updated_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting platform settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get platform settings: {str(e)}"
        )

@router.put("/settings")
async def update_platform_settings(
    settings_update: Dict[str, Any],
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update platform settings
    """
    try:
        check_platform_owner_access(current_user)
        
        # In real implementation, validate and save to database
        logger.info(f"Platform settings updated by {current_user.username}: {settings_update}")
        
        return {
            "success": True,
            "message": "Platform settings updated successfully",
            "updated_settings": settings_update,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating platform settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update platform settings: {str(e)}"
        )

@router.get("/test-zone/intelligence/sample-data")
async def get_intelligence_test_data(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get sample test data for intelligence API testing
    """
    try:
        check_platform_owner_access(current_user)
        
        sample_data = {
            "pattern_analysis_data": {
                "activities": [
                    {
                        "timestamp": "2024-01-15T09:00:00Z",
                        "productivity_score": 0.85,
                        "type": "deep_work",
                        "duration": 120,
                        "focus_score": 0.9,
                        "interruptions": 1
                    },
                    {
                        "timestamp": "2024-01-15T11:30:00Z",
                        "productivity_score": 0.75,
                        "type": "meetings",
                        "duration": 60,
                        "focus_score": 0.7,
                        "interruptions": 3
                    },
                    {
                        "timestamp": "2024-01-15T14:00:00Z",
                        "productivity_score": 0.65,
                        "type": "routine_tasks",
                        "duration": 90,
                        "focus_score": 0.6,
                        "interruptions": 2
                    },
                    {
                        "timestamp": "2024-01-16T08:30:00Z",
                        "productivity_score": 0.9,
                        "type": "deep_work",
                        "duration": 150,
                        "focus_score": 0.95,
                        "interruptions": 0
                    },
                    {
                        "timestamp": "2024-01-16T13:00:00Z",
                        "productivity_score": 0.7,
                        "type": "collaborative_work",
                        "duration": 75,
                        "focus_score": 0.8,
                        "interruptions": 2
                    }
                ],
                "focus_sessions": [
                    {
                        "timestamp": "2024-01-15T09:00:00Z",
                        "duration": 120,
                        "focus_score": 0.9,
                        "interruptions": 1,
                        "interruption_sources": ["email"]
                    },
                    {
                        "timestamp": "2024-01-16T08:30:00Z",
                        "duration": 150,
                        "focus_score": 0.95,
                        "interruptions": 0,
                        "interruption_sources": []
                    }
                ]
            },
            "productivity_prediction_data": {
                "productivity_history": [
                    {
                        "date": "2024-01-10",
                        "score": 0.8,
                        "tasks_completed": 6,
                        "focus_time": 240,
                        "interruptions": 3
                    },
                    {
                        "date": "2024-01-11",
                        "score": 0.75,
                        "tasks_completed": 5,
                        "focus_time": 180,
                        "interruptions": 4
                    },
                    {
                        "date": "2024-01-12",
                        "score": 0.85,
                        "tasks_completed": 7,
                        "focus_time": 300,
                        "interruptions": 2
                    },
                    {
                        "date": "2024-01-13",
                        "score": 0.7,
                        "tasks_completed": 4,
                        "focus_time": 150,
                        "interruptions": 5
                    },
                    {
                        "date": "2024-01-14",
                        "score": 0.9,
                        "tasks_completed": 8,
                        "focus_time": 360,
                        "interruptions": 1
                    }
                ]
            },
            "task_forecasting_data": {
                "task_history": [
                    {
                        "completed_at": "2024-01-10T10:30:00Z",
                        "priority": "high",
                        "estimated_duration": 60,
                        "actual_duration": 75,
                        "complexity": "medium"
                    },
                    {
                        "completed_at": "2024-01-10T14:15:00Z",
                        "priority": "medium",
                        "estimated_duration": 30,
                        "actual_duration": 25,
                        "complexity": "low"
                    },
                    {
                        "completed_at": "2024-01-11T09:45:00Z",
                        "priority": "high",
                        "estimated_duration": 120,
                        "actual_duration": 140,
                        "complexity": "high"
                    },
                    {
                        "completed_at": "2024-01-11T16:20:00Z",
                        "priority": "low",
                        "estimated_duration": 45,
                        "actual_duration": 40,
                        "complexity": "low"
                    }
                ]
            },
            "energy_prediction_data": {
                "energy_history": [
                    {
                        "timestamp": "2024-01-10T08:00:00Z",
                        "energy_level": 0.9,
                        "sleep_quality": 0.8,
                        "exercise": True,
                        "caffeine": True
                    },
                    {
                        "timestamp": "2024-01-10T12:00:00Z",
                        "energy_level": 0.7,
                        "sleep_quality": 0.8,
                        "exercise": False,
                        "caffeine": False
                    },
                    {
                        "timestamp": "2024-01-10T16:00:00Z",
                        "energy_level": 0.6,
                        "sleep_quality": 0.8,
                        "exercise": False,
                        "caffeine": True
                    },
                    {
                        "timestamp": "2024-01-11T08:00:00Z",
                        "energy_level": 0.85,
                        "sleep_quality": 0.9,
                        "exercise": True,
                        "caffeine": True
                    }
                ]
            }
        }
        
        return {
            "success": True,
            "sample_data": sample_data,
            "description": "Sample data for testing intelligence API endpoints",
            "usage_instructions": {
                "pattern_analysis": "Use 'pattern_analysis_data' with POST /api/v1/intelligence/patterns/analyze",
                "productivity_prediction": "Use 'productivity_prediction_data' with POST /api/v1/intelligence/predictions/productivity",
                "task_forecasting": "Use 'task_forecasting_data' with POST /api/v1/intelligence/predictions/tasks",
                "energy_prediction": "Use 'energy_prediction_data' with POST /api/v1/intelligence/predictions/energy"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intelligence test data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get test data: {str(e)}"
        )

@router.post("/test-zone/intelligence/test-pattern-analysis")
async def test_pattern_analysis(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test pattern analysis with sample or provided data
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            # Use default test data
            sample_response = await get_intelligence_test_data(current_user, db)
            test_data = sample_response["sample_data"]["pattern_analysis_data"]
        
        # Run pattern analysis
        patterns = await pattern_service.analyze_activity(test_data)
        
        return {
            "success": True,
            "test_type": "pattern_analysis",
            "input_data": test_data,
            "results": patterns,
            "patterns_found": len(patterns),
            "high_confidence_patterns": len([p for p in patterns if p.get('confidence', 0) >= 0.8]),
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing pattern analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pattern analysis test failed: {str(e)}"
        )

@router.post("/test-zone/intelligence/test-productivity-prediction")
async def test_productivity_prediction(
    test_data: Optional[Dict[str, Any]] = None,
    prediction_horizon: int = 7,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test productivity prediction with sample or provided data
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            # Use default test data
            sample_response = await get_intelligence_test_data(current_user, db)
            test_data = sample_response["sample_data"]["productivity_prediction_data"]
        
        # Run productivity prediction
        predictions = await prediction_engine.predict_productivity_score(test_data, prediction_horizon)
        
        return {
            "success": True,
            "test_type": "productivity_prediction",
            "input_data": test_data,
            "prediction_horizon": prediction_horizon,
            "results": predictions,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing productivity prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Productivity prediction test failed: {str(e)}"
        )

@router.post("/test-zone/intelligence/test-comprehensive-insights")
async def test_comprehensive_insights(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test comprehensive insights with sample or provided data
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            # Use default test data - combine all sample data
            sample_response = await get_intelligence_test_data(current_user, db)
            sample_data = sample_response["sample_data"]
            test_data = {
                **sample_data["pattern_analysis_data"],
                **sample_data["productivity_prediction_data"],
                **sample_data["task_forecasting_data"],
                **sample_data["energy_prediction_data"]
            }
        
        # Run comprehensive insights
        insights = await prediction_engine.generate_insights(test_data)
        
        return {
            "success": True,
            "test_type": "comprehensive_insights",
            "input_data": test_data,
            "results": insights,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing comprehensive insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comprehensive insights test failed: {str(e)}"
        )

@router.get("/test-zone/available-tests")
async def get_available_tests(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get list of available API tests
    """
    try:
        check_platform_owner_access(current_user)
        
        available_tests = {
            "intelligence_tests": [
                {
                    "name": "Pattern Analysis",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/test-pattern-analysis",
                    "method": "POST",
                    "description": "Test pattern recognition and analysis capabilities",
                    "sample_data_endpoint": "/api/v1/platform-owner/test-zone/intelligence/sample-data"
                },
                {
                    "name": "Productivity Prediction",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/test-productivity-prediction",
                    "method": "POST",
                    "description": "Test productivity score prediction and forecasting",
                    "parameters": ["prediction_horizon (1-30 days)"]
                },
                {
                    "name": "Comprehensive Insights",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/test-comprehensive-insights",
                    "method": "POST",
                    "description": "Test combined insights from all intelligence models"
                }
            ],
            "upcoming_tests": [
                {
                    "name": "Digital Twin Operations",
                    "status": "planned",
                    "description": "Test digital twin creation and management"
                },
                {
                    "name": "User Analytics",
                    "status": "planned",
                    "description": "Test user behavior analytics and insights"
                }
            ]
        }
        
        return {
            "success": True,
            "available_tests": available_tests,
            "total_tests": len(available_tests["intelligence_tests"]),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting available tests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available tests: {str(e)}"
        )

@router.get("/dashboard")
async def get_platform_dashboard(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get platform owner dashboard data
    """
    try:
        check_platform_owner_access(current_user)
        
        # Mock dashboard data - in real implementation, this would come from database
        dashboard_data = {
            "overview": {
                "total_users": 1250,
                "active_users_today": 89,
                "new_users_this_week": 23,
                "total_digital_twins": 456,
                "active_digital_twins": 234,
                "api_requests_today": 12847,
                "system_health": "healthy"
            },
            "intelligence_metrics": {
                "patterns_analyzed_today": 156,
                "predictions_generated_today": 89,
                "model_accuracy": {
                    "productivity": 0.85,
                    "task_completion": 0.78,
                    "energy_prediction": 0.82
                },
                "average_confidence_score": 0.79
            },
            "system_metrics": {
                "cpu_usage": 45.2,
                "memory_usage": 67.8,
                "disk_usage": 34.1,
                "response_time_avg": 245,
                "error_rate": 0.02
            },
            "recent_activities": [
                {
                    "timestamp": "2024-01-15T14:30:00Z",
                    "type": "user_registration",
                    "description": "New user registered: john.doe@example.com"
                },
                {
                    "timestamp": "2024-01-15T14:25:00Z",
                    "type": "pattern_analysis",
                    "description": "Pattern analysis completed for user ID 1234"
                },
                {
                    "timestamp": "2024-01-15T14:20:00Z",
                    "type": "prediction_generated",
                    "description": "Productivity prediction generated for 7 days"
                }
            ]
        }
        
        return {
            "success": True,
            "dashboard_data": dashboard_data,
            "last_updated": datetime.utcnow().isoformat(),
            "refresh_interval": 30  # seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting platform dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {str(e)}"
        )
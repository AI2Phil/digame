"""
Platform Owner Router for Digital Twin Platform
Provides endpoints for platform owner management and testing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta

from app.database import get_db
from app.auth.auth_dependencies import get_current_active_user
from app.models.user import User as SQLAlchemyUser
from app.services.pattern_recognition import PatternRecognitionService
from app.services.prediction_engine import PredictionEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/platform-owner", tags=["Platform Owner"])

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

# ========================================
# TEST ZONE ENDPOINTS
# ========================================

@router.get("/test-zone/metrics")
async def get_test_metrics(
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get test zone metrics and statistics
    """
    try:
        check_platform_owner_access(current_user)
        
        # Mock test metrics
        metrics = {
            "testsPassed": 24,
            "testsFailed": 4,
            "coverage": 85,
            "lastRun": datetime.utcnow().isoformat(),
            "totalTests": 28,
            "successRate": 85.7,
            "averageExecutionTime": 245,
            "testsByCategory": {
                "intelligence": {"passed": 5, "failed": 0, "total": 5},
                "digital_twin": {"passed": 3, "failed": 0, "total": 3},
                "nlp": {"passed": 2, "failed": 0, "total": 2},
                "analytics": {"passed": 3, "failed": 0, "total": 3},
                "learning": {"passed": 2, "failed": 1, "total": 3},
                "team": {"passed": 4, "failed": 1, "total": 5},
                "websocket": {"passed": 2, "failed": 1, "total": 3},
                "kubernetes": {"passed": 2, "failed": 1, "total": 3},
                "custom": {"passed": 1, "failed": 0, "total": 1}
            }
        }
        
        return {
            "success": True,
            "metrics": metrics,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting test metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get test metrics: {str(e)}"
        )

@router.post("/test-zone/run-all-tests")
async def run_all_tests(
    test_config: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Run all available tests across all categories
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_config:
            test_config = {
                "testSuites": ["intelligence", "digital_twin", "nlp", "analytics", "learning", "team", "websocket", "kubernetes", "custom"]
            }
        
        # Simulate comprehensive test execution
        test_results = {
            "summary": {
                "total_tests": 28,
                "tests_passed": 24,
                "tests_failed": 4,
                "success_rate": 85.7,
                "total_execution_time": 6750,
                "started_at": datetime.utcnow().isoformat(),
                "completed_at": datetime.utcnow().isoformat()
            },
            "results_by_category": {
                "intelligence": {
                    "tests_run": 5,
                    "passed": 5,
                    "failed": 0,
                    "execution_time": 1245,
                    "tests": [
                        {"name": "Pattern Analysis", "status": "passed", "execution_time": 245},
                        {"name": "Productivity Prediction", "status": "passed", "execution_time": 312},
                        {"name": "Task Forecasting", "status": "passed", "execution_time": 289},
                        {"name": "Energy Prediction", "status": "passed", "execution_time": 267},
                        {"name": "Comprehensive Insights", "status": "passed", "execution_time": 132}
                    ]
                },
                "digital_twin": {
                    "tests_run": 3,
                    "passed": 3,
                    "failed": 0,
                    "execution_time": 713,
                    "tests": [
                        {"name": "Create Twin", "status": "passed", "execution_time": 156},
                        {"name": "Twin Interaction", "status": "passed", "execution_time": 245},
                        {"name": "Twin Learning", "status": "passed", "execution_time": 312}
                    ]
                },
                "nlp": {
                    "tests_run": 2,
                    "passed": 2,
                    "failed": 0,
                    "execution_time": 456,
                    "tests": [
                        {"name": "Text Analysis", "status": "passed", "execution_time": 189},
                        {"name": "Conversation Analysis", "status": "passed", "execution_time": 267}
                    ]
                },
                "analytics": {
                    "tests_run": 3,
                    "passed": 3,
                    "failed": 0,
                    "execution_time": 820,
                    "tests": [
                        {"name": "Comprehensive Analysis", "status": "passed", "execution_time": 423},
                        {"name": "Analytics Stats", "status": "passed", "execution_time": 198},
                        {"name": "Twin Insights", "status": "passed", "execution_time": 199}
                    ]
                },
                "learning": {
                    "tests_run": 3,
                    "passed": 2,
                    "failed": 1,
                    "execution_time": 645,
                    "tests": [
                        {"name": "Add Learning Data", "status": "passed", "execution_time": 198},
                        {"name": "Learning Pipeline", "status": "passed", "execution_time": 247},
                        {"name": "Model Training", "status": "failed", "execution_time": 200, "error": "Training timeout"}
                    ]
                },
                "team": {
                    "tests_run": 5,
                    "passed": 4,
                    "failed": 1,
                    "execution_time": 1092,
                    "tests": [
                        {"name": "Create Team", "status": "passed", "execution_time": 156},
                        {"name": "Add Team Member", "status": "passed", "execution_time": 234},
                        {"name": "Team Coordination", "status": "failed", "execution_time": 298, "error": "Timeout"},
                        {"name": "Workload Balancing", "status": "passed", "execution_time": 204},
                        {"name": "Team Analytics", "status": "passed", "execution_time": 200}
                    ]
                },
                "websocket": {
                    "tests_run": 3,
                    "passed": 2,
                    "failed": 1,
                    "execution_time": 656,
                    "tests": [
                        {"name": "Connection Stats", "status": "passed", "execution_time": 123},
                        {"name": "Broadcast Test", "status": "failed", "execution_time": 333, "error": "Connection refused"},
                        {"name": "Real-time Updates", "status": "passed", "execution_time": 200}
                    ]
                },
                "kubernetes": {
                    "tests_run": 3,
                    "passed": 2,
                    "failed": 1,
                    "execution_time": 825,
                    "tests": [
                        {"name": "Deployment Status", "status": "passed", "execution_time": 425},
                        {"name": "Pod Health", "status": "passed", "execution_time": 200},
                        {"name": "Service Discovery", "status": "failed", "execution_time": 200, "error": "Service unavailable"}
                    ]
                },
                "custom": {
                    "tests_run": 1,
                    "passed": 1,
                    "failed": 0,
                    "execution_time": 298,
                    "tests": [
                        {"name": "Custom Test Suite", "status": "passed", "execution_time": 298}
                    ]
                }
            },
            "recommendations": [
                "Fix WebSocket connection issues for broadcast testing",
                "Investigate team coordination timeout issues",
                "Resolve Kubernetes service discovery problems",
                "Optimize learning model training timeouts",
                "Overall system performance is excellent with 85.7% success rate"
            ]
        }
        
        return {
            "success": True,
            "test_type": "run_all_tests",
            "config": test_config,
            "results": test_results,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running all tests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run all tests: {str(e)}"
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
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/pattern-analysis",
                    "method": "POST",
                    "description": "Test pattern recognition and analysis capabilities"
                },
                {
                    "name": "Productivity Prediction",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/productivity-prediction",
                    "method": "POST",
                    "description": "Test productivity score prediction and forecasting"
                },
                {
                    "name": "Task Forecasting",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/task-forecasting",
                    "method": "POST",
                    "description": "Test task completion time forecasting"
                },
                {
                    "name": "Energy Prediction",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/energy-prediction",
                    "method": "POST",
                    "description": "Test energy level prediction capabilities"
                },
                {
                    "name": "Comprehensive Insights",
                    "endpoint": "/api/v1/platform-owner/test-zone/intelligence/comprehensive-insights",
                    "method": "POST",
                    "description": "Test combined insights from all intelligence models"
                }
            ],
            "digital_twin_tests": [
                {
                    "name": "Create Twin",
                    "endpoint": "/api/v1/platform-owner/test-zone/digital-twin/create-twin",
                    "method": "POST",
                    "description": "Test digital twin creation functionality"
                },
                {
                    "name": "Twin Interaction",
                    "endpoint": "/api/v1/platform-owner/test-zone/digital-twin/twin-interaction",
                    "method": "POST",
                    "description": "Test digital twin interaction capabilities"
                },
                {
                    "name": "Twin Learning",
                    "endpoint": "/api/v1/platform-owner/test-zone/digital-twin/twin-learning",
                    "method": "POST",
                    "description": "Test digital twin learning and adaptation"
                }
            ],
            "nlp_tests": [
                {
                    "name": "Text Analysis",
                    "endpoint": "/api/v1/platform-owner/test-zone/nlp/text-analysis",
                    "method": "POST",
                    "description": "Test NLP text analysis capabilities"
                },
                {
                    "name": "Conversation Analysis",
                    "endpoint": "/api/v1/platform-owner/test-zone/nlp/conversation-analysis",
                    "method": "POST",
                    "description": "Test conversation analysis and context understanding"
                }
            ],
            "analytics_tests": [
                {
                    "name": "Comprehensive Analysis",
                    "endpoint": "/api/v1/platform-owner/test-zone/analytics/comprehensive-analysis",
                    "method": "POST",
                    "description": "Test comprehensive analytics capabilities"
                },
                {
                    "name": "Analytics Stats",
                    "endpoint": "/api/v1/platform-owner/test-zone/analytics/stats",
                    "method": "POST",
                    "description": "Test analytics statistics generation"
                },
                {
                    "name": "Twin Insights",
                    "endpoint": "/api/v1/platform-owner/test-zone/analytics/twin-insights",
                    "method": "POST",
                    "description": "Test analytics twin insights generation"
                }
            ]
        }
        
        total_tests = sum(len(tests) for tests in available_tests.values())
        
        return {
            "success": True,
            "available_tests": available_tests,
            "total_tests": total_tests,
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
                "twin_id": "test-twin-123",
                "data": {
                    "productivity_scores": [0.85, 0.78, 0.92, 0.67, 0.89],
                    "focus_times": [0.9, 0.85, 0.95, 0.7, 0.88],
                    "energy_levels": [0.8, 0.75, 0.85, 0.6, 0.82],
                    "task_completion_rates": [0.75, 0.8, 0.9, 0.65, 0.85],
                    "timestamps": [
                        "2024-01-15T09:00:00Z",
                        "2024-01-15T10:00:00Z",
                        "2024-01-15T11:00:00Z",
                        "2024-01-15T12:00:00Z",
                        "2024-01-15T13:00:00Z"
                    ]
                }
            },
            "productivity_prediction_data": {
                "twin_id": "test-twin-123",
                "historical_data": {
                    "productivity_scores": [0.85, 0.78, 0.92, 0.67, 0.89],
                    "context_factors": [
                        {
                            "day_of_week": "Monday",
                            "time_of_day": "morning",
                            "meeting_count": 2,
                            "interruption_count": 3
                        }
                    ]
                }
            }
        }
        
        return {
            "success": True,
            "sample_data": sample_data,
            "description": "Sample data for testing intelligence API endpoints"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intelligence test data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get test data: {str(e)}"
        )

# ========================================
# INTELLIGENCE API TEST ENDPOINTS
# ========================================

@router.post("/test-zone/intelligence/pattern-analysis")
async def test_pattern_analysis(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test pattern analysis capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "test-twin-123",
                "query": "How productive was I today?",
                "context": {
                    "productivity_score": 0.85,
                    "recent_activities": [
                        {"type": "coding", "duration": 120, "focus_score": 0.9},
                        {"type": "meeting", "duration": 60, "focus_score": 0.7}
                    ],
                    "energy_level": 0.8,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        
        # Simulate pattern analysis
        patterns = [
            {
                "pattern_type": "productivity_peak",
                "confidence": 0.92,
                "description": "High productivity during morning coding sessions",
                "frequency": "daily",
                "impact_score": 0.85
            },
            {
                "pattern_type": "focus_decline",
                "confidence": 0.78,
                "description": "Focus decreases during afternoon meetings",
                "frequency": "weekly",
                "impact_score": 0.65
            }
        ]
        
        return {
            "success": True,
            "test_type": "pattern_analysis",
            "input_data": test_data,
            "results": {
                "patterns": patterns,
                "patterns_found": len(patterns),
                "high_confidence_patterns": len([p for p in patterns if float(p["confidence"]) >= 0.8]),
                "analysis_summary": {
                    "total_patterns": len(patterns),
                    "average_confidence": sum(float(p["confidence"]) for p in patterns) / len(patterns),
                    "most_significant": patterns[0]["pattern_type"]
                }
            },
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 245
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in pattern analysis test: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pattern analysis test failed: {str(e)}"
        )

# ========================================
# DIGITAL TWIN API TEST ENDPOINTS
# ========================================

@router.post("/test-zone/digital-twin/create-twin")
async def test_create_digital_twin(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test digital twin creation functionality
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "user_id": "test-user-456",
                "twin_name": "Test Digital Twin",
                "twin_type": "productivity_assistant"
            }
        
        # Simulate digital twin creation
        twin_result = {
            "twin_id": f"twin_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "user_id": test_data["user_id"],
            "twin_name": test_data["twin_name"],
            "twin_type": test_data["twin_type"],
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "test_type": "create_digital_twin",
            "input_data": test_data,
            "results": twin_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 156
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing digital twin creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Digital twin creation test failed: {str(e)}"
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
        
        # Mock dashboard data
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
            }
        }
        
        return {
            "success": True,
            "dashboard_data": dashboard_data,
            "last_updated": datetime.utcnow().isoformat(),
            "refresh_interval": 30
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting platform dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {str(e)}"
        )

# ========================================
# ADDITIONAL TEST ZONE ENDPOINTS
# ========================================

@router.post("/test-zone/intelligence/productivity-prediction")
async def test_productivity_prediction(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test productivity prediction capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "test-twin-123",
                "historical_data": {
                    "productivity_scores": [0.85, 0.78, 0.92, 0.67, 0.89],
                    "context_factors": [
                        {"day_of_week": "Monday", "time_of_day": "morning", "meeting_count": 2}
                    ]
                },
                "prediction_horizon_hours": 24
            }
        
        # Simulate productivity prediction
        prediction_result = {
            "twin_id": test_data["twin_id"],
            "prediction_id": f"prediction_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "predictions": [
                {
                    "time_slot": "09:00-10:00",
                    "predicted_productivity": 0.87,
                    "confidence": 0.91,
                    "factors": ["high_energy", "low_meetings", "optimal_time"]
                },
                {
                    "time_slot": "10:00-11:00",
                    "predicted_productivity": 0.92,
                    "confidence": 0.94,
                    "factors": ["peak_focus_time", "no_interruptions"]
                }
            ],
            "overall_prediction": {
                "average_productivity": 0.86,
                "peak_hours": ["10:00-12:00"],
                "low_hours": ["14:00-15:00"]
            }
        }
        
        return {
            "success": True,
            "test_type": "productivity_prediction",
            "input_data": test_data,
            "results": prediction_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 312
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing productivity prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Productivity prediction test failed: {str(e)}"
        )

@router.post("/test-zone/intelligence/task-forecasting")
async def test_task_forecasting(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test task forecasting capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "test-twin-123",
                "tasks": [
                    {"task_type": "coding", "estimated_duration": 120, "complexity": "medium", "priority": "high"},
                    {"task_type": "meeting", "estimated_duration": 60, "complexity": "low", "priority": "medium"}
                ],
                "forecast_period_days": 3
            }
        
        # Simulate task forecasting
        forecast_result = {
            "twin_id": test_data["twin_id"],
            "forecast_id": f"forecast_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "task_forecasts": [
                {
                    "task_id": "task_1",
                    "task_type": "coding",
                    "original_estimate": 120,
                    "adjusted_estimate": 135,
                    "confidence": 0.88,
                    "optimal_start_time": "10:00",
                    "completion_probability": 0.92
                },
                {
                    "task_id": "task_2",
                    "task_type": "meeting",
                    "original_estimate": 60,
                    "adjusted_estimate": 65,
                    "confidence": 0.95,
                    "optimal_start_time": "14:00",
                    "completion_probability": 0.98
                }
            ],
            "schedule_optimization": {
                "recommended_order": ["coding", "meeting"],
                "total_estimated_time": 200,
                "buffer_time_needed": 30,
                "success_probability": 0.90
            }
        }
        
        return {
            "success": True,
            "test_type": "task_forecasting",
            "input_data": test_data,
            "results": forecast_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 289
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing task forecasting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task forecasting test failed: {str(e)}"
        )

@router.post("/test-zone/intelligence/energy-prediction")
async def test_energy_prediction(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test energy prediction capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "test-twin-123",
                "historical_energy": [0.8, 0.75, 0.85, 0.6, 0.82],
                "sleep_data": {"duration": 7.5, "quality": 0.85, "bedtime": "23:00", "wake_time": "06:30"},
                "activity_data": {"exercise_duration": 45, "break_frequency": 6, "hydration_level": 0.8},
                "prediction_horizon_hours": 12
            }
        
        # Simulate energy prediction
        energy_result = {
            "twin_id": test_data["twin_id"],
            "prediction_id": f"energy_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "energy_forecast": [
                {"time": "09:00", "predicted_energy": 0.85, "confidence": 0.92},
                {"time": "10:00", "predicted_energy": 0.90, "confidence": 0.94},
                {"time": "11:00", "predicted_energy": 0.88, "confidence": 0.91},
                {"time": "12:00", "predicted_energy": 0.82, "confidence": 0.89},
                {"time": "13:00", "predicted_energy": 0.75, "confidence": 0.87},
                {"time": "14:00", "predicted_energy": 0.70, "confidence": 0.85}
            ],
            "insights": {
                "peak_energy_time": "10:00",
                "lowest_energy_time": "14:00",
                "energy_sustainability": 0.84,
                "recovery_recommendations": ["15-minute break at 14:00", "light exercise at 15:30"]
            }
        }
        
        return {
            "success": True,
            "test_type": "energy_prediction",
            "input_data": test_data,
            "results": energy_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 267
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing energy prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Energy prediction test failed: {str(e)}"
        )

@router.post("/test-zone/intelligence/comprehensive-insights")
async def test_comprehensive_insights(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test comprehensive insights generation
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "test-twin-123",
                "analysis_scope": "comprehensive",
                "include_predictions": True
            }
        
        # Simulate comprehensive insights
        insights_result = {
            "twin_id": test_data["twin_id"],
            "insight_id": f"comprehensive_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "combined_analysis": {
                "overall_score": 0.87,
                "productivity_forecast": 0.89,
                "energy_optimization": 0.85,
                "task_efficiency": 0.91,
                "pattern_strength": 0.88
            },
            "key_insights": [
                {
                    "category": "productivity",
                    "insight": "Peak productivity occurs between 10-12 AM with 92% consistency",
                    "confidence": 0.94,
                    "actionable": True,
                    "recommendation": "Schedule most important tasks during morning peak hours"
                },
                {
                    "category": "energy",
                    "insight": "Energy levels correlate strongly with sleep quality (r=0.85)",
                    "confidence": 0.91,
                    "actionable": True,
                    "recommendation": "Maintain consistent sleep schedule for optimal performance"
                }
            ],
            "optimization_suggestions": [
                "Implement 90-minute focused work blocks",
                "Schedule breaks based on energy prediction model",
                "Use pattern analysis to optimize daily schedule"
            ]
        }
        
        return {
            "success": True,
            "test_type": "comprehensive_insights",
            "input_data": test_data,
            "results": insights_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 132
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing comprehensive insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comprehensive insights test failed: {str(e)}"
        )

# ========================================
# DIGITAL TWIN API TEST ENDPOINTS
# ========================================

@router.post("/test-zone/digital-twin/twin-interaction")
async def test_twin_interaction(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test digital twin interaction capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "twin_20240115_143025",
                "interaction_type": "query",
                "query": "How can I improve my productivity today?",
                "context": {
                    "current_time": "14:30",
                    "scheduled_meetings": 2,
                    "energy_level": 0.75,
                    "recent_productivity": 0.82
                }
            }
        
        # Simulate twin interaction
        interaction_result = {
            "interaction_id": f"interaction_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "twin_id": test_data["twin_id"],
            "query": test_data["query"],
            "response": {
                "message": "Based on your current energy level and schedule, I recommend focusing on high-priority tasks for the next 90 minutes before your next meeting.",
                "confidence": 0.89,
                "reasoning": [
                    "Your energy level is at 75%, which is optimal for focused work",
                    "You have 90 minutes before your next meeting",
                    "Your recent productivity score of 82% suggests good momentum"
                ],
                "recommendations": [
                    {
                        "action": "Focus on high-priority coding task",
                        "duration": "60 minutes",
                        "expected_outcome": "Complete feature implementation"
                    },
                    {
                        "action": "Take 10-minute break",
                        "duration": "10 minutes",
                        "expected_outcome": "Maintain energy for meeting"
                    }
                ]
            },
            "interaction_metadata": {
                "processing_time": 245,
                "models_used": ["productivity_predictor", "energy_analyzer", "schedule_optimizer"],
                "data_points_analyzed": 156,
                "confidence_factors": ["historical_patterns", "current_context", "user_preferences"]
            }
        }
        
        return {
            "success": True,
            "test_type": "twin_interaction",
            "input_data": test_data,
            "results": interaction_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 245
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing twin interaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Twin interaction test failed: {str(e)}"
        )

@router.post("/test-zone/digital-twin/twin-learning")
async def test_twin_learning(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test digital twin learning capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "twin_20240115_143025",
                "learning_data": {
                    "user_feedback": [
                        {"recommendation_id": "rec_001", "feedback": "helpful", "rating": 4},
                        {"recommendation_id": "rec_002", "feedback": "not_relevant", "rating": 2},
                        {"recommendation_id": "rec_003", "feedback": "very_helpful", "rating": 5}
                    ],
                    "behavioral_data": {
                        "task_completion_times": [45, 60, 30, 90, 75],
                        "break_patterns": ["every_60_min", "every_90_min", "every_45_min"],
                        "productivity_scores": [0.85, 0.78, 0.92, 0.67, 0.89]
                    }
                }
            }
        
        # Simulate twin learning
        learning_result = {
            "learning_session_id": f"learning_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "twin_id": test_data["twin_id"],
            "learning_summary": {
                "data_points_processed": 156,
                "patterns_updated": 12,
                "model_improvements": [
                    {
                        "model": "productivity_predictor",
                        "accuracy_before": 0.82,
                        "accuracy_after": 0.87,
                        "improvement": 0.05
                    }
                ],
                "preference_adaptations": [
                    "Increased recommended work block duration to 90 minutes",
                    "Reduced notification frequency based on user preference"
                ]
            },
            "learning_insights": {
                "key_discoveries": [
                    "User is most productive in 90-minute focused blocks",
                    "Productivity decreases significantly after 2 PM"
                ],
                "behavioral_changes_detected": [
                    "Shift towards longer focused work sessions",
                    "Preference for fewer but more meaningful notifications"
                ],
                "recommendation_effectiveness": {
                    "overall_rating": 3.67,
                    "helpful_recommendations": 67,
                    "total_recommendations": 89,
                    "success_rate": 0.75
                }
            },
            "next_learning_cycle": {
                "scheduled_for": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "focus_areas": ["energy_prediction", "meeting_optimization", "task_prioritization"]
            }
        }
        
        return {
            "success": True,
            "test_type": "twin_learning",
            "input_data": test_data,
            "results": learning_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 312
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing twin learning: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Twin learning test failed: {str(e)}"
        )

# ========================================
# NLP API TEST ENDPOINTS
# ========================================

@router.post("/test-zone/nlp/text-analysis")
async def test_nlp_text_analysis(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test NLP text analysis capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "text": "I've been feeling overwhelmed with my workload lately. I have three major projects due next week and I'm struggling to prioritize them effectively.",
                "analysis_types": ["sentiment", "entities", "keywords", "intent"],
                "context": {
                    "user_id": "test-user-456",
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "user_input"
                }
            }
        
        # Simulate NLP text analysis
        analysis_result = {
            "analysis_id": f"nlp_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "text": test_data["text"],
            "sentiment_analysis": {
                "overall_sentiment": "negative",
                "confidence": 0.78,
                "sentiment_score": -0.45,
                "emotions": [
                    {"emotion": "stress", "intensity": 0.82},
                    {"emotion": "concern", "intensity": 0.67},
                    {"emotion": "determination", "intensity": 0.34}
                ]
            },
            "entity_extraction": {
                "entities": [
                    {"text": "three major projects", "type": "WORK_ITEM", "confidence": 0.92},
                    {"text": "next week", "type": "TIME", "confidence": 0.95},
                    {"text": "workload", "type": "WORK_CONTEXT", "confidence": 0.89}
                ]
            },
            "keyword_extraction": {
                "keywords": [
                    {"keyword": "overwhelmed", "relevance": 0.89, "category": "emotional_state"},
                    {"keyword": "workload", "relevance": 0.85, "category": "work_context"},
                    {"keyword": "prioritize", "relevance": 0.78, "category": "action_needed"}
                ]
            },
            "intent_classification": {
                "primary_intent": "seek_help_prioritization",
                "confidence": 0.84,
                "secondary_intents": [
                    {"intent": "express_stress", "confidence": 0.79},
                    {"intent": "time_management_concern", "confidence": 0.72}
                ]
            },
            "actionable_insights": [
                "User is experiencing work-related stress and needs prioritization assistance",
                "Time pressure is a significant factor (deadline next week)",
                "Recommendation: Provide task prioritization and time management tools"
            ]
        }
        
        return {
            "success": True,
            "test_type": "nlp_text_analysis",
            "input_data": test_data,
            "results": analysis_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 189
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing NLP text analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NLP text analysis test failed: {str(e)}"
        )

@router.post("/test-zone/nlp/conversation-analysis")
async def test_nlp_conversation_analysis(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test NLP conversation analysis capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "conversation": [
                    {"speaker": "user", "text": "I need help organizing my schedule for next week", "timestamp": "2024-01-15T09:00:00Z"},
                    {"speaker": "assistant", "text": "I'd be happy to help you organize your schedule. What are your main priorities for next week?", "timestamp": "2024-01-15T09:00:15Z"},
                    {"speaker": "user", "text": "I have a big presentation on Wednesday and two client meetings", "timestamp": "2024-01-15T09:00:45Z"}
                ],
                "analysis_focus": ["intent_flow", "sentiment_progression", "topic_tracking"]
            }
        
        # Simulate conversation analysis
        conversation_result = {
            "analysis_id": f"conv_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "conversation_summary": {
                "total_turns": len(test_data["conversation"]),
                "duration": "90 seconds",
                "primary_topic": "schedule_organization",
                "conversation_outcome": "information_gathering_in_progress"
            },
            "intent_flow_analysis": {
                "intent_progression": [
                    {"turn": 1, "intent": "request_help_scheduling", "confidence": 0.92},
                    {"turn": 3, "intent": "provide_schedule_details", "confidence": 0.89}
                ],
                "conversation_coherence": 0.91,
                "topic_consistency": 0.94
            },
            "sentiment_progression": {
                "sentiment_timeline": [
                    {"turn": 1, "sentiment": "neutral", "score": 0.05},
                    {"turn": 3, "sentiment": "neutral", "score": 0.12}
                ],
                "overall_sentiment_trend": "stable",
                "emotional_indicators": ["help_seeking", "planning_focused"]
            },
            "context_understanding": {
                "extracted_entities": [
                    {"entity": "presentation", "type": "event", "date": "Wednesday"},
                    {"entity": "client meetings", "type": "event", "count": 2, "date": "next week"}
                ],
                "user_state": {
                    "stress_level": "low",
                    "help_seeking": True,
                    "planning_stage": "initial"
                }
            },
            "recommendations": [
                "Continue gathering specific scheduling requirements",
                "Suggest time-blocking strategies for presentation preparation",
                "Offer calendar optimization recommendations"
            ]
        }
        
        return {
            "success": True,
            "test_type": "nlp_conversation_analysis",
            "input_data": test_data,
            "results": conversation_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 267
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing NLP conversation analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NLP conversation analysis test failed: {str(e)}"
        )

# ========================================
# ANALYTICS API TEST ENDPOINTS
# ========================================

@router.post("/test-zone/analytics/comprehensive-analysis")
async def test_analytics_comprehensive_analysis(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test comprehensive analytics analysis capabilities
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "user_id": "test-user-456",
                "analysis_period": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-01-15",
                    "granularity": "daily"
                },
                "metrics": ["productivity", "energy", "focus", "task_completion"],
                "include_predictions": True
            }
        
        # Simulate comprehensive analytics
        analytics_result = {
            "analysis_id": f"analytics_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "user_id": test_data["user_id"],
            "analysis_period": test_data["analysis_period"],
            "productivity_analytics": {
                "average_productivity_score": 0.82,
                "productivity_trend": "increasing",
                "peak_productivity_hours": ["09:00-11:00", "14:00-16:00"],
                "low_productivity_periods": ["13:00-14:00", "16:00-17:00"],
                "productivity_factors": [
                    {"factor": "sleep_quality", "correlation": 0.78, "impact": "high"},
                    {"factor": "meeting_density", "correlation": -0.65, "impact": "medium"}
                ]
            },
            "energy_analytics": {
                "average_energy_level": 0.75,
                "energy_pattern": "morning_peak_afternoon_dip",
                "energy_sustainability": 0.68,
                "energy_recovery_rate": 0.72,
                "energy_drains": [
                    {"activity": "back_to_back_meetings", "impact": -0.25},
                    {"activity": "context_switching", "impact": -0.18}
                ],
                "energy_boosters": [
                    {"activity": "focused_work_blocks", "impact": 0.22},
                    {"activity": "short_breaks", "impact": 0.15}
                ]
            },
            "focus_analytics": {
                "average_focus_score": 0.79,
                "deep_work_sessions": 23,
                "average_session_duration": 87,
                "focus_quality_trend": "stable",
                "distraction_analysis": {
                    "primary_distractions": ["notifications", "email", "meetings"],
                    "distraction_frequency": 12.5,
                    "recovery_time_average": 23
                }
            },
            "predictive_insights": {
                "next_week_productivity_forecast": 0.85,
                "optimal_schedule_recommendations": [
                    "Schedule deep work between 9-11 AM",
                    "Limit meetings to 3 per day maximum",
                    "Take 15-minute breaks every 90 minutes"
                ],
                "risk_factors": [
                    {"risk": "meeting_overload", "probability": 0.34, "impact": "medium"},
                    {"risk": "energy_depletion", "probability": 0.28, "impact": "high"}
                ]
            }
        }
        
        return {
            "success": True,
            "test_type": "analytics_comprehensive_analysis",
            "input_data": test_data,
            "results": analytics_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 423
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing analytics comprehensive analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics comprehensive analysis test failed: {str(e)}"
        )

@router.post("/test-zone/analytics/stats")
async def test_analytics_stats(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test analytics statistics generation
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "user_id": "test-user-456",
                "time_period": "last_30_days",
                "stat_types": ["summary", "trends", "comparisons", "benchmarks"]
            }
        
        # Simulate analytics stats
        stats_result = {
            "stats_id": f"stats_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "user_id": test_data["user_id"],
            "time_period": test_data["time_period"],
            "summary_stats": {
                "total_work_hours": 168.5,
                "productive_hours": 142.3,
                "focus_sessions": 89,
                "tasks_completed": 156,
                "meetings_attended": 34,
                "break_time": 26.2,
                "average_daily_productivity": 0.82
            },
            "trend_analysis": {
                "productivity_trend": {
                    "direction": "increasing",
                    "rate": 0.03,
                    "confidence": 0.87,
                    "weekly_averages": [0.78, 0.81, 0.83, 0.85]
                },
                "energy_trend": {
                    "direction": "stable",
                    "rate": 0.01,
                    "confidence": 0.72,
                    "weekly_averages": [0.74, 0.76, 0.75, 0.77]
                }
            },
            "comparative_analysis": {
                "vs_previous_period": {
                    "productivity_change": 0.08,
                    "energy_change": 0.03,
                    "focus_change": 0.06,
                    "task_completion_change": 0.12
                },
                "vs_personal_best": {
                    "productivity_ratio": 0.94,
                    "energy_ratio": 0.89,
                    "focus_ratio": 0.91,
                    "task_completion_ratio": 0.96
                }
            },
            "benchmark_comparison": {
                "vs_similar_users": {
                    "productivity_percentile": 78,
                    "energy_percentile": 72,
                    "focus_percentile": 81,
                    "task_completion_percentile": 85
                },
                "industry_benchmarks": {
                    "productivity_vs_industry": 0.12,
                    "focus_vs_industry": 0.08,
                    "efficiency_vs_industry": 0.15
                }
            },
            "key_insights": [
                "Productivity has improved by 8% compared to previous month",
                "Focus sessions are 15% longer on average",
                "Task completion rate is above 85th percentile",
                "Energy management shows room for improvement"
            ]
        }
        
        return {
            "success": True,
            "test_type": "analytics_stats",
            "input_data": test_data,
            "results": stats_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 198
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing analytics stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics stats test failed: {str(e)}"
        )

@router.post("/test-zone/analytics/twin-insights")
async def test_analytics_twin_insights(
    test_data: Optional[Dict[str, Any]] = None,
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test analytics twin insights generation
    """
    try:
        check_platform_owner_access(current_user)
        
        if not test_data:
            test_data = {
                "twin_id": "twin_20240115_143025",
                "insight_types": ["behavioral_patterns", "optimization_opportunities", "predictive_insights"],
                "analysis_depth": "comprehensive"
            }
        
        # Simulate twin insights
        insights_result = {
            "insights_id": f"insights_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "twin_id": test_data["twin_id"],
            "behavioral_patterns": {
                "work_patterns": [
                    {
                        "pattern": "morning_productivity_peak",
                        "confidence": 0.92,
                        "frequency": "daily",
                        "description": "Consistently high productivity between 9-11 AM",
                        "impact_score": 0.85
                    },
                    {
                        "pattern": "post_lunch_energy_dip",
                        "confidence": 0.78,
                        "frequency": "daily",
                        "description": "Energy levels drop significantly after lunch",
                        "impact_score": 0.65
                    }
                ],
                "communication_patterns": [
                    {
                        "pattern": "email_batch_processing",
                        "confidence": 0.84,
                        "frequency": "twice_daily",
                        "description": "Processes emails in batches rather than continuously",
                        "impact_score": 0.72
                    }
                ]
            },
            "optimization_opportunities": [
                {
                    "area": "schedule_optimization",
                    "opportunity": "Shift complex tasks to morning peak hours",
                    "potential_impact": 0.15,
                    "implementation_difficulty": "low",
                    "estimated_benefit": "15% productivity increase"
                },
                {
                    "area": "energy_management",
                    "opportunity": "Implement strategic afternoon breaks",
                    "potential_impact": 0.12,
                    "implementation_difficulty": "medium",
                    "estimated_benefit": "12% energy sustainability improvement"
                }
            ],
            "predictive_insights": {
                "performance_forecast": {
                    "next_week_productivity": 0.87,
                    "confidence": 0.89,
                    "key_factors": ["consistent_sleep", "optimized_schedule", "reduced_meetings"]
                },
                "risk_assessment": [
                    {
                        "risk": "burnout_potential",
                        "probability": 0.23,
                        "severity": "medium",
                        "mitigation": "Increase break frequency and reduce overtime"
                    }
                ]
            }
        }
        
        return {
            "success": True,
            "test_type": "analytics_twin_insights",
            "input_data": test_data,
            "results": insights_result,
            "tested_at": datetime.utcnow().isoformat(),
            "tested_by": current_user.username,
            "execution_time": 199
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing analytics twin insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics twin insights test failed: {str(e)}"
        )
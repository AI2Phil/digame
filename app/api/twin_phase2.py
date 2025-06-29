"""
API endpoints for Digital Twin Platform Phase 2: Advanced AI Features
Provides REST endpoints for conversation engine, continuous learning, and advanced analytics
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

from app.services.twin_conversation_engine import TwinConversationEngine
from app.services.continuous_learning import ContinuousLearningPipeline, ModelType, LearningPriority
from app.services.advanced_analytics import AdvancedAnalyticsEngine, AnalysisType

logger = logging.getLogger(__name__)

# Initialize services
conversation_engine = TwinConversationEngine()
learning_pipeline = ContinuousLearningPipeline()
analytics_engine = AdvancedAnalyticsEngine()

router = APIRouter(prefix="/api/twin/phase2", tags=["Digital Twin Phase 2"])

# Pydantic models for request/response
class ConversationRequest(BaseModel):
    twin_id: str
    query: str
    context: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    actions: List[str]
    context: Dict[str, Any]
    conversation_id: str

class LearningDataRequest(BaseModel):
    twin_id: str
    data_type: str
    data: Dict[str, Any]
    model_type: Optional[str] = None
    priority: Optional[str] = "medium"
    metadata: Optional[Dict[str, Any]] = None

class AnalysisRequest(BaseModel):
    twin_id: str
    data: Dict[str, Any]
    analysis_types: Optional[List[str]] = None
    time_range_days: Optional[int] = 30

class AnalysisResponse(BaseModel):
    results: Dict[str, Any]
    summary: Dict[str, Any]
    timestamp: datetime

# Conversation Engine Endpoints
@router.post("/conversation/query", response_model=ConversationResponse)
async def process_conversation_query(request: ConversationRequest):
    """
    Process a natural language query through the conversation engine
    
    Args:
        request: Conversation request with twin_id, query, and optional context
        
    Returns:
        Conversation response with intent, confidence, and actions
    """
    try:
        logger.info(f"Processing conversation query for twin {request.twin_id}")
        
        result = await conversation_engine.process_user_query(
            twin_id=request.twin_id,
            query=request.query,
            context=request.context or {}
        )
        
        return ConversationResponse(
            response=result["response"],
            intent=result["intent"],
            confidence=result["confidence"],
            actions=result["actions"],
            context=result["context"],
            conversation_id=result["conversation_id"]
        )
        
    except Exception as e:
        logger.error(f"Error processing conversation query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

@router.get("/conversation/history/{twin_id}")
async def get_conversation_history(twin_id: str, limit: int = 10):
    """
    Get conversation history for a digital twin
    
    Args:
        twin_id: Digital twin identifier
        limit: Maximum number of conversations to return
        
    Returns:
        List of recent conversations
    """
    try:
        history = await conversation_engine.get_conversation_history(twin_id, limit)
        return {"twin_id": twin_id, "history": history, "count": len(history)}
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.get("/conversation/stats/{twin_id}")
async def get_conversation_stats(twin_id: str):
    """
    Get conversation statistics for a digital twin
    
    Args:
        twin_id: Digital twin identifier
        
    Returns:
        Conversation statistics and metrics
    """
    try:
        stats = conversation_engine.get_conversation_stats(twin_id)
        return {"twin_id": twin_id, "stats": stats}
        
    except Exception as e:
        logger.error(f"Error getting conversation stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Continuous Learning Endpoints
@router.post("/learning/add-data")
async def add_learning_data(request: LearningDataRequest, background_tasks: BackgroundTasks):
    """
    Add data for continuous learning
    
    Args:
        request: Learning data request
        background_tasks: FastAPI background tasks
        
    Returns:
        Success confirmation
    """
    try:
        logger.info(f"Adding learning data for twin {request.twin_id}")
        
        # Convert string enums to proper types
        model_type = None
        if request.model_type:
            model_type_map = {
                "pattern_recognition": ModelType.PATTERN_RECOGNITION,
                "productivity_prediction": ModelType.PRODUCTIVITY_PREDICTION,
                "energy_forecasting": ModelType.ENERGY_FORECASTING,
                "task_completion": ModelType.TASK_COMPLETION,
                "behavior_analysis": ModelType.BEHAVIOR_ANALYSIS
            }
            model_type = model_type_map.get(request.model_type)
        
        priority_map = {
            "low": LearningPriority.LOW,
            "medium": LearningPriority.MEDIUM,
            "high": LearningPriority.HIGH,
            "critical": LearningPriority.CRITICAL
        }
        priority = priority_map.get(request.priority or "medium", LearningPriority.MEDIUM)
        
        # Add learning data in background
        background_tasks.add_task(
            learning_pipeline.add_learning_data,
            request.twin_id,
            request.data_type,
            request.data,
            model_type,
            priority,
            request.metadata
        )
        
        return {
            "success": True,
            "message": "Learning data added successfully",
            "twin_id": request.twin_id,
            "data_type": request.data_type
        }
        
    except Exception as e:
        logger.error(f"Error adding learning data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add learning data: {str(e)}")

@router.post("/learning/start")
async def start_learning_pipeline():
    """
    Start the continuous learning pipeline
    
    Returns:
        Success confirmation
    """
    try:
        await learning_pipeline.start_learning_pipeline()
        return {"success": True, "message": "Learning pipeline started successfully"}
        
    except Exception as e:
        logger.error(f"Error starting learning pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start pipeline: {str(e)}")

@router.post("/learning/stop")
async def stop_learning_pipeline():
    """
    Stop the continuous learning pipeline
    
    Returns:
        Success confirmation
    """
    try:
        await learning_pipeline.stop_learning_pipeline()
        return {"success": True, "message": "Learning pipeline stopped successfully"}
        
    except Exception as e:
        logger.error(f"Error stopping learning pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop pipeline: {str(e)}")

@router.get("/learning/stats")
async def get_learning_stats():
    """
    Get learning pipeline statistics
    
    Returns:
        Learning pipeline statistics
    """
    try:
        stats = learning_pipeline.get_learning_stats()
        return {"stats": stats}
        
    except Exception as e:
        logger.error(f"Error getting learning stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.get("/learning/models/{twin_id}")
async def get_model_status(twin_id: str):
    """
    Get model status for a digital twin
    
    Args:
        twin_id: Digital twin identifier
        
    Returns:
        Model status and performance metrics
    """
    try:
        status = learning_pipeline.get_model_status(twin_id)
        return {"twin_id": twin_id, "models": status}
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

# Advanced Analytics Endpoints
@router.post("/analytics/analyze", response_model=AnalysisResponse)
async def perform_analysis(request: AnalysisRequest):
    """
    Perform comprehensive analytics analysis
    
    Args:
        request: Analysis request with data and parameters
        
    Returns:
        Analysis results with insights and recommendations
    """
    try:
        logger.info(f"Performing analysis for twin {request.twin_id}")
        
        # Convert string analysis types to enum types
        analysis_types = None
        if request.analysis_types:
            type_map = {
                "productivity_analysis": AnalysisType.PRODUCTIVITY_ANALYSIS,
                "pattern_discovery": AnalysisType.PATTERN_DISCOVERY,
                "trend_analysis": AnalysisType.TREND_ANALYSIS,
                "correlation_analysis": AnalysisType.CORRELATION_ANALYSIS,
                "anomaly_detection": AnalysisType.ANOMALY_DETECTION,
                "predictive_insights": AnalysisType.PREDICTIVE_INSIGHTS,
                "behavioral_analysis": AnalysisType.BEHAVIORAL_ANALYSIS,
                "performance_optimization": AnalysisType.PERFORMANCE_OPTIMIZATION
            }
            analysis_types = [type_map[t] for t in request.analysis_types if t in type_map]
        
        # Set time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=request.time_range_days or 30)
        time_range = (start_time, end_time)
        
        # Perform analysis
        results = await analytics_engine.perform_comprehensive_analysis(
            twin_id=request.twin_id,
            data=request.data,
            analysis_types=analysis_types,
            time_range=time_range
        )
        
        # Generate summary
        total_insights = sum(len(result.insights) for result in results.values() if hasattr(result, 'insights'))
        total_recommendations = sum(len(result.recommendations) for result in results.values() if hasattr(result, 'recommendations'))
        avg_confidence = sum(result.confidence for result in results.values() if hasattr(result, 'confidence')) / len(results) if results else 0
        
        summary = {
            "total_analyses": len(results),
            "total_insights": total_insights,
            "total_recommendations": total_recommendations,
            "average_confidence": avg_confidence,
            "analysis_types": list(results.keys())
        }
        
        return AnalysisResponse(
            results=results,
            summary=summary,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error performing analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to perform analysis: {str(e)}")

@router.get("/analytics/stats")
async def get_analytics_stats():
    """
    Get analytics engine statistics
    
    Returns:
        Analytics engine statistics
    """
    try:
        stats = analytics_engine.get_analytics_stats()
        return {"stats": stats}
        
    except Exception as e:
        logger.error(f"Error getting analytics stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.get("/analytics/insights/{twin_id}")
async def get_twin_insights_summary(twin_id: str):
    """
    Get insights summary for a digital twin
    
    Args:
        twin_id: Digital twin identifier
        
    Returns:
        Summary of insights for the twin
    """
    try:
        summary = analytics_engine.get_twin_insights_summary(twin_id)
        return {"twin_id": twin_id, "insights_summary": summary}
        
    except Exception as e:
        logger.error(f"Error getting insights summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")

# Combined Phase 2 Status Endpoint
@router.get("/status")
async def get_phase2_status():
    """
    Get overall Phase 2 system status
    
    Returns:
        Status of all Phase 2 components
    """
    try:
        conversation_stats = conversation_engine.get_conversation_stats("system")
        learning_stats = learning_pipeline.get_learning_stats()
        analytics_stats = analytics_engine.get_analytics_stats()
        
        return {
            "phase": "Phase 2: Advanced AI Features",
            "status": "operational",
            "components": {
                "conversation_engine": {
                    "status": "active",
                    "stats": conversation_stats
                },
                "continuous_learning": {
                    "status": "active" if learning_stats["is_running"] else "inactive",
                    "stats": learning_stats
                },
                "advanced_analytics": {
                    "status": "active",
                    "stats": analytics_stats
                }
            },
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error getting Phase 2 status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check for Phase 2 services
    
    Returns:
        Health status of all services
    """
    try:
        health_status = {
            "conversation_engine": "healthy",
            "continuous_learning": "healthy" if learning_pipeline.is_running else "stopped",
            "advanced_analytics": "healthy",
            "overall": "healthy",
            "timestamp": datetime.utcnow()
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "conversation_engine": "error",
            "continuous_learning": "error",
            "advanced_analytics": "error",
            "overall": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }
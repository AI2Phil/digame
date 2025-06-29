"""
Digital Twin Router - API endpoints for digital twin functionality
Provides REST API access to digital twin operations and insights
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.services.digital_twin_engine import DigitalTwinEngine
from app.crud.digital_twin_crud import get_digital_twin, get_user_twins, get_twin_statistics
from app.models.user import User
from app.auth.auth_dependencies import get_current_user

router = APIRouter(prefix="/api/digital-twin", tags=["Digital Twin"])

# Pydantic models for request/response
class TwinInitRequest(BaseModel):
    name: Optional[str] = Field(None, description="Custom name for the digital twin")

class ActivityDataRequest(BaseModel):
    activities: List[Dict[str, Any]] = Field(..., description="List of activity data")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of the activity")
    productivity_score: Optional[float] = Field(None, description="Productivity score (0-10)")
    duration: Optional[int] = Field(None, description="Duration in minutes")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context data")

class PredictionRequest(BaseModel):
    prediction_type: str = Field(..., description="Type of prediction: productivity, tasks, energy, comprehensive")
    time_horizon: int = Field(7, description="Number of days to predict ahead (1-30)")

class TwinInteractionRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User query or message")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional context information")

class TwinResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

def get_user_id(user: User) -> int:
    """Helper function to safely extract user ID from SQLAlchemy model"""
    try:
        # Handle SQLAlchemy column access
        return int(str(user.id))
    except (ValueError, TypeError):
        # Fallback for direct access - convert to int
        return int(str(user.id))

@router.post("/initialize", response_model=TwinResponse)
async def initialize_twin(
    request: TwinInitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initialize a new digital twin for the current user
    """
    try:
        engine = DigitalTwinEngine(db)
        result = await engine.initialize_twin(
            user_id=get_user_id(current_user),
            name=request.name
        )
        
        return TwinResponse(
            success=result["success"],
            message=result.get("message"),
            data=result if result["success"] else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize digital twin: {str(e)}"
        )

@router.get("/status", response_model=TwinResponse)
async def get_twin_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's digital twin status and basic information
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Get twin statistics
        stats = get_twin_statistics(db, str(twin.id))
        
        return TwinResponse(
            success=True,
            data={
                "twin_id": twin.id,
                "name": twin.name,
                "status": twin.status,
                "learning_progress": float(str(twin.learning_progress)) if twin.learning_progress else 0.0,
                "accuracy_score": float(str(twin.accuracy_score)) if twin.accuracy_score else 0.0,
                "model_version": twin.model_version,
                "last_training": twin.last_training_at.isoformat() if twin.last_training_at else None,
                "created_at": twin.created_at.isoformat() if twin.created_at else None,
                "statistics": stats
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get twin status: {str(e)}"
        )

@router.post("/activity", response_model=TwinResponse)
async def process_activity_data(
    request: ActivityDataRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process new activity data for the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        engine = DigitalTwinEngine(db)
        
        # Convert request to activity data format
        activity_data = {
            "activities": request.activities,
            "timestamp": request.timestamp or datetime.utcnow(),
            "productivity_score": request.productivity_score,
            "duration": request.duration,
            "context": request.context or {}
        }
        
        result = await engine.process_activity_data(str(twin.id), activity_data)
        
        return TwinResponse(
            success=result["success"],
            message=result.get("message"),
            data=result if result["success"] else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process activity data: {str(e)}"
        )

@router.post("/predictions", response_model=TwinResponse)
async def generate_predictions(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate predictions for the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Validate prediction type
        valid_types = ["productivity", "tasks", "energy", "comprehensive"]
        if request.prediction_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid prediction type. Must be one of: {', '.join(valid_types)}"
            )
        
        engine = DigitalTwinEngine(db)
        result = await engine.generate_predictions(
            str(twin.id),
            request.prediction_type,
            request.time_horizon
        )
        
        return TwinResponse(
            success=result["success"],
            message=result.get("message"),
            data=result if result["success"] else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictions: {str(e)}"
        )

@router.get("/insights", response_model=TwinResponse)
async def get_twin_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive insights from the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        engine = DigitalTwinEngine(db)
        insights = await engine.get_twin_insights(str(twin.id))
        
        if "success" in insights and not insights["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=insights.get("message", "Failed to get twin insights")
            )
        
        return TwinResponse(
            success=True,
            data=insights
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get twin insights: {str(e)}"
        )

@router.post("/interact", response_model=TwinResponse)
async def interact_with_twin(
    request: TwinInteractionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interact with the user's digital twin using natural language
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        engine = DigitalTwinEngine(db)
        result = await engine.interact_with_twin(
            str(twin.id),
            request.query,
            request.context
        )
        
        return TwinResponse(
            success=result["success"],
            message=result.get("message"),
            data=result if result["success"] else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to interact with twin: {str(e)}"
        )

@router.get("/health", response_model=TwinResponse)
async def get_twin_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the health score and status of the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        engine = DigitalTwinEngine(db)
        health_score = await engine._calculate_twin_health(str(twin.id))
        
        # Determine health status based on score
        if health_score >= 0.8:
            health_status = "excellent"
        elif health_score >= 0.6:
            health_status = "good"
        elif health_score >= 0.4:
            health_status = "fair"
        elif health_score >= 0.2:
            health_status = "poor"
        else:
            health_status = "critical"
        
        return TwinResponse(
            success=True,
            data={
                "health_score": health_score,
                "health_status": health_status,
                "twin_id": twin.id,
                "last_updated": datetime.utcnow().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get twin health: {str(e)}"
        )

@router.delete("/", response_model=TwinResponse)
async def delete_twin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the user's digital twin and all associated data
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found."
            )
        
        from app.crud.digital_twin_crud import delete_digital_twin
        success = delete_digital_twin(db, str(twin.id))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete digital twin"
            )
        
        return TwinResponse(
            success=True,
            message="Digital twin successfully deleted",
            data={"deleted_twin_id": twin.id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete twin: {str(e)}"
        )

# Additional utility endpoints
@router.get("/patterns", response_model=TwinResponse)
async def get_twin_patterns(
    pattern_type: Optional[str] = None,
    limit: Optional[int] = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity patterns discovered by the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        from app.crud.digital_twin_crud import get_twin_patterns
        patterns = get_twin_patterns(db, str(twin.id), pattern_type, limit)
        
        # Convert patterns to serializable format
        pattern_data = []
        for pattern in patterns:
            pattern_data.append({
                "id": pattern.id,
                "pattern_type": pattern.pattern_type,
                "pattern_data": pattern.pattern_data,
                "confidence_score": float(str(pattern.confidence_score)) if pattern.confidence_score else None,
                "frequency_score": float(str(pattern.frequency_score)) if pattern.frequency_score else None,
                "impact_score": float(str(pattern.impact_score)) if pattern.impact_score else None,
                "discovered_at": pattern.discovered_at.isoformat() if pattern.discovered_at else None,
                "validated_at": pattern.validated_at.isoformat() if pattern.validated_at else None
            })
        
        return TwinResponse(
            success=True,
            data={
                "patterns": pattern_data,
                "total_count": len(pattern_data),
                "filter_applied": {
                    "pattern_type": pattern_type,
                    "limit": limit
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get twin patterns: {str(e)}"
        )

@router.get("/interactions", response_model=TwinResponse)
async def get_twin_interactions(
    interaction_type: Optional[str] = None,
    limit: Optional[int] = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent interactions with the user's digital twin
    """
    try:
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        from app.crud.digital_twin_crud import get_twin_interactions
        interactions = get_twin_interactions(db, str(twin.id), interaction_type, limit)
        
        # Convert interactions to serializable format
        interaction_data = []
        for interaction in interactions:
            interaction_data.append({
                "id": interaction.id,
                "interaction_type": interaction.interaction_type,
                "input_data": interaction.input_data,
                "response_data": interaction.response_data,
                "processing_time_ms": interaction.processing_time_ms,
                "user_feedback": interaction.user_feedback,
                "created_at": interaction.created_at.isoformat() if interaction.created_at else None
            })
        
        return TwinResponse(
            success=True,
            data={
                "interactions": interaction_data,
                "total_count": len(interaction_data),
                "filter_applied": {
                    "interaction_type": interaction_type,
                    "limit": limit
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get twin interactions: {str(e)}"
        )
"""
Digital Twin API Router
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.auth.auth_dependencies import get_current_user
from app.models.user import User as SQLAlchemyUser
from app.services.digital_twin_engine import DigitalTwinEngine
from app.crud.digital_twin_crud import DigitalTwinCRUD
from app.schemas.digital_twin_schemas import (
    DigitalTwinCreate, DigitalTwinUpdate, DigitalTwinResponse,
    DigitalTwinListResponse, ActivityPatternCreate, ActivityPatternResponse,
    ActivityPatternListResponse, TwinInteractionCreate, TwinInteractionResponse,
    TwinInsightsResponse, ActivityDataInput, TwinChatMessage, TwinChatResponse,
    TwinDashboardData
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/digital-twins", tags=["Digital Twins"])

# Dependency to get Digital Twin Engine
def get_twin_engine(db: Session = Depends(get_db)) -> DigitalTwinEngine:
    return DigitalTwinEngine(db)

# Dependency to get Digital Twin CRUD
def get_twin_crud(db: Session = Depends(get_db)) -> DigitalTwinCRUD:
    return DigitalTwinCRUD(db)

@router.post("/", response_model=DigitalTwinResponse, status_code=status.HTTP_201_CREATED)
async def create_digital_twin(
    twin_data: DigitalTwinCreate,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_engine: DigitalTwinEngine = Depends(get_twin_engine)
):
    """Create a new digital twin for the current user"""
    try:
        twin = await twin_engine.initialize_twin(
            user_id=current_user.id,
            name=twin_data.name
        )
        return twin
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating digital twin: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create digital twin")

@router.get("/", response_model=DigitalTwinListResponse)
async def list_digital_twins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """List all digital twins for the current user"""
    try:
        twins = twin_crud.get_digital_twins_by_user(current_user.id, skip=skip, limit=limit)
        total = len(twins)  # For simplicity, not implementing separate count query
        
        return DigitalTwinListResponse(
            twins=twins,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        logger.error(f"Error listing digital twins: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list digital twins")

@router.get("/{twin_id}", response_model=DigitalTwinResponse)
async def get_digital_twin(
    twin_id: str,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Get a specific digital twin"""
    try:
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        # Check ownership
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return twin
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting digital twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get digital twin")

@router.put("/{twin_id}", response_model=DigitalTwinResponse)
async def update_digital_twin(
    twin_id: str,
    twin_data: DigitalTwinUpdate,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Update a digital twin"""
    try:
        # Check ownership first
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        updated_twin = twin_crud.update_digital_twin(twin_id, twin_data)
        if not updated_twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        return updated_twin
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating digital twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update digital twin")

@router.delete("/{twin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_digital_twin(
    twin_id: str,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Delete a digital twin"""
    try:
        # Check ownership first
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        success = twin_crud.delete_digital_twin(twin_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting digital twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete digital twin")

@router.get("/{twin_id}/insights", response_model=TwinInsightsResponse)
async def get_twin_insights(
    twin_id: str,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_engine: DigitalTwinEngine = Depends(get_twin_engine),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Get comprehensive insights from a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        insights = await twin_engine.get_twin_insights(twin_id)
        return insights
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting insights for twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get twin insights")

@router.post("/{twin_id}/activity", status_code=status.HTTP_202_ACCEPTED)
async def process_activity_data(
    twin_id: str,
    activity_data: ActivityDataInput,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_engine: DigitalTwinEngine = Depends(get_twin_engine),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Process new activity data for a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        result = await twin_engine.process_activity_data(twin_id, activity_data.dict())
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing activity data for twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process activity data")

@router.post("/{twin_id}/chat", response_model=TwinChatResponse)
async def chat_with_twin(
    twin_id: str,
    chat_message: TwinChatMessage,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_engine: DigitalTwinEngine = Depends(get_twin_engine),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Chat with a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        response = await twin_engine.interact_with_twin(
            twin_id=twin_id,
            query=chat_message.message,
            context=chat_message.context
        )
        
        # Convert response to match schema
        return TwinChatResponse(
            query=chat_message.message,
            intent={"intent": response.get("intent", "general"), "confidence": response.get("confidence", 0.8)},
            entities=[],
            response=response,
            actions=[],
            confidence=response.get("confidence", 0.8),
            context_used=chat_message.context or {}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error chatting with twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to chat with twin")

@router.get("/{twin_id}/patterns", response_model=ActivityPatternListResponse)
async def get_activity_patterns(
    twin_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    pattern_type: Optional[str] = Query(None),
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Get activity patterns for a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        if pattern_type:
            patterns = twin_crud.get_activity_patterns_by_type(twin_id, pattern_type)
        else:
            patterns = twin_crud.get_activity_patterns(twin_id, skip=skip, limit=limit)
        
        return ActivityPatternListResponse(
            patterns=patterns,
            total=len(patterns),
            page=skip // limit + 1,
            size=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patterns for twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get activity patterns")

@router.get("/{twin_id}/dashboard", response_model=TwinDashboardData)
async def get_twin_dashboard_data(
    twin_id: str,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Get comprehensive dashboard data for a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Get dashboard data
        recent_patterns = twin_crud.get_activity_patterns(twin_id, limit=5)
        recent_interactions = twin_crud.get_twin_interactions(twin_id, limit=5)
        statistics = twin_crud.get_twin_statistics(twin_id)
        recent_summary = twin_crud.get_recent_activity_summary(twin_id)
        
        return TwinDashboardData(
            twin=twin,
            recent_patterns=recent_patterns,
            recent_interactions=recent_interactions,
            learning_metrics={
                "learning_progress": twin.learning_progress,
                "accuracy_score": twin.accuracy_score,
                "patterns_discovered": statistics["patterns_discovered"],
                "total_interactions": statistics["total_interactions"]
            },
            performance_metrics={
                "processing_rate": statistics["processing_rate"],
                "recent_patterns": recent_summary["new_patterns"],
                "recent_interactions": recent_summary["interactions"]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard data for twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get dashboard data")

@router.get("/{twin_id}/statistics")
async def get_twin_statistics(
    twin_id: str,
    current_user: SQLAlchemyUser = Depends(get_current_user),
    twin_crud: DigitalTwinCRUD = Depends(get_twin_crud)
):
    """Get statistics for a digital twin"""
    try:
        # Check ownership
        twin = twin_crud.get_digital_twin(twin_id)
        if not twin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital twin not found")
        
        if twin.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        statistics = twin_crud.get_twin_statistics(twin_id)
        recent_summary = twin_crud.get_recent_activity_summary(twin_id)
        
        return {
            "twin_id": twin_id,
            "statistics": statistics,
            "recent_activity": recent_summary
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting statistics for twin {twin_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get statistics")
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from ..models.user import User as SQLAlchemyUser
from ..models.behavior_model import BehavioralModel, BehavioralPattern
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from ..db import get_db
from ..services.pattern_recognition_service import (
    categorize_pattern,
    generate_pattern_label,
    detect_anomalies,
    analyze_temporal_patterns
)
from ..services.visualization_service import (
    generate_pattern_heatmap,
    generate_pattern_sankey,
    generate_pattern_radar,
    generate_pattern_timeline
)
from ..crud.behavior_model_crud import get_behavioral_model, get_patterns_for_model

# --- Schemas ---
class PatternLabelRequest(BaseModel):
    pattern_id: int

class PatternLabelResponse(BaseModel):
    pattern_id: int
    label: str
    category: str

class AnomalyDetectionRequest(BaseModel):
    model_id: Optional[int] = None
    threshold: float = 2.0
    time_window: Optional[int] = None  # Time window in days

class AnomalyResponse(BaseModel):
    user_id: int
    activity_id: int
    anomaly_type: str
    description: str
    severity: str
    detected_at: datetime
    metadata: Dict[str, Any]

class TemporalPatternResponse(BaseModel):
    daily_patterns: Dict[str, Any]
    weekly_patterns: Dict[str, Any]
    hourly_patterns: Dict[str, Any]
    pattern_transitions: List[Any]
    productivity_insights: Dict[str, Any]

# --- Router ---
router = APIRouter(
    tags=["Pattern Recognition"],
)

@router.post("/patterns/{pattern_id}/label", 
             response_model=PatternLabelResponse,
             dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def get_pattern_label(
    pattern_id: int,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Generate a human-readable label for a behavioral pattern.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Get the pattern
    pattern = db.query(BehavioralPattern).filter(BehavioralPattern.id == pattern_id).first()
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pattern with ID {pattern_id} not found."
        )
    
    # Check if the pattern belongs to a model owned by the current user
    model = db.query(BehavioralModel).filter(BehavioralModel.id == pattern.model_id).first()
    if not model or model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this pattern."
        )
    
    # Generate label and category
    label = generate_pattern_label(pattern)
    category = categorize_pattern(pattern)
    
    return PatternLabelResponse(
        pattern_id=pattern.id,
        label=label,
        category=category
    )

@router.post("/anomalies/detect", 
             response_model=List[AnomalyResponse],
             dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def detect_user_anomalies(
    request: AnomalyDetectionRequest,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Detect anomalies in user behavior based on deviation from established patterns.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Detect anomalies
    anomalies = detect_anomalies(
        db=db,
        user_id=current_user.id,
        model_id=request.model_id,
        threshold=request.threshold,
        time_window=request.time_window
    )
    
    return anomalies

@router.get("/temporal-patterns", 
            response_model=TemporalPatternResponse,
            dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def get_temporal_patterns(
    model_id: Optional[int] = Query(None, description="ID of the behavioral model to analyze"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Analyze temporal patterns in user behavior.
    Requires 'view_own_behavior_patterns' permission.
    """
    # If model_id is provided, check if it belongs to the current user
    if model_id:
        model = get_behavioral_model(db, model_id)
        if not model or model.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this model."
            )
    
    # Analyze temporal patterns
    patterns = analyze_temporal_patterns(
        db=db,
        user_id=current_user.id,
        model_id=model_id
    )
    
    if "error" in patterns:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=patterns["error"]
        )
    
    return patterns

@router.get("/models/{model_id}/patterns", 
            response_model=List[Dict[str, Any]],
            dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def get_patterns_with_labels(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Get patterns for a behavioral model with human-readable labels and categories.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Check if the model belongs to the current user
    model = get_behavioral_model(db, model_id)
    if not model or model.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this model."
        )
    
    # Get patterns for the model
    patterns = get_patterns_for_model(db, model_id)
    
    # Add labels and categories
    result = []
    for pattern in patterns:
        pattern_dict = {
            "id": pattern.id,
            "model_id": pattern.model_id,
            "pattern_label": pattern.pattern_label,
            "size": pattern.size,
            "name": pattern.name,
            "description": pattern.description,
            "centroid": pattern.centroid,
            "representative_activities": pattern.representative_activities,
            "temporal_distribution": pattern.temporal_distribution,
            "activity_distribution": pattern.activity_distribution,
            "context_features": pattern.context_features,
            "human_readable_label": generate_pattern_label(pattern),
            "category": categorize_pattern(pattern)
        }
        result.append(pattern_dict)
    
    return result

@router.get("/visualizations/heatmap")
async def get_pattern_heatmap(
    user_id: int,
    model_id: Optional[int] = None,
    time_window: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    permission: bool = Depends(PermissionChecker("view_own_behavior_patterns"))
):
    """
    Generate a heatmap visualization of behavioral patterns by hour and day.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Check if user_id matches current user or if current user has admin permissions
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data."
        )
        
    return generate_pattern_heatmap(db, user_id, model_id, time_window)

@router.get("/visualizations/sankey")
async def get_pattern_sankey(
    user_id: int,
    model_id: Optional[int] = None,
    time_window: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    permission: bool = Depends(PermissionChecker("view_own_behavior_patterns"))
):
    """
    Generate a Sankey diagram visualization of transitions between behavioral patterns.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Check if user_id matches current user or if current user has admin permissions
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data."
        )
        
    return generate_pattern_sankey(db, user_id, model_id, time_window)

@router.get("/visualizations/radar")
async def get_pattern_radar(
    user_id: int,
    model_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    permission: bool = Depends(PermissionChecker("view_own_behavior_patterns"))
):
    """
    Generate a radar chart visualization of behavioral pattern categories.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Check if user_id matches current user or if current user has admin permissions
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data."
        )
        
    return generate_pattern_radar(db, user_id, model_id)

@router.get("/visualizations/timeline")
async def get_pattern_timeline(
    user_id: int,
    days: int = 7,
    model_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    permission: bool = Depends(PermissionChecker("view_own_behavior_patterns"))
):
    """
    Generate a timeline visualization of behavioral patterns over time.
    Requires 'view_own_behavior_patterns' permission.
    """
    # Check if user_id matches current user or if current user has admin permissions
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's data."
        )
        
    return generate_pattern_timeline(db, user_id, days, model_id)
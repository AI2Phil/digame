from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/behavior", tags=["behavior"])

@router.post("/train", status_code=status.HTTP_202_ACCEPTED)
async def train_behavior(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start behavior training for the current user.
    """
    try:
        # Ensure user is active
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )
        
        # Implementation here - for now just return success
        return {
            "message": "Training started",
            "status": "training_started",
            "user_id": current_user.id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start training"
        )

@router.get("/patterns")
async def get_patterns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get behavior patterns for the current user.
    """
    try:
        # Ensure user is active
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )
        
        # Implementation here - for now just return empty patterns
        return {"patterns": []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patterns"
        )
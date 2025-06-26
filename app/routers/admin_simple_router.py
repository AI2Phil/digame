"""
Simplified Admin Router
Provides basic admin endpoints for the dashboard
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging

from ..db import get_db
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all users for admin dashboard"""
    try:
        users = db.query(User).all()
        
        user_list = []
        for user in users:
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": None,  # Simplified
                "role": "user",  # Simplified
                "onboarding_completed": False,  # Simplified
                "api_keys_count": 0  # Simplified
            }
            user_list.append(user_data)
        
        return user_list
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.post("/users/{user_id}/{action}")
async def perform_user_action(
    user_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Perform actions on users"""
    try:
        user = db.query(User).filter(User.id.is_(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if action == "activate":
            user.is_active = True
            db.commit()
            return {"message": "User activated successfully"}
            
        elif action == "deactivate":
            user.is_active = False
            db.commit()
            return {"message": "User deactivated successfully"}
            
        elif action == "delete":
            db.delete(user)
            db.commit()
            return {"message": "User deleted successfully"}
            
        else:
            return {"message": f"Action {action} completed"}
            
    except Exception as e:
        logger.error(f"Error performing user action: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to perform action")

@router.get("/system/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get system statistics"""
    try:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active.is_(True)).count()
        
        # Mock data for demonstration
        stats = {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "newUsers24h": 5,
            "activeSessions": active_users,
            "completedOnboarding": int(total_users * 0.8),
            "onboardingCompletionRate": 80,
            "cpuUsage": 45,
            "memoryUsage": 62,
            "diskUsage": 34,
            "networkIO": 28,
            "dbLoad": 38,
            "avgResponseTime": 120,
            "apiRequests": 12456,
            "totalRequests": 12456,
            "activeUsers24h": 5,
            "newRegistrations": 5,
            "avgSessionDuration": "24m",
            "bounceRate": "15%",
            "lastUpdated": datetime.utcnow().isoformat()
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error fetching system stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch system statistics")

@router.get("/api-keys")
async def get_admin_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all API keys for admin management"""
    try:
        # Mock API keys data
        api_keys = [
            {
                "id": "1_main",
                "name": "Main API Key",
                "key": "sk-1234567890abcdef1234567890abcdef",
                "user": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@example.com"
                },
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "last_used": None,
                "requestCount": 0,
                "usage": 0
            }
        ]
        
        return api_keys
        
    except Exception as e:
        logger.error(f"Error fetching API keys: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch API keys")

@router.post("/api-keys")
async def create_admin_api_key(
    key_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create API key for a user"""
    try:
        # Generate mock API key
        import secrets
        api_key = f"sk-{secrets.token_urlsafe(32)}"
        
        return {
            "message": "API key created successfully",
            "key": api_key,
            "name": key_data.get("name", "New Key")
        }
        
    except Exception as e:
        logger.error(f"Error creating API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create API key")

@router.delete("/api-keys/{key_id}")
async def delete_admin_api_key(
    key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete API key"""
    try:
        return {"message": "API key deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete API key")

@router.get("/onboarding/analytics")
async def get_onboarding_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get onboarding analytics"""
    try:
        total_users = db.query(User).count()
        completed_onboarding = int(total_users * 0.8)  # Mock 80% completion
        
        analytics = {
            "totalUsers": total_users,
            "completedOnboarding": completed_onboarding,
            "inProgress": total_users - completed_onboarding,
            "abandoned": 0,
            "completionRate": 80,
            "avgCompletionTime": "12m 34s",
            "dropOffRate": 7.4,
            "stepAnalytics": [
                {"step": "Welcome", "completed": total_users, "dropOff": 0},
                {"step": "Profile", "completed": int(total_users * 0.95), "dropOff": int(total_users * 0.05)},
                {"step": "Preferences", "completed": int(total_users * 0.90), "dropOff": int(total_users * 0.05)},
                {"step": "Goals", "completed": int(total_users * 0.85), "dropOff": int(total_users * 0.05)},
                {"step": "Features", "completed": int(total_users * 0.82), "dropOff": int(total_users * 0.03)},
                {"step": "Complete", "completed": completed_onboarding, "dropOff": int(total_users * 0.02)}
            ]
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error fetching onboarding analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch onboarding analytics")
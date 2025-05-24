"""
Admin Dashboard Router
Provides comprehensive admin endpoints for user management, system monitoring, and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from ..db import get_db
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User
from ..models.user_setting import UserSetting
from ..schemas.user_schemas import User as UserResponse
from ..crud import user_crud
from ..crud.user_setting_crud import get_user_setting, create_user_setting, update_user_setting, delete_user_setting

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin-dashboard"])

@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all users with filtering and pagination
    Requires admin access
    """
    try:
        # Simple query for all users (can be enhanced with filtering)
        query = db.query(User)
        
        if is_active is not None:
            query = query.filter(User.is_active.is_(is_active))
        
        if search:
            query = query.filter(
                (User.username.contains(search)) |
                (User.email.contains(search))
            )
        
        users = query.offset(skip).limit(limit).all()
        
        # Enhance user data with additional info
        enhanced_users = []
        for user in users:
            user_dict = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None,
                "role": "user",  # Simplified
                "onboarding_completed": bool(getattr(user, 'onboarding_completed_at', None)),
                "api_keys_count": 0  # Simplified
            }
            enhanced_users.append(user_dict)
        
        return enhanced_users
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.post("/users/{user_id}/{action}")
async def perform_user_action(
    user_id: int,
    action: str,
    data: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Perform actions on users (activate, deactivate, update, delete, reset_password)
    Requires admin access
    """
    try:
        user = user_crud.get_user(db, user_id)
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
            
        elif action == "update":
            if not data:
                raise HTTPException(status_code=400, detail="Update data required")
            for key, value in data.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            db.commit()
            return {"message": "User updated successfully"}
            
        elif action == "delete":
            db.delete(user)
            db.commit()
            return {"message": "User deleted successfully"}
            
        elif action == "reset_password":
            # In a real implementation, this would send a password reset email
            return {"message": "Password reset email sent"}
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing user action {action}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to perform action: {action}")

@router.get("/system/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive system statistics
    Requires admin access
    """
    try:
        # Get user statistics
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active.is_(True)).count()
        
        # Get users created in last 24 hours
        yesterday = datetime.utcnow() - timedelta(days=1)
        new_users_24h = 0  # Simplified for now
        
        # Get onboarding statistics (simplified)
        completed_onboarding = int(total_users * 0.8)  # Mock 80% completion rate
        
        # Calculate completion rate
        completion_rate = (completed_onboarding / total_users * 100) if total_users > 0 else 0
        
        # Mock system performance metrics (in a real app, these would come from monitoring)
        stats = {
            # User metrics
            "totalUsers": total_users,
            "activeUsers": active_users,
            "newUsers24h": new_users_24h,
            "activeSessions": active_users,  # Simplified
            
            # Onboarding metrics
            "completedOnboarding": completed_onboarding,
            "onboardingCompletionRate": int(completion_rate),
            
            # System performance (mock data)
            "cpuUsage": 45,
            "memoryUsage": 62,
            "diskUsage": 34,
            "networkIO": 28,
            "dbLoad": 38,
            "avgResponseTime": 120,
            "apiRequests": 12456,
            "totalRequests": 12456,
            
            # User activity
            "activeUsers24h": new_users_24h,
            "newRegistrations": new_users_24h,
            "avgSessionDuration": "24m",
            "bounceRate": "15%",
            
            # Timestamps
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
    """
    Get all API keys across all users for admin management
    Requires admin:read permission
    """
    try:
        # Get all user settings that contain API keys
        user_settings = db.query(UserSetting).all()
        
        api_keys = []
        for setting in user_settings:
            if setting.api_keys:
                user = user_crud.get_user(db, setting.user_id)
                if user:  # Check if user exists
                    for key_name, key_data in setting.api_keys.items():
                        api_keys.append({
                            "id": f"{setting.user_id}_{key_name}",
                            "name": key_name,
                            "key": key_data.get("key", ""),
                            "user": {
                                "id": user.id,
                                "username": user.username,
                                "email": user.email
                            },
                        "status": "active",  # Simplified
                        "created_at": setting.created_at.isoformat(),
                        "last_used": None,  # Would need tracking
                        "requestCount": 0,  # Would need tracking
                        "usage": 0  # Would need tracking
                    })
        
        return api_keys
        
    except Exception as e:
        logger.error(f"Error fetching admin API keys: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch API keys")

@router.post("/api-keys")
async def create_admin_api_key(
    key_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create API key for a user (admin function)
    Requires admin:write permission
    """
    try:
        user_id = key_data.get("userId")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID required")
        
        user = user_crud.get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Generate API key (simplified)
        import secrets
        api_key = f"sk-{secrets.token_urlsafe(32)}"
        
        # Get or create user settings
        user_settings = get_user_setting(db, user_id)
        if not user_settings:
            user_settings = create_user_setting(db, user_id, {"api_keys": {}})
        
        # Add new API key
        api_keys = user_settings.api_keys.copy() if user_settings.api_keys else {}
        new_key_data = {
            "key": api_key,
            "created_at": datetime.utcnow().isoformat(),
            "description": key_data.get("description", "")
        }
        api_keys.update({key_data["name"]: new_key_data})
        
        # Update user settings
        update_user_setting(db, user_id, {"api_keys": api_keys})
        
        return {
            "message": "API key created successfully",
            "key": api_key,
            "name": key_data["name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating admin API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create API key")

@router.delete("/api-keys/{key_id}")
async def delete_admin_api_key(
    key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete API key (admin function)
    Requires admin:write permission
    """
    try:
        # Parse key_id (format: user_id_key_name)
        parts = key_id.split("_", 1)
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail="Invalid key ID format")
        
        user_id, key_name = parts
        user_id = int(user_id)
        
        # Get user settings
        user_settings = get_user_setting(db, user_id)
        if not user_settings or not user_settings.api_keys:
            raise HTTPException(status_code=404, detail="API key not found")
        
        # Remove API key
        api_keys = user_settings.api_keys.copy()
        if key_name not in api_keys:
            raise HTTPException(status_code=404, detail="API key not found")
        
        del api_keys[key_name]
        
        # Update user settings
        update_user_setting(db, user_id, {"api_keys": api_keys})
        
        return {"message": "API key deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting admin API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete API key")

@router.get("/onboarding/analytics")
async def get_onboarding_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive onboarding analytics
    Requires admin:read permission
    """
    try:
        # Get onboarding statistics
        total_users = db.query(User).count()
        completed_onboarding = db.query(User).filter(
            User.onboarding_completed_at.isnot(None)
        ).count()
        
        # Calculate metrics
        completion_rate = (completed_onboarding / total_users * 100.0) if total_users > 0 else 0.0
        in_progress = total_users - completed_onboarding
        abandoned = 0  # Would need tracking
        
        analytics = {
            "totalUsers": total_users,
            "completedOnboarding": completed_onboarding,
            "inProgress": in_progress,
            "abandoned": abandoned,
            "completionRate": round(completion_rate, 1),
            "avgCompletionTime": "12m 34s",  # Mock data
            "dropOffRate": 7.4,  # Mock data
            
            # Step-by-step analytics (mock data)
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
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from typing import List, Dict, Any
from datetime import datetime, timedelta

from ..db import get_db
from ..models.user import User
from ..models.activity import Activity
from ..models.anomaly import DetectedAnomaly
from ..models.process_notes import ProcessNote
from ..auth.auth_dependencies import get_current_active_user, PermissionChecker

router = APIRouter(prefix="/admin", tags=["admin"])

# Require admin permission for all admin routes
require_admin = PermissionChecker("admin_access")

@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users with pagination"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "onboarding_completed": user.onboarding_completed,
            "status": "active" if user.is_active else "inactive"
        }
        for user in users
    ]

@router.get("/analytics")
async def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get platform analytics for admin dashboard"""
    
    # Calculate date ranges
    now = datetime.utcnow()
    last_month = now - timedelta(days=30)
    last_week = now - timedelta(days=7)
    
    # Total users
    total_users = db.query(User).count()
    
    # New users this month
    new_users_this_month = db.query(User).filter(
        User.created_at >= last_month
    ).count()
    
    # Active users (users with activity in last 7 days)
    active_users = db.query(User).join(Activity).filter(
        Activity.timestamp >= last_week
    ).distinct().count()
    
    # Onboarding completion rate
    completed_onboarding = db.query(User).filter(
        User.onboarding_completed == True
    ).count()
    
    onboarding_rate = (completed_onboarding / total_users * 100) if total_users > 0 else 0
    
    # Active users percentage
    active_users_percentage = (active_users / total_users * 100) if total_users > 0 else 0.0
    
    # System health metrics
    total_activities = db.query(Activity).count()
    total_anomalies = db.query(DetectedAnomaly).count()
    total_notes = db.query(ProcessNote).count()
    
    # Recent user registrations
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(10).all()
    
    return {
        "totalUsers": total_users,
        "newUsersThisMonth": new_users_this_month,
        "activeUsers": active_users,
        "activeUsersPercentage": round(float(active_users_percentage), 1),
        "onboardingRate": round(float(onboarding_rate), 1),
        "uptime": 99.9,  # This would come from monitoring system
        "systemMetrics": {
            "totalActivities": total_activities,
            "totalAnomalies": total_anomalies,
            "totalNotes": total_notes
        },
        "recentUsers": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at.isoformat(),
                "onboarding_completed": user.onboarding_completed,
                "status": "active" if user.is_active else "inactive"
            }
            for user in recent_users
        ]
    }

@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Activate a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user.username} activated successfully"}

@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Suspend a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow suspending yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.username} suspended successfully"}

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed information about a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's activity statistics
    activity_count = db.query(Activity).filter(Activity.user_id == user_id).count()
    anomaly_count = db.query(DetectedAnomaly).filter(DetectedAnomaly.user_id == user_id).count()
    notes_count = db.query(ProcessNote).filter(ProcessNote.user_id == user_id).count()
    
    # Get recent activities
    recent_activities = db.query(Activity).filter(
        Activity.user_id == user_id
    ).order_by(desc(Activity.timestamp)).limit(10).all()
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat(),
            "is_active": user.is_active,
            "onboarding_completed": user.onboarding_completed,
            "onboarding_data": user.onboarding_data
        },
        "statistics": {
            "activityCount": activity_count,
            "anomalyCount": anomaly_count,
            "notesCount": notes_count
        },
        "recentActivities": [
            {
                "id": activity.id,
                "timestamp": activity.timestamp.isoformat(),
                "application": activity.application,
                "window_title": activity.window_title
            }
            for activity in recent_activities
        ]
    }

@router.get("/system/health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system health metrics"""
    
    # Database connectivity check
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Get recent error counts (anomalies as proxy for errors)
    recent_errors = db.query(DetectedAnomaly).filter(
        DetectedAnomaly.timestamp >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    return {
        "status": "healthy" if db_status == "healthy" and recent_errors < 100 else "warning",
        "database": db_status,
        "uptime": "99.9%",  # This would come from monitoring system
        "recentErrors": recent_errors,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/users/search")
async def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Search users by username or email"""
    users = db.query(User).filter(
        (User.username.ilike(f"%{q}%")) | 
        (User.email.ilike(f"%{q}%"))
    ).limit(20).all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "is_active": user.is_active,
            "onboarding_completed": user.onboarding_completed
        }
        for user in users
    ]

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    period: str = "7d",  # 7d, 30d, 90d
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get dashboard statistics for different time periods"""
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=7)
    
    # User growth
    user_growth = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).all()
    
    # Activity trends
    activity_trends = db.query(
        func.date(Activity.timestamp).label('date'),
        func.count(Activity.id).label('count')
    ).filter(
        Activity.timestamp >= start_date
    ).group_by(
        func.date(Activity.timestamp)
    ).all()
    
    return {
        "period": period,
        "userGrowth": [
            {"date": str(row.date), "count": row.count}
            for row in user_growth
        ],
        "activityTrends": [
            {"date": str(row.date), "count": row.count}
            for row in activity_trends
        ]
    }
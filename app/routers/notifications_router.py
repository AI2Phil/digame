"""
Platform Owner Notifications Router
API endpoints for notification management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.notifications import (
    Notification, NotificationPreference, NotificationLog,
    NotificationType, NotificationPriority, NotificationStatus
)
from ..auth.auth_dependencies import get_current_user
from ..services.notification_service import get_notification_service

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


# Platform Owner Authentication Dependency
async def get_platform_owner(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure current user is a platform owner"""
    if not current_user.is_platform_owner:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return current_user


@router.get("/")
async def get_notifications(
    status: Optional[str] = Query(None, description="Filter by status"),
    notification_type: Optional[str] = Query(None, description="Filter by type"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    include_expired: bool = Query(False, description="Include expired notifications"),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get notifications for the current platform owner"""
    
    query = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    )
    
    # Apply filters
    if status:
        try:
            status_enum = NotificationStatus(status)
            query = query.filter(Notification.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    if notification_type:
        try:
            type_enum = NotificationType(notification_type)
            query = query.filter(Notification.notification_type == type_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid notification type: {notification_type}")
    
    if priority:
        try:
            priority_enum = NotificationPriority(priority)
            query = query.filter(Notification.priority == priority_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid priority: {priority}")
    
    # Filter expired notifications
    if not include_expired:
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "notifications": [
                {
                    "id": notif.id,
                    "title": notif.title,
                    "message": notif.message,
                    "notification_type": notif.notification_type.value,
                    "priority": notif.priority.value,
                    "status": notif.status.value,
                    "tenant_id": notif.tenant_id,
                    "user_context_id": notif.user_context_id,
                    "context_data": notif.context_data,
                    "action_url": notif.action_url,
                    "action_text": notif.action_text,
                    "created_at": notif.created_at.isoformat(),
                    "sent_at": notif.sent_at.isoformat() if notif.sent_at else None,
                    "read_at": notif.read_at.isoformat() if notif.read_at else None,
                    "expires_at": notif.expires_at.isoformat() if notif.expires_at else None
                }
                for notif in notifications
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": total > (offset + limit)
        }
    }


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    
    from sqlalchemy import or_
    count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT]),
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    ).count()
    
    return {
        "success": True,
        "data": {
            "unread_count": count
        }
    }


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Update notification
    notification.status = NotificationStatus.READ
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Notification marked as read"
    }


@router.put("/{notification_id}/dismiss")
async def dismiss_notification(
    notification_id: int,
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Dismiss notification"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Update notification
    notification.status = NotificationStatus.DISMISSED
    notification.dismissed_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Notification dismissed"
    }


@router.put("/mark-all-read")
async def mark_all_as_read(
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    
    # Update all unread notifications
    updated = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT])
    ).update({
        "status": NotificationStatus.READ,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Marked {updated} notifications as read"
    }


@router.get("/preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get notification preferences for current user"""
    
    preferences = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        # Return default preferences
        return {
            "success": True,
            "data": {
                "security_alerts_enabled": True,
                "system_health_enabled": True,
                "business_alerts_enabled": True,
                "revenue_alerts_enabled": True,
                "user_activity_enabled": False,
                "tenant_activity_enabled": True,
                "in_app_enabled": True,
                "email_enabled": True,
                "email_address": current_user.email,
                "sms_enabled": False,
                "phone_number": None,
                "webhook_enabled": False,
                "webhook_url": None,
                "quiet_hours_start": None,
                "quiet_hours_end": None,
                "timezone": "UTC",
                "min_priority": "low"
            }
        }
    
    return {
        "success": True,
        "data": {
            "security_alerts_enabled": preferences.security_alerts_enabled,
            "system_health_enabled": preferences.system_health_enabled,
            "business_alerts_enabled": preferences.business_alerts_enabled,
            "revenue_alerts_enabled": preferences.revenue_alerts_enabled,
            "user_activity_enabled": preferences.user_activity_enabled,
            "tenant_activity_enabled": preferences.tenant_activity_enabled,
            "in_app_enabled": preferences.in_app_enabled,
            "email_enabled": preferences.email_enabled,
            "email_address": preferences.email_address,
            "sms_enabled": preferences.sms_enabled,
            "phone_number": preferences.phone_number,
            "webhook_enabled": preferences.webhook_enabled,
            "webhook_url": preferences.webhook_url,
            "quiet_hours_start": preferences.quiet_hours_start,
            "quiet_hours_end": preferences.quiet_hours_end,
            "timezone": preferences.timezone,
            "min_priority": preferences.min_priority.value if preferences.min_priority else "low"
        }
    }


@router.put("/preferences")
async def update_notification_preferences(
    preferences_data: Dict[str, Any],
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Update notification preferences"""
    
    preferences = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        # Create new preferences
        preferences = NotificationPreference(user_id=current_user.id)
        db.add(preferences)
    
    # Update preferences
    for key, value in preferences_data.items():
        if hasattr(preferences, key):
            if key == "min_priority" and isinstance(value, str):
                try:
                    setattr(preferences, key, NotificationPriority(value))
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Invalid priority: {value}")
            else:
                setattr(preferences, key, value)
    
    preferences.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Notification preferences updated"
    }


@router.get("/types")
async def get_notification_types(
    current_user: User = Depends(get_platform_owner)
):
    """Get available notification types and priorities"""
    
    return {
        "success": True,
        "data": {
            "notification_types": [
                {"value": "security_alert", "name": "Security Alert"},
                {"value": "system_health", "name": "System Health"},
                {"value": "business_alert", "name": "Business Alert"},
                {"value": "revenue_alert", "name": "Revenue Alert"},
                {"value": "user_activity", "name": "User Activity"},
                {"value": "tenant_activity", "name": "Tenant Activity"}
            ],
            "priorities": [
                {"value": "low", "name": "Low"},
                {"value": "medium", "name": "Medium"},
                {"value": "high", "name": "High"},
                {"value": "critical", "name": "Critical"}
            ],
            "statuses": [
                {"value": "pending", "name": "Pending"},
                {"value": "sent", "name": "Sent"},
                {"value": "read", "name": "Read"},
                {"value": "dismissed", "name": "Dismissed"},
                {"value": "failed", "name": "Failed"}
            ]
        }
    }


@router.post("/test")
async def create_test_notification(
    notification_data: Dict[str, Any],
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Create a test notification (for development/testing)"""
    
    # Validate required fields
    required_fields = ["title", "message", "notification_type"]
    for field in required_fields:
        if field not in notification_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    try:
        notification_type = NotificationType(notification_data["notification_type"])
        priority = NotificationPriority(notification_data.get("priority", "medium"))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid enum value: {e}")
    
    # Create notification
    notification = Notification(
        recipient_id=current_user.id,
        title=notification_data["title"],
        message=notification_data["message"],
        notification_type=notification_type,
        priority=priority,
        context_data=notification_data.get("context_data"),
        action_url=notification_data.get("action_url"),
        action_text=notification_data.get("action_text"),
        delivery_channels=notification_data.get("delivery_channels", ["in_app"])
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {
        "success": True,
        "data": {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type.value,
            "priority": notification.priority.value,
            "created_at": notification.created_at.isoformat()
        },
        "message": "Test notification created"
    }
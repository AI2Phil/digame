from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from ..models.notifications import Notification
from ..schemas.notification_schemas import NotificationCreate, NotificationUpdate

def create_notification(db: Session, notification: NotificationCreate, user_id: int) -> Notification:
    """Create a new notification for a user."""
    notification_data = {
        "user_id": user_id,
        "message": notification.message,
        "type": notification.type,
        "scheduled_at": getattr(notification, 'scheduled_at', None)
    }
    db_notification = Notification(**notification_data)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def create_user_notification(db: Session, *, notification_in: NotificationCreate, user_id: int) -> Notification:
    """Create a new notification for a user (alternative interface)."""
    return create_notification(db, notification_in, user_id)

def get_notification(db: Session, notification_id: int) -> Optional[Notification]:
    """Get a single notification by its ID."""
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100, read_status: Optional[bool] = None) -> List[Notification]:
    """Get notifications for a user with optional read status filtering."""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if read_status is True:
        query = query.filter(Notification.is_read == True)
    elif read_status is False:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """Get all notifications for a user."""
    return get_notifications_for_user(db, user_id, skip, limit)

def get_unread_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """Get unread notifications for a user."""
    return get_notifications_for_user(db, user_id, skip, limit, read_status=False)

def update_notification(db: Session, notification_id: int, notification_update: NotificationUpdate) -> Optional[Notification]:
    """Update an existing notification by ID."""
    db_notification = get_notification(db, notification_id)
    if db_notification:
        update_data = notification_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: int, user_id: Optional[int] = None) -> Optional[Notification]:
    """Mark a notification as read."""
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notification and (user_id is None or db_notification.user_id == user_id):
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
        return db_notification
    return None

def mark_all_notifications_as_read_for_user(db: Session, user_id: int) -> List[Notification]:
    """Mark all unread notifications as read for a user."""
    notifications = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).all()
    for notification in notifications:
        notification.is_read = True
    db.commit()
    return notifications

def mark_multiple_notifications_as_read(db: Session, notification_ids: List[int], user_id: int) -> int:
    """Mark multiple notifications as read for a specific user."""
    if not notification_ids:
        return 0
    
    query = (
        db.query(Notification)
        .filter(Notification.id.in_(notification_ids))
        .filter(Notification.user_id == user_id)
        .filter(Notification.is_read == False)
    )
    
    updated_count = query.update({"is_read": True}, synchronize_session=False)
    db.commit()
    return updated_count

def delete_notification(db: Session, notification_id: int) -> Optional[Notification]:
    """Delete a notification by ID."""
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification

def get_pending_scheduled_notifications(db: Session, limit: int = 100) -> List[Notification]:
    """Get notifications that are scheduled and due to be processed."""
    now_utc = datetime.now(timezone.utc)
    
    return (
        db.query(Notification)
        .filter(Notification.scheduled_at != None)
        .filter(Notification.scheduled_at <= now_utc)
        .filter(Notification.is_read == False)
        .order_by(Notification.scheduled_at.asc())
        .limit(limit)
        .all()
    )

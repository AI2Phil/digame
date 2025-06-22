from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.notification import Notification
from schemas import notification_schemas

def create_notification(db: Session, notification: notification_schemas.NotificationCreate, user_id: int) -> Notification:
    db_notification = Notification(
        user_id=user_id,
        content=notification.message,
        type=notification.type,
        scheduled_at=getattr(notification, 'scheduled_at', None)  # Keep scheduled_at from HEAD
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notification(db: Session, notification_id: int) -> Optional[Notification]:
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100, read_status: Optional[bool] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if read_status is True: # Only read notifications
        query = query.filter(Notification.is_read == True)
    elif read_status is False: # Only unread notifications
        query = query.filter(Notification.is_read == False)
    # If read_status is None, no additional filtering on is_read status is applied.
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """Legacy function for backward compatibility"""
    return get_notifications_for_user(db, user_id, skip, limit)

def get_unread_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """Legacy function for backward compatibility"""
    return get_notifications_for_user(db, user_id, skip, limit, read_status=False)

def update_notification(db: Session, notification_id: int, notification_update: notification_schemas.NotificationUpdate) -> Optional[Notification]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        update_data = notification_update.model_dump(exclude_unset=True) # Pydantic V2
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notification and db_notification.user_id == user_id:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
        return db_notification
    return None

def mark_all_notifications_as_read_for_user(db: Session, user_id: int) -> List[Notification]:
    notifications = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).all()
    for notification in notifications:
        notification.is_read = True
    db.commit()
    return notifications

def delete_notification(db: Session, notification_id: int) -> Optional[Notification]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification

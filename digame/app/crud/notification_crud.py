from sqlalchemy.orm import Session
from typing import List, Optional

from digame.app.models import Notification as NotificationModel
from digame.app.schemas import notification_schemas

def create_notification(db: Session, notification: notification_schemas.NotificationCreate) -> NotificationModel:
    db_notification = NotificationModel(
        user_id=notification.user_id,
        message=notification.message,
        scheduled_at=notification.scheduled_at
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notification(db: Session, notification_id: int) -> Optional[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.id == notification_id).first()

def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.user_id == user_id).offset(skip).limit(limit).all()

def get_unread_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.user_id == user_id, NotificationModel.is_read == False).offset(skip).limit(limit).all()

def update_notification(db: Session, notification_id: int, notification_update: notification_schemas.NotificationUpdate) -> Optional[NotificationModel]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        update_data = notification_update.model_dump(exclude_unset=True) # Pydantic V2
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: int) -> Optional[NotificationModel]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: int) -> Optional[NotificationModel]:
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification

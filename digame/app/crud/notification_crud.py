from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone # Import timezone

from ..models.notification import Notification
from ..schemas.notification_schemas import NotificationCreate, NotificationUpdate

def create_user_notification(db: Session, *, notification_in: NotificationCreate, user_id: int) -> Notification:
    """
    Create a new notification for a user.
    """
    # For Pydantic v2, model_dump() is used. For v1, it would be .dict()
    db_obj = Notification(
        **notification_in.model_dump(),
        user_id=user_id,
        # created_at is server_default, is_read has a default
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_notification(db: Session, *, notification_id: int) -> Optional[Notification]:
    """
    Get a single notification by its ID.
    """
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications_by_user(
    db: Session, *, user_id: int, skip: int = 0, limit: int = 100
) -> List[Notification]:
    """
    Get a list of notifications for a specific user, ordered by creation date descending.
    """
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_notification(
    db: Session, *, notification_db_obj: Notification, notification_in: NotificationUpdate
) -> Notification:
    """
    Update an existing notification.
    'notification_db_obj' is the existing model instance from the DB.
    'notification_in' is a Pydantic schema with fields to update.
    """
    # For Pydantic v2, model_dump(exclude_unset=True) is used. For v1, .dict(exclude_unset=True)
    update_data = notification_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(notification_db_obj, field, value)

    # The notification_db_obj is already in the session, so adding it again is usually redundant
    # but doesn't harm. db.commit() will save changes.
    db.add(notification_db_obj)
    db.commit()
    db.refresh(notification_db_obj)
    return notification_db_obj

def delete_notification(db: Session, *, notification_id: int) -> Optional[Notification]:
    """
    Delete a notification by its ID.
    Returns the deleted object or None if not found.
    """
    db_obj = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj # Returns the object that was deleted, or None

def get_pending_scheduled_notifications(db: Session, limit: int = 100) -> List[Notification]:
    """
    Get notifications that are scheduled and due to be processed.
    This retrieves notifications whose scheduled_at is in the past or now,
    and are not yet marked as read (as a proxy for "not yet fully processed/sent").
    A more robust system might use a dedicated 'is_sent' or 'processed_at' field.
    """
    # Using timezone.utc for a timezone-aware comparison, assuming scheduled_at is stored as timezone-aware.
    now_utc = datetime.now(timezone.utc)

    return (
        db.query(Notification)
        .filter(Notification.scheduled_at != None)  # Ensure scheduled_at is set
        .filter(Notification.scheduled_at <= now_utc) # Get due notifications
        .filter(Notification.is_read == False)      # Assuming unread means not fully processed
        .order_by(Notification.scheduled_at.asc())  # Process earlier scheduled notifications first
        .limit(limit)
        .all()
    )

def mark_notification_as_read(db: Session, *, notification_id: int) -> Optional[Notification]:
    """
    Mark a single notification as read.
    """
    db_notification = get_notification(db, notification_id=notification_id)
    if db_notification and not db_notification.is_read:
        db_notification.is_read = True
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_multiple_notifications_as_read(db: Session, *, notification_ids: List[int], user_id: int) -> int:
    """
    Mark multiple notifications as read for a specific user.
    Returns the count of notifications updated.
    """
    if not notification_ids:
        return 0

    # Ensure notifications belong to the user to prevent unauthorized updates, though this check might be better at service/API layer.
    # For this CRUD, we assume notification_ids are pre-validated or the operation is privileged.
    # However, adding user_id filter for safety.
    query = (
        db.query(Notification)
        .filter(Notification.id.in_(notification_ids))
        .filter(Notification.user_id == user_id) # Ensure user owns these notifications
        .filter(Notification.is_read == False)
    )

    # Update directly in the database for efficiency
    updated_count = query.update({"is_read": True}, synchronize_session=False)
    db.commit()
    return updated_count

# Additional CRUD functions might be needed, e.g., for bulk deletion, etc.
# get_unread_notifications_by_user, etc.
# For now, sticking to the provided list in the prompt.
# The get_pending_scheduled_notifications is key for the "scheduled sending" aspect.
# Added mark_notification_as_read and mark_multiple_notifications_as_read as common utility functions.

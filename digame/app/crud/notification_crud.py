from sqlalchemy.orm import Session
from sqlalchemy import desc, and_ # Added and_ for combined filtering
from typing import List, Optional
from datetime import datetime

from digame.app.models.notification import Notification
# from digame.app.models.user import User # Not strictly needed for these CRUDs but good for context

def create_notification(db: Session, user_id: int, message: str, type: Optional[str] = None) -> Notification:
    """
    Creates a new notification.
    """
    db_notification = Notification(
        user_id=user_id,
        message=message,
        type=type,
        is_read=False, # Default to unread
        created_at=datetime.utcnow() # Explicitly set, though model has default
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notifications_for_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    include_read: bool = False
) -> List[Notification]:
    """
    Retrieves notifications for a user, with pagination and an option to include read notifications.
    By default, only unread notifications are returned.
    Notifications are returned newest first.
    """
    query = db.query(Notification).filter(Notification.user_id == user_id)

    if not include_read:
        query = query.filter(Notification.is_read == False)

    return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    """
    Marks a specific notification as read. Ensures the notification belongs to the user.
    """
    db_notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id # Ensure the notification belongs to the requesting user
    ).first()

    if db_notification:
        if not db_notification.is_read:
            db_notification.is_read = True
            db.commit()
            db.refresh(db_notification)
        return db_notification
    return None

def mark_all_notifications_as_read_for_user(db: Session, user_id: int) -> int:
    """
    Marks all unread notifications for a user as read.
    Returns the count of notifications that were marked as read.
    """
    # This performs an update in place and then a count.
    # For more complex ORMs or scenarios, you might fetch then update,
    # but for SQLAlchemy, update() is efficient.

    # Construct the filter for unread notifications for the user
    unread_notifications_filter = and_(
        Notification.user_id == user_id,
        Notification.is_read == False
    )

    # Update matching notifications
    # The update() method returns the number of rows matched by the filter.
    # Note: This does not run ORM event listeners on individual objects.
    # If individual object updates with side effects are needed, fetch and iterate.

    # First, get the count of notifications that will be updated
    count = db.query(Notification).filter(unread_notifications_filter).count()

    if count > 0:
        # Then, perform the update
        db.query(Notification).filter(unread_notifications_filter).update(
            {Notification.is_read: True},
            synchronize_session=False # Advised when not deleting or when PKs not involved in update criteria
        )
        db.commit()

    return count

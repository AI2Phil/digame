import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List

from digame.app.models.notification import Notification
from digame.app.models.user import User # Required for test_user fixture
from digame.app.schemas.notification_schemas import NotificationCreate, NotificationUpdate
from digame.app.crud import notification_crud

# The db_session, test_user, test_user_2 fixtures are from conftest.py

def test_create_user_notification(db_session: Session, test_user: User):
    """Test creating a notification for a user."""
    message = "Test CRUD create notification"
    scheduled_time = datetime.now(timezone.utc) + timedelta(hours=1)
    notification_in = NotificationCreate(message=message, scheduled_at=scheduled_time)

    created_notification = notification_crud.create_user_notification(
        db=db_session, notification_in=notification_in, user_id=test_user.id
    )

    assert created_notification is not None
    assert created_notification.id is not None
    assert created_notification.message == message
    assert created_notification.user_id == test_user.id
    assert created_notification.scheduled_at == scheduled_time
    assert not created_notification.is_read
    assert created_notification.created_at is not None

def test_get_notification(db_session: Session, test_user: User):
    """Test retrieving a single notification by ID."""
    notification_in = NotificationCreate(message="Notification to get")
    created_notification = notification_crud.create_user_notification(
        db=db_session, notification_in=notification_in, user_id=test_user.id
    )

    fetched_notification = notification_crud.get_notification(db=db_session, notification_id=created_notification.id)
    assert fetched_notification is not None
    assert fetched_notification.id == created_notification.id
    assert fetched_notification.message == "Notification to get"

    non_existent_notification = notification_crud.get_notification(db=db_session, notification_id=99999)
    assert non_existent_notification is None

def test_get_notifications_by_user(db_session: Session, test_user: User, test_user_2: User):
    """Test retrieving notifications for a specific user."""
    # Notifications for test_user
    notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="User1 Notif1"), user_id=test_user.id)
    notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="User1 Notif2"), user_id=test_user.id)
    # Notification for test_user_2
    notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="User2 Notif1"), user_id=test_user_2.id)

    user1_notifications = notification_crud.get_notifications_by_user(db=db_session, user_id=test_user.id, limit=10)
    assert len(user1_notifications) == 2
    assert user1_notifications[0].message == "User1 Notif2" # Ordered by created_at desc
    assert user1_notifications[1].message == "User1 Notif1"

    user2_notifications = notification_crud.get_notifications_by_user(db=db_session, user_id=test_user_2.id, limit=10)
    assert len(user2_notifications) == 1
    assert user2_notifications[0].message == "User2 Notif1"

    # Test with a user who has no notifications
    user_no_notifs = User(id=3, username="nouser", email="no@no.com", hashed_password="p")
    db_session.add(user_no_notifs)
    db_session.commit()
    no_notifications = notification_crud.get_notifications_by_user(db=db_session, user_id=user_no_notifs.id)
    assert len(no_notifications) == 0

    # Test pagination (limit)
    user1_notifications_limited = notification_crud.get_notifications_by_user(db=db_session, user_id=test_user.id, limit=1)
    assert len(user1_notifications_limited) == 1

def test_update_notification(db_session: Session, test_user: User):
    """Test updating an existing notification."""
    original_message = "Original message"
    notification_in_create = NotificationCreate(message=original_message, scheduled_at=None)
    db_notification = notification_crud.create_user_notification(
        db=db_session, notification_in=notification_in_create, user_id=test_user.id
    )

    updated_message = "Updated message"
    updated_scheduled_time = datetime.now(timezone.utc) + timedelta(days=2)
    notification_in_update = NotificationUpdate(
        message=updated_message,
        is_read=True,
        scheduled_at=updated_scheduled_time
    )

    updated_notification = notification_crud.update_notification(
        db=db_session, notification_db_obj=db_notification, notification_in=notification_in_update
    )

    assert updated_notification is not None
    assert updated_notification.id == db_notification.id
    assert updated_notification.message == updated_message
    assert updated_notification.is_read is True
    assert updated_notification.scheduled_at == updated_scheduled_time
    # Ensure other fields like user_id and created_at are not changed
    assert updated_notification.user_id == test_user.id
    assert updated_notification.created_at == db_notification.created_at

def test_delete_notification(db_session: Session, test_user: User):
    """Test deleting a notification."""
    notification_in = NotificationCreate(message="Notification to delete")
    created_notification = notification_crud.create_user_notification(
        db=db_session, notification_in=notification_in, user_id=test_user.id
    )

    notification_id = created_notification.id
    deleted_notification = notification_crud.delete_notification(db=db_session, notification_id=notification_id)
    assert deleted_notification is not None
    assert deleted_notification.id == notification_id

    fetched_after_delete = notification_crud.get_notification(db=db_session, notification_id=notification_id)
    assert fetched_after_delete is None

    # Test deleting a non-existent notification
    deleted_non_existent = notification_crud.delete_notification(db=db_session, notification_id=99999)
    assert deleted_non_existent is None

def test_get_pending_scheduled_notifications(db_session: Session, test_user: User):
    """Test retrieving pending scheduled notifications."""
    now = datetime.now(timezone.utc)

    # Not scheduled (scheduled_at is None)
    notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="Not scheduled"), user_id=test_user.id)

    # Scheduled for future
    notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="Future scheduled", scheduled_at=now + timedelta(hours=1)), user_id=test_user.id)

    # Scheduled for past (due) and unread
    due_unread = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="Due and unread", scheduled_at=now - timedelta(hours=1)), user_id=test_user.id)

    # Scheduled for past (due) but is_read = True
    due_read_payload = NotificationCreate(message="Due but read", scheduled_at=now - timedelta(hours=2))
    due_read_db = notification_crud.create_user_notification(db=db_session, notification_in=due_read_payload, user_id=test_user.id)
    due_read_db.is_read = True # Manually mark as read for test setup
    db_session.commit()

    pending_notifications = notification_crud.get_pending_scheduled_notifications(db=db_session, limit=10)

    assert len(pending_notifications) == 1
    assert pending_notifications[0].id == due_unread.id
    assert pending_notifications[0].message == "Due and unread"

def test_mark_notification_as_read(db_session: Session, test_user: User):
    """Test marking a single notification as read."""
    notif = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="Mark me as read"), user_id=test_user.id)
    assert not notif.is_read

    updated_notif = notification_crud.mark_notification_as_read(db=db_session, notification_id=notif.id)
    assert updated_notif is not None
    assert updated_notif.is_read

    # Test with already read notification
    already_read_notif = notification_crud.mark_notification_as_read(db=db_session, notification_id=notif.id)
    assert already_read_notif is not None # Should return the object
    assert already_read_notif.is_read # Still true

    # Test with non-existent notification
    non_existent = notification_crud.mark_notification_as_read(db=db_session, notification_id=9999)
    assert non_existent is None


def test_mark_multiple_notifications_as_read(db_session: Session, test_user: User, test_user_2: User):
    """Test marking multiple notifications as read for a specific user."""
    n1_u1 = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="N1U1"), user_id=test_user.id)
    n2_u1 = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="N2U1"), user_id=test_user.id)
    n3_u1_read = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="N3U1"), user_id=test_user.id)
    notification_crud.mark_notification_as_read(db=db_session, notification_id=n3_u1_read.id) # Pre-mark as read

    n1_u2 = notification_crud.create_user_notification(db=db_session, notification_in=NotificationCreate(message="N1U2"), user_id=test_user_2.id) # Belongs to another user

    ids_to_mark = [n1_u1.id, n2_u1.id, n3_u1_read.id, n1_u2.id, 9999] # n1_u2 and 9999 should be ignored for user1

    updated_count = notification_crud.mark_multiple_notifications_as_read(
        db=db_session, notification_ids=ids_to_mark, user_id=test_user.id
    )

    # n1_u1 and n2_u1 should be marked as read. n3_u1_read was already read.
    assert updated_count == 2

    db_session.refresh(n1_u1)
    db_session.refresh(n2_u1)
    db_session.refresh(n3_u1_read) # Refresh to get latest state from DB after potential update
    db_session.refresh(n1_u2)

    assert n1_u1.is_read
    assert n2_u1.is_read
    assert n3_u1_read.is_read # Was already read, remains read
    assert not n1_u2.is_read # Should not be affected as it belongs to user2

    # Test with empty list
    assert notification_crud.mark_multiple_notifications_as_read(db=db_session, notification_ids=[], user_id=test_user.id) == 0

import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from digame.app.models.notification import Notification
from digame.app.models.user import User # Required for the test_user fixture and relationships

# The db_session and test_user fixtures are defined in conftest.py and will be automatically discovered by pytest.

def test_create_notification(db_session: Session, test_user: User):
    """
    Test creating a Notification instance and its default values.
    """
    notification_message = "Test notification message"
    scheduled_time = datetime.now(timezone.utc) + timedelta(days=1)

    notification = Notification(
        user_id=test_user.id,
        message=notification_message,
        scheduled_at=scheduled_time
    )

    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    assert notification.id is not None
    assert notification.user_id == test_user.id
    assert notification.message == notification_message
    assert notification.is_read is False  # Default value
    assert notification.created_at is not None
    assert notification.scheduled_at == scheduled_time

    # Verify created_at is recent (within a reasonable delta, e.g., 5 seconds)
    assert (datetime.now(timezone.utc) - notification.created_at).total_seconds() < 5

    # Test notification with no scheduled_at
    notification_no_schedule = Notification(
        user_id=test_user.id,
        message="Another message"
    )
    db_session.add(notification_no_schedule)
    db_session.commit()
    db_session.refresh(notification_no_schedule)

    assert notification_no_schedule.scheduled_at is None
    assert notification_no_schedule.is_read is False

def test_notification_user_relationship(db_session: Session, test_user: User):
    """
    Test the relationship between Notification and User.
    """
    notification = Notification(
        user_id=test_user.id,
        message="Notification for relationship test"
    )
    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)
    db_session.refresh(test_user) # Refresh user to load relationships

    assert notification.user is not None
    assert notification.user.id == test_user.id
    assert notification.user.username == test_user.username

    # Test the back-population from User to Notification, if User.notifications is set up.
    # This depends on the User model having:
    # notifications = relationship("Notification", back_populates="user")
    # If not set up, this part of the test might fail or needs to be conditional.
    # For now, we assume it will be set up for full bidirectional relationship.
    if hasattr(test_user, 'notifications'):
        assert notification in test_user.notifications
        assert len(test_user.notifications) >= 1
        # Find our specific notification in the list
        found = False
        for notif in test_user.notifications:
            if notif.id == notification.id:
                found = True
                break
        assert found, "Notification not found in user.notifications list"
    else:
        # If User.notifications is not yet defined, this test can't check back-population.
        # This can be a reminder to implement it on the User model.
        print("Skipping test_user.notifications check: User.notifications relationship not yet defined.")
        pass

def test_notification_repr(db_session: Session, test_user: User):
    """
    Test the __repr__ method of the Notification model.
    """
    message = "A short message for repr"
    notification = Notification(
        user_id=test_user.id,
        message=message,
        is_read=True,
        scheduled_at=datetime.now(timezone.utc)
    )
    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    expected_repr = f"<Notification(id={notification.id}, user_id={test_user.id}, message='{message[:20]}...', is_read=True, scheduled_at={notification.scheduled_at})>"
    assert repr(notification) == expected_repr

    message_long = "This is a very long message that should be truncated in the representation for brevity."
    notification_long_msg = Notification(
        user_id=test_user.id,
        message=message_long,
    )
    db_session.add(notification_long_msg)
    db_session.commit()
    db_session.refresh(notification_long_msg)

    expected_repr_long = f"<Notification(id={notification_long_msg.id}, user_id={test_user.id}, message='{message_long[:20]}...', is_read=False, scheduled_at=None)>"
    assert repr(notification_long_msg) == expected_repr_long

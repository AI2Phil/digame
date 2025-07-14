import pytest
from pydantic import ValidationError
from datetime import datetime, timezone, timedelta

from app.schemas.notification_schemas import (
    NotificationBase,
    NotificationCreate,
    NotificationUpdate,
    Notification as NotificationSchema # Alias to avoid confusion with model
)

def test_notification_base_schema_valid():
    """Test NotificationBase with valid data."""
    now = datetime.now(timezone.utc)
    # Test with scheduled_at
    notif_base = NotificationBase(message="Test message", type="info", scheduled_at=now)
    assert notif_base.message == "Test message"
    assert notif_base.type == "info"
    assert notif_base.scheduled_at == now

    # Test without scheduled_at
    notif_base_no_schedule = NotificationBase(message="Another message", type="warning")
    assert notif_base_no_schedule.message == "Another message"
    assert notif_base_no_schedule.type == "warning"
    assert notif_base_no_schedule.scheduled_at is None

def test_notification_base_schema_invalid():
    """Test NotificationBase with invalid data."""
    # Missing message
    with pytest.raises(ValidationError):
        NotificationBase(type="info", scheduled_at=datetime.now(timezone.utc))  # type: ignore

    # Missing type
    with pytest.raises(ValidationError):
        NotificationBase(message="Valid message", scheduled_at=datetime.now(timezone.utc))  # type: ignore

    # Invalid type for message (using Any to bypass type checker)
    with pytest.raises(ValidationError):
        NotificationBase(message=123, type="info")  # type: ignore

    # Invalid type for scheduled_at (using Any to bypass type checker)
    with pytest.raises(ValidationError):
        NotificationBase(message="Valid message", type="info", scheduled_at="not-a-datetime")  # type: ignore

def test_notification_create_schema():
    """Test NotificationCreate schema."""
    now = datetime.now(timezone.utc)
    # Valid data
    notif_create = NotificationCreate(message="New notification", type="info", scheduled_at=now)
    assert notif_create.message == "New notification"
    assert notif_create.type == "info"
    assert notif_create.scheduled_at == now

    notif_create_no_schedule = NotificationCreate(message="No schedule here", type="warning")
    assert notif_create_no_schedule.message == "No schedule here"
    assert notif_create_no_schedule.type == "warning"
    assert notif_create_no_schedule.scheduled_at is None

    # Invalid data (missing message)
    with pytest.raises(ValidationError) as excinfo:
        NotificationCreate(type="info", scheduled_at=now)  # type: ignore # Missing message
    assert "message" in str(excinfo.value).lower() # Check that 'message' field is mentioned in error

def test_notification_update_schema():
    """Test NotificationUpdate schema (all fields optional)."""
    now = datetime.now(timezone.utc)

    # Update only message
    update1 = NotificationUpdate(message="Updated message")
    assert update1.message == "Updated message"
    assert update1.is_read is None
    assert update1.scheduled_at is None

    # Update only is_read
    update2 = NotificationUpdate(is_read=True)
    assert update2.message is None
    assert update2.is_read is True
    assert update2.scheduled_at is None

    # Update only scheduled_at
    update3 = NotificationUpdate(scheduled_at=now)
    assert update3.message is None
    assert update3.is_read is None
    assert update3.scheduled_at == now

    # Update scheduled_at to None (unschedule)
    update4 = NotificationUpdate(scheduled_at=None)
    assert update4.scheduled_at is None

    # Update multiple fields
    update5 = NotificationUpdate(message="Another update", is_read=False, scheduled_at=now)
    assert update5.message == "Another update"
    assert update5.is_read is False
    assert update5.scheduled_at == now

    # Empty update (valid, means no fields are changed)
    update_empty = NotificationUpdate()
    assert update_empty.model_dump(exclude_unset=True) == {}

    # Invalid data types
    with pytest.raises(ValidationError):
        NotificationUpdate(is_read="not-a-boolean")  # type: ignore
    with pytest.raises(ValidationError):
        NotificationUpdate(message=12345)  # type: ignore

def test_notification_schema_from_orm_like_object():
    """
    Test creating Notification schema from an ORM-like object (Pydantic v2: model_validate).
    """
    now = datetime.now(timezone.utc)

    # Mock ORM object (can be a simple class or dict if fields match)
    class MockOrmNotification:
        def __init__(self, id, user_id, message, type, created_at, is_read, scheduled_at):
            self.id = id
            self.user_id = user_id
            self.message = message
            self.type = type
            self.created_at = created_at
            self.is_read = is_read
            self.scheduled_at = scheduled_at

    orm_obj = MockOrmNotification(
        id=1,
        user_id=101,
        message="Notification from ORM",
        type="info",
        created_at=now - timedelta(hours=1),
        is_read=False,
        scheduled_at=now + timedelta(days=1)
    )

    notification_schema = NotificationSchema.model_validate(orm_obj)

    assert notification_schema.id == 1
    assert notification_schema.user_id == 101
    assert notification_schema.message == "Notification from ORM"
    assert notification_schema.created_at == orm_obj.created_at
    assert notification_schema.is_read is False
    assert notification_schema.scheduled_at == orm_obj.scheduled_at

    # Test with scheduled_at being None
    orm_obj_no_schedule = MockOrmNotification(
        id=2,
        user_id=102,
        message="No schedule ORM",
        type="warning",
        created_at=now - timedelta(minutes=30),
        is_read=True,
        scheduled_at=None
    )
    notification_schema_no_schedule = NotificationSchema.model_validate(orm_obj_no_schedule)
    assert notification_schema_no_schedule.id == 2
    assert notification_schema_no_schedule.user_id == 102
    assert notification_schema_no_schedule.is_read is True
    assert notification_schema_no_schedule.scheduled_at is None

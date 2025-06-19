import pytest
from unittest.mock import MagicMock, call
from sqlalchemy.orm import Session
from digame.app.models.notification import Notification
from digame.app.models.user import User # Assuming User model exists
from digame.app.schemas.notification_schemas import NotificationCreate
from digame.app.crud import notification_crud
from sqlalchemy import func # For server_default=func.now()

# Mock base for SQLAlchemy models to avoid needing a real DB for basic attribute setting
class MockBaseModel:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class MockNotification(MockBaseModel, Notification):
    pass

class MockUser(MockBaseModel, User):
    pass


@pytest.fixture
def db_session_mock():
    return MagicMock(spec=Session)

@pytest.fixture
def test_user():
    return MockUser(id=1, full_name="Test User")

@pytest.fixture
def test_notification_create_schema():
    return NotificationCreate(message="Test Message", type="test_type")

@pytest.fixture
def test_db_notification(test_user):
    return MockNotification(
        id=1,
        user_id=test_user.id,
        message="Test Message",
        type="test_type",
        is_read=False,
        recipient=test_user
    )

def test_create_notification(db_session_mock, test_notification_create_schema, test_user):
    notification_data = test_notification_create_schema

    created_notification = notification_crud.create_notification(
        db=db_session_mock, notification=notification_data, user_id=test_user.id
    )

    assert created_notification is not None
    assert created_notification.user_id == test_user.id
    assert created_notification.message == notification_data.message
    assert created_notification.type == notification_data.type
    # The actual Notification model instance is created inside, then attributes assigned.
    # We can't easily assert on the Python object type here without more complex mocking of the Notification constructor

    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(db_session_mock.add.call_args[0][0]) # Check refresh is called with the object passed to add

def test_get_notification_found(db_session_mock, test_db_notification):
    db_session_mock.query(Notification).filter(Notification.id == test_db_notification.id).first.return_value = test_db_notification

    notification = notification_crud.get_notification(db=db_session_mock, notification_id=test_db_notification.id)

    assert notification == test_db_notification
    db_session_mock.query(Notification).filter(Notification.id == test_db_notification.id).first.assert_called_once()

def test_get_notification_not_found(db_session_mock):
    notification_id = 999
    db_session_mock.query(Notification).filter(Notification.id == notification_id).first.return_value = None

    notification = notification_crud.get_notification(db=db_session_mock, notification_id=notification_id)

    assert notification is None
    db_session_mock.query(Notification).filter(Notification.id == notification_id).first.assert_called_once()

def test_get_notifications_for_user(db_session_mock, test_user, test_db_notification):
    mock_query = db_session_mock.query(Notification).filter(Notification.user_id == test_user.id)

    # Test case 1: read_status = None (all notifications)
    mock_query.order_by(Notification.created_at.desc()).offset(0).limit(10).all.return_value = [test_db_notification]
    notifications = notification_crud.get_notifications_for_user(db=db_session_mock, user_id=test_user.id, skip=0, limit=10, read_status=None)
    assert notifications == [test_db_notification]
    mock_query.filter.assert_not_called() # No additional filter for is_read

    # Test case 2: read_status = False (unread only)
    unread_query_mock = mock_query.filter(Notification.is_read == False)
    unread_query_mock.order_by(Notification.created_at.desc()).offset(0).limit(10).all.return_value = [test_db_notification]
    notifications_unread = notification_crud.get_notifications_for_user(db=db_session_mock, user_id=test_user.id, skip=0, limit=10, read_status=False)
    assert notifications_unread == [test_db_notification]
    mock_query.filter.assert_called_with(Notification.is_read == False)

    # Test case 3: read_status = True (read only)
    read_query_mock = mock_query.filter(Notification.is_read == True)
    read_query_mock.order_by(Notification.created_at.desc()).offset(0).limit(10).all.return_value = [] # Assume no read notifs for this test
    notifications_read = notification_crud.get_notifications_for_user(db=db_session_mock, user_id=test_user.id, skip=0, limit=10, read_status=True)
    assert notifications_read == []
    mock_query.filter.assert_called_with(Notification.is_read == True)

    # Test pagination
    mock_query.order_by(Notification.created_at.desc()).offset(5).limit(5).all.return_value = []
    notification_crud.get_notifications_for_user(db=db_session_mock, user_id=test_user.id, skip=5, limit=5, read_status=None)
    mock_query.order_by(Notification.created_at.desc()).offset.assert_called_with(5)
    mock_query.order_by(Notification.created_at.desc()).offset(5).limit.assert_called_with(5)


def test_mark_notification_as_read(db_session_mock, test_user, test_db_notification):
    # Case 1: Notification found and belongs to user
    test_db_notification.is_read = False # ensure it starts as unread
    db_session_mock.query(Notification).filter(Notification.id == test_db_notification.id).first.return_value = test_db_notification

    updated_notification = notification_crud.mark_notification_as_read(
        db=db_session_mock, notification_id=test_db_notification.id, user_id=test_user.id
    )

    assert updated_notification is not None
    assert updated_notification.is_read is True
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(test_db_notification)

    # Reset mocks for next case
    db_session_mock.reset_mock()
    test_db_notification.is_read = False # reset for other tests

    # Case 2: Notification not found
    db_session_mock.query(Notification).filter(Notification.id == 999).first.return_value = None
    updated_notification_not_found = notification_crud.mark_notification_as_read(
        db=db_session_mock, notification_id=999, user_id=test_user.id
    )
    assert updated_notification_not_found is None
    db_session_mock.commit.assert_not_called()
    db_session_mock.refresh.assert_not_called()

    # Case 3: Notification found but belongs to different user
    other_user_id = test_user.id + 1
    db_session_mock.query(Notification).filter(Notification.id == test_db_notification.id).first.return_value = test_db_notification # Belongs to test_user.id

    updated_notification_other_user = notification_crud.mark_notification_as_read(
        db=db_session_mock, notification_id=test_db_notification.id, user_id=other_user_id
    )
    assert updated_notification_other_user is None
    assert test_db_notification.is_read is False # Should not have been changed
    db_session_mock.commit.assert_not_called() # Or called once if previous test case wasn't reset properly
    db_session_mock.refresh.assert_not_called()


def test_mark_all_notifications_as_read_for_user(db_session_mock, test_user):
    unread_notif1 = MockNotification(id=1, user_id=test_user.id, message="Msg1", type="type1", is_read=False)
    unread_notif2 = MockNotification(id=2, user_id=test_user.id, message="Msg2", type="type2", is_read=False)
    unread_notifications = [unread_notif1, unread_notif2]

    db_session_mock.query(Notification).filter(
        Notification.user_id == test_user.id, Notification.is_read == False
    ).all.return_value = unread_notifications

    updated_list = notification_crud.mark_all_notifications_as_read_for_user(
        db=db_session_mock, user_id=test_user.id
    )

    assert len(updated_list) == 2
    for notification in updated_list:
        assert notification.is_read is True
    db_session_mock.commit.assert_called_once()

    # Test with no unread notifications
    db_session_mock.reset_mock()
    db_session_mock.query(Notification).filter(
        Notification.user_id == test_user.id, Notification.is_read == False
    ).all.return_value = []

    updated_list_empty = notification_crud.mark_all_notifications_as_read_for_user(
        db=db_session_mock, user_id=test_user.id
    )
    assert len(updated_list_empty) == 0
    db_session_mock.commit.assert_called_once() # Commit is still called even if list is empty
                                                # This might be debatable, but it's current behavior of SQLAlchemy
                                                # if no changes are made, commit might be a no-op at DB level.
                                                # If strict no-call on empty, CRUD needs an if condition.

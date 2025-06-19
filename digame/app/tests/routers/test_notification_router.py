import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Attempt to import app, adjust if main is structured differently
try:
    from digame.app.main import app
except ImportError:
    # Fallback if 'app' is not directly in main or structure is different
    # This might require knowing the exact variable name or factory function
    app = None

from digame.app.models.user import User as UserModel # Assuming real User model for type hint
from digame.app.schemas.notification_schemas import Notification as NotificationSchema # Real schema for response_model

# Mock user for dependency override
@pytest.fixture
def mock_current_active_user():
    user = UserModel() # Or MagicMock(spec=UserModel)
    user.id = 1
    user.full_name = "Test User Active"
    user.email = "active@example.com"
    # Add other fields as necessary for User model
    return user

@pytest.fixture
def client(mock_current_active_user):
    if app is None:
        pytest.skip("FastAPI app could not be imported for TestClient.", allow_module_level=True)

    # Override dependency for get_current_active_user
    # Assuming path to dependency is 'digame.app.auth.dependencies.get_current_active_user'
    # This path might need adjustment based on actual project structure.
    app.dependency_overrides[MagicMock(name='get_current_active_user_dependency')] = lambda: mock_current_active_user

    # A more robust way if you know the exact dependency function:
    try:
        from digame.app.auth.dependencies import get_current_active_user as actual_dependency
        app.dependency_overrides[actual_dependency] = lambda: mock_current_active_user
    except ImportError:
        print("Warning: Could not import actual get_current_active_user dependency for override. Using placeholder.")
        # Fallback if the actual dependency can't be imported for overriding by exact object
        # This relies on FastAPI finding the dependency by its name/signature if not by object.
        # A common pattern is to have a global dependencies.py or similar.

    return TestClient(app)

# --- Router Tests ---

@patch('digame.app.crud.notification_crud.get_notifications_for_user')
def test_read_notifications(mock_get_notifications, client, mock_current_active_user):
    mock_notifications_list = [
        NotificationSchema(id=1, user_id=mock_current_active_user.id, message="Msg1", type="type1", is_read=False, created_at="2023-01-01T12:00:00Z"),
        NotificationSchema(id=2, user_id=mock_current_active_user.id, message="Msg2", type="type2", is_read=True, created_at="2023-01-02T12:00:00Z")
    ]
    mock_get_notifications.return_value = mock_notifications_list

    # Test without filter
    response = client.get("/api/notifications/")
    assert response.status_code == 200
    assert response.json() == [n.dict(exclude_none=True) for n in mock_notifications_list] # Pydantic v1 dict(), v2 model_dump()
    mock_get_notifications.assert_called_once_with(db=unittest.mock.ANY, user_id=mock_current_active_user.id, skip=0, limit=100, read_status=None)
    mock_get_notifications.reset_mock()

    # Test with read=false
    response_unread = client.get("/api/notifications/?read=false")
    assert response_unread.status_code == 200
    mock_get_notifications.assert_called_once_with(db=unittest.mock.ANY, user_id=mock_current_active_user.id, skip=0, limit=100, read_status=False)
    mock_get_notifications.reset_mock()

    # Test with read=true
    response_read = client.get("/api/notifications/?read=true")
    assert response_read.status_code == 200
    mock_get_notifications.assert_called_once_with(db=unittest.mock.ANY, user_id=mock_current_active_user.id, skip=0, limit=100, read_status=True)

@patch('digame.app.crud.notification_crud.mark_notification_as_read')
def test_mark_notification_as_read_endpoint(mock_mark_read, client, mock_current_active_user):
    notification_id = 1
    updated_notification_data = NotificationSchema(
        id=notification_id, user_id=mock_current_active_user.id, message="Updated", type="type1", is_read=True, created_at="2023-01-01T12:00:00Z"
    )

    # Case 1: Success
    mock_mark_read.return_value = updated_notification_data
    response_success = client.post(f"/api/notifications/{notification_id}/read")
    assert response_success.status_code == 200
    assert response_success.json() == updated_notification_data.dict(exclude_none=True)
    mock_mark_read.assert_called_once_with(db=unittest.mock.ANY, notification_id=notification_id, user_id=mock_current_active_user.id)
    mock_mark_read.reset_mock()

    # Case 2: Not found / Permission denied
    mock_mark_read.return_value = None
    response_not_found = client.post(f"/api/notifications/{notification_id + 1}/read")
    assert response_not_found.status_code == 404
    mock_mark_read.assert_called_once_with(db=unittest.mock.ANY, notification_id=notification_id + 1, user_id=mock_current_active_user.id)

@patch('digame.app.crud.notification_crud.mark_all_notifications_as_read_for_user')
def test_mark_all_user_notifications_as_read(mock_mark_all_read, client, mock_current_active_user):
    updated_notifications_list = [
        NotificationSchema(id=1, user_id=mock_current_active_user.id, message="Msg1", type="type1", is_read=True, created_at="2023-01-01T12:00:00Z")
    ]
    mock_mark_all_read.return_value = updated_notifications_list

    response = client.post("/api/notifications/all/read")

    assert response.status_code == 200
    assert response.json() == [n.dict(exclude_none=True) for n in updated_notifications_list]
    mock_mark_all_read.assert_called_once_with(db=unittest.mock.ANY, user_id=mock_current_active_user.id)

# Cleanup dependency overrides after tests if necessary, though TestClient typically handles this for its scope
@pytest.fixture(autouse=True, scope="module")
def cleanup_overrides():
    yield
    if app:
        app.dependency_overrides = {}
import unittest # for unittest.mock.ANY

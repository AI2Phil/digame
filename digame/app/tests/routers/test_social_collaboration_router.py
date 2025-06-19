import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, ANY
from datetime import datetime

# Attempt to import app, adjust if main is structured differently
try:
    from digame.app.main import app
except ImportError:
    app = None

# Assuming User model and NotificationCreate schema are available
from digame.app.models.user import User as UserModel
# from digame.app.schemas.notification_schemas import NotificationCreate # Not directly used in router, but by CRUD

# Mock user for dependency override
@pytest.fixture
def mock_current_active_user_social(): # Renamed to avoid conflict if tests are run together
    user = UserModel()
    user.id = 1 # Sender for send_connection_request, Acceptor for accept_connection_request
    user.full_name = "Social User"
    user.email = "social@example.com"
    return user

@pytest.fixture
def another_mock_user(): # Represents the peer or original requester
    user = UserModel()
    user.id = 2
    user.full_name = "Another Social User"
    user.email = "another@example.com"
    return user

@pytest.fixture
def client_social(mock_current_active_user_social):
    if app is None:
        pytest.skip("FastAPI app could not be imported for TestClient.", allow_module_level=True)

    # Override dependency for get_current_user used in social_collaboration.py
    # The social_collaboration.py uses its own mock get_current_user.
    # To test the actual FastAPI app behavior, we'd override the dependency injected by FastAPI.
    # For this subtask, we assume the social_collaboration router uses the standard get_current_active_user.
    # If it strictly uses its internal mock, these tests might not hit the overrides correctly without
    # further modification of social_collaboration.py to use a real FastAPI dependency.
    try:
        # Assuming social_collaboration.py was refactored to use a common auth dependency.
        from digame.app.auth.dependencies import get_current_active_user as actual_dependency
        app.dependency_overrides[actual_dependency] = lambda: mock_current_active_user_social
    except ImportError:
        print("Warning: Could not import actual get_current_active_user dependency for social router. Using placeholder.")
        # Fallback, hoping FastAPI picks it up or the router uses a mock that can be patched.
        # The social router had its own `get_current_user` mock. Patching that directly might be needed if it's not using FastAPI's DI for user.
        # For now, let's proceed assuming it uses a standard dependency.

    # For the mock get_user inside social_collaboration.py:
    # This needs to be patched where social_collaboration.py's get_user is defined/imported.
    # This is tricky because it's a local mock in that file.
    # The ideal way is that social_collaboration.py uses user_crud.get_user, which can be patched.

    return TestClient(app)

# --- Social Collaboration Router Tests ---

@patch('digame.app.routers.social_collaboration.get_user') # Patching the mock 'get_user' directly in the router file
@patch('digame.app.crud.notification_crud.create_notification')
def test_send_connection_request_triggers_notification(
    mock_create_notification,
    mock_router_get_user, # This is the mock get_user from social_collaboration.py
    client_social,
    mock_current_active_user_social,
    another_mock_user
):
    peer_id = another_mock_user.id
    mock_router_get_user.return_value = another_mock_user # Ensure target user is found by the router's get_user

    response = client_social.post(
        "/social/connections/request", # Endpoint from social_collaboration.py
        params={"peer_id": peer_id, "message": "Hello there"} # Query params as per that router
    )

    assert response.status_code == 200 # Assuming 200 for successful request based on its current mock
    # Check the structure of the success response from social_collaboration.py
    json_response = response.json()
    assert json_response["success"] is True
    assert f"Connection request sent to user {peer_id}" in json_response["message"]

    mock_create_notification.assert_called_once_with(
        db=ANY, # The mock db session from social_collaboration router
        notification=ANY, # Check specific fields of this object
        user_id=peer_id # Notification is for the receiver (peer_id)
    )
    # Check the notification content
    notification_arg = mock_create_notification.call_args[1]['notification']
    assert notification_arg.message == f"{mock_current_active_user_social.full_name or 'A user'} sent you a connection request."
    assert notification_arg.type == 'connection_request'


@patch('digame.app.routers.social_collaboration.get_user') # Patching the mock 'get_user'
@patch('digame.app.crud.notification_crud.create_notification')
def test_accept_connection_request_triggers_notification(
    mock_create_notification,
    mock_router_get_user, # Mock for get_user within social_collaboration.py
    client_social,
    mock_current_active_user_social, # This user is the one accepting the request
    another_mock_user # This user is the original sender
):
    original_sender_id = another_mock_user.id
    receiver_id = mock_current_active_user_social.id # Current user is the receiver who accepts

    # Mock that the original sender exists
    mock_router_get_user.return_value = another_mock_user

    # request_id format from social_collaboration.py: req_SENDERID_RECEIVERID_TIMESTAMP
    timestamp = int(datetime.now().timestamp())
    mock_request_id = f"req_{original_sender_id}_{receiver_id}_{timestamp}"

    response = client_social.post(f"/social/connections/requests/{mock_request_id}/accept")

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert f"Connection request {mock_request_id} accepted. Notification sent to user {original_sender_id}" in json_response["message"]

    mock_create_notification.assert_called_once_with(
        db=ANY,
        notification=ANY,
        user_id=original_sender_id # Notification is for the original sender
    )
    notification_arg = mock_create_notification.call_args[1]['notification']
    assert notification_arg.message == f"{mock_current_active_user_social.full_name or 'A user'} accepted your connection request."
    assert notification_arg.type == 'connection_accepted'

@patch('digame.app.routers.social_collaboration.get_user')
@patch('digame.app.crud.notification_crud.create_notification')
def test_accept_connection_request_invalid_request_id_format(
    mock_create_notification,
    mock_router_get_user,
    client_social
):
    invalid_request_id = "invalid_id_format"
    response = client_social.post(f"/social/connections/requests/{invalid_request_id}/accept")
    assert response.status_code == 400 # As per the logic in social_collaboration.py
    assert "Invalid request_id format" in response.json()["detail"]
    mock_create_notification.assert_not_called()

@patch('digame.app.routers.social_collaboration.get_user')
@patch('digame.app.crud.notification_crud.create_notification')
def test_accept_connection_request_original_requester_not_found(
    mock_create_notification,
    mock_router_get_user,
    client_social,
    mock_current_active_user_social
):
    original_sender_id = 999 # Non-existent user
    receiver_id = mock_current_active_user_social.id
    timestamp = int(datetime.now().timestamp())
    mock_request_id = f"req_{original_sender_id}_{receiver_id}_{timestamp}"

    mock_router_get_user.return_value = None # Simulate original requester not found

    response = client_social.post(f"/social/connections/requests/{mock_request_id}/accept")
    assert response.status_code == 404
    assert f"Original requester (ID: {original_sender_id}) not found" in response.json()["detail"]
    mock_create_notification.assert_not_called()


# Cleanup dependency overrides
@pytest.fixture(autouse=True, scope="module")
def cleanup_overrides_social():
    yield
    if app:
        app.dependency_overrides = {}

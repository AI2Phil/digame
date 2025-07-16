import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, ANY
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from fastapi import FastAPI

# Schemas for request/response validation
from app.schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from app.schemas.user_schemas import UserResponse as UserSchema # For mock user data

# Models (for creating mock return objects from services/crud)
from app.models.user import User as UserModel
from app.models.imports import UserProfile as UserProfileModel

# Service and CRUD to be mocked
from app.services.social_collaboration_service import SocialCollaborationService
from app.crud import user_crud

# Router to be tested
from app.routers.social_collaboration import router as social_router

# Attempt to import app, adjust if main is structured differently
try:
    from app.main import app
except ImportError:
    app = FastAPI()
    app.include_router(social_router)



# --- Test Client Fixture ---
@pytest.fixture
def client():
    return TestClient(app)

# --- Mock Service & CRUD Fixtures ---
@pytest.fixture
def mock_social_collaboration_service():
    return MagicMock(spec=SocialCollaborationService)

@pytest.fixture
def mock_user_crud_profile():
    # Mocking specific functions from user_crud that are used by this router
    mock_crud = MagicMock()
    mock_crud.get_user_profile = MagicMock()
    mock_crud.update_user_profile = MagicMock()
    mock_crud.get_user = MagicMock()
    return mock_crud

# --- Mock Authentication Fixture ---
@pytest.fixture
def mock_auth_user():
    now = datetime.now(timezone.utc)
    return create_mock_model(UserModel, id=1, username="testuser", email="test@example.com", is_active=True,
        created_at=now, updated_at=now, hashed_password="testpassword",
        first_name="Test", last_name="User")

@pytest.fixture
def another_mock_user():
    now = datetime.now(timezone.utc)
    return create_mock_model(UserModel, id=2, username="anotheruser", email="another@example.com", is_active=True,
        created_at=now, updated_at=now, hashed_password="testpassword",
        first_name="Another", last_name="User")

# --- Apply Dependency Overrides ---
@pytest.fixture(autouse=True)
def override_router_dependencies(
    mock_social_collaboration_service: MagicMock,
    mock_user_crud_profile: MagicMock,
    mock_auth_user: UserModel
):
    # Mock get_db from ..database which is used by get_current_active_user in router
    def get_mock_db_session_override():
        return MagicMock(spec=Session)

    def get_current_active_user_override():
        return mock_auth_user

    # Import the actual dependency functions to override them
    from app.database import get_db
    from app.auth.auth_dependencies import get_current_active_user
    
    app.dependency_overrides[get_db] = get_mock_db_session_override
    app.dependency_overrides[get_current_active_user] = get_current_active_user_override

    with patch('digame.app.routers.social_collaboration.user_crud', mock_user_crud_profile):
        yield

    app.dependency_overrides = {}


# --- Test Cases ---
def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
    # For testing purposes, we'll create a simple mock object
    # that behaves like the model but doesn't require database instantiation
    class MockModel:
        def __init__(self, **attrs):
            for key, value in attrs.items():
                setattr(self, key, value)
            # Set some default attributes that SQLAlchemy models typically have
            if not hasattr(self, 'id'):
                self.id = 1
            if not hasattr(self, 'created_at'):
                from datetime import datetime, timezone
                self.created_at = datetime.now(timezone.utc)
        
        def __repr__(self):
            attrs = []
            for key, value in self.__dict__.items():
                if not key.startswith('_'):
                    if isinstance(value, str) and len(value) > 20:
                        attrs.append(f"{key}='{value[:20]}...'")
                    else:
                        attrs.append(f"{key}={repr(value)}")
            return f"<{model_class.__name__}({', '.join(attrs)})>"
    
    return MockModel(**kwargs)


class TestSocialCollaborationRouterProfile:
    def test_read_user_profile_success(self, client: TestClient, mock_user_crud_profile: MagicMock, mock_auth_user: UserModel):
        user_id = mock_auth_user.id
        mock_profile = UserProfileModel(user_id=user_id, bio="Test bio", updated_at=datetime.now(timezone.utc))
        mock_user_crud_profile.get_user_profile.return_value = mock_profile

        response = client.get(f"/api/v1/social/users/{user_id}/profile")

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["user_id"] == user_id
        assert json_response["bio"] == "Test bio"
        mock_user_crud_profile.get_user_profile.assert_called_once_with(ANY, user_id=user_id)

    def test_read_user_profile_forbidden(self, client: TestClient, mock_auth_user: UserModel):
        # User 1 tries to access profile of User 2
        other_user_id = mock_auth_user.id + 1
        response = client.get(f"/api/v1/social/users/{other_user_id}/profile")
        assert response.status_code == 403 # Based on current router logic

    def test_update_user_social_profile_success(self, client: TestClient, mock_user_crud_profile: MagicMock, mock_auth_user: UserModel):
        user_id = mock_auth_user.id
        profile_update_data = {"bio": "Updated bio", "location": "New Location"}

        # Mock the return value of update_user_profile
        updated_profile_model = UserProfileModel(
            user_id=user_id,
            **profile_update_data,
            updated_at=datetime.now(timezone.utc)
        )
        mock_user_crud_profile.update_user_profile.return_value = updated_profile_model

        response = client.put(f"/api/v1/social/users/{user_id}/profile", json=profile_update_data)

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["bio"] == "Updated bio"
        assert json_response["location"] == "New Location"
        # Check that the mock was called with a UserProfileUpdate instance or compatible dict
        # Create UserProfileUpdate with proper types to avoid schema validation issues
        expected_profile_update = UserProfileUpdate(
            bio=profile_update_data.get("bio"),
            location=profile_update_data.get("location"),
            skills=None,
            learning_goals=None,
            interests=None,
            mentorship_preferences=None,
            linkedin_url=None,
            github_url=None
        )
        mock_user_crud_profile.update_user_profile.assert_called_once_with(
            ANY, user_id=user_id, profile_update=expected_profile_update
        )

class TestSocialCollaborationRouterMatching:
    def test_get_social_matches_skill_type(
        self, client: TestClient, mock_social_collaboration_service: MagicMock,
        mock_user_crud_profile: MagicMock, mock_auth_user: UserModel
    ):
        user_id = mock_auth_user.id
        now = datetime.now(timezone.utc)
        mock_matched_user = create_mock_model(UserModel, id=2, username="match", email="m@e.com", created_at=now, updated_at=now, hashed_password="pw")
        mock_matched_user_profile = UserProfileModel(user_id=2, skills=["Python"], updated_at=now)

        mock_social_collaboration_service.get_skill_based_matches.return_value = [mock_matched_user]
        # Mock the get_user_profile call that happens inside the router for UserWithProfileResponse
        mock_user_crud_profile.get_user_profile.return_value = mock_matched_user_profile

        response = client.get(f"/api/v1/social/users/{user_id}/peer-matches?match_type=skill&limit=5")

        assert response.status_code == 200
        json_response = response.json()
        assert len(json_response) == 1
        assert json_response[0]["id"] == mock_matched_user.id
        assert json_response[0]["profile"]["skills"] == ["Python"]
        mock_social_collaboration_service.get_skill_based_matches.assert_called_once_with(user_id=user_id, limit=5)

    def test_get_social_matches_learning_partner_type(
        self, client: TestClient, mock_social_collaboration_service: MagicMock,
        mock_user_crud_profile: MagicMock, mock_auth_user: UserModel
    ):
        user_id = mock_auth_user.id
        now = datetime.now(timezone.utc)
        mock_partner_user = create_mock_model(UserModel, id=3, username="partner", email="p@e.com", created_at=now, updated_at=now, hashed_password="pw")
        mock_partner_user_profile = UserProfileModel(user_id=3, learning_goals=["FastAPI"], updated_at=now)

        mock_social_collaboration_service.get_learning_partner_recommendations.return_value = [mock_partner_user]
        mock_user_crud_profile.get_user_profile.return_value = mock_partner_user_profile

        response = client.get(f"/api/v1/social/users/{user_id}/peer-matches?match_type=learning_partner&limit=3")

        assert response.status_code == 200
        json_response = response.json()
        assert len(json_response) == 1
        assert json_response[0]["id"] == mock_partner_user.id
        assert json_response[0]["profile"]["learning_goals"] == ["FastAPI"]
        mock_social_collaboration_service.get_learning_partner_recommendations.assert_called_once_with(user_id=user_id, limit=3)

    def test_get_social_matches_invalid_match_type(self, client: TestClient, mock_auth_user: UserModel):
        user_id = mock_auth_user.id
        response = client.get(f"/api/v1/social/users/{user_id}/peer-matches?match_type=invalid_type")
        assert response.status_code == 400 # Bad Request

class TestSocialCollaborationNotifications:
    @patch('digame.app.crud.notification_crud.create_notification')
    def test_send_connection_request_triggers_notification(
        self,
        mock_create_notification,
        client: TestClient,
        mock_user_crud_profile: MagicMock,
        mock_auth_user: UserModel,
        another_mock_user: UserModel
    ):
        peer_id = another_mock_user.id
        mock_user_crud_profile.get_user.return_value = another_mock_user

        response = client.post(
            "/api/v1/social/connections/request",
            params={"peer_id": str(peer_id), "message": "Hello there"}
        )

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["success"] is True
        assert f"Connection request sent to user {peer_id}" in json_response["message"]

        mock_create_notification.assert_called_once_with(
            db=ANY,
            notification=ANY,
            user_id=peer_id
        )
        # Check the notification content
        notification_arg = mock_create_notification.call_args[1]['notification']
        assert notification_arg.message == f"{mock_auth_user.first_name or 'A user'} sent you a connection request."
        assert notification_arg.type == 'connection_request'

    @patch('digame.app.crud.notification_crud.create_notification')
    def test_accept_connection_request_triggers_notification(
        self,
        mock_create_notification,
        client: TestClient,
        mock_user_crud_profile: MagicMock,
        mock_auth_user: UserModel,
        another_mock_user: UserModel
    ):
        original_sender_id = another_mock_user.id
        receiver_id = mock_auth_user.id

        # Mock that the original sender exists
        mock_user_crud_profile.get_user.return_value = another_mock_user

        # request_id format from social_collaboration.py: req_SENDERID_RECEIVERID_TIMESTAMP
        timestamp = int(datetime.now().timestamp())
        mock_request_id = f"req_{original_sender_id}_{receiver_id}_{timestamp}"

        response = client.post(f"/api/v1/social/connections/requests/{mock_request_id}/accept")

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["success"] is True
        assert f"Connection request {mock_request_id} accepted. Notification sent to user {original_sender_id}" in json_response["message"]

        mock_create_notification.assert_called_once_with(
            db=ANY,
            notification=ANY,
            user_id=original_sender_id
        )
        notification_arg = mock_create_notification.call_args[1]['notification']
        assert notification_arg.message == f"{mock_auth_user.first_name or 'A user'} accepted your connection request."
        assert notification_arg.type == 'connection_accepted'

    @patch('digame.app.crud.notification_crud.create_notification')
    def test_accept_connection_request_invalid_request_id_format(
        self,
        mock_create_notification,
        client: TestClient
    ):
        invalid_request_id = "invalid_id_format"
        response = client.post(f"/api/v1/social/connections/requests/{invalid_request_id}/accept")
        assert response.status_code == 400
        assert "Invalid request_id format" in response.json()["detail"]
        mock_create_notification.assert_not_called()

    @patch('digame.app.crud.notification_crud.create_notification')
    def test_accept_connection_request_original_requester_not_found(
        self,
        mock_create_notification,
        client: TestClient,
        mock_user_crud_profile: MagicMock,
        mock_auth_user: UserModel
    ):
        original_sender_id = 999  # Non-existent user
        receiver_id = mock_auth_user.id
        timestamp = int(datetime.now().timestamp())
        mock_request_id = f"req_{original_sender_id}_{receiver_id}_{timestamp}"

        mock_user_crud_profile.get_user.return_value = None  # Simulate original requester not found

        response = client.post(f"/api/v1/social/connections/requests/{mock_request_id}/accept")
        assert response.status_code == 404
        assert f"Original requester (ID: {original_sender_id}) not found" in response.json()["detail"]
        mock_create_notification.assert_not_called()

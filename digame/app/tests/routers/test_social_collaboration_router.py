import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, ANY
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from fastapi import FastAPI

# Schemas for request/response validation
from digame.app.schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from digame.app.schemas.user_schemas import User as UserSchema # For mock user data

# Models (for creating mock return objects from services/crud)
from digame.app.models.user import User as UserModel, UserProfile as UserProfileModel

# Service and CRUD to be mocked
from digame.app.services.social_collaboration_service import SocialCollaborationService
from digame.app.crud import user_crud

# Router to be tested
from digame.app.routers.social_collaboration import router as social_router # Corrected import

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
def mock_user_crud_profile(): # Renamed to avoid conflict if user_crud is mocked elsewhere
    # Mocking specific functions from user_crud that are used by this router
    mock_crud = MagicMock()
    mock_crud.get_user_profile = MagicMock()
    mock_crud.update_user_profile = MagicMock()
    return mock_crud

# --- Mock Authentication Fixture ---
@pytest.fixture
def mock_auth_user():
    now = datetime.now(timezone.utc)
    return UserModel(
        id=1, username="testuser", email="test@example.com", is_active=True,
        created_at=now, updated_at=now, hashed_password="testpassword"
    )

# --- Apply Dependency Overrides ---
@pytest.fixture(autouse=True)
def override_router_dependencies(
    mock_social_collaboration_service: MagicMock,
    mock_user_crud_profile: MagicMock, # Use the renamed fixture
    mock_auth_user: UserModel
):
    # Mock get_db from ..database which is used by get_current_active_user in router
    # and also passed to service/crud if not directly mocked at instantiation
    def get_mock_db_session_override():
        return MagicMock(spec=Session)

    def get_current_active_user_override():
        return mock_auth_user

    # Patch where user_crud is imported and used in the router
    # This is tricky if router imports specific functions vs the whole module.
    # Assuming router does `from ..crud import user_crud`
    # If user_crud module itself is used, patching it globally for the test session:

    # For services instantiated in the router:
    def get_mock_social_collaboration_service_override():
        # Pass a mock DB if the service expects it, though its methods will be mocked too
        return mock_social_collaboration_service

    app.dependency_overrides[social_router.get_db] = get_mock_db_session_override
    app.dependency_overrides[social_router.get_current_active_user] = get_current_active_user_override

    # To mock user_crud.get_user_profile and user_crud.update_user_profile,
    # we need to patch them where they are looked up by FastAPI's dependency injection,
    # or ensure the service/router uses a mockable version.
    # The router directly calls user_crud.get_user_profile(db, ...) etc.
    # So, we need to ensure that `db` passed to it is a mock, or patch `user_crud` itself.
    # The most straightforward way for this test setup is to ensure `SocialCollaborationService`
    # and direct `user_crud` calls use mocked versions.
    # Instantiating service with mocked DB is handled by get_mock_social_collaboration_service_override.
    # For direct crud calls in router:
    # We can't easily override `user_crud` module directly here without `mocker` fixture from pytest-mock or complex patching.
    # Instead, we'll ensure service calls are mocked, and for direct crud calls, we'll rely on `get_db` being mocked.
    # The get_user_profile and update_user_profile endpoints directly call user_crud.
    # We will patch these crud functions directly for these tests.

    with patch('digame.app.routers.social_collaboration.user_crud', mock_user_crud_profile):
        # For SocialCollaborationService, ensure it's instantiated with a mock DB
        # The router instantiates it like: service = SocialCollaborationService(db)
        # So, as long as `db` (from get_db) is mocked, the service gets a mock DB.
        # And the service's methods themselves are on `mock_social_collaboration_service`.
        yield

    app.dependency_overrides = {}


# --- Test Cases ---

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
        mock_user_crud_profile.update_user_profile.assert_called_once_with(
            ANY, user_id=user_id, profile_update=UserProfileUpdate(**profile_update_data)
        )

class TestSocialCollaborationRouterMatching:
    def test_get_social_matches_skill_type(
        self, client: TestClient, mock_social_collaboration_service: MagicMock,
        mock_user_crud_profile: MagicMock, mock_auth_user: UserModel
    ):
        user_id = mock_auth_user.id
        now = datetime.now(timezone.utc)
        mock_matched_user = UserModel(id=2, username="match", email="m@e.com", created_at=now, updated_at=now, hashed_password="pw")
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
        mock_partner_user = UserModel(id=3, username="partner", email="p@e.com", created_at=now, updated_at=now, hashed_password="pw")
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

# TODO: Add tests for deprecated skill-matches endpoint if it needs to be actively maintained.
# TODO: Add tests for authorization failures (e.g., user trying to get matches for another user).
# TODO: Test other placeholder endpoints if their behavior (returning "Not implemented") is important.
```

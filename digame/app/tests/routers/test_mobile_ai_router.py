import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, ANY
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from fastapi import FastAPI

# Schemas for request/response validation and creating request bodies
from digame.app.schemas.mobile_ai_schemas import (
    UserNotificationPrefsRequest,
    NotificationPrefsResponse,
    NotificationTriggersResponse,
    NotificationTrigger, # For constructing mock service responses
    VoiceCommandRequest,
    VoiceCommandResponse
)

# Model for mock authenticated user
from digame.app.models.user import User as UserModel

# Service to be mocked
from digame.app.services.mobile_ai_service import MobileAIService

# Router to be tested
from digame.app.routers.mobile_ai_router import router as mobile_ai_api_router # Ensure correct import alias

# Create a minimal FastAPI app for testing the router
app = FastAPI()
app.include_router(mobile_ai_api_router)

# --- Test Client Fixture ---
@pytest.fixture
def client():
    return TestClient(app)

# --- Mock Service Fixture ---
@pytest.fixture
def mock_mobile_ai_service():
    service = MagicMock(spec=MobileAIService)
    # Ensure async methods are mocked with async_return_value if they are true async
    # or just return_value if they are defined as `async def` but don't `await` anything internally (like current mocks)
    service.save_user_notification_preferences = MagicMock(return_value=True) # Original is async but returns bool
    service.get_ai_notification_triggers = MagicMock(return_value=[]) # Original is async but returns list
    service.interpret_voice_command = MagicMock() # Original is async
    return service

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
def override_router_dependencies_mobile_ai(
    mock_mobile_ai_service: MagicMock,
    mock_auth_user: UserModel
):
    def get_mock_db_session_override():
        return MagicMock(spec=Session) # Router passes this to service constructor

    def get_current_active_user_override():
        return mock_auth_user

    def get_mock_mobile_ai_service_override(): # This will inject the MagicMock instance
        # If service was initialized with db: MobileAIService(db=get_mock_db_session_override())
        # But we want to use the already created mock_mobile_ai_service instance
        return mock_mobile_ai_service

    app.dependency_overrides[mobile_ai_api_router.get_db] = get_mock_db_session_override
    app.dependency_overrides[mobile_ai_api_router.get_current_active_user] = get_current_active_user_override
    app.dependency_overrides[mobile_ai_api_router.get_mobile_ai_service] = get_mock_mobile_ai_service_override

    yield
    app.dependency_overrides = {}


# --- Test Cases ---

class TestMobileAIRouterNotifications:
    async def test_configure_ai_notification_settings_success(self, client: TestClient, mock_mobile_ai_service: MagicMock, mock_auth_user: UserModel):
        prefs_payload = {
            "notification_enabled_types": ["task_updates"],
            "preferred_times": ["10:00"],
            "behavior_summary": {"logins_last_7_days": 10}
        }
        # Mock the service method to return True for success
        mock_mobile_ai_service.save_user_notification_preferences.return_value = True # It's an async def but returns bool

        response = client.post("/api/v1/mobile/ai/notifications/settings", json=prefs_payload)

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["status"] == "success"
        assert json_response["message"] == "Notification preferences saved successfully."

        # Verify service call
        # The actual UserNotificationPrefsRequest object is created by FastAPI based on payload
        # So we check that the service was called with an instance of it, and correct user_id
        mock_mobile_ai_service.save_user_notification_preferences.assert_called_once()
        call_args = mock_mobile_ai_service.save_user_notification_preferences.call_args
        assert call_args[1]['user_id'] == mock_auth_user.id
        assert isinstance(call_args[1]['prefs'], UserNotificationPrefsRequest)
        assert call_args[1]['prefs'].behavior_summary == prefs_payload["behavior_summary"]


    async def test_fetch_ai_notification_triggers_success(self, client: TestClient, mock_mobile_ai_service: MagicMock, mock_auth_user: UserModel):
        mock_trigger_data = [
            NotificationTrigger(trigger_type="daily", message_template="Hello!", relative_schedule_info={"type":"daily_at", "time":"08:00"})
        ]
        # Mock the service method to return a list of these Pydantic models
        mock_mobile_ai_service.get_ai_notification_triggers.return_value = mock_trigger_data

        response = client.get("/api/v1/mobile/ai/notifications/triggers")

        assert response.status_code == 200
        json_response = response.json()
        assert len(json_response["triggers"]) == 1
        assert json_response["triggers"][0]["trigger_type"] == "daily"
        mock_mobile_ai_service.get_ai_notification_triggers.assert_called_once_with(user_id=mock_auth_user.id)

class TestMobileAIRouterVoiceCommands:
    async def test_interpret_voice_command_success(self, client: TestClient, mock_mobile_ai_service: MagicMock, mock_auth_user: UserModel):
        command_payload = {"text": "Go to dashboard", "language": "en-US"}
        mock_service_response = VoiceCommandResponse(
            intent="navigate_to_screen",
            parameters={"screen_name": "Dashboard"},
            responseText="Navigating to Dashboard."
        )
        # Mock the service method
        mock_mobile_ai_service.interpret_voice_command.return_value = mock_service_response

        response = client.post("/api/v1/mobile/ai/voice/interpret", json=command_payload)

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["intent"] == "navigate_to_screen"
        assert json_response["parameters"]["screen_name"] == "Dashboard"

        # Verify service call
        mock_mobile_ai_service.interpret_voice_command.assert_called_once()
        call_args = mock_mobile_ai_service.interpret_voice_command.call_args
        assert call_args[1]['user_id'] == mock_auth_user.id
        assert isinstance(call_args[1]['command_request'], VoiceCommandRequest)
        assert call_args[1]['command_request'].text == command_payload["text"]

    async def test_interpret_voice_command_service_error(self, client: TestClient, mock_mobile_ai_service: MagicMock):
        command_payload = {"text": "Error please"}
        # Simulate an error from the service layer
        mock_mobile_ai_service.interpret_voice_command.side_effect = Exception("NLU engine exploded")

        response = client.post("/api/v1/mobile/ai/voice/interpret", json=command_payload)

        assert response.status_code == 500 # As per the router's general exception handler
        assert "An error occurred during voice command interpretation" in response.json()["detail"]

# TODO: Add tests for authentication failures (e.g., user not authenticated).
# TODO: Add tests for validation errors (e.g., missing 'text' in VoiceCommandRequest).
```

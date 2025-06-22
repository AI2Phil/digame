import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from datetime import datetime, timezone

# Schemas to create request objects and validate response types
from digame.app.schemas.mobile_ai_schemas import UserNotificationPrefsRequest, VoiceCommandRequest, NotificationTrigger, VoiceCommandResponse

# Service to test
from digame.app.services.mobile_ai_service import MobileAIService

# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    # MobileAIService currently doesn't use the db session for its core logic (uses mock data)
    # but it's part of the constructor, so we provide a mock.
    return MagicMock(spec=Session)

@pytest.fixture
def mobile_ai_service(mock_db_session):
    return MobileAIService(db=mock_db_session)

# --- Tests for MobileAIService ---

class TestMobileAIServiceNotifications:
    async def test_save_user_notification_preferences(self, mobile_ai_service: MobileAIService):
        user_id = 1
        prefs_data = UserNotificationPrefsRequest(
            notification_enabled_types=["task_updates", "daily_summary"],
            preferred_times=["09:00", "21:00"],
            behavior_summary={"completed_tasks_today": 5}
        )
        # The service method is async
        success = await mobile_ai_service.save_user_notification_preferences(user_id, prefs_data)
        assert success is True # Current mock implementation returns True

    async def test_get_ai_notification_triggers(self, mobile_ai_service: MobileAIService):
        user_id = 1
        # The service method is async
        triggers = await mobile_ai_service.get_ai_notification_triggers(user_id)

        assert isinstance(triggers, list)
        assert len(triggers) >= 2 # Based on current mock logic (daily_summary, task_completion_prompt)
        for trigger in triggers:
            assert isinstance(trigger, NotificationTrigger)
            assert "trigger_type" in trigger.model_fields # Check if it's a Pydantic model instance
            assert "message_template" in trigger.model_fields

    async def test_get_ai_notification_triggers_personalization_even_userid(self, mobile_ai_service: MobileAIService):
        user_id = 2 # Even user ID
        triggers = await mobile_ai_service.get_ai_notification_triggers(user_id)
        # Check if the productivity_tip trigger is present for even user IDs
        assert any(t.trigger_type == "productivity_tip" for t in triggers)
        assert len(triggers) > 2 # Should have more than the base triggers

    async def test_get_ai_notification_triggers_personalization_odd_userid(self, mobile_ai_service: MobileAIService):
        user_id = 1 # Odd user ID
        triggers = await mobile_ai_service.get_ai_notification_triggers(user_id)
        # Check that the productivity_tip trigger is NOT present for odd user IDs
        assert not any(t.trigger_type == "productivity_tip" for t in triggers)
        assert len(triggers) >= 2 # At least base triggers


class TestMobileAIServiceVoiceCommands:
    @pytest.mark.parametrize("command_text, expected_intent, expected_screen, expected_response_part", [
        ("go to analytics dashboard", "navigate_to_screen", "Analytics", "Navigating to Analytics"),
        ("open my dashboard", "navigate_to_screen", "Dashboard", "Navigating to Dashboard"),
        ("show my tasks", "query_data", None, "Fetching your pending tasks"),
        ("display tasks", "query_data", None, "Fetching your pending tasks"),
        ("create a new task called Buy Groceries", "create_item", None, "Adding a new task. It's called 'Buy Groceries'"),
        ("add reminder to submit report", "create_item", None, "Adding a new task. It's called 'submit report'"),
        ("new note about project alpha", "create_item", None, "Okay, creating a new note."),
        ("what can I say?", "show_help", None, "You can ask me to navigate"),
        ("this is an unknown command", "unknown_command", None, "Sorry, I didn't understand"),
    ])
    async def test_interpret_voice_command_various_inputs(
        self, mobile_ai_service: MobileAIService,
        command_text, expected_intent, expected_screen, expected_response_part
    ):
        user_id = 1
        command_req = VoiceCommandRequest(text=command_text)
        # The service method is async
        response = await mobile_ai_service.interpret_voice_command(user_id, command_req)

        assert isinstance(response, VoiceCommandResponse)
        assert response.intent == expected_intent
        if expected_screen:
            assert response.parameters is not None
            assert response.parameters.get("screen_name") == expected_screen
        if "Buy Groceries" in command_text: # Example for parameter extraction
             assert response.parameters is not None
             assert response.parameters.get("title") == "Buy Groceries"

        assert response.responseText is not None
        assert expected_response_part.lower() in response.responseText.lower()

    async def test_interpret_voice_command_language_parameter(self, mobile_ai_service: MobileAIService):
        user_id = 1
        command_req = VoiceCommandRequest(text="ayuda", language="es-ES") # Help in Spanish
        # Current mock NLU is English keyword based, so it will likely be unknown
        response = await mobile_ai_service.interpret_voice_command(user_id, command_req)

        # This tests that the language parameter is received, not necessarily that it's used by the mock.
        # The print statement in the service would show the language.
        assert response.intent == "unknown_command"
        # A real NLU would use the language parameter.
```

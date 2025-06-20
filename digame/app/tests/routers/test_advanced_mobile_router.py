from fastapi.testclient import TestClient
from digame.app.main import app # Assuming main.py is in digame.app
import io

client = TestClient(app)

def test_transcribe_voice_mock():
    mock_audio_content = b"fake audio data for testing"
    # When using TestClient, the file tuple is: (filename, file-like-object, content_type)
    files = {"audio_file": ("test_audio.m4a", io.BytesIO(mock_audio_content), "audio/m4a")}

    response = client.post("/mobile-ai/voice/transcribe", files=files)

    assert response.status_code == 200
    assert response.json() == {
        "transcription": "This is a mock transcription from the backend.",
        "engine": "mock_engine_v1"
    }

def test_transcribe_voice_no_file_mock():
    # Test case where no file is provided (FastAPI should handle this with a 422 or a specific error if validated in endpoint)
    # However, our current endpoint uses `File(...)` which makes it required.
    # TestClient might raise an error before even sending if the client-side validation is strict,
    # or FastAPI will return a 422 if the field is missing.
    response = client.post("/mobile-ai/voice/transcribe") # No files attached
    assert response.status_code == 422 # Expecting Unprocessable Entity for missing file
    # The exact error detail might vary based on FastAPI version and Pydantic.
    # Example check: assert "field required" in response.json()["detail"][0]["msg"].lower()


def test_recognize_intent_analytics_mock():
    payload = {"text": "Can you show me my app analytics?"}
    response = client.post("/mobile-ai/voice/intent", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "VIEW_ANALYTICS"
    assert data["confidence"] == 0.9
    assert "Mock: User wants to view analytics." in data["message"]

def test_recognize_intent_goal_mock():
    payload = {"text": "I want to set a new goal for my project."}
    response = client.post("/mobile-ai/voice/intent", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "CREATE_GOAL"
    assert data["confidence"] == 0.88
    assert data["slots"] == {"type": "generic"}
    assert "Mock: User wants to create a goal." in data["message"]

def test_recognize_intent_unknown_mock():
    payload = {"text": "What's the weather like today?"}
    response = client.post("/mobile-ai/voice/intent", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "UNKNOWN_INTENT"
    assert data["confidence"] == 0.4
    assert "Mock: Intent could not be determined." in data["message"]

def test_recognize_intent_empty_text_mock():
    # Test how the backend handles empty text, depends on Pydantic model validation
    # Pydantic's `str` by default allows empty strings.
    # If `min_length=1` was on TranscriptionInput.text, this would be a 422.
    payload = {"text": ""}
    response = client.post("/mobile-ai/voice/intent", json=payload)
    assert response.status_code == 200 # Current mock logic doesn't penalize empty string
    data = response.json()
    assert data["intent"] == "UNKNOWN_INTENT" # Falls into the else block

def test_personalize_notifications_mock():
    payload = {
        "user_id": "test_user_backend_123",
        "current_context": {
            "screen": "dashboard",
            "time_of_day": "morning"
        }
    }
    response = client.post("/mobile-ai/notifications/personalize", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success_mock"
    assert "Mock: Notification personalization processed." in data["message"]
    assert data["personalized_schedule"] is not None
    assert data["personalized_schedule"]["next_notification_at"] == "mock_time_tomorrow"
    assert data["personalized_schedule"]["strategy"] == "behavioral_mock"

def test_personalize_notifications_minimal_payload_mock():
    # Testing with only the required user_id
    payload = {"user_id": "minimal_user_456"}
    response = client.post("/mobile-ai/notifications/personalize", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success_mock"
    assert "Mock: Notification personalization processed." in data["message"]

def test_personalize_notifications_missing_userid_mock():
    # Pydantic model NotificationPersonalizationRequest requires user_id
    payload = {"current_context": {"screen": "settings"}}
    response = client.post("/mobile-ai/notifications/personalize", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    # Example check: assert response.json()["detail"][0]["loc"] == ["body", "user_id"]
    # Example check: assert "field required" in response.json()["detail"][0]["msg"].lower()

# To run these tests (if you have pytest installed):
# Ensure your PYTHONPATH is set up correctly if running from outside the project root, e.g.,
# export PYTHONPATH=$PYTHONPATH:/path/to/your/project/digame
# Then, from the root of the `digame` project:
# pytest app/tests/routers/test_advanced_mobile_router.py

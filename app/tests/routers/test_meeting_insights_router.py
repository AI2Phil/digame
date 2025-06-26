import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status

from app.main import app # Main FastAPI app
from app.schemas.meeting_insights_schemas import MeetingAnalysisResponse
from app.models.user import User as UserModel



# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---
@pytest.fixture
def mock_meeting_insights_service():
    service = MagicMock()
    return service

@pytest.fixture
def mock_current_active_user_for_insights(): # Renamed for clarity
    user = create_mock_model(UserModel, id=4, email="insights_router_user@example.com", full_name="Insights Router Test User", is_active=True)
    user.tenants = [] # Initialize as empty, can be populated by mock_tenant_user_link if needed by get_current_active_user
    return user

# --- Router Tests ---
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


def test_analyze_endpoint_success(client, mock_meeting_insights_service, mock_current_active_user_for_insights):
    # Arrange
    expected_analysis_result = {
        "summary": "Mocked summary of the important meeting.",
        "key_points": ["Point A", "Point B"],
        "action_items": ["Action 1", "Action 2"],
        "analysis_level": "premium",
        "text_length": 150
    }
    mock_meeting_insights_service.get_meeting_analysis = MagicMock(return_value=expected_analysis_result)

    # Import dependency provider functions for overriding
    from app.auth.auth_dependencies import get_current_active_user
    from app.services.meeting_insights_service import get_meeting_insights_service

    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_insights
    app.dependency_overrides[get_meeting_insights_service] = lambda: mock_meeting_insights_service

    request_payload = {"meeting_text": "This is an important meeting about various topics that need to be discussed and actioned upon."}

    # Action
    response = client.post("/ai/meeting-insights/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["original_text_length"] == len(request_payload["meeting_text"])
    assert data["analysis"] == expected_analysis_result
    assert data["error_message"] is None

    mock_meeting_insights_service.get_meeting_analysis.assert_called_once_with(
        current_user=mock_current_active_user_for_insights,
        meeting_text=request_payload["meeting_text"]
    )

def test_analyze_endpoint_service_raises_http_exception(client, mock_meeting_insights_service, mock_current_active_user_for_insights):
    # Arrange
    mock_meeting_insights_service.get_meeting_analysis = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Meeting Insights feature not enabled for your tenant.")
    )
    from app.auth.auth_dependencies import get_current_active_user
    from app.services.meeting_insights_service import get_meeting_insights_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_insights
    app.dependency_overrides[get_meeting_insights_service] = lambda: mock_meeting_insights_service

    request_payload = {"meeting_text": "A sample meeting text for testing HTTP exception."}

    # Action
    response = client.post("/ai/meeting-insights/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Meeting Insights feature not enabled for your tenant."

def test_analyze_endpoint_service_raises_unexpected_exception(client, mock_meeting_insights_service, mock_current_active_user_for_insights):
    # Arrange
    mock_meeting_insights_service.get_meeting_analysis = MagicMock(
        side_effect=ConnectionError("External service connection failed badly.") # A non-HTTPException
    )
    from app.auth.auth_dependencies import get_current_active_user
    from app.services.meeting_insights_service import get_meeting_insights_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_insights
    app.dependency_overrides[get_meeting_insights_service] = lambda: mock_meeting_insights_service

    request_payload = {"meeting_text": "Meeting text that will trigger an unexpected connection error."}

    # Action
    response = client.post("/ai/meeting-insights/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 500
    data = response.json()
    assert "unexpected error occurred" in data["detail"].lower()
    assert "connection failed badly" in data["detail"].lower()

def test_analyze_endpoint_invalid_input_too_short(client, mock_current_active_user_for_insights):
    # Arrange
    from app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_insights
    # Service mock not needed as Pydantic validation should catch this first.

    request_payload = {"meeting_text": "Too short."} # Less than 50 characters as per schema

    # Action
    response = client.post("/ai/meeting-insights/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422 # Unprocessable Entity
    data = response.json()
    assert "detail" in data
    assert any("ensure this value has at least 50 characters" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "meeting_text"])

def test_analyze_endpoint_missing_text_input(client, mock_current_active_user_for_insights):
    # Arrange
    from app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_insights

    request_payload = {} # meeting_text field is missing

    # Action
    response = client.post("/ai/meeting-insights/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422
    data = response.json()
    assert any("field required" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "meeting_text"])

def test_health_check_endpoint(client):
    # Action
    response = client.get("/ai/meeting-insights/health")

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy", "service": "AI - Meeting Insights & Summaries"}

# Fixture to clear dependency overrides after each test automatically
@pytest.fixture(autouse=True)
def cleanup_dependency_overrides_insights_router(): # Renamed to be specific
    yield
    app.dependency_overrides.clear()

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status

from digame.app.main import app # Main FastAPI app
from digame.app.schemas.communication_style_schemas import CommunicationStyleAnalysisResponse
from digame.app.models.user import User as UserModel

# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---
@pytest.fixture
def mock_communication_style_service():
    service = MagicMock()
    return service

@pytest.fixture
def mock_current_active_user_for_comm_style():
    user = UserModel(id=2, email="comm_router_user@example.com", full_name="Comm Router Test User", is_active=True)
    # Ensure this mock user has `tenants` attribute if service relies on it, even if empty for some tests.
    # For router tests, the service is mocked, so direct user structure might be less critical
    # unless get_current_active_user itself does deep checks.
    user.tenants = []
    return user

# --- Router Tests ---

def test_analyze_endpoint_success(client, mock_communication_style_service, mock_current_active_user_for_comm_style):
    # Arrange
    expected_analysis_result = {"style": "assertive", "confidence": 0.9, "keywords": ["urgent"]}
    mock_communication_style_service.get_communication_style_analysis = MagicMock(return_value=expected_analysis_result)

    # Import dependency provider functions for overriding
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.communication_style_service import get_communication_style_service

    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_comm_style
    app.dependency_overrides[get_communication_style_service] = lambda: mock_communication_style_service

    request_payload = {"text_input": "This is an urgent request that needs immediate attention."}

    # Action
    response = client.post("/ai/communication-style/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["original_text_length"] == len(request_payload["text_input"])
    assert data["analysis"] == expected_analysis_result
    assert data["error_message"] is None

    mock_communication_style_service.get_communication_style_analysis.assert_called_once_with(
        current_user=mock_current_active_user_for_comm_style,
        text_input=request_payload["text_input"]
    )
    app.dependency_overrides.clear()


def test_analyze_endpoint_service_raises_http_exception(client, mock_communication_style_service, mock_current_active_user_for_comm_style):
    # Arrange
    mock_communication_style_service.get_communication_style_analysis = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Communication Style Analysis feature not enabled.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.communication_style_service import get_communication_style_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_comm_style
    app.dependency_overrides[get_communication_style_service] = lambda: mock_communication_style_service

    request_payload = {"text_input": "Some text for analysis here."}

    # Action
    response = client.post("/ai/communication-style/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Communication Style Analysis feature not enabled."
    app.dependency_overrides.clear()


def test_analyze_endpoint_service_raises_unexpected_exception(client, mock_communication_style_service, mock_current_active_user_for_comm_style):
    # Arrange
    mock_communication_style_service.get_communication_style_analysis = MagicMock(
        side_effect=RuntimeError("A very unexpected runtime error occurred in service.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.communication_style_service import get_communication_style_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_comm_style
    app.dependency_overrides[get_communication_style_service] = lambda: mock_communication_style_service

    request_payload = {"text_input": "Text that will trigger an unexpected error."}

    # Action
    response = client.post("/ai/communication-style/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 500
    data = response.json()
    assert "unexpected error occurred" in data["detail"].lower()
    assert "runtime error occurred" in data["detail"].lower()
    app.dependency_overrides.clear()


def test_analyze_endpoint_invalid_input_too_short(client, mock_current_active_user_for_comm_style):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_comm_style
    # Service mock not needed as Pydantic validation should catch this first.

    request_payload = {"text_input": "short"} # Less than 10 characters

    # Action
    response = client.post("/ai/communication-style/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422 # Unprocessable Entity
    data = response.json()
    assert "detail" in data
    assert any("ensure this value has at least 10 characters" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "text_input"])
    app.dependency_overrides.clear()


def test_analyze_endpoint_missing_text_input(client, mock_current_active_user_for_comm_style):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_comm_style

    request_payload = {} # text_input field is missing

    # Action
    response = client.post("/ai/communication-style/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422
    data = response.json()
    assert any("field required" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "text_input"])
    app.dependency_overrides.clear()


def test_health_check_endpoint(client):
    # Action
    response = client.get("/ai/communication-style/health")

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy", "service": "AI - Communication Style Analysis"}

# Fixture to clear dependency overrides after each test automatically
@pytest.fixture(autouse=True)
def cleanup_dependency_overrides():
    yield
    app.dependency_overrides.clear()

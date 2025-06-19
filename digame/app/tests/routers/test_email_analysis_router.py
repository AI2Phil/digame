import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status
from datetime import datetime

from digame.app.main import app # Main FastAPI app
from digame.app.schemas.email_analysis_schemas import EmailAnalysisResponse, EmailDataItem # Import schemas
from digame.app.models.user import User as UserModel

# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---
@pytest.fixture
def mock_email_analysis_service():
    service = MagicMock()
    return service

@pytest.fixture
def mock_current_active_user_for_email_analysis(): # Renamed for clarity
    user = UserModel(id=5, email="email_router_user@example.com", full_name="Email Router Test User", is_active=True)
    user.tenants = [] # Initialize as empty
    return user

@pytest.fixture
def sample_email_request_payload() -> dict:
    return {
        "emails_data": [
            {"subject": "Update on Project X", "sender": "manager@example.com", "timestamp": datetime.now().isoformat(), "body_snippet": "The project is progressing well."},
            {"subject": "Quick Question", "sender": "colleague@example.com", "timestamp": datetime.now().isoformat(), "body_snippet": "Can we meet briefly?"},
        ]
    }

# --- Router Tests ---

def test_analyze_endpoint_success(client, mock_email_analysis_service, mock_current_active_user_for_email_analysis, sample_email_request_payload):
    # Arrange
    expected_analysis_result = {
        "total_emails_processed": 2,
        "sentiment_score": 0.8,
        "common_keywords": ["project", "question"],
        "peak_communication_time": "02:00-03:00 PM",
        "external_analysis_provider": "MockExternalProvider"
    }
    mock_email_analysis_service.analyze_email_data = MagicMock(return_value=expected_analysis_result)

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.email_analysis_service import get_email_analysis_service

    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_email_analysis
    app.dependency_overrides[get_email_analysis_service] = lambda: mock_email_analysis_service

    # Action
    response = client.post("/ai/email-analysis/analyze", json=sample_email_request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_summary"] == expected_analysis_result
    assert data["error_message"] is None

    # Verify that the service method was called with a list of dicts
    # The Pydantic model `EmailAnalysisRequest` will have converted the JSON payload
    # into `List[EmailDataItem]`. The router then passes `request_data.emails_data`.
    # So, the service should receive `List[EmailDataItem]` or `List[Dict]` depending on how it's typed/used.
    # The service `analyze_email_data` expects `emails_data: List[Dict[str, Any]]`.
    # Pydantic models in a list, when passed, might be converted to dicts if the service expects dicts.
    # Let's ensure the objects in the list passed to the service are dicts.

    # The request_data.emails_data in the router IS a list of EmailDataItem models.
    # The service is typed as List[Dict[str, Any]]. FastAPI/Pydantic might handle this conversion.
    # For the mock, we just care that the data content matches.
    # The `sample_email_request_payload["emails_data"]` is already a list of dicts.
    mock_email_analysis_service.analyze_email_data.assert_called_once_with(
        current_user=mock_current_active_user_for_email_analysis,
        emails_data=sample_email_request_payload["emails_data"]
    )

def test_analyze_endpoint_service_raises_http_exception(client, mock_email_analysis_service, mock_current_active_user_for_email_analysis, sample_email_request_payload):
    # Arrange
    mock_email_analysis_service.analyze_email_data = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Email Pattern Analysis feature not enabled for this tenant.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.email_analysis_service import get_email_analysis_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_email_analysis
    app.dependency_overrides[get_email_analysis_service] = lambda: mock_email_analysis_service

    # Action
    response = client.post("/ai/email-analysis/analyze", json=sample_email_request_payload)

    # Assertion
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Email Pattern Analysis feature not enabled for this tenant."

def test_analyze_endpoint_service_raises_unexpected_exception(client, mock_email_analysis_service, mock_current_active_user_for_email_analysis, sample_email_request_payload):
    # Arrange
    mock_email_analysis_service.analyze_email_data = MagicMock(
        side_effect=KeyError("A very specific unexpected key error in service.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.email_analysis_service import get_email_analysis_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_email_analysis
    app.dependency_overrides[get_email_analysis_service] = lambda: mock_email_analysis_service

    # Action
    response = client.post("/ai/email-analysis/analyze", json=sample_email_request_payload)

    # Assertion
    assert response.status_code == 500
    data = response.json()
    assert "unexpected error occurred" in data["detail"].lower()
    assert "key error" in data["detail"].lower() # Check if original error message part is included

def test_analyze_endpoint_invalid_input_empty_list(client, mock_current_active_user_for_email_analysis):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_email_analysis

    request_payload = {"emails_data": []} # Empty list, fails min_items=1

    # Action
    response = client.post("/ai/email-analysis/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422 # Unprocessable Entity
    data = response.json()
    assert "detail" in data
    assert any("ensure this value has at least 1 item" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "emails_data"])

def test_analyze_endpoint_missing_emails_data_field(client, mock_current_active_user_for_email_analysis):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_email_analysis

    request_payload = {} # emails_data field is missing

    # Action
    response = client.post("/ai/email-analysis/analyze", json=request_payload)

    # Assertion
    assert response.status_code == 422
    data = response.json()
    assert any("field required" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "emails_data"])

def test_health_check_endpoint(client):
    # Action
    response = client.get("/ai/email-analysis/health")

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy", "service": "AI - Email Pattern Analysis"}

# Fixture to clear dependency overrides after each test automatically
@pytest.fixture(autouse=True)
def cleanup_dependency_overrides_email_analysis_router(): # Renamed for specificity
    yield
    app.dependency_overrides.clear()

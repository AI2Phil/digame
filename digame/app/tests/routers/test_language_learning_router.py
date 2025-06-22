import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status

from digame.app.main import app # Main FastAPI app
# Schemas for request/response validation if needed, though service output is often dict
# from digame.app.schemas.language_learning_schemas import TranslationResponse, DefinitionResponse
from digame.app.models.user import User as UserModel

# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---
@pytest.fixture
def mock_language_learning_service():
    service = MagicMock()
    return service

@pytest.fixture
def mock_current_active_user_for_lang_learn(): # Renamed for clarity
    user = UserModel(id=6, email="lang_router_user@example.com", full_name="Lang Router Test User", is_active=True)
    user.tenants = []
    return user

# --- Router Tests: /translate ---

def test_translate_endpoint_success(client, mock_language_learning_service, mock_current_active_user_for_lang_learn):
    # Arrange
    expected_result = {
        "original_text": "Hello world",
        "translated_text": "Mock translated 'Hello world' to ES",
        "target_language": "es",
        "source_language": "en",
        "provider": "MockExternalLanguageProvider"
    }
    mock_language_learning_service.translate_text = MagicMock(return_value=expected_result)

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.language_learning_service import get_language_learning_service

    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    app.dependency_overrides[get_language_learning_service] = lambda: mock_language_learning_service

    request_payload = {"text": "Hello world", "target_language": "es", "source_language": "en"}

    # Action
    response = client.post("/ai/language/translate", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data == expected_result # Service returns dict matching schema

    mock_language_learning_service.translate_text.assert_called_once_with(
        current_user=mock_current_active_user_for_lang_learn,
        text=request_payload["text"],
        target_language=request_payload["target_language"],
        source_language=request_payload["source_language"]
    )

def test_translate_endpoint_service_http_exception(client, mock_language_learning_service, mock_current_active_user_for_lang_learn):
    # Arrange
    mock_language_learning_service.translate_text = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Language Learning feature not enabled.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.language_learning_service import get_language_learning_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    app.dependency_overrides[get_language_learning_service] = lambda: mock_language_learning_service

    request_payload = {"text": "Test text", "target_language": "fr"}

    # Action
    response = client.post("/ai/language/translate", json=request_payload)

    # Assertion
    assert response.status_code == 403
    assert response.json()["detail"] == "Language Learning feature not enabled."

def test_translate_endpoint_service_unexpected_exception(client, mock_language_learning_service, mock_current_active_user_for_lang_learn):
    # Arrange
    mock_language_learning_service.translate_text = MagicMock(side_effect=TypeError("Service internal type error"))
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.language_learning_service import get_language_learning_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    app.dependency_overrides[get_language_learning_service] = lambda: mock_language_learning_service

    request_payload = {"text": "Text for unexpected error", "target_language": "de"}

    # Action
    response = client.post("/ai/language/translate", json=request_payload)

    # Assertion
    assert response.status_code == 500
    assert "unexpected error occurred during translation" in response.json()["detail"].lower()

def test_translate_endpoint_invalid_input(client, mock_current_active_user_for_lang_learn):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    # No service mock needed as Pydantic validation should fail first

    request_payload = {"text": "", "target_language": "es"} # Empty text, fails min_length=1

    # Action
    response = client.post("/ai/language/translate", json=request_payload)

    # Assertion
    assert response.status_code == 422 # Unprocessable Entity
    assert any("ensure this value has at least 1 character" in err["msg"].lower() for err in response.json()["detail"] if err["loc"] == ["body", "text"])

# --- Router Tests: /define ---

def test_define_endpoint_success(client, mock_language_learning_service, mock_current_active_user_for_lang_learn):
    # Arrange
    expected_result = {
        "word": "bonjour",
        "language": "fr",
        "definition": "Mock definition for 'bonjour' in FR: A common greeting.",
        "example": "Example: 'Bonjour, comment ça va?'",
        "provider": "MockExternalLanguageProvider"
    }
    mock_language_learning_service.get_vocabulary_definition = MagicMock(return_value=expected_result)

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.language_learning_service import get_language_learning_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    app.dependency_overrides[get_language_learning_service] = lambda: mock_language_learning_service

    request_payload = {"word": "bonjour", "language": "fr"}

    # Action
    response = client.post("/ai/language/define", json=request_payload)

    # Assertion
    assert response.status_code == 200
    assert response.json() == expected_result

    mock_language_learning_service.get_vocabulary_definition.assert_called_once_with(
        current_user=mock_current_active_user_for_lang_learn,
        word=request_payload["word"],
        language=request_payload["language"]
    )

def test_define_endpoint_service_http_exception(client, mock_language_learning_service, mock_current_active_user_for_lang_learn):
    # Arrange
    mock_language_learning_service.get_vocabulary_definition = MagicMock(
        side_effect=HTTPException(status_code=402, detail="API key for Language Learning missing.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.language_learning_service import get_language_learning_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn
    app.dependency_overrides[get_language_learning_service] = lambda: mock_language_learning_service

    request_payload = {"word": "test", "language": "en"}

    # Action
    response = client.post("/ai/language/define", json=request_payload)

    # Assertion
    assert response.status_code == 402
    assert response.json()["detail"] == "API key for Language Learning missing."

def test_define_endpoint_invalid_input(client, mock_current_active_user_for_lang_learn):
    # Arrange
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_lang_learn

    request_payload = {"word": "", "language": "en"} # Empty word

    # Action
    response = client.post("/ai/language/define", json=request_payload)

    # Assertion
    assert response.status_code == 422
    assert any("ensure this value has at least 1 character" in err["msg"].lower() for err in response.json()["detail"] if err["loc"] == ["body", "word"])

# --- Router Tests: /health ---

def test_health_check_endpoint(client):
    # Action
    response = client.get("/ai/language/health")
    # Assertion
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "AI - Language Learning Support"}

# Fixture to clear dependency overrides after each test automatically
@pytest.fixture(autouse=True)
def cleanup_dependency_overrides_lang_learn_router(): # Renamed for specificity
    yield
    app.dependency_overrides.clear()

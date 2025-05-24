import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status

# Main FastAPI app - adjust import if your app instance is created elsewhere
# For TestClient, you typically import your FastAPI app instance
from digame.app.main import app # Assuming your FastAPI app is `app` in `main.py`

# Schemas used by the router
from digame.app.schemas.writing_assistance_schemas import WritingSuggestionRequest, WritingSuggestionResponse

# Models (only if needed for mock user, typically service handles models)
from digame.app.models.user import User as UserModel

# Service (to mock its methods)
# from digame.app.services.writing_assistance_service import WritingAssistanceService # We'll mock this

# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    # This client will be used to make requests to the app.
    # Dependency overrides can be applied to `app` before creating the client if needed for all tests in this module.
    # For per-test overrides, use `app.dependency_overrides` within the test function.
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---

@pytest.fixture
def mock_writing_assistance_service():
    service = MagicMock()
    # service.get_writing_suggestion = MagicMock(return_value="Mocked AI suggestion")
    return service

@pytest.fixture
def mock_current_active_user():
    # A mock user object that `get_current_active_user` dependency would return
    user = UserModel(id=1, email="test@example.com", full_name="Test User", is_active=True)
    # Add any other fields your `get_current_active_user` might populate or rely on.
    return user

# --- Router Tests ---

def test_suggest_endpoint_success(client, mock_writing_assistance_service, mock_current_active_user):
    # Arrange
    expected_suggestion = "Successfully mocked AI suggestion for 'Hello there'"
    mock_writing_assistance_service.get_writing_suggestion = MagicMock(return_value=expected_suggestion)

    # Override dependencies for this specific test
    # get_current_active_user is likely from digame.app.auth.auth_dependencies
    # get_writing_assistance_service is from digame.app.services.writing_assistance_service
    app.dependency_overrides[app.router.dependencies[0].depends] = lambda: mock_current_active_user # Placeholder for actual get_current_active_user
    app.dependency_overrides[app.router.dependencies[1].depends] = lambda: mock_writing_assistance_service # Placeholder for actual get_writing_assistance_service
    
    # Need to find the actual callables for dependency overrides.
    # Let's assume we can import them directly for clarity in patching.
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.writing_assistance_service import get_writing_assistance_service
    
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user
    app.dependency_overrides[get_writing_assistance_service] = lambda: mock_writing_assistance_service

    request_payload = {"text_input": "Hello there"}

    # Action
    response = client.post("/ai/writing-assistance/suggest", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["original_text"] == "Hello there"
    assert data["suggestion"] == expected_suggestion
    assert data["error_message"] is None

    mock_writing_assistance_service.get_writing_suggestion.assert_called_once_with(
        current_user=mock_current_active_user,
        text_input="Hello there"
    )

    # Clean up overrides
    app.dependency_overrides = {}


def test_suggest_endpoint_service_raises_http_exception(client, mock_writing_assistance_service, mock_current_active_user):
    # Arrange
    mock_writing_assistance_service.get_writing_suggestion = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Feature not enabled for your tenant.")
    )

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.writing_assistance_service import get_writing_assistance_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user
    app.dependency_overrides[get_writing_assistance_service] = lambda: mock_writing_assistance_service
    
    request_payload = {"text_input": "Test input"}

    # Action
    response = client.post("/ai/writing-assistance/suggest", json=request_payload)

    # Assertion
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Feature not enabled for your tenant."

    # Clean up overrides
    app.dependency_overrides = {}


def test_suggest_endpoint_service_raises_unexpected_exception(client, mock_writing_assistance_service, mock_current_active_user):
    # Arrange
    mock_writing_assistance_service.get_writing_suggestion = MagicMock(
        side_effect=ValueError("Something went very wrong in the service") # A non-HTTPException
    )

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.writing_assistance_service import get_writing_assistance_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user
    app.dependency_overrides[get_writing_assistance_service] = lambda: mock_writing_assistance_service

    request_payload = {"text_input": "Test input for unexpected error"}

    # Action
    response = client.post("/ai/writing-assistance/suggest", json=request_payload)

    # Assertion
    assert response.status_code == 500 # Should be caught and returned as a 500
    data = response.json()
    assert "unexpected error occurred" in data["detail"].lower()
    assert "something went very wrong" in data["detail"].lower()


    # Clean up overrides
    app.dependency_overrides = {}


def test_suggest_endpoint_invalid_input_empty_text(client, mock_current_active_user):
    # Arrange: No need to mock the service if input validation fails first.
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user
    # We don't need to override the writing service here, as Pydantic validation should act first.

    request_payload = {"text_input": ""} # Empty string, fails min_length=1

    # Action
    response = client.post("/ai/writing-assistance/suggest", json=request_payload)

    # Assertion
    assert response.status_code == 422 # Unprocessable Entity for Pydantic validation errors
    data = response.json()
    assert "detail" in data
    # Check for a message indicating the text_input field error
    assert any("ensure this value has at least 1 character" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "text_input"])
    
    # Clean up overrides
    app.dependency_overrides = {}

def test_suggest_endpoint_invalid_input_missing_text(client, mock_current_active_user):
    from digame.app.auth.auth_dependencies import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user

    request_payload = {} # Missing text_input field

    response = client.post("/ai/writing-assistance/suggest", json=request_payload)

    assert response.status_code == 422 
    data = response.json()
    assert any("field required" in err["msg"].lower() for err in data["detail"] if err["loc"] == ["body", "text_input"])

    app.dependency_overrides = {}


def test_health_check_endpoint(client):
    # Arrange (No specific arrangement needed for a simple health check)

    # Action
    response = client.get("/ai/writing-assistance/health")

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy", "service": "AI - Writing Assistance"}

# Note on Dependency Overrides:
# The way dependencies are obtained for `app.dependency_overrides` can be tricky.
# `app.router.dependencies` might not be the most reliable way if routers are nested or complex.
# A common pattern is to import the dependency provider functions directly and use them as keys:
# from myapp.dependencies import get_current_user, get_my_service
# app.dependency_overrides[get_current_user] = ...
# app.dependency_overrides[get_my_service] = ...
# I've updated the tests to reflect this more robust pattern by importing the actual dependency functions.
# This assumes `get_current_active_user` is in `digame.app.auth.auth_dependencies`
# and `get_writing_assistance_service` is in `digame.app.services.writing_assistance_service`.
# If these paths are different, they need to be adjusted.

# Make sure the main FastAPI `app` is correctly imported.
# `from digame.app.main import app` implies your project structure allows this import.
# If `main.py` is at the root of `digame/app/`, this should work when tests are run correctly.
# (e.g. with `python -m pytest` from the project root that contains `digame` directory).
# The `client` fixture uses `scope="module"` for efficiency, as the app setup can be reused.
# Individual tests then apply their specific overrides.
# Remember to clear `app.dependency_overrides` after each test if they are applied per-test,
# to prevent interference between tests.
# If overrides are applied to `app` before `TestClient(app)` then they are module-wide.
# The example shows per-test overrides which is safer.
# The `FastAPI.routing.APIRoute.dependant.dependencies` might also be a way to inspect dependencies
# if you need to dynamically find them, but direct import of the dependency functions is usually cleaner.
# The example above has been updated to use direct imports for dependency functions.
# This is generally more stable than relying on `app.router.dependencies` indices.
# Ensure that the functions like `get_current_active_user` and `get_writing_assistance_service`
# are the *exact* functions used in your router's `Depends(...)`.
# If `main.py` is not found, or `app` instance is named differently, adjust the import.
# The test assumes standard FastAPI TestClient usage.
# The `PYTHONPATH` needs to be set up correctly for these imports to work when running pytest.
# Typically, running `pytest` from the root of your project (the directory containing `digame`)
# with `digame` being a package (having `__init__.py`) should handle this.
# Or, if `digame/app` is the root, then imports might be relative `from ..services import ...` etc.
# The current imports assume `digame.app` is part of the python path.
# Example: `PYTHONPATH=. pytest` or `python -m pytest`.
# For `app.dependency_overrides[app.router.dependencies[0].depends]`, this is not robust.
# The dependencies are on the specific route, not the router itself.
# It's better to retrieve the route and then its dependencies, or, as done above,
# import the dependency provider function directly.
# The router for writing assistance is `/ai/writing-assistance`.
# The dependencies for `/suggest` are `get_current_active_user` and `get_writing_assistance_service`.
# The code has been updated to use `app.dependency_overrides[actual_dependency_function_object]`.
# This requires importing those functions into the test file.
# `from digame.app.main import app` is key. If `main.py` is inside `digame/app/`, this means `digame` is the top-level package.
# And `PYTHONPATH` should include the directory *containing* `digame`.
# If `app` is the top-level package, then `from app.main import app`.
# Assume `digame` is the top-level package.
# The test file is `digame/app/tests/routers/test_writing_assistance_router.py`.
# `from digame.app.main import app` should work.
# `from digame.app.auth.auth_dependencies import get_current_active_user` should work.
# `from digame.app.services.writing_assistance_service import get_writing_assistance_service` should work.
# This seems consistent.

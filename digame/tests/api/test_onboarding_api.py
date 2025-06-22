import pytest
from httpx import AsyncClient
from digame.app.main import app # Import the app instance
from digame.app.services.onboarding_service import ONBOARDING_DB, ONBOARDING_STEP_SEQUENCE
from digame.app.models.onboarding_models import OnboardingStepUpdate, OnboardingPreferencesUpdate

# Mark all tests in this module as asyncio
pytestmark = pytest.mark.asyncio

BASE_URL = "http://test" # Base URL for the test client

@pytest.fixture(autouse=True)
def clear_onboarding_db_before_each_test():
    ONBOARDING_DB.clear()

async def test_get_initial_status_api():
    async with AsyncClient(app=app, base_url=BASE_URL) as ac:
        response = await ac.get("/api/v1/onboarding/status") # user_id from dummy auth
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["user_id"] == "user123" # From dummy get_current_user_id
    assert json_response["current_step_id"] == ONBOARDING_STEP_SEQUENCE[0]
    assert not json_response["completed_all"]

async def test_post_step_update_api():
    # Initialize user by getting status first, to ensure it's in ONBOARDING_DB
    async with AsyncClient(app=app, base_url=BASE_URL) as ac:
        await ac.get("/api/v1/onboarding/status")

    step_payload_dict = {"step_id": ONBOARDING_STEP_SEQUENCE[0], "data": {"name": "Test User"}}
    # step_payload = OnboardingStepUpdate(step_id=ONBOARDING_STEP_SEQUENCE[0], data={"name": "Test User"}) # Pydantic model for payload
    async with AsyncClient(app=app, base_url=BASE_URL) as ac:
        response = await ac.post("/api/v1/onboarding/step", json=step_payload_dict) # Use .dict() if using pydantic model for payload

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["current_step_id"] == ONBOARDING_STEP_SEQUENCE[1]
    updated_step = next((s for s in json_response["steps"] if s["step_id"] == ONBOARDING_STEP_SEQUENCE[0]), None)
    assert updated_step is not None
    assert updated_step["completed"] == True
    assert updated_step["data"] == {"name": "Test User"}


async def test_post_preferences_api():
    # Initialize user
    async with AsyncClient(app=app, base_url=BASE_URL) as ac:
        await ac.get("/api/v1/onboarding/status")

    prefs_payload_dict = {"preferences": {"language": "en", "timezone": "UTC"}}
    # prefs_payload = OnboardingPreferencesUpdate(preferences={"language": "en", "timezone": "UTC"}) # Pydantic model for payload
    async with AsyncClient(app=app, base_url=BASE_URL) as ac:
        response = await ac.post("/api/v1/onboarding/preferences", json=prefs_payload_dict) # Use .dict() if using pydantic model

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["preferences"]["language"] == "en"
    assert json_response["preferences"]["timezone"] == "UTC"

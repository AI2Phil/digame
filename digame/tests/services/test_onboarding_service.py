import pytest
from digame.app.services.onboarding_service import OnboardingService, ONBOARDING_DB, ONBOARDING_STEP_SEQUENCE
from digame.app.models.onboarding_models import OnboardingStepUpdate, OnboardingPreferencesUpdate, UserOnboardingStatus, OnboardingStep

@pytest.fixture(autouse=True)
def clear_db_before_each_test():
    ONBOARDING_DB.clear()

@pytest.mark.asyncio
async def test_get_initial_onboarding_status():
    service = OnboardingService()
    user_id = "test_user_1"
    status = await service.get_user_onboarding_status(user_id)
    assert status.user_id == user_id
    assert status.current_step_id == ONBOARDING_STEP_SEQUENCE[0]
    assert not status.completed_all
    assert len(status.steps) == len(ONBOARDING_STEP_SEQUENCE)
    for i, step_id in enumerate(ONBOARDING_STEP_SEQUENCE):
        assert status.steps[i].step_id == step_id
        assert not status.steps[i].completed

@pytest.mark.asyncio
async def test_update_onboarding_step():
    service = OnboardingService()
    user_id = "test_user_2"
    await service.get_user_onboarding_status(user_id) # Initialize

    step_data = {"name": "Jules"}
    update = OnboardingStepUpdate(step_id=ONBOARDING_STEP_SEQUENCE[0], data=step_data)
    status = await service.update_onboarding_step(user_id, update)

    assert status.steps[0].completed
    assert status.steps[0].data == step_data
    assert status.current_step_id == ONBOARDING_STEP_SEQUENCE[1] # Moves to next step

@pytest.mark.asyncio
async def test_complete_all_steps():
    service = OnboardingService()
    user_id = "test_user_3"

    for step_id in ONBOARDING_STEP_SEQUENCE:
        update = OnboardingStepUpdate(step_id=step_id, data={"completed_field": True})
        status = await service.update_onboarding_step(user_id, update)

    assert status.completed_all
    assert status.current_step_id is None
    for step in status.steps:
        # This check needs to be more specific if not all steps in status.steps are part of ONBOARDING_STEP_SEQUENCE
        # For this test, we assume only sequenced steps are relevant for completion check.
        if step.step_id in ONBOARDING_STEP_SEQUENCE:
             assert step.completed


@pytest.mark.asyncio
async def test_update_preferences():
    service = OnboardingService()
    user_id = "test_user_4"
    prefs = {"theme": "dark", "notifications_enabled": True}
    update = OnboardingPreferencesUpdate(preferences=prefs)
    status = await service.update_user_preferences(user_id, update)

    assert status.preferences == prefs
    # Check other fields remain consistent
    assert status.current_step_id == ONBOARDING_STEP_SEQUENCE[0]

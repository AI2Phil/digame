import datetime
from typing import Dict, Optional, List
from digame.app.models.onboarding_models import UserOnboardingStatus, OnboardingStep, OnboardingStepUpdate, OnboardingPreferencesUpdate

ONBOARDING_DB: Dict[str, UserOnboardingStatus] = {}
ONBOARDING_STEP_SEQUENCE = ["welcome", "profile_info", "goal_setting", "final_summary"]

class OnboardingService:
    def _get_or_create_user_status(self, user_id: str) -> UserOnboardingStatus:
        if user_id not in ONBOARDING_DB:
            initial_steps = [OnboardingStep(step_id=step_name) for step_name in ONBOARDING_STEP_SEQUENCE]
            ONBOARDING_DB[user_id] = UserOnboardingStatus(
                user_id=user_id,
                current_step_id=ONBOARDING_STEP_SEQUENCE[0] if ONBOARDING_STEP_SEQUENCE else None,
                steps=initial_steps
            )
        return ONBOARDING_DB[user_id]

    async def get_user_onboarding_status(self, user_id: str) -> UserOnboardingStatus:
        return self._get_or_create_user_status(user_id)

    async def update_onboarding_step(self, user_id: str, step_update: OnboardingStepUpdate) -> UserOnboardingStatus:
        status = self._get_or_create_user_status(user_id)

        # Mark the specified step as completed and update its data
        found_step_in_status = False
        for step in status.steps:
            if step.step_id == step_update.step_id:
                step.completed = True
                step.data = step_update.data if step_update.data is not None else step.data
                found_step_in_status = True
                break
        if not found_step_in_status:
            # If the step_id from update is not in status.steps (e.g. not in initial sequence), add it.
            status.steps.append(OnboardingStep(step_id=step_update.step_id, completed=True, data=step_update.data))

        # Check for overall completion based on ONBOARDING_STEP_SEQUENCE
        all_sequence_steps_completed = True
        for seq_step_id in ONBOARDING_STEP_SEQUENCE:
            completed_this_step = False
            for user_step in status.steps:
                if user_step.step_id == seq_step_id and user_step.completed:
                    completed_this_step = True
                    break
            if not completed_this_step:
                all_sequence_steps_completed = False
                break

        status.completed_all = all_sequence_steps_completed

        # Determine the next current_step_id
        if status.completed_all:
            status.current_step_id = None
        else:
            next_step_in_sequence = None
            if step_update.step_id in ONBOARDING_STEP_SEQUENCE:
                try:
                    current_idx = ONBOARDING_STEP_SEQUENCE.index(step_update.step_id)
                    if current_idx + 1 < len(ONBOARDING_STEP_SEQUENCE):
                        next_step_in_sequence = ONBOARDING_STEP_SEQUENCE[current_idx + 1]
                except ValueError: # Should not happen if step_id is in sequence
                    pass

            if next_step_in_sequence:
                # Check if this next step in sequence is already completed, if so, find the first incomplete one.
                # This handles cases where user might be re-completing an earlier step.
                is_next_step_in_sequence_completed = False
                for user_step in status.steps:
                    if user_step.step_id == next_step_in_sequence and user_step.completed:
                        is_next_step_in_sequence_completed = True
                        break
                if not is_next_step_in_sequence_completed:
                     status.current_step_id = next_step_in_sequence
                else: # next_step_in_sequence was already completed, find the first incomplete from sequence
                    found_first_incomplete = False
                    for seq_step_id_candidate in ONBOARDING_STEP_SEQUENCE:
                        is_candidate_completed = any(s.step_id == seq_step_id_candidate and s.completed for s in status.steps)
                        if not is_candidate_completed:
                            status.current_step_id = seq_step_id_candidate
                            found_first_incomplete = True
                            break
                    if not found_first_incomplete: # Should mean all are complete, covered by completed_all
                         status.current_step_id = None

            else: # Current step was not in sequence, or was the last in sequence. Find first incomplete.
                found_first_incomplete = False
                for seq_step_id_candidate in ONBOARDING_STEP_SEQUENCE:
                    is_candidate_completed = any(s.step_id == seq_step_id_candidate and s.completed for s in status.steps)
                    if not is_candidate_completed:
                        status.current_step_id = seq_step_id_candidate
                        found_first_incomplete = True
                        break
                if not found_first_incomplete: # All sequence steps are completed
                    status.current_step_id = None

        status.last_updated = datetime.datetime.utcnow()
        # ONBOARDING_DB[user_id] = status # status is a reference to the object in DB, so changes are direct.
        return status

    async def update_user_preferences(self, user_id: str, preferences_update: OnboardingPreferencesUpdate) -> UserOnboardingStatus:
        status = self._get_or_create_user_status(user_id)
        status.preferences.update(preferences_update.preferences)
        status.last_updated = datetime.datetime.utcnow()
        # ONBOARDING_DB[user_id] = status
        return status

def get_onboarding_service():
    return OnboardingService()

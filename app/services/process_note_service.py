# Service for identifying process patterns and managing ProcessNotes.

import asyncio # Required for running async functions
import logging # For logging
from sqlalchemy.orm import Session
from typing import List, Dict, Tuple, Any, Optional # Optional for api_key
from collections import defaultdict, Counter
from datetime import datetime

from ..models.activity import Activity
from ..models.process_notes import ProcessNote
from ..models.user import User # For type hinting user_id
from ..crud import user_setting_crud # To get user API key
from ..services.ai_integration_service import AIIntegrationService
from ..services.process_nlp_service import ProcessNLPService
from ..schemas.user_setting_schemas import UserSetting # For type hint, though not directly used for instantiation

logger = logging.getLogger(__name__)

# --- Helper Function for Sequence to String ---

def _sequence_to_string(sequence: List[str]) -> str:
    """Converts a list of activity types into a standardized string representation."""
    return " -> ".join(sequence)

def _generate_task_name(sequence_str: str) -> str:
    """Generates a simple task name from the sequence string."""
    # Basic implementation, can be made more sophisticated
    if len(sequence_str) > 50: # Truncate if too long
        return f"Process: {sequence_str[:47]}..."
    return f"Process: {sequence_str}"

# --- Main Service Function ---

async def identify_and_update_process_notes( # Made async
    db: Session,
    user_id: int, # Assuming user_id is an integer based on User model
    min_sequence_len: int = 3,
    max_sequence_len: int = 7,
    recurrence_threshold: int = 3,
    # For direct instantiation, consider if these services should be passed or created here.
    # In FastAPI, they'd typically be dependencies.
    # ai_integration_service: Optional[AIIntegrationService] = None, # Example if passed
    # process_nlp_service: Optional[ProcessNLPService] = None      # Example if passed
) -> Tuple[int, int]: # Returns (new_notes_created, notes_updated)
    """
    Identifies recurring sequences of activities for a user and creates/updates ProcessNotes.
    Enhances notes with AI-generated names and tags.
    """
    # Instantiate services - in a real app, use dependency injection
    # For simplicity here, direct instantiation. AIIntegrationService might not need db for its core logic.
    _ai_integration_service = AIIntegrationService(db=db) # Pass db if needed by AIIntegrationService constructor
    _process_nlp_service = ProcessNLPService(ai_integration_service=_ai_integration_service)

    # Get user's OpenAI API key and check tenant feature for NLP
    user_api_key: Optional[str] = None
    perform_nlp_enhancements = False

    user_model_instance = db.query(User).filter(User.id == user_id).first()
    if not user_model_instance:
        logger.error(f"User with ID {user_id} not found for process note NLP check.")
        # Decide if to proceed without NLP or raise error. For now, proceed without.
    else:
        tenant_id = getattr(user_model_instance, 'tenant_id', None)
        if not tenant_id and hasattr(user_model_instance, 'tenants') and user_model_instance.tenants:
            user_tenant_link = user_model_instance.tenants[0]
            tenant_id = getattr(user_tenant_link, 'tenant_id', None)

        if tenant_id:
            tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
            if tenant:
                tenant_features = tenant.features
                if isinstance(tenant_features, str):
                    try:
                        tenant_features = json.loads(tenant_features or '{}')
                    except json.JSONDecodeError:
                        tenant_features = {} # Default to no features on error
                elif not isinstance(tenant_features, dict):
                    tenant_features = {}

                if tenant_features.get("process_notes_nlp", False): # Check for "process_notes_nlp"
                    perform_nlp_enhancements = True
                else:
                    logger.info(f"Tenant feature 'process_notes_nlp' not enabled for user {user_id}. Skipping NLP.")
            else:
                logger.warning(f"Tenant not found for user {user_id}. Skipping NLP feature check.")
        else:
            logger.warning(f"User {user_id} not associated with a tenant. Skipping NLP feature check.")

    if perform_nlp_enhancements:
        user_setting = user_setting_crud.get_user_setting(db, user_id=user_id)
        if user_setting and user_setting.api_keys:
            try:
                api_keys_dict = json.loads(user_setting.api_keys)
                user_api_key = api_keys_dict.get("openai_api_key")
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys for user {user_id} in process_note_service.")

        if not user_api_key:
            logger.warning(f"No OpenAI API key found for user {user_id}, although 'process_notes_nlp' is enabled. NLP enhancements will be skipped.")
            perform_nlp_enhancements = False # Can't do NLP without key
    
    # If NLP is to be performed but API key is missing, user_api_key will be None, and NLP calls will gracefully fallback.
    # The notes_to_process_nlp list will only be populated if perform_nlp_enhancements and user_api_key are true.

    # Step 1: Fetch Activities for the user, ordered by timestamp
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.timestamp.asc())
        .all()
    )

    if not activities or len(activities) < min_sequence_len:
        return 0, 0 # Not enough activities to form sequences

    # Step 2: Generate Sequences and their occurrences with timestamps
    all_sequences_with_instances: Dict[Tuple[str, ...], List[List[Activity]]] = defaultdict(list)

    for i in range(len(activities)):
        for length in range(min_sequence_len, max_sequence_len + 1):
            if i + length <= len(activities):
                current_sub_sequence_activities = activities[i : i + length]
                sequence_key = tuple(act.activity_type for act in current_sub_sequence_activities)
                all_sequences_with_instances[sequence_key].append(current_sub_sequence_activities)

    # Step 3: Filter by Threshold and Prepare for DB Operations
    new_notes_created = 0
    notes_updated = 0

    notes_to_process_nlp = [] # Collect notes for NLP processing

    for sequence_key, instances_list in all_sequences_with_instances.items():
        occurrence_count = len(instances_list)

        if occurrence_count >= recurrence_threshold:
            sequence_str = _sequence_to_string(list(sequence_key))

            instances_list.sort(key=lambda instance_activities: instance_activities[0].timestamp)
            first_instance_activities = instances_list[0]

            instances_list_sorted_by_end_time = sorted(instances_list, key=lambda inst_acts: inst_acts[-1].timestamp)
            most_recent_instance_activities = instances_list_sorted_by_end_time[-1]

            first_observed_at_ts = first_instance_activities[0].timestamp
            last_observed_at_ts = most_recent_instance_activities[-1].timestamp
            # Storing all source_activity_ids for all instances might be too much.
            # Let's reconsider: maybe only IDs of the first observed instance, or a sample.
            # For now, keeping as is (IDs from the first observed instance).
            source_activity_ids_list = [act.id for act in first_instance_activities]

            existing_note = (
                db.query(ProcessNote)
                .filter(
                    ProcessNote.user_id == user_id,
                    ProcessNote.process_steps_description == sequence_str
                )
                .first()
            )

            note_changed = False
            target_note = None

            if existing_note:
                target_note = existing_note
                if existing_note.occurrence_count != occurrence_count:
                    existing_note.occurrence_count = occurrence_count
                    note_changed = True
                if existing_note.last_observed_at != last_observed_at_ts:
                    existing_note.last_observed_at = last_observed_at_ts
                    note_changed = True
                
                if note_changed:
                    notes_updated += 1
            else:
                new_note = ProcessNote(
                    user_id=user_id,
                    inferred_task_name=_generate_task_name(sequence_str), # Initial simple name
                    process_steps_description=sequence_str,
                    source_activity_ids=source_activity_ids_list,
                    occurrence_count=occurrence_count,
                    first_observed_at=first_observed_at_ts,
                    last_observed_at=last_observed_at_ts,
                    user_tags=[] # Initialize with empty list for tags
                )
                db.add(new_note)
                new_notes_created += 1
                note_changed = True # New note is considered a change for NLP
                target_note = new_note

            # Only add to NLP processing if feature enabled, key present, and note changed/new
            if note_changed and target_note and perform_nlp_enhancements and user_api_key:
                notes_to_process_nlp.append(target_note)


    # Step 4: Commit initial changes (creations/updates of core fields)
    # This is important so that NLP processing can work on committed notes if needed,
    # or if NLP fails, core data is still saved.
    if new_notes_created > 0 or notes_updated > 0: # notes_updated here refers to non-NLP updates
        try:
            db.commit()
            for note in notes_to_process_nlp: # Refresh notes to get IDs if they were new
                db.refresh(note)
        except Exception as e:
            db.rollback()
            logger.error(f"Error committing initial process notes for user {user_id}: {e}")
            raise

    # Step 5: Perform NLP enhancements if API key is available
    nlp_updates_made = 0
    if user_api_key and notes_to_process_nlp:
        for note in notes_to_process_nlp:
            try:
                logger.info(f"Performing NLP enhancements for note ID {note.id} for user {user_id}")
                # Enhance task name
                enhanced_name = await _process_nlp_service.generate_enhanced_task_name(
                    description=note.process_steps_description,
                    user_api_key=user_api_key
                )
                if enhanced_name and enhanced_name != note.inferred_task_name:
                    note.inferred_task_name = enhanced_name
                    nlp_updates_made +=1

                # Suggest and update tags
                current_tags = list(note.user_tags) if note.user_tags else [] # Ensure it's a list
                suggested_tags = await _process_nlp_service.suggest_tags(
                    description=note.process_steps_description,
                    user_api_key=user_api_key,
                    existing_tags=current_tags
                )
                if suggested_tags and suggested_tags != current_tags:
                    note.user_tags = suggested_tags
                    nlp_updates_made +=1

                # If other NLP features like keyword extraction are to be stored:
                # keywords = await _process_nlp_service.extract_keywords(note.process_steps_description, user_api_key)
                # note.extracted_keywords = keywords # Assuming a field exists

            except Exception as e:
                logger.error(f"Error during NLP enhancement for note ID {note.id} (user {user_id}): {e}")
                # Continue to next note, don't let one failure stop all

    # Step 6: Commit NLP changes
    if nlp_updates_made > 0:
        try:
            db.commit()
            # notes_updated might now reflect NLP changes too.
            # The definition of "notes_updated" could be refined.
            # For now, it counts if core fields OR NLP fields changed.
            # If a note was new, it's counted in new_notes_created. If it was existing and NLP changed it,
            # it would have already been counted in notes_updated if core fields changed, or needs to be added now.
            # This logic for counting can be tricky. Let's assume initial `notes_updated` is for core fields.
            # We could return a third value: `nlp_enhanced_notes_count`.
        except Exception as e:
            db.rollback()
            logger.error(f"Error committing NLP enhancements for user {user_id}: {e}")
            # Don't raise here, as initial commit might have succeeded.

    return new_notes_created, notes_updated # Consider adding nlp_enhanced_notes_count


# Example usage (conceptual, usually called from an API endpoint or background task)
# The __main__ block needs to be adapted for async execution.
async def main_test(): # Made async
    # This block would require a live DB session and populated Activity data to run.
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    # from app.models.user import Base as AppBase # To create tables if needed
    # Need to ensure models are loaded for Base.metadata
    from ..models import Base as AppBase, User as AppUser, Activity as AppActivity, ProcessNote as AppProcessNote
    import json # For user_setting_crud mock or real data

    DATABASE_URL_TEST = "sqlite:///:memory:" # Example, use your actual test DB URL
    engine = create_engine(DATABASE_URL_TEST) # Note: SQLite might have issues with async operations depending on driver
    
    # Check if tables exist, if not create them
    # This is a simplified check; real applications use Alembic.
    from sqlalchemy import inspect as sql_inspect
    inspector = sql_inspect(engine)
    if not inspector.has_table("users"): # Check for one of the tables
        AppBase.metadata.create_all(engine) # Create tables if they don't exist
        print("Tables created.")
    else:
        print("Tables already exist.")

    SessionLocalTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    test_db_session = SessionLocalTest()

    # --- Mock Data Setup ---
    try:
        # User 1 (for whom we'll mock an API key)
        test_user1 = test_db_session.query(AppUser).filter_by(id=1).first()
        if not test_user1:
            test_user1 = AppUser(id=1, username="testuser1_nlp", email="test1_nlp@example.com", hashed_password="xxx")
            test_db_session.add(test_user1)

        # User 2 (no API key mocked for this one)
        test_user2 = test_db_session.query(AppUser).filter_by(id=2).first()
        if not test_user2:
            test_user2 = AppUser(id=2, username="testuser2_no_nlp", email="test2_no_nlp@example.com", hashed_password="yyy")
            test_db_session.add(test_user2)

        test_db_session.commit()

        # Mock UserSetting for user 1 with an OpenAI API key
        # This requires user_setting_crud.py to exist and function, or more direct mocking.
        # For simplicity, let's assume user_setting_crud.create_user_setting handles JSON conversion.
        from ..schemas.user_setting_schemas import UserSettingCreate
        existing_setting_user1 = user_setting_crud.get_user_setting(test_db_session, user_id=1)
        if not existing_setting_user1:
            user_setting_crud.create_user_setting(
                test_db_session,
                user_id=1,
                settings=UserSettingCreate(api_keys={"openai_api_key": "YOUR_ACTUAL_OPENAI_API_KEY_FOR_TESTING"})
                                            # ^^^ IMPORTANT: Replace with a real key for testing this part, or ensure ProcessNLPService handles missing key gracefully for mocks.
                                            # For automated tests, this should be a mock key and OpenAI calls mocked.
            )
        else: # Ensure key is present if setting exists
            current_keys = json.loads(existing_setting_user1.api_keys or '{}')
            if "openai_api_key" not in current_keys:
                current_keys["openai_api_key"] = "YOUR_ACTUAL_OPENAI_API_KEY_FOR_TESTING"
                existing_setting_user1.api_keys = json.dumps(current_keys)
                test_db_session.commit()


        # Clear existing activities and notes for these test users to ensure clean run
        test_db_session.query(AppActivity).filter(AppActivity.user_id.in_([1,2])).delete(synchronize_session=False)
        test_db_session.query(AppProcessNote).filter(AppProcessNote.user_id.in_([1,2])).delete(synchronize_session=False)
        test_db_session.commit()

        activities_data_user1 = [
            AppActivity(user_id=1, activity_type="Open Email Client", timestamp=datetime(2023, 1, 1, 10, 0, 0)),
            AppActivity(user_id=1, activity_type="Compose New Email", timestamp=datetime(2023, 1, 1, 10, 1, 0)),
            AppActivity(user_id=1, activity_type="Send Email", timestamp=datetime(2023, 1, 1, 10, 2, 0)), # Sequence 1
            AppActivity(user_id=1, activity_type="Open Calendar", timestamp=datetime(2023, 1, 1, 10, 3, 0)),
            AppActivity(user_id=1, activity_type="Open Email Client", timestamp=datetime(2023, 1, 1, 10, 4, 0)),
            AppActivity(user_id=1, activity_type="Compose New Email", timestamp=datetime(2023, 1, 1, 10, 5, 0)),
            AppActivity(user_id=1, activity_type="Send Email", timestamp=datetime(2023, 1, 1, 10, 6, 0)), # Sequence 1
            AppActivity(user_id=1, activity_type="Archive Email", timestamp=datetime(2023, 1, 1, 10, 7, 0)),
            AppActivity(user_id=1, activity_type="Open Email Client", timestamp=datetime(2023, 1, 1, 10, 8, 0)),
            AppActivity(user_id=1, activity_type="Compose New Email", timestamp=datetime(2023, 1, 1, 10, 9, 0)),
            AppActivity(user_id=1, activity_type="Send Email", timestamp=datetime(2023, 1, 1, 10, 10, 0)), # Sequence 1
        ]
        activities_data_user2 = [ # Same pattern, but for user without API key mocked
            AppActivity(user_id=2, activity_type="Scan Document", timestamp=datetime(2023, 1, 1, 11, 0, 0)),
            AppActivity(user_id=2, activity_type="Upload File", timestamp=datetime(2023, 1, 1, 11, 1, 0)),
            AppActivity(user_id=2, activity_type="Share Link", timestamp=datetime(2023, 1, 1, 11, 2, 0)),
            AppActivity(user_id=2, activity_type="Scan Document", timestamp=datetime(2023, 1, 1, 11, 3, 0)),
            AppActivity(user_id=2, activity_type="Upload File", timestamp=datetime(2023, 1, 1, 11, 4, 0)),
            AppActivity(user_id=2, activity_type="Share Link", timestamp=datetime(2023, 1, 1, 11, 5, 0)),
            AppActivity(user_id=2, activity_type="Scan Document", timestamp=datetime(2023, 1, 1, 11, 6, 0)),
            AppActivity(user_id=2, activity_type="Upload File", timestamp=datetime(2023, 1, 1, 11, 7, 0)),
            AppActivity(user_id=2, activity_type="Share Link", timestamp=datetime(2023, 1, 1, 11, 8, 0)),
        ]
        test_db_session.add_all(activities_data_user1)
        test_db_session.add_all(activities_data_user2)
        test_db_session.commit()
    except Exception as e:
        test_db_session.rollback()
        logger.error(f"Error setting up mock data for process_note_service test: {e}")
        raise

    # Run the service for user 1 (with API key)
    logger.info("Running process note identification for user 1 (with API key)...")
    # Provide a real API key for testing or ensure ProcessNLPService handles missing key for mocks.
    # For this example, if "YOUR_ACTUAL_OPENAI_API_KEY_FOR_TESTING" is not replaced, OpenAI calls will fail.
    # In a CI/CD or automated test, OpenAI calls should be mocked.
    new_count1, updated_count1 = await identify_and_update_process_notes(test_db_session, user_id=1)
    logger.info(f"User 1: New notes created: {new_count1}, Notes updated (core): {updated_count1}")

    # Run the service for user 2 (without API key)
    logger.info("Running process note identification for user 2 (no API key)...")
    new_count2, updated_count2 = await identify_and_update_process_notes(test_db_session, user_id=2)
    logger.info(f"User 2: New notes created: {new_count2}, Notes updated (core): {updated_count2}")


    # Query and print results
    notes_user1 = test_db_session.query(AppProcessNote).filter(AppProcessNote.user_id == 1).all()
    logger.info("\n--- Notes for User 1 ---")
    for note in notes_user1:
        logger.info(f"  Note ID: {note.id}, Task Name: '{note.inferred_task_name}', Steps: '{note.process_steps_description}'")
        logger.info(f"    Occurrences: {note.occurrence_count}, Tags: {note.user_tags}")
        logger.info(f"    FirstObs: {note.first_observed_at}, LastObs: {note.last_observed_at}")

    notes_user2 = test_db_session.query(AppProcessNote).filter(AppProcessNote.user_id == 2).all()
    logger.info("\n--- Notes for User 2 ---")
    for note in notes_user2:
        logger.info(f"  Note ID: {note.id}, Task Name: '{note.inferred_task_name}', Steps: '{note.process_steps_description}'")
        logger.info(f"    Occurrences: {note.occurrence_count}, Tags: {note.user_tags}")
        logger.info(f"    FirstObs: {note.first_observed_at}, LastObs: {note.last_observed_at}")

    test_db_session.close()

if __name__ == "__main__":
    # Setup logging to see output
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    # To run the async main_test:
    # import asyncio
    # asyncio.run(main_test()) # This line is commented out as it requires a full environment setup.
    pass

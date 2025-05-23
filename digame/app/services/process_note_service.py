# Service for identifying process patterns and managing ProcessNotes.

from sqlalchemy.orm import Session
from typing import List, Dict, Tuple, Any
from collections import defaultdict, Counter
from datetime import datetime

from ..models.activity import Activity
from ..models.process_notes import ProcessNote
from ..models.user import User # For type hinting user_id if needed, though service takes user_id directly

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

def identify_and_update_process_notes(
    db: Session, 
    user_id: int, # Assuming user_id is an integer based on User model
    min_sequence_len: int = 3, 
    max_sequence_len: int = 7, 
    recurrence_threshold: int = 3
) -> Tuple[int, int]: # Returns (new_notes_created, notes_updated)
    """
    Identifies recurring sequences of activities for a user and creates/updates ProcessNotes.
    """
    
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
    # Store sequences as tuples of activity_type strings to make them hashable for Counter
    # Store all observed instances (list of activity objects) for each sequence type
    
    all_sequences_with_instances: Dict[Tuple[str, ...], List[List[Activity]]] = defaultdict(list)

    for i in range(len(activities)):
        for length in range(min_sequence_len, max_sequence_len + 1):
            if i + length <= len(activities):
                current_sub_sequence_activities = activities[i : i + length]
                # Extract activity types for the key
                sequence_key = tuple(act.activity_type for act in current_sub_sequence_activities)
                all_sequences_with_instances[sequence_key].append(current_sub_sequence_activities)

    # Step 3: Filter by Threshold and Prepare for DB Operations
    new_notes_created = 0
    notes_updated = 0

    for sequence_key, instances_list in all_sequences_with_instances.items():
        occurrence_count = len(instances_list)
        
        if occurrence_count >= recurrence_threshold:
            sequence_str = _sequence_to_string(list(sequence_key)) # Convert tuple key back to list for string func
            
            # Find the first and last observed instances for timestamping
            # Sort instances by the timestamp of their first activity
            instances_list.sort(key=lambda instance_activities: instance_activities[0].timestamp)
            
            first_instance_activities = instances_list[0]
            # To find the "most recent" overall, we need to look at the last activity of the last instance.
            # Since instances_list is sorted by start_time of each instance, the last one in list is not necessarily
            # the one that *ended* most recently if sequences can overlap.
            # For simplicity here, we'll use the end time of the last instance in the sorted list.
            # A more robust way would be to sort instances by their *end* times.
            # Let's sort by end time to be more accurate for `last_observed_at`.
            instances_list_sorted_by_end_time = sorted(instances_list, key=lambda inst_acts: inst_acts[-1].timestamp)
            most_recent_instance_activities = instances_list_sorted_by_end_time[-1]

            first_observed_at_ts = first_instance_activities[0].timestamp
            last_observed_at_ts = most_recent_instance_activities[-1].timestamp
            source_activity_ids_list = [act.id for act in first_instance_activities]

            # Step 4: Check for Existing ProcessNote and Create/Update
            existing_note = (
                db.query(ProcessNote)
                .filter(
                    ProcessNote.user_id == user_id,
                    ProcessNote.process_steps_description == sequence_str # Assuming this is unique enough with user_id
                )
                .first()
            )
            
            if existing_note:
                # Update existing note
                # Only update if new data is actually different to avoid unnecessary DB writes
                updated = False
                if existing_note.occurrence_count != occurrence_count:
                    existing_note.occurrence_count = occurrence_count
                    updated = True
                if existing_note.last_observed_at != last_observed_at_ts: # Timestamps might have microsecond differences
                    existing_note.last_observed_at = last_observed_at_ts
                    updated = True
                
                if updated:
                    notes_updated += 1
            else:
                # Create new note
                new_note = ProcessNote()
                new_note.user_id = user_id
                new_note.inferred_task_name = _generate_task_name(sequence_str)
                new_note.process_steps_description = sequence_str
                new_note.source_activity_ids = source_activity_ids_list  # Store as JSON
                new_note.occurrence_count = occurrence_count
                new_note.first_observed_at = first_observed_at_ts
                new_note.last_observed_at = last_observed_at_ts
                db.add(new_note)
                new_notes_created += 1
                
    # Step 5: Commit Changes (if any notes were created or updated)
    if new_notes_created > 0 or notes_updated > 0:
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            # Handle or raise exception e.g., log it
            print(f"Error committing process notes: {e}") # Replace with proper logging
            # Potentially re-raise or return error status
            raise
            
    return new_notes_created, notes_updated


# Example usage (conceptual, usually called from an API endpoint or background task)
if __name__ == "__main__":
    # This block would require a live DB session and populated Activity data to run.
    # For now, it's a conceptual placeholder.
    
    # from sqlalchemy import create_engine
    # from sqlalchemy.orm import sessionmaker
    # from digame.app.models.user import Base as AppBase # To create tables if needed

    # DATABASE_URL_TEST = "sqlite:///:memory:" # Example, use your actual test DB URL
    # engine = create_engine(DATABASE_URL_TEST)
    # AppBase.metadata.create_all(engine) # Create tables if they don't exist
    # SessionLocalTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # test_db_session = SessionLocalTest()

    # # --- Mock Data Setup ---
    # # Create a dummy user
    # try:
    #     test_user = User(id=1, username="testuser", email="test@example.com", hashed_password="xxx")
    #     test_db_session.add(test_user)
    #     test_db_session.commit()
    # except Exception: # If user already exists from previous run
    #     test_db_session.rollback()
    #     test_user = test_db_session.query(User).filter_by(id=1).first()
    
    # # Create some dummy activities for user 1
    # activities_data = [
    #     Activity(user_id=1, activity_type="A", timestamp=datetime(2023, 1, 1, 10, 0, 0)),
    #     Activity(user_id=1, activity_type="B", timestamp=datetime(2023, 1, 1, 10, 1, 0)),
    #     Activity(user_id=1, activity_type="C", timestamp=datetime(2023, 1, 1, 10, 2, 0)), # A,B,C (1)
    #     Activity(user_id=1, activity_type="X", timestamp=datetime(2023, 1, 1, 10, 3, 0)),
    #     Activity(user_id=1, activity_type="A", timestamp=datetime(2023, 1, 1, 10, 4, 0)),
    #     Activity(user_id=1, activity_type="B", timestamp=datetime(2023, 1, 1, 10, 5, 0)),
    #     Activity(user_id=1, activity_type="C", timestamp=datetime(2023, 1, 1, 10, 6, 0)), # A,B,C (2)
    #     Activity(user_id=1, activity_type="Y", timestamp=datetime(2023, 1, 1, 10, 7, 0)),
    #     Activity(user_id=1, activity_type="A", timestamp=datetime(2023, 1, 1, 10, 8, 0)),
    #     Activity(user_id=1, activity_type="B", timestamp=datetime(2023, 1, 1, 10, 9, 0)),
    #     Activity(user_id=1, activity_type="C", timestamp=datetime(2023, 1, 1, 10, 10, 0)), # A,B,C (3)
    #     Activity(user_id=1, activity_type="D", timestamp=datetime(2023, 1, 1, 10, 11, 0)), # A,B,C,D (1)
    #     Activity(user_id=1, activity_type="A", timestamp=datetime(2023, 1, 1, 10, 12, 0)),
    #     Activity(user_id=1, activity_type="B", timestamp=datetime(2023, 1, 1, 10, 13, 0)),
    #     Activity(user_id=1, activity_type="C", timestamp=datetime(2023, 1, 1, 10, 14, 0)),
    #     Activity(user_id=1, activity_type="D", timestamp=datetime(2023, 1, 1, 10, 15, 0)), # A,B,C,D (2)
    # ]
    # try:
    #     test_db_session.add_all(activities_data)
    #     test_db_session.commit()
    # except Exception as e:
    #     test_db_session.rollback()
    #     print(f"Error adding activities: {e}")

    # # Run the service
    # print("Running process note identification...")
    # new_count, updated_count = identify_and_update_process_notes(test_db_session, user_id=1)
    # print(f"New notes created: {new_count}, Notes updated: {updated_count}")

    # # Query and print results (conceptual)
    # notes = test_db_session.query(ProcessNote).filter(ProcessNote.user_id == 1).all()
    # for note in notes:
    #     print(f"Note ID: {note.id}, Task: {note.inferred_task_name}, Steps: {note.process_steps_description}, Occurrences: {note.occurrence_count}, FirstObs: {note.first_observed_at}, LastObs: {note.last_observed_at}")
    #     print(f"  Source IDs: {note.source_activity_ids}")
    
    # test_db_session.close()
    pass

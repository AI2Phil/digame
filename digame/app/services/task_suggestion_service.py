from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, not_
from typing import List
from datetime import datetime, timedelta

from digame.app.models.process_notes import ProcessNote
from digame.app.models.task import Task
# from digame.app.models.user import User # For type hinting user_id if needed

# --- Constants for Task Suggestion Logic ---
MIN_OCCURRENCE_THRESHOLD = 3 # ProcessNote must occur at least this many times
RECENCY_DAYS_THRESHOLD = 30  # ProcessNote must have been observed in the last X days
ACTIVE_TASK_STATUSES = ['suggested', 'accepted', 'in_progress'] # Statuses indicating an active task

# --- Helper for Priority Scoring ---
def calculate_task_priority(occurrence_count: int, last_observed_at: datetime) -> float:
    """
    Calculates a priority score for a task based on process note attributes.
    Score is between 0.0 and 1.0.
    """
    # Normalization factors (these might need tuning or be based on actual data distribution)
    MAX_OCCURRENCE_FOR_NORMALIZATION = 50  # Assume occurrences rarely exceed this for normalization
    MAX_RECENCY_SCORE_DAYS = 90 # Max days to consider for recency affecting score

    # Occurrence component (e.g., 0.0 to 0.6 of the score)
    # Cap occurrence_count to avoid scores > 1 if it exceeds MAX_OCCURRENCE
    normalized_occurrence = min(occurrence_count / MAX_OCCURRENCE_FOR_NORMALIZATION, 1.0)
    occurrence_score = normalized_occurrence * 0.6 

    # Recency component (e.g., 0.0 to 0.4 of the score)
    days_since_last_observed = (datetime.utcnow() - last_observed_at).days
    # Inverse recency: more recent = higher score. Score decreases as days_since increase.
    # Cap at MAX_RECENCY_SCORE_DAYS, anything older gets 0 recency score.
    if days_since_last_observed < 0: days_since_last_observed = 0 # Should not happen if data is correct
    
    recency_factor = max(0, (MAX_RECENCY_SCORE_DAYS - days_since_last_observed) / MAX_RECENCY_SCORE_DAYS)
    recency_score_component = recency_factor * 0.4
    
    # Base priority, plus weighted components
    base_priority = 0.1 # Ensure tasks always have some minimal priority
    
    final_priority = base_priority + occurrence_score + recency_score_component
    return min(max(final_priority, 0.0), 1.0) # Clamp between 0.0 and 1.0


# --- Main Service Function ---
def suggest_tasks_from_process_notes(db: Session, user_id: int) -> List[Task]:
    """
    Generates task suggestions from relevant ProcessNotes for a given user.
    """
    
    # 1. Define criteria for "relevant" ProcessNotes
    recency_threshold_date = datetime.utcnow() - timedelta(days=RECENCY_DAYS_THRESHOLD)

    # 2. Find ProcessNotes that already have an active linked Task
    # This subquery finds ProcessNote IDs that are linked to any task with an active status.
    subquery_process_notes_with_active_tasks = (
        db.query(Task.process_note_id)
        .filter(Task.user_id == user_id)
        .filter(Task.process_note_id != None)
        .filter(Task.status.in_(ACTIVE_TASK_STATUSES))
        .distinct()
    )
    
    # 3. Fetch relevant ProcessNotes
    #   - Meets occurrence and recency thresholds.
    #   - Does NOT have an existing active task linked to it.
    candidate_notes = (
        db.query(ProcessNote)
        .filter(ProcessNote.user_id == user_id)
        .filter(ProcessNote.occurrence_count >= MIN_OCCURRENCE_THRESHOLD)
        .filter(ProcessNote.last_observed_at >= recency_threshold_date)
        .filter(not_(ProcessNote.id.in_(subquery_process_notes_with_active_tasks)))
        .order_by(ProcessNote.last_observed_at.desc()) # Prioritize more recent notes
        .all()
    )

    if not candidate_notes:
        return []

    newly_suggested_tasks: List[Task] = []
    for note in candidate_notes:
        # 4. Create Task object
        task_description = f"Consider automating or reviewing process: {note.inferred_task_name or note.process_steps_description[:70]}"
        if len(note.process_steps_description) > 70 and not note.inferred_task_name:
            task_description += "..."

        priority = calculate_task_priority(note.occurrence_count, note.last_observed_at)

        new_task = Task(
            user_id=user_id,
            description=task_description,
            source_type='process_note',
            source_identifier=str(note.id),
            process_note_id=note.id,
            status='suggested', # Default status
            priority_score=priority,
            # notes field can be populated with more details from the process note if desired
            notes=f"Based on process: {note.process_steps_description}\nOccurrences: {note.occurrence_count}, Last Seen: {note.last_observed_at.strftime('%Y-%m-%d %H:%M')}"
        )
        newly_suggested_tasks.append(new_task)

    # 5. Add to session and commit (if any tasks were created)
    if newly_suggested_tasks:
        db.add_all(newly_suggested_tasks)
        try:
            db.commit()
            # Refresh instances to get IDs and server-set defaults like created_at
            for task in newly_suggested_tasks:
                db.refresh(task)
        except Exception as e:
            db.rollback()
            # Log error e
            print(f"Error committing new tasks: {e}") # Replace with proper logging
            # Depending on desired behavior, could re-raise or return empty list/error status
            raise # Or return []
            
    return newly_suggested_tasks

# Example usage (conceptual)
# if __name__ == "__main__":
#     # Requires DB setup, User, ProcessNote, Activity data
#     # from sqlalchemy import create_engine
#     # from sqlalchemy.orm import sessionmaker
#     # from digame.app.models.user import Base as AppBase
# 
#     # DATABASE_URL_TEST = "sqlite:///:memory:"
#     # engine = create_engine(DATABASE_URL_TEST)
#     # AppBase.metadata.create_all(engine)
#     # SessionLocalTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#     # test_db = SessionLocalTest()
# 
#     # # Create a dummy user
#     # try:
#     #     test_user = User(id=1, username="taskuser", email="taskuser@example.com", hashed_password="xxx")
#     #     test_db.add(test_user)
#     #     test_db.commit()
#     # except Exception: 
#     #     test_db.rollback()
#     #     test_user = test_db.query(User).filter_by(id=1).first()
# 
#     # # Create some dummy ProcessNotes for user 1
#     # note1 = ProcessNote(user_id=1, inferred_task_name="Daily Reporting", process_steps_description="Open Excel -> Run Macro -> Email Report",
#     #                     occurrence_count=10, last_observed_at=datetime.utcnow() - timedelta(days=5))
#     # note2 = ProcessNote(user_id=1, inferred_task_name="Client Onboarding", process_steps_description="Create Account -> Send Welcome Email -> Schedule Call",
#     #                     occurrence_count=5, last_observed_at=datetime.utcnow() - timedelta(days=40)) # Too old
#     # note3 = ProcessNote(user_id=1, inferred_task_name="Bug Triage", process_steps_description="Check Jira -> Reproduce Bug -> Assign Priority",
#     #                     occurrence_count=20, last_observed_at=datetime.utcnow() - timedelta(days=1))
#     # test_db.add_all([note1, note2, note3])
#     # test_db.commit()
#     
#     # # Simulate an existing active task for note3
#     # existing_task = Task(user_id=1, description="Active task for Bug Triage", process_note_id=note3.id, status='in_progress')
#     # test_db.add(existing_task)
#     # test_db.commit()
# 
#     # print("Suggesting tasks for user 1...")
#     # suggested_tasks = suggest_tasks_from_process_notes(test_db, user_id=1)
#     # for task in suggested_tasks:
#     #     print(f"  Suggested Task ID: {task.id}, Desc: {task.description}, Priority: {task.priority_score:.2f}, Source Note ID: {task.process_note_id}")
#     #     print(f"    Notes: {task.notes}")
# 
#     # test_db.close()
#     pass

from sqlalchemy.orm import Session
from typing import List, Optional

from digame.app.models.process_notes import ProcessNote
# Assuming User.id is an integer based on previous model definitions
# If User.id is string/UUID, the user_id type hint below should change.

def get_process_note_by_id(db: Session, note_id: int) -> Optional[ProcessNote]:
    """
    Retrieves a specific ProcessNote by its ID.
    """
    return db.query(ProcessNote).filter(ProcessNote.id == note_id).first()

def get_process_notes_by_user_id(
    db: Session, 
    user_id: int, # Assuming User.id is int
    skip: int = 0, 
    limit: int = 100
) -> List[ProcessNote]:
    """
    Retrieves all ProcessNote entries for a given user_id with pagination.
    """
    return (
        db.query(ProcessNote)
        .filter(ProcessNote.user_id == user_id)
        .order_by(ProcessNote.last_observed_at.desc(), ProcessNote.id.desc()) # Example ordering
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_process_note_feedback_tags(
    db: Session, 
    note_id: int, 
    data: "ProcessNoteFeedbackUpdate" # Forward reference for Pydantic model if not imported directly
) -> Optional[ProcessNote]:
    """
    Updates the user_feedback and/or user_tags for a specific ProcessNote.
    """
    db_note = get_process_note_by_id(db, note_id=note_id)
    if db_note:
        updated = False
        if data.user_feedback is not None:
            db_note.user_feedback = data.user_feedback
            updated = True
        
        # For user_tags, allow setting to new list or clearing (if data.user_tags is an empty list or None and model allows null)
        # If data.user_tags is None, it means "no change" to tags in a PATCH-like update.
        # If data.user_tags is an empty list [], it means "clear existing tags".
        if data.user_tags is not None: # Field is present in the request
            db_note.user_tags = data.user_tags # Assigns the new list (can be empty)
            updated = True
        
        if updated:
            db.commit()
            db.refresh(db_note)
    return db_note

# Need to import ProcessNoteFeedbackUpdate for the type hint if not using forward reference
# from digame.app.schemas.process_note_schemas import ProcessNoteFeedbackUpdate
# For now, using forward reference as it's common in CRUD files.

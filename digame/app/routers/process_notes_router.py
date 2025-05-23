from fastapi import APIRouter, Depends, HTTPException, status, Path, Body
from sqlalchemy.orm import Session
from typing import List

from ..schemas import process_note_schemas
from ..crud import process_notes_crud
from ..services import process_note_service
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from ..models.user import User as SQLAlchemyUser # For current_user type hint

# Import get_db directly from the db module
from ..db import get_db

router = APIRouter(
    tags=["Process Notes"],
)

# Define permission strings (these should ideally be constants imported from a central place)
PERMISSION_TRIGGER_OWN_PROCESS_DISCOVERY = "trigger_own_process_discovery"
PERMISSION_VIEW_OWN_PROCESS_NOTES = "view_own_process_notes"
# For admin override, the PermissionChecker would need to be more complex or use multiple dependencies.
# For now, these permissions apply to the "owner" of the data.
PERMISSION_ADD_FEEDBACK_OWN_PROCESS_NOTES = "add_feedback_own_process_notes"


@router.post("/users/{user_id}/trigger-process-discovery", 
             response_model=process_note_schemas.ProcessDiscoveryResponse,
             dependencies=[Depends(PermissionChecker(PERMISSION_TRIGGER_OWN_PROCESS_DISCOVERY))])
async def trigger_process_discovery_for_user(
    user_id: int = Path(..., description="The ID of the user to trigger process discovery for"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user) # To check ownership
):
    """
    Triggers the process discovery service for a specific user.
    Requires 'trigger_own_process_discovery' permission.
    The authenticated user must match the user_id in the path.
    """
    if current_user.id != user_id:
        # This check ensures user can only trigger for themselves, even with the permission.
        # Admins would need a separate permission (e.g., 'trigger_any_process_discovery')
        # and a different dependency or modified PermissionChecker.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to trigger process discovery for this user."
        )

    try:
        new_notes, updated_notes = process_note_service.identify_and_update_process_notes(db, user_id=user_id)
        return process_note_schemas.ProcessDiscoveryResponse(
            message=f"Process discovery triggered for user {user_id}.",
            user_id=user_id,
            new_notes_created=new_notes,
            notes_updated=updated_notes
        )
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during process discovery: {str(e)}"
        )

@router.get("/users/{user_id}/notes",  # Changed from /process-notes to /notes to avoid /process-notes/process-notes
            response_model=List[process_note_schemas.ProcessNoteResponse],
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_PROCESS_NOTES))])
async def read_process_notes_for_user(
    user_id: int = Path(..., description="The ID of the user whose process notes to retrieve"),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user) # To check ownership
):
    """
    Retrieves all ProcessNote entries for a given user.
    Requires 'view_own_process_notes' permission.
    The authenticated user must match the user_id in the path.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view process notes for this user."
        )
    
    notes = process_notes_crud.get_process_notes_by_user_id(db, user_id=user_id, skip=skip, limit=limit)
    return notes

@router.get("/{note_id}", 
            response_model=process_note_schemas.ProcessNoteResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_PROCESS_NOTES))])
async def read_single_process_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user) # To check ownership
):
    """
    Retrieves a specific ProcessNote by its ID.
    Requires 'view_own_process_notes' permission.
    The authenticated user must own the note.
    """
    db_note = process_notes_crud.get_process_note_by_id(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ProcessNote not found")
    
    if db_note.user_id != current_user.id:
        # This ensures that even with the general permission, users can only access their own notes via this route.
        # Admins wanting to view any note would need a different permission/endpoint.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this process note."
        )
    return db_note

@router.patch("/{note_id}/feedback",
             response_model=process_note_schemas.ProcessNoteResponse,
             dependencies=[Depends(PermissionChecker(PERMISSION_ADD_FEEDBACK_OWN_PROCESS_NOTES))])
async def update_process_note_feedback(
    note_id: int = Path(..., description="The ID of the process note to update"),
    feedback_data: process_note_schemas.ProcessNoteFeedbackUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Updates user feedback and/or tags for a specific ProcessNote.
    Requires 'add_feedback_own_process_notes' permission.
    The authenticated user must own the note.
    """
    db_note = process_notes_crud.get_process_note_by_id(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ProcessNote not found")

    if db_note.user_id != current_user.id:
        # Ensure the current user owns the note
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update feedback for this process note."
        )

    # Validate that at least one field is being updated if Pydantic model doesn't enforce it
    # The Pydantic model ProcessNoteFeedbackUpdate should ideally have a root validator for this.
    # If not, add check here:
    if feedback_data.user_feedback is None and feedback_data.user_tags is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field (user_feedback or user_tags) must be provided for update."
        )
        
    updated_note = process_notes_crud.update_process_note_feedback_tags(db, note_id=note_id, data=feedback_data)
    # update_process_note_feedback_tags should ideally return the updated note or raise if update fails
    # For now, assuming it returns the note or None (though it's more likely to return the note or raise an error)
    if updated_note is None: # Should not happen if get_process_note_by_id found it and update didn't fail catastrophically
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update process note feedback.")
        
    return updated_note

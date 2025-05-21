from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from digame.app.schemas import task_schemas # Import the new task schemas
from digame.app.crud import task_crud # Import the new task CRUD functions
from digame.app.services import task_suggestion_service # For the optional trigger endpoint
from digame.app.auth.auth_dependencies import PermissionChecker, get_current_active_user
from digame.app.models.user import User as SQLAlchemyUser # For current_user type hint
from digame.app.models.task import Task as SQLAlchemyTask # For type hinting

# Assuming get_db dependency is available
from .admin_rbac_router import get_db # Placeholder, replace with actual get_db path

router = APIRouter(
    prefix="/tasks", # Base prefix for tasks
    tags=["Task Management"],
)

# Define permission strings
PERMISSION_VIEW_OWN_TASKS = "view_own_tasks"
PERMISSION_MANAGE_OWN_TASKS = "manage_own_tasks" # Covers acknowledging, could be more granular
PERMISSION_TRIGGER_TASK_SUGGESTIONS = "trigger_own_task_suggestions"

@router.get("/users/{user_id}/", # GET /tasks/users/{user_id}/
            response_model=List[task_schemas.TaskResponse],
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_TASKS))])
async def read_user_tasks(
    user_id: int = Path(..., description="The ID of the user whose tasks to retrieve"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter tasks by status (e.g., 'suggested', 'in_progress')"),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Retrieves tasks for a given user, optionally filtered by status.
    Requires 'view_own_tasks' permission.
    The authenticated user must match the user_id in the path.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tasks for this user."
        )
    
    tasks = task_crud.get_tasks_by_user_id(db, user_id=user_id, status=status_filter, skip=skip, limit=limit)
    return tasks

@router.post("/{task_id}/acknowledge", # POST /tasks/{task_id}/acknowledge
             response_model=task_schemas.TaskResponse,
             dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OWN_TASKS))])
async def acknowledge_task(
    task_id: int = Path(..., description="The ID of the task to acknowledge"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Acknowledges a 'suggested' task, changing its status to 'acknowledged'.
    Requires 'manage_own_tasks' permission.
    The authenticated user must own the task.
    """
    db_task = task_crud.get_task_by_id(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if db_task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this task."
        )

    if db_task.status != 'suggested':
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # Or 400 Bad Request
            detail=f"Task cannot be acknowledged. Current status is '{db_task.status}', expected 'suggested'."
        )
        
    updated_task = task_crud.update_task_status(db, task_id=task_id, new_status='acknowledged')
    if not updated_task: # Should not happen if previous checks passed, but for safety
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update task status.")
        
    return updated_task

# Optional: Endpoint to trigger task suggestions
@router.post("/users/{user_id}/trigger-suggestions",
             response_model=List[task_schemas.TaskResponse], # Returns newly suggested tasks
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERMISSION_TRIGGER_TASK_SUGGESTIONS))])
async def trigger_task_suggestions_for_user(
    user_id: int = Path(..., description="The ID of the user to trigger task suggestions for"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Triggers the task suggestion service for a specific user based on their process notes.
    Requires 'trigger_own_task_suggestions' permission.
    The authenticated user must match the user_id in the path.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to trigger task suggestions for this user."
        )

    try:
        suggested_tasks = task_suggestion_service.suggest_tasks_from_process_notes(db, user_id=user_id)
        if not suggested_tasks:
            # Return 200 OK with empty list if no new suggestions, or could be 204 NO CONTENT.
            # For now, returning 200 with list is consistent with GET.
            # If service call itself fails, it might raise an exception handled below.
            return [] 
        return suggested_tasks # List of newly created Task objects
    except Exception as e:
        # Log e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during task suggestion: {str(e)}"
        )

# Note: Add router to main.py:
# from digame.app.routers import task_router
# app.include_router(task_router.router) # Or with prefix="/tasks" if not in APIRouter
# The prefix="/tasks" is already in APIRouter, so it's fine.

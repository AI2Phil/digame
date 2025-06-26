from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from ..schemas import task_schemas # Import the new task schemas
from ..crud import task_crud # Import the new task CRUD functions
from ..services import task_suggestion_service # For the optional trigger endpoint
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from ..models.user import User as SQLAlchemyUser # For current_user type hint
from ..models.task import Task as SQLAlchemyTask # For type hinting

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

@router.post("/users/{user_id}/", # POST /tasks/users/{user_id}/
             response_model=task_schemas.TaskResponse,
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OWN_TASKS))])
async def create_task_for_user(
    task: task_schemas.TaskCreate,
    user_id: int = Path(..., description="The ID of the user for whom to create the task"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Creates a new task for the specified user.
    Requires 'manage_own_tasks' permission.
    The authenticated user must match the user_id in the path.
    The `user_id` for the task itself is taken from the path.
    `assigned_resource_id` in the payload can specify a different assignee if needed.
    """
    if current_user.id != user_id and not task.assigned_resource_id == current_user.id : # User can create tasks for themselves or assign to themselves
         # More complex logic might be needed if users can create tasks for others they manage, etc.
         # For now, simple: you create tasks under your user_id context.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user context."
        )

    # If assigned_resource_id is not provided in payload, default to the user_id (task owner)
    if task.assigned_resource_id is None:
        task.assigned_resource_id = user_id

    try:
        # The user_id passed to task_crud.create_task is the owner of the task record.
        created_task = task_crud.create_task(db=db, task=task, user_id=user_id)
        return created_task
    except Exception as e:
        # Log e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Or 500 if it's an unexpected server error
            detail=f"Error creating task: {str(e)}"
        )

@router.get("/{task_id}/", # GET /tasks/{task_id}/
            response_model=task_schemas.TaskResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_TASKS))])
async def read_task(
    task_id: int = Path(..., description="The ID of the task to retrieve"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Retrieves a specific task by its ID.
    Requires 'view_own_tasks' permission.
    The authenticated user must be the owner or assigned resource of the task.
    """
    db_task = task_crud.get_task_by_id(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Check if current user is owner or assignee
    if db_task.user_id != current_user.id and \
       (db_task.assigned_resource_id is None or db_task.assigned_resource_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task."
        )
    return db_task

@router.put("/{task_id}/", # PUT /tasks/{task_id}/
            response_model=task_schemas.TaskResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OWN_TASKS))])
async def update_task(
    task_id: int = Path(..., description="The ID of the task to update"),
    task_update: task_schemas.TaskUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Updates an existing task.
    Requires 'manage_own_tasks' permission.
    The authenticated user must be the owner or assigned resource of the task.
    """
    db_task = task_crud.get_task_by_id(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if db_task.user_id != current_user.id and \
       (db_task.assigned_resource_id is None or db_task.assigned_resource_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task."
        )

    # Prevent changing user_id via this endpoint; owner is fixed.
    # assigned_resource_id can be changed if provided in task_update schema.
    updated_task = task_crud.update_task(db=db, task_id=task_id, task_update=task_update)
    if not updated_task: # Should not happen if previous checks passed
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update task.")
    return updated_task


@router.delete("/{task_id}/", # DELETE /tasks/{task_id}/
               status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OWN_TASKS))])
async def delete_task(
    task_id: int = Path(..., description="The ID of the task to delete"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Deletes a task.
    Requires 'manage_own_tasks' permission.
    The authenticated user must be the owner of the task. (Stricter than update/view for delete)
    """
    db_task = task_crud.get_task_by_id(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if db_task.user_id != current_user.id: # Only owner can delete
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task."
        )

    if not task_crud.delete_task(db=db, task_id=task_id): # delete_task in crud should also check ownership potentially
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete task.")
    return # Returns 204 No Content on success


@router.post("/{task_id}/acknowledge", # POST /tasks/{task_id}/acknowledge
             response_model=task_schemas.TaskResponse,
             dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OWN_TASKS))])
async def acknowledge_task(
    task_id: int = Path(..., description="The ID of the task to acknowledge"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Acknowledges a 'suggested' task, changing its status to 'accepted'. (Changed to 'accepted')
    Requires 'manage_own_tasks' permission.
    The authenticated user must own or be assigned the task.
    """
    db_task = task_crud.get_task_by_id(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if db_task.user_id != current_user.id and \
       (db_task.assigned_resource_id is None or db_task.assigned_resource_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this task."
        )

    if db_task.status != 'suggested':
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task cannot be acknowledged. Current status is '{db_task.status}', expected 'suggested'."
        )
        
    updated_task = task_crud.update_task_status(db, task_id=task_id, new_status='accepted') # Changed to 'accepted'
    if not updated_task:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update task status.")
        
    return updated_task

# Optional: Endpoint to trigger task suggestions
@router.post("/users/{user_id}/trigger-suggestions",
             response_model=List[task_schemas.TaskResponse],
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
            return [] 
        return suggested_tasks
    except Exception as e:
        # Log e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during task suggestion: {str(e)}"
        )

# Note: Add router to main.py:
# from app.routers import task_router
# app.include_router(task_router.router)
# The prefix="/tasks" is already in APIRouter, so it's fine.

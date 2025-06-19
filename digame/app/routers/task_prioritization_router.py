from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel
from digame.app.services.task_prioritization_service import TaskPrioritizationService, get_task_prioritization_service
from digame.app.schemas import task_prioritization_schemas as schemas

router = APIRouter(
    prefix="/ai/tasks/prioritization",
    tags=["AI - Intelligent Task Prioritization"],
)

@router.post("/prioritize", response_model=schemas.PrioritizationResponse)
def prioritize_user_tasks_endpoint(
    request_data: schemas.PrioritizationRequest, # Request body to control if changes are applied
    current_user: UserModel = Depends(get_current_active_user),
    service: TaskPrioritizationService = Depends(get_task_prioritization_service),
):
    """
    Analyzes the current user's active tasks and suggests priority scores.
    Optionally applies these new scores to the tasks in the database.
    This feature must be enabled for the user's tenant.
    """
    try:
        prioritized_list = service.prioritize_tasks_for_user(
            current_user=current_user,
            apply_changes=request_data.apply_changes
        )

        message = "Tasks analyzed and priorities suggested."
        if request_data.apply_changes:
            message = "Tasks analyzed, priorities suggested and applied to the database."

        return schemas.PrioritizationResponse(
            message=message,
            processed_task_count=len(prioritized_list),
            prioritized_tasks=prioritized_list,
            changes_applied=request_data.apply_changes
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions directly from the service
        raise e
    except Exception as e:
        # Log the error e in a real application
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during task prioritization: {str(e)}"
        )

@router.get("/health", status_code=status.HTTP_200_OK)
async def task_prioritization_health_check():
    return {"status": "healthy", "service": "AI - Intelligent Task Prioritization"}

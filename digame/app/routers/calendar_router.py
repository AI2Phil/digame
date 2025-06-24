from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from fastapi.responses import PlainTextResponse # For returning .ics content

from данной.services.calendar_service import CalendarService, get_calendar_service
from данной.crud import task_crud
from данной.auth.auth_dependencies import PermissionChecker, get_current_active_user # Assuming similar auth
from данной.models.user import User as SQLAlchemyUser
# Assuming get_db dependency is available
from .admin_rbac_router import get_db # Placeholder, replace with actual get_db path

router = APIRouter(
    prefix="/calendar",
    tags=["Calendar Management"],
)

# Define permission strings - reuse or define new ones if needed
PERMISSION_VIEW_OWN_TASKS_CALENDAR = "view_own_tasks_calendar" # Example permission

@router.get("/tasks/{task_id}/ics",
            response_class=PlainTextResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_TASKS_CALENDAR))])
async def download_task_ics(
    task_id: int = Path(..., description="The ID of the task to generate an iCalendar file for"),
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Generates and returns an iCalendar (.ics) file for a specific task.
    Requires 'view_own_tasks_calendar' permission.
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
            detail="Not authorized to generate calendar event for this task."
        )

    try:
        ics_content = calendar_service.generate_ics_for_task(db_task)

        # Set headers for file download
        # Sanitize description for filename
        safe_description = "".join(c if c.isalnum() else "_" for c in db_task.description[:30])
        filename = f"task_{db_task.id}_{safe_description}.ics"

        return PlainTextResponse(
            content=ics_content,
            media_type="text/calendar",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve: # Catch specific errors from service
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Log e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during iCalendar generation: {str(e)}"
        )

# Note: Add this router to main.py:
# from digame.app.routers import calendar_router
# app.include_router(calendar_router.router)

# Also, ensure the new permission PERMISSION_VIEW_OWN_TASKS_CALENDAR is defined
# and assigned to relevant roles in your RBAC setup (e.g., in init_auth_db.py or similar).
# For example, in init_auth_db.py, add to `all_permissions`:
# {"name": "view_own_tasks_calendar", "description": "Allows viewing/exporting calendar events for own tasks"},
# And assign it to roles like "Authenticated User".

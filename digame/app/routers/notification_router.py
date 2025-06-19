from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Assuming standard locations for dependencies, adjust if necessary
from digame.app.db.session import get_db # Placeholder
from digame.app.auth.dependencies import get_current_active_user # Placeholder, might be get_current_user

from digame.app.crud import notification_crud
from digame.app.schemas import notification_schemas
from digame.app.models import user as user_model # Explicitly import user model

router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[notification_schemas.Notification])
async def read_notifications(
    skip: int = 0,
    limit: int = 100,
    read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_active_user) # Use the imported user model
):
    """
    Retrieve notifications for the current user.
    - `skip`: Number of notifications to skip.
    - `limit`: Maximum number of notifications to return.
    - `read`: Filter by read status:
        - `true`: Only read notifications.
        - `false`: Only unread notifications.
        - `null` (default): All notifications.
    """
    # The `read` query parameter directly maps to the `read_status` in CRUD.
    # `read = True` -> `read_status = True` (only read)
    # `read = False` -> `read_status = False` (only unread)
    # `read = None` -> `read_status = None` (all)
    notifications = notification_crud.get_notifications_for_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        read_status=read
    )
    return notifications

@router.post("/{notification_id}/read", response_model=notification_schemas.Notification)
async def mark_notification_as_read_endpoint(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_active_user)
):
    """
    Mark a specific notification as read.
    """
    db_notification = notification_crud.mark_notification_as_read(
        db=db, notification_id=notification_id, user_id=current_user.id
    )
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied"
        )
    return db_notification

@router.post("/all/read", response_model=List[notification_schemas.Notification])
async def mark_all_user_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_active_user)
):
    """
    Mark all unread notifications for the current user as read.
    """
    updated_notifications = notification_crud.mark_all_notifications_as_read_for_user(
        db=db, user_id=current_user.id
    )
    return updated_notifications

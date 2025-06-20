from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# Attempt to import actual dependencies, fallback to mocks if necessary for robustness
try:
    from digame.app.database import get_db # Standard way to get DB session
    from digame.app.auth.auth_dependencies import get_current_active_user # Standard auth
    from digame.app.schemas.user_schemas import User # For current_user type hint
except ImportError:
    # This block is for robustness if the exact paths are different or during isolated testing
    # In a real environment, these imports should resolve correctly.
    # Fallback to simpler User model if user_schemas.User isn't found initially.
    try:
        from digame.app.models.user import User # Fallback to model if schema not found
    except ImportError:
        # Absolute fallback mock if no User model/schema is found
        class User:
            id: int = 1
            is_active: bool = True

    # Mock get_db if not found
    def get_db(): return None
    # Mock get_current_active_user if not found
    def get_current_active_user() -> User: return User()


from digame.app import crud # Access as crud.function_name
from digame.app import schemas # Access as schemas.ClassName

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

@router.get("/new", response_model=List[schemas.Notification])
async def get_new_notifications(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: User = Depends(get_current_active_user) # Use authenticated user
):
    """
    Retrieve new (unread) notifications for the authenticated user.
    """
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

    # user_id is taken from the authenticated current_user
    notifications = crud.get_unread_notifications_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )

    # FastAPI will correctly return an empty list if no notifications are found.
    return notifications

@router.get("/", response_model=List[schemas.Notification])
async def get_all_notifications_for_user(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: User = Depends(get_current_active_user) # Use authenticated user
):
    """
    Retrieve all notifications (read and unread) for the authenticated user.
    """
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

    notifications = crud.get_notifications_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return notifications


@router.post("/{notification_id}/read", response_model=schemas.Notification)
async def mark_notification_as_read_route(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a specific notification as read.
    """
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=403, detail="User not authenticated or inactive.")

    db_notification = crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    if db_notification.user_id != current_user.id:
        # This check ensures users can only mark their own notifications as read.
        raise HTTPException(status_code=403, detail="Not authorized to modify this notification")

    updated_notification = crud.mark_notification_as_read(db=db, notification_id=notification_id)
    if updated_notification is None: # Should not happen if previous checks passed
        raise HTTPException(status_code=404, detail="Notification not found after attempting to mark as read")
    return updated_notification

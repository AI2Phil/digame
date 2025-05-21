from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List

from digame.app.schemas import anomaly_schemas # Import the new anomaly schemas
from digame.app.crud import anomaly_crud # Import the new anomaly CRUD functions
from digame.app.auth.auth_dependencies import PermissionChecker, get_current_active_user
from digame.app.models.user import User as SQLAlchemyUser # For current_user type hint

# Assuming get_db dependency is available, e.g., from admin_rbac_router or a common place
from .admin_rbac_router import get_db # Placeholder, replace with actual get_db path

router = APIRouter(
    prefix="/anomalies", # Base prefix for anomalies
    tags=["Anomaly Detection"],
)

# Define permission string (ideally from a central constants/permissions file)
PERMISSION_VIEW_OWN_ANOMALIES = "view_own_anomalies"

@router.get("/users/{user_id}/", # Added trailing slash for consistency, matches user_id in path
            response_model=List[anomaly_schemas.DetectedAnomalyResponse],
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OWN_ANOMALIES))])
async def read_user_anomalies(
    user_id: int = Path(..., description="The ID of the user whose anomalies to retrieve"),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user) # To check ownership
):
    """
    Retrieves all DetectedAnomaly entries for a given user.
    Requires 'view_own_anomalies' permission.
    The authenticated user must match the user_id in the path.
    (Admins would need a separate permission/endpoint for other users' anomalies).
    """
    if current_user.id != user_id:
        # This check ensures user can only view their own anomalies, even if they have the permission.
        # For an admin to view others, they'd need a different permission (e.g., "view_any_anomalies")
        # and this check would need to be adjusted or a separate endpoint created.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view anomalies for this user."
        )
    
    anomalies = anomaly_crud.get_anomalies_by_user_id(db, user_id=user_id, skip=skip, limit=limit)
    if not anomalies and skip == 0: # Only raise 404 if no anomalies and not due to pagination
        # It's debatable whether to return 404 or empty list if user exists but has no anomalies.
        # For now, returning empty list is fine as per typical API behavior for lists.
        # If user_id itself was not found, that would be a different check (e.g., in get_current_user or a user CRUD).
        pass # Simply return empty list if no anomalies

    return anomalies

# Example of how to include this router in main.py:
# from digame.app.routers import anomaly_router
# app.include_router(anomaly_router.router) # Prefix is already in the router instance.
# It's common to put prefix in include_router: app.include_router(anomaly_router.router, prefix="/anomalies", tags=["Anomaly Detection"])
# But since prefix is in APIRouter, it's also fine. Let's adjust it in main.py to be explicit.

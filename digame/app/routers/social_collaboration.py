"""
Social Collaboration API Router
Handles peer matching, user profile updates for social features, and other related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Corrected import paths assuming 'app' is the root for these modules
from ..database import get_db # Assuming a get_db dependency for session
from ..models.user import User as UserModel # For type hinting the authenticated user
from ..schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from ..schemas.user_schemas import User as UserSchema # Basic User schema for list responses, adjust if needed
from ..services.social_collaboration_service import SocialCollaborationService
from ..crud import user_crud # For profile CRUD

# Placeholder for authentication dependency - replace with your actual auth mechanism
async def get_current_active_user(db: Session = Depends(get_db)) -> UserModel:
    # In a real app, this would come from a token, etc.
    # For now, returning the first user or raising an error if no users.
    user = db.query(UserModel).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

async def get_admin_user(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    # Placeholder: In a real app, check if current_user has admin role/permissions.
    # For now, just returns the current user, assuming they might be an admin.
    # Add actual permission check here, e.g., by checking user.roles.
    # if not any(role.name == "Admin" for role in current_user.roles): # Example check
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user


router = APIRouter(
    prefix="/api/v1/social", # Using /api/v1 prefix for consistency
    tags=["Social Collaboration"]
)

# --- User Profile Management for Social Features ---

@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def read_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get a user's social profile.
    A user can view their own profile. Viewing other profiles might require admin or specific permissions.
    """
    if current_user.id != user_id:
        # Add admin check or other permission logic here if needed
        # For now, only allow users to see their own profile via this specific endpoint.
        # Or, if it's a public profile system, this check might be different.
        # To view other profiles, an admin role or specific "social:view_others_profile" perm might be needed.
        # This depends on product requirements.
        # tenant_service = TenantService(db) # If using tenant-based permissions
        # if not tenant_service.check_permission(current_user.id, "profile:view_any"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this profile")

    profile = user_crud.get_user_profile(db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile

@router.put("/users/{user_id}/profile", response_model=UserProfileResponse)
async def update_user_social_profile(
    user_id: int,
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update a user's social profile.
    Users can update their own profile. Admins might update others.
    """
    if current_user.id != user_id:
        # Add admin check here, e.g., if current_user is an admin
        # if not is_admin(current_user): # Placeholder for admin check
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")

    updated_profile = user_crud.update_user_profile(db, user_id=user_id, profile_update=profile_data)
    if not updated_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found, cannot update")
    return updated_profile


# --- Peer Matching and Learning Partner Recommendations ---

@router.get("/users/{user_id}/peer-matches", response_model=List[UserWithProfileResponse])
async def get_social_matches(
    user_id: int,
    match_type: Optional[str] = Query("skill", description="Type of match: 'skill' or 'learning_partner'"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get peer matches for a user.
    - `match_type='skill'`: Finds users with similar skills.
    - `match_type='learning_partner'`: Recommends learning partners.
    A user can typically only request matches for themselves.
    """
    if current_user.id != user_id:
        # Allow admins to request for others, or implement specific permission
        # if not is_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to request matches for this user")

    service = SocialCollaborationService(db)

    if match_type == "learning_partner":
        users = service.get_learning_partner_recommendations(user_id=user_id, limit=limit)
    elif match_type == "skill":
        users = service.get_skill_based_matches(user_id=user_id, limit=limit)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid match_type. Use 'skill' or 'learning_partner'.")

    # Populate UserWithProfileResponse
    results = []
    for user_model in users:
        profile_model = user_crud.get_user_profile(db, user_id=user_model.id)
        results.append(UserWithProfileResponse(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            first_name=user_model.first_name,
            last_name=user_model.last_name,
            is_active=user_model.is_active,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            profile=UserProfileResponse.model_validate(profile_model) if profile_model else None # Use model_validate for Pydantic v2
        ))
    return results


@router.get("/users/{user_id}/skill-matches", response_model=List[UserWithProfileResponse], deprecated=True)
async def get_skill_based_matches_deprecated(
    user_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get skill-based peer matches.
    (Deprecated: Use `/users/{user_id}/peer-matches?match_type=skill` instead)
    """
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    service = SocialCollaborationService(db)
    users = service.get_skill_based_matches(user_id=user_id, limit=limit)

    results = []
    for user_model in users:
        profile_model = user_crud.get_user_profile(db, user_id=user_model.id)
        results.append(UserWithProfileResponse(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            first_name=user_model.first_name,
            last_name=user_model.last_name,
            is_active=user_model.is_active,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            profile=UserProfileResponse.model_validate(profile_model) if profile_model else None
        ))
    return results

# --- Other Social Endpoints (Placeholder/Not Implemented) ---
# These are kept from the original router structure but marked as not implemented or simplified.

@router.get("/users/{user_id}/industry-connections", include_in_schema=False) # Hiding from OpenAPI for now
async def get_industry_connections_mock(user_id: int, current_user: UserModel = Depends(get_current_active_user)):
    # require_permission("view_user_data", current_user) # Example
    return {"message": "Industry connections endpoint not fully implemented."}

@router.get("/networking-events", include_in_schema=False)
async def get_networking_events_mock(current_user: UserModel = Depends(get_current_active_user)):
    return {"message": "Networking events endpoint not fully implemented."}

@router.get("/users/{user_id}/mentorship-programs", include_in_schema=False)
async def get_mentorship_programs_mock(user_id: int, current_user: UserModel = Depends(get_current_active_user)):
    return {"message": "Mentorship programs endpoint not fully implemented."}

@router.post("/mentorship/{program_id}/join", include_in_schema=False)
async def join_mentorship_program_mock(program_id: int, current_user: UserModel = Depends(get_current_active_user)):
    return {"message": f"Joining mentorship program {program_id} not fully implemented."}

@router.get("/users/{user_id}/collaboration-projects", include_in_schema=False)
async def get_collaboration_projects_mock(user_id: int, current_user: UserModel = Depends(get_current_active_user)):
    return {"message": "Collaboration projects endpoint not fully implemented."}

# ... (other mock endpoints can be similarly marked or simplified)
```

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict

# Schema imports
from digame.app.schemas.social_schemas import PeerMatchResponse, MatchedUser

# Model imports
from digame.app.models.user import User as UserModel

# CRUD and Service imports
from digame.app.crud import user_crud
from digame.app.services.matching_service import match_peers_by_skills

# Dependency imports
try:
    # Attempt common location first
    from digame.app.auth.auth_dependencies import get_current_active_user
except ImportError:
    # Fallback or alternative if structure varies (e.g. if it's in a general 'dependencies' module)
    print("Failed to import get_current_active_user from digame.app.auth.auth_dependencies")
    raise

try:
    from digame.app.db import get_db # Common location for DB session dependency
except ImportError:
    try:
        from digame.app.database import get_db # Alternative common location
    except ImportError:
        print("Failed to import get_db from digame.app.db or digame.app.database")
        raise
    

router = APIRouter(
    prefix="/api/social",
    tags=["Social & Collaboration"],
)

@router.get("/peer-matches", response_model=PeerMatchResponse)
async def get_peer_matches(
    match_type: str = Query("skills", description="Type of matching: 'skills' or 'learning_partner'."),
    skill_filter: Optional[str] = Query(None, description="Filter matches by a specific skill (peer must possess this skill)."),
    experience_level: Optional[str] = Query(None, description="Filter by experience level (conceptual for now, not implemented)."),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Finds and returns a list of peer users matched by skills or learning goals.

    - **match_type**: Determines the matching criteria ('skills' or 'learning_partner').
    - **current_user**: Automatically determined from authentication token.
    - **all_other_users**: Fetched from the database.
    - **skill_filter**: If provided, only peers possessing this skill will be returned.
                       This filter applies to the peer's general skills, regardless of match_type.
    - **experience_level**: Placeholder for future filtering.
    """
    if not current_user:
        raise HTTPException(status_code=403, detail="Could not validate credentials or no active user found.")

    if match_type not in ["skills", "learning_partner"]:
        raise HTTPException(status_code=400, detail="Invalid match_type. Allowed values are 'skills' or 'learning_partner'.")

    all_users_in_db = user_crud.get_users(db=db, skip=0, limit=1000)

    matched_peers_data = match_peers_by_skills(
        current_user=current_user,
        all_users=all_users_in_db,
        match_type=match_type, # Pass the match_type to the service
        skill_weights=None
    )

    final_matches: List[MatchedUser] = []
    for match_data_dict in matched_peers_data:
        # Apply skill_filter (filters on the peer's general skills)
        if skill_filter:
            peer_general_skills = match_data_dict.get("skills", []) # 'skills' field in dict holds peer's general skills
            if not any(sf.lower() == skill_filter.lower() for sf in peer_general_skills):
                continue

        if experience_level:
            # Placeholder for experience level filtering
            pass

        final_matches.append(MatchedUser(**match_data_dict))

    return PeerMatchResponse(matches=final_matches)

import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ..models.user import User as UserModel
from ..schemas import onboarding_schemas as schemas # Alias for clarity
from . import user_crud # To fetch user

def get_onboarding_data(db: Session, user_id: int) -> Optional[schemas.OnboardingDataResponse]:
    """
    Retrieves and parses onboarding data for a given user_id.
    If no data exists or is invalid JSON, it might return default/empty onboarding data.
    """
    db_user = user_crud.get_user(db, user_id=user_id)
    if not db_user:
        return None # Or raise HTTPException if user not found is an error here

    if not db_user.onboarding_data:
        # Return a default/empty OnboardingDataResponse if no data is stored
        # This ensures the frontend always gets a consistent structure.
        default_data = schemas.OnboardingDataBase().dict()
        return schemas.OnboardingDataResponse(user_id=user_id, **default_data)

    try:
        onboarding_data_dict = json.loads(db_user.onboarding_data)
        # Validate and structure it with Pydantic model
        # This ensures that even if DB has partial/old data, it's structured.
        parsed_data = schemas.OnboardingDataBase(**onboarding_data_dict)
    except (json.JSONDecodeError, TypeError): # TypeError for None if somehow saved
        # If data is corrupted or not valid JSON, return default/empty
        default_data = schemas.OnboardingDataBase().dict()
        return schemas.OnboardingDataResponse(user_id=user_id, **default_data)
    
    return schemas.OnboardingDataResponse(user_id=user_id, **parsed_data.dict())


def update_onboarding_data(db: Session, user_id: int, data_update: schemas.OnboardingDataUpdate) -> schemas.OnboardingDataResponse:
    """
    Updates User.onboarding_data (JSON string) and User.onboarding_completed.
    Performs a merge of existing data with new data for partial updates.
    """
    db_user = user_crud.get_user(db, user_id=user_id)
    if not db_user:
        # Depending on requirements, could raise HTTPException or return None/error schema
        # For now, let's assume user must exist.
        raise ValueError(f"User with id {user_id} not found.") # Or handle as per project's error strategy

    # Fetch current onboarding data or initialize if none exists
    current_onboarding_data_dict: Dict[str, Any] = {}
    if db_user.onboarding_data:
        try:
            current_onboarding_data_dict = json.loads(db_user.onboarding_data)
        except (json.JSONDecodeError, TypeError):
            current_onboarding_data_dict = {} # Start fresh if corrupted

    # Convert Pydantic update model to dict, excluding unset fields for partial update
    update_data_dict = data_update.dict(exclude_unset=True)

    # Merge logic:
    # For nested dicts like 'user_preferences', 'goals', 'feature_exploration', merge them.
    # For 'completed_steps', replace if provided, otherwise keep current.
    # For 'current_step_id' and 'is_completed', replace if provided.

    merged_data_dict = current_onboarding_data_dict.copy()

    if "current_step_id" in update_data_dict:
        merged_data_dict["current_step_id"] = update_data_dict["current_step_id"]
    
    if "completed_steps" in update_data_dict: # Assumes full list of steps is sent
        merged_data_dict["completed_steps"] = [step.dict() for step in data_update.completed_steps] if data_update.completed_steps else []

    if "user_preferences" in update_data_dict and update_data_dict["user_preferences"] is not None:
        if "user_preferences" not in merged_data_dict or not isinstance(merged_data_dict.get("user_preferences"), dict):
            merged_data_dict["user_preferences"] = {}
        merged_data_dict["user_preferences"].update(update_data_dict["user_preferences"])
    
    if "goals" in update_data_dict and update_data_dict["goals"] is not None:
        if "goals" not in merged_data_dict or not isinstance(merged_data_dict.get("goals"), dict):
            merged_data_dict["goals"] = {}
        merged_data_dict["goals"].update(update_data_dict["goals"])

    if "feature_exploration" in update_data_dict and update_data_dict["feature_exploration"] is not None:
        if "feature_exploration" not in merged_data_dict or not isinstance(merged_data_dict.get("feature_exploration"), dict):
            merged_data_dict["feature_exploration"] = {}
        merged_data_dict["feature_exploration"].update(update_data_dict["feature_exploration"])

    if "is_completed" in update_data_dict:
        merged_data_dict["is_completed"] = update_data_dict["is_completed"]
        db_user.onboarding_completed = update_data_dict["is_completed"] # Update the direct User model field

    # Ensure the merged data conforms to OnboardingDataBase schema before saving
    # This also provides default values for fields not present in merged_data_dict
    final_onboarding_data = schemas.OnboardingDataBase(**merged_data_dict)
    db_user.onboarding_data = final_onboarding_data.json() # Pydantic .json() serializes to JSON string

    db.add(db_user) # Add user to session if it wasn't already, or to mark as dirty
    db.commit()
    db.refresh(db_user)

    return schemas.OnboardingDataResponse(user_id=user_id, **final_onboarding_data.dict())
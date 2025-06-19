import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..models.user import User as UserModel
from ..schemas.user_schemas import User as UserSchema, UserUpdate, ContactInfoSchema # Ensure UserUpdate has all fields
from ..schemas.project_schemas import ProjectSchema, ProjectCreate
from ..schemas.experience_schemas import ExperienceSchema, ExperienceCreate
from ..schemas.education_schemas import EducationSchema, EducationCreate
from ..auth.auth_dependencies import get_current_active_user
from ..database import get_db # Assuming get_db is in database.py

router = APIRouter(
    prefix="/api/users",
    tags=["User Profile"],
)

@router.put("/me/profile", response_model=UserSchema)
async def update_current_user_profile(
    profile_data: UserUpdate, # UserUpdate includes detailed_bio, contact_info, skills, projects, experience, education
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 1. Prepare data for user_crud.update_user (direct User fields)
    user_update_fields = {}
    if profile_data.detailed_bio is not None:
        user_update_fields["detailed_bio"] = profile_data.detailed_bio
    if profile_data.contact_info is not None: # contact_info is ContactInfoSchema
        user_update_fields["contact_info"] = profile_data.contact_info.dict() # Pass as dict
    if profile_data.skills is not None: # skills is List[str]
        user_update_fields["skills"] = profile_data.skills

    # Only call update_user if there are fields to update for the User model itself
    if user_update_fields:
        # Create a UserUpdate instance for the direct fields
        # Note: UserUpdate schema might need all its fields to be Optional for this to work cleanly
        # or we construct a new dict that matches UserUpdate fields.
        # The current UserUpdate has all fields optional, so this is fine.
        direct_user_update_schema = UserUpdate(**user_update_fields)
        updated_user_model = crud.user_crud.update_user(
            db=db, user_id=current_user.id, user=direct_user_update_schema
        )
        if not updated_user_model:
            raise HTTPException(status_code=404, detail="User not found during update")
        # current_user might be stale after this, refresh it later or use updated_user_model

    # 2. Handle Projects (Replace-all strategy)
    if profile_data.projects is not None:
        # Delete existing projects
        for p in current_user.projects:
            crud.project_crud.delete_project(db=db, project_id=p.id)
        db.commit() # Commit deletions before adding new ones
        # Create new projects
        for proj_data in profile_data.projects:
            crud.project_crud.create_user_project(db=db, project=proj_data, user_id=current_user.id)

    # 3. Handle Experience (Replace-all strategy)
    if profile_data.experience is not None: # Field name in UserUpdate is 'experience'
        # Delete existing experience entries
        for exp in current_user.experience_entries: # Model relationship name
            crud.experience_crud.delete_experience(db=db, experience_id=exp.id)
        db.commit()
        # Create new experience entries
        for exp_data in profile_data.experience:
            crud.experience_crud.create_user_experience(db=db, experience=exp_data, user_id=current_user.id)

    # 4. Handle Education (Replace-all strategy)
    if profile_data.education is not None: # Field name in UserUpdate is 'education'
        # Delete existing education entries
        for edu in current_user.education_entries: # Model relationship name
            crud.education_crud.delete_education_entry(db=db, education_id=edu.id)
        db.commit()
        # Create new education entries
        for edu_data in profile_data.education:
            crud.education_crud.create_user_education(db=db, education_entry=edu_data, user_id=current_user.id)

    db.refresh(current_user) # Refresh to get all latest changes including relationships
    return current_user


@router.get("/{user_id}/profile", response_model=UserSchema)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = crud.user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # The UserSchema with its validators should handle parsing of JSON string fields
    # from the User model (contact_info, skills) and related models (project.technologiesUsed).
    return user

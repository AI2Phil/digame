import json
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.project import Project
from ..schemas.project_schemas import ProjectCreate, ProjectUpdate

def get_project(db: Session, project_id: int) -> Optional[Project]:
    """Get a project by ID."""
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects for a specific user with pagination."""
    return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()

def create_user_project(db: Session, project: ProjectCreate, user_id: int) -> Project:
    """Create a new project for a user."""
    project_data = project.dict()
    # Remove technologiesUsed from dict to handle it separately
    technologies_list = project_data.pop("technologiesUsed", []) # Default to empty list if not present

    technologies_used_json = json.dumps(technologies_list)

    db_project = Project(
        **project_data,
        technologiesUsed=technologies_used_json,
        user_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_data: ProjectUpdate) -> Optional[Project]:
    """Update an existing project."""
    db_project = get_project(db, project_id)
    if not db_project:
        return None

    update_data = project_data.dict(exclude_unset=True)

    if "technologiesUsed" in update_data and update_data["technologiesUsed"] is not None:
        update_data["technologiesUsed"] = json.dumps(update_data["technologiesUsed"])
    elif "technologiesUsed" in update_data and update_data["technologiesUsed"] is None:
        # If explicitly set to None, store None (or empty list as JSON '[]')
        update_data["technologiesUsed"] = None # Or json.dumps([]) depending on desired DB state for empty

    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int) -> bool:
    """Delete a project by ID."""
    db_project = get_project(db, project_id)
    if not db_project:
        return False

    db.delete(db_project)
    db.commit()
    return True

from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.education import Education
from ..schemas.education_schemas import EducationCreate, EducationUpdate

def get_education_entry(db: Session, education_id: int) -> Optional[Education]:
    """Get an education entry by ID."""
    return db.query(Education).filter(Education.id == education_id).first()

def get_education_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Education]:
    """Get all education entries for a specific user with pagination."""
    return db.query(Education).filter(Education.user_id == user_id).offset(skip).limit(limit).all()

def create_user_education(db: Session, education_entry: EducationCreate, user_id: int) -> Education:
    """Create a new education entry for a user."""
    db_education = Education(
        **education_entry.dict(),
        user_id=user_id
    )
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

def update_education_entry(db: Session, education_id: int, education_data: EducationUpdate) -> Optional[Education]:
    """Update an existing education entry."""
    db_education_entry = get_education_entry(db, education_id)
    if not db_education_entry:
        return None

    update_data = education_data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_education_entry, key, value)

    db.commit()
    db.refresh(db_education_entry)
    return db_education_entry

def delete_education_entry(db: Session, education_id: int) -> bool:
    """Delete an education entry by ID."""
    db_education_entry = get_education_entry(db, education_id)
    if not db_education_entry:
        return False

    db.delete(db_education_entry)
    db.commit()
    return True

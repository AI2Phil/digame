from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.experience import Experience
from ..schemas.experience_schemas import ExperienceCreate, ExperienceUpdate

def get_experience(db: Session, experience_id: int) -> Optional[Experience]:
    """Get an experience entry by ID."""
    return db.query(Experience).filter(Experience.id == experience_id).first()

def get_experience_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Experience]:
    """Get all experience entries for a specific user with pagination."""
    return db.query(Experience).filter(Experience.user_id == user_id).offset(skip).limit(limit).all()

def create_user_experience(db: Session, experience: ExperienceCreate, user_id: int) -> Experience:
    """Create a new experience entry for a user."""
    db_experience = Experience(
        **experience.dict(),
        user_id=user_id
    )
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def update_experience(db: Session, experience_id: int, experience_data: ExperienceUpdate) -> Optional[Experience]:
    """Update an existing experience entry."""
    db_experience = get_experience(db, experience_id)
    if not db_experience:
        return None

    update_data = experience_data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_experience, key, value)

    db.commit()
    db.refresh(db_experience)
    return db_experience

def delete_experience(db: Session, experience_id: int) -> bool:
    """Delete an experience entry by ID."""
    db_experience = get_experience(db, experience_id)
    if not db_experience:
        return False

    db.delete(db_experience)
    db.commit()
    return True

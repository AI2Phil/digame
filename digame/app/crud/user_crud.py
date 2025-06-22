from sqlalchemy.orm import Session
from typing import List, Optional, Any # Added Any
from passlib.context import CryptContext
from datetime import datetime # Added datetime

from ..models.user import User, UserProfile # Added UserProfile model
from ..schemas.user_schemas import UserCreate, UserUpdate
# Import new UserProfile schemas
from ..schemas.user_profile_schemas import UserProfileCreate, UserProfileUpdate, UserProfileResponse

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- User CRUD ---

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username"""
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get a list of users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user and an associated empty UserProfile."""
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active if user.is_active is not None else True, # Ensure default
        onboarding_completed=user.onboarding_completed if hasattr(user, 'onboarding_completed') else False,
        onboarding_data=user.onboarding_data if hasattr(user, 'onboarding_data') else None
    )
    db.add(db_user)
    db.flush()  # Flush to get db_user.id for the profile

    # Automatically create an empty UserProfile
    db_user_profile = UserProfile(user_id=db_user.id)
    db.add(db_user_profile)

    db.commit()
    db.refresh(db_user)
    # db.refresh(db_user_profile) # Profile is accessible via db_user.profile
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]: # Renamed user to user_update
    """Update a user"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True) # Use model_dump for Pydantic v2
    
    if "password" in update_data and update_data["password"]: # Check if password is not None or empty
        update_data["hashed_password"] = pwd_context.hash(update_data.pop("password"))
    elif "password" in update_data: # If password is None or empty, remove from update_data
        del update_data["password"]

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db_user.updated_at = datetime.utcnow() # Manually set updated_at for User model
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """Delete a user. Associated UserProfile will be deleted by cascade."""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user by username and password"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# --- UserProfile CRUD ---

def create_user_profile(db: Session, user_id: int, profile: UserProfileCreate) -> UserProfile:
    """
    Create a new UserProfile for a user.
    Assumes UserProfile is typically created automatically with User.
    This function can be used if it was deleted or needs to be created explicitly.
    """
    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if existing_profile:
        # Or raise an error, or update existing. For now, let's return existing or update.
        # For this function, let's assume it should error if one exists,
        # as profile is auto-created with user.
        raise ValueError(f"UserProfile already exists for user_id {user_id}")

    db_profile = UserProfile(
        **profile.model_dump(exclude_unset=True), # Use model_dump for Pydantic v2
        user_id=user_id,
        updated_at=datetime.utcnow() # Set initial updated_at
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_user_profile(db: Session, user_id: int) -> Optional[UserProfile]:
    """
    Retrieves the UserProfile for a given user_id.
    """
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def update_user_profile(db: Session, user_id: int, profile_update: UserProfileUpdate) -> Optional[UserProfile]:
    """
    Updates an existing UserProfile.
    """
    db_profile = get_user_profile(db, user_id)
    if not db_profile:
        return None # Or raise HTTPException(404) in router layer

    update_data = profile_update.model_dump(exclude_unset=True) # Use model_dump for Pydantic v2

    for key, value in update_data.items():
        setattr(db_profile, key, value)

    db_profile.updated_at = datetime.utcnow() # Manually set updated_at
    db.add(db_profile) # Add to session before commit if it was detached or for clarity
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_user_profile(db: Session, user_id: int) -> bool:
    """
    Deletes a UserProfile for a given user_id.
    The User record itself is not deleted.
    """
    db_profile = get_user_profile(db, user_id)
    if not db_profile:
        return False

    db.delete(db_profile)
    db.commit()
    return True
```

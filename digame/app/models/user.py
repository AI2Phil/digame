from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON # Added ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime # Changed to just datetime for consistency, as utcnow is method of datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer(), primary_key=True, index=True)
    username = Column(String(), unique=True, index=True, nullable=False)
    email = Column(String(), unique=True, index=True, nullable=False)
    hashed_password = Column(String(), nullable=False)
    
    first_name = Column(String(), nullable=True)
    last_name = Column(String(), nullable=True)
    
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    is_active = Column(Boolean(), default=True) # Changed Integer to Boolean for clarity
    
    onboarding_completed = Column(Boolean(), default=False)
    onboarding_data = Column(Text(), nullable=True)

    roles = relationship(
        "Role",
        secondary="user_roles", 
        back_populates="users"
    )
    process_notes = relationship(
        "ProcessNote",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    activities = relationship(
        "Activity",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    anomalies = relationship(
        "DetectedAnomaly",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    tasks = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    behavioral_models = relationship(
        "BehavioralModel",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    settings = relationship(
        "UserSetting",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # New relationship to UserProfile (One-to-One)
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class UserProfile(Base):
    __tablename__ = "user_profiles" # Changed table name to plural

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    skills = Column(JSON, nullable=True)
    learning_goals = Column(Text, nullable=True) # Using Text for flexibility
    interests = Column(JSON, nullable=True)
    mentorship_preferences = Column(JSON, nullable=True)

    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User (One-to-One)
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id})>"

# Note: Models for Role, ProcessNote, Activity, DetectedAnomaly, Task, BehavioralModel, UserSetting
# are assumed to be defined elsewhere and imported if needed for full application run,
# or defined with necessary back_populates attributes.
# For this file's validity, only their string names are needed in relationships.
# The user_roles table for the User-Role many-to-many relationship is also assumed to be defined elsewhere.
```

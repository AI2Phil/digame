from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float # Added ForeignKey, JSON, Float
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime # Changed to just datetime for consistency, as utcnow is method of datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(Integer(), primary_key=True, index=True)
    username = Column(String(), unique=True, index=True, nullable=False)
    email = Column(String(), unique=True, index=True, nullable=False)
    hashed_password = Column(String(), nullable=False)
    
    first_name = Column(String(), nullable=True)
    last_name = Column(String(), nullable=True)
    
    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    is_active = Column(Boolean(), default=True) # Changed Integer to Boolean for clarity
    
    # Guest user support
    is_guest = Column(Boolean(), default=False)
    guest_expires_at = Column(DateTime(), nullable=True)
    
    # Platform Owner Identification
    is_platform_owner = Column(Boolean(), default=False, nullable=False)
    platform_owner_level = Column(Integer(), default=0)  # 0=regular, 1=admin, 2=super_admin, 3=platform_owner
    
    # ACO Tier Information
    subscription_tier = Column(String(), default="free")  # free, individual_pro, team, enterprise
    subscription_status = Column(String(), default="active")  # active, suspended, cancelled
    subscription_expires = Column(DateTime(), nullable=True)
    is_founding_member = Column(Boolean(), default=False)
    founding_member_enrolled_at = Column(DateTime(), nullable=True)
    founding_member_discount_percent = Column(Integer(), nullable=True)
    founding_member_monthly_price = Column(Float(), nullable=True)
    subscription_updated_at = Column(DateTime(), nullable=True)
    
    # Enhanced Security
    last_login = Column(DateTime(), nullable=True)
    failed_login_attempts = Column(Integer(), default=0)
    account_locked_until = Column(DateTime(), nullable=True)
    password_changed_at = Column(DateTime(), default=datetime.utcnow)
    
    # Email verification
    email_verified = Column(Boolean(), default=False)
    email_verification_token = Column(String(), nullable=True)
    email_verification_sent_at = Column(DateTime(), nullable=True)
    
    # Account upgrade tracking
    upgraded_from_guest = Column(Boolean(), default=False)
    upgrade_date = Column(DateTime(), nullable=True)
    
    # Audit Fields
    created_by = Column(Integer(), ForeignKey("users.id"), nullable=True)
    
    onboarding_completed = Column(Boolean(), default=False)
    onboarding_data = Column(Text(), nullable=True)
    onboarding_step = Column(Integer(), default=0)  # Track current onboarding step

    # New profile fields
    detailed_bio = Column(Text(), nullable=True)
    contact_info = Column(Text(), nullable=True)  # JSON string for linkedin, website, professionalEmail
    skills = Column(Text(), nullable=True)  # JSON string for list[str]
    kudos_count = Column(Integer(), default=0)

    # Enhanced relationships for tenant-aware RBAC
    user_roles = relationship("UserRole", foreign_keys="UserRole.user_id", back_populates="user")
    
    def get_roles(self):
        """Get roles through user_roles relationship - safer for serialization"""
        return [ur.role for ur in self.user_roles if ur.role]
    
    @property
    def roles(self):
        """Backward compatibility property to access roles through user_roles"""
        return self.get_roles()
    
    # Tenant relationship - specify foreign_keys to resolve ambiguity
    tenant = relationship("Tenant", foreign_keys=[tenant_id], back_populates="users")
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # process_notes = relationship(
    #     "ProcessNote",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
    # activities = relationship(
    #     "Activity",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
    # anomalies = relationship(
    #     "DetectedAnomaly",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
    tasks = relationship(
        "Task",
        back_populates="user", # This 'user' is the owner/creator of the task
        cascade="all, delete-orphan",
        foreign_keys="[Task.user_id]" # Specify which FK this relationship uses
    )
    assigned_tasks = relationship(
        "Task",
        back_populates="assigned_resource", # This 'assigned_resource' is who the task is assigned to
        cascade="all, delete-orphan",
        foreign_keys="[Task.assigned_resource_id]" # Specify which FK this relationship uses
    )
    # behavioral_models = relationship(
    #     "BehavioralModel",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
    # Relationships to new models
    projects = relationship(
        "Project",
        back_populates="user",
        foreign_keys="Project.user_id",
        cascade="all, delete-orphan"
    )
    experience_entries = relationship(
        "Experience",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    education_entries = relationship(
        "Education",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationship to UserSetting model
    # # This allows accessing the user's settings.
    # settings = relationship(
    #     "UserSetting",
    #     back_populates="user",
    #     uselist=False,
    #     cascade="all, delete-orphan"
    # )

    # New relationship to UserProfile (One-to-One)
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Relationship to GuestOnboardingProgress (One-to-One)
    # Temporarily commented out due to import issues
    # onboarding_progress = relationship(
    #     "GuestOnboardingProgress",
    #     back_populates="user",
    #     uselist=False,
    #     cascade="all, delete-orphan"
    # )
    
    # Relationship to DigitalTwinProfile (One-to-One)
    # Temporarily commented out due to import issues
    # digital_twin_profile = relationship(
    #     "DigitalTwinProfile",
    #     back_populates="user",
    #     uselist=False,
    #     cascade="all, delete-orphan"
    # )

    # Digital Twin relationship (One-to-Many)
    digital_twins = relationship(
        "DigitalTwin",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships for messages
    # sent_messages = relationship(
    #     "Message",
    #     foreign_keys="Message.sender_id",
    #     back_populates="sender",
    #     cascade="all, delete-orphan"
    # )
    # received_messages = relationship(
    #     "Message",
    #     foreign_keys="Message.receiver_id",
    #     back_populates="receiver",
    #     cascade="all, delete-orphan"
    # )

    # Relationships for Team Collaboration
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    # If User can create teams (e.g. created_by_user_id in Team model)
    created_teams = relationship("Team", back_populates="creator", cascade="all, delete-orphan")

    # ML Model relationships
    ml_models = relationship("MLModel", back_populates="creator", cascade="all, delete-orphan")
    training_jobs = relationship("TrainingJob", back_populates="creator", cascade="all, delete-orphan")
    predictions = relationship("ModelPrediction", back_populates="creator", cascade="all, delete-orphan")
    model_evaluations = relationship("ModelEvaluation", back_populates="evaluator", cascade="all, delete-orphan")
    model_deployments = relationship("ModelDeployment", back_populates="deployer", cascade="all, delete-orphan")
    datasets = relationship("DatasetMetadata", back_populates="creator", cascade="all, delete-orphan")
    experiment_runs = relationship("ExperimentRun", back_populates="creator", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class UserProfile(Base):
    __tablename__ = "user_profiles" # Changed table name to plural

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), unique=True, nullable=False)

    skills = Column(JSON, nullable=True)
    learning_goals = Column(Text(), nullable=True) # Using Text for flexibility
    interests = Column(JSON, nullable=True)
    mentorship_preferences = Column(JSON, nullable=True)

    bio = Column(Text(), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)

    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User (One-to-One)
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id})>"

# Note: Models for Role, ProcessNote, Activity, DetectedAnomaly, Task, BehavioralModel, UserSetting
# are assumed to be defined elsewhere and imported if needed for full application run,
# or defined with necessary back_populates attributes.
# For this file's validity, only their string names are needed in relationships.
# The user_roles table for the User-Role many-to-many relationship is also assumed to be defined elsewhere.

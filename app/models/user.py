from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float, Index # Added ForeignKey, JSON, Float, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime # Changed to just datetime for consistency, as utcnow is method of datetime
from app.database import Base

# Import Tenant directly to avoid string resolution issues
from app.models.tenant import Tenant
from app.models.imports import ProcessNote, Task, UserRoleAssignment

# Remove circular import - relationships will be resolved by SQLAlchemy registry

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index('ix_users_username', 'username', unique=True),
        Index('ix_users_email', 'email', unique=True),
        Index('ix_users_tenant_id', 'tenant_id'),
        Index('ix_users_platform_owner', 'is_platform_owner'),
        Index('ix_users_subscription_tier', 'subscription_tier'),
        Index('ix_users_active_tenant', 'is_active', 'tenant_id'),
        {'extend_existing': True}
    )

    id = Column(Integer(), primary_key=True)
    username = Column(String(), unique=True, nullable=False)
    email = Column(String(), unique=True, nullable=False)
    hashed_password = Column(String(), nullable=False)
    
    first_name = Column(String(), nullable=True)
    last_name = Column(String(), nullable=True)
    
    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    
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
    skills_json = Column(Text(), nullable=True)  # JSON string for list[str] - renamed to avoid conflict with skills relationship
    kudos_count = Column(Integer(), default=0)

    # Enhanced relationships for tenant-aware RBAC - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # user_roles = relationship("UserRoleAssignment", foreign_keys="UserRoleAssignment.user_id", cascade="all, delete-orphan", overlaps="user")
    
    def get_roles(self, tenant_id=None):
        """Get roles through user_roles relationship - temporarily disabled due to registry conflicts"""
        # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
        # if tenant_id:
        #     return [ur.role for ur in self.user_roles if ur.role and ur.tenant_id == tenant_id]
        # return [ur.role for ur in self.user_roles if ur.role]
        return []  # Temporary fallback to prevent registry conflicts
    
    @property
    def roles(self):
        """Backward compatibility property to access roles through user_roles"""
        return self.get_roles()
    
    # Tenant relationship - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # tenant = relationship(Tenant, foreign_keys=[tenant_id], overlaps="creator,manager")
    # Relationship to ProcessNote model - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # process_notes = relationship(
    #     lambda: ProcessNote,
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
    # Task relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # tasks = relationship(
    #     lambda: Task,
    #     cascade="all, delete-orphan",
    #     foreign_keys="[Task.user_id]" # Specify which FK this relationship uses
    # )
    # assigned_tasks = relationship(
    #     lambda: Task,
    #     cascade="all, delete-orphan",
    #     foreign_keys="[Task.assigned_resource_id]" # Specify which FK this relationship uses
    # )
    # behavioral_models = relationship(
    #     "BehavioralModel",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
    # Project relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # projects = relationship(
    #     "Project",
    #     foreign_keys="Project.user_id",
    #     cascade="all, delete-orphan"
    # )
    # Experience relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # experience_entries = relationship(
    #     "Experience",
    #     foreign_keys="Experience.user_id",
    #     cascade="all, delete-orphan"
    # )
    # Education relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # education_entries = relationship(
    #     "Education",
    #     foreign_keys="Education.user_id",
    #     cascade="all, delete-orphan"
    # )

    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationship to UserSetting model
    # # This allows accessing the user's settings.
    # settings = relationship(
    #     "UserSetting",
    #     back_populates="user",
    #     uselist=False,
    #     cascade="all, delete-orphan"
    # )

    # UserProfile relationship - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # profile = relationship(
    #     "app.models.user_profile.UserProfile",
    #     foreign_keys="app.models.user_profile.UserProfile.user_id",
    #     uselist=False,
    #     cascade="all, delete-orphan"
    # )

    # Relationship to UserOnboardingProgress (One-to-One) - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # onboarding_progress = relationship(
    #     "UserOnboardingProgress",
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

    # Digital Twin relationship (One-to-Many) - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # digital_twins = relationship(
    #     "DigitalTwin",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )

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

    # Relationships for Team Collaboration - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    # If User can create teams (e.g. created_by_user_id in Team model) - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # created_teams = relationship("Team", back_populates="creator", cascade="all, delete-orphan")

    # ML Model relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # ml_models = relationship("MLModel", back_populates="creator", cascade="all, delete-orphan")
    # training_jobs = relationship("TrainingJob", back_populates="creator", cascade="all, delete-orphan")
    # predictions = relationship("ModelPrediction", back_populates="creator", cascade="all, delete-orphan")
    # model_evaluations = relationship("ModelEvaluation", back_populates="evaluator", cascade="all, delete-orphan")
    # model_deployments = relationship("ModelDeployment", back_populates="deployer", cascade="all, delete-orphan")
    # datasets = relationship("DatasetMetadata", back_populates="creator", cascade="all, delete-orphan")
    # experiment_runs = relationship("ExperimentRun", back_populates="creator", cascade="all, delete-orphan")

    # Social Networking relationships - temporarily disabled entirely due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # connections_initiated = relationship("UserConnection", foreign_keys="UserConnection.user_id", cascade="all, delete-orphan")
    # connections_received = relationship("UserConnection", foreign_keys="UserConnection.connected_user_id", cascade="all, delete-orphan")
    # peer_matches_initiated = relationship("PeerMatch", foreign_keys="PeerMatch.user_id", cascade="all, delete-orphan")
    # peer_matches_received = relationship("PeerMatch", foreign_keys="PeerMatch.matched_user_id", cascade="all, delete-orphan")
    # social_metrics = relationship("SocialMetrics", uselist=False, cascade="all, delete-orphan")
    # skills = relationship("UserSkill", cascade="all, delete-orphan")

    # Learning & Development relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # course_enrollments = relationship("CourseEnrollment", back_populates="user", cascade="all, delete-orphan")
    # learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    # learning_recommendations = relationship("LearningRecommendation", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


# Note: Models for Role, ProcessNote, Activity, DetectedAnomaly, Task, BehavioralModel, UserSetting
# are assumed to be defined elsewhere and imported if needed for full application run,
# or defined with necessary back_populates attributes.
# For this file's validity, only their string names are needed in relationships.
# The user_roles table for the User-Role many-to-many relationship is also assumed to be defined elsewhere.

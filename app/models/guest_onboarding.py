"""
Guest User Onboarding Models for Digital Twin Setup
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class GuestOnboardingProgress(Base):
    """Track guest user onboarding progress through digital twin setup"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "guest_onboarding_progress"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Onboarding steps tracking
    current_step = Column(Integer(), default=1)
    total_steps = Column(Integer(), default=6)
    completed_steps = Column(JSON, default=list)  # List of completed step numbers
    
    # Step completion tracking
    profile_setup_completed = Column(Boolean(), default=False)
    skills_assessment_completed = Column(Boolean(), default=False)
    personality_profile_completed = Column(Boolean(), default=False)
    work_style_completed = Column(Boolean(), default=False)
    goals_setup_completed = Column(Boolean(), default=False)
    twin_preview_completed = Column(Boolean(), default=False)
    
    # Progress metrics
    completion_percentage = Column(Float(), default=0.0)
    estimated_time_remaining = Column(Integer(), default=15)  # minutes
    
    # Timestamps
    started_at = Column(DateTime(), default=datetime.utcnow)
    last_activity_at = Column(DateTime(), default=datetime.utcnow)
    completed_at = Column(DateTime(), nullable=True)
    
    # User preferences during onboarding
    preferred_pace = Column(String(50), default="normal")  # slow, normal, fast
    skip_optional_steps = Column(Boolean(), default=False)
    
    # Relationship back to User
    # Temporarily commented out due to circular import issues
    # user = relationship("app.models.user.User", back_populates="onboarding_progress")

    def __repr__(self):
        return f"<GuestOnboardingProgress(user_id={self.user_id}, step={self.current_step}/{self.total_steps})>"


class DigitalTwinProfile(Base):
    """Store digital twin profile data built during onboarding"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "digital_twin_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic profile information
    professional_title = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    experience_level = Column(String(50), nullable=True)  # junior, mid, senior, executive
    
    # Skills and competencies
    technical_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    skill_confidence_scores = Column(JSON, default=dict)  # skill -> confidence (1-10)
    
    # Personality and work style
    personality_type = Column(String(50), nullable=True)  # MBTI, Big Five, etc.
    work_style_preferences = Column(JSON, default=dict)
    communication_style = Column(String(50), nullable=True)
    collaboration_preference = Column(String(50), nullable=True)
    
    # Goals and aspirations
    short_term_goals = Column(JSON, default=list)
    long_term_goals = Column(JSON, default=list)
    learning_interests = Column(JSON, default=list)
    career_aspirations = Column(Text(), nullable=True)
    
    # Twin accuracy and completeness
    profile_completeness_score = Column(Float(), default=0.0)
    twin_accuracy_score = Column(Float(), default=0.0)
    last_updated = Column(DateTime(), default=datetime.utcnow)
    
    # AI-generated insights
    ai_generated_summary = Column(Text(), nullable=True)
    recommended_improvements = Column(JSON, default=list)
    
    # Relationship back to User
    # Temporarily commented out due to circular import issues
    # user = relationship("app.models.user.User", back_populates="digital_twin_profile")

    def __repr__(self):
        return f"<DigitalTwinProfile(user_id={self.user_id}, completeness={self.profile_completeness_score}%)>"


class EmailVerification(Base):
    """Track email verification for guest users"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "email_verifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False)
    email = Column(String(), nullable=False)
    
    verification_token = Column(String(), unique=True, nullable=False)
    token_expires_at = Column(DateTime(), nullable=False)
    
    # Verification status
    is_verified = Column(Boolean(), default=False)
    verified_at = Column(DateTime(), nullable=True)
    verification_attempts = Column(Integer(), default=0)
    
    # Email sending tracking
    sent_at = Column(DateTime(), default=datetime.utcnow)
    resent_count = Column(Integer(), default=0)
    last_resent_at = Column(DateTime(), nullable=True)
    
    # Relationship back to User
    user = relationship("app.models.user.User")

    def __repr__(self):
        return f"<EmailVerification(user_id={self.user_id}, verified={self.is_verified})>"
"""
Database models for onboarding persistence and analytics
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from typing import Optional, Dict, Any


class UserOnboardingProgress(Base):
    """
    Persistent storage for user onboarding progress and preferences
    """
    __tablename__ = "user_onboarding_progress"

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Onboarding status
    current_step_id = Column(String(100), nullable=True, default="welcome")
    completed_all = Column(Boolean(), default=False)
    completion_percentage = Column(Float(), default=0.0)
    
    # Step completion tracking
    completed_steps = Column(JSON, default=[])  # List of completed step IDs
    step_data = Column(JSON, default={})  # Data collected at each step
    
    # User preferences from onboarding
    preferences = Column(JSON, default={})  # User preferences collected during onboarding
    
    # Customization settings
    onboarding_customizations = Column(JSON, default={})  # Custom onboarding flow settings
    
    # Timestamps
    started_at = Column(DateTime(), default=datetime.utcnow)
    completed_at = Column(DateTime(), nullable=True)
    last_updated = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to User
    user = relationship("User", back_populates="onboarding_progress")

    def __repr__(self):
        return f"<UserOnboardingProgress(user_id={self.user_id}, completed={self.completed_all})>"

    @property
    def is_completed(self):
        """Check if onboarding is completed"""
        return self.completed_all and self.completed_at is not None

    @property
    def duration_minutes(self):
        """Calculate onboarding duration in minutes"""
        if not self.completed_at or not self.started_at:
            return None
        return (self.completed_at - self.started_at).total_seconds() / 60

    def mark_step_completed(self, step_id: str, step_data: Optional[Dict[str, Any]] = None):
        """Mark a step as completed and update data"""
        # Note: These methods would be used in service layer to update the database record
        # The actual database updates would be handled by SQLAlchemy session
        pass

    def update_preferences(self, preferences: Dict[str, Any]):
        """Update user preferences"""
        # Note: This method would be used in service layer to update the database record
        # The actual database updates would be handled by SQLAlchemy session
        pass


class OnboardingAnalytics(Base):
    """
    Analytics and metrics for onboarding performance
    """
    __tablename__ = "onboarding_analytics"

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    
    # Step-specific analytics
    step_id = Column(String(100), nullable=False, index=True)
    step_name = Column(String(255), nullable=False)
    
    # Timing metrics
    step_started_at = Column(DateTime(), default=datetime.utcnow)
    step_completed_at = Column(DateTime(), nullable=True)
    time_spent_seconds = Column(Integer(), nullable=True)
    
    # Interaction metrics
    clicks_count = Column(Integer(), default=0)
    form_submissions = Column(Integer(), default=0)
    help_requests = Column(Integer(), default=0)
    skip_actions = Column(Integer(), default=0)
    
    # Completion metrics
    completed_successfully = Column(Boolean(), default=False)
    completion_method = Column(String(50), nullable=True)  # 'completed', 'skipped', 'abandoned'
    
    # User behavior data
    interaction_data = Column(JSON, default={})  # Detailed interaction tracking
    errors_encountered = Column(JSON, default=[])  # Errors during this step
    
    # Device and context
    device_type = Column(String(50), nullable=True)  # 'desktop', 'mobile', 'tablet'
    browser_info = Column(String(255), nullable=True)
    screen_resolution = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(), default=datetime.utcnow)
    
    # Relationship to User
    user = relationship("User")

    def __repr__(self):
        return f"<OnboardingAnalytics(user_id={self.user_id}, step='{self.step_id}')>"

    @property
    def completion_rate(self):
        """Calculate step completion rate"""
        return 1.0 if self.completed_successfully else 0.0

    def mark_completed(self, method: str = 'completed'):
        """Mark step as completed"""
        # Note: This method would be used in service layer to update the database record
        # The actual database updates would be handled by SQLAlchemy session
        pass


class OnboardingMetrics(Base):
    """
    Aggregated onboarding metrics and KPIs
    """
    __tablename__ = "onboarding_metrics"

    id = Column(Integer(), primary_key=True, index=True)
    
    # Time period for metrics
    period_start = Column(DateTime(), nullable=False, index=True)
    period_end = Column(DateTime(), nullable=False, index=True)
    period_type = Column(String(50), nullable=False)  # 'daily', 'weekly', 'monthly'
    
    # Completion metrics
    total_users_started = Column(Integer(), default=0)
    total_users_completed = Column(Integer(), default=0)
    completion_rate = Column(Float(), default=0.0)
    
    # Timing metrics
    average_completion_time_minutes = Column(Float(), nullable=True)
    median_completion_time_minutes = Column(Float(), nullable=True)
    fastest_completion_minutes = Column(Float(), nullable=True)
    slowest_completion_minutes = Column(Float(), nullable=True)
    
    # Step-specific metrics
    step_completion_rates = Column(JSON, default={})  # Completion rate per step
    step_average_times = Column(JSON, default={})  # Average time per step
    step_abandonment_rates = Column(JSON, default={})  # Abandonment rate per step
    
    # User behavior metrics
    average_clicks_per_user = Column(Float(), default=0.0)
    average_help_requests = Column(Float(), default=0.0)
    skip_rate = Column(Float(), default=0.0)
    
    # Device and platform metrics
    device_breakdown = Column(JSON, default={})  # Usage by device type
    browser_breakdown = Column(JSON, default={})  # Usage by browser
    
    # Quality metrics
    error_rate = Column(Float(), default=0.0)
    user_satisfaction_score = Column(Float(), nullable=True)
    
    # Metadata
    calculated_at = Column(DateTime(), default=datetime.utcnow)
    last_updated = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<OnboardingMetrics(period='{self.period_type}', completion_rate={self.completion_rate})>"

    @property
    def abandonment_rate(self):
        """Calculate overall abandonment rate"""
        if self.total_users_started == 0:
            return 0.0
        return 1.0 - self.completion_rate

    @property
    def efficiency_score(self):
        """Calculate onboarding efficiency score (0-100)"""
        # Combine completion rate, speed, and user satisfaction
        completion_weight = 0.5
        speed_weight = 0.3
        satisfaction_weight = 0.2
        
        completion_score = self.completion_rate * 100
        
        # Speed score (inverse of time - faster is better)
        speed_score = 0.0
        if self.average_completion_time_minutes:
            # Assume 10 minutes is optimal, scale accordingly
            optimal_time = 10.0
            if self.average_completion_time_minutes <= optimal_time:
                speed_score = 100.0
            else:
                penalty = (self.average_completion_time_minutes - optimal_time) * 2.0
                speed_score = 100.0 - penalty if penalty < 100.0 else 0.0
        
        satisfaction_score = (self.user_satisfaction_score or 0) * 20  # Convert 0-5 to 0-100
        
        return (
            completion_score * completion_weight +
            speed_score * speed_weight +
            satisfaction_score * satisfaction_weight
        )


class OnboardingFeedback(Base):
    """
    User feedback and satisfaction data for onboarding
    """
    __tablename__ = "onboarding_feedback"

    id = Column(Integer(), primary_key=True, index=True)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False, index=True)
    
    # Feedback details
    step_id = Column(String(100), nullable=True)  # Specific step or overall
    rating = Column(Integer(), nullable=False)  # 1-5 rating
    feedback_text = Column(Text(), nullable=True)
    
    # Feedback categories
    ease_of_use = Column(Integer(), nullable=True)  # 1-5 rating
    clarity = Column(Integer(), nullable=True)  # 1-5 rating
    usefulness = Column(Integer(), nullable=True)  # 1-5 rating
    
    # Improvement suggestions
    suggested_improvements = Column(Text(), nullable=True)
    would_recommend = Column(Boolean(), nullable=True)
    
    # Context
    feedback_type = Column(String(50), default="completion")  # 'step', 'completion', 'abandonment'
    device_type = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(), default=datetime.utcnow)
    
    # Relationship to User
    user = relationship("User")

    def __repr__(self):
        return f"<OnboardingFeedback(user_id={self.user_id}, rating={self.rating})>"

    @property
    def overall_satisfaction(self):
        """Calculate overall satisfaction score"""
        scores = [score for score in [self.ease_of_use, self.clarity, self.usefulness] if score is not None]
        return sum(scores) / len(scores) if scores else self.rating
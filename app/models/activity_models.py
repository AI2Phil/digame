"""
Activity tracking database models for User Interface & Dashboard Components.
Provides comprehensive activity breakdown and productivity tracking capabilities.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
from app.database import Base

class ActivityCategory(Base):
    """Activity categories for organizing user activities"""
    __tablename__ = "activity_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    icon = Column(String(50))  # Emoji or icon identifier
    color = Column(String(7))  # Hex color code
    is_productive = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    activities = relationship("UserActivity", back_populates="category")
    
    # Indexes
    __table_args__ = (
        Index('idx_activity_categories_name', 'name'),
    )

class UserActivity(Base):
    """Individual user activity records"""
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Reference to user
    category_id = Column(Integer, ForeignKey("activity_categories.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Float, nullable=False)  # Activity duration in minutes
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    productivity_score = Column(Float, default=0.0)  # 0-100 productivity rating
    energy_level = Column(Integer, default=5)  # 1-10 energy level during activity
    focus_level = Column(Integer, default=5)  # 1-10 focus level during activity
    interruptions = Column(Integer, default=0)  # Number of interruptions
    location = Column(String(100))  # Where the activity took place
    device_used = Column(String(100))  # Device or tool used
    tags = Column(Text)  # JSON array of tags
    notes = Column(Text)  # User notes about the activity
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("ActivityCategory", back_populates="activities")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_activities_user_id', 'user_id'),
        Index('idx_user_activities_category_id', 'category_id'),
        Index('idx_user_activities_start_time', 'start_time'),
        Index('idx_user_activities_productivity_score', 'productivity_score'),
        Index('idx_user_activities_user_date', 'user_id', 'start_time'),
    )

class ProductivityMetric(Base):
    """Daily productivity metrics and summaries"""
    __tablename__ = "productivity_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    total_active_hours = Column(Float, default=0.0)
    productive_hours = Column(Float, default=0.0)
    efficiency_score = Column(Float, default=0.0)  # 0-100 efficiency percentage
    focus_score = Column(Float, default=0.0)  # 0-100 focus percentage
    energy_score = Column(Float, default=0.0)  # 0-100 energy percentage
    most_productive_hour = Column(Integer)  # Hour of day (0-23)
    least_productive_hour = Column(Integer)  # Hour of day (0-23)
    peak_productivity_start = Column(String(10))  # Time range start (HH:MM)
    peak_productivity_end = Column(String(10))  # Time range end (HH:MM)
    total_interruptions = Column(Integer, default=0)
    context_switches = Column(Integer, default=0)  # Number of activity switches
    break_time_minutes = Column(Float, default=0.0)
    deep_work_minutes = Column(Float, default=0.0)  # Uninterrupted focused work
    shallow_work_minutes = Column(Float, default=0.0)  # Light/administrative work
    meeting_minutes = Column(Float, default=0.0)
    learning_minutes = Column(Float, default=0.0)
    planning_minutes = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_productivity_metrics_user_id', 'user_id'),
        Index('idx_productivity_metrics_date', 'date'),
        Index('idx_productivity_metrics_user_date', 'user_id', 'date'),
        Index('idx_productivity_metrics_efficiency', 'efficiency_score'),
    )

# Import ActivityPattern from digital_twin to avoid conflicts
from .digital_twin import ActivityPattern

class ActivityGoal(Base):
    """User-defined activity and productivity goals"""
    __tablename__ = "activity_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("activity_categories.id"))
    goal_type = Column(String(50), nullable=False)  # time, efficiency, focus, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String(20))  # hours, percentage, score, etc.
    target_date = Column(DateTime(timezone=True))
    start_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default='active')  # active, completed, paused, cancelled
    priority = Column(String(20), default='medium')  # low, medium, high
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50))  # daily, weekly, monthly
    progress_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("ActivityCategory")
    
    # Indexes
    __table_args__ = (
        Index('idx_activity_goals_user_id', 'user_id'),
        Index('idx_activity_goals_status', 'status'),
        Index('idx_activity_goals_target_date', 'target_date'),
        Index('idx_activity_goals_priority', 'priority'),
    )
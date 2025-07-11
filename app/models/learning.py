"""
Learning & Development Models
Phase 1 implementation for learning features including courses, enrollments, and progress tracking.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey, Text, UniqueConstraint, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.user import Base


class CourseCategory(Base):
    """Course categories for organizing learning content"""
    __tablename__ = "course_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    parent_category_id = Column(Integer, ForeignKey("course_categories.id", ondelete="SET NULL"), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Self-referential relationship for parent/child categories
    parent_category = relationship("CourseCategory", remote_side=[id], back_populates="subcategories")
    subcategories = relationship("CourseCategory", back_populates="parent_category")
    
    # Relationship to courses
    courses = relationship("Course", back_populates="category")


class Course(Base):
    """Courses for learning and development"""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("course_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    difficulty_level = Column(String(20), nullable=False, default="beginner", index=True)  # beginner, intermediate, advanced
    duration_hours = Column(Integer, nullable=True)
    estimated_completion_days = Column(Integer, nullable=True)
    prerequisites = Column(JSON, nullable=True)  # List of prerequisite skills or courses
    learning_objectives = Column(JSON, nullable=True)  # List of learning objectives
    skills_covered = Column(JSON, nullable=True)  # List of skills this course covers
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    max_enrollments = Column(Integer, nullable=True)
    current_enrollments = Column(Integer, nullable=False, default=0)
    rating_average = Column(Numeric(3, 2), nullable=True)
    rating_count = Column(Integer, nullable=False, default=0)
    is_published = Column(Boolean, nullable=False, default=False, index=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    category = relationship("CourseCategory", back_populates="courses")
    instructor = relationship("User", foreign_keys=[instructor_id])
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    recommendations = relationship("LearningRecommendation", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    """User enrollments in courses"""
    __tablename__ = "course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    progress_percentage = Column(Numeric(5, 2), nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="enrolled", index=True)  # enrolled, in_progress, completed, dropped
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_accessed_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Integer, nullable=False, default=0)
    enrolled_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="course_enrollments")
    course = relationship("Course", back_populates="enrollments")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_enrollment'),
    )


class LearningProgress(Base):
    """User progress tracking for skills and competencies"""
    __tablename__ = "learning_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False, index=True)
    current_level = Column(String(20), nullable=False, default="beginner")  # beginner, intermediate, advanced, expert
    target_level = Column(String(20), nullable=True)
    progress_percentage = Column(Numeric(5, 2), nullable=False, default=0.0)
    courses_completed = Column(Integer, nullable=False, default=0)
    total_study_hours = Column(Integer, nullable=False, default=0)
    last_activity_at = Column(DateTime, nullable=True)
    target_completion_date = Column(Date, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="learning_progress")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'skill_name', name='unique_user_skill_progress'),
    )


class LearningRecommendation(Base):
    """AI-powered learning recommendations for users"""
    __tablename__ = "learning_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=True)
    skill_name = Column(String(100), nullable=True)
    recommendation_type = Column(String(50), nullable=False, index=True)  # course, skill, learning_path, mentor
    recommendation_reason = Column(Text, nullable=True)
    confidence_score = Column(Numeric(3, 2), nullable=False)  # 0.0 to 1.0
    priority_score = Column(Integer, nullable=False, default=1)  # 1-10, higher is more important
    is_viewed = Column(Boolean, nullable=False, default=False)
    is_accepted = Column(Boolean, nullable=True)  # True=accepted, False=rejected, None=pending
    viewed_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="learning_recommendations")
    course = relationship("Course", back_populates="recommendations")
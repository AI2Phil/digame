"""
Learning & Development Pydantic Schemas
Data validation and serialization schemas for learning features.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class EnrollmentStatus(str, Enum):
    ENROLLED = "enrolled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DROPPED = "dropped"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class SkillLevel(str, Enum):
    NOVICE = "novice"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


# Course Schemas
class CourseBase(BaseModel):
    title: str = Field(max_length=255, description="Course title")
    description: str = Field(description="Course description")
    difficulty_level: DifficultyLevel = Field(description="Course difficulty level")
    estimated_duration_hours: int = Field(description="Estimated completion time in hours")
    tags: List[str] = Field(default=[], description="Course tags")
    prerequisites: List[str] = Field(default=[], description="Course prerequisites")


class CourseCreate(CourseBase):
    instructor_id: int = Field(description="ID of course instructor")


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    estimated_duration_hours: Optional[int] = None
    tags: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    status: Optional[CourseStatus] = None


class CourseResponse(CourseBase):
    id: int = Field(description="Course ID")
    instructor_id: int = Field(description="Instructor user ID")
    status: CourseStatus = Field(description="Course status")
    enrollment_count: int = Field(default=0, description="Number of enrolled students")
    average_rating: Optional[float] = Field(None, description="Average course rating")
    created_at: datetime = Field(description="Course creation date")
    updated_at: datetime = Field(description="Last update date")

    model_config = {"from_attributes": True}
class EnrollmentBase(BaseModel):
    course_id: int = Field(description="Course ID")
    status: EnrollmentStatus = Field(default=EnrollmentStatus.ENROLLED, description="Enrollment status")


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    status: Optional[EnrollmentStatus] = None
    progress_percentage: Optional[float] = Field(None, description="Progress percentage")
    completion_date: Optional[datetime] = None


class EnrollmentResponse(EnrollmentBase):
    id: int = Field(description="Enrollment ID")
    user_id: int = Field(description="Student user ID")
    progress_percentage: float = Field(default=0.0, description="Course completion percentage")
    completion_date: Optional[datetime] = Field(None, description="Course completion date")
    enrolled_at: datetime = Field(description="Enrollment date")
    last_accessed: Optional[datetime] = Field(None, description="Last access date")

    model_config = {"from_attributes": True}
class LearningPathBase(BaseModel):
    name: str = Field(max_length=255, description="Learning path name")
    description: str = Field(description="Learning path description")
    estimated_duration_hours: int = Field(description="Total estimated duration")
    difficulty_level: DifficultyLevel = Field(description="Overall difficulty level")
    tags: List[str] = Field(default=[], description="Learning path tags")


class LearningPathCreate(LearningPathBase):
    course_ids: List[int] = Field(description="List of course IDs in the path")


class LearningPathUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    estimated_duration_hours: Optional[int] = None
    difficulty_level: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None
    course_ids: Optional[List[int]] = None


class LearningPathResponse(LearningPathBase):
    id: int = Field(description="Learning path ID")
    creator_id: int = Field(description="Creator user ID")
    course_count: int = Field(default=0, description="Number of courses in path")
    enrollment_count: int = Field(default=0, description="Number of enrolled learners")
    created_at: datetime = Field(description="Creation date")
    updated_at: datetime = Field(description="Last update date")

    model_config = {"from_attributes": True}
class SkillAssessmentBase(BaseModel):
    skill_name: str = Field(max_length=100, description="Name of the skill")
    current_level: SkillLevel = Field(description="Current skill level")
    target_level: SkillLevel = Field(description="Target skill level")
    assessment_notes: Optional[str] = Field(None, description="Assessment notes")


class SkillAssessmentCreate(SkillAssessmentBase):
    pass


class SkillAssessmentUpdate(BaseModel):
    current_level: Optional[SkillLevel] = None
    target_level: Optional[SkillLevel] = None
    assessment_notes: Optional[str] = None


class SkillAssessmentResponse(SkillAssessmentBase):
    id: int = Field(description="Assessment ID")
    user_id: int = Field(description="User ID")
    created_at: datetime = Field(description="Assessment date")
    updated_at: datetime = Field(description="Last update date")

    model_config = {"from_attributes": True}
class LearningProgressSummary(BaseModel):
    total_courses_enrolled: int = Field(description="Total courses enrolled")
    courses_completed: int = Field(description="Courses completed")
    courses_in_progress: int = Field(description="Courses in progress")
    total_learning_hours: float = Field(description="Total learning hours")
    completion_rate: float = Field(description="Overall completion rate percentage")
    current_streak: int = Field(description="Current learning streak in days")


class RecentLearningActivity(BaseModel):
    id: str = Field(description="Activity ID")
    type: str = Field(description="Activity type (enrollment, completion, progress)")
    title: str = Field(description="Activity title")
    description: str = Field(description="Activity description")
    timestamp: datetime = Field(description="Activity timestamp")
    course_title: Optional[str] = Field(None, description="Related course title")


class SkillGapAnalysis(BaseModel):
    skill_name: str = Field(description="Skill name")
    current_level: SkillLevel = Field(description="Current level")
    target_level: SkillLevel = Field(description="Target level")
    gap_score: float = Field(description="Gap score (0-100)")
    recommended_courses: List[str] = Field(description="Recommended course titles")


class LearningDashboardResponse(BaseModel):
    progress_summary: LearningProgressSummary = Field(description="Learning progress summary")
    recent_activity: List[RecentLearningActivity] = Field(description="Recent learning activities")
    skill_gaps: List[SkillGapAnalysis] = Field(description="Identified skill gaps")
    recommended_courses: List[CourseResponse] = Field(description="Recommended courses")

    model_config = {"from_attributes": True}
class EnrollInCourseRequest(BaseModel):
    course_id: int = Field(description="Course ID to enroll in")


class UpdateProgressRequest(BaseModel):
    enrollment_id: int = Field(description="Enrollment ID")
    progress_percentage: float = Field(description="Progress percentage")


class CourseSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    difficulty_level: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None
    instructor_id: Optional[int] = None
    limit: int = Field(default=20, description="Maximum results")
    offset: int = Field(default=0, description="Results offset")
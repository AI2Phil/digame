"""
Learning Dashboard API Router
Provides endpoints for the learning dashboard including courses, progress, and recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..models.learning import Course, CourseEnrollment, LearningProgress, LearningRecommendation
from ..models.user import User
from ..schemas.learning import (
    LearningDashboardResponse,
    LearningProgressSummary,
    RecentLearningActivity,
    SkillGapAnalysis,
    CourseResponse,
    EnrollmentResponse,
    EnrollInCourseRequest,
    UpdateProgressRequest,
    CourseSearchRequest,
    SkillLevel,
    CourseStatus
)
from ..auth.dependencies import get_current_user
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/learning", tags=["learning-dashboard"])


def get_skill_level(level_str: str) -> SkillLevel:
    """Helper function to safely convert string to SkillLevel enum"""
    if not level_str:
        return SkillLevel.BEGINNER
    
    level_str = level_str.lower()
    if level_str == "novice":
        return SkillLevel.NOVICE
    elif level_str == "beginner":
        return SkillLevel.BEGINNER
    elif level_str == "intermediate":
        return SkillLevel.INTERMEDIATE
    elif level_str == "advanced":
        return SkillLevel.ADVANCED
    elif level_str == "expert":
        return SkillLevel.EXPERT
    else:
        return SkillLevel.BEGINNER


@router.get("/dashboard", response_model=LearningDashboardResponse)
async def get_learning_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive learning dashboard data for the current user"""
    try:
        # Get user's enrollments
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id
        ).all()
        
        # Calculate progress summary
        total_enrolled = len(enrollments)
        completed = len([e for e in enrollments if e.status == "completed"])
        in_progress = len([e for e in enrollments if e.status == "in_progress"])
        
        # Calculate total learning hours (simplified)
        total_hours = sum([e.progress_percentage * 0.1 for e in enrollments])  # Placeholder calculation
        completion_rate = (completed / total_enrolled * 100) if total_enrolled > 0 else 0
        
        progress_summary = LearningProgressSummary(
            total_courses_enrolled=total_enrolled,
            courses_completed=completed,
            courses_in_progress=in_progress,
            total_learning_hours=total_hours,
            completion_rate=completion_rate,
            current_streak=7  # Placeholder - would calculate from actual activity
        )
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.enrolled_at >= thirty_days_ago
        ).order_by(desc(CourseEnrollment.enrolled_at)).limit(5).all()
        
        recent_activity = []
        for enrollment in recent_enrollments:
            if enrollment.course:
                recent_activity.append(RecentLearningActivity(
                    id=str(enrollment.id),
                    type="enrollment",
                    title="Course Enrollment",
                    description=f"Enrolled in {enrollment.course.title}",
                    timestamp=enrollment.enrolled_at,
                    course_title=enrollment.course.title
                ))
        
        # Get learning progress for gap analysis
        learning_progress = db.query(LearningProgress).filter(
            LearningProgress.user_id == current_user.id
        ).all()
        
        skill_gaps = []
        for progress in learning_progress:
            # Simple gap calculation
            current_level_score = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}.get(progress.current_level, 1)
            target_level_score = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}.get(progress.target_level or "expert", 4)
            gap_score = max(0, (target_level_score - current_level_score) * 25)
            
            skill_gaps.append(SkillGapAnalysis(
                skill_name=progress.skill_name,
                current_level=get_skill_level(progress.current_level),
                target_level=get_skill_level(progress.target_level) if progress.target_level else SkillLevel.EXPERT,
                gap_score=gap_score,
                recommended_courses=["Python Fundamentals", "Advanced Python"]  # Placeholder
            ))
        
        # Get recommended courses (top 3 published courses)
        recommended_courses_query = db.query(Course).filter(
            Course.is_published == True
        ).order_by(desc(Course.created_at)).limit(3).all()
        
        recommended_courses = []
        for course in recommended_courses_query:
            recommended_courses.append(CourseResponse(
                id=course.id,
                title=course.title,
                description=course.description or course.short_description or "",
                difficulty_level=course.difficulty_level,
                estimated_duration_hours=course.duration_hours or 0,
                tags=course.skills_covered or [],
                prerequisites=course.prerequisites or [],
                instructor_id=course.instructor_id or 0,
                status=CourseStatus.PUBLISHED if course.is_published else CourseStatus.DRAFT,
                enrollment_count=course.current_enrollments,
                average_rating=float(course.rating_average) if course.rating_average else None,
                created_at=course.created_at,
                updated_at=course.updated_at
            ))
        
        dashboard_data = LearningDashboardResponse(
            progress_summary=progress_summary,
            recent_activity=recent_activity,
            skill_gaps=skill_gaps,
            recommended_courses=recommended_courses
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error fetching learning dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch learning dashboard data"
        )


@router.get("/courses", response_model=List[CourseResponse])
async def get_courses(
    limit: int = 20,
    offset: int = 0,
    difficulty_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available courses with optional filtering"""
    try:
        query = db.query(Course).filter(Course.is_published == True)
        
        if difficulty_level:
            query = query.filter(Course.difficulty_level == difficulty_level)
        
        courses = query.offset(offset).limit(limit).all()
        
        course_responses = []
        for course in courses:
            course_responses.append(CourseResponse(
                id=course.id,
                title=course.title,
                description=course.description or course.short_description or "",
                difficulty_level=course.difficulty_level,
                estimated_duration_hours=course.duration_hours or 0,
                tags=course.skills_covered or [],
                prerequisites=course.prerequisites or [],
                instructor_id=course.instructor_id or 0,
                status=CourseStatus.PUBLISHED if course.is_published else CourseStatus.DRAFT,
                enrollment_count=course.current_enrollments,
                average_rating=float(course.rating_average) if course.rating_average else None,
                created_at=course.created_at,
                updated_at=course.updated_at
            ))
        
        return course_responses
        
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch courses"
        )


@router.post("/enroll")
async def enroll_in_course(
    request: EnrollInCourseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll user in a course"""
    try:
        # Check if course exists
        course = db.query(Course).filter(Course.id == request.course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if already enrolled
        existing_enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.course_id == request.course_id
        ).first()
        
        if existing_enrollment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course"
            )
        
        # Create enrollment
        enrollment = CourseEnrollment(
            user_id=current_user.id,
            course_id=request.course_id,
            status="enrolled",
            progress_percentage=0.0,
            enrolled_at=datetime.utcnow()
        )
        
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        return {"message": "Successfully enrolled in course", "enrollment_id": enrollment.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enrolling in course: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enroll in course"
        )


@router.get("/enrollments", response_model=List[EnrollmentResponse])
async def get_user_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's course enrollments"""
    try:
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == current_user.id
        ).order_by(desc(CourseEnrollment.enrolled_at)).all()
        
        enrollment_responses = []
        for enrollment in enrollments:
            enrollment_responses.append(EnrollmentResponse(
                id=enrollment.id,
                course_id=enrollment.course_id,
                user_id=enrollment.user_id,
                status=enrollment.status,
                progress_percentage=float(enrollment.progress_percentage),
                completion_date=enrollment.completed_at,
                enrolled_at=enrollment.enrolled_at,
                last_accessed=enrollment.last_accessed_at
            ))
        
        return enrollment_responses
        
    except Exception as e:
        logger.error(f"Error fetching enrollments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch enrollments"
        )


@router.put("/progress")
async def update_learning_progress(
    request: UpdateProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update learning progress for an enrollment"""
    try:
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.id == request.enrollment_id,
            CourseEnrollment.user_id == current_user.id
        ).first()
        
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )
        
        enrollment.progress_percentage = request.progress_percentage
        enrollment.last_accessed_at = datetime.utcnow()
        
        # Mark as completed if 100%
        if request.progress_percentage >= 100:
            enrollment.status = "completed"
            enrollment.completed_at = datetime.utcnow()
        elif request.progress_percentage > 0:
            enrollment.status = "in_progress"
        
        db.commit()
        
        return {"message": "Progress updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        )
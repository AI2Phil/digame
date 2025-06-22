"""
Mentorship Program Platform Router
API endpoints for comprehensive mentorship system
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..services.mentorship_service import MentorshipService
from ..schemas.mentorship_schemas import (
    MentorshipProgramCreate, MentorshipProgramResponse, MentorApplicationCreate,
    MentorApplicationResponse, MentorshipMatchResponse, MentorshipProgressUpdate,
    MentorshipAnalytics, MentorQualificationResponse, MentorshipConnectionCreate,
    MentorshipConnectionResponse
)
from ..auth.auth_service import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/mentorship", tags=["mentorship"])


@router.get("/programs", response_model=List[MentorshipProgramResponse])
async def get_mentorship_programs(
    program_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get available mentorship programs"""
    mentorship_service = MentorshipService(db)
    
    # For now, return sample programs - in real implementation would query database
    sample_programs = [
        mentorship_service.create_mentorship_program(
            MentorshipProgramCreate(
                name="Career Development Accelerator",
                description="Comprehensive career development program for professionals",
                program_type="career_development",
                max_participants=20
            )
        ),
        mentorship_service.create_mentorship_program(
            MentorshipProgramCreate(
                name="Technical Skills Mastery",
                description="Intensive skill-building program for technical professionals",
                program_type="skill_building",
                max_participants=15
            )
        ),
        mentorship_service.create_mentorship_program(
            MentorshipProgramCreate(
                name="Leadership Excellence",
                description="Leadership development program for emerging leaders",
                program_type="leadership",
                max_participants=12
            )
        )
    ]
    
    if program_type:
        return [p for p in sample_programs if p.program_type == program_type]
    return sample_programs


@router.post("/programs", response_model=MentorshipProgramResponse)
async def create_mentorship_program(
    program_data: MentorshipProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new mentorship program"""
    mentorship_service = MentorshipService(db)
    return mentorship_service.create_mentorship_program(program_data)


@router.get("/matches/{mentee_id}", response_model=List[MentorshipMatchResponse])
async def find_mentor_matches(
    mentee_id: int,
    program_type: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find potential mentors for a mentee"""
    mentorship_service = MentorshipService(db)
    
    # Ensure user can only access their own matches or is admin
    if current_user.id != mentee_id:
        # Check if user has admin permissions
        # For now, allow access - in real implementation would check roles
        pass
    
    try:
        matches = mentorship_service.find_mentor_matches(mentee_id, program_type, limit)
        return matches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error finding mentor matches: {str(e)}"
        )


@router.post("/applications", response_model=MentorApplicationResponse)
async def apply_as_mentor(
    application_data: MentorApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply to become a mentor"""
    mentorship_service = MentorshipService(db)
    
    try:
        application = mentorship_service.apply_as_mentor(current_user.id, application_data)
        return application
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/qualifications/{user_id}", response_model=MentorQualificationResponse)
async def get_mentor_qualifications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get mentor qualification status and recommendations"""
    mentorship_service = MentorshipService(db)
    
    # Ensure user can only access their own qualifications or is admin
    if current_user.id != user_id:
        # Check if user has admin permissions
        # For now, allow access - in real implementation would check roles
        pass
    
    try:
        qualifications = mentorship_service.get_mentor_qualifications(user_id)
        return qualifications
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/connections", response_model=MentorshipConnectionResponse)
async def create_mentorship_connection(
    connection_data: MentorshipConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new mentorship connection"""
    mentorship_service = MentorshipService(db)
    
    # Ensure user is either the mentor or mentee
    if current_user.id not in [connection_data.mentor_id, connection_data.mentee_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create connections where you are the mentor or mentee"
        )
    
    try:
        connection = mentorship_service.create_mentorship_connection(
            connection_data.mentor_id,
            connection_data.mentee_id,
            connection_data.program_type,
            connection_data.goals
        )
        
        # Convert to response schema
        return MentorshipConnectionResponse(
            id=connection.id,
            mentor_id=connection.mentor_id,
            mentee_id=connection.mentee_id,
            focus_areas=connection.focus_areas,
            goals=connection.goals,
            duration_months=connection.duration_months,
            meeting_frequency=connection.meeting_frequency,
            status=connection.status,
            started_at=connection.started_at,
            ended_at=connection.ended_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/connections/{user_id}", response_model=List[MentorshipConnectionResponse])
async def get_user_mentorship_connections(
    user_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get mentorship connections for a user"""
    # Ensure user can only access their own connections or is admin
    if current_user.id != user_id:
        # Check if user has admin permissions
        # For now, allow access - in real implementation would check roles
        pass
    
    from ..models.social_collaboration import MentorshipConnection
    
    query = db.query(MentorshipConnection).filter(
        (MentorshipConnection.mentor_id == user_id) | 
        (MentorshipConnection.mentee_id == user_id)
    )
    
    if status_filter:
        query = query.filter(MentorshipConnection.status == status_filter)
    
    connections = query.all()
    
    return [
        MentorshipConnectionResponse(
            id=conn.id,
            mentor_id=conn.mentor_id,
            mentee_id=conn.mentee_id,
            focus_areas=conn.focus_areas,
            goals=conn.goals,
            duration_months=conn.duration_months,
            meeting_frequency=conn.meeting_frequency,
            status=conn.status,
            started_at=conn.started_at,
            ended_at=conn.ended_at
        )
        for conn in connections
    ]


@router.put("/connections/{connection_id}/progress")
async def update_mentorship_progress(
    connection_id: int,
    progress_data: MentorshipProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update progress for a mentorship relationship"""
    from ..models.social_collaboration import MentorshipConnection
    
    # Verify user is part of this mentorship connection
    connection = db.query(MentorshipConnection).filter(
        MentorshipConnection.id == connection_id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentorship connection not found"
        )
    
    if current_user.id not in [connection.mentor_id, connection.mentee_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update progress for your own mentorship connections"
        )
    
    mentorship_service = MentorshipService(db)
    
    try:
        progress_update = mentorship_service.update_mentorship_progress(connection_id, progress_data)
        return progress_update
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/analytics", response_model=MentorshipAnalytics)
async def get_mentorship_analytics(
    user_id: Optional[int] = None,
    program_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive mentorship analytics"""
    mentorship_service = MentorshipService(db)
    
    # If user_id is specified, ensure user can only access their own analytics or is admin
    if user_id and current_user.id != user_id:
        # Check if user has admin permissions
        # For now, allow access - in real implementation would check roles
        pass
    
    try:
        analytics = mentorship_service.get_mentorship_analytics(user_id, program_type)
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating analytics: {str(e)}"
        )


@router.get("/programs/{program_type}/templates")
async def get_program_templates(
    program_type: str,
    db: Session = Depends(get_db)
):
    """Get structured templates for a specific mentorship program type"""
    mentorship_service = MentorshipService(db)
    
    # Create a sample program to get the template structure
    sample_program = mentorship_service.create_mentorship_program(
        MentorshipProgramCreate(
            name=f"Sample {program_type.replace('_', ' ').title()} Program",
            description=f"Template for {program_type} mentorship program",
            program_type=program_type,
            max_participants=20
        )
    )
    
    return {
        "program_type": program_type,
        "duration_weeks": sample_program.duration_weeks,
        "meeting_frequency": sample_program.meeting_frequency,
        "milestones": sample_program.milestones,
        "recommended_activities": sample_program.recommended_activities
    }


@router.get("/dashboard/{user_id}")
async def get_mentorship_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive mentorship dashboard data for a user"""
    # Ensure user can only access their own dashboard or is admin
    if current_user.id != user_id:
        # Check if user has admin permissions
        # For now, allow access - in real implementation would check roles
        pass
    
    mentorship_service = MentorshipService(db)
    
    try:
        # Get user's connections
        from ..models.social_collaboration import MentorshipConnection
        
        connections = db.query(MentorshipConnection).filter(
            (MentorshipConnection.mentor_id == user_id) | 
            (MentorshipConnection.mentee_id == user_id)
        ).all()
        
        # Get qualification status
        qualifications = mentorship_service.get_mentor_qualifications(user_id)
        
        # Get analytics for this user
        analytics = mentorship_service.get_mentorship_analytics(user_id=user_id)
        
        # Get potential matches if user is looking for mentors
        potential_matches = mentorship_service.find_mentor_matches(user_id, limit=5)
        
        return {
            "user_id": user_id,
            "connections": [
                {
                    "id": conn.id,
                    "mentor_id": conn.mentor_id,
                    "mentee_id": conn.mentee_id,
                    "focus_areas": conn.focus_areas,
                    "status": conn.status,
                    "started_at": conn.started_at,
                    "role": "mentor" if conn.mentor_id == user_id else "mentee"
                }
                for conn in connections
            ],
            "qualifications": qualifications,
            "analytics": analytics,
            "potential_matches": potential_matches[:3],  # Top 3 matches
            "available_programs": [
                {"type": "career_development", "name": "Career Development"},
                {"type": "skill_building", "name": "Skill Building"},
                {"type": "leadership", "name": "Leadership"},
                {"type": "technical_expertise", "name": "Technical Expertise"},
                {"type": "entrepreneurship", "name": "Entrepreneurship"},
                {"type": "industry_transition", "name": "Industry Transition"}
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dashboard: {str(e)}"
        )
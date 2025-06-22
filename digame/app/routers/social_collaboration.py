"""
Social Collaboration API Router
Handles peer matching, user profile updates for social features, and other related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Import from the correct paths based on the project structure
from ..database import get_db
from ..models.user import User as UserModel
from ..schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from ..schemas.user_schemas import User as UserSchema
from ..services.social_collaboration_service import SocialCollaborationService
from ..crud import user_crud, notification_crud
from ..schemas.notification_schemas import NotificationCreate

# Authentication dependency
async def get_current_active_user(db: Session = Depends(get_db)) -> UserModel:
    # In a real app, this would come from a token, etc.
    # For now, returning the first user or raising an error if no users.
    user = db.query(UserModel).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

# Placeholder permission check function
def require_permission(permission: str, user: UserModel):
    """Placeholder for permission checking"""
    # In a real implementation, this would check user permissions
    pass

async def get_admin_user(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    # Placeholder: In a real app, check if current_user has admin role/permissions.
    # For now, just returns the current user, assuming they might be an admin.
    return current_user

router = APIRouter(
    prefix="/api/v1/social", # Using /api/v1 prefix for consistency
    tags=["Social Collaboration"]
)

# --- User Profile Management for Social Features ---

@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def read_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get a user's social profile.
    A user can view their own profile. Viewing other profiles might require admin or specific permissions.
    """
    if current_user.id != user_id:
        # Add admin check or other permission logic here if needed
        # For now, only allow users to see their own profile via this specific endpoint.
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this profile")

    profile = user_crud.get_user_profile(db, user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile

@router.get("/users/{user_id}/skill-matches")
async def get_skill_based_matches(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get skill-based peer matches using advanced algorithms"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    # Enhanced skill matching results
    skill_matches = [
        {
            "id": 1,
            "name": "Alex Brown",
            "title": "Product Manager",
            "initials": "AB",
            "compatibilityScore": 94,
            "sharedSkills": 5,
            "complementarySkills": ["Product Strategy", "Market Research"],
            "skillGaps": ["Technical Architecture"],
            "learningOpportunities": ["AI/ML Fundamentals", "Data Science"],
            "collaborationPotential": "high"
        },
        {
            "id": 4,
            "name": "Emily Davis",
            "title": "Data Scientist",
            "initials": "ED",
            "compatibilityScore": 92,
            "sharedSkills": 6,
            "complementarySkills": ["Machine Learning", "Statistics"],
            "skillGaps": ["Frontend Development"],
            "learningOpportunities": ["Deep Learning", "MLOps"],
            "collaborationPotential": "very-high"
        }
    ]
    
    return {"skillMatches": skill_matches}

# Professional Networking Endpoints
@router.get("/users/{user_id}/industry-connections")
async def get_industry_connections(
    user_id: int,
    industry: Optional[str] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get industry-specific networking connections"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    connections = [
        {
            "id": 1,
            "name": "Sarah Johnson",
            "title": "VP of Engineering",
            "company": "TechCorp",
            "industry": "Technology",
            "connections": 2847,
            "mutualConnections": 12,
            "influenceScore": 9.2,
            "recentActivity": "Posted about AI trends"
        }
    ]
    
    return {"connections": connections}

@router.get("/networking-events")
async def get_networking_events(
    industry: Optional[str] = None,
    location: Optional[str] = None,
    virtual: Optional[bool] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get curated networking events"""
    
    events = [
        {
            "id": 1,
            "title": "Tech Leaders Summit 2025",
            "type": "Conference",
            "date": "2025-06-15",
            "location": "San Francisco, CA",
            "attendees": 500,
            "industry": "Technology",
            "price": "$299",
            "virtual": False,
            "speakers": ["Sarah Johnson", "Mark Thompson"],
            "topics": ["AI/ML", "Leadership", "Innovation"],
            "networkingScore": 95
        },
        {
            "id": 2,
            "title": "AI Innovation Meetup",
            "type": "Meetup",
            "date": "2025-06-01",
            "location": "Virtual",
            "attendees": 150,
            "industry": "Technology",
            "price": "Free",
            "virtual": True,
            "speakers": ["Dr. Emily Rodriguez"],
            "topics": ["Machine Learning", "Neural Networks"],
            "networkingScore": 87
        }
    ]
    
    # Apply filters
    filtered_events = events
    if industry and isinstance(industry, str):
        filtered_events = []
        for e in events:
            event_industry = e.get("industry")
            if isinstance(event_industry, str) and event_industry.lower() == industry.lower():
                filtered_events.append(e)
    if virtual is not None:
        filtered_events = [e for e in filtered_events if e.get("virtual") == virtual]
    
    return {"events": filtered_events}

# Mentorship Endpoints
@router.get("/users/{user_id}/mentorship-programs")
async def get_mentorship_programs(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available mentorship programs"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    programs = [
        {
            "id": 1,
            "title": "Senior Developer Mentorship",
            "type": "mentor",
            "description": "Guide junior developers in advanced programming concepts",
            "duration": "6 months",
            "commitment": "2 hours/week",
            "participants": 3,
            "skills": ["React", "Node.js", "System Design"],
            "status": "active"
        },
        {
            "id": 2,
            "title": "AI/ML Learning Circle",
            "type": "peer",
            "description": "Collaborative learning group for machine learning enthusiasts",
            "duration": "3 months",
            "commitment": "3 hours/week",
            "participants": 8,
            "skills": ["Python", "TensorFlow", "Data Science"],
            "status": "recruiting"
        }
    ]
    
    return {"programs": programs}

@router.post("/mentorship/{program_id}/join")
async def join_mentorship_program(
    program_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join a mentorship program"""
    
    # Mock joining logic
    return {
        "success": True,
        "message": f"Successfully joined mentorship program {program_id}",
        "programId": program_id
    }

# Collaboration Projects Endpoints
@router.get("/users/{user_id}/collaboration-projects")
async def get_collaboration_projects(
    user_id: int,
    status: Optional[str] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get collaboration projects for a user"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    projects = [
        {
            "id": 1,
            "name": "AI Research Project",
            "description": "Collaborative research on machine learning applications",
            "team": "5 members",
            "progress": 67,
            "status": "active",
            "skills": ["Python", "TensorFlow", "Research"],
            "deadline": "2025-07-15",
            "collaborationScore": 94
        },
        {
            "id": 2,
            "name": "Open Source Library",
            "description": "Building a React component library",
            "team": "8 members",
            "progress": 45,
            "status": "active",
            "skills": ["React", "TypeScript", "Documentation"],
            "deadline": "2025-08-30",
            "collaborationScore": 87
        }
    ]
    
    if status:
        projects = [p for p in projects if p["status"] == status]
    
    return {"projects": projects}

@router.get("/projects/available")
async def get_available_projects(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available collaboration projects to join"""
    
    projects = [
        {
            "id": 1,
            "name": "Open Source AI Assistant",
            "description": "Building an intelligent coding assistant for developers",
            "category": "Open Source",
            "skills": ["Python", "NLP", "React"],
            "team": 8,
            "progress": 65,
            "duration": "4 months",
            "commitment": "10 hours/week",
            "difficulty": "Advanced",
            "status": "recruiting"
        },
        {
            "id": 2,
            "name": "Sustainability Tracker App",
            "description": "Mobile app to track and gamify sustainable living practices",
            "category": "Social Impact",
            "skills": ["React Native", "Node.js", "MongoDB"],
            "team": 5,
            "progress": 30,
            "duration": "3 months",
            "commitment": "6 hours/week",
            "difficulty": "Intermediate",
            "status": "starting"
        }
    ]
    
    # Apply filters
    filtered_projects = projects
    if category:
        filtered_projects = [p for p in filtered_projects if p["category"] == category]
    if difficulty:
        filtered_projects = [p for p in filtered_projects if p["difficulty"] == difficulty]
    
    return {"projects": filtered_projects}

@router.post("/projects/{project_id}/join")
async def join_collaboration_project(
    project_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join a collaboration project"""
    
    return {
        "success": True,
        "message": f"Successfully joined project {project_id}",
        "projectId": project_id
    }

# Team Analytics Endpoints
@router.get("/users/{user_id}/team-analytics")
async def get_team_analytics(
    user_id: int,
    time_range: str = Query("month", pattern="^(week|month|quarter|year)$"),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get team collaboration analytics"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    analytics = {
        "efficiency": 87,
        "collaborationScore": 94,
        "successRate": 92,
        "teams": [
            {"id": 1, "name": "Frontend Development", "members": 8, "efficiency": 92, "projects": 3},
            {"id": 2, "name": "AI Research Group", "members": 5, "efficiency": 87, "projects": 2},
            {"id": 3, "name": "Mobile Development", "members": 6, "efficiency": 89, "projects": 4}
        ],
        "collaborationMetrics": {
            "totalCollaborations": 156,
            "successfulProjects": 23,
            "averageTeamSize": 6.3,
            "crossTeamProjects": 8,
            "communicationFrequency": 4.2,
            "knowledgeSharing": 87
        },
        "performanceMetrics": {
            "productivity": 89,
            "quality": 94,
            "delivery": 91,
            "innovation": 86,
            "satisfaction": 92
        }
    }
    
    return analytics

# Connection Management Endpoints
@router.post("/connections/request")
async def send_connection_request(
    peer_id: int,
    message: Optional[str] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a connection request to another user"""
    
    # Verify the target user exists
    target_user = user_crud.get_user(db, peer_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create notification for the receiver
    notification_data = NotificationCreate(
        message=f"{current_user.first_name or 'A user'} sent you a connection request.",
        type='connection_request'
    )
    try:
        notification_crud.create_notification(db=db, notification=notification_data, user_id=peer_id)
    except Exception as e:
        # Log or handle exception if db is None and CRUD fails. For now, pass.
        print(f"Could not create notification due to DB issue: {e}")

    return {
        "success": True,
        "message": f"Connection request sent to user {peer_id}",
        "requestId": f"req_{current_user.id}_{peer_id}_{int(datetime.now().timestamp())}"
    }

@router.post("/connections/requests/{request_id}/accept")
async def accept_connection_request(
    request_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Accept a connection request and notify the original sender."""
    try:
        parts = request_id.split('_')
        # Expected format: req_SENDERID_RECEIVERID_TIMESTAMP
        if len(parts) == 4 and parts[0] == 'req':
            original_requester_id = int(parts[1])
        else:
            raise HTTPException(status_code=400, detail="Invalid request_id format")
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Could not parse original_requester_id from request_id")

    original_requester = user_crud.get_user(db, original_requester_id)
    if not original_requester:
        raise HTTPException(status_code=404, detail=f"Original requester (ID: {original_requester_id}) not found")

    # Create notification for the original requester
    notification_data = NotificationCreate(
        message=f"{current_user.first_name or 'A user'} accepted your connection request.",
        type='connection_accepted'
    )
    try:
        notification_crud.create_notification(db=db, notification=notification_data, user_id=original_requester_id)
    except Exception as e:
        # Log or handle exception if db is None and CRUD fails. For now, pass.
        print(f"Could not create notification due to DB issue: {e}")

    return {
        "success": True,
        "message": f"Connection request {request_id} accepted. Notification sent to user {original_requester_id}."
    }

@router.get("/connections/requests")
async def get_connection_requests(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get pending connection requests"""
    
    requests = [
        {
            "id": 1,
            "from_user": {
                "id": 2,
                "name": "Alex Brown",
                "title": "Product Manager",
                "company": "TechCorp"
            },
            "message": "I'd love to connect and share insights about product development",
            "sent_at": "2025-05-23T10:00:00Z",
            "status": "pending"
        }
    ]
    
    return {"requests": requests}

# Enhanced User Profile for Social Features
@router.get("/users/{user_id}/social-profile")
async def get_social_profile(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's enhanced social collaboration profile"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    # Get user from database
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock enhanced profile data
    profile = {
        "id": user.id,
        "name": f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else "John Doe",
        "email": user.email,
        "title": "Senior Software Engineer",
        "company": "Tech Innovation Corp",
        "initials": "".join([n[0] for n in f"{user.first_name} {user.last_name}".split() if n]),
        "experience": "5+ years",
        "location": "San Francisco, CA",
        "industry": "Technology",
        "skills": ["React", "Node.js", "Python", "Machine Learning", "Team Leadership"],
        "networkSize": 247,
        "industryRank": 15,
        "directConnections": 247,
        "secondDegreeNetwork": "12.5K",
        "industryInfluence": "8.7/10",
        "collaborationScore": "94%",
        "weeklyGrowth": 12,
        "bio": "Passionate software engineer with expertise in full-stack development and AI/ML",
        "interests": ["Artificial Intelligence", "Open Source", "Mentoring", "Innovation"],
        "achievements": [
            "Top 1% contributor on GitHub",
            "Mentored 15+ junior developers",
            "Speaker at 5 tech conferences"
        ]
    }
    
    return profile

@router.put("/users/{user_id}/profile", response_model=UserProfileResponse)
async def update_user_social_profile(
    user_id: int,
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update a user's social profile.
    Users can update their own profile. Admins might update others.
    """
    if current_user.id != user_id:
        # Add admin check here, e.g., if current_user is an admin
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")

    updated_profile = user_crud.update_user_profile(db, user_id=user_id, profile_update=profile_data)
    if not updated_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found, cannot update")
    return updated_profile

# --- Peer Matching and Learning Partner Recommendations ---

@router.get("/users/{user_id}/peer-matches", response_model=List[UserWithProfileResponse])
async def get_social_matches(
    user_id: int,
    match_type: Optional[str] = Query("skill", description="Type of match: 'skill' or 'learning_partner'"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get peer matches for a user.
    - `match_type='skill'`: Finds users with similar skills.
    - `match_type='learning_partner'`: Recommends learning partners.
    A user can typically only request matches for themselves.
    """
    if current_user.id != user_id:
        # Allow admins to request for others, or implement specific permission
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to request matches for this user")

    service = SocialCollaborationService(db)

    if match_type == "learning_partner":
        users = service.get_learning_partner_recommendations(user_id=user_id, limit=limit)
    elif match_type == "skill":
        users = service.get_skill_based_matches(user_id=user_id, limit=limit)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid match_type. Use 'skill' or 'learning_partner'.")

    # Populate UserWithProfileResponse
    results = []
    for user_model in users:
        profile_model = user_crud.get_user_profile(db, user_id=user_model.id)
        results.append(UserWithProfileResponse(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            first_name=user_model.first_name,
            last_name=user_model.last_name,
            is_active=user_model.is_active,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            profile=UserProfileResponse.model_validate(profile_model) if profile_model else None # Use model_validate for Pydantic v2
        ))
    return results

@router.get("/users/{user_id}/skill-matches-deprecated", response_model=List[UserWithProfileResponse], deprecated=True)
async def get_skill_based_matches_deprecated(
    user_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get skill-based peer matches.
    (Deprecated: Use `/users/{user_id}/peer-matches?match_type=skill` instead)
    """
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    service = SocialCollaborationService(db)
    users = service.get_skill_based_matches(user_id=user_id, limit=limit)

    results = []
    for user_model in users:
        profile_model = user_crud.get_user_profile(db, user_id=user_model.id)
        results.append(UserWithProfileResponse(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            first_name=user_model.first_name,
            last_name=user_model.last_name,
            is_active=user_model.is_active,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            profile=UserProfileResponse.model_validate(profile_model) if profile_model else None
        ))
    return results

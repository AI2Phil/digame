"""
Social Collaboration API Router
Enhanced with real project data, messaging, and improved peer matching
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json

# Import from the correct paths based on the project structure
from ..database import get_db
from ..models.user import User as UserModel
from ..models.project import Project
from ..schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from ..schemas.user_schemas import User as UserSchema
from ..services.social_collaboration_service import SocialCollaborationService
from ..services.enhanced_social_collaboration_service import EnhancedSocialCollaborationService
from ..crud import user_crud, notification_crud
from .. import crud
from ..schemas.notification_schemas import NotificationCreate
from ..auth.auth_dependencies import get_current_active_user

# Import project schemas with fallback
try:
    from ..schemas.project_schemas import ProjectMatchResponse, Project as ProjectSchema, ProjectMatch
except ImportError:
    # Fallback project schemas if not available
    class ProjectSchema(BaseModel):
        id: int
        name: str
        description: Optional[str] = None
        required_skills: List[str] = []
        owner_id: int
        created_at: datetime
        
        class Config:
            from_attributes = True  # Updated for Pydantic v2

    class ProjectMatch(BaseModel):
        project: ProjectSchema
        matching_skills: List[str]
        missing_skills: List[str]
        
        class Config:
            from_attributes = True

    class ProjectMatchResponse(BaseModel):
        matches: List[ProjectMatch]
        total: int

# Mock permission check - can be removed if not used by new endpoints or replaced by actual RBAC
def require_permission(permission: str, user: UserModel):
    """Mock permission check"""
    # Replace with actual RBAC logic if needed
    print(f"Checking permission {permission} for user {user.id}")
    return True

async def get_admin_user(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    # Placeholder: In a real app, check if current_user has admin role/permissions.
    # For now, just returns the current user, assuming they might be an admin.
    return current_user

router = APIRouter(
    prefix="/social",
    tags=["Social Collaboration"],
    responses={404: {"description": "Not found"}}, # Added a default 404 response
)

@router.get("/peer-matches", response_model=List[UserSchema])
async def get_ai_peer_matches(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
    min_common_skills: int = Query(2, ge=1, description="Minimum number of common skills for a match.")
):
    """
    Get AI-powered peer matches based on common skills.
    Compares the current user's skills with all other users.
    """
    current_user_skills_str = getattr(current_user, 'skills', None)
    if not current_user_skills_str:
        return []

    try:
        current_user_skills_set = set(json.loads(current_user_skills_str))
    except json.JSONDecodeError:
        return [] # Or handle error appropriately

    if not current_user_skills_set:
        return []

    # Fetching all users might be very inefficient. Consider pagination or more targeted queries.
    # For now, limiting to a reasonable number for demonstration.
    all_users = crud.user_crud.get_users(db, skip=0, limit=1000) # Adjust limit as needed

    matched_peers = []
    for other_user in all_users:
        if other_user.id == current_user.id:
            continue

        other_user_skills_str = getattr(other_user, 'skills', None)
        if not other_user_skills_str:
            continue

        try:
            other_user_skills_set = set(json.loads(other_user_skills_str))
        except json.JSONDecodeError:
            continue # Skip user if skills are malformed

        common_skills = current_user_skills_set.intersection(other_user_skills_set)

        if len(common_skills) >= min_common_skills:
            # Optionally, add common_skills info to the user object if schema supports it
            # For now, just returning the UserSchema which will include all its fields
            matched_peers.append(other_user)

    return matched_peers


@router.get("/users/{user_id}/skill-matches") # This is another mock endpoint, leaving as is for now unless instructed to change
async def get_skill_based_matches(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get skill-based peer matches using advanced algorithms"""
    # This endpoint's logic is currently mock and refers to a specific user_id in path.
    # It's different from the new /peer-matches endpoint.
    if current_user.id != user_id:
        if not require_permission("view_user_data", current_user): # Example usage
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get industry-specific networking connections"""
    
    if current_user.id != user_id:
        if not require_permission("view_user_data", current_user): # Example usage
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get available mentorship programs"""

    if current_user.id != user_id:
        if not require_permission("view_user_data", current_user): # Example usage
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
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

@router.post("/mentorship/{program_id}/join") # Note: Path is /social/mentorship...
async def join_mentorship_program(
    program_id: int,
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get collaboration projects for a user"""
    
    if current_user.id != user_id:
        if not require_permission("view_user_data", current_user): # Example usage
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
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

@router.post("/projects/{project_id}/join") # Note: Path is /social/projects...
async def join_collaboration_project(
    project_id: int,
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Join a collaboration project"""
    
    return {
        "success": True,
        "message": f"Successfully joined project {project_id}",
        "projectId": project_id
    }

# Team Analytics Endpoints
# ... (existing code) ...

# Make sure this new endpoint is defined within the router context
@router.get("/project-matches", response_model=ProjectMatchResponse)
async def get_project_matches(
    user_id: int,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Assuming current_user is not strictly needed for this version
):
    """
    Get project matches for a user based on their skills.
    """
    user_entity = crud.user_crud.get_user(db, user_id=user_id) # Use the actual CRUD function

    if not user_entity:
        raise HTTPException(status_code=404, detail="User not found")

    # For development, if user_entity doesn't have skills (e.g. real model without skills field yet)
    # We'll use a default list. The mock get_user above already provides skills.
    user_skills = []
    if hasattr(user_entity, 'skills') and user_entity.skills:
        user_skills = user_entity.skills
    elif not hasattr(user_entity, 'skills'): # If the object truly has no skills attr
        # Fallback to some default skills if even the mock User didn't get skills
        # This case should ideally be covered by the mock User definition in ImportError
        user_skills = ["python", "react"] # Default if no skills found on user object

    # Mock project data
    mock_projects_data = [
        {"id": 1, "name": "AI Chatbot", "description": "A chatbot for customer service", "required_skills": ["python", "nlp", "machine learning"], "owner_id": 1, "created_at": datetime.utcnow()},
        {"id": 2, "name": "E-commerce Platform", "description": "Online shopping platform", "required_skills": ["react", "nodejs", "mongodb"], "owner_id": 2, "created_at": datetime.utcnow()},
        {"id": 3, "name": "Data Analytics Dashboard", "description": "Dashboard for visualizing data", "required_skills": ["python", "pandas", "fastapi"], "owner_id": 1, "created_at": datetime.utcnow()},
        {"id": 4, "name": "Mobile Game", "description": "A new mobile game", "required_skills": ["unity", "csharp"], "owner_id": 3, "created_at": datetime.utcnow()},
        {"id": 5, "name": "NLP Research", "description": "Research project on NLP", "required_skills": ["python", "pytorch", "nlp"], "owner_id": 1, "created_at": datetime.utcnow()},
    ]

    # Convert mock data to ProjectSchema.
    # In a real scenario, these would be fetched from project_crud.get_projects(db) or similar
    # And would likely already be Project model instances, then converted to ProjectSchema for response.
    # For now, we create ProjectSchema instances directly from dicts.
    all_projects = [ProjectSchema(**p) for p in mock_projects_data]

    matches = []
    for project in all_projects:
        project_req_skills_set = set(s.lower() for s in project.required_skills)
        user_skills_set = set(s.lower() for s in user_skills)

        matching_skills = list(user_skills_set.intersection(project_req_skills_set))
        missing_skills = list(project_req_skills_set.difference(user_skills_set))

        if matching_skills: # Consider it a match if there's at least one skill in common
            match_data = {
                "project": project,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills
            }
            project_match = ProjectMatch(**match_data)
            matches.append(project_match)

    response_data = {
        "matches": matches,
        "total": len(matches)
    }
    return ProjectMatchResponse(**response_data)


@router.get("/users/{user_id}/team-analytics")
async def get_team_analytics(
    user_id: int,
    time_range: str = Query("month", pattern="^(week|month|quarter|year)$"),
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get team collaboration analytics"""
    
    if current_user.id != user_id:
        if not require_permission("view_user_data", current_user): # Example usage
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Send a connection request to another user"""
    
    # Verify the target user exists
    target_user = crud.user_crud.get_user(db, user_id=peer_id) # Use actual crud
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create notification for the receiver
    notification_data_dict = {
        "message": f"{current_user.first_name or 'A user'} sent you a connection request.",
        "type": 'connection_request'
    }
    notification_data = NotificationCreate(**notification_data_dict)
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
    notification_data_dict = {
        "message": f"{current_user.first_name or 'A user'} accepted your connection request.",
        "type": 'connection_accepted'
    }
    notification_data = NotificationCreate(**notification_data_dict)
    try:
        notification_crud.create_notification(db=db, notification=notification_data, user_id=original_requester_id)
    except Exception as e:
        # Log or handle exception if db is None and CRUD fails. For now, pass.
        print(f"Could not create notification due to DB issue: {e}")

    return {
        "success": True,
        "message": f"Connection request {request_id} accepted. Notification sent to user {original_requester_id}."
    }

@router.get("/connections/requests") # Note: Path is /social/connections/requests
async def get_connection_requests(
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
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

# Analytics and Insights
@router.get("/analytics/network-insights") # Note: Path is /social/analytics...
async def get_network_insights(
    current_user: UserModel = Depends(get_current_active_user), # Use actual dependency
    db: Session = Depends(get_db)
):
    """Get AI-powered network growth insights"""
    
    insights = {
        "networkStrength": 89,
        "growthRate": 12,
        "engagementScore": 87,
        "recommendations": [
            {
                "type": "connection",
                "title": "Connect with more senior leaders",
                "description": "Expand your reach to C-level executives in your industry",
                "priority": "high",
                "impact": "network_growth"
            },
            {
                "type": "community",
                "title": "Join AI/ML communities",
                "description": "Your interest in AI shows potential for valuable connections",
                "priority": "medium",
                "impact": "skill_development"
            },
            {
                "type": "event",
                "title": "Attend more virtual events",
                "description": "Expand globally through virtual networking opportunities",
                "priority": "medium",
                "impact": "global_reach"
            }
        ],
        "networkAnalysis": {
            "industryCoverage": 78,
            "geographicDiversity": 65,
            "seniorityBalance": 82,
            "skillDiversity": 91
        }
    }
    
    return insights


# New Kudos Endpoint
@router.post("/users/{user_id}/kudos", response_model=Dict[str, Any])
async def give_kudos_to_user(
    user_id: int,
    db: Session = Depends(get_db),
    # current_user: UserModel = Depends(get_current_active_user) # Optional: if kudos can only be given by logged-in users
):
    """Give kudos to a user, incrementing their kudos_count."""
    user = crud.user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User to give kudos to not found")

    user.kudos_count = (user.kudos_count or 0) + 1

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Kudos given successfully", "kudos_count": user.kudos_count}


# Enhanced Social Collaboration Endpoints

# Real Project Data Endpoints
@router.post("/projects", response_model=Dict[str, Any])
async def create_collaboration_project(
    project_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Create a new collaboration project with real data"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        project = enhanced_service.create_collaboration_project(current_user.id, project_data)
        
        return {
            "success": True,
            "message": "Project created successfully",
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "category": project.category,
                "status": project.status.value,
                "created_at": project.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/projects/matches", response_model=Dict[str, Any])
async def get_real_project_matches(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get real project matches based on user skills"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        matches = enhanced_service.get_real_project_matches(current_user.id, limit)
        
        return {
            "matches": matches,
            "total": len(matches)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects/{project_id}/apply", response_model=Dict[str, Any])
async def apply_to_project(
    project_id: int,
    application_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Apply to join a collaboration project"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        application = enhanced_service.apply_to_project(project_id, current_user.id, application_data)
        
        return {
            "success": True,
            "message": "Application submitted successfully",
            "application_id": application.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Enhanced Peer Connection Endpoints
@router.post("/connections/request", response_model=Dict[str, Any])
async def send_enhanced_connection_request(
    recipient_id: int,
    message: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Send an enhanced connection request with optional message"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        connection = enhanced_service.send_peer_connection_request(
            current_user.id, recipient_id, message
        )
        
        return {
            "success": True,
            "message": "Connection request sent successfully",
            "connection_id": connection.id,
            "status": connection.status.value
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connections/{connection_id}/accept", response_model=Dict[str, Any])
async def accept_enhanced_connection_request(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Accept a connection request"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        connection = enhanced_service.accept_connection_request(connection_id, current_user.id)
        
        return {
            "success": True,
            "message": "Connection request accepted",
            "connection_id": connection.id,
            "status": connection.status.value
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Peer Messaging Endpoints
@router.post("/messages/{recipient_id}", response_model=Dict[str, Any])
async def send_peer_message(
    recipient_id: int,
    message_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Send a message to a connected peer"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        
        from ..models.social_collaboration import MessageType
        message_type = MessageType.TEXT
        if message_data.get("message_type") == "project_invite":
            message_type = MessageType.PROJECT_INVITE
        elif message_data.get("message_type") == "meeting_request":
            message_type = MessageType.MEETING_REQUEST
        
        message = enhanced_service.send_peer_message(
            current_user.id,
            recipient_id,
            message_data["content"],
            message_type,
            message_data.get("metadata")
        )
        
        return {
            "id": message.id,
            "sender_id": message.sender_id,
            "content": message.content,
            "message_type": message.message_type.value,
            "metadata": message.metadata,
            "created_at": message.created_at.isoformat(),
            "is_read": message.is_read
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{peer_id}", response_model=Dict[str, Any])
async def get_peer_messages(
    peer_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get messages with a connected peer"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        messages = enhanced_service.get_peer_messages(current_user.id, peer_id, limit)
        
        # Mark messages as read
        if messages:
            connection_id = messages[0].connection_id if messages else None
            if connection_id:
                enhanced_service.mark_messages_as_read(current_user.id, connection_id)
        
        message_list = []
        for msg in messages:
            message_list.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "message_type": msg.message_type.value,
                "metadata": msg.metadata,
                "created_at": msg.created_at.isoformat(),
                "is_read": msg.is_read
            })
        
        return {
            "messages": message_list,
            "connection_status": "connected",
            "total": len(message_list)
        }
    except Exception as e:
        return {
            "messages": [],
            "connection_status": "not_connected",
            "total": 0
        }


# Enhanced Peer Matching Endpoints
@router.get("/peer-matches/enhanced", response_model=Dict[str, Any])
async def get_enhanced_peer_matches(
    match_type: str = Query("skills", regex="^(skills|learning_partner)$"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get enhanced peer matches with improved algorithms"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        matches = enhanced_service.get_enhanced_peer_matches(current_user.id, match_type, limit)
        
        return {
            "matches": matches,
            "match_type": match_type,
            "total": len(matches)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Skill Endorsement Endpoints
@router.post("/skills/endorse", response_model=Dict[str, Any])
async def endorse_user_skill(
    endorsement_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Endorse a skill for another user"""
    try:
        enhanced_service = EnhancedSocialCollaborationService(db)
        endorsement = enhanced_service.endorse_skill(
            current_user.id,
            endorsement_data["endorsed_user_id"],
            endorsement_data["skill_name"],
            endorsement_data.get("proficiency_level"),
            endorsement_data.get("comment")
        )
        
        return {
            "success": True,
            "message": "Skill endorsed successfully",
            "endorsement_id": endorsement.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

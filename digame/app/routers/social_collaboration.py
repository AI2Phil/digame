"""
Social Collaboration API Router
Handles peer matching, networking, mentorship, and team collaboration endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from ..models.user import User as UserModel
from ..schemas.user_schemas import User as UserSchema # Added UserSchema import
from .. import crud
from ..database import get_db
from ..auth.auth_dependencies import get_current_active_user
import json # Ensure json is imported

# Mock permission check - can be removed if not used by new endpoints or replaced by actual RBAC
def require_permission(permission: str, user: UserModel):
    """Mock permission check"""
    # Replace with actual RBAC logic if needed
    print(f"Checking permission {permission} for user {user.id}")
    return True

router = APIRouter(
    prefix="/social",
    tags=["Social Collaboration"],
    responses={404: {"description": "Not found"}}, # Added a default 404 response
)

# Peer Matching Endpoints
# Removed old mock endpoint: /users/{user_id}/peer-matches

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
    current_user_skills_str = current_user.skills
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

        other_user_skills_str = other_user.skills
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
@router.get("/users/{user_id}/team-analytics")
async def get_team_analytics(
    user_id: int,
    time_range: str = Query("month", regex="^(week|month|quarter|year)$"),
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
    
    # Mock connection request logic
    return {
        "success": True,
        "message": f"Connection request sent to user {peer_id}",
        "requestId": f"req_{current_user.id}_{peer_id}_{int(datetime.now().timestamp())}"
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

# User Profile for Social Features - This endpoint is being removed as per instructions.
# @router.get("/users/{user_id}/profile")
# async def get_social_profile(...) -> This is removed.

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
    db: Session = Depends(get_db)
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
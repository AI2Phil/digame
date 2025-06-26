"""
Social Collaboration API Router
Handles peer matching, user profile updates for social features, and other related endpoints.
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
# Project model is not directly used here anymore for creating ProjectSchema instances
# from ..models.project import Project 
from ..schemas.user_profile_schemas import UserProfileUpdate, UserProfileResponse, UserWithProfileResponse
from ..schemas.user_schemas import User as UserSchema
from ..services.social_collaboration_service import SocialCollaborationService
from ..crud import user_crud, notification_crud, project_crud # Added project_crud
from .. import crud
from ..schemas.notification_schemas import NotificationCreate
from ..auth.auth_dependencies import get_current_active_user

from sqlalchemy import or_ # For ORM queries in routes if needed, though logic is in service

# Import project schemas
from ..schemas.project_schemas import ProjectMatchResponse, Project as ProjectSchema, ProjectMatch
from ..schemas.user_schemas import User as UserResponseSchema
from ..schemas.communication_schemas import MessageCreate, MessageResponse, ConversationResponse # Communication schemas


# Define a response model for networking opportunities
class NetworkingOpportunityDetail(BaseModel):
    name: str
    # bio: Optional[str] = None # Add more fields as needed for frontend
    # linkedin_url: Optional[str] = None

class NetworkingOpportunity(BaseModel):
    user: UserResponseSchema # Use the existing User schema for the user part
    score: int
    reasons: List[str]
    details: NetworkingOpportunityDetail

class NetworkingOpportunitiesResponse(BaseModel):
    opportunities: List[NetworkingOpportunity]
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
        # Skills in User model might be a JSON string, or already parsed list.
        # Assuming User model's skills attribute is List[str] or parsed by User schema
        if isinstance(user_entity.skills, str):
            try:
                user_skills = json.loads(user_entity.skills)
            except json.JSONDecodeError:
                user_skills = [] # Fallback for malformed JSON
        elif isinstance(user_entity.skills, list):
            user_skills = user_entity.skills
        else:
            user_skills = []
    else: # If the object truly has no skills attr or it's None/empty
        user_skills = ["python", "react"] # Default if no skills found on user object

    # Fetch projects from the database using the project_crud
    db_projects = project_crud.get_projects(db, limit=1000) # Adjust limit as necessary

    matches = []
    for project_model in db_projects:
        # Ensure project_model.required_skills is a list of strings
        # The Project model stores required_skills as JSON, so it might be string or already parsed by SQLAlchemy type decorator/schema
        project_req_skills_list = []
        if isinstance(project_model.required_skills, str):
            try:
                project_req_skills_list = json.loads(project_model.required_skills)
            except json.JSONDecodeError:
                project_req_skills_list = [] # Malformed JSON
        elif isinstance(project_model.required_skills, list):
            project_req_skills_list = project_model.required_skills
        
        project_req_skills_set = set(s.lower() for s in project_req_skills_list if isinstance(s, str))
        user_skills_set = set(s.lower() for s in user_skills if isinstance(s, str))

        matching_skills = list(user_skills_set.intersection(project_req_skills_set))
        missing_skills = list(project_req_skills_set.difference(user_skills_set))

        if matching_skills: # Consider it a match if there's at least one skill in common
            # Convert the SQLAlchemy Project model to a Pydantic ProjectSchema
            # This handles the conversion of JSON fields like technologiesUsed and required_skills if they are strings
            project_schema = ProjectSchema.model_validate(project_model)
            match_data = {
                "project": project_schema,
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


@router.get("/users/{user_id}/networking-opportunities", response_model=NetworkingOpportunitiesResponse)
async def get_networking_opportunities_for_user(
    user_id: int,
    limit: int = Query(10, ge=1, le=100, description="Number of opportunities to return"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # Ensure user is authenticated
):
    """
    Get networking opportunities for a given user.
    Requires the authenticated user to be the user_id in the path or an admin (not implemented yet).
    """
    if current_user.id != user_id:
        # Add RBAC check here if admins should be allowed to see this for other users
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this resource")

    service = SocialCollaborationService(db)
    opportunities_data = service.get_networking_opportunities(user_id=user_id, limit=limit)

    # Convert user models in opportunities_data to UserResponseSchema
    processed_opportunities = []
    for opp_data in opportunities_data:
        user_model = opp_data["user"]
        # user_response = UserResponseSchema.from_orm(user_model) # old pydantic v1
        user_response = UserResponseSchema.model_validate(user_model) # pydantic v2
        processed_opportunities.append(NetworkingOpportunity(
            user=user_response,
            score=opp_data["score"],
            reasons=opp_data["reasons"],
            details=NetworkingOpportunityDetail(**opp_data["details"])
        ))

    return NetworkingOpportunitiesResponse(
        opportunities=processed_opportunities,
        total=len(processed_opportunities)
    )

# --- Communication Endpoints ---

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_new_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Send a message to another user.
    """
    service = SocialCollaborationService(db)
    try:
        # The service method `send_message` expects sender_id and message_data (which includes receiver_id)
        created_message_model = service.send_message(sender_id=current_user.id, message_data=message_data)
        
        # Enrich with sender details for the response
        sender_details_for_response = None
        if created_message_model.sender: # Sender should always exist
             sender_details_for_response = {
                "id": created_message_model.sender.id,
                "username": created_message_model.sender.username,
                "first_name": created_message_model.sender.first_name,
                "last_name": created_message_model.sender.last_name,
            }

        return MessageResponse(
            id=created_message_model.id,
            sender_id=created_message_model.sender_id,
            receiver_id=created_message_model.receiver_id,
            content=created_message_model.content,
            timestamp=created_message_model.timestamp,
            is_read=created_message_model.is_read,
            sender=sender_details_for_response # Pass the dict here, Pydantic will validate
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e: # Catch other potential errors
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not send message.")


@router.get("/messages/{peer_id}", response_model=List[MessageResponse])
async def get_messages_with_peer(
    peer_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get conversation history with a specific peer.
    Messages received by the current user in this fetch will be marked as read.
    """
    service = SocialCollaborationService(db)
    if current_user.id == peer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot get conversation with oneself.")

    message_models = service.get_conversation_history(user1_id=current_user.id, user2_id=peer_id, skip=skip, limit=limit)
    
    response_messages = []
    for msg_model in message_models:
        sender_details = None
        # Sender object might not be eagerly loaded by default depending on SQLAlchemy relationship config.
        # Explicitly fetching or ensuring it's loaded by the service/CRUD is better.
        # For now, assume msg_model.sender is available if sender_id exists.
        if msg_model.sender: # Check if sender relationship is loaded
            sender_details = {
                "id": msg_model.sender.id,
                "username": msg_model.sender.username,
                "first_name": msg_model.sender.first_name,
                "last_name": msg_model.sender.last_name,
            }
        elif msg_model.sender_id: # Fallback if sender object not loaded, fetch manually
            sender_user = user_crud.get_user(db, user_id=msg_model.sender_id)
            if sender_user:
                sender_details = {
                    "id": sender_user.id,
                    "username": sender_user.username,
                    "first_name": sender_user.first_name,
                    "last_name": sender_user.last_name,
                }

        response_messages.append(MessageResponse(
            id=msg_model.id,
            sender_id=msg_model.sender_id,
            receiver_id=msg_model.receiver_id,
            content=msg_model.content,
            timestamp=msg_model.timestamp,
            is_read=msg_model.is_read, # is_read status reflects state *after* service call
            sender=sender_details
        ))
    return response_messages


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_my_conversations(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    List all active conversations for the current user.
    """
    service = SocialCollaborationService(db)
    # The service method list_user_conversations already returns List[ConversationResponse]
    # So, direct pass-through is possible if the service constructs the full ConversationResponse correctly.
    # The current service implementation for list_user_conversations might need adjustment
    # to perfectly match the ConversationResponse schema (especially the `messages` part).
    return service.list_user_conversations(user_id=current_user.id, limit=limit)

@router.post("/messages/{peer_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_messages_from_peer_as_read(
    peer_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Mark all unread messages received from peer_id as read.
    """
    service = SocialCollaborationService(db)
    if current_user.id == peer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid operation for oneself.")

    updated_count = service.mark_conversation_as_read(current_user_id=current_user.id, peer_user_id=peer_id)
    # Optionally return updated_count in a JSON response if 204 is not desired.
    return None # For 204 response

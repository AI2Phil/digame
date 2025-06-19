"""
Social Collaboration API Router
Handles peer matching, networking, mentorship, and team collaboration endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

# Import from the correct paths based on the project structure
try:
    # Attempt to import real models and CRUDs first
    from ..models.user import User
    from ..models.connection import ConnectionRequest # Added
    from ..crud.user_crud import get_user as app_get_user # Renamed to avoid conflict if mock get_user is used
    from ..crud import connection_crud # Added
    from ..schemas.connection_schemas import ConnectionRequestOut, UserBasicOut, ConnectionRequestCreate # Added ConnectionRequestCreate
    # get_db and get_current_user will be attempted from actual sources if available
    # Fallback mocks are below for these, but ideally, they should be replaced by real dependencies.
except ImportError:
    print("CRITICAL: Failed to import core components for social_collaboration router. Using extensive mocks.")
    # Fallback for development - create mock classes
    class User: # Simplified mock
        def __init__(self, id=0, email="mock@example.com", full_name="Mock User"):
            self.id = id
            self.email = email
            self.full_name = full_name
            self.sent_connection_requests = []
            self.received_connection_requests = []

    class ConnectionRequest: # Simplified mock
        def __init__(self, id=0, requester_id=0, approver_id=0, status="pending", created_at=None, updated_at=None):
            self.id = id
            self.requester_id = requester_id
            self.approver_id = approver_id
            self.status = status
            self.created_at = created_at or datetime.utcnow()
            self.updated_at = updated_at or datetime.utcnow()
            self.requester = User(id=requester_id, full_name=f"Requester {requester_id}")
            self.approver = User(id=approver_id, full_name=f"Approver {approver_id}")

    def app_get_user(db_session, user_id: int) -> Optional[User]: # Renamed mock
        if user_id <= 0: return None
        print(f"Mock app_get_user: Retrieving user {user_id}")
        return User(id=user_id, full_name=f"Mock User {user_id}")

    class MockConnectionCrud:
        _requests_db = {}
        _next_id = 1

        def create_connection_request(self, db: Session, requester_id: int, approver_id: int) -> ConnectionRequest:
            print(f"Mock CRUD: Creating connection request from {requester_id} to {approver_id}")
            if requester_id == approver_id: raise ValueError("Cannot connect to self")
            for req_id, req_val in self._requests_db.items():
                if ((req_val.requester_id == requester_id and req_val.approver_id == approver_id) or \
                    (req_val.requester_id == approver_id and req_val.approver_id == requester_id)) and \
                   req_val.status in ['pending', 'accepted']:
                    raise ValueError("A pending or accepted connection request already exists.")

            new_req = ConnectionRequest(id=self._next_id, requester_id=requester_id, approver_id=approver_id)
            new_req.requester = app_get_user(db, requester_id) # Use potentially mocked app_get_user
            new_req.approver = app_get_user(db, approver_id) # Use potentially mocked app_get_user
            self._requests_db[self._next_id] = new_req
            self._next_id += 1
            return new_req

        def get_pending_connection_requests_for_user(self, db: Session, user_id: int) -> List[ConnectionRequest]:
            print(f"Mock CRUD: Getting pending requests for user {user_id}")
            return [req for req_id, req in self._requests_db.items() if req.approver_id == user_id and req.status == 'pending']

        def get_connection_request_by_id(self, db: Session, request_id: int) -> Optional[ConnectionRequest]:
            print(f"Mock CRUD: Getting request by id {request_id}")
            return self._requests_db.get(request_id)

        def update_connection_request_status(self, db: Session, request_id: int, new_status: str) -> Optional[ConnectionRequest]:
            print(f"Mock CRUD: Updating request {request_id} to {new_status}")
            req = self._requests_db.get(request_id)
            if req:
                req.status = new_status
                req.updated_at = datetime.utcnow()
                return req
            return None

        def get_connections_for_user(self, db: Session, user_id: int) -> List[User]:
            print(f"Mock CRUD: Getting connections for user {user_id}")
            connected_users = []
            for req_id, req in self._requests_db.items():
                if req.status == 'accepted':
                    if req.requester_id == user_id:
                        connected_users.append(req.approver)
                    elif req.approver_id == user_id:
                        connected_users.append(req.requester)
            return connected_users

    connection_crud = MockConnectionCrud()
    # End of extended mock setup

# Attempt to get real dependencies, fall back to mocks if necessary
try:
    from ..dependencies import get_db, get_current_user # Assuming these exist for real app
except ImportError:
    print("Warning: Using mock get_db and get_current_user for social_collaboration router.")
    def get_db():
        """Mock database session"""
        return None # Real CRUD functions will need a real session.

    def get_current_user():
        """Mock current user"""
        # Ensure this mock User is compatible with what ConnectionRequestOut expects
        return User(id=1, email="current_mock@example.com", full_name="Current Mock User")


def require_permission(permission: str, user: User):
    """Mock permission check"""
    # This should ideally use the User model from the initial import attempt
    print(f"Mock permission check for user {user.id} and permission {permission}")
    return True

router = APIRouter(prefix="/social", tags=["social-collaboration"])
# Note: The 'get_user' used by old endpoints is the one from the initial try-except.
# New endpoints should use 'app_get_user' if they intend to use the (potentially mocked) user fetching logic.
# For clarity, it's better if the real get_user is consistently named and imported.
# For this refactor, I will assume new endpoints use 'app_get_user' for fetching user details.

# Peer Matching Endpoints
@router.get("/users/{user_id}/peer-matches")
async def get_peer_matches(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    skill_filter: Optional[str] = None,
    experience_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered peer matches for a user"""
    
    # Verify user access
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    # Mock peer matching algorithm results
    mock_matches = [
        {
            "id": 1,
            "name": "Alex Brown",
            "title": "Product Manager",
            "company": "TechCorp",
            "initials": "AB",
            "compatibilityScore": 94,
            "sharedSkills": 5,
            "skills": ["Product Strategy", "User Research", "Agile", "Data Analysis"],
            "skills_looking_for": ["Python", "Machine Learning"],
            "experience": "5+ years",
            "location": "San Francisco, CA",
            "matchReason": "Excellent skill complementarity and aligned career goals",
            "mutualConnections": 8,
            "projects": [
                {"name": "AI Chatbot", "technologiesUsed": ["Python", "NLP", "FastAPI"]},
                {"name": "Data Analytics Platform", "technologiesUsed": ["SQL", "Tableau", "Python"]}
            ]
        },
        {
            "id": 2,
            "name": "Sarah Chen",
            "title": "UX Designer",
            "company": "DesignStudio",
            "initials": "SC",
            "compatibilityScore": 89,
            "sharedSkills": 3,
            "skills": ["UI/UX Design", "Figma", "User Testing", "Design Systems"],
            "skills_looking_for": ["React", "JavaScript"],
            "experience": "4+ years",
            "location": "Remote",
            "matchReason": "Similar learning preferences and compatible work styles",
            "mutualConnections": 5,
            "projects": [
                {"name": "E-commerce Website", "technologiesUsed": ["React", "Node.js", "MongoDB"]}
            ]
        },
        {
            "id": 3,
            "name": "Mike Johnson",
            "title": "DevOps Engineer",
            "company": "CloudTech",
            "initials": "MJ",
            "compatibilityScore": 87,
            "sharedSkills": 4,
            "skills": ["AWS", "Docker", "Kubernetes", "CI/CD"],
            "skills_looking_for": ["Go", "Terraform"],
            "experience": "6+ years",
            "location": "New York, NY",
            "matchReason": "Complementary technical skills and shared interests",
            "mutualConnections": 12,
            "projects": [
                {"name": "Cloud Infrastructure Automation", "technologiesUsed": ["Terraform", "AWS CDK", "Python"]},
                {"name": "Microservices Deployment", "technologiesUsed": ["Kubernetes", "Docker", "Jenkins"]}
            ]
        }
    ]
    
    # Apply filters if provided
    # TODO: Enhance filtering logic to include technologiesUsed and skills_looking_for
    filtered_matches = mock_matches
    if skill_filter and isinstance(skill_filter, str):
        current_filtered_matches = []
        for m in filtered_matches: # Iterate over the current state of filtered_matches
            skills = m.get("skills", [])
            if isinstance(skills, list):
                for skill in skills:
                    if isinstance(skill, str) and skill_filter.lower() in skill.lower():
                        current_filtered_matches.append(m)
                        break
            # Also check in technologiesUsed
            projects = m.get("projects", [])
            for project in projects:
                technologies = project.get("technologiesUsed", [])
                if isinstance(technologies, list):
                    for tech in technologies:
                        if isinstance(tech, str) and skill_filter.lower() in tech.lower() and m not in current_filtered_matches:
                            current_filtered_matches.append(m)
                            break # out of tech loop
                if m in current_filtered_matches:
                    break # out of project loop
            # Also check in skills_looking_for
            skills_needed = m.get("skills_looking_for", [])
            if isinstance(skills_needed, list):
                for skill_needed in skills_needed:
                    if isinstance(skill_needed, str) and skill_filter.lower() in skill_needed.lower() and m not in current_filtered_matches:
                        current_filtered_matches.append(m)
                        break
        filtered_matches = current_filtered_matches

    if experience_filter and isinstance(experience_filter, str):
        # Assuming experience is a string like "X+ years"
        # This is a simplified filter, real implementation might need parsing
        current_filtered_matches = []
        for m in filtered_matches:
            experience = m.get("experience", "")
            if isinstance(experience, str) and experience_filter.lower() in experience.lower():
                current_filtered_matches.append(m)
        filtered_matches = current_filtered_matches

    # Pagination logic
    offset = (page - 1) * page_size
    paginated_matches = filtered_matches[offset : offset + page_size]

    return {"matches": paginated_matches, "total": len(filtered_matches), "page": page, "page_size": page_size}

@router.get("/users/{user_id}/skill-matches")
async def get_skill_based_matches(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skill-based peer matches using advanced algorithms"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    # Enhanced skill matching results
    # Mock data representing potential users and their project-related skills
    # User making the request (user_id) is implicitly user 1 (current_user)
    # We are finding matches FOR this current_user.

    current_user_profile = { # Representing the user for whom we are finding matches
        "id": current_user.id,
        "name": current_user.full_name,
        "skills": ["Python", "FastAPI", "Product Management"], # General skills
        "projects": [
            {
                "name": "Core Platform API",
                "technologiesUsed": ["Python", "FastAPI", "Docker"],
                "core_skills": ["Python", "API Design"], # Skills this user values highly for this project
                "skills_to_avoid": ["Java", "Legacy Systems"] # Skills that indicate a bad fit FOR THIS USER'S PROJECT
            }
        ],
        "skills_looking_for": ["React", "Data Analysis"] # Skills the current user is seeking in others
    }

    potential_matches_data = [
        {
            "id": 1, # This is Alex Brown, but should be different from current_user for a real match
            "name": "Alex Brown", # Assuming this is a different Alex Brown or different user
            "title": "Product Manager",
            "initials": "AB",
            "skills": ["Product Strategy", "Market Research", "Agile", "Data Analysis", "Python"],
            "projects": [
                {
                    "name": "AI Chatbot",
                    "technologiesUsed": ["Python", "NLP", "FastAPI"],
                    "core_skills": ["Python", "NLP"],
                    "skills_to_avoid": ["Monolithic Design"]
                }
            ],
            # Fields to be calculated by the "matching algorithm"
            "compatibilityScore": 0,
            "sharedSkillsCount": 0,
            "complementarySkills": [],
            "skillGaps": [], # Skills current_user has that this match lacks (relevant to current_user's needs)
            "learningOpportunities": [], # Skills this match has that current_user might want
            "collaborationPotential": "low" # To be determined
        },
        {
            "id": 4, # Emily Davis
            "name": "Emily Davis",
            "title": "Data Scientist",
            "initials": "ED",
            "skills": ["Machine Learning", "Statistics", "Python", "R", "Tableau"],
            "projects": [
                {
                    "name": "Analytics Dashboard",
                    "technologiesUsed": ["Python", "Tableau", "SQL"],
                    "core_skills": ["Machine Learning", "Statistics"],
                    "skills_to_avoid": ["Excel-only analysis"]
                },
                {
                    "name": "Fraud Detection System",
                    "technologiesUsed": ["Python", "TensorFlow", "SkaLearn"],
                    "core_skills": ["Python", "Machine Learning"],
                    "skills_to_avoid": ["Java"]
                }
            ],
            "compatibilityScore": 0,
            "sharedSkillsCount": 0,
            "complementarySkills": [],
            "skillGaps": [],
            "learningOpportunities": [],
            "collaborationPotential": "low"
        },
        {
            "id": 5,
            "name": "John Doe",
            "title": "Frontend Developer",
            "initials": "JD",
            "skills": ["React", "JavaScript", "CSS", "HTML", "Java"], # Has "Java" which current_user wants to avoid
             "projects": [
                {
                    "name": "E-commerce UI",
                    "technologiesUsed": ["React", "Redux", "CSS"],
                    "core_skills": ["React", "JavaScript"],
                    "skills_to_avoid": ["AngularJS"]
                }
            ],
            "compatibilityScore": 0,
            "sharedSkillsCount": 0,
            "complementarySkills": [],
            "skillGaps": [],
            "learningOpportunities": [],
            "collaborationPotential": "low"
        }
    ]
    
    processed_matches = []

    # --- Basic Mock Matching Algorithm ---
    for match_candidate in potential_matches_data:
        if match_candidate["id"] == current_user_profile["id"]: # Don't match with self
            continue

        score = 50 # Base score
        shared_skills_set = set()
        candidate_all_skills = set(match_candidate.get("skills", []))
        for proj in match_candidate.get("projects", []):
            candidate_all_skills.update(proj.get("technologiesUsed", []))

        # Negative Matching: Check against current_user's project skills_to_avoid
        # This is a simplified check. A real system would be more nuanced.
        should_exclude = False
        for user_project in current_user_profile.get("projects", []):
            for skill_to_avoid in user_project.get("skills_to_avoid", []):
                if skill_to_avoid in candidate_all_skills:
                    score -= 50 # Heavy penalty
                    should_exclude = True # For stricter exclusion
                    break
            if should_exclude:
                break

        if should_exclude: # Option to completely exclude
            # continue # Uncomment to strictly exclude
            pass # Or just heavily penalize, as done above

        # Consider skills current_user is looking for
        for skill_needed in current_user_profile.get("skills_looking_for", []):
            if skill_needed in candidate_all_skills:
                score += 20 # Bonus for providing a needed skill
                shared_skills_set.add(skill_needed)
                match_candidate["learningOpportunities"].append(skill_needed) # current_user learns this

        # Consider shared skills based on current_user's skills and project technologies
        current_user_all_skills = set(current_user_profile.get("skills", []))
        for proj in current_user_profile.get("projects", []):
            current_user_all_skills.update(proj.get("technologiesUsed", []))

        for skill in current_user_all_skills:
            if skill in candidate_all_skills:
                score += 10
                shared_skills_set.add(skill)
                # Check if it's a core skill for the candidate
                for candidate_proj in match_candidate.get("projects", []):
                    if skill in candidate_proj.get("core_skills", []):
                        score += 10 # Extra weight for core skill
                        break

        match_candidate["sharedSkillsCount"] = len(shared_skills_set)

        # Complementary skills (skills candidate has that current_user doesn't but might value)
        # This is a simplified interpretation
        for cs in candidate_all_skills:
            if cs not in current_user_all_skills and cs not in shared_skills_set:
                 # Check if this skill is generally desirable or related to current user's field
                if cs in ["AI/ML Fundamentals", "Data Science", "Deep Learning", "MLOps", "React", "Node.js"]: # Example desirable skills
                    match_candidate["complementarySkills"].append(cs)


        # Skill Gaps (skills current_user is looking for, that candidate LACKS)
        for needed_skill in current_user_profile.get("skills_looking_for", []):
            if needed_skill not in candidate_all_skills:
                match_candidate["skillGaps"].append(needed_skill)

        match_candidate["compatibilityScore"] = max(0, min(100, score)) # Normalize score

        if match_candidate["compatibilityScore"] > 70:
            match_candidate["collaborationPotential"] = "high"
        elif match_candidate["compatibilityScore"] > 50:
            match_candidate["collaborationPotential"] = "medium"
        else:
            match_candidate["collaborationPotential"] = "low"
            if score < 0 : # If heavily penalized by skills_to_avoid
                 match_candidate["collaborationPotential"] = "very-low"


        # Filter out based on a threshold if not already excluded
        if should_exclude and match_candidate["compatibilityScore"] < 20: # Example: if negative match makes score too low
             continue

        processed_matches.append(match_candidate)

    # Sort by compatibility score
    processed_matches.sort(key=lambda x: x["compatibilityScore"], reverse=True)

    return {"skillMatches": processed_matches}

# Professional Networking Endpoints
@router.get("/users/{user_id}/industry-connections")
async def get_industry_connections(
    user_id: int,
    industry: Optional[str] = None,
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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

# Connection Management Endpoints (New Implementation)

@router.post("/connections/request/{receiver_user_id}", response_model=ConnectionRequestOut)
async def send_connection_request_endpoint(
    receiver_user_id: int,
    current_user: User = Depends(get_current_user), # User from initial import or mock
    db: Session = Depends(get_db)
):
    """
    Send a connection request to another user.
    """
    # Ensure db is available if not using full mock CRUD
    if db is None and not isinstance(connection_crud, MockConnectionCrud):
        print("Error: Database session not available and not using full mock CRUD.")
        raise HTTPException(status_code=500, detail="Database session not available.")

    # Use app_get_user which is either real or the new mock
    receiver_user = app_get_user(db_session=db, user_id=receiver_user_id)
    if not receiver_user:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    if current_user.id == receiver_user_id:
        raise HTTPException(status_code=400, detail="Cannot send a connection request to yourself")

    try:
        # connection_crud is either real or the MockConnectionCrud instance
        db_connection_request = connection_crud.create_connection_request(
            db=db,
            requester_id=current_user.id,
            approver_id=receiver_user_id
        )
        # For ConnectionRequestOut to work, db_connection_request must have 'requester' and 'approver' attributes
        # that are User-like objects. This is handled by SQLAlchemy relationships or the mock model.
        return db_connection_request
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error sending connection request: {e}") # Basic logging
        raise HTTPException(status_code=500, detail="Could not send connection request")


@router.get("/connections/requests", response_model=List[ConnectionRequestOut])
async def get_pending_requests_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all pending connection requests for the current user (where current user is the approver).
    """
    if db is None and not isinstance(connection_crud, MockConnectionCrud):
        raise HTTPException(status_code=500, detail="Database session not available.")

    pending_requests = connection_crud.get_pending_connection_requests_for_user(
        db=db,
        user_id=current_user.id
    )
    return pending_requests


@router.post("/connections/requests/{request_id}/accept", response_model=ConnectionRequestOut)
async def accept_connection_request_endpoint(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept a connection request.
    """
    if db is None and not isinstance(connection_crud, MockConnectionCrud):
        raise HTTPException(status_code=500, detail="Database session not available.")

    db_connection_request = connection_crud.get_connection_request_by_id(db=db, request_id=request_id)

    if not db_connection_request:
        raise HTTPException(status_code=404, detail="Connection request not found")

    if db_connection_request.approver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this request")

    if db_connection_request.status != 'pending':
        raise HTTPException(status_code=400, detail=f"Request is no longer pending (status: {db_connection_request.status})")

    try:
        updated_request = connection_crud.update_connection_request_status(
            db=db,
            request_id=request_id,
            new_status='accepted'
        )
        if not updated_request: # Should not happen if previous checks passed
             raise HTTPException(status_code=404, detail="Connection request could not be updated.")
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error accepting connection request: {e}")
        raise HTTPException(status_code=500, detail="Could not accept connection request")


@router.post("/connections/requests/{request_id}/reject", response_model=ConnectionRequestOut)
async def reject_connection_request_endpoint(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a connection request.
    """
    if db is None and not isinstance(connection_crud, MockConnectionCrud):
        raise HTTPException(status_code=500, detail="Database session not available.")

    db_connection_request = connection_crud.get_connection_request_by_id(db=db, request_id=request_id)

    if not db_connection_request:
        raise HTTPException(status_code=404, detail="Connection request not found")

    if db_connection_request.approver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this request")

    if db_connection_request.status != 'pending':
        raise HTTPException(status_code=400, detail=f"Request is no longer pending (status: {db_connection_request.status})")

    try:
        updated_request = connection_crud.update_connection_request_status(
            db=db,
            request_id=request_id,
            new_status='rejected'
        )
        if not updated_request: # Should not happen
             raise HTTPException(status_code=404, detail="Connection request could not be updated.")
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error rejecting connection request: {e}")
        raise HTTPException(status_code=500, detail="Could not reject connection request")


@router.get("/connections", response_model=List[UserBasicOut])
async def get_established_connections_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a list of users connected to the current user.
    """
    if db is None and not isinstance(connection_crud, MockConnectionCrud):
        raise HTTPException(status_code=500, detail="Database session not available.")

    connected_users = connection_crud.get_connections_for_user(db=db, user_id=current_user.id)
    # UserBasicOut schema will map fields from the User model objects.
    # This relies on the User objects returned by get_connections_for_user having id, full_name, email.
    return connected_users


# User Profile for Social Features
@router.get("/users/{user_id}/profile")
async def get_social_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's social collaboration profile"""
    
    if current_user.id != user_id:
        require_permission("view_user_data", current_user)
    
    # Get user from database
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock enhanced profile data
    profile = {
        "id": user.id,
        "name": user.full_name or "John Doe",
        "email": user.email,
        "title": "Senior Software Engineer",
        "company": "Tech Innovation Corp",
        "initials": "".join([n[0] for n in (user.full_name or "John Doe").split()]),
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

# Analytics and Insights
@router.get("/analytics/network-insights")
async def get_network_insights(
    current_user: User = Depends(get_current_user),
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
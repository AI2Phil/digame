"""
Comprehensive Mentorship Program Platform Service
Implements mentor-mentee matching, structured programs, progress tracking, and analytics
"""

import json
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Set
from sqlalchemy import or_, and_, func
from datetime import datetime, timedelta, timezone
from enum import Enum

from ..models.user import User
from ..models.imports import UserProfile
from ..models.social_collaboration import MentorshipConnection
from ..crud import user_crud
from ..schemas.mentorship_schemas import (
    MentorshipProgramCreate, MentorshipProgramResponse, MentorApplicationCreate,
    MentorApplicationResponse, MentorshipMatchResponse, MentorshipProgressUpdate,
    MentorshipAnalytics, MentorQualificationCreate, MentorQualificationResponse
)


class MentorshipProgramType(Enum):
    """Types of mentorship programs available"""
    CAREER_DEVELOPMENT = "career_development"
    SKILL_BUILDING = "skill_building"
    LEADERSHIP = "leadership"
    TECHNICAL_EXPERTISE = "technical_expertise"
    ENTREPRENEURSHIP = "entrepreneurship"
    INDUSTRY_TRANSITION = "industry_transition"


class MentorshipService:
    def __init__(self, db: Session):
        self.db = db

    def _get_user_skills(self, user_id: int) -> Set[str]:
        """Helper to fetch and parse user skills into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'skills', None):  # type: ignore
            return set()

        skills_data = getattr(profile, 'skills', None)  # type: ignore
        if isinstance(skills_data, str):
            try:
                skills_list = json.loads(skills_data)
            except json.JSONDecodeError:
                return set()
        elif isinstance(skills_data, list):
            skills_list = skills_data
        else:
            return set()

        parsed_skills = set()
        if isinstance(skills_list, list):
            for item in skills_list:
                if isinstance(item, dict) and "skill" in item:
                    parsed_skills.add(item["skill"].lower())
                elif isinstance(item, str):
                    parsed_skills.add(item.lower())
        return parsed_skills

    def _get_user_learning_goals(self, user_id: int) -> Set[str]:
        """Helper to fetch and parse user learning goals into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'learning_goals', None):  # type: ignore
            return set()

        learning_goals_data = getattr(profile, 'learning_goals', None)  # type: ignore
        if isinstance(learning_goals_data, str):
            try:
                goals_list = json.loads(learning_goals_data)
                if isinstance(goals_list, list):
                    return {str(goal).lower() for goal in goals_list}
            except json.JSONDecodeError:
                return set()
        elif isinstance(learning_goals_data, list):
            return {str(goal).lower() for goal in learning_goals_data}
        return set()

    def find_mentor_matches(self, mentee_id: int, program_type: Optional[str] = None, limit: int = 10) -> List[MentorshipMatchResponse]:
        """
        Find potential mentors for a mentee based on skills, experience, and preferences
        """
        mentee_profile = user_crud.get_user_profile(self.db, user_id=mentee_id)
        if not mentee_profile:
            return []

        mentee_learning_goals = self._get_user_learning_goals(mentee_id)
        mentee_interests = self._get_user_interests(mentee_id)

        # Find users willing to mentor
        potential_mentors = self.db.query(User).join(UserProfile).filter(
            UserProfile.mentorship_preferences.isnot(None),
            User.id != mentee_id
        ).all()

        matches = []
        for mentor_user in potential_mentors:
            mentor_profile = user_crud.get_user_profile(self.db, mentor_user.id)
            if not mentor_profile or not getattr(mentor_profile, 'mentorship_preferences', None):  # type: ignore
                continue

            mentorship_prefs = getattr(mentor_profile, 'mentorship_preferences', {})  # type: ignore
            if not isinstance(mentorship_prefs, dict) or not mentorship_prefs.get("willing_to_mentor"):
                continue

            # Calculate match score
            score = 0
            match_reasons = []

            # Skills alignment
            mentor_user_id = getattr(mentor_user, 'id', None)  # type: ignore
            if mentor_user_id is None:
                continue
            mentor_skills = self._get_user_skills(mentor_user_id)
            if mentor_skills and mentee_learning_goals:
                skill_overlap = mentor_skills.intersection(mentee_learning_goals)
                if skill_overlap:
                    score += len(skill_overlap) * 3
                    match_reasons.append(f"Can teach: {', '.join(skill_overlap)}")

            # Mentorship topics alignment
            mentor_topics = set()
            if isinstance(mentorship_prefs.get("topics"), list):
                mentor_topics = {topic.lower() for topic in mentorship_prefs["topics"]}
            
            if mentor_topics and mentee_learning_goals:
                topic_overlap = mentor_topics.intersection(mentee_learning_goals)
                if topic_overlap:
                    score += len(topic_overlap) * 2
                    match_reasons.append(f"Mentorship expertise: {', '.join(topic_overlap)}")

            # Program type preference
            if program_type and mentorship_prefs.get("preferred_program_types"):
                if program_type in mentorship_prefs["preferred_program_types"]:
                    score += 2
                    match_reasons.append(f"Specializes in {program_type}")

            # Experience level compatibility
            mentor_experience = mentorship_prefs.get("experience_level", "")
            mentee_prefs = getattr(mentee_profile, 'mentorship_preferences', {})  # type: ignore
            mentee_experience = mentee_prefs.get("seeking_experience_level", "") if mentee_prefs else ""
            if mentor_experience and mentee_experience and mentor_experience == mentee_experience:
                score += 1
                match_reasons.append("Experience level match")

            # Availability alignment
            mentor_availability = mentorship_prefs.get("availability", {})
            mentee_availability = mentee_prefs.get("availability", {}) if mentee_prefs else {}
            if self._check_availability_overlap(mentor_availability, mentee_availability):
                score += 1
                match_reasons.append("Schedule compatibility")

            if score > 0:
                mentor_first_name = getattr(mentor_user, 'first_name', '') or ''  # type: ignore
                mentor_last_name = getattr(mentor_user, 'last_name', '') or ''  # type: ignore
                mentor_username = getattr(mentor_user, 'username', '')  # type: ignore
                mentor_bio = getattr(mentor_profile, 'bio', '') or ''  # type: ignore
                
                match_response = MentorshipMatchResponse()  # type: ignore
                setattr(match_response, 'mentor_id', mentor_user_id)  # type: ignore
                setattr(match_response, 'mentor_name', f"{mentor_first_name} {mentor_last_name}".strip() or mentor_username)  # type: ignore
                setattr(match_response, 'mentor_bio', mentor_bio)  # type: ignore
                setattr(match_response, 'match_score', score)  # type: ignore
                setattr(match_response, 'match_reasons', match_reasons)  # type: ignore
                setattr(match_response, 'mentor_skills', list(mentor_skills))  # type: ignore
                setattr(match_response, 'mentor_experience', mentor_experience)  # type: ignore
                setattr(match_response, 'available_programs', mentorship_prefs.get("preferred_program_types", []))  # type: ignore
                matches.append(match_response)

        # Sort by match score and return top matches
        matches.sort(key=lambda x: x.match_score, reverse=True)
        return matches[:limit]

    def _check_availability_overlap(self, mentor_availability: Dict, mentee_availability: Dict) -> bool:
        """Check if mentor and mentee have overlapping availability"""
        if not mentor_availability or not mentee_availability:
            return False

        mentor_days = set(mentor_availability.get("days", []))
        mentee_days = set(mentee_availability.get("days", []))
        
        if not mentor_days.intersection(mentee_days):
            return False

        mentor_times = mentor_availability.get("time_slots", [])
        mentee_times = mentee_availability.get("time_slots", [])
        
        # Simple overlap check - in real implementation, would parse time ranges
        return bool(set(mentor_times).intersection(set(mentee_times)))

    def _get_user_interests(self, user_id: int) -> Set[str]:
        """Helper to fetch and parse user interests into a set."""
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not profile or not getattr(profile, 'interests', None):  # type: ignore
            return set()

        interests_data = getattr(profile, 'interests', None)  # type: ignore
        if isinstance(interests_data, str):
            try:
                interests_list = json.loads(interests_data)
            except json.JSONDecodeError:
                return set()
        elif isinstance(interests_data, list):
            interests_list = interests_data
        else:
            return set()

        if isinstance(interests_list, list):
            return {interest.lower() for interest in interests_list if isinstance(interest, str)}
        return set()

    def create_mentorship_program(self, program_data: MentorshipProgramCreate) -> MentorshipProgramResponse:
        """
        Create a structured mentorship program with templates and milestones
        """
        # In a real implementation, this would create a MentorshipProgram model
        # For now, we'll return a structured response
        program_templates = {
            "career_development": {
                "duration_weeks": 12,
                "milestones": [
                    {"week": 2, "title": "Career Assessment", "description": "Complete comprehensive career assessment"},
                    {"week": 4, "title": "Goal Setting", "description": "Define 3-month and 1-year career goals"},
                    {"week": 6, "title": "Skill Gap Analysis", "description": "Identify key skills to develop"},
                    {"week": 8, "title": "Action Plan", "description": "Create detailed development action plan"},
                    {"week": 10, "title": "Network Building", "description": "Expand professional network"},
                    {"week": 12, "title": "Progress Review", "description": "Evaluate progress and next steps"}
                ],
                "meeting_frequency": "bi-weekly",
                "recommended_activities": [
                    "Regular 1:1 meetings",
                    "Goal-setting workshops",
                    "Industry networking events",
                    "Skill development planning"
                ]
            },
            "skill_building": {
                "duration_weeks": 8,
                "milestones": [
                    {"week": 1, "title": "Skill Assessment", "description": "Evaluate current skill level"},
                    {"week": 2, "title": "Learning Plan", "description": "Create structured learning plan"},
                    {"week": 4, "title": "Practice Projects", "description": "Begin hands-on practice"},
                    {"week": 6, "title": "Feedback Session", "description": "Review progress and adjust plan"},
                    {"week": 8, "title": "Skill Demonstration", "description": "Demonstrate acquired skills"}
                ],
                "meeting_frequency": "weekly",
                "recommended_activities": [
                    "Hands-on practice sessions",
                    "Code/work reviews",
                    "Resource sharing",
                    "Progress check-ins"
                ]
            },
            "leadership": {
                "duration_weeks": 16,
                "milestones": [
                    {"week": 2, "title": "Leadership Assessment", "description": "Evaluate leadership style and strengths"},
                    {"week": 4, "title": "Team Dynamics", "description": "Learn about team management"},
                    {"week": 6, "title": "Communication Skills", "description": "Develop leadership communication"},
                    {"week": 8, "title": "Decision Making", "description": "Practice strategic decision making"},
                    {"week": 12, "title": "Conflict Resolution", "description": "Learn conflict management"},
                    {"week": 16, "title": "Leadership Project", "description": "Lead a real project or initiative"}
                ],
                "meeting_frequency": "bi-weekly",
                "recommended_activities": [
                    "Leadership scenarios",
                    "360-degree feedback",
                    "Team shadowing",
                    "Leadership challenges"
                ]
            }
        }

        template = program_templates.get(program_data.program_type, program_templates["career_development"])
        
        program_response = MentorshipProgramResponse()  # type: ignore
        setattr(program_response, 'id', f"prog_{program_data.program_type}_{datetime.now(timezone.utc).strftime('%Y%m%d')}")  # type: ignore
        setattr(program_response, 'name', program_data.name)  # type: ignore
        setattr(program_response, 'description', program_data.description)  # type: ignore
        setattr(program_response, 'program_type', program_data.program_type)  # type: ignore
        setattr(program_response, 'duration_weeks', template["duration_weeks"])  # type: ignore
        setattr(program_response, 'meeting_frequency', template["meeting_frequency"])  # type: ignore
        setattr(program_response, 'milestones', template["milestones"])  # type: ignore
        setattr(program_response, 'recommended_activities', template["recommended_activities"])  # type: ignore
        setattr(program_response, 'max_participants', program_data.max_participants)  # type: ignore
        setattr(program_response, 'created_at', datetime.now(timezone.utc))  # type: ignore
        return program_response

    def apply_as_mentor(self, user_id: int, application_data: MentorApplicationCreate) -> MentorApplicationResponse:
        """
        Process mentor application with qualification verification
        """
        user = user_crud.get_user(self.db, user_id=user_id)
        if not user:
            raise ValueError("User not found")

        user_profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not user_profile:
            raise ValueError("User profile not found")

        # Calculate qualification score
        qualification_score = self._calculate_mentor_qualification_score(user_id, application_data)
        
        # Determine approval status based on score and criteria
        is_approved = qualification_score >= 70  # 70% threshold for auto-approval
        status = "approved" if is_approved else "pending_review"

        application_response = MentorApplicationResponse()  # type: ignore
        setattr(application_response, 'application_id', f"app_{user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}")  # type: ignore
        setattr(application_response, 'user_id', user_id)  # type: ignore
        setattr(application_response, 'program_types', application_data.program_types)  # type: ignore
        setattr(application_response, 'experience_description', application_data.experience_description)  # type: ignore
        setattr(application_response, 'qualification_score', qualification_score)  # type: ignore
        setattr(application_response, 'status', status)  # type: ignore
        setattr(application_response, 'submitted_at', datetime.now(timezone.utc))  # type: ignore
        setattr(application_response, 'reviewed_at', datetime.now(timezone.utc) if is_approved else None)  # type: ignore
        return application_response

    def _calculate_mentor_qualification_score(self, user_id: int, application_data: MentorApplicationCreate) -> int:
        """
        Calculate mentor qualification score based on various factors
        """
        score = 0
        
        # Experience description quality (0-30 points)
        if application_data.experience_description:
            desc_length = len(application_data.experience_description)
            if desc_length > 500:
                score += 30
            elif desc_length > 200:
                score += 20
            elif desc_length > 100:
                score += 10

        # Skills relevance (0-25 points)
        user_skills = self._get_user_skills(user_id)
        if len(user_skills) >= 5:
            score += 25
        elif len(user_skills) >= 3:
            score += 15
        elif len(user_skills) >= 1:
            score += 10

        # Profile completeness (0-20 points)
        profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if profile:
            profile_bio = getattr(profile, 'bio', None)  # type: ignore
            if profile_bio and len(profile_bio) > 100:
                score += 10
            if getattr(profile, 'linkedin_url', None):  # type: ignore
                score += 5
            if getattr(profile, 'location', None):  # type: ignore
                score += 5

        # Program type expertise (0-15 points)
        if len(application_data.program_types) >= 2:
            score += 15
        elif len(application_data.program_types) == 1:
            score += 10

        # Availability commitment (0-10 points)
        if application_data.availability and application_data.availability.get("hours_per_week", 0) >= 2:
            score += 10
        elif application_data.availability and application_data.availability.get("hours_per_week", 0) >= 1:
            score += 5

        return min(score, 100)  # Cap at 100

    def create_mentorship_connection(self, mentor_id: int, mentee_id: int, program_type: str, goals: Optional[str] = None) -> MentorshipConnection:
        """
        Create a new mentorship connection between mentor and mentee
        """
        # Check if connection already exists
        existing = self.db.query(MentorshipConnection).filter(
            MentorshipConnection.mentor_id == mentor_id,
            MentorshipConnection.mentee_id == mentee_id,
            MentorshipConnection.status == "active"
        ).first()

        if existing:
            raise ValueError("Active mentorship connection already exists")

        # Create new connection
        connection = MentorshipConnection()  # type: ignore
        setattr(connection, 'mentor_id', mentor_id)  # type: ignore
        setattr(connection, 'mentee_id', mentee_id)  # type: ignore
        setattr(connection, 'focus_areas', [program_type])  # type: ignore
        setattr(connection, 'goals', goals or f"Professional development in {program_type}")  # type: ignore
        setattr(connection, 'duration_months', 3)  # type: ignore
        setattr(connection, 'meeting_frequency', "bi-weekly")  # type: ignore
        setattr(connection, 'status', "active")  # type: ignore
        setattr(connection, 'started_at', datetime.now(timezone.utc))  # type: ignore

        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        return connection

    def update_mentorship_progress(self, connection_id: int, progress_data: MentorshipProgressUpdate) -> Dict[str, Any]:
        """
        Update progress tracking for a mentorship relationship
        """
        connection = self.db.query(MentorshipConnection).filter(
            MentorshipConnection.id == connection_id
        ).first()

        if not connection:
            raise ValueError("Mentorship connection not found")

        # In a real implementation, this would update a MentorshipProgress model
        # For now, we'll return a structured progress update
        progress_update = {
            "connection_id": connection_id,
            "milestone_completed": progress_data.milestone_completed,
            "progress_percentage": progress_data.progress_percentage,
            "notes": progress_data.notes,
            "next_meeting_date": progress_data.next_meeting_date,
            "updated_at": datetime.now(timezone.utc),
            "goals_status": progress_data.goals_status or "on_track"
        }

        return progress_update

    def get_mentorship_analytics(self, user_id: Optional[int] = None, program_type: Optional[str] = None) -> MentorshipAnalytics:
        """
        Generate comprehensive mentorship analytics
        """
        base_query = self.db.query(MentorshipConnection)
        
        if user_id is not None:
            # Use union to avoid PyRefly or_() issues
            mentor_query = base_query.filter(MentorshipConnection.mentor_id == user_id)
            mentee_query = base_query.filter(MentorshipConnection.mentee_id == user_id)
            base_query = mentor_query.union(mentee_query)

        if program_type:
            base_query = base_query.filter(
                MentorshipConnection.focus_areas.contains([program_type])
            )

        total_connections = base_query.count()
        active_connections = base_query.filter(MentorshipConnection.status == "active").count()
        completed_connections = base_query.filter(MentorshipConnection.status == "completed").count()

        # Calculate success metrics
        success_rate = (completed_connections / total_connections * 100) if total_connections > 0 else 0
        
        # Average duration for completed mentorships
        completed_mentorships = base_query.filter(
            MentorshipConnection.status == "completed",
            MentorshipConnection.ended_at.isnot(None)
        ).all()

        avg_duration_days = 0
        if completed_mentorships:
            total_days = sum([
                (getattr(conn, 'ended_at', datetime.now(timezone.utc)) - getattr(conn, 'started_at', datetime.now(timezone.utc))).days  # type: ignore
                for conn in completed_mentorships
                if getattr(conn, 'ended_at', None) and getattr(conn, 'started_at', None)  # type: ignore
            ])
            avg_duration_days = total_days / len(completed_mentorships)

        # Program type distribution
        program_distribution = {}
        all_connections = base_query.all()
        for conn in all_connections:
            focus_areas = getattr(conn, 'focus_areas', None)  # type: ignore
            if focus_areas:
                for area in focus_areas:
                    program_distribution[area] = program_distribution.get(area, 0) + 1

        analytics = MentorshipAnalytics()  # type: ignore
        setattr(analytics, 'total_connections', total_connections)  # type: ignore
        setattr(analytics, 'active_connections', active_connections)  # type: ignore
        setattr(analytics, 'completed_connections', completed_connections)  # type: ignore
        setattr(analytics, 'success_rate', round(success_rate, 2))  # type: ignore
        setattr(analytics, 'average_duration_days', round(float(avg_duration_days), 1))  # type: ignore
        setattr(analytics, 'program_type_distribution', program_distribution)  # type: ignore
        setattr(analytics, 'monthly_new_connections', self._get_monthly_new_connections())  # type: ignore
        setattr(analytics, 'satisfaction_score', 4.2)  # type: ignore
        setattr(analytics, 'generated_at', datetime.now(timezone.utc))  # type: ignore
        return analytics

    def _get_monthly_new_connections(self) -> List[Dict[str, Any]]:
        """Get monthly new connections for the last 6 months"""
        monthly_data = []
        for i in range(6):
            month_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            count = self.db.query(MentorshipConnection).filter(
                MentorshipConnection.started_at >= month_start,
                MentorshipConnection.started_at < month_end
            ).count()
            
            monthly_data.append({
                "month": month_start.strftime("%Y-%m"),
                "new_connections": count
            })
        
        return list(reversed(monthly_data))

    def get_mentor_qualifications(self, user_id: int) -> MentorQualificationResponse:
        """
        Get mentor qualification status and recommendations
        """
        user_profile = user_crud.get_user_profile(self.db, user_id=user_id)
        if not user_profile:
            raise ValueError("User profile not found")

        # Mock qualification data - in real implementation, would be stored in database
        mock_application = MentorApplicationCreate()  # type: ignore
        setattr(mock_application, 'program_types', ["career_development"])  # type: ignore
        setattr(mock_application, 'experience_description', getattr(user_profile, 'bio', '') or '')  # type: ignore
        setattr(mock_application, 'availability', {"hours_per_week": 2})  # type: ignore

        qualification_score = self._calculate_mentor_qualification_score(user_id, mock_application)
        
        recommendations = []
        if qualification_score < 70:
            profile_bio = getattr(user_profile, 'bio', None)  # type: ignore
            if not profile_bio or len(profile_bio) < 100:
                recommendations.append("Complete your profile bio with detailed experience")
            if len(self._get_user_skills(user_id)) < 3:
                recommendations.append("Add more skills to your profile")
            if not getattr(user_profile, 'linkedin_url', None):  # type: ignore
                recommendations.append("Add your LinkedIn profile URL")

        qualification_response = MentorQualificationResponse()  # type: ignore
        setattr(qualification_response, 'user_id', user_id)  # type: ignore
        setattr(qualification_response, 'qualification_score', qualification_score)  # type: ignore
        setattr(qualification_response, 'is_qualified', qualification_score >= 70)  # type: ignore
        setattr(qualification_response, 'recommendations', recommendations)  # type: ignore
        setattr(qualification_response, 'strengths', self._identify_mentor_strengths(user_id))  # type: ignore
        setattr(qualification_response, 'evaluated_at', datetime.now(timezone.utc))  # type: ignore
        return qualification_response

    def _identify_mentor_strengths(self, user_id: int) -> List[str]:
        """Identify user's mentoring strengths"""
        strengths = []
        user_skills = self._get_user_skills(user_id)
        profile = user_crud.get_user_profile(self.db, user_id=user_id)

        if len(user_skills) >= 5:
            strengths.append("Diverse skill set")
        if profile:
            profile_bio = getattr(profile, 'bio', None)  # type: ignore
            if profile_bio and len(profile_bio) > 200:
                strengths.append("Detailed experience description")
            if getattr(profile, 'linkedin_url', None):  # type: ignore
                strengths.append("Professional online presence")
        
        # Add more strength identification logic based on profile data
        return strengths
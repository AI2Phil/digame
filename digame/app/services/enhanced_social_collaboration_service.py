"""
Enhanced Social Collaboration Service
Real project data integration, messaging, and improved peer matching
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from ..models.user import User
from ..models.social_collaboration import (
    PeerConnection, PeerMessage, CollaborationProject, ProjectMember, 
    ProjectApplication, SkillEndorsement, MentorshipConnection,
    ConnectionStatus, MessageType, ProjectStatus
)
from ..crud import user_crud
from ..schemas.notification_schemas import NotificationCreate
from ..crud import notification_crud


class EnhancedSocialCollaborationService:
    def __init__(self, db: Session):
        self.db = db

    # Real Project Data Integration
    def create_collaboration_project(self, owner_id: int, project_data: Dict[str, Any]) -> CollaborationProject:
        """Create a new collaboration project with real data"""
        project = CollaborationProject(
            name=project_data["name"],
            description=project_data["description"],
            category=project_data["category"],
            owner_id=owner_id,
            required_skills=project_data.get("required_skills", []),
            optional_skills=project_data.get("optional_skills", []),
            difficulty_level=project_data["difficulty_level"],
            estimated_duration=project_data.get("estimated_duration"),
            time_commitment=project_data.get("time_commitment"),
            max_team_size=project_data.get("max_team_size", 10),
            repository_url=project_data.get("repository_url"),
            project_url=project_data.get("project_url"),
            documentation_url=project_data.get("documentation_url"),
            tags=project_data.get("tags", []),
            target_completion_date=project_data.get("target_completion_date")
        )
        
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        # Add owner as first team member
        self.add_project_member(project.id, owner_id, "Project Lead", project_data.get("required_skills", []))
        
        return project

    def get_real_project_matches(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get real project matches based on user skills and preferences"""
        user = user_crud.get_user(self.db, user_id)
        if not user:
            return []

        # Get user skills (assuming they're stored as JSON in user profile)
        user_skills = self._get_user_skills(user_id)
        if not user_skills:
            return []

        # Query active projects that are recruiting
        projects = self.db.query(CollaborationProject).filter(
            CollaborationProject.status == ProjectStatus.RECRUITING,
            CollaborationProject.owner_id != user_id
        ).all()

        matches = []
        for project in projects:
            # Calculate skill match
            required_skills = set(skill.lower() for skill in project.required_skills)
            user_skills_set = set(skill.lower() for skill in user_skills)
            
            matching_skills = list(required_skills.intersection(user_skills_set))
            missing_skills = list(required_skills.difference(user_skills_set))
            
            # Calculate match score
            if required_skills:
                match_score = len(matching_skills) / len(required_skills) * 100
            else:
                match_score = 0

            # Only include if there's some skill overlap or it's beginner-friendly
            if matching_skills or project.difficulty_level == "Beginner":
                # Get current team size
                current_team_size = self.db.query(ProjectMember).filter(
                    ProjectMember.project_id == project.id,
                    ProjectMember.is_active == True
                ).count()

                matches.append({
                    "project": {
                        "id": project.id,
                        "name": project.name,
                        "description": project.description,
                        "category": project.category,
                        "difficulty_level": project.difficulty_level,
                        "estimated_duration": project.estimated_duration,
                        "time_commitment": project.time_commitment,
                        "current_team_size": current_team_size,
                        "max_team_size": project.max_team_size,
                        "progress_percentage": project.progress_percentage,
                        "repository_url": project.repository_url,
                        "project_url": project.project_url,
                        "tags": project.tags,
                        "created_at": project.created_at.isoformat()
                    },
                    "matching_skills": matching_skills,
                    "missing_skills": missing_skills,
                    "match_score": round(match_score, 1),
                    "urgency": "high" if current_team_size < 3 else "medium"
                })

        # Sort by match score and return top matches
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:limit]

    def apply_to_project(self, project_id: int, applicant_id: int, application_data: Dict[str, Any]) -> ProjectApplication:
        """Apply to join a collaboration project"""
        application = ProjectApplication(
            project_id=project_id,
            applicant_id=applicant_id,
            message=application_data.get("message"),
            proposed_role=application_data.get("proposed_role"),
            relevant_skills=application_data.get("relevant_skills", [])
        )
        
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        
        # Notify project owner
        project = self.db.query(CollaborationProject).filter(
            CollaborationProject.id == project_id
        ).first()
        
        if project:
            applicant = user_crud.get_user(self.db, applicant_id)
            notification_data = NotificationCreate(
                message=f"{applicant.first_name or 'Someone'} applied to join your project '{project.name}'",
                type="project_application"
            )
            try:
                notification_crud.create_notification(
                    db=self.db, 
                    notification=notification_data, 
                    user_id=project.owner_id
                )
            except Exception as e:
                print(f"Could not create notification: {e}")
        
        return application

    def add_project_member(self, project_id: int, user_id: int, role: str, contributing_skills: List[str]) -> ProjectMember:
        """Add a member to a project"""
        member = ProjectMember(
            project_id=project_id,
            user_id=user_id,
            role=role,
            skills_contributing=contributing_skills
        )
        
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    # Enhanced Peer Messaging System
    def send_peer_connection_request(self, requester_id: int, recipient_id: int, message: str = None) -> PeerConnection:
        """Send a connection request to another user"""
        # Check if connection already exists
        existing = self.db.query(PeerConnection).filter(
            ((PeerConnection.requester_id == requester_id) & (PeerConnection.recipient_id == recipient_id)) |
            ((PeerConnection.requester_id == recipient_id) & (PeerConnection.recipient_id == requester_id))
        ).first()
        
        if existing:
            raise ValueError("Connection already exists or pending")
        
        connection = PeerConnection(
            requester_id=requester_id,
            recipient_id=recipient_id,
            message=message,
            status=ConnectionStatus.PENDING
        )
        
        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        
        # Send notification
        requester = user_crud.get_user(self.db, requester_id)
        notification_data = NotificationCreate(
            message=f"{requester.first_name or 'Someone'} sent you a connection request",
            type="connection_request"
        )
        try:
            notification_crud.create_notification(
                db=self.db, 
                notification=notification_data, 
                user_id=recipient_id
            )
        except Exception as e:
            print(f"Could not create notification: {e}")
        
        return connection

    def accept_connection_request(self, connection_id: int, user_id: int) -> PeerConnection:
        """Accept a connection request"""
        connection = self.db.query(PeerConnection).filter(
            PeerConnection.id == connection_id,
            PeerConnection.recipient_id == user_id,
            PeerConnection.status == ConnectionStatus.PENDING
        ).first()
        
        if not connection:
            raise ValueError("Connection request not found or not pending")
        
        connection.status = ConnectionStatus.ACCEPTED
        connection.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(connection)
        
        # Notify requester
        recipient = user_crud.get_user(self.db, user_id)
        notification_data = NotificationCreate(
            message=f"{recipient.first_name or 'Someone'} accepted your connection request",
            type="connection_accepted"
        )
        try:
            notification_crud.create_notification(
                db=self.db, 
                notification=notification_data, 
                user_id=connection.requester_id
            )
        except Exception as e:
            print(f"Could not create notification: {e}")
        
        return connection

    def send_peer_message(self, sender_id: int, recipient_id: int, content: str, 
                         message_type: MessageType = MessageType.TEXT, metadata: Dict = None) -> PeerMessage:
        """Send a message between connected peers"""
        # Find active connection between users
        connection = self.db.query(PeerConnection).filter(
            ((PeerConnection.requester_id == sender_id) & (PeerConnection.recipient_id == recipient_id)) |
            ((PeerConnection.requester_id == recipient_id) & (PeerConnection.recipient_id == sender_id)),
            PeerConnection.status == ConnectionStatus.ACCEPTED
        ).first()
        
        if not connection:
            raise ValueError("No active connection between users")
        
        message = PeerMessage(
            connection_id=connection.id,
            sender_id=sender_id,
            message_type=message_type,
            content=content,
            metadata=metadata or {}
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        # Notify recipient
        sender = user_crud.get_user(self.db, sender_id)
        notification_data = NotificationCreate(
            message=f"New message from {sender.first_name or 'a connection'}",
            type="peer_message"
        )
        try:
            recipient_id_for_notification = (
                recipient_id if connection.requester_id == sender_id 
                else connection.requester_id
            )
            notification_crud.create_notification(
                db=self.db, 
                notification=notification_data, 
                user_id=recipient_id_for_notification
            )
        except Exception as e:
            print(f"Could not create notification: {e}")
        
        return message

    def get_peer_messages(self, user_id: int, peer_id: int, limit: int = 50) -> List[PeerMessage]:
        """Get messages between two connected peers"""
        connection = self.db.query(PeerConnection).filter(
            ((PeerConnection.requester_id == user_id) & (PeerConnection.recipient_id == peer_id)) |
            ((PeerConnection.requester_id == peer_id) & (PeerConnection.recipient_id == user_id)),
            PeerConnection.status == ConnectionStatus.ACCEPTED
        ).first()
        
        if not connection:
            return []
        
        messages = self.db.query(PeerMessage).filter(
            PeerMessage.connection_id == connection.id
        ).order_by(PeerMessage.created_at.desc()).limit(limit).all()
        
        return list(reversed(messages))  # Return in chronological order

    def mark_messages_as_read(self, user_id: int, connection_id: int):
        """Mark messages as read for a user"""
        self.db.query(PeerMessage).filter(
            PeerMessage.connection_id == connection_id,
            PeerMessage.sender_id != user_id,
            PeerMessage.is_read == False
        ).update({"is_read": True})
        
        self.db.commit()

    # Enhanced Peer Matching with Real Data
    def get_enhanced_peer_matches(self, user_id: int, match_type: str = "skills", limit: int = 10) -> List[Dict[str, Any]]:
        """Get enhanced peer matches with real data and improved algorithms"""
        user = user_crud.get_user(self.db, user_id)
        if not user:
            return []

        user_skills = self._get_user_skills(user_id)
        if not user_skills:
            return []

        # Get all potential matches (excluding already connected users)
        connected_user_ids = self._get_connected_user_ids(user_id)
        
        potential_matches = self.db.query(User).filter(
            User.id != user_id,
            ~User.id.in_(connected_user_ids)
        ).all()

        matches = []
        for candidate in potential_matches:
            candidate_skills = self._get_user_skills(candidate.id)
            if not candidate_skills:
                continue

            # Calculate compatibility score
            compatibility_data = self._calculate_compatibility(user_skills, candidate_skills, match_type)
            
            if compatibility_data["score"] > 0:
                # Get skill endorsements for credibility
                endorsements = self._get_skill_endorsements(candidate.id)
                
                matches.append({
                    "id": candidate.id,
                    "name": f"{candidate.first_name or ''} {candidate.last_name or ''}".strip() or candidate.username,
                    "title": getattr(candidate, 'title', 'Professional'),
                    "company": getattr(candidate, 'company', 'Independent'),
                    "location": getattr(candidate, 'location', 'Remote'),
                    "initials": self._get_initials(candidate),
                    "compatibilityScore": compatibility_data["score"],
                    "sharedSkills": compatibility_data["shared_skills"],
                    "complementarySkills": compatibility_data["complementary_skills"],
                    "skillGaps": compatibility_data["skill_gaps"],
                    "endorsements": len(endorsements),
                    "matchReason": compatibility_data["reason"],
                    "collaborationPotential": self._assess_collaboration_potential(compatibility_data["score"])
                })

        # Sort by compatibility score
        matches.sort(key=lambda x: x["compatibilityScore"], reverse=True)
        return matches[:limit]

    def endorse_skill(self, endorser_id: int, endorsed_user_id: int, skill_name: str, 
                     proficiency_level: str = None, comment: str = None) -> SkillEndorsement:
        """Endorse a skill for another user"""
        # Check if endorsement already exists
        existing = self.db.query(SkillEndorsement).filter(
            SkillEndorsement.endorser_id == endorser_id,
            SkillEndorsement.endorsed_user_id == endorsed_user_id,
            SkillEndorsement.skill_name == skill_name
        ).first()
        
        if existing:
            raise ValueError("Skill already endorsed by this user")
        
        endorsement = SkillEndorsement(
            endorser_id=endorser_id,
            endorsed_user_id=endorsed_user_id,
            skill_name=skill_name,
            proficiency_level=proficiency_level,
            comment=comment
        )
        
        self.db.add(endorsement)
        self.db.commit()
        self.db.refresh(endorsement)
        
        # Notify endorsed user
        endorser = user_crud.get_user(self.db, endorser_id)
        notification_data = NotificationCreate(
            message=f"{endorser.first_name or 'Someone'} endorsed your {skill_name} skill",
            type="skill_endorsement"
        )
        try:
            notification_crud.create_notification(
                db=self.db, 
                notification=notification_data, 
                user_id=endorsed_user_id
            )
        except Exception as e:
            print(f"Could not create notification: {e}")
        
        return endorsement

    # Helper Methods
    def _get_user_skills(self, user_id: int) -> List[str]:
        """Get user skills from their profile"""
        user = user_crud.get_user(self.db, user_id)
        if not user:
            return []
        
        # Try to get skills from user attributes
        if hasattr(user, 'skills') and user.skills:
            try:
                if isinstance(user.skills, str):
                    return json.loads(user.skills)
                elif isinstance(user.skills, list):
                    return user.skills
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Fallback to default skills for demo
        return ["Python", "JavaScript", "React", "FastAPI"]

    def _get_connected_user_ids(self, user_id: int) -> List[int]:
        """Get IDs of users already connected to this user"""
        connections = self.db.query(PeerConnection).filter(
            ((PeerConnection.requester_id == user_id) | (PeerConnection.recipient_id == user_id)),
            PeerConnection.status == ConnectionStatus.ACCEPTED
        ).all()
        
        connected_ids = []
        for conn in connections:
            if conn.requester_id == user_id:
                connected_ids.append(conn.recipient_id)
            else:
                connected_ids.append(conn.requester_id)
        
        return connected_ids

    def _calculate_compatibility(self, user_skills: List[str], candidate_skills: List[str], match_type: str) -> Dict[str, Any]:
        """Calculate compatibility between two users"""
        user_skills_set = set(skill.lower() for skill in user_skills)
        candidate_skills_set = set(skill.lower() for skill in candidate_skills)
        
        shared_skills = list(user_skills_set.intersection(candidate_skills_set))
        user_unique = list(user_skills_set.difference(candidate_skills_set))
        candidate_unique = list(candidate_skills_set.difference(user_skills_set))
        
        if match_type == "skills":
            # For skill-based matching, prioritize shared skills
            score = len(shared_skills) * 20 + len(candidate_unique) * 5
            reason = f"Shares {len(shared_skills)} skills and brings {len(candidate_unique)} complementary skills"
        else:
            # For learning partner matching, prioritize complementary skills
            score = len(candidate_unique) * 15 + len(shared_skills) * 10
            reason = f"Can teach {len(candidate_unique)} new skills while collaborating on {len(shared_skills)} shared skills"
        
        return {
            "score": min(score, 100),  # Cap at 100
            "shared_skills": shared_skills[:5],  # Limit for display
            "complementary_skills": candidate_unique[:5],
            "skill_gaps": user_unique[:3],
            "reason": reason
        }

    def _get_skill_endorsements(self, user_id: int) -> List[SkillEndorsement]:
        """Get skill endorsements for a user"""
        return self.db.query(SkillEndorsement).filter(
            SkillEndorsement.endorsed_user_id == user_id
        ).all()

    def _get_initials(self, user: User) -> str:
        """Get user initials"""
        first_initial = (user.first_name or user.username)[0].upper() if user.first_name or user.username else "U"
        last_initial = user.last_name[0].upper() if user.last_name else ""
        return f"{first_initial}{last_initial}" if last_initial else first_initial

    def _assess_collaboration_potential(self, score: int) -> str:
        """Assess collaboration potential based on compatibility score"""
        if score >= 80:
            return "very-high"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "medium"
        else:
            return "low"
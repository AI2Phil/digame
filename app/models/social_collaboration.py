"""
Social Collaboration Models
Enhanced models for peer connections, messaging, and real project collaboration
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class ConnectionStatus(enum.Enum):
    """Connection status between users"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"


class MessageType(enum.Enum):
    """Message types for peer communication"""
    TEXT = "text"
    FILE = "file"
    PROJECT_INVITE = "project_invite"
    MEETING_REQUEST = "meeting_request"


class ProjectStatus(enum.Enum):
    """Real project collaboration status"""
    DRAFT = "draft"
    RECRUITING = "recruiting"
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class PeerConnection(Base):
    """
    Model for peer-to-peer connections between users
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "peer_connections"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.PENDING, nullable=False)
    message = Column(Text, nullable=True)  # Optional message with connection request
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # requester = relationship("app.models.user.User", foreign_keys=[requester_id])
    # recipient = relationship("app.models.user.User", foreign_keys=[recipient_id])

    def __repr__(self):
        return f"<PeerConnection(id={self.id}, requester_id={self.requester_id}, recipient_id={self.recipient_id}, status='{self.status}')>"


class PeerMessage(Base):
    """
    Model for messages between connected peers
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "peer_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("peer_connections.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message_type = Column(Enum(MessageType), default=MessageType.TEXT, nullable=False)
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, nullable=True)  # For file attachments, meeting details, etc.
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # connection = relationship("app.models.social_collaboration.PeerConnection")
    # sender = relationship("app.models.user.User")

    def __repr__(self):
        return f"<PeerMessage(id={self.id}, sender_id={self.sender_id}, type='{self.message_type}')>"


class CollaborationProject(Base):
    """
    Model for real collaboration projects with enhanced features
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "collaboration_projects"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Open Source, Social Impact, Education, etc.
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Project details
    required_skills = Column(JSON, nullable=False)  # List of required skills
    optional_skills = Column(JSON, nullable=True)  # List of nice-to-have skills
    difficulty_level = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    estimated_duration = Column(String(100), nullable=True)  # "3 months", "6 weeks", etc.
    time_commitment = Column(String(100), nullable=True)  # "10 hours/week", "part-time", etc.
    max_team_size = Column(Integer, default=10, nullable=False)
    
    # Project status and progress
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)
    
    # Project metadata
    repository_url = Column(String(500), nullable=True)
    project_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    tags = Column(JSON, nullable=True)  # Additional tags for better matching
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    start_date = Column(DateTime, nullable=True)
    target_completion_date = Column(DateTime, nullable=True)
    
    # Relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # owner = relationship("app.models.user.User")  # Temporarily disabled to resolve registry conflicts
    # members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    # applications = relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CollaborationProject(id={self.id}, name='{self.name}', status='{self.status}')>"


class ProjectMember(Base):
    """
    Model for project team members with roles and contributions
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "project_members"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("collaboration_projects.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(100), nullable=False)  # Lead, Developer, Designer, etc.
    skills_contributing = Column(JSON, nullable=True)  # Skills this member contributes
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # project = relationship("CollaborationProject", back_populates="members")
    # user = relationship("app.models.user.User")  # Temporarily disabled to resolve registry conflicts

    def __repr__(self):
        return f"<ProjectMember(id={self.id}, project_id={self.project_id}, user_id={self.user_id}, role='{self.role}')>"


class ProjectApplication(Base):
    """
    Model for applications to join collaboration projects
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "project_applications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("collaboration_projects.id"), nullable=False, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=True)  # Application message
    proposed_role = Column(String(100), nullable=True)  # Role the applicant wants
    relevant_skills = Column(JSON, nullable=True)  # Skills they bring
    status = Column(String(50), default="pending", nullable=False)  # pending, accepted, rejected
    applied_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships - temporarily disabled due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    # project = relationship("CollaborationProject", back_populates="applications")
    # applicant = relationship("app.models.user.User", foreign_keys=[applicant_id])  # Temporarily disabled to resolve registry conflicts
    # reviewer = relationship("app.models.user.User", foreign_keys=[reviewed_by])  # Temporarily disabled to resolve registry conflicts

    def __repr__(self):
        return f"<ProjectApplication(id={self.id}, project_id={self.project_id}, applicant_id={self.applicant_id}, status='{self.status}')>"


class SkillEndorsement(Base):
    """
    Model for peer skill endorsements to improve matching accuracy
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "skill_endorsements"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    endorser_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    endorsed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced, Expert
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    # endorser = relationship("app.models.user.User", foreign_keys=[endorser_id])  # Temporarily disabled to resolve registry conflicts
    # endorsed_user = relationship("app.models.user.User", foreign_keys=[endorsed_user_id])  # Temporarily disabled to resolve registry conflicts

    def __repr__(self):
        return f"<SkillEndorsement(id={self.id}, skill='{self.skill_name}', endorser_id={self.endorser_id}, endorsed_user_id={self.endorsed_user_id})>"


class MentorshipConnection(Base):
    """
    Model for formal mentorship relationships
    """
    __table_args__ = {'extend_existing': True}
    __tablename__ = "mentorship_connections"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mentee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    focus_areas = Column(JSON, nullable=False)  # Areas of mentorship focus
    goals = Column(Text, nullable=True)  # Mentorship goals
    duration_months = Column(Integer, nullable=True)  # Expected duration
    meeting_frequency = Column(String(100), nullable=True)  # "Weekly", "Bi-weekly", etc.
    status = Column(String(50), default="active", nullable=False)  # active, completed, paused
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    
    # Relationships
    # mentor = relationship("app.models.user.User", foreign_keys=[mentor_id])  # Temporarily disabled to resolve registry conflicts
    # mentee = relationship("app.models.user.User", foreign_keys=[mentee_id])  # Temporarily disabled to resolve registry conflicts

    def __repr__(self):
        return f"<MentorshipConnection(id={self.id}, mentor_id={self.mentor_id}, mentee_id={self.mentee_id}, status='{self.status}')>"
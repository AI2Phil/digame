"""
Social Networking Models
Phase 1 implementation for social features including user connections, peer matching, and social metrics.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey, Text, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserConnection(Base):
    """User connections for professional networking"""
    __tablename__ = "user_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    connected_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    connection_type = Column(String(50), nullable=False, default="professional")
    status = Column(String(20), nullable=False, default="pending", index=True)
    initiated_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    connected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="connections_initiated")
    connected_user = relationship("User", foreign_keys=[connected_user_id], back_populates="connections_received")
    initiator = relationship("User", foreign_keys=[initiated_by])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'connected_user_id', name='unique_user_connection'),
        {'extend_existing': True}
    )


class PeerMatch(Base):
    """AI-powered peer matching for professional networking"""
    __tablename__ = "peer_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    matched_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    compatibility_score = Column(Numeric(5, 2), nullable=False, index=True)
    match_factors = Column(JSON, nullable=True)  # Store matching criteria and reasons
    status = Column(String(20), nullable=False, default="suggested")
    viewed_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="peer_matches_initiated")
    matched_user = relationship("User", foreign_keys=[matched_user_id], back_populates="peer_matches_received")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'matched_user_id', name='unique_peer_match'),
        {'extend_existing': True}
    )


class SocialMetrics(Base):
    """Social networking metrics and analytics for users"""
    __tablename__ = "social_metrics"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    total_connections = Column(Integer, nullable=False, default=0)
    active_mentorships = Column(Integer, nullable=False, default=0)
    learning_partnerships = Column(Integer, nullable=False, default=0)
    knowledge_shared = Column(Integer, nullable=False, default=0)
    collaboration_score = Column(Integer, nullable=False, default=0)
    network_growth_rate = Column(Numeric(5, 2), nullable=False, default=0.0)
    engagement_level = Column(String(20), nullable=False, default="low")
    last_calculated = Column(DateTime, nullable=False, server_default=func.now())
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="social_metrics")


class UserSkill(Base):
    """User skills for peer matching and mentorship"""
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False, index=True)
    proficiency_level = Column(String(20), nullable=False)  # beginner, intermediate, advanced, expert
    years_experience = Column(Integer, nullable=True)
    is_seeking_mentorship = Column(Boolean, nullable=False, default=False)
    is_offering_mentorship = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships - using string reference to avoid circular import issues
    user = relationship("User", back_populates="skills")

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'skill_name', name='unique_user_skill'),
        {'extend_existing': True}
    )
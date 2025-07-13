"""
Phase 3 Digital Twin Models for Team Coordination
Includes team management, multi-twin orchestration, and collaborative features
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float, DECIMAL, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from enum import Enum
import uuid

from app.database import Base

class TeamStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    DISBANDED = "disbanded"

class CoordinationType(str, Enum):
    WORKLOAD_BALANCING = "workload_balancing"
    SKILL_OPTIMIZATION = "skill_optimization"
    MEETING_OPTIMIZATION = "meeting_optimization"
    ABSENCE_PLANNING = "absence_planning"
    RESOURCE_ALLOCATION = "resource_allocation"
    COLLABORATION_SYNC = "collaboration_sync"

class CoordinationStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TwinTeam(Base):
    """
    Digital twin teams for coordinated productivity optimization
    Manages groups of twins working together
    """
    __tablename__ = "twin_teams"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Team metadata
    team_lead_twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=True, index=True)
    organization_id = Column(Integer, nullable=True, index=True)  # For enterprise features
    team_type = Column(String(100), nullable=False, default="productivity_team")
    
    # Team status and configuration
    status = Column(String(50), default=TeamStatus.ACTIVE.value, nullable=False)
    max_members = Column(Integer, default=10, nullable=False)
    coordination_enabled = Column(Boolean, default=True, nullable=False)
    
    # Team performance metrics
    team_productivity_score = Column(DECIMAL(5, 2), nullable=True)
    collaboration_score = Column(DECIMAL(5, 2), nullable=True)
    sync_efficiency = Column(DECIMAL(5, 2), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_coordination_at = Column(DateTime, nullable=True)

    # Relationships
    team_lead = relationship("DigitalTwin", foreign_keys=[team_lead_twin_id])
    members = relationship("TwinTeamMember", back_populates="team", cascade="all, delete-orphan")
    coordinations = relationship("TeamCoordination", back_populates="team", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_twin_teams_status', 'status', 'team_type'),
        Index('idx_twin_teams_org', 'organization_id', 'status'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TwinTeam(id={self.id}, name={self.name})>"

class TwinTeamMember(Base):
    """
    Individual twin members within a team
    Tracks roles, permissions, and contribution metrics
    """
    __tablename__ = "twin_team_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String, ForeignKey("twin_teams.id"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Member role and permissions
    role = Column(String(100), nullable=False, default="member")  # member, coordinator, specialist
    permissions = Column(JSON, default=[], nullable=False)  # List of permissions
    specializations = Column(JSON, default=[], nullable=False)  # Areas of expertise
    
    # Member status
    status = Column(String(50), default="active", nullable=False)
    availability_status = Column(String(50), default="available", nullable=False)  # available, busy, away
    
    # Performance and contribution metrics
    contribution_score = Column(DECIMAL(5, 2), nullable=True)
    collaboration_rating = Column(DECIMAL(5, 2), nullable=True)
    workload_capacity = Column(DECIMAL(5, 2), nullable=True)  # 0-100 percentage
    current_workload = Column(DECIMAL(5, 2), nullable=True)  # 0-100 percentage
    
    # Skills and capabilities
    skills = Column(JSON, default={}, nullable=False)  # {"skill": proficiency_level}
    preferred_work_hours = Column(JSON, default={}, nullable=False)  # Time preferences
    timezone = Column(String(50), nullable=True)
    
    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_active_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    team = relationship("TwinTeam", back_populates="members")
    twin = relationship("DigitalTwin")
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_team_members', 'team_id', 'status'),
        Index('idx_twin_teams', 'twin_id', 'status'),
        Index('idx_member_availability', 'availability_status', 'workload_capacity'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TwinTeamMember(id={self.id}, twin_id={self.twin_id}, role={self.role})>"

class TeamCoordination(Base):
    """
    Team coordination sessions and orchestration activities
    Manages multi-twin coordination processes
    """
    __tablename__ = "team_coordinations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String, ForeignKey("twin_teams.id"), nullable=False, index=True)
    coordination_type = Column(String(100), nullable=False, index=True)
    
    # Coordination metadata
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    initiated_by_twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Coordination parameters and configuration
    parameters = Column(JSON, default={}, nullable=False)
    target_twins = Column(JSON, default=[], nullable=False)  # List of twin IDs involved
    coordination_goals = Column(JSON, default=[], nullable=False)  # List of goals
    
    # Status and progress
    status = Column(String(50), default=CoordinationStatus.PENDING.value, nullable=False, index=True)
    progress_percentage = Column(DECIMAL(5, 2), default=0.0, nullable=False)
    
    # Results and outcomes
    results = Column(JSON, default={}, nullable=False)
    recommendations = Column(JSON, default=[], nullable=False)
    impact_metrics = Column(JSON, default={}, nullable=False)
    
    # Quality and confidence metrics
    coordination_confidence = Column(DECIMAL(5, 2), nullable=True)
    success_probability = Column(DECIMAL(5, 2), nullable=True)
    estimated_improvement = Column(DECIMAL(5, 2), nullable=True)
    
    # Execution metadata
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    execution_duration_ms = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    team = relationship("TwinTeam", back_populates="coordinations")
    initiator = relationship("DigitalTwin", foreign_keys=[initiated_by_twin_id])
    activities = relationship("CoordinationActivity", back_populates="coordination", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_team_coordinations', 'team_id', 'coordination_type', 'status'),
        Index('idx_coordination_progress', 'status', 'progress_percentage'),
        Index('idx_coordination_timeline', 'started_at', 'completed_at'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TeamCoordination(id={self.id}, type={self.coordination_type}, status={self.status})>"

class CoordinationActivity(Base):
    """
    Individual activities within a team coordination session
    Tracks specific actions and their outcomes
    """
    __tablename__ = "coordination_activities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    coordination_id = Column(String, ForeignKey("team_coordinations.id"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    
    # Activity details
    activity_type = Column(String(100), nullable=False, index=True)
    activity_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Activity parameters and data
    input_data = Column(JSON, default={}, nullable=False)
    output_data = Column(JSON, default={}, nullable=False)
    activity_metadata = Column(JSON, default={}, nullable=False)
    
    # Status and execution
    status = Column(String(50), default="pending", nullable=False, index=True)
    priority = Column(String(50), default="medium", nullable=False)
    
    # Results and metrics
    success = Column(Boolean, nullable=True)
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    impact_score = Column(DECIMAL(5, 2), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timing
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    coordination = relationship("TeamCoordination", back_populates="activities")
    twin = relationship("DigitalTwin")

    # Indexes
    __table_args__ = (
        Index('idx_coordination_activities', 'coordination_id', 'status'),
        Index('idx_activity_twin', 'twin_id', 'activity_type'),
        Index('idx_activity_schedule', 'scheduled_at', 'status'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<CoordinationActivity(id={self.id}, type={self.activity_type}, status={self.status})>"

class TwinCollaboration(Base):
    """
    Direct collaboration between pairs of twins
    Tracks peer-to-peer coordination and knowledge sharing
    """
    __tablename__ = "twin_collaborations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    twin_a_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    twin_b_id = Column(String, ForeignKey("digital_twins.id"), nullable=False, index=True)
    team_id = Column(String, ForeignKey("twin_teams.id"), nullable=True, index=True)
    
    # Collaboration metadata
    collaboration_type = Column(String(100), nullable=False)  # knowledge_sharing, task_coordination, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Collaboration data
    shared_data = Column(JSON, default={}, nullable=False)
    collaboration_context = Column(JSON, default={}, nullable=False)
    outcomes = Column(JSON, default={}, nullable=False)
    
    # Status and metrics
    status = Column(String(50), default="active", nullable=False)
    effectiveness_score = Column(DECIMAL(5, 2), nullable=True)
    mutual_benefit_score = Column(DECIMAL(5, 2), nullable=True)
    
    # Interaction tracking
    interaction_count = Column(Integer, default=0, nullable=False)
    last_interaction_at = Column(DateTime, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    twin_a = relationship("DigitalTwin", foreign_keys=[twin_a_id])
    twin_b = relationship("DigitalTwin", foreign_keys=[twin_b_id])
    team = relationship("TwinTeam")

    # Indexes
    __table_args__ = (
        Index('idx_twin_collaborations', 'twin_a_id', 'twin_b_id'),
        Index('idx_collaboration_team', 'team_id', 'status'),
        Index('idx_collaboration_type', 'collaboration_type', 'status'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TwinCollaboration(id={self.id}, type={self.collaboration_type}, status={self.status})>"

class TeamPerformanceMetric(Base):
    """
    Performance metrics and analytics for twin teams
    Tracks team productivity, collaboration effectiveness, and optimization opportunities
    """
    __tablename__ = "team_performance_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String, ForeignKey("twin_teams.id"), nullable=False, index=True)
    
    # Metric metadata
    metric_type = Column(String(100), nullable=False, index=True)
    metric_name = Column(String(255), nullable=False)
    measurement_period = Column(String(50), nullable=False)  # daily, weekly, monthly
    
    # Performance data
    metric_value = Column(DECIMAL(10, 2), nullable=False)
    baseline_value = Column(DECIMAL(10, 2), nullable=True)
    target_value = Column(DECIMAL(10, 2), nullable=True)
    improvement_percentage = Column(DECIMAL(5, 2), nullable=True)
    
    # Metric details
    contributing_factors = Column(JSON, default=[], nullable=False)
    measurement_data = Column(JSON, default={}, nullable=False)
    insights = Column(JSON, default=[], nullable=False)
    
    # Quality indicators
    data_quality_score = Column(DECIMAL(5, 2), nullable=True)
    confidence_level = Column(DECIMAL(5, 2), nullable=True)
    
    # Time period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    
    # Timestamps
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    team = relationship("TwinTeam")

    # Indexes
    __table_args__ = (
        Index('idx_team_metrics', 'team_id', 'metric_type', 'measured_at'),
        Index('idx_metric_period', 'period_start', 'period_end'),
        Index('idx_metric_performance', 'metric_value', 'improvement_percentage'),
        {'extend_existing': True}
    )

    def __repr__(self):
        return f"<TeamPerformanceMetric(id={self.id}, team_id={self.team_id}, type={self.metric_type})>"
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Enum as DBEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class TeamRoleEnum(enum.Enum):
    MEMBER = "member"
    LEADER = "leader"
    COORDINATOR = "coordinator"
    ADMIN = "admin"

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer(), primary_key=True, index=True)
    name = Column(String(), index=True, nullable=False)
    description = Column(String(), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    performance_metrics = relationship("TeamPerformanceMetric", back_populates="team", cascade="all, delete-orphan")
    skill_gaps = relationship("TeamSkillGap", back_populates="team", cascade="all, delete-orphan")
    workflows = relationship("TeamWorkflow", back_populates="team", cascade="all, delete-orphan")
    # If there's a direct link to User model for created_by or owner
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Assuming 'users' table
    creator = relationship("User", back_populates="created_teams")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer(), primary_key=True, index=True)
    team_id = Column(Integer(), ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer(), ForeignKey("users.id"), nullable=False) # Assuming 'users' table for user_id
    role = Column(DBEnum(TeamRoleEnum), default=TeamRoleEnum.MEMBER, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    custom_attributes = Column(JSON, nullable=True) # For any additional member-specific info

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships") # Assuming User model has 'team_memberships'


class TeamPerformanceMetric(Base):
    __tablename__ = "team_performance_metrics"

    id = Column(Integer(), primary_key=True, index=True)
    team_id = Column(Integer(), ForeignKey("teams.id"), nullable=False)
    metric_name = Column(String(), nullable=False)
    metric_value = Column(JSON, nullable=False) # Could be a numerical value, or a JSON object for complex metrics
    recorded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String(), nullable=True)

    team = relationship("Team", back_populates="performance_metrics")


class TeamSkillGap(Base):
    __tablename__ = "team_skill_gaps"

    id = Column(Integer(), primary_key=True, index=True)
    team_id = Column(Integer(), ForeignKey("teams.id"), nullable=False)
    skill_name = Column(String(), nullable=False)
    description = Column(String(), nullable=True)
    identified_at = Column(DateTime, default=datetime.utcnow)
    priority = Column(Integer(), default=0) # e.g., 0-low, 1-medium, 2-high
    suggested_development_plan = Column(String(), nullable=True)

    team = relationship("Team", back_populates="skill_gaps")


class TeamWorkflow(Base):
    __tablename__ = "team_workflows"

    id = Column(Integer(), primary_key=True, index=True)
    team_id = Column(Integer(), ForeignKey("teams.id"), nullable=False)
    workflow_name = Column(String(), nullable=False)
    description = Column(String(), nullable=True)
    steps = Column(JSON, nullable=True) # Store workflow steps as a JSON array of objects
    is_optimized = Column(Integer(), default=0) # 0 for not optimized, 1 for optimized
    optimization_suggestions = Column(JSON, nullable=True) # Store suggestions as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team = relationship("Team", back_populates="workflows")

# To make these models usable, they need to be imported in digame/app/models/__init__.py
# And the User model needs to be updated if back_populates are used.
# For example, in digame/app/models/user.py, the User model would need:
# created_teams = relationship("Team", back_populates="creator")
# team_memberships = relationship("TeamMember", back_populates="user")

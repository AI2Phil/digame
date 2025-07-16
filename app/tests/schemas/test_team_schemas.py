import pytest
from pydantic import ValidationError
from datetime import datetime
from typing import List, Dict, Any

from app.schemas.team_schemas import (
    TeamBase, TeamCreate, TeamUpdate, Team, TeamWithMembers, TeamWithFullDetails,
    TeamMemberBase, TeamMemberCreate, TeamMemberUpdate, TeamMember, TeamMemberAction,
    TeamPerformanceMetricBase, TeamPerformanceMetricCreate, TeamPerformanceMetricUpdate, TeamPerformanceMetric,
    TeamSkillGapBase, TeamSkillGapCreate, TeamSkillGapUpdate, TeamSkillGap,
    TeamWorkflowBase, TeamWorkflowCreate, TeamWorkflowUpdate, TeamWorkflow,
    TeamAnalyticsDashboard, TeamCollaborationPattern, TeamRoleEnumSchema
)

# Test Team Schemas
def test_team_base_valid():
    data = {"name": "Valid Team Name", "description": "A valid description."}
    team = TeamBase(**data)
    assert team.name == data["name"]
    assert team.description == data["description"]

def test_team_base_name_too_short():
    with pytest.raises(ValidationError):
        TeamBase(name="T", description="Short name")

def test_team_create_valid():
    member_data = {"user_id": 1, "role": TeamRoleEnumSchema.ADMIN}
    data = {"name": "New Team", "description": "Team to be created.", "created_by_user_id": 100, "initial_members": [TeamMemberCreate(**member_data)]}  # type: ignore
    team_create = TeamCreate(**data)  # type: ignore
    assert team_create.name == data["name"]
    assert team_create.created_by_user_id == 100
    assert len(team_create.initial_members) == 1  # type: ignore
    assert team_create.initial_members[0].user_id == 1  # type: ignore
    assert team_create.initial_members[0].role == TeamRoleEnumSchema.ADMIN  # type: ignore

def test_team_update_valid():
    data = {"name": "Updated Team Name", "description": "Updated description."}
    team_update = TeamUpdate(**data)
    assert team_update.name == data["name"]
    assert team_update.description == data["description"]
    data_partial = {"name": "Only Name Updated"}
    team_update_partial = TeamUpdate(**data_partial)
    assert team_update_partial.name == data_partial["name"]
    assert team_update_partial.description is None

def test_team_response_schema():
    now = datetime.utcnow()
    member_data = {
        "id": 1, "team_id": 1, "user_id": 10, "role": TeamRoleEnumSchema.MEMBER,
        "joined_at": now, "custom_attributes": {"skill": "API testing"}
    }
    team_data = {
        "id": 1, "name": "Full Team", "description": "Team with all details",
        "created_at": now, "updated_at": now, "created_by_user_id": 100,
        "members": [TeamMember(**member_data)]  # type: ignore
    }
    team = Team(**team_data)  # type: ignore
    assert team.id == 1
    assert team.name == "Full Team"
    assert len(team.members) == 1
    assert team.members[0].user_id == 10
    assert team.members[0].custom_attributes["skill"] == "API testing"  # type: ignore


# Test TeamMember Schemas
def test_team_member_base_valid():
    data = {"user_id": 1, "role": TeamRoleEnumSchema.LEADER, "custom_attributes": {"timezone": "UTC"}}
    member = TeamMemberBase(**data)  # type: ignore
    assert member.user_id == 1
    assert member.role == TeamRoleEnumSchema.LEADER
    assert member.custom_attributes["timezone"] == "UTC"  # type: ignore

def test_team_member_create_default_role():
    data = {"user_id": 2} # Role should default to MEMBER
    member_create = TeamMemberCreate(**data)  # type: ignore
    assert member_create.user_id == 2
    assert member_create.role == TeamRoleEnumSchema.MEMBER

def test_team_member_update_valid():
    data = {"role": TeamRoleEnumSchema.ADMIN}
    member_update = TeamMemberUpdate(**data)  # type: ignore
    assert member_update.role == TeamRoleEnumSchema.ADMIN
    assert member_update.custom_attributes is None

def test_team_member_action_valid():
    data = {"user_id": 5, "role": TeamRoleEnumSchema.COORDINATOR}
    action = TeamMemberAction(**data)  # type: ignore
    assert action.user_id == 5
    assert action.role == TeamRoleEnumSchema.COORDINATOR

# Test TeamPerformanceMetric Schemas
def test_team_performance_metric_base_valid():
    data = {"metric_name": "Response Time", "metric_value": {"avg_ms": 120, "p95_ms": 300}, "notes": "Weekly average"}
    metric = TeamPerformanceMetricBase(**data)  # type: ignore
    assert metric.metric_name == "Response Time"
    assert metric.metric_value["avg_ms"] == 120

def test_team_performance_metric_create_valid():
    data = {"team_id": 1, "metric_name": "Uptime", "metric_value": {"percentage": 99.99}}
    metric_create = TeamPerformanceMetricCreate(**data)  # type: ignore
    assert metric_create.team_id == 1
    assert metric_create.metric_name == "Uptime"

# Test TeamSkillGap Schemas
def test_team_skill_gap_base_valid():
    data = {"skill_name": "Cloud Architecture", "description": "Need more expertise in AWS serverless.", "priority": 1, "suggested_development_plan": "Take AWS certification course"}
    skill_gap = TeamSkillGapBase(**data)  # type: ignore
    assert skill_gap.skill_name == "Cloud Architecture"
    assert skill_gap.priority == 1

def test_team_skill_gap_priority_invalid():
    with pytest.raises(ValidationError):
        TeamSkillGapBase(skill_name="Test Skill", description="Test desc", suggested_development_plan="Test plan", priority=5)  # Priority must be 0, 1, or 2
    with pytest.raises(ValidationError):
        TeamSkillGapBase(skill_name="Test Skill", description="Test desc", suggested_development_plan="Test plan", priority=-1)

# Test TeamWorkflow Schemas
def test_team_workflow_base_valid():
    steps_data = [{"name": "Initial Review", "duration": "1 day"}, {"name": "Approval", "required_role": "leader"}]
    data = {"workflow_name": "Document Approval", "description": "Workflow for document approval", "steps": steps_data, "is_optimized": True}
    workflow = TeamWorkflowBase(**data)  # type: ignore
    assert workflow.workflow_name == "Document Approval"
    assert len(workflow.steps) == 2  # type: ignore
    assert workflow.steps[0]["duration"] == "1 day"  # type: ignore
    assert workflow.is_optimized is True

# Test TeamAnalyticsDashboard and TeamCollaborationPattern (more complex, example instantiation)
def test_team_analytics_dashboard_instantiation():
    now = datetime.utcnow()
    metric = TeamPerformanceMetric(id=1, team_id=1, metric_name="Tasks", metric_value={"done":10}, notes="Test notes", recorded_at=now)
    skill_gap = TeamSkillGap(id=1, team_id=1, skill_name="Python", description="Python skills needed", priority=1, suggested_development_plan="Take Python course", identified_at=now)
    workflow = TeamWorkflow(id=1, team_id=1, workflow_name="Dev", description="Development workflow", is_optimized=False, created_at=now, updated_at=now)
    pattern = TeamCollaborationPattern(pattern_name="Centralized", description="One person does all reviews", metrics={"key_person_id": 1})

    dashboard_data = {
        "team_id": 1,
        "overall_performance_score": 8.5,
        "key_metrics": [metric],
        "collaboration_patterns": [pattern],
        "identified_skill_gaps": [skill_gap],
        "workflow_optimizations_summary": [workflow],
        "team_development_progress": {"python_course_completion": "75%"}
    }
    dashboard = TeamAnalyticsDashboard(**dashboard_data)  # type: ignore
    assert dashboard.team_id == 1
    assert dashboard.overall_performance_score == 8.5
    assert len(dashboard.key_metrics) == 1
    assert dashboard.key_metrics[0].metric_name == "Tasks"

def test_team_with_full_details_schema():
    now = datetime.utcnow()
    member_data = TeamMember(id=1, team_id=1, user_id=10, role=TeamRoleEnumSchema.MEMBER, joined_at=now)
    metric_data = TeamPerformanceMetric(id=1, team_id=1, metric_name="Metric1", metric_value={"val":1}, notes="Test notes", recorded_at=now)
    skill_gap_data = TeamSkillGap(id=1, team_id=1, skill_name="Skill1", description="Skill description", priority=1, suggested_development_plan="Development plan", identified_at=now)
    workflow_data = TeamWorkflow(id=1, team_id=1, workflow_name="Workflow1", description="Workflow description", created_at=now, updated_at=now)

    team_full_details_data = {
        "id": 1, "name": "Super Team", "created_at": now, "updated_at": now,
        "members": [member_data],
        "performance_metrics": [metric_data],
        "skill_gaps": [skill_gap_data],
        "workflows": [workflow_data]
    }
    team_details = TeamWithFullDetails(**team_full_details_data)  # type: ignore
    assert team_details.name == "Super Team"
    assert len(team_details.members) == 1
    assert len(team_details.performance_metrics) == 1
    assert team_details.performance_metrics[0].metric_name == "Metric1"
    assert len(team_details.skill_gaps) == 1
    assert len(team_details.workflows) == 1
    assert team_details.workflows[0].workflow_name == "Workflow1"

# Example of invalid enum value for role
def test_team_member_base_invalid_role():
    with pytest.raises(ValidationError) as excinfo:
        TeamMemberBase(user_id=1, role="invalid_role")  # type: ignore
    assert "Input should be 'member', 'leader', 'coordinator' or 'admin'" in str(excinfo.value)

# Test optional fields
def test_team_create_optional_fields():
    data = {"name": "Minimal Team"} # No description, created_by_user_id, or initial_members
    team_create = TeamCreate(**data)  # type: ignore
    assert team_create.name == data["name"]
    assert team_create.description is None
    assert team_create.created_by_user_id is None
    assert team_create.initial_members is None

def test_team_workflow_is_optimized_conversion():
    # Pydantic should handle bool for is_optimized even if model uses Integer
    data_true = {"workflow_name": "Test Flow", "description": "Test description", "is_optimized": True}
    workflow_true = TeamWorkflowBase(**data_true)  # type: ignore
    assert workflow_true.is_optimized is True

    data_false = {"workflow_name": "Test Flow", "description": "Test description", "is_optimized": False}
    workflow_false = TeamWorkflowBase(**data_false)  # type: ignore
    assert workflow_false.is_optimized is False

    # Pydantic converts truthy/falsy values to boolean by default
    # 0 should convert to False, 1 should convert to True
    data_int_false = {"workflow_name": "Test Flow", "description": "Test description", "is_optimized": 0}
    workflow_int_false = TeamWorkflowBase(**data_int_false)  # type: ignore
    assert workflow_int_false.is_optimized is False

    data_int_true = {"workflow_name": "Test Flow", "description": "Test description", "is_optimized": 1}
    workflow_int_true = TeamWorkflowBase(**data_int_true)  # type: ignore
    assert workflow_int_true.is_optimized is True

    # Test default value
    assert TeamWorkflowBase(workflow_name="Test Flow", description="Test description").is_optimized is False # Default

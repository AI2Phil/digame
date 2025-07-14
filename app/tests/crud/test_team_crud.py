import pytest
from sqlalchemy.orm import Session as SessionType

from app.models.user import User  # Import User directly to avoid registry conflicts
from app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum
from app.schemas import team_schemas as schemas # Alias for clarity
from app.crud import team_crud as crud # Alias for clarity
from app.tests.factories.user_factory import UserFactory

# Use database-level isolation to prevent User registry conflicts
@pytest.fixture(scope="function")
def shared_db(isolated_db: SessionType) -> SessionType:
    """Shared database session for all team crud tests"""
    return isolated_db

@pytest.fixture
def test_user1(shared_db: SessionType) -> User:
    # Use UserFactory to create user with database-level isolation
    return UserFactory.create_user(
        shared_db,
        username="cruduser1",
        email="crud1@example.com",
        hashed_password="password",
        first_name="CRUD",
        last_name="User1"
    )

@pytest.fixture
def test_user2(shared_db: SessionType) -> User:
    # Use UserFactory to create user with database-level isolation
    return UserFactory.create_user(
        shared_db,
        username="cruduser2",
        email="crud2@example.com",
        hashed_password="password",
        first_name="CRUD",
        last_name="User2"
    )

# Team CRUD tests
def test_crud_create_team(shared_db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="CRUD Test Team", description="Team for CRUD testing", created_by_user_id=getattr(test_user1, 'id'))  # type: ignore
    team = crud.create_team(shared_db, team=team_create_schema)

    assert team.id is not None
    assert team.name == "CRUD Test Team"
    assert getattr(team, 'created_by_user_id') == getattr(test_user1, 'id')  # type: ignore
    assert shared_db.query(Team).count() == 1

def test_crud_create_team_with_initial_members(shared_db: SessionType, test_user1: User, test_user2: User):
    initial_member1 = schemas.TeamMemberCreate(user_id=getattr(test_user1, 'id'), role=schemas.TeamRoleEnumSchema.ADMIN)  # type: ignore
    initial_member2 = schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id'), role=schemas.TeamRoleEnumSchema.MEMBER)  # type: ignore
    team_create_schema = schemas.TeamCreate(
        name="Team With Members",
        description="Team with initial members",
        initial_members=[initial_member1, initial_member2]
    )
    team = crud.create_team(shared_db, team=team_create_schema, created_by_user_id=getattr(test_user1, 'id'))  # type: ignore

    assert team.id is not None
    shared_db.refresh(team) # Ensure members are loaded
    assert len(getattr(team, 'members', [])) == 2  # type: ignore
    assert any(getattr(m, 'user_id') == getattr(test_user1, 'id') and getattr(m, 'role') == TeamRoleEnum.ADMIN for m in getattr(team, 'members', []))  # type: ignore
    assert any(getattr(m, 'user_id') == getattr(test_user2, 'id') and getattr(m, 'role') == TeamRoleEnum.MEMBER for m in getattr(team, 'members', []))  # type: ignore

def test_crud_get_team(shared_db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Get Me Team", description="Team to get", created_by_user_id=getattr(test_user1, 'id'))  # type: ignore
    created_team = crud.create_team(shared_db, team=team_create_schema)

    retrieved_team = crud.get_team(shared_db, team_id=getattr(created_team, 'id'))  # type: ignore
    assert retrieved_team is not None
    assert getattr(retrieved_team, 'id') == getattr(created_team, 'id')  # type: ignore
    assert retrieved_team.name == "Get Me Team"

def test_crud_get_teams(shared_db: SessionType, test_user1: User):
    crud.create_team(shared_db, team=schemas.TeamCreate(name="Team A", description="Team A", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team(shared_db, team=schemas.TeamCreate(name="Team B", description="Team B", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore

    teams = crud.get_teams(shared_db, skip=0, limit=10)
    assert len(teams) == 2
    teams_page2 = crud.get_teams(shared_db, skip=1, limit=1)
    assert len(teams_page2) == 1
    assert teams_page2[0].name == "Team B" # Assuming order by ID or insertion

def test_crud_update_team(shared_db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Old Name Team", description="Old description", created_by_user_id=getattr(test_user1, 'id'))  # type: ignore
    team = crud.create_team(shared_db, team=team_create_schema)

    team_update_schema = schemas.TeamUpdate(name="New Name Team", description="Updated description")
    updated_team = crud.update_team(shared_db, team_id=getattr(team, 'id'), team_update=team_update_schema)  # type: ignore

    assert updated_team is not None
    assert updated_team.name == "New Name Team"
    assert updated_team.description == "Updated description"

def test_crud_delete_team(shared_db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Delete Me Team", description="Team to delete", created_by_user_id=getattr(test_user1, 'id'))  # type: ignore
    team = crud.create_team(shared_db, team=team_create_schema)
    team_id = getattr(team, 'id')  # type: ignore

    deleted_team = crud.delete_team(shared_db, team_id=team_id)  # type: ignore
    assert deleted_team is not None
    assert crud.get_team(shared_db, team_id=team_id) is None  # type: ignore
    assert shared_db.query(Team).filter(Team.id == team_id).first() is None

# TeamMember CRUD tests
def test_crud_create_team_member(shared_db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Membership Team", description="Team for membership", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    member_schema = schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id'), role=schemas.TeamRoleEnumSchema.COORDINATOR)  # type: ignore

    shared_db_member = crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=member_schema)  # type: ignore
    assert shared_db_member.id is not None
    assert getattr(shared_db_member, 'user_id') == getattr(test_user2, 'id')  # type: ignore
    assert getattr(shared_db_member, 'team_id') == getattr(team, 'id')  # type: ignore
    assert shared_db_member.role == TeamRoleEnum.COORDINATOR

def test_crud_create_existing_team_member_returns_existing(shared_db: SessionType, test_user1: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Existing Member Team", description="Team for existing member", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    member_schema = schemas.TeamMemberCreate(user_id=getattr(test_user1, 'id'), role=schemas.TeamRoleEnumSchema.ADMIN)  # type: ignore

    first_creation = crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=member_schema)  # type: ignore
    second_attempt = crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=member_schema)  # type: ignore

    assert getattr(first_creation, 'id') == getattr(second_attempt, 'id')  # type: ignore
    assert shared_db.query(TeamMember).filter(TeamMember.team_id == getattr(team, 'id'), TeamMember.user_id == getattr(test_user1, 'id')).count() == 1  # type: ignore


def test_crud_get_team_member(shared_db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Get Member Team", description="Team to get member", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id')))  # type: ignore

    member = crud.get_team_member(shared_db, team_id=getattr(team, 'id'), user_id=getattr(test_user2, 'id'))  # type: ignore
    assert member is not None
    assert getattr(member, 'user_id') == getattr(test_user2, 'id')  # type: ignore

def test_crud_get_team_members(shared_db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="List Members Team", description="Team to list members", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=schemas.TeamMemberCreate(user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id')))  # type: ignore

    members = crud.get_team_members(shared_db, team_id=getattr(team, 'id'))  # type: ignore
    assert len(members) == 2

def test_crud_update_team_member(shared_db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Update Member Team", description="Team to update member", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id'), role=schemas.TeamRoleEnumSchema.MEMBER))  # type: ignore

    update_schema = schemas.TeamMemberUpdate(role=schemas.TeamRoleEnumSchema.LEADER, custom_attributes={"skill": "testing"})
    updated_member = crud.update_team_member(shared_db, team_id=getattr(team, 'id'), user_id=getattr(test_user2, 'id'), member_update=update_schema)  # type: ignore

    assert updated_member is not None
    assert updated_member.role == TeamRoleEnum.LEADER
    assert updated_member.custom_attributes["skill"] == "testing"

def test_crud_delete_team_member(shared_db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Delete Member Team", description="Team to delete member", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    crud.create_team_member(shared_db, team_id=getattr(team, 'id'), member=schemas.TeamMemberCreate(user_id=getattr(test_user2, 'id')))  # type: ignore

    deleted_member = crud.delete_team_member(shared_db, team_id=getattr(team, 'id'), user_id=getattr(test_user2, 'id'))  # type: ignore
    assert deleted_member is not None
    assert crud.get_team_member(shared_db, team_id=getattr(team, 'id'), user_id=getattr(test_user2, 'id')) is None  # type: ignore

# Generic CRUD for PerformanceMetric, SkillGap, Workflow
# For brevity, testing one set (e.g., TeamPerformanceMetric) thoroughly
def test_crud_team_performance_metric(shared_db: SessionType, test_user1: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Metric Team", description="Team for metrics", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    metric_schema = schemas.TeamPerformanceMetricCreate(
        team_id=getattr(team, 'id'), metric_name="Tasks Done", metric_value={"count": 10}  # type: ignore
    )

    # Create
    metric = crud.create_team_performance_metric(shared_db, metric=metric_schema)
    assert metric.id is not None
    assert metric.metric_name == "Tasks Done"
    assert getattr(metric, 'team_id') == getattr(team, 'id')  # type: ignore

    # Get by ID
    retrieved_metric = crud.get_team_performance_metric(shared_db, metric_id=getattr(metric, 'id'))  # type: ignore
    assert retrieved_metric is not None
    assert getattr(retrieved_metric, 'id') == getattr(metric, 'id')  # type: ignore

    # Get for Team
    metrics_for_team = crud.get_team_performance_metrics_for_team(shared_db, team_id=getattr(team, 'id'))  # type: ignore
    assert len(metrics_for_team) == 1
    assert getattr(metrics_for_team[0], 'id') == getattr(metric, 'id')  # type: ignore

    # Update
    update_schema = schemas.TeamPerformanceMetricUpdate(metric_name="Tasks Super Done", metric_value={"count": 20}, notes="Updated notes")
    updated_metric = crud.update_team_performance_metric(shared_db, metric_id=getattr(metric, 'id'), metric_update=update_schema)  # type: ignore
    assert updated_metric is not None
    assert updated_metric.metric_name == "Tasks Super Done"
    assert updated_metric.metric_value["count"] == 20

    # Delete
    deleted_metric = crud.delete_team_performance_metric(shared_db, metric_id=getattr(metric, 'id'))  # type: ignore
    assert deleted_metric is not None
    assert crud.get_team_performance_metric(shared_db, metric_id=getattr(metric, 'id')) is None  # type: ignore

# Similar tests should be written for TeamSkillGap and TeamWorkflow CRUD operations.
# Example for TeamSkillGap
def test_crud_team_skill_gap(shared_db: SessionType, test_user1: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="SkillGap Team", description="Team for skill gaps", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    skill_gap_schema = schemas.TeamSkillGapCreate(
        team_id=getattr(team, 'id'), skill_name="Python", description="Advanced Python needed"  # type: ignore
    )

    # Create
    skill_gap = crud.create_team_skill_gap(shared_db, skill_gap=skill_gap_schema)
    assert skill_gap.id is not None
    assert skill_gap.skill_name == "Python"

    # Get by ID, Get for Team, Update, Delete would follow the metric test pattern.

# Example for TeamWorkflow
def test_crud_team_workflow(shared_db: SessionType, test_user1: User):
    team = crud.create_team(shared_db, team=schemas.TeamCreate(name="Workflow Team", description="Team for workflows", created_by_user_id=getattr(test_user1, 'id')))  # type: ignore
    workflow_schema = schemas.TeamWorkflowCreate(
        team_id=getattr(team, 'id'), workflow_name="Onboarding", steps=[{"name": "Step 1"}]  # type: ignore
    )

    # Create
    workflow = crud.create_team_workflow(shared_db, workflow=workflow_schema)
    assert workflow.id is not None
    assert workflow.workflow_name == "Onboarding"

    # Get by ID, Get for Team, Update, Delete would follow the metric test pattern.

# Note: Ensure that the `Base` used in the fixture is the one that all models (User, Team, etc.) are registered with.
# This is crucial for `Base.metadata.create_all(bind=engine)` to work correctly.
# The current setup assumes `digame.app.models.user.Base` is that central Base.
# If `team.py` defines its own Base, it needs to be changed to import and use the central Base.

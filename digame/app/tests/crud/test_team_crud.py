import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as SessionType

from digame.app.models.user import Base, User
from digame.app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum
from digame.app.schemas import team_schemas as schemas # Alias for clarity
from digame.app.crud import team_crud as crud # Alias for clarity

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db() -> SessionType:
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user1(db: SessionType) -> User:
    user = User(username="cruduser1", email="crud1@example.com", hashed_password="password")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_user2(db: SessionType) -> User:
    user = User(username="cruduser2", email="crud2@example.com", hashed_password="password")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Team CRUD tests
def test_crud_create_team(db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="CRUD Test Team", description="Team for CRUD testing", created_by_user_id=test_user1.id)
    team = crud.create_team(db, team=team_create_schema)

    assert team.id is not None
    assert team.name == "CRUD Test Team"
    assert team.created_by_user_id == test_user1.id
    assert db.query(Team).count() == 1

def test_crud_create_team_with_initial_members(db: SessionType, test_user1: User, test_user2: User):
    initial_member1 = schemas.TeamMemberCreate(user_id=test_user1.id, role=schemas.TeamRoleEnumSchema.ADMIN)
    initial_member2 = schemas.TeamMemberCreate(user_id=test_user2.id, role=schemas.TeamRoleEnumSchema.MEMBER)
    team_create_schema = schemas.TeamCreate(
        name="Team With Members",
        initial_members=[initial_member1, initial_member2]
    )
    team = crud.create_team(db, team=team_create_schema, created_by_user_id=test_user1.id) # Creator specified

    assert team.id is not None
    db.refresh(team) # Ensure members are loaded
    assert len(team.members) == 2
    assert any(m.user_id == test_user1.id and m.role.value == "admin" for m in team.members)
    assert any(m.user_id == test_user2.id and m.role.value == "member" for m in team.members)

def test_crud_get_team(db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Get Me Team", created_by_user_id=test_user1.id)
    created_team = crud.create_team(db, team=team_create_schema)

    retrieved_team = crud.get_team(db, team_id=created_team.id)
    assert retrieved_team is not None
    assert retrieved_team.id == created_team.id
    assert retrieved_team.name == "Get Me Team"

def test_crud_get_teams(db: SessionType, test_user1: User):
    crud.create_team(db, team=schemas.TeamCreate(name="Team A", created_by_user_id=test_user1.id))
    crud.create_team(db, team=schemas.TeamCreate(name="Team B", created_by_user_id=test_user1.id))

    teams = crud.get_teams(db, skip=0, limit=10)
    assert len(teams) == 2
    teams_page2 = crud.get_teams(db, skip=1, limit=1)
    assert len(teams_page2) == 1
    assert teams_page2[0].name == "Team B" # Assuming order by ID or insertion

def test_crud_update_team(db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Old Name Team", created_by_user_id=test_user1.id)
    team = crud.create_team(db, team=team_create_schema)

    team_update_schema = schemas.TeamUpdate(name="New Name Team", description="Updated description")
    updated_team = crud.update_team(db, team_id=team.id, team_update=team_update_schema)

    assert updated_team is not None
    assert updated_team.name == "New Name Team"
    assert updated_team.description == "Updated description"

def test_crud_delete_team(db: SessionType, test_user1: User):
    team_create_schema = schemas.TeamCreate(name="Delete Me Team", created_by_user_id=test_user1.id)
    team = crud.create_team(db, team=team_create_schema)
    team_id = team.id

    deleted_team = crud.delete_team(db, team_id=team_id)
    assert deleted_team is not None
    assert crud.get_team(db, team_id=team_id) is None
    assert db.query(Team).filter(Team.id == team_id).first() is None

# TeamMember CRUD tests
def test_crud_create_team_member(db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Membership Team", created_by_user_id=test_user1.id))
    member_schema = schemas.TeamMemberCreate(user_id=test_user2.id, role=schemas.TeamRoleEnumSchema.COORDINATOR)

    db_member = crud.create_team_member(db, team_id=team.id, member=member_schema)
    assert db_member.id is not None
    assert db_member.user_id == test_user2.id
    assert db_member.team_id == team.id
    assert db_member.role == TeamRoleEnum.COORDINATOR

def test_crud_create_existing_team_member_returns_existing(db: SessionType, test_user1: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Existing Member Team", created_by_user_id=test_user1.id))
    member_schema = schemas.TeamMemberCreate(user_id=test_user1.id, role=schemas.TeamRoleEnumSchema.ADMIN)

    first_creation = crud.create_team_member(db, team_id=team.id, member=member_schema)
    second_attempt = crud.create_team_member(db, team_id=team.id, member=member_schema) # Attempt to create again

    assert first_creation.id == second_attempt.id # Should return the existing member
    assert db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == test_user1.id).count() == 1


def test_crud_get_team_member(db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Get Member Team", created_by_user_id=test_user1.id))
    crud.create_team_member(db, team_id=team.id, member=schemas.TeamMemberCreate(user_id=test_user2.id))

    member = crud.get_team_member(db, team_id=team.id, user_id=test_user2.id)
    assert member is not None
    assert member.user_id == test_user2.id

def test_crud_get_team_members(db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="List Members Team", created_by_user_id=test_user1.id))
    crud.create_team_member(db, team_id=team.id, member=schemas.TeamMemberCreate(user_id=test_user1.id))
    crud.create_team_member(db, team_id=team.id, member=schemas.TeamMemberCreate(user_id=test_user2.id))

    members = crud.get_team_members(db, team_id=team.id)
    assert len(members) == 2

def test_crud_update_team_member(db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Update Member Team", created_by_user_id=test_user1.id))
    crud.create_team_member(db, team_id=team.id, member=schemas.TeamMemberCreate(user_id=test_user2.id, role=schemas.TeamRoleEnumSchema.MEMBER))

    update_schema = schemas.TeamMemberUpdate(role=schemas.TeamRoleEnumSchema.LEADER, custom_attributes={"skill": "testing"})
    updated_member = crud.update_team_member(db, team_id=team.id, user_id=test_user2.id, member_update=update_schema)

    assert updated_member is not None
    assert updated_member.role == TeamRoleEnum.LEADER
    assert updated_member.custom_attributes["skill"] == "testing"

def test_crud_delete_team_member(db: SessionType, test_user1: User, test_user2: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Delete Member Team", created_by_user_id=test_user1.id))
    crud.create_team_member(db, team_id=team.id, member=schemas.TeamMemberCreate(user_id=test_user2.id))

    deleted_member = crud.delete_team_member(db, team_id=team.id, user_id=test_user2.id)
    assert deleted_member is not None
    assert crud.get_team_member(db, team_id=team.id, user_id=test_user2.id) is None

# Generic CRUD for PerformanceMetric, SkillGap, Workflow
# For brevity, testing one set (e.g., TeamPerformanceMetric) thoroughly
def test_crud_team_performance_metric(db: SessionType, test_user1: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Metric Team", created_by_user_id=test_user1.id))
    metric_schema = schemas.TeamPerformanceMetricCreate(
        team_id=team.id, metric_name="Tasks Done", metric_value={"count": 10}
    )

    # Create
    metric = crud.create_team_performance_metric(db, metric=metric_schema)
    assert metric.id is not None
    assert metric.metric_name == "Tasks Done"
    assert metric.team_id == team.id

    # Get by ID
    retrieved_metric = crud.get_team_performance_metric(db, metric_id=metric.id)
    assert retrieved_metric is not None
    assert retrieved_metric.id == metric.id

    # Get for Team
    metrics_for_team = crud.get_team_performance_metrics_for_team(db, team_id=team.id)
    assert len(metrics_for_team) == 1
    assert metrics_for_team[0].id == metric.id

    # Update
    update_schema = schemas.TeamPerformanceMetricUpdate(metric_name="Tasks Super Done", metric_value={"count": 20})
    updated_metric = crud.update_team_performance_metric(db, metric_id=metric.id, metric_update=update_schema)
    assert updated_metric is not None
    assert updated_metric.metric_name == "Tasks Super Done"
    assert updated_metric.metric_value["count"] == 20

    # Delete
    deleted_metric = crud.delete_team_performance_metric(db, metric_id=metric.id)
    assert deleted_metric is not None
    assert crud.get_team_performance_metric(db, metric_id=metric.id) is None

# Similar tests should be written for TeamSkillGap and TeamWorkflow CRUD operations.
# Example for TeamSkillGap
def test_crud_team_skill_gap(db: SessionType, test_user1: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="SkillGap Team", created_by_user_id=test_user1.id))
    skill_gap_schema = schemas.TeamSkillGapCreate(
        team_id=team.id, skill_name="Python", description="Advanced Python needed"
    )

    # Create
    skill_gap = crud.create_team_skill_gap(db, skill_gap=skill_gap_schema)
    assert skill_gap.id is not None
    assert skill_gap.skill_name == "Python"

    # Get by ID, Get for Team, Update, Delete would follow the metric test pattern.

# Example for TeamWorkflow
def test_crud_team_workflow(db: SessionType, test_user1: User):
    team = crud.create_team(db, team=schemas.TeamCreate(name="Workflow Team", created_by_user_id=test_user1.id))
    workflow_schema = schemas.TeamWorkflowCreate(
        team_id=team.id, workflow_name="Onboarding", steps=[{"name": "Step 1"}]
    )

    # Create
    workflow = crud.create_team_workflow(db, workflow=workflow_schema)
    assert workflow.id is not None
    assert workflow.workflow_name == "Onboarding"

    # Get by ID, Get for Team, Update, Delete would follow the metric test pattern.

# Note: Ensure that the `Base` used in the fixture is the one that all models (User, Team, etc.) are registered with.
# This is crucial for `Base.metadata.create_all(bind=engine)` to work correctly.
# The current setup assumes `digame.app.models.user.Base` is that central Base.
# If `team.py` defines its own Base, it needs to be changed to import and use the central Base.

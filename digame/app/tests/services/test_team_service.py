import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as SessionType
from fastapi import HTTPException

from digame.app.models.user import Base, User
from digame.app.models.team import Team, TeamMember, TeamRoleEnum # Import necessary models
from digame.app.schemas import team_schemas as schemas
from digame.app.services.team_service import TeamService
from digame.app.crud import user_crud, team_crud # For direct CRUD ops in setup if needed

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
def team_service(db: SessionType) -> TeamService:
    return TeamService(db)

# Fixtures for users with different roles
@pytest.fixture
def regular_user(db: SessionType) -> User:
    user = User(username="regularuser", email="regular@example.com", hashed_password="password")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def team_creator_user(db: SessionType) -> User:
    user = User(username="creatoruser", email="creator@example.com", hashed_password="password")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def another_user(db: SessionType) -> User:
    user = User(username="anotheruser", email="another@example.com", hashed_password="password")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def sample_team(db: SessionType, team_service: TeamService, team_creator_user: User) -> Team:
    team_schema = schemas.TeamCreate(name="Service Test Team", description="A team for service tests")
    # The service's create_team method now automatically adds the creator as an admin.
    team = team_service.create_team(team_create=team_schema, current_user_id=team_creator_user.id)
    return team # team object from service.create_team is already committed and refreshed.

# Test Team Creation
def test_service_create_team(team_service: TeamService, team_creator_user: User):
    team_schema = schemas.TeamCreate(name="Awesome Team", description="This is an awesome team.")
    team = team_service.create_team(team_create=team_schema, current_user_id=team_creator_user.id)

    assert team.id is not None
    assert team.name == "Awesome Team"
    assert team.created_by_user_id == team_creator_user.id

    # Check if creator was added as admin member
    db_team = team_crud.get_team(team_service.db, team.id) # Fetch from DB to verify relationships
    assert db_team is not None
    assert len(db_team.members) == 1
    creator_member = db_team.members[0]
    assert creator_member.user_id == team_creator_user.id
    assert creator_member.role == TeamRoleEnum.ADMIN

def test_service_create_team_with_initial_members(team_service: TeamService, team_creator_user: User, regular_user: User):
    initial_member_schema = schemas.TeamMemberCreate(user_id=regular_user.id, role=schemas.TeamRoleEnumSchema.MEMBER)
    team_schema = schemas.TeamCreate(
        name="Team With Initial Members",
        initial_members=[initial_member_schema]
    )
    team = team_service.create_team(team_create=team_schema, current_user_id=team_creator_user.id)

    db_team = team_crud.get_team(team_service.db, team.id)
    assert len(db_team.members) == 2 # Creator (admin) + initial member
    assert any(m.user_id == team_creator_user.id and m.role == TeamRoleEnum.ADMIN for m in db_team.members)
    assert any(m.user_id == regular_user.id and m.role == TeamRoleEnum.MEMBER for m in db_team.members)

# Test Team Retrieval
def test_service_get_team(team_service: TeamService, sample_team: Team):
    retrieved_team = team_service.get_team(team_id=sample_team.id)
    assert retrieved_team is not None
    assert retrieved_team.id == sample_team.id
    assert retrieved_team.name == sample_team.name

def test_service_get_non_existent_team(team_service: TeamService):
    with pytest.raises(HTTPException) as exc_info:
        team_service.get_team(team_id=9999)
    assert exc_info.value.status_code == 404

# Test Team Update
def test_service_update_team_by_creator(team_service: TeamService, sample_team: Team, team_creator_user: User):
    update_schema = schemas.TeamUpdate(name="Updated Team Name by Creator")
    updated_team = team_service.update_team_details(
        team_id=sample_team.id,
        team_update=update_schema,
        current_user_id=team_creator_user.id
    )
    assert updated_team.name == "Updated Team Name by Creator"

def test_service_update_team_by_team_admin(db: SessionType, team_service: TeamService, sample_team: Team, another_user: User, team_creator_user: User):
    # Add 'another_user' as an admin to the sample_team
    team_crud.create_team_member(db, team_id=sample_team.id, member=schemas.TeamMemberCreate(user_id=another_user.id, role=schemas.TeamRoleEnumSchema.ADMIN))

    update_schema = schemas.TeamUpdate(description="Updated by team admin")
    updated_team = team_service.update_team_details(
        team_id=sample_team.id,
        team_update=update_schema,
        current_user_id=another_user.id
    )
    assert updated_team.description == "Updated by team admin"

def test_service_update_team_unauthorized(team_service: TeamService, sample_team: Team, regular_user: User):
    # regular_user is not creator or admin of sample_team
    update_schema = schemas.TeamUpdate(name="Attempted Update")
    with pytest.raises(HTTPException) as exc_info:
        team_service.update_team_details(
            team_id=sample_team.id,
            team_update=update_schema,
            current_user_id=regular_user.id
        )
    assert exc_info.value.status_code == 403

# Test Team Deletion (Simplified, assuming system admin logic is separate or mocked)
def test_service_delete_team_by_creator(team_service: TeamService, sample_team: Team, team_creator_user: User):
    response = team_service.remove_team(team_id=sample_team.id, current_user_id=team_creator_user.id)
    assert response["message"] == "Team deleted successfully"
    with pytest.raises(HTTPException): # Expect 404 when trying to get deleted team
        team_service.get_team(team_id=sample_team.id)

# Test Member Management
def test_service_add_team_member_by_admin(team_service: TeamService, sample_team: Team, team_creator_user: User, regular_user: User):
    # team_creator_user is admin of sample_team
    member_action = schemas.TeamMemberAction(user_id=regular_user.id, role=schemas.TeamRoleEnumSchema.MEMBER)
    new_member = team_service.add_team_member(
        team_id=sample_team.id,
        member_action=member_action,
        current_user_id=team_creator_user.id
    )
    assert new_member.user_id == regular_user.id
    assert new_member.role == TeamRoleEnum.MEMBER

    db_team = team_crud.get_team(team_service.db, sample_team.id)
    assert len(db_team.members) == 2 # Creator + new member

def test_service_add_team_member_unauthorized(team_service: TeamService, sample_team: Team, regular_user: User, another_user: User):
    # regular_user is not admin/leader of sample_team
    member_action = schemas.TeamMemberAction(user_id=another_user.id)
    with pytest.raises(HTTPException) as exc_info:
        team_service.add_team_member(
            team_id=sample_team.id,
            member_action=member_action,
            current_user_id=regular_user.id # regular_user trying to add
        )
    assert exc_info.value.status_code == 403

def test_service_list_team_members(team_service: TeamService, sample_team: Team):
    members = team_service.list_team_members(team_id=sample_team.id)
    assert len(members) == 1 # Only the creator initially
    assert members[0].user_id == sample_team.created_by_user_id

def test_service_update_member_role_by_admin(db: SessionType, team_service: TeamService, sample_team: Team, team_creator_user: User, regular_user: User):
    # Add regular_user as a member first
    team_crud.create_team_member(db, team_id=sample_team.id, member=schemas.TeamMemberCreate(user_id=regular_user.id, role=schemas.TeamRoleEnumSchema.MEMBER))

    update_payload = schemas.TeamMemberUpdate(role=schemas.TeamRoleEnumSchema.LEADER)
    updated_member = team_service.update_team_member_role(
        team_id=sample_team.id,
        user_id_to_update=regular_user.id,
        member_update=update_payload,
        current_user_id=team_creator_user.id # Creator is admin
    )
    assert updated_member.role == TeamRoleEnum.LEADER

def test_service_remove_member_by_admin(team_service: TeamService, sample_team: Team, team_creator_user: User, regular_user: User):
    # Add regular_user as a member first
    team_crud.create_team_member(team_service.db, team_id=sample_team.id, member=schemas.TeamMemberCreate(user_id=regular_user.id, role=schemas.TeamRoleEnumSchema.MEMBER))

    # Ensure there are 2 members (creator + regular_user)
    db_team = team_crud.get_team(team_service.db, sample_team.id)
    assert len(db_team.members) == 2

    response = team_service.remove_member_from_team(
        team_id=sample_team.id,
        user_id_to_remove=regular_user.id,
        current_user_id=team_creator_user.id # Admin removes member
    )
    assert response["message"] == "Team member removed successfully"

    db_team_after_removal = team_crud.get_team(team_service.db, sample_team.id)
    assert len(db_team_after_removal.members) == 1 # Only creator should remain

def test_service_member_remove_self(team_service: TeamService, sample_team: Team, team_creator_user: User, regular_user: User):
    # Add regular_user as a member
    team_crud.create_team_member(team_service.db, team_id=sample_team.id, member=schemas.TeamMemberCreate(user_id=regular_user.id, role=schemas.TeamRoleEnumSchema.MEMBER))

    response = team_service.remove_member_from_team(
        team_id=sample_team.id,
        user_id_to_remove=regular_user.id, # User to remove is self
        current_user_id=regular_user.id    # Current user is self
    )
    assert response["message"] == "Team member removed successfully"


# Test Analytics (Placeholders in service, so tests will be basic)
def test_service_get_team_performance_analytics(team_service: TeamService, sample_team: Team, team_creator_user: User):
    # team_creator_user is a member (admin)
    analytics = team_service.get_team_performance_analytics(team_id=sample_team.id, current_user_id=team_creator_user.id)
    assert analytics.team_id == sample_team.id
    assert isinstance(analytics.key_metrics, list)
    assert isinstance(analytics.collaboration_patterns, list)
    # Further assertions based on expected placeholder data or actual logic if implemented

def test_service_get_team_analytics_unauthorized_non_member(team_service: TeamService, sample_team: Team, another_user: User):
    # another_user is not a member of sample_team
    with pytest.raises(HTTPException) as exc_info:
        team_service.get_team_performance_analytics(team_id=sample_team.id, current_user_id=another_user.id)
    assert exc_info.value.status_code == 403


# Tests for CRUD passthroughs (e.g., add_team_performance_metric)
def test_service_add_team_performance_metric_authorized(team_service: TeamService, sample_team: Team, team_creator_user: User):
    metric_create = schemas.TeamPerformanceMetricCreate(
        team_id=sample_team.id, metric_name="Service Metric", metric_value={"value": 100}
    )
    metric = team_service.add_team_performance_metric(
        team_id=sample_team.id, metric_create=metric_create, current_user_id=team_creator_user.id
    )
    assert metric.metric_name == "Service Metric"
    assert metric.team_id == sample_team.id

def test_service_add_team_metric_unauthorized(team_service: TeamService, sample_team: Team, regular_user: User):
    metric_create = schemas.TeamPerformanceMetricCreate(
        team_id=sample_team.id, metric_name="Unauthorized Metric", metric_value={"value": 10}
    )
    with pytest.raises(HTTPException) as exc_info:
        team_service.add_team_performance_metric(
            team_id=sample_team.id, metric_create=metric_create, current_user_id=regular_user.id
        )
    assert exc_info.value.status_code == 403

# Note: More tests would be needed for:
# - Edge cases in authorization (e.g., leader trying to do admin actions if distinction is important).
# - Logic within analyze_collaboration_patterns, etc., once implemented.
# - Behavior of is_system_admin if that becomes relevant for some operations.
# - All CRUD passthrough methods for SkillGap and Workflow.
# - Error handling for non-existent users when adding members etc. (service handles this).
# - Test the User model setup, if User is not found when creating a team (service handles this).

def test_service_create_team_creator_user_not_found(team_service: TeamService):
    team_schema = schemas.TeamCreate(name="Team with invalid creator")
    with pytest.raises(HTTPException) as exc_info:
        team_service.create_team(team_create=team_schema, current_user_id=99999) # Non-existent user ID
    assert exc_info.value.status_code == 404
    assert "Creating user not found" in exc_info.value.detail

def test_service_add_team_member_user_to_add_not_found(team_service: TeamService, sample_team: Team, team_creator_user: User):
    member_action = schemas.TeamMemberAction(user_id=88888) # Non-existent user to add
    with pytest.raises(HTTPException) as exc_info:
        team_service.add_team_member(
            team_id=sample_team.id,
            member_action=member_action,
            current_user_id=team_creator_user.id
        )
    assert exc_info.value.status_code == 404
    assert "User with ID 88888 not found" in exc_info.value.detail

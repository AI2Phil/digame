import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as SessionType
from typing import Generator, Any

from digame.app.main import app # Main FastAPI app
from digame.app.db import get_db # get_db dependency for overriding
from digame.app.models.user import Base, User
from digame.app.models.team import Team, TeamMember, TeamRoleEnum
from digame.app.schemas import team_schemas as schemas
from digame.app.auth.auth_dependencies import get_current_active_user # To mock or use

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency for tests
def override_get_db() -> Generator[SessionType, Any, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Test client
client = TestClient(app)

# Fixtures
@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function", autouse=True)
def clear_db_data():
    # This ensures each test function starts with a clean slate of data,
    # though tables are created/dropped once per session.
    # For more isolation, could move create/drop_all here.
    for table in reversed(Base.metadata.sorted_tables):
        engine.execute(table.delete())
    # No need to yield, this is just cleanup before each test if needed.
    # However, a fresh DB session per test from override_get_db handles data isolation well.

@pytest.fixture
def test_db_session() -> SessionType: # Direct session for setup, not for client
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_user_auth_token(test_db_session: SessionType) -> tuple[User, str]:
    # Create a user
    user_data = {"username": "routeruser", "email": "router@example.com", "password": "testpassword"}
    client.post("/auth/register", json=user_data) # Register user

    # Login to get token
    login_data = {"username": "routeruser", "password": "testpassword"}
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Retrieve user from DB to return the User object as well
    user = test_db_session.query(User).filter(User.username == "routeruser").first()
    assert user is not None
    return user, f"Bearer {token}"

@pytest.fixture
def another_user_auth_token(test_db_session: SessionType) -> tuple[User, str]:
    user_data = {"username": "anotherrouteruser", "email": "anotherrouter@example.com", "password": "testpassword2"}
    client.post("/auth/register", json=user_data)
    login_data = {"username": "anotherrouteruser", "password": "testpassword2"}
    response = client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    user = test_db_session.query(User).filter(User.username == "anotherrouteruser").first()
    return user, f"Bearer {token}"


# --- Team Endpoint Tests ---
def test_router_create_team(test_user_auth_token: tuple[User, str]):
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    team_data = {"name": "Router Test Team", "description": "Created via router"}

    response = client.post("/teams/", json=team_data, headers=headers)
    assert response.status_code == 201
    created_team = response.json()
    assert created_team["name"] == "Router Test Team"
    assert created_team["created_by_user_id"] == user.id
    assert "id" in created_team

    # Verify creator is admin
    team_id = created_team["id"]
    res_team_details = client.get(f"/teams/{team_id}", headers=headers)
    assert res_team_details.status_code == 200
    team_details = res_team_details.json()
    assert len(team_details["members"]) == 1
    assert team_details["members"][0]["user_id"] == user.id
    assert team_details["members"][0]["role"] == "admin"


def test_router_get_teams(test_user_auth_token: tuple[User, str]):
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    client.post("/teams/", json={"name": "Team Alpha"}, headers=headers)
    client.post("/teams/", json={"name": "Team Beta"}, headers=headers)

    response = client.get("/teams/", headers=headers)
    assert response.status_code == 200
    teams_list = response.json()
    assert len(teams_list) >= 2 # Could be more if other tests ran and didn't clean fully
    assert any(t["name"] == "Team Alpha" for t in teams_list)
    assert any(t["name"] == "Team Beta" for t in teams_list)

def test_router_get_specific_team(test_user_auth_token: tuple[User, str]):
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    team_data = {"name": "Specific Team"}
    create_response = client.post("/teams/", json=team_data, headers=headers)
    team_id = create_response.json()["id"]

    response = client.get(f"/teams/{team_id}", headers=headers)
    assert response.status_code == 200
    team_details = response.json()
    assert team_details["name"] == "Specific Team"
    assert team_details["id"] == team_id

def test_router_update_team(test_user_auth_token: tuple[User, str]):
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    team_data = {"name": "Old Name"}
    create_response = client.post("/teams/", json=team_data, headers=headers)
    team_id = create_response.json()["id"]

    update_data = {"name": "New Updated Name", "description": "Now with description"}
    response = client.put(f"/teams/{team_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    updated_team = response.json()
    assert updated_team["name"] == "New Updated Name"
    assert updated_team["description"] == "Now with description"

def test_router_delete_team(test_user_auth_token: tuple[User, str]):
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    team_data = {"name": "To Be Deleted"}
    create_response = client.post("/teams/", json=team_data, headers=headers)
    team_id = create_response.json()["id"]

    response = client.delete(f"/teams/{team_id}", headers=headers)
    assert response.status_code == 200

    get_response = client.get(f"/teams/{team_id}", headers=headers)
    assert get_response.status_code == 404 # Team should be gone


# --- Team Member Endpoint Tests ---
@pytest.fixture
def team_for_member_tests(test_user_auth_token: tuple[User, str]) -> int:
    user, token = test_user_auth_token
    headers = {"Authorization": token}
    team_data = {"name": "Member Management Team"}
    response = client.post("/teams/", json=team_data, headers=headers)
    return response.json()["id"]

def test_router_add_team_member(
    team_for_member_tests: int,
    test_user_auth_token: tuple[User, str],
    another_user_auth_token: tuple[User, str]
):
    team_id = team_for_member_tests
    admin_user, admin_token = test_user_auth_token # This user created the team, so is admin
    user_to_add, _ = another_user_auth_token

    headers = {"Authorization": admin_token}
    member_data = {"user_id": user_to_add.id, "role": "member"}

    response = client.post(f"/teams/{team_id}/members", json=member_data, headers=headers)
    assert response.status_code == 201
    new_member = response.json()
    assert new_member["user_id"] == user_to_add.id
    assert new_member["role"] == "member"

def test_router_list_team_members(team_for_member_tests: int, test_user_auth_token: tuple[User, str]):
    team_id = team_for_member_tests
    admin_user, admin_token = test_user_auth_token
    headers = {"Authorization": admin_token}

    # Creator is already a member. Add one more for a list of 2.
    # Need a third user for this.
    user3_data = {"username": "user3router", "email": "user3@example.com", "password": "password3"}
    client.post("/auth/register", json=user3_data)
    login_data3 = {"username": "user3router", "password": "password3"}
    res3 = client.post("/auth/login", data=login_data3)
    user3_id = client.get("/auth/users/me", headers={"Authorization": f"Bearer {res3.json()['access_token']}"}).json()["id"]

    client.post(f"/teams/{team_id}/members", json={"user_id": user3_id, "role": "member"}, headers=headers)

    response = client.get(f"/teams/{team_id}/members", headers=headers)
    assert response.status_code == 200
    members_list = response.json()
    assert len(members_list) == 2
    assert any(m["user_id"] == admin_user.id for m in members_list)
    assert any(m["user_id"] == user3_id for m in members_list)


def test_router_update_team_member_role(
    team_for_member_tests: int,
    test_user_auth_token: tuple[User, str],
    another_user_auth_token: tuple[User, str]
):
    team_id = team_for_member_tests
    admin_user, admin_token = test_user_auth_token
    member_user, _ = another_user_auth_token
    headers = {"Authorization": admin_token}

    # Add member_user to the team first
    client.post(f"/teams/{team_id}/members", json={"user_id": member_user.id, "role": "member"}, headers=headers)

    update_role_data = {"role": "leader"}
    response = client.put(f"/teams/{team_id}/members/{member_user.id}", json=update_role_data, headers=headers)
    assert response.status_code == 200
    updated_member = response.json()
    assert updated_member["user_id"] == member_user.id
    assert updated_member["role"] == "leader"

def test_router_remove_team_member(
    team_for_member_tests: int,
    test_user_auth_token: tuple[User, str],
    another_user_auth_token: tuple[User, str]
):
    team_id = team_for_member_tests
    admin_user, admin_token = test_user_auth_token
    member_user, _ = another_user_auth_token
    headers = {"Authorization": admin_token}

    client.post(f"/teams/{team_id}/members", json={"user_id": member_user.id, "role": "member"}, headers=headers)

    response = client.delete(f"/teams/{team_id}/members/{member_user.id}", headers=headers)
    assert response.status_code == 200

    # Verify member is removed
    list_response = client.get(f"/teams/{team_id}/members", headers=headers)
    members_list = list_response.json()
    assert not any(m["user_id"] == member_user.id for m in members_list)


# --- Team Analytics Endpoint Test (basic) ---
def test_router_get_team_analytics(team_for_member_tests: int, test_user_auth_token: tuple[User, str]):
    team_id = team_for_member_tests
    user, token = test_user_auth_token
    headers = {"Authorization": token}

    response = client.get(f"/teams/{team_id}/analytics", headers=headers)
    assert response.status_code == 200
    analytics_data = response.json()
    assert analytics_data["team_id"] == team_id
    assert "key_metrics" in analytics_data
    assert "collaboration_patterns" in analytics_data


# --- Sub-entity CRUD (e.g., Metrics) ---
def test_router_crud_team_metric(team_for_member_tests: int, test_user_auth_token: tuple[User, str]):
    team_id = team_for_member_tests
    user, token = test_user_auth_token
    headers = {"Authorization": token}

    # Create Metric
    metric_data = {"team_id": team_id, "metric_name": "Router Tasks", "metric_value": {"completed": 50}}
    create_response = client.post(f"/teams/{team_id}/metrics", json=metric_data, headers=headers)
    assert create_response.status_code == 201
    created_metric = create_response.json()
    metric_id = created_metric["id"]
    assert created_metric["metric_name"] == "Router Tasks"

    # List Metrics for Team
    list_response = client.get(f"/teams/{team_id}/metrics", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    # Get Specific Metric
    get_response = client.get(f"/teams/metrics/{metric_id}", headers=headers) # Using the non-team-prefixed route
    assert get_response.status_code == 200
    assert get_response.json()["metric_name"] == "Router Tasks"

    # Update Metric
    update_metric_data = {"metric_name": "Updated Router Tasks", "metric_value": {"completed": 75}}
    put_response = client.put(f"/teams/metrics/{metric_id}", json=update_metric_data, headers=headers)
    assert put_response.status_code == 200
    assert put_response.json()["metric_value"]["completed"] == 75

    # Delete Metric
    delete_response = client.delete(f"/teams/metrics/{metric_id}", headers=headers)
    assert delete_response.status_code == 200

    get_after_delete_response = client.get(f"/teams/metrics/{metric_id}", headers=headers)
    assert get_after_delete_response.status_code == 404

# TODO: Add similar comprehensive CRUD tests for /skillgaps and /workflows endpoints.
# TODO: Test authorization for various roles (non-admin trying to modify, non-member trying to view).
# Example: Non-admin trying to add member
def test_router_add_member_unauthorized(
    team_for_member_tests: int,
    another_user_auth_token: tuple[User, str], # This user is not admin of the team
    test_db_session: SessionType
):
    team_id = team_for_member_tests
    non_admin_user, non_admin_token = another_user_auth_token

    # Need a third user to try to add
    user3 = User(username="user3foradd", email="u3@example.com", hashed_password="pw")
    test_db_session.add(user3)
    test_db_session.commit()
    test_db_session.refresh(user3)

    headers = {"Authorization": non_admin_token}
    member_data = {"user_id": user3.id, "role": "member"}

    response = client.post(f"/teams/{team_id}/members", json=member_data, headers=headers)
    assert response.status_code == 403 # Forbidden

# Note: The `clear_db_data` fixture is a bit aggressive if tests are not perfectly isolated
# or depend on state from previous tests (which they shouldn't).
# A better approach for full test isolation is to ensure each test that modifies data
# cleans up after itself, or rely on the fresh DB session per test which `override_get_db` provides.
# The current `create_test_tables` fixture is session-scoped, meaning tables are created once.
# Data itself should be managed per test via the fresh DB session.
# `clear_db_data` using `autouse=True` might be redundant if sessions are isolated.
# For `TestClient`, the session isolation is handled by `app.dependency_overrides[get_db] = override_get_db`.
# The direct `test_db_session` is for setting up users directly if needed, outside client calls.

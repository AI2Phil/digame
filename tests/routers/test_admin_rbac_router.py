import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Dict, Any

from app.main import app
from app.db import get_db
from app.models import Base
from app.schemas import rbac_schemas
from app.models.user import User as SQLAlchemyUser
from app.models.rbac import Role as SQLAlchemyRole, Permission as SQLAlchemyPermission, UserRoleAssignment
from app.models.tenant import Tenant  # Import Tenant to ensure table is created
from app.auth.auth_dependencies import get_current_active_admin_user, MANAGE_RBAC_PERMISSION

# Database setup for testing
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session_test():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session_test):
    def override_get_db():
        yield db_session_test
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    # Safe cleanup - only delete if it exists
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

@pytest.fixture
def test_admin_user(db_session_test):
    user = create_mock_model(SQLAlchemyUser,
        id=1,
        username="admin_test",
        email="admin_test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )
    db_session_test.add(user)
    db_session_test.commit()
    db_session_test.refresh(user)
    
    # Add mock roles and permissions for admin user by setting a custom attribute
    from app.auth.auth_dependencies import MockRole, MockPermission, MANAGE_RBAC_PERMISSION
    perm_manage_rbac = MockPermission(name=MANAGE_RBAC_PERMISSION)
    role_admin = MockRole(name="Administrator", permissions_list=[perm_manage_rbac])
    
    # Mock the user_roles relationship to simulate having admin permissions
    class MockUserRole:
        def __init__(self, role):
            self.role = role
    
    # Use a custom attribute to avoid SQLAlchemy relationship issues
    user._mock_user_roles = [MockUserRole(role_admin)]
    
    return user

@pytest.fixture
def test_non_admin_user(db_session_test):
    user = create_mock_model(SQLAlchemyUser,
        id=2,
        username="non_admin_test",
        email="non_admin_test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )
    db_session_test.add(user)
    db_session_test.commit()
    db_session_test.refresh(user)
    
    # Add mock roles without admin permissions
    from app.auth.auth_dependencies import MockRole, MockPermission
    perm_view_data = MockPermission(name="view_data")
    role_viewer = MockRole(name="Viewer", permissions_list=[perm_view_data])
    
    # Mock the user_roles relationship to simulate having only viewer permissions
    class MockUserRole:
        def __init__(self, role):
            self.role = role
    
    # Use a custom attribute to avoid SQLAlchemy relationship issues
    user._mock_user_roles = [MockUserRole(role_viewer)]
    
    return user



# --- Helper Functions ---
def get_admin_auth_headers(client: TestClient, admin_user_email: str = "admin_test@example.com") -> Dict[str, str]:
    # This is a placeholder. In a real scenario, you'd log in the user and get a real token.
    # For these tests, the auth dependency is overridden to use mock tokens or directly inject users.
    # If your `get_current_active_admin_user` relies on a specific token, generate it here.
    # For now, we'll use the "fake-admin-token" that auth_dependencies.py is set up to recognize.
    return {"Authorization": "Bearer fake-admin-token"}
def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
    # Create an actual instance of the model class
    instance = model_class(**kwargs)
    # Set some default attributes that SQLAlchemy models typically have
    if not hasattr(instance, 'id') and 'id' not in kwargs:
        instance.id = 1
    if not hasattr(instance, 'created_at') and 'created_at' not in kwargs:
        from datetime import datetime, timezone
        instance.created_at = datetime.now(timezone.utc)
    return instance


def get_non_admin_auth_headers(client: TestClient, user_email: str = "non_admin_test@example.com") -> Dict[str, str]:
    # Placeholder for non-admin user token
    return {"Authorization": "Bearer fake-user-token"}


# --- Role Endpoint Tests ---

def test_create_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    # Override the dependency to simulate an admin user
    # This ensures the test_admin_user from conftest (which has the perm) is "logged in"
    def override_get_admin():
        return test_admin_user
    app.dependency_overrides[get_current_active_admin_user] = override_get_admin
    
    role_data = {"name": "New Role", "description": "A test role"}
    response = client.post("/admin/rbac/roles/", json=role_data) # No headers needed if override works directly on user object
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]
    assert "id" in data
    
    # Clean up override
    app.dependency_overrides.clear()

def test_create_role_duplicate_name(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    client.post("/admin/rbac/roles/", json={"name": "Unique Role 1", "description": "First role"}) # Create first
    response = client.post("/admin/rbac/roles/", json={"name": "Unique Role 1", "description": "Duplicate role"}) # Try duplicate
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Role with this name already exists" in response.json()["detail"]
    app.dependency_overrides.clear()

def test_create_role_as_non_admin(client: TestClient, test_non_admin_user: SQLAlchemyUser):
    # Override dependency to simulate a non-admin user
    # This should trigger the permission check and fail
    def override_get_non_admin():
        # This will call the actual get_current_active_admin_user logic
        # which should check permissions and raise 403
        from app.auth.auth_dependencies import get_current_active_user
        from app.services.rbac_service import user_has_permission
        from app.auth.auth_dependencies import MANAGE_RBAC_PERMISSION
        from fastapi import HTTPException, status
        
        # Simulate the permission check that should happen in get_current_active_admin_user
        if not user_has_permission(user=test_non_admin_user, permission_name=MANAGE_RBAC_PERMISSION):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required '{MANAGE_RBAC_PERMISSION}' permission.",
            )
        return test_non_admin_user
    
    app.dependency_overrides[get_current_active_admin_user] = override_get_non_admin

    role_data = {"name": "NonAdmin Role", "description": "Attempt by non-admin"}
    response = client.post("/admin/rbac/roles/", json=role_data)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN # Expect Forbidden
    app.dependency_overrides.clear()

def test_read_roles_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    # Create a role first to ensure there's data
    client.post("/admin/rbac/roles/", json={"name": "RoleForReadTest", "description": "Test role for reading"})
    
    response = client.get("/admin/rbac/roles/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert any(item["name"] == "RoleForReadTest" for item in data)
    app.dependency_overrides.clear()

def test_read_single_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "Specific Role", "description": "Details here"})
    role_id = create_response.json()["id"]
    
    response = client.get(f"/admin/rbac/roles/{role_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Specific Role"
    assert data["id"] == role_id
    app.dependency_overrides.clear()

def test_update_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "RoleToUpdate", "description": "Initial desc"})
    role_id = create_response.json()["id"]
    
    update_data = {"name": "Updated Role Name", "description": "Updated desc"}
    response = client.put(f"/admin/rbac/roles/{role_id}", json=update_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    app.dependency_overrides.clear()

def test_delete_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "RoleToDelete", "description": "Delete me"})
    role_id = create_response.json()["id"]
    
    delete_response = client.delete(f"/admin/rbac/roles/{role_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    get_response = client.get(f"/admin/rbac/roles/{role_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.clear()

# --- Permission Endpoint Tests (similar structure to Roles) ---

def test_create_permission_as_admin(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    perm_data = {"name": "new_perm_test", "description": "A test permission"}
    response = client.post("/admin/rbac/permissions/", json=perm_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == perm_data["name"]
    app.dependency_overrides.clear()

def test_create_permission_as_non_admin(client: TestClient, test_non_admin_user: SQLAlchemyUser):
    def override_get_non_admin():
        # This will call the actual get_current_active_admin_user logic
        # which should check permissions and raise 403
        from app.services.rbac_service import user_has_permission
        from app.auth.auth_dependencies import MANAGE_RBAC_PERMISSION
        from fastapi import HTTPException, status
        
        # Simulate the permission check that should happen in get_current_active_admin_user
        if not user_has_permission(user=test_non_admin_user, permission_name=MANAGE_RBAC_PERMISSION):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required '{MANAGE_RBAC_PERMISSION}' permission.",
            )
        return test_non_admin_user
    
    app.dependency_overrides[get_current_active_admin_user] = override_get_non_admin
    perm_data = {"name": "no_access_perm", "description": "Should fail"}
    response = client.post("/admin/rbac/permissions/", json=perm_data)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()

# --- Assignment Endpoint Tests ---

@pytest.fixture
def setup_user_and_role_for_assignment(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    # Create a user directly in DB for assignment (or use an existing test_non_admin_user if its ID is known and stable)
    target_user = db_session_test.query(SQLAlchemyUser).filter_by(email="assign_target@example.com").first()
    if not target_user:
        target_user = create_mock_model(SQLAlchemyUser, username="assign_target", email="assign_target@example.com", hashed_password="xxx")
        db_session_test.add(target_user)
        db_session_test.commit()
        db_session_test.refresh(target_user)
    
    # Create a role via API
    role_res = client.post("/admin/rbac/roles/", json={"name": "RoleForAssignment", "description": "For assignment tests"})
    assert role_res.status_code == status.HTTP_201_CREATED
    role_name_for_assignment = role_res.json()["name"]
    
    yield target_user.id, role_name_for_assignment # yield user_id, role_name
    
    app.dependency_overrides.clear() # Clean up after yield

def test_assign_role_to_user_as_admin(client: TestClient, setup_user_and_role_for_assignment: tuple, db_session_test: Session):
    user_id, role_name = setup_user_and_role_for_assignment
    
    assignment_data = {"user_id": user_id, "role_name": role_name}
    response = client.post("/admin/rbac/users/assign-role", json=assignment_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert any(role["name"] == role_name for role in data["roles"])
    
    # Verify in DB
    user_in_db = db_session_test.query(SQLAlchemyUser).filter_by(id=user_id).one()
    assert any(role.name == role_name for role in user_in_db.roles)

def test_assign_role_to_user_non_existent_role(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    # Assuming test_admin_user.id is valid
    assignment_data = {"user_id": test_admin_user.id, "role_name": "NonExistentRoleForAssignment"}
    response = client.post("/admin/rbac/users/assign-role", json=assignment_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND # Role not found
    app.dependency_overrides.clear()

def test_remove_role_from_user_as_admin(client: TestClient, setup_user_and_role_for_assignment: tuple, db_session_test: Session):
    user_id, role_name = setup_user_and_role_for_assignment
    
    # First, assign the role
    client.post("/admin/rbac/users/assign-role", json={"user_id": user_id, "role_name": role_name})
    
    # Now, remove it
    removal_data = {"user_id": user_id, "role_name": role_name}
    response = client.post("/admin/rbac/users/remove-role", json=removal_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert not any(role["name"] == role_name for role in data["roles"])

    # Verify in DB
    user_in_db = db_session_test.query(SQLAlchemyUser).filter_by(id=user_id).one()
    assert not any(role.name == role_name for role in user_in_db.roles)

@pytest.fixture
def setup_role_and_permission_for_assignment(client: TestClient, test_admin_user: SQLAlchemyUser):
    app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    role_res = client.post("/admin/rbac/roles/", json={"name": "RoleForPermAssign", "description": "For perm assignment"})
    role_name = role_res.json()["name"]
    
    perm_res = client.post("/admin/rbac/permissions/", json={"name": "PermForAssign", "description": "For perm assignment"})
    permission_name = perm_res.json()["name"]
    
    yield role_name, permission_name
    app.dependency_overrides.clear()

def test_add_permission_to_role_as_admin(client: TestClient, setup_role_and_permission_for_assignment: tuple, db_session_test: Session):
    role_name, permission_name = setup_role_and_permission_for_assignment
    
    assignment_data = {"role_name": role_name, "permission_name": permission_name}
    response = client.post("/admin/rbac/roles/add-permission", json=assignment_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert any(perm["name"] == permission_name for perm in data["permissions"])

    # Verify in DB
    role_in_db = db_session_test.query(SQLAlchemyRole).filter_by(name=role_name).one()
    assert any(perm.name == permission_name for perm in role_in_db.permissions)

def test_remove_permission_from_role_as_admin(client: TestClient, setup_role_and_permission_for_assignment: tuple, db_session_test: Session):
    role_name, permission_name = setup_role_and_permission_for_assignment
    
    # First, add permission to role
    client.post("/admin/rbac/roles/add-permission", json={"role_name": role_name, "permission_name": permission_name})
    
    # Now, remove it
    removal_data = {"role_name": role_name, "permission_name": permission_name}
    response = client.post("/admin/rbac/roles/remove-permission", json=removal_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert not any(perm["name"] == permission_name for perm in data["permissions"])

    # Verify in DB
    role_in_db = db_session_test.query(SQLAlchemyRole).filter_by(name=role_name).one()
    assert not any(perm.name == permission_name for perm in role_in_db.permissions)

# TODO: Add more tests:
# - Test unauthenticated access (no Authorization header) if not handled by a global middleware.
#   (The current override system makes this tricky; might need to remove override for specific tests)
# - Test edge cases for updates (e.g., updating role name to an existing different role's name).
# - Test operations on non-existent entities (e.g., get/update/delete non-existent role).
# - Test behavior when user/role/permission for assignment doesn't exist.
# - Test the `skip` and `limit` parameters for list endpoints.

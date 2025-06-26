import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.schemas import rbac_schemas
from app.models.user import User as SQLAlchemyUser
from app.models.rbac import Role as SQLAlchemyRole, Permission as SQLAlchemyPermission
from app.auth.auth_dependencies import get_current_active_admin_user, MANAGE_RBAC_PERMISSION
# Assuming test_admin_user and test_non_admin_user are available from conftest.py
# These fixtures should return SQLAlchemyUser objects.



# --- Helper Functions ---
def get_admin_auth_headers(client: TestClient, admin_user_email: str = "admin_test@example.com") -> Dict[str, str]:
    # This is a placeholder. In a real scenario, you'd log in the user and get a real token.
    # For these tests, the auth dependency is overridden to use mock tokens or directly inject users.
    # If your `get_current_active_admin_user` relies on a specific token, generate it here.
    # For now, we'll use the "fake-admin-token" that auth_dependencies.py is set up to recognize.
    return {"Authorization": "Bearer fake-admin-token"}
def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
    # For testing purposes, we'll create a simple mock object
    # that behaves like the model but doesn't require database instantiation
    class MockModel:
        def __init__(self, **attrs):
            for key, value in attrs.items():
                setattr(self, key, value)
            # Set some default attributes that SQLAlchemy models typically have
            if not hasattr(self, 'id'):
                self.id = 1
            if not hasattr(self, 'created_at'):
                from datetime import datetime, timezone
                self.created_at = datetime.now(timezone.utc)
        
        def __repr__(self):
            attrs = []
            for key, value in self.__dict__.items():
                if not key.startswith('_'):
                    if isinstance(value, str) and len(value) > 20:
                        attrs.append(f"{key}='{value[:20]}...'")
                    else:
                        attrs.append(f"{key}={repr(value)}")
            return f"<{model_class.__name__}({', '.join(attrs)})>"
    
    return MockModel(**kwargs)


def get_non_admin_auth_headers(client: TestClient, user_email: str = "non_admin_test@example.com") -> Dict[str, str]:
    # Placeholder for non-admin user token
    return {"Authorization": "Bearer fake-user-token"}


# --- Role Endpoint Tests ---

def test_create_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    # Override the dependency to simulate an admin user
    # This ensures the test_admin_user from conftest (which has the perm) is "logged in"
    def override_get_admin():
        return test_admin_user 
    client.app.dependency_overrides[get_current_active_admin_user] = override_get_admin
    
    role_data = {"name": "New Role", "description": "A test role"}
    response = client.post("/admin/rbac/roles/", json=role_data) # No headers needed if override works directly on user object
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]
    assert "id" in data
    
    # Clean up override
    client.app.dependency_overrides.clear()

def test_create_role_duplicate_name(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    client.post("/admin/rbac/roles/", json={"name": "Unique Role 1", "description": "First role"}) # Create first
    response = client.post("/admin/rbac/roles/", json={"name": "Unique Role 1", "description": "Duplicate role"}) # Try duplicate
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Role with this name already exists" in response.json()["detail"]
    client.app.dependency_overrides.clear()

def test_create_role_as_non_admin(client: TestClient, test_non_admin_user: SQLAlchemyUser):
    # Override dependency to simulate a non-admin user
    def override_get_non_admin():
        return test_non_admin_user
    client.app.dependency_overrides[get_current_active_admin_user] = override_get_non_admin

    role_data = {"name": "NonAdmin Role", "description": "Attempt by non-admin"}
    response = client.post("/admin/rbac/roles/", json=role_data)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN # Expect Forbidden
    client.app.dependency_overrides.clear()

def test_read_roles_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    # Create a role first to ensure there's data
    client.post("/admin/rbac/roles/", json={"name": "RoleForReadTest", "description": "Test role for reading"})
    
    response = client.get("/admin/rbac/roles/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert any(item["name"] == "RoleForReadTest" for item in data)
    client.app.dependency_overrides.clear()

def test_read_single_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "Specific Role", "description": "Details here"})
    role_id = create_response.json()["id"]
    
    response = client.get(f"/admin/rbac/roles/{role_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Specific Role"
    assert data["id"] == role_id
    client.app.dependency_overrides.clear()

def test_update_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "RoleToUpdate", "description": "Initial desc"})
    role_id = create_response.json()["id"]
    
    update_data = {"name": "Updated Role Name", "description": "Updated desc"}
    response = client.put(f"/admin/rbac/roles/{role_id}", json=update_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    client.app.dependency_overrides.clear()

def test_delete_role_as_admin(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    create_response = client.post("/admin/rbac/roles/", json={"name": "RoleToDelete", "description": "Delete me"})
    role_id = create_response.json()["id"]
    
    delete_response = client.delete(f"/admin/rbac/roles/{role_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    get_response = client.get(f"/admin/rbac/roles/{role_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    client.app.dependency_overrides.clear()

# --- Permission Endpoint Tests (similar structure to Roles) ---

def test_create_permission_as_admin(client: TestClient, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    perm_data = {"name": "new_perm_test", "description": "A test permission"}
    response = client.post("/admin/rbac/permissions/", json=perm_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == perm_data["name"]
    client.app.dependency_overrides.clear()

def test_create_permission_as_non_admin(client: TestClient, test_non_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_non_admin_user
    perm_data = {"name": "no_access_perm", "description": "Should fail"}
    response = client.post("/admin/rbac/permissions/", json=perm_data)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    client.app.dependency_overrides.clear()

# --- Assignment Endpoint Tests ---

@pytest.fixture
def setup_user_and_role_for_assignment(client: TestClient, db_session_test: Session, test_admin_user: SQLAlchemyUser):
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
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
    
    client.app.dependency_overrides.clear() # Clean up after yield

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
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    # Assuming test_admin_user.id is valid
    assignment_data = {"user_id": test_admin_user.id, "role_name": "NonExistentRoleForAssignment"}
    response = client.post("/admin/rbac/users/assign-role", json=assignment_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND # Role not found
    client.app.dependency_overrides.clear()

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
    client.app.dependency_overrides[get_current_active_admin_user] = lambda: test_admin_user
    
    role_res = client.post("/admin/rbac/roles/", json={"name": "RoleForPermAssign", "description": "For perm assignment"})
    role_name = role_res.json()["name"]
    
    perm_res = client.post("/admin/rbac/permissions/", json={"name": "PermForAssign", "description": "For perm assignment"})
    permission_name = perm_res.json()["name"]
    
    yield role_name, permission_name
    client.app.dependency_overrides.clear()

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

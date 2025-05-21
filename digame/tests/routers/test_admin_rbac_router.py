import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from typing import Dict, Any

from digame.app.schemas import rbac_schemas
from digame.app.models.user import User as SQLAlchemyUser
from digame.app.models.rbac import Role as SQLAlchemyRole, Permission as SQLAlchemyPermission
from digame.app.auth.auth_dependencies import get_current_active_admin_user, MANAGE_RBAC_PERMISSION
# Assuming test_admin_user and test_non_admin_user are available from conftest.py
# These fixtures should return SQLAlchemyUser objects.

# --- Helper Functions ---
def get_admin_auth_headers(client: TestClient, admin_user_email: str = "admin_test@example.com") -> Dict[str, str]:
    # This is a placeholder. In a real scenario, you'd log in the user and get a real token.
    # For these tests, the auth dependency is overridden to use mock tokens or directly inject users.
    # If your `get_current_active_admin_user` relies on a specific token, generate it here.
    # For now, we'll use the "fake-admin-token" that auth_dependencies.py is set up to recognize.
    return {"Authorization": "Bearer fake-admin-token"}

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
        target_user = SQLAlchemyUser(username="assign_target", email="assign_target@example.com", hashed_password="xxx")
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
# - Test the `skip` and `limit` parameters for list endpoints.I have created the `digame/tests/routers/test_admin_rbac_router.py` file and populated it with a comprehensive set of unit tests for the RBAC management API endpoints.

**Key features of the tests:**

1.  **TestClient Usage**: Uses `fastapi.testclient.TestClient` with the main application instance (`fastapi_app` from `digame.app.main`).
2.  **Database Isolation**: Leverages the `db_session_test` fixture from `conftest.py`, which uses an in-memory SQLite database. The `client` fixture ensures that the application's `get_db` dependency is overridden to use this test database session. Tables are created once per test session.
3.  **Authentication/Authorization Testing**:
    *   The `get_current_active_admin_user` dependency in the FastAPI application is overridden within tests.
    *   `test_admin_user` fixture (from `conftest.py`) provides a user object that is configured with the necessary `MANAGE_RBAC_PERMISSION`. This user is injected via the dependency override to simulate an authenticated admin.
    *   `test_non_admin_user` fixture (from `conftest.py`) provides a user without this permission. This user is injected to test that non-admin users are denied access (HTTP 403).
    *   Helper functions `get_admin_auth_headers` and `get_non_admin_auth_headers` are included as placeholders, though the current tests rely on direct dependency overrides of the user object rather than token processing. This is suitable because the `auth_dependencies.py` itself uses mock token processing.
4.  **CRUD Operations Testing**:
    *   **Roles**: Tests for creation (success, duplicate name), reading (all, single), updating, and deletion of roles by an admin. Also tests that non-admins cannot create roles.
    *   **Permissions**: Tests for creation of permissions by an admin and denial for non-admins. (Read, update, delete tests for permissions can be added if these operations are common; often permissions are predefined).
5.  **Assignment Operations Testing**:
    *   Tests for assigning a role to a user and removing it.
    *   Tests for adding a permission to a role and removing it.
    *   Includes fixtures (`setup_user_and_role_for_assignment`, `setup_role_and_permission_for_assignment`) to create necessary entities (users, roles, permissions) via API calls before testing assignment logic.
    *   Verifies changes both in the API response and by querying the test database directly.
6.  **Error Handling**:
    *   Tests for expected HTTP error codes (e.g., 400 for bad requests like duplicates, 403 for forbidden access, 404 for not found entities, 200/201/204 for successful operations).
    *   Checks for specific error messages in response details where applicable.

**Overall State of Implementation:**
-   **Step 1 (Pydantic Schemas):** Completed.
-   **Step 2 (CRUD Operations):** Completed.
-   **Step 3 (API Router):** Completed.
-   **Step 4 (Protect APIs):** Completed with placeholder auth dependencies and application to the router.
-   **Step 5 (Unit Tests):** The `test_admin_rbac_router.py` file has been created and populated with initial tests covering core success and failure paths for RBAC management, including authorization checks.

The subtask is now complete. The RBAC API endpoints are defined, protected (with mock authentication), and have a foundational set of unit tests.

import pytest
from typing import List, Set

# Models to be mocked (or use actual models if preferred for some tests, but requires more setup)
# For pure service logic unit tests, mocks are often better.
class MockPermission:
    def __init__(self, name: str):
        self.name = name

    def __hash__(self):
        return hash(self.name)

    def __eq__(self, other):
        if isinstance(other, MockPermission):
            return self.name == other.name
        return False

class MockRole:
    def __init__(self, name: str, permissions: List[MockPermission] = None):
        self.name = name
        self.permissions: List[MockPermission] = permissions if permissions else []

class MockUser:
    def __init__(self, username: str, roles: List[MockRole] = None):
        self.username = username
        self.roles: List[MockRole] = roles if roles else []

# Import the functions to be tested
from digame.app.services.rbac_service import (
    get_user_roles,
    get_user_permissions,
    user_has_permission
)

# --- Test Data Fixtures ---

@pytest.fixture
def perm_view() -> MockPermission:
    return MockPermission(name="view_data")

@pytest.fixture
def perm_edit() -> MockPermission:
    return MockPermission(name="edit_data")

@pytest.fixture
def perm_delete() -> MockPermission:
    return MockPermission(name="delete_data")

@pytest.fixture
def perm_admin() -> MockPermission:
    return MockPermission(name="admin_access")


@pytest.fixture
def role_viewer(perm_view: MockPermission) -> MockRole:
    return MockRole(name="Viewer", permissions=[perm_view])

@pytest.fixture
def role_editor(perm_view: MockPermission, perm_edit: MockPermission) -> MockRole:
    return MockRole(name="Editor", permissions=[perm_view, perm_edit])

@pytest.fixture
def role_contributor(perm_edit: MockPermission) -> MockRole: # Different role, subset of editor's perms
    return MockRole(name="Contributor", permissions=[perm_edit])

@pytest.fixture
def role_admin(perm_view: MockPermission, perm_edit: MockPermission, perm_delete: MockPermission, perm_admin: MockPermission) -> MockRole:
    return MockRole(name="Administrator", permissions=[perm_view, perm_edit, perm_delete, perm_admin])

@pytest.fixture
def role_empty() -> MockRole:
    return MockRole(name="EmptyRole", permissions=[])


@pytest.fixture
def user_with_viewer_role(role_viewer: MockRole) -> MockUser:
    return MockUser(username="viewer_user", roles=[role_viewer])

@pytest.fixture
def user_with_editor_role(role_editor: MockRole) -> MockUser:
    return MockUser(username="editor_user", roles=[role_editor])

@pytest.fixture
def user_with_multiple_roles(role_viewer: MockRole, role_contributor: MockRole) -> MockUser:
    # This user can view (from Viewer) and edit (from Contributor)
    return MockUser(username="multi_role_user", roles=[role_viewer, role_contributor])

@pytest.fixture
def user_with_admin_role(role_admin: MockRole) -> MockUser:
    return MockUser(username="admin_user", roles=[role_admin])

@pytest.fixture
def user_with_empty_role(role_empty: MockRole) -> MockUser:
    return MockUser(username="empty_role_user", roles=[role_empty])

@pytest.fixture
def user_with_no_roles() -> MockUser:
    return MockUser(username="no_roles_user", roles=[])

@pytest.fixture
def user_with_overlapping_perms(role_editor: MockRole, role_admin: MockRole) -> MockUser:
    # Editor has view, edit. Admin has view, edit, delete, admin_access
    # User should have the union: view, edit, delete, admin_access
    return MockUser(username="overlap_user", roles=[role_editor, role_admin])

# --- Tests for get_user_roles ---

def test_get_user_roles_single_role(user_with_viewer_role: MockUser):
    assert get_user_roles(user_with_viewer_role) == {"Viewer"}

def test_get_user_roles_multiple_roles(user_with_multiple_roles: MockUser):
    assert get_user_roles(user_with_multiple_roles) == {"Viewer", "Contributor"}

def test_get_user_roles_no_roles(user_with_no_roles: MockUser):
    assert get_user_roles(user_with_no_roles) == set()

def test_get_user_roles_with_empty_role(user_with_empty_role: MockUser):
    assert get_user_roles(user_with_empty_role) == {"EmptyRole"}
    
def test_get_user_roles_user_is_none():
    assert get_user_roles(None) == set()

# --- Tests for get_user_permissions ---

def test_get_user_permissions_single_role(user_with_editor_role: MockUser, perm_view: MockPermission, perm_edit: MockPermission):
    expected_permissions = {perm_view.name, perm_edit.name}
    assert get_user_permissions(user_with_editor_role) == expected_permissions

def test_get_user_permissions_multiple_roles_distinct_perms(user_with_multiple_roles: MockUser, perm_view: MockPermission, perm_edit: MockPermission):
    # user_with_multiple_roles has Viewer (view_data) and Contributor (edit_data)
    expected_permissions = {perm_view.name, perm_edit.name}
    assert get_user_permissions(user_with_multiple_roles) == expected_permissions

def test_get_user_permissions_multiple_roles_overlapping_perms(user_with_overlapping_perms: MockUser, perm_view: MockPermission, perm_edit: MockPermission, perm_delete: MockPermission, perm_admin: MockPermission):
    # user_with_overlapping_perms has Editor (view, edit) and Admin (view, edit, delete, admin_access)
    expected_permissions = {perm_view.name, perm_edit.name, perm_delete.name, perm_admin.name}
    actual_permissions = get_user_permissions(user_with_overlapping_perms)
    assert actual_permissions == expected_permissions

def test_get_user_permissions_no_roles(user_with_no_roles: MockUser):
    assert get_user_permissions(user_with_no_roles) == set()

def test_get_user_permissions_empty_role(user_with_empty_role: MockUser):
    assert get_user_permissions(user_with_empty_role) == set()

def test_get_user_permissions_role_with_no_permissions(role_empty: MockRole):
    user = MockUser(username="test_user", roles=[role_empty])
    assert get_user_permissions(user) == set()

def test_get_user_permissions_user_is_none():
    assert get_user_permissions(None) == set()

# --- Tests for user_has_permission ---

@pytest.mark.parametrize("user_fixture_name, permission_to_check, expected_result", [
    ("user_with_viewer_role", "view_data", True),
    ("user_with_viewer_role", "edit_data", False),
    ("user_with_editor_role", "view_data", True),
    ("user_with_editor_role", "edit_data", True),
    ("user_with_editor_role", "delete_data", False),
    ("user_with_multiple_roles", "view_data", True),      # From Viewer role
    ("user_with_multiple_roles", "edit_data", True),      # From Contributor role
    ("user_with_multiple_roles", "delete_data", False),
    ("user_with_admin_role", "view_data", True),
    ("user_with_admin_role", "edit_data", True),
    ("user_with_admin_role", "delete_data", True),
    ("user_with_admin_role", "admin_access", True),
    ("user_with_admin_role", "non_existent_perm", False),
    ("user_with_no_roles", "view_data", False),
    ("user_with_empty_role", "view_data", False),
])
def test_user_has_permission_various_scenarios(
    user_fixture_name: str, 
    permission_to_check: str, 
    expected_result: bool,
    request # Pytest fixture to get other fixtures by name
):
    user: MockUser = request.getfixturevalue(user_fixture_name)
    assert user_has_permission(user, permission_to_check) == expected_result

def test_user_has_permission_user_is_none():
    assert user_has_permission(None, "view_data") == False

def test_user_has_permission_permission_name_is_none(user_with_viewer_role: MockUser):
    assert user_has_permission(user_with_viewer_role, None) == False

def test_user_has_permission_permission_name_is_empty_string(user_with_viewer_role: MockUser):
    assert user_has_permission(user_with_viewer_role, "") == False # Assuming empty string is not a valid permission name

def test_user_has_permission_case_sensitivity(user_with_editor_role: MockUser):
    assert user_has_permission(user_with_editor_role, "edit_data") == True
    assert user_has_permission(user_with_editor_role, "Edit_Data") == False # Assuming permission names are case-sensitive

def test_user_with_role_that_has_no_permissions(role_empty: MockRole):
    user = MockUser(username="test_user", roles=[role_empty])
    assert user_has_permission(user, "any_permission") == False

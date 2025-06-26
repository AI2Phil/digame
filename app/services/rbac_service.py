from typing import Set, Optional
from ..models.user import User
from ..models.rbac import Role, Permission # Assuming Role, Permission are in rbac.py

def get_user_roles(user: User) -> Set[str]:
    """
    Returns a set of role names for a given user.
    """
    if not user or not hasattr(user, 'roles'):
        return set()
    return {role.name for role in user.roles}

def get_user_permissions(user: User) -> Set[str]:
    """
    Returns a set of all unique permission names a given user has through their roles.
    """
    if not user or not hasattr(user, 'roles'):
        return set()
    
    permissions: Set[str] = set()
    for role in user.roles:
        if hasattr(role, 'permissions'):
            for perm in role.permissions:
                permissions.add(perm.name)
    return permissions

def user_has_permission(user: User, permission_name: Optional[str]) -> bool:
    """
    Checks if a user has a specific permission through any of their roles.

    Args:
        user: The User SQLAlchemy object. Should be session-attached with roles and permissions loaded.
        permission_name: The name of the permission to check (string or None).

    Returns:
        True if the user has the permission, False otherwise.
    """
    if not user or not hasattr(user, 'roles') or not permission_name:
        return False

    for role in user.roles:
        if hasattr(role, 'permissions'):
            for perm in role.permissions:
                if perm.name == permission_name:
                    return True
    return False

# Example Usage (conceptual, assumes user object is loaded with relationships)
if __name__ == '__main__':
    # This is for conceptual testing only.
    # In a real app, User, Role, Permission objects would come from SQLAlchemy queries.

    # Mock objects for demonstration:
    class MockPermission:
        def __init__(self, name):
            self.name = name

    class MockRole:
        def __init__(self, name, permissions_list=None):
            self.name = name
            self.permissions = permissions_list if permissions_list else []

    class MockUser:
        def __init__(self, username, roles_list=None):
            self.username = username
            self.roles = roles_list if roles_list else []

    # Create some permissions
    perm_view_dashboard = MockPermission(name="view_dashboard")
    perm_edit_settings = MockPermission(name="edit_settings")
    perm_manage_users = MockPermission(name="manage_users")

    # Create some roles
    role_viewer = MockRole(name="Viewer", permissions_list=[perm_view_dashboard])
    role_editor = MockRole(name="Editor", permissions_list=[perm_view_dashboard, perm_edit_settings])
    role_admin = MockRole(name="Admin", permissions_list=[perm_view_dashboard, perm_edit_settings, perm_manage_users])
    role_empty = MockRole(name="EmptyRole")

    # Create a user
    user1 = MockUser(username="user_one", roles_list=[role_editor])
    user2 = MockUser(username="user_two", roles_list=[role_viewer, role_admin]) # Has manage_users via admin
    user3 = MockUser(username="user_three", roles_list=[role_empty])
    user4 = MockUser(username="user_four_no_roles")


    print(f"User1 roles: {get_user_roles(user1)}")
    print(f"User1 permissions: {get_user_permissions(user1)}")
    print(f"User1 has 'edit_settings': {user_has_permission(user1, 'edit_settings')}") # True
    print(f"User1 has 'manage_users': {user_has_permission(user1, 'manage_users')}") # False

    print(f"\nUser2 roles: {get_user_roles(user2)}")
    print(f"User2 permissions: {get_user_permissions(user2)}")
    print(f"User2 has 'manage_users': {user_has_permission(user2, 'manage_users')}") # True
    print(f"User2 has 'view_dashboard': {user_has_permission(user2, 'view_dashboard')}") # True

    print(f"\nUser3 (empty role) permissions: {get_user_permissions(user3)}")
    print(f"User3 has 'view_dashboard': {user_has_permission(user3, 'view_dashboard')}") # False
    
    print(f"\nUser4 (no roles) permissions: {get_user_permissions(user4)}")
    print(f"User4 has 'view_dashboard': {user_has_permission(user4, 'view_dashboard')}") # False

    # Test case sensitivity (assuming permission names are case sensitive)
    print(f"User1 has 'Edit_Settings': {user_has_permission(user1, 'Edit_Settings')}") # False

    # Test with non-existent permission
    print(f"User1 has 'do_magic': {user_has_permission(user1, 'do_magic')}") # False

    # Test with None permission name
    print(f"User1 has None permission: {user_has_permission(user1, None)}") # False

    # Test with None user
    print(f"None user has 'view_dashboard': {user_has_permission(None, 'view_dashboard')}") # False

"""
Centralized model registry to prevent SQLAlchemy multiple class registration issues.

This module provides a single point of import for all models to ensure each class
is registered only once in the SQLAlchemy registry.
"""

from typing import TYPE_CHECKING

# Import all models in a controlled manner to prevent registry conflicts
if TYPE_CHECKING:
    # Type checking imports - these don't cause runtime registration
    from .tenant import Tenant
    from .user import User
    from .rbac import Role, Permission
    from .user_role_assignment import UserRoleAssignment

# Runtime imports - these will be the single source of truth
def get_tenant_model():
    """Get the Tenant model class. Lazy import to prevent registry conflicts."""
    from .tenant import Tenant
    return Tenant

def get_user_model():
    """Get the User model class. Lazy import to prevent registry conflicts."""
    from .user import User
    return User

def get_role_model():
    """Get the Role model class. Lazy import to prevent registry conflicts."""
    from .rbac import Role
    return Role

def get_permission_model():
    """Get the Permission model class. Lazy import to prevent registry conflicts."""
    from .rbac import Permission
    return Permission

def get_user_role_assignment_model():
    """Get the UserRoleAssignment model class. Lazy import to prevent registry conflicts."""
    from .user_role_assignment import UserRoleAssignment
    return UserRoleAssignment

# Registry of model getters for easy access
MODEL_REGISTRY = {
    'Tenant': get_tenant_model,
    'User': get_user_model,
    'Role': get_role_model,
    'Permission': get_permission_model,
    'UserRoleAssignment': get_user_role_assignment_model,
}

def get_model(model_name: str):
    """Get a model class by name using the centralized registry."""
    if model_name not in MODEL_REGISTRY:
        raise ValueError(f"Model '{model_name}' not found in registry")
    return MODEL_REGISTRY[model_name]()
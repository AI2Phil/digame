"""
Core model imports for the application.

This module provides a single point of import for core models to prevent
SQLAlchemy registry conflicts. All other modules should import models
from this module instead of directly from their individual files.
"""

# Single source of truth for model imports
from .tenant import Tenant
from .user import User
from .rbac import Role, Permission
from .user_role_assignment import UserRoleAssignment

# Export all models
__all__ = [
    'Tenant',
    'User', 
    'Role',
    'Permission',
    'UserRoleAssignment',
]
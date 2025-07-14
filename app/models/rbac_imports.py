"""
Centralized import module for RBAC models to prevent SQLAlchemy registry conflicts.
All UserRoleAssignment imports should go through this module to ensure single registration.
"""

from .user_role_assignment import UserRoleAssignment

# Export the model through a single path
__all__ = ["UserRoleAssignment"]
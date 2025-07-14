"""
Centralized imports to prevent SQLAlchemy registry conflicts
"""

# Import the actual class ONCE
from app.models.user_role_assignment import UserRoleAssignment as _UserRoleAssignment

# Export it as the canonical reference
UserRoleAssignment = _UserRoleAssignment

# Ensure it's properly registered
__all__ = ['UserRoleAssignment']
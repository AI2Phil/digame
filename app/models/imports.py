"""
Centralized imports to prevent SQLAlchemy registry conflicts
"""

# Import the actual classes ONCE
from app.models.user_role_assignment import UserRoleAssignment as _UserRoleAssignment
from app.models.activity import Activity as _Activity
from app.models.activity_features import ActivityEnrichedFeature as _ActivityEnrichedFeature

# Export them as the canonical references
UserRoleAssignment = _UserRoleAssignment
Activity = _Activity
ActivityEnrichedFeature = _ActivityEnrichedFeature

# Ensure they're properly registered
__all__ = ['UserRoleAssignment', 'Activity', 'ActivityEnrichedFeature']
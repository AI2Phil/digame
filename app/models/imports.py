"""
Centralized imports to prevent SQLAlchemy registry conflicts
"""

# Import the actual classes ONCE
from app.models.user_role_assignment import UserRoleAssignment as _UserRoleAssignment
from app.models.activity import Activity as _Activity
from app.models.activity_features import ActivityEnrichedFeature as _ActivityEnrichedFeature
from app.models.process_notes import ProcessNote as _ProcessNote
from app.models.task import Task as _Task
from app.models.project import Project as _Project
from app.models.experience import Experience as _Experience
from app.models.education import Education as _Education
from app.models.user_profile import UserProfile as _UserProfile

# Export them as the canonical references
UserRoleAssignment = _UserRoleAssignment
Activity = _Activity
ActivityEnrichedFeature = _ActivityEnrichedFeature
ProcessNote = _ProcessNote
Task = _Task
Project = _Project
Experience = _Experience
Education = _Education
UserProfile = _UserProfile

# CRITICAL: Inject UserRoleAssignment into the expected module namespace
# This ensures SQLAlchemy's string resolution can find it
def _inject_user_role_assignment():
    """Inject UserRoleAssignment into expected module namespace"""
    import sys
    try:
        # Try to get the module from sys.modules first
        user_role_module = sys.modules.get('app.models.user_role_assignment')
        if user_role_module:
            setattr(user_role_module, 'UserRoleAssignment', UserRoleAssignment)
        else:
            # Import and set if not in sys.modules yet
            import app.models.user_role_assignment
            setattr(app.models.user_role_assignment, 'UserRoleAssignment', UserRoleAssignment)
            setattr(sys.modules['app.models.user_role_assignment'], 'UserRoleAssignment', UserRoleAssignment)
    except (ImportError, AttributeError):
        pass  # Module not available yet, will be handled by registry

# Try immediate injection, but don't fail if it doesn't work
_inject_user_role_assignment()

# Ensure they're properly registered
__all__ = ['UserRoleAssignment', 'Activity', 'ActivityEnrichedFeature', 'ProcessNote', 'Task', 'Project', 'Experience', 'Education', 'UserProfile']
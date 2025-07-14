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

# Ensure they're properly registered
__all__ = ['UserRoleAssignment', 'Activity', 'ActivityEnrichedFeature', 'ProcessNote', 'Task', 'Project', 'Experience', 'Education', 'UserProfile']
# This file makes 'models' a package.

# Import all SQLAlchemy models to make them accessible via this package
# and to ensure they are registered with Base.metadata for Alembic discovery
# if env.py imports this models package.

from .user import User, Base # Base is often defined in one model file (e.g., user.py) or a database.py
from .rbac import Role, Permission, user_roles_table, role_permissions_table
from .process_notes import ProcessNote
from .activity import Activity
from .activity_features import ActivityEnrichedFeature
from .anomaly import DetectedAnomaly
from .task import Task # Added new model
from .user_setting import UserSetting # Import the new UserSetting model
from .project import Project # Import the new Project model
from .notification import Notification # Import the new Notification model

# Optionally, define __all__ to specify what is exported when 'from .models import *' is used
__all__ = [
    "User",
    "Base", # Exporting Base can be useful
    "Role",
    "Permission",
    "user_roles_table",
    "role_permissions_table",
    "ProcessNote",
    "Activity",
    "ActivityEnrichedFeature",
    "DetectedAnomaly",
    "Task", # Added new model
    "UserSetting", # Add UserSetting to __all__
    "Project", # Add Project to __all__
    "Notification", # Add Notification to __all__
]

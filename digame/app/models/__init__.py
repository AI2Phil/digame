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
from .task import Task
from .user_setting import UserSetting
# Import the actual models from the existing workflow_automation.py
from .workflow_automation import (
    WorkflowTemplate,
    WorkflowInstance,
    WorkflowStepExecution,
    AutomationRule,
    WorkflowAction,
    WorkflowIntegration
    # Note: The WorkflowLogStatus enum was part of the simpler model definition,
    # the existing advanced models use strings for status fields.
)

# Optionally, define __all__ to specify what is exported when 'from .models import *' is used
__all__ = [
    "User",
    "Base",
    "Role",
    "Permission",
    "user_roles_table",
    "role_permissions_table",
    "ProcessNote",
    "Activity",
    "ActivityEnrichedFeature",
    "DetectedAnomaly",
    "Task",
    "UserSetting",
    "WorkflowTemplate",
    "WorkflowInstance",
    "WorkflowStepExecution",
    "AutomationRule",
    "WorkflowAction",
    "WorkflowIntegration",
]

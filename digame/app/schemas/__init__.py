# This file makes 'schemas' a Python package.

# Optionally, import schemas for easier access, e.g.:
from .rbac_schemas import RoleCreate, RoleResponse, PermissionCreate, PermissionResponse, UserRoleAssignRequest, RolePermissionAssignRequest # etc.
# from .user_schemas import UserCreate, UserResponse # Assuming user_schemas.py exists
from .process_note_schemas import ProcessNoteResponse, ProcessDiscoveryResponse, ProcessNoteFeedbackUpdate
from .anomaly_schemas import DetectedAnomalyResponse, DetectedAnomalyBase
from .task_schemas import TaskBase, TaskCreate, TaskUpdate, TaskResponse # Added new task schemas
from .user_setting_schemas import UserSettingBase, UserSettingCreate, UserSettingUpdate, UserSetting # Import new UserSetting schemas
from .onboarding_schemas import OnboardingDataBase, OnboardingDataCreate, OnboardingDataUpdate, OnboardingDataResponse, OnboardingStep # Import new onboarding schemas

__all__ = [
    "RoleCreate", "RoleResponse",
    "PermissionCreate", "PermissionResponse",
    "UserRoleAssignRequest", "RolePermissionAssignRequest",
    # Add other RBAC schemas if needed
    "ProcessNoteResponse",
    "ProcessDiscoveryResponse",
    "ProcessNoteFeedbackUpdate",
    "DetectedAnomalyBase",
    "DetectedAnomalyResponse",
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskResponse", # Added new task schemas
    "UserSettingBase", "UserSettingCreate", "UserSettingUpdate", "UserSetting", # Add UserSetting schemas to __all__
    "OnboardingDataBase", "OnboardingDataCreate", "OnboardingDataUpdate", "OnboardingDataResponse", "OnboardingStep", # Add onboarding schemas to __all__
    "writing_assistance_schemas",
    "communication_style_schemas",
    "meeting_insights_schemas",
    "email_analysis_schemas",
    "language_learning_schemas",
    "task_prioritization_schemas",
]

from . import writing_assistance_schemas
from . import communication_style_schemas
from . import meeting_insights_schemas
from . import email_analysis_schemas
from . import language_learning_schemas
from . import task_prioritization_schemas

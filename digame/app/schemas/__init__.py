# This file makes 'schemas' a Python package.

# Optionally, import schemas for easier access, e.g.:
from .rbac_schemas import RoleCreate, RoleResponse, PermissionCreate, PermissionResponse, UserRoleAssignRequest, RolePermissionAssignRequest # etc.
# from .user_schemas import UserCreate, UserResponse # Assuming user_schemas.py exists
from .user_schemas import User, UserCreate, UserUpdate, UserBase, ContactInfoSchema, UserWithRoles
from .project_schemas import ProjectBase, ProjectCreate, ProjectUpdate, ProjectSchema
from .experience_schemas import ExperienceBase, ExperienceCreate, ExperienceUpdate, ExperienceSchema
from .education_schemas import EducationBase, EducationCreate, EducationUpdate, EducationSchema
from .process_note_schemas import ProcessNoteResponse, ProcessDiscoveryResponse, ProcessNoteFeedbackUpdate
from .anomaly_schemas import DetectedAnomalyResponse, DetectedAnomalyBase
from .task_schemas import TaskBase, TaskCreate, TaskUpdate, TaskResponse # Added new task schemas
from .user_setting_schemas import UserSettingBase, UserSettingCreate, UserSettingUpdate, UserSetting # Import new UserSetting schemas
from .onboarding_schemas import OnboardingDataBase, OnboardingDataCreate, OnboardingDataUpdate, OnboardingDataResponse, OnboardingStep # Import new onboarding schemas


__all__ = [
    # User Schemas
    "User", "UserCreate", "UserUpdate", "UserBase", "ContactInfoSchema", "UserWithRoles",
    # Project Schemas
    "ProjectBase", "ProjectCreate", "ProjectUpdate", "ProjectSchema",
    # Experience Schemas
    "ExperienceBase", "ExperienceCreate", "ExperienceUpdate", "ExperienceSchema",
    # Education Schemas
    "EducationBase", "EducationCreate", "EducationUpdate", "EducationSchema",
    # RBAC Schemas
    "RoleCreate", "RoleResponse",
    "PermissionCreate", "PermissionResponse",
    "UserRoleAssignRequest", "RolePermissionAssignRequest",
    # Add other RBAC schemas if needed
    "ProcessNoteResponse",
    "ProcessDiscoveryResponse",
    "ProcessNoteFeedbackUpdate",
    "DetectedAnomalyBase",
    "DetectedAnomalyResponse",
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskResponse",
    "UserSettingBase", "UserSettingCreate", "UserSettingUpdate", "UserSetting",
    "OnboardingDataBase", "OnboardingDataCreate", "OnboardingDataUpdate", "OnboardingDataResponse", "OnboardingStep",
    "writing_assistance_schemas", # This seems to be a module, keeping it as is.
]

from . import writing_assistance_schemas
# Ensure other modules are imported if they are structured like writing_assistance_schemas
# However, for the new schemas, explicit imports of classes are generally preferred for clarity.

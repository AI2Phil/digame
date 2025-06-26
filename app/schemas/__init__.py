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
from .project_schemas import Project, ProjectCreate, ProjectMatchResponse # Import project schemas
from .notification_schemas import Notification, NotificationCreate, NotificationUpdate # Import new notification schemas
from .team_schemas import (
    TeamBase, TeamCreate, TeamUpdate, Team, TeamWithMembers, TeamWithFullDetails,
    TeamMemberBase, TeamMemberCreate, TeamMemberUpdate, TeamMember, TeamMemberAction,
    TeamPerformanceMetricBase, TeamPerformanceMetricCreate, TeamPerformanceMetricUpdate, TeamPerformanceMetric,
    TeamSkillGapBase, TeamSkillGapCreate, TeamSkillGapUpdate, TeamSkillGap,
    TeamWorkflowBase, TeamWorkflowCreate, TeamWorkflowUpdate, TeamWorkflow,
    TeamAnalyticsDashboard, TeamCollaborationPattern, TeamRoleEnumSchema
)

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
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskResponse", # Added new task schemas
    "UserSettingBase", "UserSettingCreate", "UserSettingUpdate", "UserSetting", # Add UserSetting schemas to __all__
    "OnboardingDataBase", "OnboardingDataCreate", "OnboardingDataUpdate", "OnboardingDataResponse", "OnboardingStep", # Add onboarding schemas to __all__
    "Project", "ProjectCreate", "ProjectMatchResponse", # Add project schemas to __all__
    "Notification", "NotificationCreate", "NotificationUpdate", # Add notification schemas to __all__
    "writing_assistance_schemas",
    "communication_style_schemas",
    "meeting_insights_schemas",
    "email_analysis_schemas",
    "language_learning_schemas",
    "task_prioritization_schemas",
    # Team Schemas
    "TeamBase", "TeamCreate", "TeamUpdate", "Team", "TeamWithMembers", "TeamWithFullDetails",
    "TeamMemberBase", "TeamMemberCreate", "TeamMemberUpdate", "TeamMember", "TeamMemberAction",
    "TeamPerformanceMetricBase", "TeamPerformanceMetricCreate", "TeamPerformanceMetricUpdate", "TeamPerformanceMetric",
    "TeamSkillGapBase", "TeamSkillGapCreate", "TeamSkillGapUpdate", "TeamSkillGap",
    "TeamWorkflowBase", "TeamWorkflowCreate", "TeamWorkflowUpdate", "TeamWorkflow",
    "TeamAnalyticsDashboard", "TeamCollaborationPattern", "TeamRoleEnumSchema",
    # Document Processing Schemas
    "DocumentSummarizationRequest", "DocumentSummarizationResponse",
    "MultiDocumentSynthesisRequest", "MultiDocumentSynthesisResponse", "SingleDocumentInput",
    "DocumentActionItemRequest", "DocumentActionItemResponse",
    "DocumentProcessingErrorResponse",
]

from . import writing_assistance_schemas
from . import communication_style_schemas
from . import meeting_insights_schemas
from . import email_analysis_schemas
from . import language_learning_schemas
from . import task_prioritization_schemas
from . import document_processing_schemas # Import the new module

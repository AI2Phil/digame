# This file makes 'models' a package.

# Import all SQLAlchemy models to make them accessible via this package
# and to ensure they are registered with Base.metadata for Alembic discovery
# if env.py imports this models package.

from .user import User
from app.database import Base # Import Base from the centralized database module
from .rbac import Role, Permission, UserRoleAssignment, role_permissions_table
from .process_notes import ProcessNote
from .activity import Activity
from .activity_features import ActivityEnrichedFeature
from .anomaly import DetectedAnomaly
from .task import Task # Added new model
from .behavior_model import BehavioralModel, BehavioralPattern # Added behavioral models
from .user_setting import UserSetting # Import the new UserSetting model
# Import from the comprehensive notifications module instead of the old notification module
# from .notification import Notification # Old simple version - removed to avoid conflicts
# Import the actual models from the existing workflow_automation.py
from .workflow_automation import (
    WorkflowTemplate,
    WorkflowInstance,
    WorkflowStepExecution,
    AutomationRule,
    WorkflowAction,
    WorkflowIntegration,
    WorkflowReportConfig
    # Note: The WorkflowLogStatus enum was part of the simpler model definition,
    # the existing advanced models use strings for status fields.
)
from .project import Project # Import the new Project model
from .experience import Experience # Import the new Experience model
from .education import Education # Import the new Education model
from .communication import Message # Import the new Message model
from .social import UserConnection, PeerMatch, SocialMetrics, UserSkill # Import social networking models
from .social_collaboration import (
    PeerConnection, PeerMessage, CollaborationProject, ProjectMember,
    ProjectApplication, SkillEndorsement, MentorshipConnection,
    ConnectionStatus, MessageType, ProjectStatus
) # Import enhanced social collaboration models
from .gamification import (
    Achievement, UserAchievement, Streak, Milestone, UserPoints,
    Badge, UserBadge, LeaderboardEntry, AchievementType, AchievementRarity
) # Import gamification models
from .team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum
# from .comparative_benchmark import ComparativeBenchmark # Temporarily disabled due to tenant dependency
from .analytics import AnalyticsModel, AnalyticsPrediction, AnalyticsTrainingJob, ROICalculation, PerformanceMetric
from .dashboard_models import ProductivityChartDataPoint, ProductivityChart, ActivityBreakdownItem, ActivityBreakdown, ProductivityMetric, ProductivityMetricsGroup, RecentActivityItem, RecentActivities
from .reporting import Report, ReportExecution, ReportSchedule, ReportSubscription, ReportTemplate, ReportAuditLog, ReportCache
# from .dashboard_custom import AnalyticsDashboard, DashboardWidget, ReportDefinition # Added for custom dashboards - temporarily disabled due to tenant dependency
from .tenant import Tenant, TenantSettings, TenantInvitation, TenantAuditLog # Added tenant models
# from .enterprise_sso import TenantSSOConfiguration # Added enterprise SSO models - temporarily disabled
from .digital_twin import (
    DigitalTwin, ActivityPattern, BehavioralLearning, PredictionModel,
    SimulationResult, TwinInteraction, ActivityStream, TwinKnowledge, TwinStatus
) # Added Digital Twin models
from .guest_onboarding import GuestOnboardingProgress, DigitalTwinProfile, EmailVerification # Added guest onboarding models
from .onboarding_persistence import UserOnboardingProgress # Added user onboarding progress model
from .collaboration_models import (
    Workspace, WorkspaceMember, Channel, Message, MessageReaction,
    UserPresence, CollaborationSession, MessageAttachment,
    ChannelType, MessageType, SessionType, UserStatus
) # Added real-time collaboration models
from .ml_models import (
    MLModel, TrainingJob, ModelPrediction, ModelEvaluation,
    ModelDeployment, DatasetMetadata, ExperimentRun,
    ModelType, ModelStatus, TrainingStatus
) # Added ML models
from .learning import (
    CourseCategory, Course, CourseEnrollment, LearningProgress, LearningRecommendation
) # Added learning models

# Optionally, define __all__ to specify what is exported when 'from .models import *' is used
__all__ = [
    "User",
    "Base",
    "Role",
    "Permission",
    "UserRoleAssignment",
    "role_permissions_table",
    "ProcessNote",
    "Activity",
    "ActivityEnrichedFeature",
    "DetectedAnomaly",
    "Task", # Added new model
    "BehavioralModel", # Added behavioral models
    "BehavioralPattern",
    "UserSetting", # Add UserSetting to __all__
    "WorkflowTemplate",
    "WorkflowInstance",
    "WorkflowStepExecution",
    "AutomationRule",
    "WorkflowAction",
    "WorkflowIntegration",
    "WorkflowReportConfig",
    "Project", # Add Project to __all__
    "Experience", # Add Experience to __all__
    "Education", # Add Education to __all__
    "Message", # Add Message to __all__
    "UserConnection", # Add social networking models to __all__
    "PeerMatch",
    "SocialMetrics",
    "UserSkill", # UserSkill model restored
    "PeerConnection", # Add enhanced social collaboration models to __all__
    "PeerMessage",
    "CollaborationProject",
    "ProjectMember",
    "ProjectApplication",
    "SkillEndorsement",
    "MentorshipConnection",
    "ConnectionStatus",
    "MessageType",
    "ProjectStatus",
    "Achievement", # Add gamification models to __all__
    "UserAchievement",
    "Streak",
    "Milestone",
    "UserPoints",
    "Badge",
    "UserBadge",
    "LeaderboardEntry",
    "AchievementType",
    "AchievementRarity",
    "Team",
    "TeamMember",
    "TeamPerformanceMetric",
    "TeamSkillGap",
    "TeamWorkflow",
    "TeamRoleEnum",
    # "ComparativeBenchmark", # Temporarily disabled due to tenant dependency
    "AnalyticsModel",
    "AnalyticsPrediction",
    "AnalyticsTrainingJob",
    "ROICalculation",
    "PerformanceMetric",
    "ProductivityChartDataPoint",
    "ProductivityChart",
    "ActivityBreakdownItem",
    "ActivityBreakdown",
    "ProductivityMetric",
    "ProductivityMetricsGroup",
    "RecentActivityItem",
    "RecentActivities",
    "Report",
    "ReportExecution",
    "ReportSchedule",
    "ReportSubscription",
    "ReportTemplate",
    "ReportAuditLog",
    "ReportCache",
    # "AnalyticsDashboard", # Added for custom dashboards - temporarily disabled
    # "DashboardWidget",    # Added for custom dashboards - temporarily disabled
    # "ReportDefinition",   # Added for custom dashboards - temporarily disabled
    "Tenant",             # Added tenant models
    "TenantSettings",
    "TenantInvitation",
    "TenantAuditLog",
    # "TenantSSOConfiguration", # Added enterprise SSO models - temporarily disabled
    "DigitalTwin",        # Added Digital Twin models
    "ActivityPattern",
    "BehavioralLearning",
    "PredictionModel",
    "SimulationResult",
    "TwinInteraction",
    "ActivityStream",
    "TwinKnowledge",
    "TwinStatus",
    "GuestOnboardingProgress",  # Added guest onboarding models
    "DigitalTwinProfile",
    "EmailVerification",
    "UserOnboardingProgress",   # Added user onboarding progress model
    "Workspace",              # Added real-time collaboration models
    "WorkspaceMember",
    "Channel",
    "Message",
    "MessageReaction",
    "UserPresence",
    "CollaborationSession",
    "MessageAttachment",
    "ChannelType",
    "MessageType",
    "SessionType",
    "UserStatus",
]

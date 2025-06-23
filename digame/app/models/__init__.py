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
from .notification import Notification # Import the new Notification model
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
from .project import Project # Import the new Project model
from .experience import Experience # Import the new Experience model
from .education import Education # Import the new Education model
from .communication import Message # Import the new Message model
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
from .comparative_benchmark import ComparativeBenchmark
from .analytics import AnalyticsModel, AnalyticsPrediction, AnalyticsTrainingJob, ROICalculation, PerformanceMetric
from .dashboard_models import ProductivityChartDataPoint, ProductivityChart, ActivityBreakdownItem, ActivityBreakdown, ProductivityMetric, ProductivityMetricsGroup, RecentActivityItem, RecentActivities
from .reporting import Report, ReportExecution, ReportSchedule, ReportSubscription, ReportTemplate, ReportAuditLog, ReportCache
from .dashboard_custom import AnalyticsDashboard, DashboardWidget, ReportDefinition # Added for custom dashboards

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
    "Task", # Added new model
    "UserSetting", # Add UserSetting to __all__
    "Notification", # Add Notification to __all__
    "WorkflowTemplate",
    "WorkflowInstance",
    "WorkflowStepExecution",
    "AutomationRule",
    "WorkflowAction",
    "WorkflowIntegration",
    "Project", # Add Project to __all__
    "Experience", # Add Experience to __all__
    "Education", # Add Education to __all__
    "Message", # Add Message to __all__
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
    "ComparativeBenchmark",
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
    "AnalyticsDashboard", # Added for custom dashboards
    "DashboardWidget",    # Added for custom dashboards
    "ReportDefinition",   # Added for custom dashboards
]

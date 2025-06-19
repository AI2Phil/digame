# This file makes 'services' a Python package.

from .rbac_service import (
    get_user_roles,
    get_user_permissions,
    user_has_permission
)

from .process_note_service import (
    identify_and_update_process_notes
)

from .activity_feature_service import ( 
    generate_features_for_activity,
    generate_features_for_user_activities
)

from .anomaly_service import ( # Added new service
    calculate_hourly_activity_baselines,
    check_activity_for_anomalies,
    detect_frequency_anomalies_for_user
)

__all__ = [
    "get_user_roles",
    "get_user_permissions",
    "user_has_permission",
    "identify_and_update_process_notes",
    "generate_features_for_activity", 
    "generate_features_for_user_activities",
    "calculate_hourly_activity_baselines", # Added new function
    "check_activity_for_anomalies",        # Added new function
    "detect_frequency_anomalies_for_user", # Added new function
    "writing_assistance_service",
    "communication_style_service",
    "meeting_insights_service",
    "email_analysis_service",
    "language_learning_service",
]

from . import writing_assistance_service
from . import communication_style_service
from . import meeting_insights_service
from . import email_analysis_service
from . import language_learning_service

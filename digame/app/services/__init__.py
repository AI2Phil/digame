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
    "AIIntegrationService", # Added new service
    "NotificationService", # Added NotificationService
    "VoiceNLUService", # Added VoiceNLUService
]

from . import writing_assistance_service
from .ai_integration_service import AIIntegrationService # Added import
from .notification_service import NotificationService # Added import
from .voice_nlu_service import VoiceNLUService # Added import

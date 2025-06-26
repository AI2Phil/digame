# This file makes 'services' a Python package.

from .rbac_service import (
    RBACService,
    get_rbac_service,
    user_has_permission,
    get_user_roles,
    get_user_permissions
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
    "RBACService",
    "get_rbac_service",
    "user_has_permission",
    "get_user_roles",
    "get_user_permissions",
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
    "communication_style_service",
    "meeting_insights_service",
    "email_analysis_service",
    "language_learning_service",
    "task_prioritization_service",
    "TeamService",
    "ProcessNLPService", # Added new service
    "DocumentProcessingService", # Added new service
]

# from . import writing_assistance_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
from .ai_integration_service import AIIntegrationService # Added import
# from .notification_service import NotificationService # Added import  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from .voice_nlu_service import VoiceNLUService # Added import  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from . import communication_style_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from . import meeting_insights_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from . import email_analysis_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from . import language_learning_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from . import task_prioritization_service  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
# from .team_service import TeamService  # Temporarily commented out due to FastAPI/Pydantic v1/Python 3.13 compatibility issue
from .process_nlp_service import ProcessNLPService # Added import
from .document_processing_service import DocumentProcessingService, get_document_processing_service # Added import

# This file makes 'routers' a Python package.

# Optionally, import routers for easier access in main.py, e.g.:
# from .admin_rbac_router import router as admin_rbac_router
# from .predictive_router import router as predictive_router # Assuming predictive_router.py exists
from .user_setting_router import router as user_setting_router # Import the new user setting router
from . import writing_assistance_router

__all__ = [
    "user_setting_router", # Assuming this was meant to be exported
    "writing_assistance_router",
    "communication_style_router",
    "meeting_insights_router",
    "email_analysis_router",
    "language_learning_router",
]

from . import communication_style_router
from . import meeting_insights_router
from . import email_analysis_router
from . import language_learning_router

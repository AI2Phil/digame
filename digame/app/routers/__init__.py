# This file makes 'routers' a Python package.

# Optionally, import routers for easier access in main.py, e.g.:
# from .admin_rbac_router import router as admin_rbac_router
# from .predictive_router import router as predictive_router # Assuming predictive_router.py exists
from .user_setting_router import router as user_setting_router # Import the new user setting router

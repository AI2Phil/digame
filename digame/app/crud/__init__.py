# This file makes 'crud' a Python package.

# Import CRUD functions for easier access from services
from .user_crud import (
    get_user, get_user_by_email, get_user_by_username, get_users,
    create_user, update_user, delete_user, authenticate_user
)
from .rbac_crud import (
    create_role, get_role_by_name, get_roles, update_role, delete_role,
    create_permission, get_permission_by_name, get_permissions, update_permission, delete_permission,
    assign_role_to_user_by_names, remove_role_from_user_by_names,
    add_permission_to_role_by_names, remove_permission_from_role_by_names
)
from .process_notes_crud import (
    get_process_note_by_id,
    get_process_notes_by_user_id,
    update_process_note_feedback_tags # Added new function
)
from .job_crud import (
    create_job,
    get_job_by_id,
    get_jobs_for_user,
    update_job_status,
    delete_job
)
# Import UserSetting CRUD (assuming it was added previously or should be here)
from .user_setting_crud import get_user_setting, create_user_setting, update_user_setting, delete_user_setting

from .notification_crud import (
    create_user_notification,
    get_notification,
    get_notifications_by_user,
    update_notification,
    delete_notification,
    get_pending_scheduled_notifications,
    mark_notification_as_read,
    mark_multiple_notifications_as_read
)

__all__ = [
    # User CRUD
    "get_user", "get_user_by_email", "get_user_by_username", "get_users",
    "create_user", "update_user", "delete_user", "authenticate_user",
    
    # RBAC CRUD
    "create_role", "get_role_by_name", "get_roles", "update_role", "delete_role",
    "create_permission", "get_permission_by_name", "get_permissions", "update_permission", "delete_permission",
    "assign_role_to_user_by_names", "remove_role_from_user_by_names",
    "add_permission_to_role_by_names", "remove_permission_from_role_by_names",
    
    # Process Notes CRUD
    "get_process_note_by_id",
    "get_process_notes_by_user_id",
    "update_process_note_feedback_tags", # Added new function
    
    # Job CRUD
    "create_job",
    "get_job_by_id",
    "get_jobs_for_user",
    "update_job_status",
    "delete_job",

    # UserSetting CRUD
    "get_user_setting", "create_user_setting", "update_user_setting", "delete_user_setting",

    # Notification CRUD
    "create_user_notification",
    "get_notification",
    "get_notifications_by_user",
    "update_notification",
    "delete_notification",
    "get_pending_scheduled_notifications",
    "mark_notification_as_read",
    "mark_multiple_notifications_as_read",
]

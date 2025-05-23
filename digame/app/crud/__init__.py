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
]

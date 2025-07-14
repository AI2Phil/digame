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
# Import UserSetting CRUD
from .user_setting_crud import get_user_setting, create_user_setting, update_user_setting, delete_user_setting

# Import comprehensive notification CRUD functions (combining both versions)
from .notification_crud import (
    create_notification,
    create_user_notification,
    get_notification,
    get_notifications_by_user,
    get_unread_notifications_by_user,
    get_notifications_for_user,
    update_notification,
    mark_notification_as_read,
    mark_all_notifications_as_read_for_user,
    mark_multiple_notifications_as_read,
    get_pending_scheduled_notifications,
    delete_notification
)
from .task_crud import (
    get_task_by_id,
    get_tasks_by_user_id,
    create_task,
    update_task,
    update_task_status,
    delete_task,
    get_tasks_by_process_note_id
)
from . import notification_crud # Also import the module for compatibility

# New CRUD imports
from .project_crud import (
    get_project, get_projects_by_user, create_user_project, update_project, delete_project
)
from .experience_crud import (
    get_experience, get_experience_by_user, create_user_experience, update_experience, delete_experience
)
from .education_crud import (
    get_education_entry, get_education_by_user, create_user_education, update_education_entry, delete_education_entry
)

# Team CRUD imports
from .team_crud import (
    create_team, get_team, get_teams, update_team, delete_team,
    create_team_member, get_team_member, get_team_members, update_team_member, delete_team_member,
    create_team_performance_metric, get_team_performance_metric, get_team_performance_metrics_for_team, update_team_performance_metric, delete_team_performance_metric,
    create_team_skill_gap, get_team_skill_gap, get_team_skill_gaps_for_team, update_team_skill_gap, delete_team_skill_gap,
    create_team_workflow, get_team_workflow, get_team_workflows_for_team, update_team_workflow, delete_team_workflow
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

    # UserSetting CRUD (ensure it's imported if not already)
    "get_user_setting", "create_user_setting", "update_user_setting", "delete_user_setting",

    # Notification CRUD
    "create_notification",
    "get_notification",
    "get_notifications_by_user",
    "get_unread_notifications_by_user",
    "get_notifications_for_user",
    "update_notification",
    "mark_notification_as_read",
    "mark_all_notifications_as_read_for_user",
    "delete_notification",
    "notification_crud",

    # Task CRUD
    "get_task_by_id",
    "get_tasks_by_user_id",
    "create_task",
    "update_task",
    "update_task_status",
    "delete_task",
    "get_tasks_by_process_note_id",
    "task_crud",

    # Project CRUD
    "get_project", "get_projects_by_user", "create_user_project", "update_project", "delete_project",
    # Experience CRUD
    "get_experience", "get_experience_by_user", "create_user_experience", "update_experience", "delete_experience",
    # Education CRUD
    "get_education_entry", "get_education_by_user", "create_user_education", "update_education_entry", "delete_education_entry",
    
    # Additional notification CRUD functions
    "create_user_notification",
    "get_pending_scheduled_notifications",
    "mark_multiple_notifications_as_read",

    # Team CRUD
    "create_team", "get_team", "get_teams", "update_team", "delete_team",
    "create_team_member", "get_team_member", "get_team_members", "update_team_member", "delete_team_member",
    "create_team_performance_metric", "get_team_performance_metric", "get_team_performance_metrics_for_team", "update_team_performance_metric", "delete_team_performance_metric",
    "create_team_skill_gap", "get_team_skill_gap", "get_team_skill_gaps_for_team", "update_team_skill_gap", "delete_team_skill_gap",
    "create_team_workflow", "get_team_workflow", "get_team_workflows_for_team", "update_team_workflow", "delete_team_workflow",
    "team_crud",
]

from . import user_setting_crud # Assuming this was intended to be imported for __all__
from . import tenant_crud # Assuming this was intended to be imported for __all__
from . import task_crud
from . import team_crud # Import team_crud module for test compatibility

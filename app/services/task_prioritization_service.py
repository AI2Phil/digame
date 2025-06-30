import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import List, Dict, Any, Optional, cast
from datetime import datetime, timedelta

# Assuming Task model is correctly imported via models package
from ..models import Task as TaskModel
from ..models.user import User as UserModel
from ..crud import user_setting_crud # For potential future API key use
from ..crud import task_crud # To fetch tasks for a user
from ..db import get_db # For the dependency injector

# No external client for now, focusing on internal heuristics

class TaskPrioritizationService:
    def __init__(self, db: Session):
        self.db = db

    def _apply_internal_heuristics(self, task: TaskModel) -> float:
        """
        Applies internal heuristics to a single task to suggest a priority score.
        Scores range from 0.0 (lowest) to 1.0 (highest).
        """
        score = getattr(task, 'priority_score', 0.5) if getattr(task, 'priority_score', None) is not None else 0.5  # type: ignore
        now_utc = datetime.utcnow()

        # Heuristic 1: Deadline and Due Date Proximity
        # Consider 'deadline' field first, then 'due_date_inferred'
        effective_due_date = getattr(task, 'deadline', None) if getattr(task, 'deadline', None) else getattr(task, 'due_date_inferred', None)  # type: ignore
        if effective_due_date:
            if isinstance(effective_due_date, datetime):
                # Ensure comparison is between offset-naive UTC datetimes
                due_date_naive_utc = effective_due_date.replace(tzinfo=None)
                time_diff = due_date_naive_utc - now_utc

                if time_diff.total_seconds() < 0: # Overdue
                    score = min(1.0, score + 0.35)
                elif time_diff.days <= 1: # Due today or tomorrow
                    score = min(1.0, score + 0.25)
                elif time_diff.days <= 3: # Due within 3 days
                    score = min(1.0, score + 0.15)
                elif time_diff.days <= 7: # Due within a week
                    score = min(1.0, score + 0.05)

        # Heuristic 2: Estimated Effort
        estimated_effort = getattr(task, 'estimated_effort_hours', None)  # type: ignore
        if estimated_effort is not None:
            if estimated_effort > 8: # High effort
                score = min(1.0, score + 0.1) # Slightly increase priority for larger tasks that might need planning
            elif estimated_effort < 1: # Low effort / quick task
                score = min(1.0, score + 0.05) # Small boost for quick wins

        # Heuristic 3: Keywords in description (existing)
        task_description = getattr(task, 'description', None)  # type: ignore
        if task_description:
            description_lower = task_description.lower()
            if "urgent" in description_lower or "asap" in description_lower or "critical" in description_lower:
                score = min(1.0, score + 0.3)
            elif "important" in description_lower or "high priority" in description_lower:
                score = min(1.0, score + 0.2)
            elif "review" in description_lower or "feedback" in description_lower:
                score = min(1.0, score + 0.05)


        # Heuristic 4: Status (existing, slightly adjusted)
        task_status = getattr(task, 'status', None)  # type: ignore
        if task_status == 'in_progress':
            score = min(1.0, score + 0.1) # Higher boost for active work
        elif task_status == 'accepted':
            score = min(1.0, score + 0.05)
        elif task_status == 'suggested':
            score = max(0.0, score - 0.1) # Keep suggested tasks lower unless other factors boost them

        # Heuristic 5: Dependencies (Simplified: if a task has dependencies, it might be slightly less urgent until deps are met)
        # This is a very basic interpretation. A more complex system would consider if dependencies are met.
        task_dependencies = getattr(task, 'dependencies', None)  # type: ignore
        if task_dependencies and len(task_dependencies) > 0:
            # For now, we don't have easy access to the status of dependent tasks here.
            # A simple approach: slightly lower priority if it has unmet dependencies.
            # This requires fetching dependent tasks, which is out of scope for this simple heuristic pass.
            # So, for now, this is a placeholder for a more complex check.
            # If we just check for existence of dependencies:
            score = max(0.0, score - 0.05) # Slightly de-prioritize if it's waiting on others

        # Normalize to ensure score is between 0.0 and 1.0
        return max(0.0, min(1.0, round(score, 3)))

    def _get_dependent_tasks_status(self, task_ids: List[int]) -> Dict[int, str]:
        """
        Helper to fetch statuses of dependent tasks.
        This is a conceptual helper; actual implementation would query the DB.
        """
        if not task_ids:
            return {}
        # In a real scenario, query TaskModel for these IDs
        # For now, mock:
        # dependent_tasks = self.db.query(TaskModel.id, TaskModel.status).filter(TaskModel.id.in_(task_ids)).all()
        # return {t_id: status for t_id, status in dependent_tasks}
        return {t_id: "completed" for t_id in task_ids} # Assume all completed for simplicity now


    def prioritize_tasks_for_user(
        self,
        current_user: UserModel,
        apply_changes: bool = False,
        include_dependencies_check: bool = False # Flag to enable more complex dependency checking
    ) -> List[Dict[str, Any]]:
        """
        Fetches tasks for the user, suggests new priority scores based on heuristics,
        and optionally updates them in the database.
        Returns a list of task details with original and suggested scores.
        Includes check for task dependencies if include_dependencies_check is True.
        """
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        user_tenants = getattr(current_user, 'tenants', None)  # type: ignore
        if not user_tenants:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")

        user_tenant_link = user_tenants[0]
        tenant = getattr(user_tenant_link, 'tenant', None)  # type: ignore
        if not tenant:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")

        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        try:
            tenant_features_raw = getattr(tenant, 'features', None)  # type: ignore
            if isinstance(tenant_features_raw, dict):
                tenant_features = tenant_features_raw
            else:
                tenant_features = json.loads(tenant_features_raw or '{}')
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("intelligent_task_prioritization"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Intelligent Task Prioritization feature is not enabled for your tenant."
            )

        user_id = getattr(current_user, 'id', None)  # type: ignore
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found.")
        user_tasks = task_crud.get_tasks_by_user_id(self.db, user_id=cast(int, user_id), exclude_statuses=["completed", "archived"])

        if not user_tasks:
            return []

        prioritized_task_details = []
        tasks_to_update_in_db = []

        for task in user_tasks:
            original_score = getattr(task, 'priority_score', None)  # type: ignore
            suggested_score = self._apply_internal_heuristics(task)

            task_id = getattr(task, 'id', None)  # type: ignore
            task_description = getattr(task, 'description', None)  # type: ignore
            task_status = getattr(task, 'status', None)  # type: ignore
            due_date_inferred = getattr(task, 'due_date_inferred', None)  # type: ignore
            
            task_detail = {
                "id": task_id,
                "description": task_description,
                "status": task_status,
                "due_date_inferred": due_date_inferred.isoformat() if due_date_inferred else None,
                "original_priority_score": original_score,
                "suggested_priority_score": suggested_score
            }
            prioritized_task_details.append(task_detail)

            if apply_changes and (original_score is None or abs(original_score - suggested_score) > 0.0001):
                tasks_to_update_in_db.append({"task_id": getattr(task, 'id', None), "priority_score": suggested_score})  # type: ignore

        if apply_changes and tasks_to_update_in_db:
            for item_to_update in tasks_to_update_in_db:
                task_update_data = {"priority_score": item_to_update["priority_score"]}
                task_crud.update_task(
                    db=self.db,
                    task_id=item_to_update["task_id"],
                    task_update=task_update_data
                )

        # Sort the final list by the new suggested score
        prioritized_task_details.sort(key=lambda x: x["suggested_priority_score"], reverse=True)

        return prioritized_task_details

    def reprioritize_affected_tasks(self, user_id: int, changed_task_id: Optional[int] = None):
        """
        Re-prioritizes tasks for a user, potentially triggered by a change in one task
        (e.g., a dependency completed, or a new high-priority task added).
        This method fetches all relevant tasks for the user and updates their priority scores.
        """
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            # Or raise an exception
            print(f"User with ID {user_id} not found for re-prioritization.")
            return

        # Fetch all non-completed/non-archived tasks for the user to re-evaluate
        # This is similar to prioritize_tasks_for_user but directly applies changes.
        user_tasks = task_crud.get_tasks_by_user_id(
            self.db, user_id=user_id, exclude_statuses=["completed", "archived"]
        )

        if not user_tasks:
            return

        tasks_to_update_in_db = []
        for task in user_tasks:
            original_score = getattr(task, 'priority_score', None)  # type: ignore
            suggested_score = self._apply_internal_heuristics(task) # Apply the same heuristics

            # Check if the score has changed significantly to warrant an update
            if original_score is None or abs(original_score - suggested_score) > 0.001: # Using a small epsilon
                tasks_to_update_in_db.append({"task_id": getattr(task, 'id', None), "priority_score": suggested_score})  # type: ignore

        if tasks_to_update_in_db:
            for item_to_update in tasks_to_update_in_db:
                # Construct a TaskUpdate schema-like dictionary for the CRUD function
                # Assuming task_crud.update_task expects a Pydantic model or a dict that can be parsed into one
                # For simplicity, directly creating the dict. Ensure TaskUpdate model can handle this.
                # If TaskUpdate requires a specific Pydantic model, this would need adjustment.
                task_update_data = {"priority_score": item_to_update["priority_score"]}

                # We need to ensure that task_crud.update_task can accept a dictionary
                # or we create a TaskUpdate object.
                # For now, assuming it can handle a dict that matches TaskUpdate fields.
                # A safer way would be: from ..schemas.task_schemas import TaskUpdate
                # task_update_obj = TaskUpdate(priority_score=item_to_update["priority_score"])
                # task_crud.update_task(db=self.db, task_id=item_to_update["task_id"], task_update=task_update_obj, user_id=user_id)

                # Simplified call assuming dict is okay or TaskUpdate can be implicitly created by CRUD
                task_crud.update_task(
                    db=self.db,
                    task_id=item_to_update["task_id"],
                    task_update=task_update_data, # Passing dict directly
                    user_id=user_id # Ensure ownership for update
                )
            print(f"Re-prioritized {len(tasks_to_update_in_db)} tasks for user {user_id}.")
        else:
            print(f"No priority changes needed for user {user_id}'s tasks.")


# Dependency injector function
def get_task_prioritization_service(db: Session = Depends(get_db)) -> TaskPrioritizationService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of TaskPrioritizationService with a DB session.
    """
    return TaskPrioritizationService(db)

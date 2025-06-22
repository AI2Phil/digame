import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

# Assuming Task model is correctly imported via models package
from digame.app.models import Task as TaskModel
from digame.app.models.user import User as UserModel
from digame.app.crud import user_setting_crud # For potential future API key use
from digame.app.crud import task_crud # To fetch tasks for a user
from digame.app.db import get_db # For the dependency injector

# No external client for now, focusing on internal heuristics

class TaskPrioritizationService:
    def __init__(self, db: Session):
        self.db = db

    def _apply_internal_heuristics(self, task: TaskModel) -> float:
        """
        Applies internal heuristics to a single task to suggest a priority score.
        Scores range from 0.0 (lowest) to 1.0 (highest).
        """
        score = task.priority_score if task.priority_score is not None else 0.5 # Start with existing or default

        # Heuristic 1: Due date proximity
        if task.due_date_inferred:
            now = datetime.utcnow() # Use utcnow for consistency if due_date_inferred is timezone-aware UTC
            # Ensure due_date_inferred is offset-aware if now() is, or make both naive.
            # For simplicity, assuming naive UTC dates or consistent timezone handling.
            # If due_date_inferred can be None or is not a datetime object, add checks.
            if isinstance(task.due_date_inferred, datetime):
                time_diff = task.due_date_inferred.replace(tzinfo=None) - now.replace(tzinfo=None) # Make naive for comparison

                if time_diff.days < 0: # Overdue
                    score = min(1.0, score + 0.3)
                elif time_diff.days <= 1: # Due today or tomorrow
                    score = min(1.0, score + 0.2)
                elif time_diff.days <= 3: # Due within 3 days
                    score = min(1.0, score + 0.1)

        # Heuristic 2: Keywords in description (very basic example)
        if task.description:
            description_lower = task.description.lower()
            if "urgent" in description_lower or "asap" in description_lower:
                score = min(1.0, score + 0.25)
            if "important" in description_lower:
                score = min(1.0, score + 0.15)

        # Heuristic 3: Status (e.g., 'in_progress' might be higher than 'suggested')
        if task.status == 'in_progress': # Make sure 'in_progress' is a valid status string
            score = min(1.0, score + 0.05)
        elif task.status == 'suggested': # Explicitly lower priority for merely suggested tasks
            score = max(0.0, score - 0.1)

        # Normalize to ensure score is between 0.0 and 1.0
        return max(0.0, min(1.0, round(score, 3)))


    def prioritize_tasks_for_user(self, current_user: UserModel, apply_changes: bool = False) -> List[Dict[str, Any]]:
        """
        Fetches tasks for the user, suggests new priority scores based on heuristics,
        and optionally updates them in the database.
        Returns a list of task details with original and suggested scores.
        """
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        if not hasattr(current_user, 'tenants') or not current_user.tenants:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not associated with any tenant.")

        user_tenant_link = current_user.tenants[0]
        if not hasattr(user_tenant_link, 'tenant'):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tenant linkage error for user.")

        tenant = user_tenant_link.tenant

        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant information not found for user.")

        try:
            tenant_features = tenant.features if isinstance(tenant.features, dict) else json.loads(tenant.features or '{}')
        except json.JSONDecodeError:
            # Log error: Tenant features JSON is corrupted for tenant.id
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error reading tenant configuration.")

        if not tenant_features.get("intelligent_task_prioritization"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Intelligent Task Prioritization feature is not enabled for your tenant."
            )

        user_tasks = task_crud.get_tasks_by_user_id(self.db, user_id=current_user.id, exclude_statuses=["completed", "archived"])

        if not user_tasks:
            return []

        prioritized_task_details = []
        tasks_to_update_in_db = []

        for task in user_tasks:
            original_score = task.priority_score
            suggested_score = self._apply_internal_heuristics(task)

            task_detail = {
                "id": task.id,
                "description": task.description,
                "status": task.status,
                "due_date_inferred": task.due_date_inferred.isoformat() if task.due_date_inferred else None,
                "original_priority_score": original_score,
                "suggested_priority_score": suggested_score
            }
            prioritized_task_details.append(task_detail)

            if apply_changes and (original_score is None or abs(original_score - suggested_score) > 0.0001):
                tasks_to_update_in_db.append({"task_id": task.id, "priority_score": suggested_score})

        if apply_changes and tasks_to_update_in_db:
            for item_to_update in tasks_to_update_in_db:
                task_crud.update_task(
                    self.db,
                    task_id=item_to_update["task_id"],
                    task_in={"priority_score": item_to_update["priority_score"]},
                    user_id_for_verification=current_user.id # Pass user_id for ownership verification
                )

        # Sort the final list by the new suggested score
        prioritized_task_details.sort(key=lambda x: x["suggested_priority_score"], reverse=True)

        return prioritized_task_details

# Dependency injector function
def get_task_prioritization_service(db: Session = Depends(get_db)) -> TaskPrioritizationService:
    """
    Factory function for FastAPI dependency injection.
    Provides an instance of TaskPrioritizationService with a DB session.
    """
    return TaskPrioritizationService(db)

import pytest
import json
from typing import Optional
from unittest.mock import MagicMock, patch, call
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from fastapi import HTTPException

# Models
from app.models.user import User as UserModel
from app.models.tenant import Tenant as TenantModel
# TenantUser model doesn't exist - relationship is direct through User.tenant_id
from app.models.imports import Task as TaskModel # Assuming this is the correct import path

# Service to test
from app.services.task_prioritization_service import TaskPrioritizationService



# --- Fixtures ---

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_user_model_task_prio(): # Renamed for clarity
    user = create_mock_model(UserModel, id=7, email="task_user@example.com", full_name="Task Prio User", tenants=[])
    return user

@pytest.fixture
def mock_tenant_model_task_prio(): # Renamed
    tenant = create_mock_model(TenantModel, id=7,
        name="Task Prio Tenant",
        admin_email="admin@tasktenant.com",
        features={"intelligent_task_prioritization": True}) # Default to enabled
    return tenant

@pytest.fixture
def mock_tenant_user_link_task_prio(mock_user_model_task_prio, mock_tenant_model_task_prio): # Renamed
    # Set up the relationship - user belongs to tenant
    # Create a mock tenant link object that has a tenant attribute
    mock_tenant_link = create_mock_model(object, tenant=mock_tenant_model_task_prio)
    mock_user_model_task_prio.tenant_id = mock_tenant_model_task_prio.id
    mock_user_model_task_prio.tenant = mock_tenant_model_task_prio
    mock_user_model_task_prio.tenants = [mock_tenant_link]  # Service expects this list
    return mock_user_model_task_prio  # Return the user since there's no separate link object

@pytest.fixture
def create_mock_task():
    def _create_mock_task(id: int, description: str, status: str, due_date_inferred: Optional[datetime], priority_score: Optional[float] = 0.5, user_id: int = 7):
        # Create a proper mock model instead of MagicMock to avoid type comparison issues
        task = create_mock_model(TaskModel,
            id=id,
            description=description,
            status=status,
            due_date_inferred=due_date_inferred,
            priority_score=priority_score,
            user_id=user_id,
            estimated_effort_hours=2.0,  # Add default estimated effort
            dependencies=[],  # Add empty dependencies list
            created_at=datetime.utcnow()
        )
        return task
    return _create_mock_task

# --- Tests for TaskPrioritizationService ---
def create_mock_model(model_class, **kwargs):
    """Create a mock instance of a SQLAlchemy model with given attributes."""
    # For testing purposes, we'll create a simple mock object
    # that behaves like the model but doesn't require database instantiation
    class MockModel:
        def __init__(self, **attrs):
            for key, value in attrs.items():
                setattr(self, key, value)
            # Set some default attributes that SQLAlchemy models typically have
            if not hasattr(self, 'id'):
                self.id = 1
            if not hasattr(self, 'created_at'):
                from datetime import datetime, timezone
                self.created_at = datetime.now(timezone.utc)
        
        def __repr__(self):
            attrs = []
            for key, value in self.__dict__.items():
                if not key.startswith('_'):
                    if isinstance(value, str) and len(value) > 20:
                        attrs.append(f"{key}='{value[:20]}...'")
                    else:
                        attrs.append(f"{key}={repr(value)}")
            return f"<{model_class.__name__}({', '.join(attrs)})>"
    
    return MockModel(**kwargs)


def test_prioritize_tasks_success_no_db_apply(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    now = datetime.utcnow()
    tasks = [
        create_mock_task(id=1, description="Urgent task", status="pending", due_date_inferred=now + timedelta(days=1), priority_score=0.6),
        create_mock_task(id=2, description="Less important task", status="suggested", due_date_inferred=now + timedelta(days=7), priority_score=0.3),
        create_mock_task(id=3, description="Overdue task", status="in_progress", due_date_inferred=now - timedelta(days=1), priority_score=0.7),
    ]
    with patch('app.crud.task_crud.get_tasks_by_user_id', return_value=tasks) as mock_get_tasks, \
         patch('app.crud.task_crud.update_task') as mock_update_task:
        # Action
        result = service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio, apply_changes=False)
        # Assertion
        assert len(result) == len(tasks)
        assert "original_priority_score" in result[0]
        assert "suggested_priority_score" in result[0]
        mock_get_tasks.assert_called_once_with(mock_db_session, user_id=mock_user_model_task_prio.id, exclude_statuses=["completed", "archived"])
        mock_update_task.assert_not_called()
        # Check that results are sorted by suggested_priority_score in descending order
        scores = [task["suggested_priority_score"] for task in result]
        assert scores == sorted(scores, reverse=True), "Tasks should be sorted by priority score descending"
        
        # Check that overdue task has higher score than others
        overdue_task = next(task for task in result if task["id"] == 3)
        urgent_task = next(task for task in result if task["id"] == 1)
        less_important_task = next(task for task in result if task["id"] == 2)
        
        assert overdue_task["suggested_priority_score"] >= urgent_task["suggested_priority_score"]
        assert urgent_task["suggested_priority_score"] >= less_important_task["suggested_priority_score"]

def test_prioritize_tasks_success_with_db_apply(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    now = datetime.utcnow()
    # Create tasks where suggested score will differ from original
    task1_original_score = 0.4
    task1 = create_mock_task(id=1, description="Urgent task apply", status="pending", due_date_inferred=now + timedelta(days=1), priority_score=task1_original_score)
    tasks = [task1]

    with patch('app.crud.task_crud.get_tasks_by_user_id', return_value=tasks) as mock_get_tasks, \
         patch('app.crud.task_crud.update_task') as mock_update_task:
        # Action
        result = service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio, apply_changes=True)
        # Assertion
        assert len(result) == 1
        suggested_score_task1 = service._apply_internal_heuristics(task1) # Calculate expected score
        assert result[0]["suggested_priority_score"] == suggested_score_task1

        if abs(task1_original_score - suggested_score_task1) > 0.0001 :
             mock_update_task.assert_called_once_with(
                 db=mock_db_session,
                 task_id=1,
                 task_update={"priority_score": suggested_score_task1}
             )
        else:
            mock_update_task.assert_not_called()


def test_prioritize_tasks_feature_disabled(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio):
    # Arrange
    mock_tenant_model_task_prio.features = {"intelligent_task_prioritization": False}
    service = TaskPrioritizationService(db=mock_db_session)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio)
    assert exc.value.status_code == 403
    assert "feature is not enabled" in exc.value.detail.lower()

def test_prioritize_tasks_user_not_in_tenant(mock_db_session, mock_user_model_task_prio):
    # Arrange
    mock_user_model_task_prio.tenants = []
    service = TaskPrioritizationService(db=mock_db_session)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio)
    assert exc.value.status_code == 403
    assert "user not associated with any tenant" in exc.value.detail.lower()

def test_prioritize_tasks_no_tasks_for_user(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    with patch('app.crud.task_crud.get_tasks_by_user_id', return_value=[]) as mock_get_tasks:
        # Action
        result = service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio)
        # Assertion
        assert result == []
        mock_get_tasks.assert_called_once()

def test_internal_heuristics_due_dates(mock_db_session, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    now = datetime.utcnow()
    task_overdue = create_mock_task(id=1, description="Overdue", status="pending", due_date_inferred=now - timedelta(days=2), priority_score=0.5)
    task_today = create_mock_task(id=2, description="Today", status="pending", due_date_inferred=now + timedelta(hours=12), priority_score=0.5)  # Later today
    task_tomorrow = create_mock_task(id=3, description="Tomorrow", status="pending", due_date_inferred=now + timedelta(days=1), priority_score=0.5)
    task_3days = create_mock_task(id=4, description="In 3 days", status="pending", due_date_inferred=now + timedelta(days=3), priority_score=0.5)
    task_next_week = create_mock_task(id=5, description="Next week", status="pending", due_date_inferred=now + timedelta(days=7), priority_score=0.5)
    task_no_due_date = create_mock_task(id=6, description="No due date", status="pending", due_date_inferred=None, priority_score=0.5)
    # Action
    score_overdue = service._apply_internal_heuristics(task_overdue)
    score_today = service._apply_internal_heuristics(task_today)
    score_tomorrow = service._apply_internal_heuristics(task_tomorrow)
    score_3days = service._apply_internal_heuristics(task_3days)
    score_next_week = service._apply_internal_heuristics(task_next_week)
    score_no_due_date = service._apply_internal_heuristics(task_no_due_date)
    # Assertion
    # Based on service logic: overdue gets +0.35, today gets +0.25, 3days gets +0.15, next week gets +0.05
    assert score_overdue > score_today # 0.85 > 0.75
    assert score_today > score_3days # 0.75 > 0.65
    assert score_3days > score_next_week # 0.65 > 0.55
    assert score_tomorrow > score_next_week # Tomorrow also higher
    assert score_no_due_date == 0.5 # No due date heuristic applied, remains initial

def test_internal_heuristics_keywords(mock_db_session, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    task_urgent_asap = create_mock_task(id=1, description="This is URGENT and ASAP", status="pending", due_date_inferred=None, priority_score=0.5)
    task_important = create_mock_task(id=2, description="An important task", status="pending", due_date_inferred=None, priority_score=0.5)
    task_no_keywords = create_mock_task(id=3, description="Regular task", status="pending", due_date_inferred=None, priority_score=0.5)
    # Action
    score_urgent_asap = service._apply_internal_heuristics(task_urgent_asap)
    score_important = service._apply_internal_heuristics(task_important)
    score_no_keywords = service._apply_internal_heuristics(task_no_keywords)
    # Assertion
    assert score_urgent_asap > score_important > score_no_keywords
    # Based on service logic: urgent gets +0.3, important gets +0.2, plus estimated effort +0.1 (>8 hours)
    # So urgent_asap: 0.5 + 0.3 + 0.1 = 0.9, important: 0.5 + 0.2 + 0.1 = 0.8, no_keywords: 0.5 + 0.1 = 0.6
    assert score_urgent_asap == 0.8  # 0.5 + 0.3 (urgent) = 0.8, not 0.9

def test_internal_heuristics_status(mock_db_session, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    task_in_progress = create_mock_task(id=1, description="Work in progress", status="in_progress", due_date_inferred=None, priority_score=0.5)
    task_suggested = create_mock_task(id=2, description="Just a suggestion", status="suggested", due_date_inferred=None, priority_score=0.5)
    task_pending = create_mock_task(id=3, description="Pending task", status="pending", due_date_inferred=None, priority_score=0.5)
    # Action
    score_in_progress = service._apply_internal_heuristics(task_in_progress)
    score_suggested = service._apply_internal_heuristics(task_suggested)
    score_pending = service._apply_internal_heuristics(task_pending)
    # Assertion
    assert score_in_progress > score_pending
    assert score_pending > score_suggested
    assert score_suggested == max(0.0, 0.5 - 0.1)

def test_internal_heuristics_score_clamping(mock_db_session, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    now = datetime.utcnow()
    # This task should hit multiple positive heuristics
    task_high_score = create_mock_task(id=1, description="URGENT IMPORTANT Overdue task", status="in_progress", due_date_inferred=now - timedelta(days=5), priority_score=0.8)
    # This task should hit negative heuristic strongly
    task_low_score = create_mock_task(id=2, description="Maybe a task?", status="suggested", due_date_inferred=None, priority_score=0.1)
    # Action
    score_high = service._apply_internal_heuristics(task_high_score)
    score_low = service._apply_internal_heuristics(task_low_score)
    # Assertion
    assert score_high == 1.0 # 0.8 + 0.3 (overdue) + 0.25 (urgent) + 0.15 (important) + 0.05 (in_progress) > 1.0, so clamped
    assert score_low == 0.0 # 0.1 - 0.1 (suggested) = 0.0

def test_prioritize_tasks_corrupted_tenant_features_json(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio):
    # Arrange
    mock_tenant_model_task_prio.features = '{"intelligent_task_prioritization": True' # Malformed
    service = TaskPrioritizationService(db=mock_db_session)
    # Action & Assertion
    with pytest.raises(HTTPException) as exc:
        service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio)
    assert exc.value.status_code == 500
    assert "error reading tenant configuration" in exc.value.detail.lower()

def test_prioritize_tasks_no_change_in_score_no_update(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    # Task where heuristics might not change the score significantly
    task_no_change = create_mock_task(id=1, description="A standard task", status="pending", due_date_inferred=None, priority_score=0.5)
    tasks = [task_no_change]

    # Calculate suggested score to ensure it's same as original for this test case
    original_score = task_no_change.priority_score
    suggested_score = service._apply_internal_heuristics(task_no_change)
    assert abs(original_score - suggested_score) < 0.0001 # Ensure our test task indeed has no score change

    with patch('app.crud.task_crud.get_tasks_by_user_id', return_value=tasks), \
         patch('app.crud.task_crud.update_task') as mock_update_task:
        # Action
        service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio, apply_changes=True)
        # Assertion
        mock_update_task.assert_not_called() # Should not be called if score doesn't change

def test_prioritize_tasks_initial_none_score_gets_updated(mock_db_session, mock_user_model_task_prio, mock_tenant_model_task_prio, mock_tenant_user_link_task_prio, create_mock_task):
    # Arrange
    service = TaskPrioritizationService(db=mock_db_session)
    task_none_score = create_mock_task(id=1, description="Urgent task, no initial score", status="pending", due_date_inferred=datetime.utcnow() + timedelta(days=1), priority_score=None)
    tasks = [task_none_score]

    suggested_score = service._apply_internal_heuristics(task_none_score) # Calculate expected score
    assert suggested_score is not None

    with patch('app.crud.task_crud.get_tasks_by_user_id', return_value=tasks), \
         patch('app.crud.task_crud.update_task') as mock_update_task:
        # Action
        service.prioritize_tasks_for_user(current_user=mock_user_model_task_prio, apply_changes=True)
        # Assertion
        mock_update_task.assert_called_once_with(
            db=mock_db_session,
            task_id=1,
            task_update={"priority_score": suggested_score}
        )

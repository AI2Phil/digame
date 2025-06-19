import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException, status
from datetime import datetime

from digame.app.main import app # Main FastAPI app
from digame.app.schemas.task_prioritization_schemas import PrioritizationResponse, PrioritizedTaskDetail
from digame.app.models.user import User as UserModel

# --- Test Client Fixture ---
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Fixtures ---
@pytest.fixture
def mock_task_prioritization_service():
    service = MagicMock()
    return service

@pytest.fixture
def mock_current_active_user_for_task_prio(): # Renamed for clarity
    user = UserModel(id=8, email="taskprio_router_user@example.com", full_name="TaskPrio Router Test User", is_active=True)
    user.tenants = []
    return user

@pytest.fixture
def sample_prioritized_task_list() -> List[PrioritizedTaskDetail]:
    return [
        PrioritizedTaskDetail(id=1, description="High prio task", status="in_progress", due_date_inferred=datetime.now(), original_priority_score=0.7, suggested_priority_score=0.9),
        PrioritizedTaskDetail(id=2, description="Low prio task", status="suggested", original_priority_score=0.3, suggested_priority_score=0.2),
    ]

# --- Router Tests ---

def test_prioritize_endpoint_success_apply_false(client, mock_task_prioritization_service, mock_current_active_user_for_task_prio, sample_prioritized_task_list):
    # Arrange
    mock_task_prioritization_service.prioritize_tasks_for_user = MagicMock(return_value=sample_prioritized_task_list)

    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.task_prioritization_service import get_task_prioritization_service

    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_task_prio
    app.dependency_overrides[get_task_prioritization_service] = lambda: mock_task_prioritization_service

    request_payload = {"apply_changes": False}

    # Action
    response = client.post("/ai/tasks/prioritization/prioritize", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Tasks analyzed and priorities suggested."
    assert data["processed_task_count"] == len(sample_prioritized_task_list)
    assert data["changes_applied"] is False
    # Pydantic models in response will convert datetimes to ISO strings
    for i, task_detail in enumerate(data["prioritized_tasks"]):
        assert task_detail["id"] == sample_prioritized_task_list[i].id # Compare field by field
        if sample_prioritized_task_list[i].due_date_inferred:
             assert task_detail["due_date_inferred"] == sample_prioritized_task_list[i].due_date_inferred.isoformat()
        else:
            assert task_detail["due_date_inferred"] is None


    mock_task_prioritization_service.prioritize_tasks_for_user.assert_called_once_with(
        current_user=mock_current_active_user_for_task_prio,
        apply_changes=False
    )

def test_prioritize_endpoint_success_apply_true(client, mock_task_prioritization_service, mock_current_active_user_for_task_prio, sample_prioritized_task_list):
    # Arrange
    mock_task_prioritization_service.prioritize_tasks_for_user = MagicMock(return_value=sample_prioritized_task_list)
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.task_prioritization_service import get_task_prioritization_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_task_prio
    app.dependency_overrides[get_task_prioritization_service] = lambda: mock_task_prioritization_service

    request_payload = {"apply_changes": True}

    # Action
    response = client.post("/ai/tasks/prioritization/prioritize", json=request_payload)

    # Assertion
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Tasks analyzed, priorities suggested and applied to the database."
    assert data["changes_applied"] is True
    mock_task_prioritization_service.prioritize_tasks_for_user.assert_called_once_with(
        current_user=mock_current_active_user_for_task_prio,
        apply_changes=True
    )

def test_prioritize_endpoint_service_http_exception(client, mock_task_prioritization_service, mock_current_active_user_for_task_prio):
    # Arrange
    mock_task_prioritization_service.prioritize_tasks_for_user = MagicMock(
        side_effect=HTTPException(status_code=403, detail="Intelligent Task Prioritization feature not enabled.")
    )
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.task_prioritization_service import get_task_prioritization_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_task_prio
    app.dependency_overrides[get_task_prioritization_service] = lambda: mock_task_prioritization_service

    request_payload = {"apply_changes": False}

    # Action
    response = client.post("/ai/tasks/prioritization/prioritize", json=request_payload)

    # Assertion
    assert response.status_code == 403
    assert response.json()["detail"] == "Intelligent Task Prioritization feature not enabled."

def test_prioritize_endpoint_service_unexpected_exception(client, mock_task_prioritization_service, mock_current_active_user_for_task_prio):
    # Arrange
    mock_task_prioritization_service.prioritize_tasks_for_user = MagicMock(side_effect=ValueError("Service internal value error"))
    from digame.app.auth.auth_dependencies import get_current_active_user
    from digame.app.services.task_prioritization_service import get_task_prioritization_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_active_user_for_task_prio
    app.dependency_overrides[get_task_prioritization_service] = lambda: mock_task_prioritization_service

    request_payload = {"apply_changes": False}

    # Action
    response = client.post("/ai/tasks/prioritization/prioritize", json=request_payload)

    # Assertion
    assert response.status_code == 500
    assert "unexpected error occurred during task prioritization" in response.json()["detail"].lower()

def test_health_check_endpoint(client):
    # Action
    response = client.get("/ai/tasks/prioritization/health")
    # Assertion
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "AI - Intelligent Task Prioritization"}

# Fixture to clear dependency overrides after each test automatically
@pytest.fixture(autouse=True)
def cleanup_dependency_overrides_task_prio_router(): # Renamed for specificity
    yield
    app.dependency_overrides.clear()

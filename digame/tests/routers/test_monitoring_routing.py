import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session # Not used in these specific tests but good for consistency
from digame.app.main import app # Assuming your FastAPI app instance is here
from digame.app.auth.auth_dependencies import get_current_active_user # For overriding
from fastapi import status # For HTTP status codes

# Fixtures for admin and non-admin users should be available from conftest.py
# (test_admin_user, test_non_admin_user)
# These fixtures need to return SQLAlchemyUser compatible objects.

client = TestClient(app)

def test_log_monitoring_unauthorized(test_non_admin_user):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    # Payload matches LogEntry schema from monitoring.py
    response = client.post("/monitoring/log", json={"timestamp": "2024-01-01T00:00:00Z", "activity": "test activity", "details": {"info": "test"}})
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()

def test_log_monitoring_authorized(test_admin_user):
    # Assuming admin user has 'log_own_digital_activity' from conftest.py setup
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    response = client.post("/monitoring/log", json={"timestamp": "2024-01-01T00:00:00Z", "activity": "test activity", "details": {"info": "test"}})
    # Endpoint returns 201 if successful (and not 403)
    # Placeholder endpoint in monitoring.py returns 201
    assert response.status_code == status.HTTP_201_CREATED 
    data = response.json()
    assert "id" in data
    assert data["entry"]["activity"] == "test activity"
    app.dependency_overrides.clear()

def test_get_logs_unauthorized(test_non_admin_user):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    response = client.get("/monitoring/logs")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()

def test_get_logs_authorized(test_admin_user):
    # Assuming admin user has 'view_own_activity_logs' from conftest.py setup
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    response = client.get("/monitoring/logs")
    # Endpoint returns 200 if successful
    # Placeholder endpoint in monitoring.py returns 200
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    app.dependency_overrides.clear()

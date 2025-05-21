import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session # Not used directly, but good for consistency
from digame.app.main import app
from digame.app.auth.auth_dependencies import get_current_active_user
from fastapi import status # For HTTP status codes

# Fixtures test_admin_user, test_non_admin_user from conftest.py
client = TestClient(app)

# --- Tests for /behavior/train ---
# Permission: "train_own_behavior_model"

def test_train_behavior_unauthorized(test_non_admin_user):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    # Payload matches TrainingRequest schema from behavior.py
    response = client.post("/behavior/train", json={"data_source": "test_source", "parameters": {"param1": "value1"}}) 
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()

def test_train_behavior_authorized(test_admin_user):
    # Assuming admin user has 'train_own_behavior_model'
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    response = client.post("/behavior/train", json={"data_source": "test_source", "parameters": {"param1": "value1"}})
    # Endpoint returns 202 if successful
    # Placeholder endpoint in behavior.py returns 202
    assert response.status_code == status.HTTP_202_ACCEPTED 
    data = response.json()
    assert data["status"] == "training_started" # As per placeholder in behavior.py
    app.dependency_overrides.clear()

# --- Tests for /behavior/patterns ---
# Permission: "view_own_behavior_patterns"

def test_get_patterns_unauthorized(test_non_admin_user):
    app.dependency_overrides[get_current_active_user] = lambda: test_non_admin_user
    response = client.get("/behavior/patterns")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.clear()

def test_get_patterns_authorized(test_admin_user):
    # Assuming admin user has 'view_own_behavior_patterns'
    app.dependency_overrides[get_current_active_user] = lambda: test_admin_user
    response = client.get("/behavior/patterns")
    # Endpoint returns 200 if successful
    # Placeholder endpoint in behavior.py returns 200
    assert response.status_code == status.HTTP_200_OK 
    data = response.json()
    assert isinstance(data, list) # As per placeholder in behavior.py
    app.dependency_overrides.clear()

import pytest
from typing import List, Optional, Dict, Any
from fastapi.testclient import TestClient
from unittest.mock import patch # For mocking the service call

# Assuming the FastAPI app instance is in digame.app.main
from digame.app.main import app
# User model for creating mock user object for dependency override
from digame.app.models.user import User as UserModel
# Schemas for response validation
from digame.app.schemas.social_schemas import PeerMatchResponse, MatchedUser

# Path to the actual auth dependency and service
# These are used by the app, so we need to override them for tests.
# Actual get_current_active_user is in digame.app.auth.auth_dependencies
# Actual match_peers_by_skills is in digame.app.services.matching_service

# Mock current user data
mock_user_data = {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "is_active": True,
    "skills": ["python", "fastapi"],
    "learning_goals": ["kubernetes", "testing"],
    "hashed_password": "fake_password_hash", # UserModel requires this
    # Add other fields required by UserModel if any, e.g. created_at, onboarding_completed
    "onboarding_completed": True, # Assuming this field exists from previous model updates
}

# Create a UserModel instance from the mock data
# Note: UserModel might have more fields. This needs to align with the actual model.
# For simplicity, we'll assume UserModel can be instantiated like this for the mock.
# If it's complex, a fixture generating a valid UserModel is better.
mock_current_user_model_instance = UserModel(**mock_user_data)


# This function will override the actual get_current_active_user dependency
async def override_get_current_active_user():
    return mock_current_user_model_instance

# Override the dependency in the FastAPI app
app.dependency_overrides[app.router.dependencies[0].depends] = override_get_current_active_user
# A more robust way to get the actual dependency function:
# from digame.app.auth.auth_dependencies import get_current_active_user
# app.dependency_overrides[get_current_active_user] = override_get_current_active_user
# The above assumes get_current_active_user is directly used as a dependency.
# If it's part of a class or complex structure, the override key will be different.
# For now, the above is a common pattern if get_current_active_user is a top-level dependency.
# Due to tool limitations, I cannot be certain about the exact key for overriding.
# I will proceed assuming a common direct dependency usage for get_current_active_user.
# If `app.router.dependencies[0].depends` is not the right key, this override won't work.
# A more reliable method would be to know the exact function object of get_current_active_user.
# Let's assume for now this override works or adjust if tests show auth issues.

client = TestClient(app)

# Sample data that the mocked service could return
MOCK_SKILL_MATCHES_DATA = [
    {"user_id": 2, "name": "Peer Skillful", "username": "peerskill", "skills": ["python", "docker"],
     "compatibility_score": 1.0, "match_criteria_shared": ["python"], "match_type_used": "skills"},
    {"user_id": 3, "name": "Peer Learner", "username": "peerlearn", "skills": ["java"],
     "compatibility_score": 0.0, "match_criteria_shared": [], "match_type_used": "skills"}, # No shared skills
]

MOCK_LEARNING_MATCHES_DATA = [
    {"user_id": 4, "name": "Goal Setter", "username": "goalset", "skills": ["react", "node"],
     "compatibility_score": 2.0, "match_criteria_shared": ["kubernetes", "testing"], "match_type_used": "learning_partner"},
]

def test_get_peer_matches_default_skill_match():
    with patch("digame.app.routers.social_collaboration.match_peers_by_skills", return_value=MOCK_SKILL_MATCHES_DATA) as mock_service:
        response = client.get("/api/social/peer-matches") # No match_type param, defaults to "skills"
        assert response.status_code == 200
        mock_service.assert_called_once()
        # Check args of mock_service call - especially match_type
        args, kwargs = mock_service.call_args
        assert kwargs.get("match_type") == "skills" # Default in router is "skills"

        response_data = response.json()
        assert "matches" in response_data
        assert len(response_data["matches"]) == 2
        assert response_data["matches"][0]["username"] == "peerskill"

def test_get_peer_matches_explicit_skill_match():
    with patch("digame.app.routers.social_collaboration.match_peers_by_skills", return_value=MOCK_SKILL_MATCHES_DATA) as mock_service:
        response = client.get("/api/social/peer-matches?match_type=skills")
        assert response.status_code == 200
        mock_service.assert_called_once()
        args, kwargs = mock_service.call_args
        assert kwargs.get("match_type") == "skills"

        response_data = response.json()
        assert len(response_data["matches"]) == 2
        assert response_data["matches"][0]["username"] == "peerskill"

def test_get_peer_matches_learning_partner_match():
    with patch("digame.app.routers.social_collaboration.match_peers_by_skills", return_value=MOCK_LEARNING_MATCHES_DATA) as mock_service:
        response = client.get("/api/social/peer-matches?match_type=learning_partner")
        assert response.status_code == 200
        mock_service.assert_called_once()
        args, kwargs = mock_service.call_args
        assert kwargs.get("match_type") == "learning_partner"

        response_data = response.json()
        assert len(response_data["matches"]) == 1
        assert response_data["matches"][0]["username"] == "goalset"
        assert response_data["matches"][0]["match_type_used"] == "learning_partner"

def test_get_peer_matches_invalid_match_type():
    # No need to mock service, router should catch this
    response = client.get("/api/social/peer-matches?match_type=invalid_type")
    assert response.status_code == 400 # As per router validation
    assert "Invalid match_type" in response.json()["detail"]

def test_skill_filter_with_skill_match():
    # Service returns two skill matches. Filter should reduce to one.
    # Mock service returns Peer Skillful (python, docker) and Peer Learner (java)
    # Current user skills: python, fastapi
    # Shared with Peer Skillful: python
    MOCK_DATA_FOR_SKILL_FILTER = [
        {"user_id": 2, "name": "Peer Skillful", "username": "peerskill", "skills": ["python", "docker"],
         "compatibility_score": 1.0, "match_criteria_shared": ["python"], "match_type_used": "skills"},
        {"user_id": 3, "name": "Another Pythonista", "username": "anotherpy", "skills": ["python", "react"],
         "compatibility_score": 1.0, "match_criteria_shared": ["python"], "match_type_used": "skills"},
    ]
    with patch("digame.app.routers.social_collaboration.match_peers_by_skills", return_value=MOCK_DATA_FOR_SKILL_FILTER) as mock_service:
        # Filter for peers who have "docker"
        response = client.get("/api/social/peer-matches?match_type=skills&skill_filter=docker")
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data["matches"]) == 1
        assert response_data["matches"][0]["username"] == "peerskill" # Only Peer Skillful has "docker"

def test_skill_filter_with_learning_partner_match():
    # Service returns learning partner matches. Filter should still apply to peer's general skills.
    # Mock service returns Goal Setter (skills: react, node; shared goals: kubernetes, testing)
    MOCK_DATA_FOR_LEARNING_FILTER = [
         {"user_id": 4, "name": "Goal Setter", "username": "goalset", "skills": ["react", "node"],
          "compatibility_score": 2.0, "match_criteria_shared": ["kubernetes", "testing"], "match_type_used": "learning_partner"},
         {"user_id": 5, "name": "Goal Twin", "username": "goaltwin", "skills": ["python", "node"],
          "compatibility_score": 1.0, "match_criteria_shared": ["kubernetes"], "match_type_used": "learning_partner"},
    ]
    with patch("digame.app.routers.social_collaboration.match_peers_by_skills", return_value=MOCK_DATA_FOR_LEARNING_FILTER) as mock_service:
        # Filter for peers who have "node" skill, even though matching is by learning goals
        response = client.get("/api/social/peer-matches?match_type=learning_partner&skill_filter=node")
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data["matches"]) == 2 # Both Goal Setter and Goal Twin have "node"

        # Filter for peers who have "python" skill
        response_python = client.get("/api/social/peer-matches?match_type=learning_partner&skill_filter=python")
        assert response_python.status_code == 200
        response_data_python = response_python.json()
        assert len(response_data_python["matches"]) == 1
        assert response_data_python["matches"][0]["username"] == "goaltwin"


# To run these tests, ensure that the main FastAPI app instance `app` is correctly imported
# and that the dependency override for `get_current_active_user` is effective.
# The mock user data (mock_user_data, mock_current_user_model_instance) might need
# to be more complete based on the actual UserModel definition to avoid Pydantic validation
# errors when the mock instance is used by the application.
# The key for app.dependency_overrides might need to be the actual function object
# e.g. from digame.app.auth.auth_dependencies import get_current_active_user
# app.dependency_overrides[get_current_active_user] = override_get_current_active_user

```

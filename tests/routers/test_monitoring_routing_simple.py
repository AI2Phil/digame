import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock
from app.main import app
from app.auth.auth_service import get_current_user, security

client = TestClient(app)

def test_monitoring_router_exists():
    """Test that monitoring router endpoints exist and are accessible"""
    
    # Create a simple mock user
    mock_user = Mock()
    mock_user.id = 1
    mock_user.username = "testuser"
    mock_user.email = "test@example.com"
    
    # Override the dependency
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    try:
        # Test log endpoint
        response = client.post("/api/monitoring/log", json={
            "timestamp": "2024-01-01T00:00:00Z", 
            "activity": "test activity", 
            "details": {"info": "test"}
        })
        # Should not be 404 (endpoint exists)
        assert response.status_code != 404, "Log endpoint should exist"
        
        # Test get logs endpoint  
        response = client.get("/api/monitoring/logs")
        # Should not be 404 (endpoint exists)
        assert response.status_code != 404, "Get logs endpoint should exist"
        
    finally:
        # Clean up
        app.dependency_overrides.clear()

def test_monitoring_router_log_endpoint():
    """Test monitoring log endpoint functionality"""
    
    # Create a simple mock user
    mock_user = Mock()
    mock_user.id = 1
    mock_user.username = "testuser"
    mock_user.email = "test@example.com"
    
    # Override both security and get_current_user dependencies
    app.dependency_overrides[security] = lambda: Mock(credentials="fake-token")
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    try:
        # Test log endpoint
        response = client.post("/api/monitoring/log",
            json={
                "timestamp": "2024-01-01T00:00:00Z",
                "activity": "test activity",
                "details": {"info": "test"}
            }
        )
        
        # Should return 201 for successful creation
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "user_id" in data
        assert "log_id" in data
        assert data["user_id"] == mock_user.id
        
    finally:
        # Clean up
        app.dependency_overrides.clear()

def test_monitoring_router_get_logs_endpoint():
    """Test monitoring get logs endpoint functionality"""
    
    # Create a simple mock user
    mock_user = Mock()
    mock_user.id = 1
    mock_user.username = "testuser"
    mock_user.email = "test@example.com"
    
    # Override both security and get_current_user dependencies
    app.dependency_overrides[security] = lambda: Mock(credentials="fake-token")
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    try:
        # Test get logs endpoint
        response = client.get("/api/monitoring/logs")
        
        # Should return 200 for successful retrieval
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "logs" in data
        assert "total" in data
        assert "limit" in data
        assert "offset" in data
        assert isinstance(data["logs"], list)
        
    finally:
        # Clean up
        app.dependency_overrides.clear()

def test_monitoring_router_endpoints_without_auth():
    """Test monitoring endpoints without authentication"""
    
    # Test without auth override - should still work but might have different behavior
    response = client.post("/api/monitoring/log", json={
        "timestamp": "2024-01-01T00:00:00Z", 
        "activity": "test activity", 
        "details": {"info": "test"}
    })
    
    # Should not be 404 (endpoint exists), might be 401/403 for auth
    assert response.status_code != 404, "Log endpoint should exist even without auth"
    
    response = client.get("/api/monitoring/logs")
    # Should not be 404 (endpoint exists), might be 401/403 for auth  
    assert response.status_code != 404, "Get logs endpoint should exist even without auth"
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import uuid

from app.main import app # Assuming 'app' is the FastAPI instance
from app.routers import dashboard_router # To override its dependencies
from app.models.dashboard_models import DashboardLayout, WidgetConfig # For request bodies

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def mock_dashboard_router_dependencies():
    mock_user = dashboard_router.MockUser(id="testuser1", tenant_id=1)
    app.dependency_overrides[dashboard_router.get_current_user] = lambda: mock_user

    # If DashboardService was complex or had external deps, we'd mock it too.
    # But since it's using an in-memory dict for mocks, we can test its logic.
    # For true isolation, you could mock get_dashboard_service as well.
    # For now, we'll use the actual service with its in-memory store.
    # dashboard_router.get_dashboard_service()._custom_dashboards = {} # Reset for each test if needed

    yield
    app.dependency_overrides = {}


# --- Test Standard Dashboard Endpoints ---
def test_read_productivity_chart(client):
    response = client.get("/api/v1/dashboard/productivity-chart")
    assert response.status_code == 200
    json_response = response.json()
    assert "title" in json_response
    assert "data" in json_response
    assert isinstance(json_response["data"], dict)
    assert "labels" in json_response["data"]
    assert "datasets" in json_response["data"]

# --- Test Advanced Analytics Data Endpoints ---
def test_read_multi_dim_performance(client):
    response = client.get("/api/v1/dashboard/advanced/multi-dim-performance?metric_ids=1&metric_ids=2&time_period=7d")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    if json_response:
        assert "metric_name" in json_response[0]
        assert "data_points" in json_response[0]

def test_read_performance_forecast(client):
    response = client.get("/api/v1/dashboard/advanced/performance-forecast?model_id=1")
    assert response.status_code == 200
    json_response = response.json()
    assert "title" in json_response
    assert "series" in json_response

def test_read_benchmark_comparison(client):
    response = client.get("/api/v1/dashboard/advanced/benchmark-comparison?entity_id=101&metric_name=Efficiency")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    if json_response:
        assert "metric_name" in json_response[0]
        assert "entity_value" in json_response[0]

def test_read_roi_overview(client):
    response = client.get("/api/v1/dashboard/advanced/roi-overview?project_ids=1&project_ids=2")
    assert response.status_code == 200
    json_response = response.json()
    assert "title" in json_response
    assert "total_roi_percentage" in json_response

# --- Test Custom Dashboard Management Endpoints ---
def test_create_custom_dashboard_endpoint(client):
    dashboard_name = "My API Test Dashboard"
    response = client.post(f"/api/v1/dashboard/custom?name={dashboard_name}&description=API Test")
    assert response.status_code == 201
    json_response = response.json()
    assert json_response["name"] == dashboard_name
    assert json_response["user_id"] == "testuser1" # From mock
    assert json_response["tenant_id"] == 1 # From mock
    assert "id" in json_response
    return json_response["id"] # Return ID for use in other tests

def test_get_custom_dashboard_endpoint(client):
    dashboard_id = test_create_custom_dashboard_endpoint(client) # Create one first

    response = client.get(f"/api/v1/dashboard/custom/{dashboard_id}")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["id"] == dashboard_id
    assert json_response["name"] == "My API Test Dashboard"

    # Test not found
    non_existent_id = str(uuid.uuid4())
    response_not_found = client.get(f"/api/v1/dashboard/custom/{non_existent_id}")
    assert response_not_found.status_code == 404

def test_list_user_custom_dashboards_endpoint(client):
    # Clear existing dashboards for this user from the mock service for a clean test
    # This depends on how dashboard_service is instantiated/mocked.
    # If it's a singleton or shared state, this is important.
    # For this test, we'll assume `test_create_custom_dashboard_endpoint` adds to the same mock instance.
    dashboard_router.get_dashboard_service()._custom_dashboards = {} # Reset for this specific test path

    test_create_custom_dashboard_endpoint(client) # Add one
    test_create_custom_dashboard_endpoint(client) # Add another

    response = client.get("/api/v1/dashboard/custom")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    # Depending on how many were created by other tests if state isn't reset, adjust this
    assert len(json_response) >= 2 # Should be at least 2 from this test function


def test_update_dashboard_layout_endpoint(client):
    dashboard_id = test_create_custom_dashboard_endpoint(client)
    widget_data = {
        "id": str(uuid.uuid4()),
        "widget_type": "sample_widget",
        "title": "Sample Widget",
        "size": "1x1",
        "position": {"x": 0, "y": 0},
        "settings": {}
    }
    layout_data = {
        "columns": 8,
        "widgets": [widget_data]
    }
    response = client.put(f"/api/v1/dashboard/custom/{dashboard_id}/layout", json=layout_data)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["layout"]["columns"] == 8
    assert len(json_response["layout"]["widgets"]) == 1
    assert json_response["layout"]["widgets"][0]["title"] == "Sample Widget"

def test_add_widget_to_dashboard_endpoint(client):
    dashboard_id = test_create_custom_dashboard_endpoint(client)
    widget_data = {
        # "id": str(uuid.uuid4()), # ID can be omitted, service should generate
        "widget_type": "new_widget_type",
        "title": "Newly Added Widget",
        "size": "medium",
        "position": {"x": 1, "y": 1},
        "settings": {"data_source": "live"}
    }
    response = client.post(f"/api/v1/dashboard/custom/{dashboard_id}/widgets", json=widget_data)
    assert response.status_code == 200
    json_response = response.json()
    assert len(json_response["layout"]["widgets"]) > 0 # Should have at least one
    assert json_response["layout"]["widgets"][-1]["title"] == "Newly Added Widget"
    added_widget_id = json_response["layout"]["widgets"][-1]["id"]
    return dashboard_id, added_widget_id # For removal test

def test_remove_widget_from_dashboard_endpoint(client):
    dashboard_id, widget_id_to_remove = test_add_widget_to_dashboard_endpoint(client)

    # Verify widget exists first
    response_get = client.get(f"/api/v1/dashboard/custom/{dashboard_id}")
    initial_widget_count = len(response_get.json()["layout"]["widgets"])
    assert initial_widget_count > 0

    response = client.delete(f"/api/v1/dashboard/custom/{dashboard_id}/widgets/{widget_id_to_remove}")
    assert response.status_code == 200
    json_response = response.json()
    assert len(json_response["layout"]["widgets"]) == initial_widget_count - 1

    # Test removing non-existent widget
    non_existent_widget_id = str(uuid.uuid4())
    response_not_found = client.delete(f"/api/v1/dashboard/custom/{dashboard_id}/widgets/{non_existent_widget_id}")
    # Depending on service logic, this might be 200 with no change, or 404.
    # The mock service will return the dashboard, so length check is key.
    assert response_not_found.status_code == 200 # Mock service returns dashboard even if widget not found
    assert len(response_not_found.json()["layout"]["widgets"]) == initial_widget_count - 1


if __name__ == "__main__":
     pytest.main()

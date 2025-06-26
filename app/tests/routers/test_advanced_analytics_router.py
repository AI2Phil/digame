import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

# Assuming main.app is your FastAPI application instance
from app.main import app
from app.schemas import analytics_schemas as schemas
from app.services.analytics_service import AnalyticsService
from app.services.dashboard_service_custom import CustomDashboardService
from app.models.user import User
from app.models.analytics import PerformanceMetric
from app.models.dashboard_custom import AnalyticsDashboard, DashboardWidget

# Test client
client = TestClient(app)

# Mocks for dependencies
@pytest.fixture
def mock_db():
    return MagicMock(spec=Session)

@pytest.fixture
def mock_analytics_service():
    return MagicMock(spec=AnalyticsService)

@pytest.fixture
def mock_custom_dashboard_service():
    return MagicMock(spec=CustomDashboardService)

@pytest.fixture
def mock_current_user():
    # This user should have a tenant_id for the tests to pass
    return User(id=1, email="test@example.com", tenant_id=1, is_active=True)

# Override dependencies for testing
# This needs to be adjusted based on how get_current_active_user is actually structured
# For now, we'll patch the direct dependencies of the endpoint functions.

def override_get_db():
    return MagicMock(spec=Session) # Or use the mock_db fixture

def override_get_analytics_service():
    return MagicMock(spec=AnalyticsService)

def override_get_custom_dashboard_service():
    return MagicMock(spec=CustomDashboardService)

def override_get_current_active_user():
    return User(id=1, email="test@example.com", tenant_id=1, is_active=True)


app.dependency_overrides[AnalyticsService] = override_get_analytics_service # Incorrect override, service is not directly depended on by router path op
app.dependency_overrides[CustomDashboardService] = override_get_custom_dashboard_service # Incorrect
# The correct way is to override the 'get_service' functions if those are the Depends used in router

# Corrected way: override the dependency functions used in router
from app.database import get_db
from app.services.analytics_service import get_analytics_service
from app.services.dashboard_service_custom import get_custom_dashboard_service
from app.auth.auth_dependencies import get_current_active_user


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_analytics_service] = override_get_analytics_service
app.dependency_overrides[get_custom_dashboard_service] = override_get_custom_dashboard_service
app.dependency_overrides[get_current_active_user] = override_get_current_active_user


# --- Performance Metrics Router Tests ---
def test_record_performance_metric_router(mock_analytics_service, mock_current_user):
    # Re-override for this specific test to inject the mock service correctly
    app.dependency_overrides[get_analytics_service] = lambda: mock_analytics_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user

    metric_data_payload = {
        "metric_name": "Test Metric Router",
        "display_name": "Test Metric (Router)",
        "metric_type": "test", "category": "test_cat",
        "entity_type": "test_entity", "entity_id": 1,
        "measurement_unit": "units", "calculation_method": "sum",
        "current_value": 100.0,
        "period_start": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "period_end": datetime.utcnow().isoformat(),
        "period_type": "daily"
    }

    mock_created_metric = PerformanceMetric(id=1, tenant_id=mock_current_user.tenant_id, **metric_data_payload)
    # Adjust mock_created_metric to match PerformanceMetricInDB fields if needed (like metric_uuid)
    mock_created_metric.metric_uuid = "some-uuid" # Add if schema expects it
    mock_created_metric.created_at = datetime.utcnow()
    mock_created_metric.updated_at = datetime.utcnow()


    mock_analytics_service.record_performance_metric.return_value = mock_created_metric

    response = client.post("/advanced-analytics/performance-metrics/", json=metric_data_payload)

    assert response.status_code == 201
    response_json = response.json()
    assert response_json["metric_name"] == "Test Metric Router"
    assert response_json["current_value"] == 100.0
    mock_analytics_service.record_performance_metric.assert_called_once()


# --- Custom Dashboards Router Tests ---
def test_create_analytics_dashboard_router(mock_custom_dashboard_service, mock_current_user):
    app.dependency_overrides[get_custom_dashboard_service] = lambda: mock_custom_dashboard_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user

    dashboard_payload = {
        "name": "Router Test Dashboard",
        "layout": [{"widget_id": 1, "x":0, "y":0, "w":2,"h":2}]
    }
    mock_created_dashboard = AnalyticsDashboard(
        id=1, tenant_id=mock_current_user.tenant_id, user_id=mock_current_user.id,
        name="Router Test Dashboard", layout=[{"widget_id": 1, "x":0, "y":0, "w":2,"h":2}],
        dashboard_uuid="dash-uuid", created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_custom_dashboard_service.create_dashboard.return_value = mock_created_dashboard

    response = client.post("/advanced-analytics/dashboards/", json=dashboard_payload)
    assert response.status_code == 201
    response_json = response.json()
    assert response_json["name"] == "Router Test Dashboard"
    mock_custom_dashboard_service.create_dashboard.assert_called_once()

def test_get_analytics_dashboard_router(mock_custom_dashboard_service, mock_current_user):
    app.dependency_overrides[get_custom_dashboard_service] = lambda: mock_custom_dashboard_service
    app.dependency_overrides[get_current_active_user] = lambda: mock_current_user

    mock_dashboard = AnalyticsDashboard(
        id=1, tenant_id=mock_current_user.tenant_id, user_id=mock_current_user.id,
        name="My Dashboard", layout=[], dashboard_uuid="dash-uuid-2",
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    mock_custom_dashboard_service.get_dashboard.return_value = mock_dashboard

    response = client.get(f"/advanced-analytics/dashboards/{mock_dashboard.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "My Dashboard"
    mock_custom_dashboard_service.get_dashboard.assert_called_once_with(dashboard_id=mock_dashboard.id, tenant_id=mock_current_user.tenant_id)

# Clean up overrides after tests if they interfere with other test files
# This can be done in a fixture or a teardown function if using a test runner that supports it.
# For simplicity here, we assume these overrides are fine for this test module.
# If running multiple test files with pytest, use fixtures to manage overrides per test/module.

# Example of how to reset for other tests if needed:
# @pytest.fixture(autouse=True)
# def cleanup_overrides():
#     yield
#     app.dependency_overrides = {}

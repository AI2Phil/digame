import pytest
from fastapi.testclient import TestClient
from digame.app.main import app # Import the app instance

# Removed pytestmark = pytest.mark.asyncio

def test_read_productivity_chart_authenticated(): # Renamed, was _sync
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard/productivity-chart")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["title"] == "Weekly Productivity Score"
    assert "data" in json_response

def test_read_activity_breakdown_authenticated():
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard/activity-breakdown")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["title"] == "Activity Breakdown (Last 7 Days)"
    assert "data" in json_response

def test_read_productivity_metrics_authenticated():
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard/metrics")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["title"] == "Key Productivity Metrics"
    assert "metrics" in json_response

def test_read_recent_activities_authenticated():
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard/recent-activities")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["title"] == "Recent Activities"
    assert "activities" in json_response

# To simulate a non-authenticated scenario, we'd need to modify get_current_user_id
# or have a more sophisticated auth mock. For now, these tests assume the dummy user_id is sufficient.

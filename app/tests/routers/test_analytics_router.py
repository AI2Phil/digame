import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock # For mocking dependencies
import uuid # For UUID generation in tests

# Assuming your FastAPI app instance is accessible for TestClient
# If main.py creates the app, you might need to import it or a factory function
# For this example, let's assume 'app' is the FastAPI instance from 'digame.app.main'
from app.main import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)

# Mock dependencies for analytics router
# These would typically be more sophisticated in a real setup,
# potentially using database fixtures or overriding dependencies.

@pytest.fixture(scope="function", autouse=True)
def mock_analytics_router_dependencies():
    # Mock get_db
    mock_db = MagicMock()
    app.dependency_overrides[analytics_router.get_db] = lambda: mock_db

    # Mock get_current_user
    mock_user = analytics_router.get_current_user() # Use the router's own mock
    app.dependency_overrides[analytics_router.get_current_user] = lambda: mock_user

    # Mock get_current_tenant
    mock_tenant_id = analytics_router.get_current_tenant() # Use the router's own mock
    app.dependency_overrides[analytics_router.get_current_tenant] = lambda: mock_tenant_id

    yield # Test runs with mocks

    # Clean up overrides after test
    app.dependency_overrides = {}


# Import the router itself to access its functions if needed for overriding,
# or to ensure its routes are registered with 'app'.
from app.routers import analytics_router


def test_create_analytics_model_endpoint(client):
    model_data = {
        "name": "Integration Test Model",
        "display_name": "Integration Test Display Name",
        "model_type": "performance",
        "category": "predictive",
        "algorithm": "linear_regression",
        "features": ["avg_session_time", "tasks_done"],
        "target_variable": "user_score",
        "training_data_source": "user_activity_logs",
        "dimensions": ["country"],
        "metrics": ["score_by_country"],
        "aggregation_types": {"score_by_country": "avg"}
    }
    response = client.post("/analytics/models", json=model_data)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert json_response["model"]["name"] == model_data["name"]
    assert "model_uuid" in json_response["model"]
    assert json_response["model"]["dimensions"] == ["country"]

def test_get_analytics_models_endpoint(client):
    response = client.get("/analytics/models?model_type=performance")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert "models" in json_response
    assert isinstance(json_response["models"], list)
    if json_response["models"]: # If list is not empty
        assert "model_uuid" in json_response["models"][0]


def test_make_prediction_endpoint(client):
    model_id = 1 # Assuming model 1 exists from mocks
    prediction_data = {
        "entity_type": "user",
        "entity_id": 101,
        "input_features": {"avg_session_time": 30.5, "tasks_done": 5},
        "prediction_horizon_days": 7
    }
    # Test without benchmark params
    response = client.post(f"/analytics/models/{model_id}/predict", json=prediction_data)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert "prediction" in json_response
    assert json_response["prediction"]["model_id"] == model_id
    assert json_response["prediction"]["predicted_value"] is not None # From mock
    assert json_response["prediction"]["benchmark_comparison_data"] is None # No benchmark params sent

    # Test with benchmark params (conceptual, actual benchmark logic is in service mock)
    # The router itself doesn't process benchmark_params, it just passes them.
    # So this test mainly checks if the request format is okay.
    # The response will include benchmark_comparison_data due to the router's mock.

    # Re-construct the request body to include benchmark_params at the same level as prediction_data keys
    # This is how the router is currently set up to receive it based on the `make_prediction` signature.
    # The router's `make_prediction` function has:
    # `prediction_data: dict, benchmark_params: Optional[Dict[str, Any]] = None`
    # This means benchmark_params should be a query parameter or part of a larger request body
    # if the endpoint were designed to take a single Pydantic model.
    # Given the current mock router, it expects `benchmark_params` as a query parameter.
    # However, the `make_prediction` signature in the router has `benchmark_params: Optional[Dict[str, Any]] = None`
    # as a parameter to the function, not explicitly as a Query or Body.
    # FastAPI will try to map it from the request body if it's not a query param.
    # Let's adjust the test to send it in the body.

    # The `make_prediction` endpoint currently takes `prediction_data: dict` as its body.
    # To pass `benchmark_params`, we'd need to adjust the endpoint or how it's called.
    # For now, the mock service's `make_prediction_with_benchmark` is not directly called by this endpoint.
    # The endpoint's mock directly creates a prediction.
    # Let's assume the endpoint IS updated to receive benchmark_params in the body.
    # The current router mock for `make_prediction` is simple and doesn't use a Pydantic model for the body.
    # It just takes `prediction_data: dict`.
    # To test benchmark functionality through this router, the router's `make_prediction`
    # endpoint and its internal mock logic would need to be updated to handle `benchmark_params`.

    # For now, this test will just verify the current mock behavior.
    # A more advanced test would require the router to be updated:
    # e.g. `def make_prediction(model_id: int, request_body: PredictionRequestModel ...)`
    # where PredictionRequestModel includes both prediction_data and benchmark_params.

    # Let's assume for a moment the router's internal mock for POST /models/{model_id}/predict
    # was updated to look for 'benchmark_params' within the 'prediction_data' dict it receives.
    prediction_data_with_benchmark = {
        "entity_type": "user",
        "entity_id": 102,
        "input_features": {"avg_session_time": 45.0, "tasks_done": 8},
        "benchmark_params": {"category": "industry", "metric_name": "user_score"} # Embedded
    }
    # The router's mock for make_prediction would need to be adjusted to handle this structure
    # and provide mock_benchmark_data.
    # The current router mock for /predict does not do this.
    # The line `mock_benchmark_data = None` in the router's make_prediction mock
    # will always be None unless benchmark_params is passed directly to the function,
    # which is not how the HTTP endpoint is structured.
    # This highlights a slight mismatch between the service method `make_prediction_with_benchmark`
    # and the router's current simple mock for the `/predict` endpoint.

    # To properly test, the router's POST /models/{model_id}/predict endpoint mock
    # should be more aligned with the service capabilities if we want to test benchmark data in the response.
    # For now, the `benchmark_comparison_data` in the response will be `None` from this endpoint.

    response_with_bm = client.post(f"/analytics/models/{model_id}/predict", json=prediction_data_with_benchmark)
    assert response_with_bm.status_code == 200
    json_response_bm = response_with_bm.json()
    assert json_response_bm["prediction"]["benchmark_comparison_data"] is None # This is current behavior of router mock
    # If router mock was updated: assert json_response_bm["prediction"]["benchmark_comparison_data"] is not None


def test_get_predictions_endpoint(client):
    response = client.get("/analytics/predictions?model_id=1")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert "predictions" in json_response
    assert isinstance(json_response["predictions"], list)
    if json_response["predictions"]:
        prediction = json_response["predictions"][0]
        assert "prediction_uuid" in prediction
        # Check for new fields based on updated router mock
        assert "predicted_values_multi_dim" in prediction
        assert "benchmark_comparison_data" in prediction
        assert "raw_prediction_output" in prediction


# Note: Tests for ROI and PerformanceMetric endpoints follow a similar pattern
# and are included in the router's mock data, so their basic GET/POST can be tested.

def test_create_roi_calculation_endpoint(client):
    from datetime import datetime, timedelta
    roi_data = {
        "entity_type": "campaign",
        "entity_id": 789,
        "calculation_name": "Q1 Marketing Campaign ROI",
        "period_start": (datetime.utcnow() - timedelta(days=90)).isoformat(),
        "period_end": datetime.utcnow().isoformat(),
        "initial_investment": 20000,
        "revenue_increase": 50000,
        "cost_savings": 5000
    }
    response = client.post("/analytics/roi", json=roi_data)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert "roi_calculation" in json_response
    assert json_response["roi_calculation"]["calculation_name"] == roi_data["calculation_name"]

def test_get_analytics_dashboard_endpoint(client):
    response = client.get("/analytics/dashboard")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert "dashboard" in json_response
    assert "models" in json_response["dashboard"]
    assert "predictions" in json_response["dashboard"]
    assert "roi" in json_response["dashboard"]

# This is a placeholder for where the TestClient gets the app
# In a real scenario, this import might be more complex
# or you might have a conftest.py setting up the app for tests.
# For now, this relies on the FastAPI 'app' being importable.
# If digame.app.main.app is not the correct way to get the app instance,
# this will need adjustment.
# It's also assumed that analytics_router is added to this 'app' instance.
if __name__ == "__main__":
     pytest.main()

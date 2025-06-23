import pytest
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch, ANY
from datetime import datetime, timedelta
import pandas as pd
from decimal import Decimal

from digame.app.services.analytics_service import AnalyticsService
from digame.app.models.analytics import AnalyticsModel, AnalyticsPrediction, ROICalculation, PerformanceMetric
from digame.app.models.comparative_benchmark import ComparativeBenchmark
from digame.app.models.tenant import Tenant
from digame.app.models.user import User


@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def analytics_service(mock_db_session):
    return AnalyticsService(db=mock_db_session)

@pytest.fixture
def sample_tenant():
    return Tenant(id=1, name="Test Tenant")

@pytest.fixture
def sample_user():
    return User(id=1, email="test@example.com", tenant_id=1)

@pytest.fixture
def sample_analytics_model_data():
    return {
        "name": "Test Performance Model",
        "display_name": "Test Performance Model",
        "model_type": "performance",
        "category": "predictive",
        "algorithm": "random_forest_regressor",
        "features": ["feature1", "feature2"],
        "target_variable": "performance_score",
        "training_data_source": "test_source",
        "dimensions": ["department"],
        "metrics": ["score", "completion_rate"],
        "aggregation_types": {"score": "mean", "completion_rate": "mean"}
    }

@pytest.fixture
def sample_benchmark_data():
    return {
        "name": "Industry Avg Performance",
        "category": "industry",
        "metric_name": "performance_score",
        "benchmark_value": 75.0,
        "unit": "%",
        "source": "Global Benchmark Report 2025",
    }

def test_create_analytics_model(analytics_service, mock_db_session, sample_tenant, sample_user, sample_analytics_model_data):
    model = analytics_service.create_analytics_model(
        tenant_id=sample_tenant.id,
        model_data=sample_analytics_model_data,
        created_by_user_id=sample_user.id
    )
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(model)
    assert model.name == sample_analytics_model_data["name"]
    assert model.dimensions == ["department"]
    assert model.metrics == ["score", "completion_rate"]

def test_add_benchmark_data(analytics_service, mock_db_session, sample_benchmark_data, sample_tenant, sample_user):
    benchmark = analytics_service.add_benchmark_data(
        benchmark_data=sample_benchmark_data,
        tenant_id=sample_tenant.id,
        created_by_user_id=sample_user.id
    )
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(benchmark)
    assert benchmark.name == sample_benchmark_data["name"]
    assert benchmark.benchmark_value == 75.0

def test_get_benchmarks(analytics_service, mock_db_session):
    mock_benchmark = ComparativeBenchmark(metric_name="performance_score", benchmark_value=80.0, is_active=True)
    mock_query = MagicMock()
    mock_db_session.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.all.return_value = [mock_benchmark]

    benchmarks = analytics_service.get_benchmarks(metric_name="performance_score", tenant_id=1)

    assert len(benchmarks) == 1
    assert benchmarks[0].benchmark_value == 80.0
    mock_db_session.query.assert_called_once_with(ComparativeBenchmark)

@patch('digame.app.services.analytics_service.AnalyticsService.make_prediction')
def test_make_prediction_with_benchmark(mock_make_prediction, analytics_service, mock_db_session):
    mock_prediction_result = AnalyticsPrediction(
        id=1,
        predicted_value=80.0,
        model_id=1,
        tenant_id=1
    )
    mock_make_prediction.return_value = mock_prediction_result

    mock_model_instance = AnalyticsModel(id=1, tenant_id=1, target_variable="performance_score")
    mock_benchmark_instance = ComparativeBenchmark(name="Test Bench", benchmark_value=70.0, unit="%")

    mock_model_query = MagicMock()
    mock_benchmark_query = MagicMock()

    def query_side_effect(model_class):
        if model_class == AnalyticsModel:
            return mock_model_query
        if model_class == ComparativeBenchmark:
            return mock_benchmark_query
        return MagicMock()

    mock_db_session.query.side_effect = query_side_effect
    mock_model_query.filter.return_value.first.return_value = mock_model_instance

    mock_benchmark_query_chain = MagicMock()
    mock_benchmark_query.filter.return_value = mock_benchmark_query_chain
    mock_benchmark_query_chain.filter.return_value = mock_benchmark_query_chain # for is_active
    mock_benchmark_query_chain.filter.return_value = mock_benchmark_query_chain # for tenant_id or_
    mock_benchmark_query_chain.order_by.return_value.all.return_value = [mock_benchmark_instance]


    prediction_input = {"feature1": 10, "feature2": 20}
    benchmark_params_input = {"category": "industry"}

    result = asyncio.run(analytics_service.make_prediction_with_benchmark(
        model_id=1,
        entity_type="user",
        entity_id=1,
        input_features=prediction_input,
        benchmark_params=benchmark_params_input
    ))

    mock_make_prediction.assert_called_once_with(1, "user", 1, prediction_input, None, None)
    assert result.benchmark_comparison_data is not None
    assert result.benchmark_comparison_data["benchmark_name"] == "Test Bench"
    assert result.benchmark_comparison_data["difference"] == 10.0
    mock_db_session.commit.assert_called() # Called after updating prediction with benchmark data
    mock_db_session.refresh.assert_called_with(result)


def test_calculate_multi_dimensional_metrics(analytics_service, mock_db_session):
    mock_model = AnalyticsModel(
        id=1,
        dimensions=["country", "product"],
        metrics=["sales", "units"],
        aggregation_types={"sales": "sum", "units": "sum"}
    )
    mock_db_session.query(AnalyticsModel).get.return_value = mock_model

    data = pd.DataFrame({
        "country": ["USA", "USA", "CAN", "CAN"],
        "product": ["A", "B", "A", "B"],
        "sales": [100, 150, 80, 120],
        "units": [10, 15, 8, 12]
    })

    results = analytics_service.calculate_multi_dimensional_metrics(model_id=1, data=data)

    assert len(results) == 4 # 2 countries * 2 products

    expected_results = [
        {'dimensions': {'country': 'CAN', 'product': 'A'}, 'metrics': {'sales': 80, 'units': 8}},
        {'dimensions': {'country': 'CAN', 'product': 'B'}, 'metrics': {'sales': 120, 'units': 12}},
        {'dimensions': {'country': 'USA', 'product': 'A'}, 'metrics': {'sales': 100, 'units': 10}},
        {'dimensions': {'country': 'USA', 'product': 'B'}, 'metrics': {'sales': 150, 'units': 15}}
    ]

    # Convert list of dicts to list of tuples of items for sorting, then compare
    # This makes the comparison order-insensitive for the outer list
    results_sorted = sorted([tuple(sorted(d['dimensions'].items())) + tuple(sorted(d['metrics'].items())) for d in results])
    expected_results_sorted = sorted([tuple(sorted(d['dimensions'].items())) + tuple(sorted(d['metrics'].items())) for d in expected_results])

    assert results_sorted == expected_results_sorted

    # Test with mean aggregation
    mock_model.aggregation_types = {"sales": "mean", "units": "mean"}
    results_mean = analytics_service.calculate_multi_dimensional_metrics(model_id=1, data=data)
    # Find the result for USA, Product A to check mean (should be same as sum here since only one row per group)
    usa_a_mean = next(r for r in results_mean if r['dimensions'] == {'country': 'USA', 'product': 'A'})
    assert usa_a_mean['metrics']['sales'] == 100


def test_create_roi_calculation_refined(analytics_service, mock_db_session, sample_tenant, sample_user):
    roi_data = {
        "entity_type": "project",
        "entity_id": 1,
        "calculation_name": "Project Alpha ROI",
        "period_start": datetime(2024, 1, 1),
        "period_end": datetime(2024, 3, 31),
        "initial_investment": "10000.00",
        "revenue_increase": "15000.00",
        "cost_savings": "2000.00",
        # Assume other cost/benefit fields are 0 or not provided
    }

    # Mock for potential performance metric lookup (though not strictly implemented in service)
    # mock_db_session.query(PerformanceMetric).get.return_value = PerformanceMetric(current_value=500)

    roi_calc = analytics_service.create_roi_calculation(
        tenant_id=sample_tenant.id,
        roi_data=roi_data,
        calculated_by_user_id=sample_user.id
    )

    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(roi_calc)

    assert roi_calc.total_investment == Decimal("10000.00")
    assert roi_calc.total_benefits == Decimal("17000.00") # 15000 + 2000
    # (17000 - 10000) / 10000 * 100 = 70.0
    assert roi_calc.roi_percentage == pytest.approx(70.0)
    assert roi_calc.period_days == (datetime(2024,3,31) - datetime(2024,1,1)).days

# Example for _generate_training_data (this method is complex, so a focused test)
def test_generate_training_data_structure(analytics_service):
    model = AnalyticsModel(
        features=["f1", "f2"],
        target_variable="target",
        dimensions=["dim1"],
        metrics=["metric1"],
        model_type="custom_type" # A type not explicitly handled to test generic path
    )
    df = analytics_service._generate_training_data(model)
    assert "f1" in df.columns
    assert "f2" in df.columns
    assert "target" in df.columns
    assert "dim1" in df.columns
    assert "metric1" in df.columns
    assert len(df) == 1000 # Default n_samples

import asyncio # Required for running async functions in tests if not using pytest-asyncio

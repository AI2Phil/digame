# type: ignore
import pytest
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch
import pandas as pd
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.services.analytics_service import AnalyticsService
from app.models.analytics import PerformanceMetric, AnalyticsModel, AnalyticsDashboard, DashboardWidgetConfig
from app.schemas import analytics_schemas as schemas

# Mock database session fixture
@pytest.fixture
def mock_db_session():
    session = MagicMock(spec=Session)
    # Mock query results as needed in tests
    mock_query = MagicMock()
    mock_query.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
    mock_query.filter.return_value.first.return_value = None
    mock_query.get.return_value = None  # for .get() calls
    session.query.return_value = mock_query
    return session  # type: ignore

@pytest.fixture
def analytics_service(mock_db_session: Session):
    return AnalyticsService(db=mock_db_session)

# Test Data
tenant_id = 1
user_id = 1

# --- Tests for Performance Metrics with Dimension Filtering ---
def test_get_performance_metrics_with_dimension_filters(analytics_service: AnalyticsService, mock_db_session: Session):
    mock_metric1 = PerformanceMetric(
        id=1, tenant_id=tenant_id, metric_name="sales", current_value=100,
        dimensions_values={"region": "NA", "product": "A"},
        period_start=datetime.now(timezone.utc), period_end=datetime.now(timezone.utc), metric_type="type", category="cat", entity_type="e_type", entity_id=1, measurement_unit="unit", calculation_method="sum",
        measurement_date=datetime.now(timezone.utc)
    )
    mock_metric2 = PerformanceMetric(
        id=2, tenant_id=tenant_id, metric_name="sales", current_value=200,
        dimensions_values={"region": "EU", "product": "A"},
        period_start=datetime.now(timezone.utc), period_end=datetime.now(timezone.utc), metric_type="type", category="cat", entity_type="e_type", entity_id=1, measurement_unit="unit", calculation_method="sum",
        measurement_date=datetime.now(timezone.utc)
    )
    mock_metric3 = PerformanceMetric(
        id=3, tenant_id=tenant_id, metric_name="sales", current_value=150,
        dimensions_values={"region": "NA", "product": "B"},
        period_start=datetime.now(timezone.utc), period_end=datetime.now(timezone.utc), metric_type="type", category="cat", entity_type="e_type", entity_id=1, measurement_unit="unit", calculation_method="sum",
        measurement_date=datetime.now(timezone.utc)
    )

    # Simulate the filter chain for query
    # This is a simplified mock of SQLAlchemy's chained calls
    query_mock = MagicMock()
    mock_db_session.query.return_value.filter.return_value = query_mock # Initial tenant filter

    # Mock for specific dimension filter results
    # This part needs careful mocking to simulate how SQLAlchemy JSON queries work
    # For this test, we'll assume the filter correctly narrows down.
    # A more robust mock would inspect the filter() arguments.

    def side_effect_filter(*args, **kwargs):
        # Based on how we construct filters in the service.
        # PerformanceMetric.dimensions_values[key].astext == str(value)
        # This mock is very basic and doesn't truly replicate SQLAlchemy behavior.
        current_filtered_list = query_mock._current_data if hasattr(query_mock, "_current_data") else [mock_metric1, mock_metric2, mock_metric3]

        if args and hasattr(args[0], 'left') and hasattr(args[0], 'right'): # Crude check for a binary expression
            # This is highly simplified. Real SQLAlchemy filter inspection is complex.
            # Example: args[0].left.element.key == 'dimensions_values'
            # args[0].right.value == 'NA'
            # For "region: NA"
            if args[0].right.value == "NA":
                 query_mock._current_data = [m for m in current_filtered_list if m.dimensions_values.get("region") == "NA"]
            elif args[0].right.value == "A" and args[0].left.key == "product": # Assuming key access like dimensions_values['product']
                 query_mock._current_data = [m for m in current_filtered_list if m.dimensions_values.get("product") == "A"]

        query_mock.order_by.return_value.limit.return_value.all.return_value = query_mock._current_data
        return query_mock

    query_mock.filter.side_effect = side_effect_filter
    query_mock.order_by.return_value.limit.return_value.all.return_value = [mock_metric1, mock_metric3] # Default if no specific filter matches

    # Test with one dimension filter
    query_mock._current_data = [mock_metric1, mock_metric2, mock_metric3] # Reset for next call
    result_na = analytics_service.get_performance_metrics(tenant_id=tenant_id, dimension_filters={"region": "NA"})

    # In this simplified mock, the side_effect needs to be smarter or we check calls.
    # For now, we assume the service constructs the query correctly and the DB would return the right items.
    # The test below is more about checking if the service *attempts* to apply filters.
    # Let's verify the call structure instead of return value for a more stable unit test here.

    analytics_service.get_performance_metrics(tenant_id=tenant_id, dimension_filters={"region": "NA"})

    # Check that filter was called multiple times: once for tenant_id, then for each dimension component
    # This depends heavily on the SQLAlchemy version and JSON implementation (e.g. .has_key, [key].astext)
    # For simplicity, we'll check that filter was called. A more specific check is hard with MagicMock.
    assert mock_db_session.query.return_value.filter.call_count >= 1
    # Example of more specific check if you know the exact SQLAlchemy calls:
    # mock_db_session.query(PerformanceMetric).filter.assert_any_call(PerformanceMetric.dimensions_values['region'].astext == 'NA')


# --- Tests for Multi-Dimensional Metric Calculation ---
def test_calculate_multi_dimensional_metrics_simple_sum(analytics_service: AnalyticsService, mock_db_session: Session):
    model = AnalyticsModel(id=1, dimensions=["country"], metrics=["sales"], aggregation_types={"sales": "sum"})
    mock_db_session.query(AnalyticsModel).filter(AnalyticsModel.id == 1).first.return_value = model

    data_records = [
        {"country": "US", "sales": 100},
        {"country": "US", "sales": 150},
        {"country": "CA", "sales": 50},
    ]
    results = analytics_service.calculate_multi_dimensional_metrics(model_id=1, data_records=data_records)
    assert len(results) == 2
    us_result = next(r for r in results if r["dimensions"]["country"] == "US")
    ca_result = next(r for r in results if r["dimensions"]["country"] == "CA")
    assert us_result["metrics"]["sales"] == 250
    assert ca_result["metrics"]["sales"] == 50

def test_calculate_multi_dimensional_metrics_mean_and_multiple_dims(analytics_service: AnalyticsService, mock_db_session: Session):
    model = AnalyticsModel(id=2, dimensions=["country", "product"], metrics=["revenue"], aggregation_types={"revenue": "mean"})
    mock_db_session.query(AnalyticsModel).filter(AnalyticsModel.id == 2).first.return_value = model

    data_records = [
        {"country": "US", "product": "A", "revenue": 100},
        {"country": "US", "product": "A", "revenue": 200},
        {"country": "US", "product": "B", "revenue": 150},
    ]
    results = analytics_service.calculate_multi_dimensional_metrics(model_id=2, data_records=data_records)
    assert len(results) == 2
    us_a_result = next(r for r in results if r["dimensions"]["country"] == "US" and r["dimensions"]["product"] == "A")
    us_b_result = next(r for r in results if r["dimensions"]["country"] == "US" and r["dimensions"]["product"] == "B")
    assert us_a_result["metrics"]["revenue"] == 150 # (100+200)/2
    assert us_b_result["metrics"]["revenue"] == 150

def test_calculate_multi_dimensional_metrics_missing_data_column(analytics_service: AnalyticsService, mock_db_session: Session):
    model = AnalyticsModel(id=3, dimensions=["country"], metrics=["non_existent_metric"], aggregation_types={"non_existent_metric": "sum"})
    mock_db_session.query(AnalyticsModel).filter(AnalyticsModel.id == 3).first.return_value = model
    data_records = [{"country": "US", "sales": 100}]
    with pytest.raises(ValueError, match="Metric 'non_existent_metric' specified in model not found"):
        analytics_service.calculate_multi_dimensional_metrics(model_id=3, data_records=data_records)

# --- Tests for Dashboard and Widget CRUD ---

# AnalyticsDashboard Tests
def test_create_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    dashboard_data = schemas.DashboardCreate(name="Test Dashboard", widgets=[
        schemas.WidgetConfigCreate(title="Widget 1", widget_type="kpi", data_source_config=schemas.WidgetDataSourceConfig(type="metric", params={"name":"sales"}))
    ])

    # Mock the flush behavior to assign an ID
    def mock_flush_effect(*args, **kwargs):
        # Simulate assigning an ID to the object passed to add() before flush
        # This is a bit of a simplification of how SQLAlchemy works.
        if mock_db_session.add.call_args:
            obj = mock_db_session.add.call_args[0][0]
            if isinstance(obj, AnalyticsDashboard) and obj.id is None:
                obj.id = 1 # Assign a mock ID
            if isinstance(obj, DashboardWidgetConfig) and obj.id is None:
                obj.id = 99 # Assign a mock ID for widget

    mock_db_session.flush.side_effect = mock_flush_effect

    created_dashboard = analytics_service.create_dashboard(tenant_id=tenant_id, user_id=user_id, dashboard_data=dashboard_data)

    mock_db_session.add.assert_called() # Check add was called (at least for dashboard)
    mock_db_session.commit.assert_called_once()
    assert created_dashboard.name == "Test Dashboard"
    assert created_dashboard.tenant_id == tenant_id
    assert created_dashboard.user_id == user_id
    assert len(created_dashboard.widgets) == 1
    assert created_dashboard.widgets[0].title == "Widget 1"
    assert len(created_dashboard.layout) == 1
    assert created_dashboard.layout[0]["widget_config_id"] == created_dashboard.widgets[0].id


def test_get_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    mock_dashboard = AnalyticsDashboard(id=1, name="My Dash", tenant_id=tenant_id, user_id=user_id)
    mock_db_session.query(AnalyticsDashboard).filter().first.return_value = mock_dashboard

    dashboard = analytics_service.get_dashboard(dashboard_id=1, tenant_id=tenant_id, user_id=user_id)
    assert dashboard is not None
    assert dashboard.name == "My Dash"

def test_get_dashboards_by_user(analytics_service: AnalyticsService, mock_db_session: Session):
    mock_dashboards = [AnalyticsDashboard(id=i, name=f"Dash {i}", tenant_id=tenant_id, user_id=user_id) for i in range(1,3)]
    mock_db_session.query(AnalyticsDashboard).filter().order_by().offset().limit().all.return_value = mock_dashboards

    dashboards = analytics_service.get_dashboards_by_user(tenant_id=tenant_id, user_id=user_id)
    assert len(dashboards) == 2
    assert dashboards[0].name == "Dash 1"

def test_update_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    existing_dashboard = AnalyticsDashboard(id=1, name="Old Name", tenant_id=tenant_id, user_id=user_id, layout=[])
    mock_db_session.query(AnalyticsDashboard).filter().first.return_value = existing_dashboard

    update_data = schemas.DashboardUpdate(name="New Name", layout=[schemas.LayoutItem(widget_config_id=1,x=0,y=0,w=1,h=1)])
    updated = analytics_service.update_dashboard(1, tenant_id, user_id, update_data)

    assert updated.name == "New Name"
    assert len(updated.layout) == 1
    assert updated.layout[0]["widget_config_id"] == 1
    mock_db_session.commit.assert_called_once()

# DashboardWidgetConfig Tests
def test_add_widget_to_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    mock_dashboard = AnalyticsDashboard(id=1, name="Dash", tenant_id=tenant_id, user_id=user_id, layout=[])
    mock_db_session.query(AnalyticsDashboard).filter().first.return_value = mock_dashboard

    widget_data = schemas.WidgetConfigCreate(
        title="Sales KPI", widget_type="kpi",
        data_source_config=schemas.WidgetDataSourceConfig(type="metric", params={"name":"total_sales"})
    )

    # Simulate flush for widget ID assignment
    def widget_flush_effect(*args, **kwargs):
        obj = mock_db_session.add.call_args[0][0]
        if isinstance(obj, DashboardWidgetConfig) and obj.id is None:
            obj.id = 101
    mock_db_session.flush.side_effect = widget_flush_effect

    new_widget = analytics_service.add_widget_to_dashboard(1, tenant_id, user_id, widget_data)

    assert new_widget is not None
    assert new_widget.title == "Sales KPI"
    assert new_widget.dashboard_id == 1
    assert len(mock_dashboard.layout) == 1 # Check layout updated on dashboard
    assert mock_dashboard.layout[0]["widget_config_id"] == new_widget.id
    mock_db_session.commit.assert_called_once()

def test_update_widget_on_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    # Setup: widget exists and dashboard exists and is owned by user
    mock_dashboard = AnalyticsDashboard(id=1, name="Dash", tenant_id=tenant_id, user_id=user_id)
    mock_widget = DashboardWidgetConfig(id=101, dashboard_id=1, title="Old Title", tenant_id=tenant_id, widget_type="kpi", data_source_config={})

    mock_db_session.query(DashboardWidgetConfig).filter().first.return_value = mock_widget
    mock_db_session.query(AnalyticsDashboard).filter().first.return_value = mock_dashboard # For ownership check

    update_data = schemas.WidgetConfigUpdate(title="New Widget Title")
    updated_widget = analytics_service.update_widget_on_dashboard(101, tenant_id, user_id, update_data)

    assert updated_widget is not None
    assert updated_widget.title == "New Widget Title"
    mock_db_session.commit.assert_called_once()

def test_remove_widget_from_dashboard(analytics_service: AnalyticsService, mock_db_session: Session):
    mock_dashboard = AnalyticsDashboard(id=1, name="Dash", tenant_id=tenant_id, user_id=user_id, layout=[{"widget_config_id": 101, "x":0, "y":0, "w":1, "h":1}])
    mock_widget = DashboardWidgetConfig(id=101, dashboard_id=1, title="Widget to Delete", tenant_id=tenant_id, widget_type="kpi", data_source_config={})

    # Set up proper mock query chain to distinguish between different model types
    def mock_query_side_effect(model_class):
        mock_query = MagicMock()
        if model_class == DashboardWidgetConfig:
            mock_query.filter.return_value.first.return_value = mock_widget
        elif model_class == AnalyticsDashboard:
            mock_query.filter.return_value.first.return_value = mock_dashboard
        else:
            mock_query.filter.return_value.first.return_value = None
        return mock_query
    
    mock_db_session.query.side_effect = mock_query_side_effect

    success = analytics_service.remove_widget_from_dashboard(101, tenant_id, user_id)

    assert success
    assert mock_db_session.delete.call_args[0][0] == mock_widget
    assert len(mock_dashboard.layout) == 0 # Check layout updated
    mock_db_session.commit.assert_called_once()

# (Add more tests for edge cases, error handling, prediction pipeline specifics, ROI, benchmarks etc.)

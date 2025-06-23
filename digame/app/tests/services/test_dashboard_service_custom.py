import pytest
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch
from datetime import datetime
import uuid

from digame.app.services.dashboard_service_custom import CustomDashboardService
from digame.app.models.dashboard_custom import AnalyticsDashboard, DashboardWidget
from digame.app.schemas import analytics_schemas as schemas
from digame.app.models.tenant import Tenant
from digame.app.models.user import User

@pytest.fixture
def mock_db_session():
    return MagicMock(spec=Session)

@pytest.fixture
def custom_dashboard_service(mock_db_session):
    return CustomDashboardService(db=mock_db_session)

@pytest.fixture
def sample_tenant():
    return Tenant(id=1, name="Dashboard Test Tenant")

@pytest.fixture
def sample_user(sample_tenant):
    return User(id=1, email="dashboard.user@example.com", tenant_id=sample_tenant.id)

@pytest.fixture
def sample_dashboard_create_data():
    return schemas.AnalyticsDashboardCreate(
        name="My Awesome Dashboard",
        description="Tracks key performance indicators.",
        layout=[
            {"widget_id": 1, "x": 0, "y": 0, "w": 4, "h": 2},
            {"widget_id": 2, "x": 4, "y": 0, "w": 4, "h": 2}
        ],
        tags=["kpi", "performance"]
    )

@pytest.fixture
def sample_widget_create_data():
    return schemas.DashboardWidgetConfigCreate(
        title="CPU Usage Monitor",
        widget_type="line_chart",
        data_source_config={
            "type": "performance_metric_timeseries",
            "query_params": {"metric_name": "cpu_usage", "entity_type": "server"}
        },
        display_options={"color": "green"}
    )

# --- AnalyticsDashboard Tests ---
def test_create_dashboard(custom_dashboard_service, mock_db_session, sample_tenant, sample_user, sample_dashboard_create_data):
    dashboard = custom_dashboard_service.create_dashboard(
        tenant_id=sample_tenant.id,
        user_id=sample_user.id,
        dashboard_data=sample_dashboard_create_data
    )
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(dashboard)
    assert dashboard.name == sample_dashboard_create_data.name
    assert dashboard.user_id == sample_user.id
    assert dashboard.tenant_id == sample_tenant.id
    assert len(dashboard.layout) == 2

def test_get_dashboard(custom_dashboard_service, mock_db_session, sample_tenant):
    mock_dashboard_instance = AnalyticsDashboard(id=1, tenant_id=sample_tenant.id, name="Test Dash")
    mock_query = MagicMock()
    mock_db_session.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = mock_dashboard_instance

    dashboard = custom_dashboard_service.get_dashboard(dashboard_id=1, tenant_id=sample_tenant.id)

    assert dashboard is not None
    assert dashboard.id == 1
    assert dashboard.name == "Test Dash"

def test_get_dashboards_by_user(custom_dashboard_service, mock_db_session, sample_tenant, sample_user):
    mock_dashboards = [
        AnalyticsDashboard(id=1, user_id=sample_user.id, tenant_id=sample_tenant.id, name="Dash 1"),
        AnalyticsDashboard(id=2, user_id=sample_user.id, tenant_id=sample_tenant.id, name="Dash 2"),
    ]
    mock_query = MagicMock()
    mock_db_session.query.return_value = mock_query
    mock_query.filter.return_value.order_by.return_value.all.return_value = mock_dashboards

    dashboards = custom_dashboard_service.get_dashboards_by_user(user_id=sample_user.id, tenant_id=sample_tenant.id)
    assert len(dashboards) == 2
    assert dashboards[0].name == "Dash 1"

def test_update_dashboard(custom_dashboard_service, mock_db_session, sample_tenant, sample_user):
    existing_dashboard = AnalyticsDashboard(id=1, name="Old Name", user_id=sample_user.id, tenant_id=sample_tenant.id, layout=[])

    # Mock the get_dashboard call within update_dashboard
    with patch.object(custom_dashboard_service, 'get_dashboard', return_value=existing_dashboard):
        update_payload = schemas.AnalyticsDashboardUpdate(name="New Updated Name", description="New Desc")
        updated_dashboard = custom_dashboard_service.update_dashboard(
            dashboard_id=1,
            tenant_id=sample_tenant.id,
            user_id=sample_user.id,
            dashboard_update_data=update_payload
        )
        assert updated_dashboard is not None
        assert updated_dashboard.name == "New Updated Name"
        assert updated_dashboard.description == "New Desc"
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(existing_dashboard)

def test_delete_dashboard(custom_dashboard_service, mock_db_session, sample_tenant, sample_user):
    existing_dashboard = AnalyticsDashboard(id=1, user_id=sample_user.id, tenant_id=sample_tenant.id)
    with patch.object(custom_dashboard_service, 'get_dashboard', return_value=existing_dashboard):
        success = custom_dashboard_service.delete_dashboard(
            dashboard_id=1, tenant_id=sample_tenant.id, user_id=sample_user.id
        )
        assert success is True
        mock_db_session.delete.assert_called_once_with(existing_dashboard)
        mock_db_session.commit.assert_called_once()

# --- DashboardWidget Tests ---
def test_create_widget(custom_dashboard_service, mock_db_session, sample_tenant, sample_widget_create_data):
    widget = custom_dashboard_service.create_widget(
        tenant_id=sample_tenant.id,
        widget_data=sample_widget_create_data
    )
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(widget)
    assert widget.title == sample_widget_create_data.title
    assert widget.widget_type == "line_chart"

def test_get_widget(custom_dashboard_service, mock_db_session, sample_tenant):
    mock_widget_instance = DashboardWidget(id=1, tenant_id=sample_tenant.id, title="Test Widget")
    mock_query = MagicMock()
    mock_db_session.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = mock_widget_instance

    widget = custom_dashboard_service.get_widget(widget_id=1, tenant_id=sample_tenant.id)
    assert widget is not None
    assert widget.id == 1
    assert widget.title == "Test Widget"

# --- get_widget_data Test (basic structure) ---
@pytest.mark.asyncio
async def test_get_widget_data_performance_metric_value(custom_dashboard_service, mock_db_session, sample_tenant):
    widget_instance = DashboardWidget(
        id=1,
        tenant_id=sample_tenant.id,
        title="CPU Usage",
        widget_type="kpi_card",
        data_source_config={
            "type": "performance_metric_value",
            "query_params": {"metric_name": "cpu_usage", "entity_id": 101, "entity_type": "server"}
        }
    )
    metric_record = PerformanceMetric( # Assuming PerformanceMetric is imported
        current_value=88.0,
        measurement_unit="%",
        display_name="CPU Utilization",
        trend_direction="stable",
        updated_at=datetime.utcnow()
    )

    with patch.object(custom_dashboard_service, 'get_widget', return_value=widget_instance):
        mock_metric_query = MagicMock()
        mock_db_session.query(PerformanceMetric).return_value = mock_metric_query
        mock_metric_query.filter.return_value.order_by.return_value.first.return_value = metric_record

        widget_data_response = await custom_dashboard_service.get_widget_data(
            widget_id=1, tenant_id=sample_tenant.id
        )

        assert widget_data_response["widget_id"] == 1
        assert widget_data_response["data"]["value"] == 88.0
        assert widget_data_response["data"]["unit"] == "%"

@pytest.mark.asyncio
async def test_get_widget_data_not_found(custom_dashboard_service, mock_db_session, sample_tenant):
     with patch.object(custom_dashboard_service, 'get_widget', return_value=None):
        with pytest.raises(HTTPException) as exc_info: # Assuming HTTPException is imported from fastapi
             await custom_dashboard_service.get_widget_data(widget_id=999, tenant_id=sample_tenant.id)
        assert exc_info.value.status_code == 404

# Need to import PerformanceMetric for the test_get_widget_data_...
from digame.app.models.analytics import PerformanceMetric
from fastapi import HTTPException # For testing exceptions

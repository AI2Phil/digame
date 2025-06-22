import pytest
from digame.app.services.dashboard_service import DashboardService
from digame.app.models.dashboard_models import (
    ProductivityChart, ActivityBreakdown,
    ProductivityMetricsGroup, RecentActivities
)

@pytest.mark.asyncio
async def test_get_productivity_chart_data():
    service = DashboardService()
    user_id = "test_user"
    result = await service.get_productivity_chart_data(user_id)
    assert isinstance(result, ProductivityChart)
    assert result.title == "Weekly Productivity Score"
    assert len(result.data) > 0

@pytest.mark.asyncio
async def test_get_activity_breakdown():
    service = DashboardService()
    user_id = "test_user"
    result = await service.get_activity_breakdown(user_id)
    assert isinstance(result, ActivityBreakdown)
    assert result.title == "Activity Breakdown (Last 7 Days)"
    assert len(result.data) > 0
    assert sum(item.percentage for item in result.data) >= 99.9 # check sum of percentages

@pytest.mark.asyncio
async def test_get_productivity_metrics():
    service = DashboardService()
    user_id = "test_user"
    result = await service.get_productivity_metrics(user_id)
    assert isinstance(result, ProductivityMetricsGroup)
    assert result.title == "Key Productivity Metrics"
    assert len(result.metrics) > 0

@pytest.mark.asyncio
async def test_get_recent_activities():
    service = DashboardService()
    user_id = "test_user"
    result = await service.get_recent_activities(user_id)
    assert isinstance(result, RecentActivities)
    assert result.title == "Recent Activities"
    assert len(result.activities) > 0

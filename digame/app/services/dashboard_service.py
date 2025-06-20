import datetime
from typing import List
from digame.app.models.dashboard_models import (
    ProductivityChartDataPoint, ProductivityChart,
    ActivityBreakdownItem, ActivityBreakdown,
    ProductivityMetric, ProductivityMetricsGroup,
    RecentActivityItem, RecentActivities
)

class DashboardService:
    async def get_productivity_chart_data(self, user_id: str) -> ProductivityChart:
        # Mocked data
        return ProductivityChart(
            title="Weekly Productivity Score",
            data=[
                ProductivityChartDataPoint(date=datetime.date(2023, 1, 2), score=75.0),
                ProductivityChartDataPoint(date=datetime.date(2023, 1, 3), score=80.5),
                ProductivityChartDataPoint(date=datetime.date(2023, 1, 4), score=70.0),
                ProductivityChartDataPoint(date=datetime.date(2023, 1, 5), score=85.0),
                ProductivityChartDataPoint(date=datetime.date(2023, 1, 6), score=90.0),
            ]
        )

    async def get_activity_breakdown(self, user_id: str) -> ActivityBreakdown:
        # Mocked data
        return ActivityBreakdown(
            title="Activity Breakdown (Last 7 Days)",
            data=[
                ActivityBreakdownItem(activity_name="Focused Work", duration_minutes=1200, percentage=50.0),
                ActivityBreakdownItem(activity_name="Meetings", duration_minutes=600, percentage=25.0),
                ActivityBreakdownItem(activity_name="Learning", duration_minutes=360, percentage=15.0),
                ActivityBreakdownItem(activity_name="Breaks", duration_minutes=240, percentage=10.0),
            ]
        )

    async def get_productivity_metrics(self, user_id: str) -> ProductivityMetricsGroup:
        # Mocked data
        return ProductivityMetricsGroup(
            title="Key Productivity Metrics",
            metrics=[
                ProductivityMetric(name="Tasks Completed", value="12", trend="+2"),
                ProductivityMetric(name="Focus Hours", value="20h", trend="+5%"),
                ProductivityMetric(name="Avg. Task Time", value="1h 30m", trend="-10m"),
            ]
        )

    async def get_recent_activities(self, user_id: str) -> RecentActivities:
        # Mocked data
        return RecentActivities(
            title="Recent Activities",
            activities=[
                RecentActivityItem(id="act1", description="Finalized Q1 report", timestamp=datetime.datetime.now() - datetime.timedelta(hours=1), status="Completed"),
                RecentActivityItem(id="act2", description="Team meeting on project X", timestamp=datetime.datetime.now() - datetime.timedelta(hours=3), status="Attended"),
                RecentActivityItem(id="act3", description="Code review for feature Y", timestamp=datetime.datetime.now() - datetime.timedelta(days=1), status="Pending"),
            ]
        )

# Placeholder for dependency injection if using FastAPI's Depends
def get_dashboard_service():
    return DashboardService()

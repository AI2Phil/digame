import datetime
from typing import List
from app.models.dashboard_models import (
    ProductivityChartDataPoint, ProductivityChart,
    ActivityBreakdownItem, ActivityBreakdown,
    ProductivityMetric, ProductivityMetricsGroup,
    RecentActivityItem, RecentActivities,
    WidgetConfig, DashboardLayout, CustomDashboard,
    AdvancedPerformanceDataPoint, AdvancedPerformanceSeries,
    PerformanceForecastData, BenchmarkComparisonData, ROIDashboardData
)
from typing import Optional, Dict, Any
import uuid # For generating IDs for custom dashboards and widgets

class DashboardService:
    # Mock database for custom dashboards - in a real app, this would be a database
    _custom_dashboards: Dict[str, CustomDashboard] = {}

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

    # --- Advanced Analytics Dashboard Data ---
    async def get_multi_dimensional_performance_data(self, user_id: str, metric_ids: List[int], time_period: str) -> List[AdvancedPerformanceSeries]:
        # Mocked Data
        series_list = []
        for i, metric_id in enumerate(metric_ids):
            points = []
            for day in range(7):
                points.append(AdvancedPerformanceDataPoint(
                    timestamp=datetime.datetime.now() - datetime.timedelta(days=day),
                    value=70 + i*5 + (day % 3) * 5,
                    dimension_values={"region": "NA" if i % 2 == 0 else "EMEA", "product": "Product A"}
                ))
            series_list.append(AdvancedPerformanceSeries(
                metric_name=f"Metric {metric_id}",
                series_label=f"Performance Metric {metric_id} - Region {'NA' if i % 2 == 0 else 'EMEA'}",
                data_points=points,
                unit="score"
            ))
        return series_list

    async def get_performance_forecast_data(self, user_id: str, model_id: int) -> PerformanceForecastData:
        # Mocked Data
        actual_series = AdvancedPerformanceSeries(
            metric_name="Overall Performance",
            series_label="Actual Performance",
            data_points=[
                AdvancedPerformanceDataPoint(timestamp=datetime.datetime.now() - datetime.timedelta(days=d), value=80-d*2) for d in range(5,-1,-1)
            ],
            unit="%"
        )
        forecast_series = AdvancedPerformanceSeries(
            metric_name="Overall Performance",
            series_label="Forecasted Performance",
            data_points=[
                AdvancedPerformanceDataPoint(timestamp=datetime.datetime.now() + datetime.timedelta(days=d), value=70+d*1.5) for d in range(1,8)
            ],
            unit="%"
        )
        return PerformanceForecastData(
            title="Performance Forecast (Next 7 Days)",
            forecast_horizon_days=7,
            series=[actual_series, forecast_series]
        )

    async def get_benchmark_comparison_data(self, user_id: str, entity_id: int, metric_name: str) -> List[BenchmarkComparisonData]:
        # Mocked Data
        return [
            BenchmarkComparisonData(
                metric_name=metric_name,
                entity_value=75.0,
                benchmark_value=70.0,
                benchmark_name="Industry Average Q1",
                difference=5.0,
                unit="%",
                notes="Performing above industry average."
            ),
            BenchmarkComparisonData(
                metric_name=metric_name,
                entity_value=75.0,
                benchmark_value=80.0,
                benchmark_name="Top Quartile Performers Q1",
                difference=-5.0,
                unit="%",
                notes="Below top quartile performers."
            )
        ]

    async def get_roi_dashboard_data(self, user_id: str, project_ids: List[int]) -> ROIDashboardData:
        # Mocked Data
        return ROIDashboardData(
            title="Project ROI Overview",
            total_roi_percentage=35.5,
            total_investment=500000.00,
            total_benefits=677500.00,
            top_performing_projects=[
                {"name": "Project Phoenix", "roi": 120.0, "id": 1},
                {"name": "Project Titan", "roi": 95.0, "id": 2}
            ],
            roi_trend=[
                AdvancedPerformanceDataPoint(timestamp=datetime.datetime(2023,1,1), value=20.0),
                AdvancedPerformanceDataPoint(timestamp=datetime.datetime(2023,4,1), value=28.5),
                AdvancedPerformanceDataPoint(timestamp=datetime.datetime(2023,7,1), value=35.5),
            ]
        )

    # --- Custom Dashboard Management ---
    async def create_custom_dashboard(self, tenant_id: int, user_id: int, name: str, description: Optional[str] = None) -> CustomDashboard:
        dashboard_id = str(uuid.uuid4())
        dashboard = CustomDashboard(
            id=dashboard_id,
            tenant_id=tenant_id,
            user_id=user_id,
            name=name,
            description=description,
            layout=DashboardLayout(columns=12, widgets=[]), # Default layout
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )
        self._custom_dashboards[dashboard_id] = dashboard
        return dashboard

    async def get_custom_dashboard(self, dashboard_id: str, user_id: int) -> Optional[CustomDashboard]:
        dashboard = self._custom_dashboards.get(dashboard_id)
        # In a real app, also check if user_id has permission for this tenant_id/dashboard_id
        if dashboard and dashboard.user_id == user_id:
            return dashboard
        return None

    async def get_user_custom_dashboards(self, user_id: int, tenant_id: int) -> List[CustomDashboard]:
        return [
            d for d in self._custom_dashboards.values()
            if d.user_id == user_id and d.tenant_id == tenant_id
        ]

    async def update_custom_dashboard_layout(self, dashboard_id: str, user_id: int, layout: DashboardLayout) -> Optional[CustomDashboard]:
        dashboard = await self.get_custom_dashboard(dashboard_id, user_id)
        if dashboard:
            dashboard.layout = layout
            dashboard.updated_at = datetime.datetime.now()
            self._custom_dashboards[dashboard_id] = dashboard
            return dashboard
        return None

    async def add_widget_to_dashboard(self, dashboard_id: str, user_id: int, widget_config: WidgetConfig) -> Optional[CustomDashboard]:
        dashboard = await self.get_custom_dashboard(dashboard_id, user_id)
        if dashboard:
            # Ensure widget ID is unique if not already provided or handle updates
            if not widget_config.id:
                 widget_config.id = str(uuid.uuid4())
            else: # If ID exists, it's an update or replacement
                dashboard.layout.widgets = [w for w in dashboard.layout.widgets if w.id != widget_config.id]

            dashboard.layout.widgets.append(widget_config)
            dashboard.updated_at = datetime.datetime.now()
            self._custom_dashboards[dashboard_id] = dashboard
            return dashboard
        return None

    async def remove_widget_from_dashboard(self, dashboard_id: str, user_id: int, widget_id: str) -> Optional[CustomDashboard]:
        dashboard = await self.get_custom_dashboard(dashboard_id, user_id)
        if dashboard:
            dashboard.layout.widgets = [w for w in dashboard.layout.widgets if w.id != widget_id]
            dashboard.updated_at = datetime.datetime.now()
            self._custom_dashboards[dashboard_id] = dashboard
            return dashboard
        return None

# Placeholder for dependency injection if using FastAPI's Depends
def get_dashboard_service():
    # This should be a singleton in a real app if _custom_dashboards is to persist across requests
    # For now, new instance each time means mock data is reset.
    return DashboardService()

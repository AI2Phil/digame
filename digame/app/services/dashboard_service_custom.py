from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid

from ..models.dashboard_custom import AnalyticsDashboard, DashboardWidget
from ..schemas import analytics_schemas as schemas # Using the new analytics_schemas

class CustomDashboardService:
    def __init__(self, db: Session):
        self.db = db

    # --- AnalyticsDashboard CRUD ---
    def create_dashboard(
        self,
        tenant_id: int,
        user_id: int,
        dashboard_data: schemas.AnalyticsDashboardCreate
    ) -> AnalyticsDashboard:
        db_dashboard = AnalyticsDashboard(
            **dashboard_data.dict(),
            tenant_id=tenant_id,
            user_id=user_id,
            dashboard_uuid=str(uuid.uuid4())
        )
        self.db.add(db_dashboard)
        self.db.commit()
        self.db.refresh(db_dashboard)
        return db_dashboard

    def get_dashboard(self, dashboard_id: int, tenant_id: int) -> Optional[AnalyticsDashboard]:
        return self.db.query(AnalyticsDashboard).filter(
            AnalyticsDashboard.id == dashboard_id,
            AnalyticsDashboard.tenant_id == tenant_id
        ).first()

    def get_dashboards_by_user(self, user_id: int, tenant_id: int) -> List[AnalyticsDashboard]:
        return self.db.query(AnalyticsDashboard).filter(
            AnalyticsDashboard.user_id == user_id,
            AnalyticsDashboard.tenant_id == tenant_id
        ).order_by(AnalyticsDashboard.name).all()

    def update_dashboard(
        self,
        dashboard_id: int,
        tenant_id: int,
        user_id: int, # For ownership check
        dashboard_update_data: schemas.AnalyticsDashboardUpdate # Pydantic schema for update
    ) -> Optional[AnalyticsDashboard]:
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id)
        if not db_dashboard or db_dashboard.user_id != user_id:
            return None # Or raise HTTPException for permission issues

        update_data = dashboard_update_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_dashboard, key, value)

        self.db.commit()
        self.db.refresh(db_dashboard)
        return db_dashboard

    def delete_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int) -> bool:
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id)
        if not db_dashboard or db_dashboard.user_id != user_id:
            # Consider raising HTTPException for not found or permission denied
            return False

        # Potentially handle related widgets if they are exclusively owned by this dashboard
        # For now, assuming widgets are independent or managed separately if referenced.

        self.db.delete(db_dashboard)
        self.db.commit()
        return True

    # --- DashboardWidget CRUD ---
    def create_widget(
        self,
        tenant_id: int,
        widget_data: schemas.DashboardWidgetConfigCreate
    ) -> DashboardWidget:
        db_widget = DashboardWidget(
            **widget_data.dict(),
            tenant_id=tenant_id,
            widget_uuid=str(uuid.uuid4())
        )
        self.db.add(db_widget)
        self.db.commit()
        self.db.refresh(db_widget)
        return db_widget

    def get_widget(self, widget_id: int, tenant_id: int) -> Optional[DashboardWidget]:
        return self.db.query(DashboardWidget).filter(
            DashboardWidget.id == widget_id,
            DashboardWidget.tenant_id == tenant_id
        ).first()

    def get_widgets_by_tenant(self, tenant_id: int) -> List[DashboardWidget]: # Generic getter for now
        return self.db.query(DashboardWidget).filter(
            DashboardWidget.tenant_id == tenant_id
        ).order_by(DashboardWidget.title).all()

    def update_widget(
        self,
        widget_id: int,
        tenant_id: int,
        widget_update_data: schemas.DashboardWidgetConfigUpdate # Pydantic schema for update
    ) -> Optional[DashboardWidget]:
        db_widget = self.get_widget(widget_id, tenant_id)
        if not db_widget:
            return None

        update_data = widget_update_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_widget, key, value)

        self.db.commit()
        self.db.refresh(db_widget)
        return db_widget

    def delete_widget(self, widget_id: int, tenant_id: int) -> bool:
        db_widget = self.get_widget(widget_id, tenant_id)
        if not db_widget:
            return False

        # Check if this widget is used in any dashboard layouts before deleting,
        # or handle cascade/cleanup. For now, direct delete.
        # dashboards_using_widget = self.db.query(AnalyticsDashboard).filter(
        #     AnalyticsDashboard.tenant_id == tenant_id,
        #     AnalyticsDashboard.layout.contains([{"widget_id": widget_id}]) # This query is conceptual for JSON
        # ).count()
        # if dashboards_using_widget > 0:
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Widget is in use by dashboards.")

        self.db.delete(db_widget)
        self.db.commit()
        return True

    # --- Data Fetching for Widgets (Conceptual - to be expanded) ---
    async def get_widget_data(
        self,
        widget_id: int,
        tenant_id: int,
        # Potentially pass user context for filtering data if widget data source is user-specific
        # current_user: User
    ) -> Dict[str, Any]:
        """
        Fetches and processes data for a specific dashboard widget.
        This is a crucial method that will call other services (AnalyticsService, etc.)
        based on the widget's data_source_config.
        """
        widget = self.get_widget(widget_id, tenant_id)
        if not widget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget configuration not found")

        data_source_type = widget.data_source_config.get("type")
        query_params = widget.data_source_config.get("query_params", {})

        # This is where the logic to call different services will go.
        # Example:
        # Need AnalyticsService to fetch underlying data
        # This import should ideally be at the top level of the module
        # from ..services.analytics_service import get_analytics_service, AnalyticsService
        # For now, to avoid circular dependencies or complex setup, let's assume it's passed or accessible
        # A better way would be dependency injection at router level if services depend on each other.
        # For simplicity in this step, we might instantiate it directly if needed, or require it to be passed.
        # Let's assume we can get it:

        # To avoid direct import issues within service layer for now for this step,
        # we'll make a conceptual call. In a real setup, use proper dependency injection.
        # For the purpose of this isolated step, we'll mock the call structure.

        # analytics_service: AnalyticsService = AnalyticsService(self.db) # Direct instantiation for now
        # This is not ideal as AnalyticsService itself has dependencies if it uses get_db in its init.
        # Let's assume an analytics_service instance is available via self or passed in.
        # For this exercise, I will proceed as if `self.analytics_service` is available.
        # This implies __init__ of CustomDashboardService would take an AnalyticsService instance.
        # Or, AnalyticsService methods are made static or called via a factory.

        # Re-evaluating: The router passes the service instance. So, CustomDashboardService
        # needs AnalyticsService. The router can instantiate both and pass AnalyticsService to CustomDashboardService.
        # This is too complex for this step.
        # Simpler: CustomDashboardService will directly query models or call simpler AnalyticsService methods for now.

        data_payload: Dict[str, Any] = {"error": "Unknown data_source_type or data fetching failed."}

        if data_source_type == "performance_metric_value":
            metric_name = query_params.get("metric_name")
            entity_id = query_params.get("entity_id")
            entity_type = query_params.get("entity_type")
            # Potentially use dimensions_values from query_params for more specific match

            if metric_name and entity_id and entity_type:
                # Simplified fetch - in reality, might need more specific filters (e.g. latest)
                metric_record = self.db.query(PerformanceMetric).filter(
                    PerformanceMetric.tenant_id == tenant_id,
                    PerformanceMetric.metric_name == metric_name,
                    PerformanceMetric.entity_id == entity_id,
                    PerformanceMetric.entity_type == entity_type
                ).order_by(PerformanceMetric.measurement_date.desc()).first()
                if metric_record:
                    data_payload = {
                        "value": metric_record.current_value,
                        "unit": metric_record.measurement_unit,
                        "metric_display_name": metric_record.display_name,
                        "trend": metric_record.trend_direction,
                        "last_updated": metric_record.updated_at
                    }
                else:
                    data_payload = {"error": f"Performance metric '{metric_name}' not found for entity."}
            else:
                data_payload = {"error": "Missing parameters for performance_metric_value (metric_name, entity_id, entity_type)."}

        elif data_source_type == "analytics_prediction_value":
            model_id = query_params.get("model_id")
            entity_id = query_params.get("entity_id")
            entity_type = query_params.get("entity_type")
            if model_id and entity_id and entity_type:
                prediction_record = self.db.query(AnalyticsPrediction).filter(
                    AnalyticsPrediction.tenant_id == tenant_id,
                    AnalyticsPrediction.model_id == model_id,
                    AnalyticsPrediction.entity_id == entity_id,
                    AnalyticsPrediction.entity_type == entity_type
                ).order_by(AnalyticsPrediction.prediction_date.desc()).first()
                if prediction_record:
                    data_payload = {
                        "predicted_value": prediction_record.predicted_value,
                        "predicted_values_multi_dim": prediction_record.predicted_values_multi_dim,
                        "confidence": prediction_record.confidence_score,
                        "benchmark_comparison": prediction_record.benchmark_comparison_data,
                        "raw_output": prediction_record.raw_prediction_output,
                        "prediction_date": prediction_record.prediction_date
                    }
                else:
                    data_payload = {"error": "Prediction not found."}
            else:
                data_payload = {"error": "Missing parameters for analytics_prediction_value (model_id, entity_id, entity_type)."}

        # Add more handlers for other data_source_types like:
        # "performance_metric_timeseries", "roi_summary", "benchmark_comparison_list",
        # "multi_dimensional_aggregation" (this one would call AnalyticsService.calculate_multi_dimensional_metrics)

        return {
            "widget_id": widget_id,
            "widget_title": widget.title,
            "widget_type": widget.widget_type,
            "data_source_config": widget.data_source_config,
            "data": data_payload,
            "display_options": widget.display_options
        }


from ..database import get_db # Import get_db
# Need AnalyticsService and its models for some data fetching logic
from ..models.analytics import PerformanceMetric, AnalyticsPrediction, AnalyticsModel, ROICalculation
# from ..services.analytics_service import AnalyticsService # Avoid direct service-to-service import for now

# Dependency for getting the service
def get_custom_dashboard_service(db: Session = Depends(get_db)) -> CustomDashboardService:
    return CustomDashboardService(db=db)

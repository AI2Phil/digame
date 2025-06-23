from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid

from ..models.dashboard_custom import AnalyticsDashboard, DashboardWidget
from ..schemas import analytics_schemas as schemas # Using the new analytics_schemas
from ..services.analytics_service import AnalyticsService # Import AnalyticsService

class CustomDashboardService:
    def __init__(self, db: Session, analytics_service: AnalyticsService):
        self.db = db
        self.analytics_service = analytics_service

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
        data_payload: Any = {"error": "Unknown data_source_type or data fetching failed."}
        limit = query_params.get("limit", 50) # Common parameter

        try:
            if data_source_type == "performance_metric_single":
                metric_name = query_params.get("metric_name")
                entity_id = query_params.get("entity_id")
                entity_type = query_params.get("entity_type")
                # TODO: Add support for dimensions_values from query_params for more specific match

                if metric_name: # entity_id and entity_type can be optional for some metrics
                    # Fetch the latest matching metric
                    metrics = self.analytics_service.get_performance_metrics(
                        tenant_id=tenant_id,
                        metric_name=metric_name, # Assuming get_performance_metrics can filter by name
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=1 # We want the most recent one
                    )
                    if metrics:
                        metric_record = metrics[0]
                        data_payload = {
                            "value": metric_record.current_value,
                            "unit": metric_record.measurement_unit,
                            "metric_display_name": metric_record.display_name,
                            "trend": metric_record.trend_direction,
                            "last_updated": metric_record.updated_at,
                            "id": metric_record.id
                        }
                    else:
                        data_payload = {"error": f"Performance metric '{metric_name}' not found."}
                else:
                    data_payload = {"error": "Missing parameters for performance_metric_single (metric_name)."}

            elif data_source_type == "performance_metric_list":
                metrics = self.analytics_service.get_performance_metrics(
                    tenant_id=tenant_id,
                    metric_type=query_params.get("metric_type"),
                    category=query_params.get("category"),
                    entity_type=query_params.get("entity_type"),
                    entity_id=query_params.get("entity_id"),
                    limit=limit
                )
                data_payload = [schemas.PerformanceMetricInDB.from_orm(m).dict() for m in metrics]

            elif data_source_type == "performance_metric_timeseries":
                metric_name = query_params.get("metric_name")
                entity_id = query_params.get("entity_id")
                entity_type = query_params.get("entity_type")
                # Additional params for time series:
                # period_start, period_end, granularity (daily, weekly - for aggregation)
                # For now, fetch all historical data for a specific metric name / entity
                if metric_name:
                    # This is a simplified version. Real timeseries might need specific querying
                    # in AnalyticsService to get historical values, not just current ones.
                    # Assuming get_performance_metrics returns records sorted by measurement_date
                    all_metric_records = self.analytics_service.get_performance_metrics(
                        tenant_id=tenant_id,
                        metric_name=metric_name, # Needs get_performance_metrics to support name filtering
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=query_params.get("history_limit", 30) # Limit number of historical points
                    )
                    # And that PerformanceMetric model has a measurement_date or period_end
                    data_payload = [
                        {"timestamp": r.measurement_date or r.period_end, "value": r.current_value, "unit": r.measurement_unit}
                        for r in sorted(all_metric_records, key=lambda x: x.measurement_date or x.period_end) if r.measurement_date or r.period_end
                    ]
                    if not data_payload:
                         data_payload = {"error": f"No time series data found for metric '{metric_name}'."}
                else:
                    data_payload = {"error": "Missing metric_name for performance_metric_timeseries."}


            elif data_source_type == "prediction_single":
                prediction_id = query_params.get("prediction_id")
                if prediction_id:
                    prediction_record = self.analytics_service.get_prediction_by_id(
                        prediction_id=prediction_id, tenant_id=tenant_id
                    )
                    if prediction_record:
                        data_payload = schemas.AnalyticsPredictionInDB.from_orm(prediction_record).dict()
                    else:
                        data_payload = {"error": "Prediction not found."}
                else: # Fallback to fetching latest for model/entity if no ID
                    model_id = query_params.get("model_id")
                    entity_id = query_params.get("entity_id")
                    entity_type = query_params.get("entity_type")
                    if model_id: # entity_id and entity_type can be optional for some predictions
                        predictions = self.analytics_service.get_predictions(
                            tenant_id=tenant_id, model_id=model_id, entity_id=entity_id, entity_type=entity_type, limit=1
                        )
                        if predictions:
                            data_payload = schemas.AnalyticsPredictionInDB.from_orm(predictions[0]).dict()
                        else:
                            data_payload = {"error": "Prediction not found for model/entity."}
                    else:
                        data_payload = {"error": "Missing parameters for prediction_single (prediction_id or model_id)."}

            elif data_source_type == "prediction_list":
                predictions = self.analytics_service.get_predictions(
                    tenant_id=tenant_id,
                    model_id=query_params.get("model_id"),
                    entity_type=query_params.get("entity_type"),
                    entity_id=query_params.get("entity_id"),
                    limit=limit
                )
                data_payload = [schemas.AnalyticsPredictionInDB.from_orm(p).dict() for p in predictions]

            elif data_source_type == "roi_calculation_detail":
                calculation_id = query_params.get("calculation_id")
                if calculation_id:
                    calculation = self.analytics_service.get_roi_calculation_by_id(
                        calculation_id=calculation_id, tenant_id=tenant_id
                    )
                    if calculation:
                        data_payload = schemas.ROICalculationInDB.from_orm(calculation).dict()
                    else:
                        data_payload = {"error": "ROI Calculation not found."}
                else:
                    data_payload = {"error": "Missing calculation_id for roi_calculation_detail."}

            elif data_source_type == "roi_calculation_list":
                calculations = self.analytics_service.get_roi_calculations(
                    tenant_id=tenant_id,
                    entity_type=query_params.get("entity_type"),
                    entity_id=query_params.get("entity_id"),
                    limit=limit
                )
                data_payload = [schemas.ROICalculationInDB.from_orm(c).dict() for c in calculations]

            elif data_source_type == "benchmark_comparison_detail":
                metric_id = query_params.get("performance_metric_id")
                benchmark_filter_params = query_params.get("benchmark_filter_params")
                if metric_id:
                    comparisons = self.analytics_service.compare_performance_metric_with_benchmarks(
                        performance_metric_id=metric_id,
                        tenant_id=tenant_id,
                        benchmark_params=benchmark_filter_params
                    )
                    data_payload = comparisons # Already a list of dicts
                    if not comparisons:
                        data_payload = {"message": "No benchmark comparisons found for the given metric."}
                else:
                    data_payload = {"error": "Missing performance_metric_id for benchmark_comparison_detail."}

            elif data_source_type == "analytics_model_list":
                models = self.analytics_service.get_analytics_models(
                    tenant_id=tenant_id,
                    model_type=query_params.get("model_type"),
                    category=query_params.get("category"),
                    active_only=query_params.get("active_only", True)
                )
                data_payload = [schemas.AnalyticsModelInDB.from_orm(m).dict() for m in models]

            # TODO: Add more handlers for other data_source_types like:
            # "multi_dimensional_aggregation" (this one would call AnalyticsService.calculate_multi_dimensional_metrics)
            # "prediction_accuracy_over_time", etc.

        except HTTPException: # Re-raise HTTP exceptions
            raise
        except ValueError as ve: # Specific error from service layer
            # Log error ve
            data_payload = {"error": f"Data fetching error: {str(ve)}"}
        except Exception as e:
            # Log error e
            # In a production system, you might not want to expose raw error messages.
            data_payload = {"error": f"An unexpected error occurred: {str(e)}"}


        return {
            "widget_id": widget_id,
            "widget_title": widget.title,
            "widget_type": widget.widget_type,
            "data_source_config": widget.data_source_config,
            "data": data_payload,
            "display_options": widget.display_options
        }


from ..database import get_db, Session # Import get_db and Session
# Need AnalyticsService and its models for some data fetching logic
from ..models.analytics import PerformanceMetric, AnalyticsPrediction, AnalyticsModel, ROICalculation
from ..services.analytics_service import get_analytics_service, AnalyticsService # Import AnalyticsService components

# Dependency for getting the service
def get_custom_dashboard_service(
    db: Session = Depends(get_db),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> CustomDashboardService:
    return CustomDashboardService(db=db, analytics_service=analytics_service)

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

    async def get_data_for_source(
        self,
        data_source_config: schemas.DashboardWidgetDataSource, # Changed from widget_id
        tenant_id: int,
        # current_user: User, # User might be needed for RBAC or user-specific data sources
    ) -> Any: # Return type will be the data payload itself
        """
        Fetches and processes data for a given data_source_config.
        This method encapsulates the core data fetching logic.
        """
        data_source_type = data_source_config.type
        query_params = data_source_config.query_params or {} # Ensure query_params is a dict

        data_payload: Any = {"error": "Unknown data_source_type or data fetching failed."}
        limit = query_params.get("limit", 50) # Common parameter

        try:
            if data_source_type == "performance_metric_single":
                metric_name = query_params.get("metric_name")
                entity_id = query_params.get("entity_id")
                entity_type = query_params.get("entity_type")

                if metric_name:
                    metrics = self.analytics_service.get_performance_metrics(
                        tenant_id=tenant_id,
                        metric_name=metric_name,
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=1
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
                if metric_name:
                    all_metric_records = self.analytics_service.get_performance_metrics(
                        tenant_id=tenant_id,
                        metric_name=metric_name,
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=query_params.get("history_limit", 30)
                    )
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
                else:
                    model_id = query_params.get("model_id")
                    entity_id = query_params.get("entity_id")
                    entity_type = query_params.get("entity_type")
                    if model_id:
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
                    data_payload = comparisons
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
            # TODO: Add more handlers for other data_source_types

        except HTTPException:
            raise
        except ValueError as ve:
            data_payload = {"error": f"Data fetching error: {str(ve)}"}
        except Exception as e:
            data_payload = {"error": f"An unexpected error occurred: {str(e)}"}

        return data_payload

    # --- Enhanced Data Fetching for Widgets ---
    async def get_widget_data(
        self,
        widget_id: int,
        tenant_id: int,
        user_context: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        refresh_cache: bool = False
    ) -> Dict[str, Any]:
        """
        Enhanced widget data fetching with support for complex scenarios:
        - User context for personalized data
        - Time range filtering
        - Dynamic filters
        - Caching and refresh options
        - Data transformations and aggregations
        - Error handling and fallbacks
        """
        widget = self.get_widget(widget_id, tenant_id)
        if not widget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget configuration not found")

        # Validate widget configuration
        if not isinstance(widget.data_source_config, dict):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid data_source_config format for widget {widget_id}"
            )

        try:
            # Construct DashboardWidgetDataSource from the widget's JSON config
            data_source_config = schemas.DashboardWidgetDataSource(**widget.data_source_config)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid data_source_config for widget {widget_id}: {str(e)}"
            )

        # Apply dynamic parameters and filters
        enhanced_data_source = await self._enhance_data_source_config(
            data_source_config, user_context, time_range, filters
        )

        # Check cache if not refreshing
        cached_data = None
        if not refresh_cache:
            cached_data = await self._get_cached_widget_data(widget_id, enhanced_data_source)

        if cached_data:
            data_payload = cached_data
        else:
            # Fetch fresh data
            data_payload = await self.get_data_for_source(
                data_source_config=enhanced_data_source,
                tenant_id=tenant_id
            )
            
            # Apply post-processing transformations
            data_payload = await self._apply_widget_transformations(
                widget, data_payload, user_context
            )
            
            # Cache the result
            await self._cache_widget_data(widget_id, enhanced_data_source, data_payload)

        # Build comprehensive response
        response = {
            "widget_id": widget_id,
            "widget_title": widget.title,
            "widget_type": widget.widget_type,
            "widget_uuid": widget.widget_uuid,
            "data_source_config": widget.data_source_config,
            "display_options": widget.display_options,
            "data": data_payload,
            "metadata": await self._build_widget_metadata(widget, data_payload, user_context),
            "last_updated": widget.updated_at,
            "cache_info": {
                "from_cache": cached_data is not None,
                "refresh_requested": refresh_cache
            }
        }

        return response

    async def _enhance_data_source_config(
        self,
        data_source_config: schemas.DashboardWidgetDataSource,
        user_context: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> schemas.DashboardWidgetDataSource:
        """
        Enhance data source configuration with dynamic parameters
        """
        enhanced_params = dict(data_source_config.query_params or {})
        
        # Apply time range filters
        if time_range:
            if "start_date" in time_range:
                enhanced_params["start_date"] = time_range["start_date"]
            if "end_date" in time_range:
                enhanced_params["end_date"] = time_range["end_date"]
            if "period" in time_range:
                enhanced_params["period"] = time_range["period"]
        
        # Apply user context
        if user_context:
            if "user_id" in user_context:
                enhanced_params["user_id"] = user_context["user_id"]
            if "department" in user_context:
                enhanced_params["department"] = user_context["department"]
            if "role" in user_context:
                enhanced_params["role"] = user_context["role"]
        
        # Apply additional filters
        if filters:
            enhanced_params.update(filters)
        
        # Create enhanced data source config
        enhanced_config = schemas.DashboardWidgetDataSource(
            type=data_source_config.type,
            query_params=enhanced_params
        )
        
        return enhanced_config

    async def _apply_widget_transformations(
        self,
        widget: DashboardWidget,
        data_payload: Any,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Apply widget-specific data transformations and calculations
        """
        if not isinstance(data_payload, dict) or "error" in data_payload:
            return data_payload
        
        display_options = widget.display_options or {}
        widget_type = widget.widget_type
        
        # Apply transformations based on widget type
        if widget_type == "chart":
            return await self._transform_chart_data(data_payload, display_options)
        elif widget_type == "table":
            return await self._transform_table_data(data_payload, display_options)
        elif widget_type == "metric":
            return await self._transform_metric_data(data_payload, display_options)
        elif widget_type == "gauge":
            return await self._transform_gauge_data(data_payload, display_options)
        elif widget_type == "heatmap":
            return await self._transform_heatmap_data(data_payload, display_options)
        
        return data_payload

    async def _transform_chart_data(self, data: Any, options: Dict[str, Any]) -> Any:
        """Transform data for chart widgets"""
        if isinstance(data, list):
            # Sort data if specified
            if options.get("sort_by"):
                sort_field = options["sort_by"]
                reverse = options.get("sort_desc", False)
                try:
                    data = sorted(data, key=lambda x: x.get(sort_field, 0), reverse=reverse)
                except (TypeError, KeyError):
                    pass  # Keep original order if sorting fails
            
            # Limit data points if specified
            if options.get("max_points"):
                data = data[:options["max_points"]]
        
        return data

    async def _transform_table_data(self, data: Any, options: Dict[str, Any]) -> Any:
        """Transform data for table widgets"""
        if isinstance(data, list):
            # Apply column filtering
            if options.get("visible_columns"):
                visible_cols = options["visible_columns"]
                data = [
                    {k: v for k, v in item.items() if k in visible_cols}
                    for item in data if isinstance(item, dict)
                ]
            
            # Apply pagination
            page = options.get("page", 1)
            page_size = options.get("page_size", 50)
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            
            return {
                "items": data[start_idx:end_idx],
                "total": len(data),
                "page": page,
                "page_size": page_size,
                "total_pages": (len(data) + page_size - 1) // page_size
            }
        
        return data

    async def _transform_metric_data(self, data: Any, options: Dict[str, Any]) -> Any:
        """Transform data for metric widgets"""
        if isinstance(data, dict) and "value" in data:
            # Apply formatting
            if options.get("format"):
                format_type = options["format"]
                value = data["value"]
                
                if format_type == "percentage":
                    data["formatted_value"] = f"{value:.1f}%"
                elif format_type == "currency":
                    currency = options.get("currency", "USD")
                    data["formatted_value"] = f"{currency} {value:,.2f}"
                elif format_type == "number":
                    decimals = options.get("decimals", 0)
                    data["formatted_value"] = f"{value:,.{decimals}f}"
            
            # Add trend indicators
            if "previous_value" in data:
                current = data["value"]
                previous = data["previous_value"]
                if previous != 0:
                    change_percent = ((current - previous) / previous) * 100
                    data["change_percent"] = change_percent
                    data["trend"] = "up" if change_percent > 0 else "down" if change_percent < 0 else "flat"
        
        return data

    async def _transform_gauge_data(self, data: Any, options: Dict[str, Any]) -> Any:
        """Transform data for gauge widgets"""
        if isinstance(data, dict) and "value" in data:
            value = data["value"]
            min_val = options.get("min_value", 0)
            max_val = options.get("max_value", 100)
            
            # Calculate percentage for gauge
            if max_val > min_val:
                percentage = ((value - min_val) / (max_val - min_val)) * 100
                data["percentage"] = max(0, min(100, percentage))
            
            # Add threshold indicators
            thresholds = options.get("thresholds", {})
            if thresholds:
                if value >= thresholds.get("excellent", float('inf')):
                    data["status"] = "excellent"
                elif value >= thresholds.get("good", float('inf')):
                    data["status"] = "good"
                elif value >= thresholds.get("warning", float('inf')):
                    data["status"] = "warning"
                else:
                    data["status"] = "critical"
        
        return data

    async def _transform_heatmap_data(self, data: Any, options: Dict[str, Any]) -> Any:
        """Transform data for heatmap widgets"""
        if isinstance(data, list):
            # Group data for heatmap if needed
            group_by_x = options.get("x_axis_field")
            group_by_y = options.get("y_axis_field")
            value_field = options.get("value_field", "value")
            
            if group_by_x and group_by_y:
                heatmap_data = {}
                for item in data:
                    if isinstance(item, dict):
                        x_val = item.get(group_by_x)
                        y_val = item.get(group_by_y)
                        value = item.get(value_field, 0)
                        
                        if x_val is not None and y_val is not None:
                            if x_val not in heatmap_data:
                                heatmap_data[x_val] = {}
                            heatmap_data[x_val][y_val] = value
                
                return {"heatmap_data": heatmap_data, "original_data": data}
        
        return data

    async def _build_widget_metadata(
        self,
        widget: DashboardWidget,
        data_payload: Any,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Build metadata about the widget and its data
        """
        metadata = {
            "widget_created": widget.created_at,
            "widget_updated": widget.updated_at,
            "data_source_type": widget.data_source_config.get("type") if widget.data_source_config else None,
        }
        
        # Add data statistics
        if isinstance(data_payload, list):
            metadata["data_count"] = len(data_payload)
            metadata["data_type"] = "list"
        elif isinstance(data_payload, dict):
            if "error" in data_payload:
                metadata["has_error"] = True
                metadata["error_message"] = data_payload["error"]
            else:
                metadata["data_type"] = "object"
                metadata["data_keys"] = list(data_payload.keys())
        
        # Add user context info
        if user_context:
            metadata["personalized"] = True
            metadata["user_context_keys"] = list(user_context.keys())
        
        return metadata

    async def _get_cached_widget_data(
        self,
        widget_id: int,
        data_source_config: schemas.DashboardWidgetDataSource
    ) -> Optional[Any]:
        """
        Get cached widget data if available and valid
        TODO: Implement actual caching mechanism (Redis, in-memory, etc.)
        """
        # Placeholder for caching implementation
        return None

    async def _cache_widget_data(
        self,
        widget_id: int,
        data_source_config: schemas.DashboardWidgetDataSource,
        data_payload: Any
    ) -> None:
        """
        Cache widget data for future requests
        TODO: Implement actual caching mechanism (Redis, in-memory, etc.)
        """
        # Placeholder for caching implementation
        pass

    async def get_widget_data_batch(
        self,
        widget_ids: List[int],
        tenant_id: int,
        user_context: Optional[Dict[str, Any]] = None,
        time_range: Optional[Dict[str, Any]] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[int, Dict[str, Any]]:
        """
        Fetch data for multiple widgets in batch for dashboard loading optimization
        """
        results = {}
        
        # TODO: Implement parallel processing for better performance
        for widget_id in widget_ids:
            try:
                widget_data = await self.get_widget_data(
                    widget_id=widget_id,
                    tenant_id=tenant_id,
                    user_context=user_context,
                    time_range=time_range,
                    filters=filters
                )
                results[widget_id] = widget_data
            except Exception as e:
                results[widget_id] = {
                    "widget_id": widget_id,
                    "error": str(e),
                    "data": {"error": f"Failed to load widget data: {str(e)}"}
                }
        
        return results


from ..database import get_db, SessionLocal # Import get_db and SessionLocal
# Need AnalyticsService and its models for some data fetching logic
from ..models.analytics import PerformanceMetric, AnalyticsPrediction, AnalyticsModel, ROICalculation
from ..services.analytics_service import get_analytics_service, AnalyticsService # Import AnalyticsService components

# Dependency for getting the service
def get_custom_dashboard_service(
    db: SessionLocal = Depends(get_db),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> CustomDashboardService:
    return CustomDashboardService(db=db, analytics_service=analytics_service)

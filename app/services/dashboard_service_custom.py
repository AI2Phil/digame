try:
    from fastapi import HTTPException, status, Depends
    FASTAPI_AVAILABLE = True
except ImportError:
    # Fallback for missing FastAPI
    HTTPException = None
    status = None
    Depends = None
    FASTAPI_AVAILABLE = False

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
import uuid

from ..models.dashboard_custom import AnalyticsDashboard, DashboardWidget
from ..schemas import analytics_schemas as schemas # Using the new analytics_schemas
from ..services.analytics_service import AnalyticsService # Import AnalyticsService

class CustomDashboardService:
    def __init__(self, db: Session, analytics_service: AnalyticsService) -> None:
        self.db = db
        self.analytics_service = analytics_service

    # --- AnalyticsDashboard CRUD ---
    def create_dashboard(
        self,
        tenant_id: int,
        user_id: int,
        dashboard_data: schemas.AnalyticsDashboardCreate
    ) -> AnalyticsDashboard:
        # Create dashboard instance
        db_dashboard = AnalyticsDashboard()
        
        # Set attributes using setattr for PyRefly compatibility
        dashboard_dict = dashboard_data.model_dump()
        for key, value in dashboard_dict.items():
            setattr(db_dashboard, key, value)  # type: ignore
        
        setattr(db_dashboard, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_dashboard, 'user_id', user_id)  # type: ignore
        setattr(db_dashboard, 'dashboard_uuid', str(uuid.uuid4()))  # type: ignore
        
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
        if not db_dashboard or getattr(db_dashboard, 'user_id', None) != user_id:
            return None # Or raise HTTPException for permission issues

        update_data = dashboard_update_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_dashboard, key, value)

        self.db.commit()
        self.db.refresh(db_dashboard)
        return db_dashboard

    def delete_dashboard(self, dashboard_id: int, tenant_id: int, user_id: int) -> bool:
        db_dashboard = self.get_dashboard(dashboard_id, tenant_id)
        if not db_dashboard or getattr(db_dashboard, 'user_id', None) != user_id:
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
        # Create widget instance
        db_widget = DashboardWidget()
        
        # Set attributes using setattr for PyRefly compatibility
        widget_dict = widget_data.model_dump()
        for key, value in widget_dict.items():
            setattr(db_widget, key, value)  # type: ignore
        
        setattr(db_widget, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_widget, 'widget_uuid', str(uuid.uuid4()))  # type: ignore
        
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

        update_data = widget_update_data.model_dump(exclude_unset=True)
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
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=1
                    )
                    if metrics:
                        metric_record = metrics[0]
                        data_payload = {
                            "value": getattr(metric_record, 'current_value', 0),
                            "unit": getattr(metric_record, 'measurement_unit', ''),
                            "metric_display_name": getattr(metric_record, 'display_name', ''),
                            "trend": getattr(metric_record, 'trend_direction', 'stable'),
                            "last_updated": getattr(metric_record, 'updated_at', None),
                            "id": getattr(metric_record, 'id', None)
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
                data_payload = [schemas.PerformanceMetricInDB.model_validate(m).model_dump() for m in metrics]

            elif data_source_type == "performance_metric_timeseries":
                metric_name = query_params.get("metric_name")
                entity_id = query_params.get("entity_id")
                entity_type = query_params.get("entity_type")
                if metric_name:
                    all_metric_records = self.analytics_service.get_performance_metrics(
                        tenant_id=tenant_id,
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=query_params.get("history_limit", 30)
                    )
                    data_payload = [
                        {
                            "timestamp": getattr(r, 'measurement_date', None) or getattr(r, 'period_end', None),
                            "value": getattr(r, 'current_value', 0),
                            "unit": getattr(r, 'measurement_unit', '')
                        }
                        for r in sorted(all_metric_records, key=lambda x: getattr(x, 'measurement_date', None) or getattr(x, 'period_end', None) or datetime.min)
                        if getattr(r, 'measurement_date', None) or getattr(r, 'period_end', None)
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
                        data_payload = schemas.AnalyticsPredictionInDB.model_validate(prediction_record).model_dump()
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
                            data_payload = schemas.AnalyticsPredictionInDB.model_validate(predictions[0]).model_dump()
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
                data_payload = [schemas.AnalyticsPredictionInDB.model_validate(p).model_dump() for p in predictions]

            elif data_source_type == "roi_calculation_detail":
                calculation_id = query_params.get("calculation_id")
                if calculation_id:
                    calculation = self.analytics_service.get_roi_calculation_by_id(
                        calculation_id=calculation_id, tenant_id=tenant_id
                    )
                    if calculation:
                        data_payload = schemas.ROICalculationInDB.model_validate(calculation).model_dump()
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
                data_payload = [schemas.ROICalculationInDB.model_validate(c).model_dump() for c in calculations]

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
                data_payload = [schemas.AnalyticsModelInDB.model_validate(m).model_dump() for m in models]

            # --- New Workflow-related Data Sources ---
            elif data_source_type == "workflow_instance_summary":
                instance_id = query_params.get("workflow_instance_id")
                if instance_id:
                    # Assuming WorkflowInstance is importable and queryable here
                    # This might require adding WorkflowInstance to __init__.py of models
                    # and ensuring the DB session can access it.
                    from ..models.workflow_automation import WorkflowInstance # Direct import

                    wf_instance = self.db.query(WorkflowInstance).filter(
                        WorkflowInstance.id == instance_id,
                        WorkflowInstance.tenant_id == tenant_id  # Ensure tenant isolation
                    ).first()

                    if wf_instance:
                        # Manually construct a dictionary using safe attribute access
                        execution_start = getattr(wf_instance, 'execution_start_time', None)
                        execution_end = getattr(wf_instance, 'execution_end_time', None)
                        created_at = getattr(wf_instance, 'created_at', None)
                        updated_at = getattr(wf_instance, 'updated_at', None)
                        
                        data_payload = {
                            "id": getattr(wf_instance, 'id', None),
                            "name": getattr(wf_instance, 'name', ''),
                            "status": getattr(wf_instance, 'status', ''),
                            "description": getattr(wf_instance, 'description', ''),
                            "input_data": getattr(wf_instance, 'input_data', {}),
                            "output_data": getattr(wf_instance, 'output_data', {}),
                            "context_data": getattr(wf_instance, 'context_data', {}),
                            "current_step_id": getattr(wf_instance, 'current_step_id', None),
                            "progress_percentage": getattr(wf_instance, 'progress_percentage', 0),
                            "steps_completed": getattr(wf_instance, 'steps_completed', 0),
                            "steps_total": getattr(wf_instance, 'steps_total', 0),
                            "execution_start_time": execution_start.isoformat() if execution_start else None,
                            "execution_end_time": execution_end.isoformat() if execution_end else None,
                            "execution_duration": getattr(wf_instance, 'execution_duration', 0),
                            "error_count": getattr(wf_instance, 'error_count', 0),
                            "last_error": getattr(wf_instance, 'last_error', None),
                            "triggered_by": getattr(wf_instance, 'triggered_by', None),
                            "priority": getattr(wf_instance, 'priority', 'medium'),
                            "created_at": created_at.isoformat() if created_at else None,
                            "updated_at": updated_at.isoformat() if updated_at else None,
                            "template_id": getattr(wf_instance, 'template_id', None),
                        }
                    else:
                        data_payload = {"error": f"Workflow instance with ID {instance_id} not found for tenant {tenant_id}."}
                else:
                    data_payload = {"error": "Missing workflow_instance_id for workflow_instance_summary data source."}

            elif data_source_type == "workflow_instance_steps":
                instance_id = query_params.get("workflow_instance_id")
                if instance_id:
                    from ..models.workflow_automation import WorkflowStepExecution # Direct import
                    steps = self.db.query(WorkflowStepExecution).filter(
                        WorkflowStepExecution.workflow_instance_id == instance_id
                    ).order_by(WorkflowStepExecution.execution_order).all()

                    # Manually construct list of dicts using safe attribute access
                    data_payload = []
                    for step in steps:
                        start_time = getattr(step, 'start_time', None)
                        end_time = getattr(step, 'end_time', None)
                        due_date = getattr(step, 'due_date', None)
                        
                        step_data = {
                            "id": getattr(step, 'id', None),
                            "step_id": getattr(step, 'step_id', None),
                            "step_name": getattr(step, 'step_name', ''),
                            "step_type": getattr(step, 'step_type', ''),
                            "status": getattr(step, 'status', ''),
                            "execution_order": getattr(step, 'execution_order', 0),
                            "start_time": start_time.isoformat() if start_time else None,
                            "end_time": end_time.isoformat() if end_time else None,
                            "execution_duration": getattr(step, 'execution_duration', 0),
                            "error_message": getattr(step, 'error_message', None),
                            "input_data": getattr(step, 'input_data', {}),
                            "output_data": getattr(step, 'output_data', {}),
                            "assigned_to": getattr(step, 'assigned_to', None),
                            "due_date": due_date.isoformat() if due_date else None,
                        }
                        data_payload.append(step_data)
                    if not data_payload:
                        data_payload = {"message": f"No steps found for workflow instance {instance_id}."}
                else:
                    data_payload = {"error": "Missing workflow_instance_id for workflow_instance_steps data source."}

            # TODO: Add more handlers for other data_source_types like workflow_template_performance

        except ValueError as ve:
            data_payload = {"error": f"Data fetching error: {str(ve)}"}
        except Exception as e:
            # Check if it's an HTTPException first
            if HTTPException and isinstance(e, type(HTTPException)):
                raise
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
            if HTTPException and status:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget configuration not found")
            else:
                raise ValueError("Widget configuration not found")

        # Validate widget configuration
        data_source_config = getattr(widget, 'data_source_config', {})
        if not isinstance(data_source_config, dict):
            if HTTPException and status:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Invalid data_source_config format for widget {widget_id}"
                )
            else:
                raise ValueError(f"Invalid data_source_config format for widget {widget_id}")

        try:
            # Construct DashboardWidgetDataSource from the widget's JSON config
            widget_config = getattr(widget, 'data_source_config', {})
            data_source_config = schemas.DashboardWidgetDataSource(**widget_config)
        except Exception as e:
            if HTTPException and status:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Invalid data_source_config for widget {widget_id}: {str(e)}"
                )
            else:
                raise ValueError(f"Invalid data_source_config for widget {widget_id}: {str(e)}")

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

        # Build comprehensive response using safe attribute access
        response = {
            "widget_id": widget_id,
            "widget_title": getattr(widget, 'title', ''),
            "widget_type": getattr(widget, 'widget_type', ''),
            "widget_uuid": getattr(widget, 'widget_uuid', ''),
            "data_source_config": getattr(widget, 'data_source_config', {}),
            "display_options": getattr(widget, 'display_options', {}),
            "data": data_payload,
            "metadata": await self._build_widget_metadata(widget, data_payload, user_context),
            "last_updated": getattr(widget, 'updated_at', None),
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
        
        # Create enhanced data source config by copying the original and updating params
        enhanced_config = data_source_config
        if hasattr(enhanced_config, 'query_params'):
            setattr(enhanced_config, 'query_params', enhanced_params)  # type: ignore
        
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
        
        display_options = getattr(widget, 'display_options', {}) or {}
        widget_type = getattr(widget, 'widget_type', '')
        
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
            "widget_created": getattr(widget, 'created_at', None),
            "widget_updated": getattr(widget, 'updated_at', None),
            "data_source_type": getattr(widget, 'data_source_config', {}).get("type") if getattr(widget, 'data_source_config', None) else None,
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
from datetime import datetime

# Dependency for getting the service
def get_custom_dashboard_service(
    db: Optional[Session] = None,
    analytics_service: Optional[AnalyticsService] = None
) -> CustomDashboardService:
    if db is None:
        # Fallback when FastAPI is not available
        from ..database import SessionLocal
        db = SessionLocal()
    
    if analytics_service is None:
        from ..services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
    
    # Ensure db is not None before creating service
    if db is None:
        raise ValueError("Database session is required")
    
    return CustomDashboardService(db=db, analytics_service=analytics_service)

# FastAPI dependency version (when FastAPI is available)
def get_custom_dashboard_service_fastapi():
    if FASTAPI_AVAILABLE and Depends:
        def _get_service(
            db: Session = Depends(get_db),  # type: ignore
            analytics_service: AnalyticsService = Depends(get_analytics_service)  # type: ignore
        ) -> CustomDashboardService:
            return CustomDashboardService(db=db, analytics_service=analytics_service)
        return _get_service
    else:
        return get_custom_dashboard_service

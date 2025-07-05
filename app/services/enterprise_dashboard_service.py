"""
Enterprise Dashboard service for unified enterprise feature management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone
import json
import hashlib
from ..models.enterprise_dashboard import (
    EnterpriseDashboard, DashboardWidget, EnterpriseMetric, 
    DashboardAlert, EnterpriseFeatureUsage, DashboardExport,
    DashboardWidgetType, DashboardLayout
)
from ..models.tenant import Tenant
from ..models.user import User
from ..database import get_db


class EnterpriseDashboardService:
    """Service for managing enterprise dashboards and unified feature access"""

    def __init__(self, db: Session):
        self.db = db

    # Dashboard Management
    async def create_dashboard(
        self, 
        tenant_id: int, 
        created_by: int, 
        dashboard_data: Dict[str, Any]
    ) -> EnterpriseDashboard:
        """Create a new enterprise dashboard"""
        
        dashboard = EnterpriseDashboard()  # type: ignore
        setattr(dashboard, 'tenant_id', tenant_id)  # type: ignore
        setattr(dashboard, 'created_by', created_by)  # type: ignore
        setattr(dashboard, 'name', dashboard_data["name"])  # type: ignore
        setattr(dashboard, 'description', dashboard_data.get("description"))  # type: ignore
        setattr(dashboard, 'dashboard_type', dashboard_data.get("dashboard_type", "enterprise"))  # type: ignore
        setattr(dashboard, 'layout_type', dashboard_data.get("layout_type", "grid"))  # type: ignore
        setattr(dashboard, 'layout_config', dashboard_data.get("layout_config", {}))  # type: ignore
        setattr(dashboard, 'is_default', dashboard_data.get("is_default", False))  # type: ignore
        setattr(dashboard, 'is_public', dashboard_data.get("is_public", False))  # type: ignore
        setattr(dashboard, 'auto_refresh', dashboard_data.get("auto_refresh", True))  # type: ignore
        setattr(dashboard, 'refresh_interval', dashboard_data.get("refresh_interval", 300))  # type: ignore
        setattr(dashboard, 'allowed_roles', dashboard_data.get("allowed_roles", []))  # type: ignore
        setattr(dashboard, 'allowed_users', dashboard_data.get("allowed_users", []))  # type: ignore
        setattr(dashboard, 'theme', dashboard_data.get("theme", "light"))  # type: ignore
        setattr(dashboard, 'color_scheme', dashboard_data.get("color_scheme", {}))  # type: ignore
        setattr(dashboard, 'custom_css', dashboard_data.get("custom_css"))  # type: ignore
        
        self.db.add(dashboard)
        self.db.commit()
        self.db.refresh(dashboard)
        
        # Create default widgets if specified
        if dashboard_data.get("create_default_widgets", True):
            dashboard_id = getattr(dashboard, 'id', None)  # type: ignore
            if dashboard_id:
                await self._create_default_widgets(dashboard_id)
        
        return dashboard

    async def _create_default_widgets(self, dashboard_id: int) -> None:
        """Create default widgets for a new dashboard"""
        
        default_widgets = [
            {
                "widget_id": "enterprise_overview",
                "widget_name": "Enterprise Overview",
                "widget_type": "metric",
                "data_source": "enterprise_metrics",
                "query_config": {"metric_category": "overview"},
                "display_config": {"chart_type": "summary_cards"},
                "position_x": 0, "position_y": 0, "width": 12, "height": 3
            },
            {
                "widget_id": "security_status",
                "widget_name": "Security Status",
                "widget_type": "security",
                "data_source": "security",
                "query_config": {"view": "dashboard"},
                "display_config": {"chart_type": "security_overview"},
                "position_x": 0, "position_y": 3, "width": 6, "height": 4
            },
            {
                "widget_id": "workflow_performance",
                "widget_name": "Workflow Performance",
                "widget_type": "workflow",
                "data_source": "workflow_automation",
                "query_config": {"view": "performance"},
                "display_config": {"chart_type": "workflow_metrics"},
                "position_x": 6, "position_y": 3, "width": 6, "height": 4
            },
            {
                "widget_id": "integration_health",
                "widget_name": "Integration Health",
                "widget_type": "integration",
                "data_source": "integration",
                "query_config": {"view": "health"},
                "display_config": {"chart_type": "integration_status"},
                "position_x": 0, "position_y": 7, "width": 6, "height": 4
            },
            {
                "widget_id": "analytics_insights",
                "widget_name": "Analytics Insights",
                "widget_type": "analytics",
                "data_source": "analytics",
                "query_config": {"view": "insights"},
                "display_config": {"chart_type": "analytics_summary"},
                "position_x": 6, "position_y": 7, "width": 6, "height": 4
            },
            {
                "widget_id": "market_intelligence",
                "widget_name": "Market Intelligence",
                "widget_type": "market_intelligence",
                "data_source": "market_intelligence",
                "query_config": {"view": "trends"},
                "display_config": {"chart_type": "market_trends"},
                "position_x": 0, "position_y": 11, "width": 12, "height": 4
            }
        ]
        
        for widget_data in default_widgets:
            widget = DashboardWidget()  # type: ignore
            setattr(widget, 'dashboard_id', dashboard_id)  # type: ignore
            for key, value in widget_data.items():
                setattr(widget, key, value)  # type: ignore
            self.db.add(widget)
        
        self.db.commit()

    async def get_dashboard(self, dashboard_id: int, tenant_id: int) -> Optional[EnterpriseDashboard]:
        """Get a dashboard by ID"""
        return self.db.query(EnterpriseDashboard).filter(
            EnterpriseDashboard.id == dashboard_id,
            EnterpriseDashboard.tenant_id == tenant_id
        ).first()

    async def list_dashboards(
        self, 
        tenant_id: int, 
        user_id: Optional[int] = None,
        dashboard_type: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[EnterpriseDashboard]:
        """List dashboards for a tenant"""
        
        query = self.db.query(EnterpriseDashboard).filter(
            EnterpriseDashboard.tenant_id == tenant_id
        )
        
        if dashboard_type:
            query = query.filter(EnterpriseDashboard.dashboard_type == dashboard_type)
        
        # Apply access control
        if user_id:
            # Use individual filters instead of or_() for PyRefly compatibility
            public_filter = EnterpriseDashboard.is_public == True
            created_filter = EnterpriseDashboard.created_by == user_id
            allowed_filter = EnterpriseDashboard.allowed_users.contains([user_id])
            
            query = query.filter(
                public_filter | created_filter | allowed_filter  # type: ignore
            )
        
        return query.order_by(desc(EnterpriseDashboard.created_at)).offset(skip).limit(limit).all()

    async def update_dashboard(
        self, 
        dashboard_id: int, 
        tenant_id: int, 
        update_data: Dict[str, Any]
    ) -> Optional[EnterpriseDashboard]:
        """Update a dashboard"""
        
        dashboard = await self.get_dashboard(dashboard_id, tenant_id)
        if not dashboard:
            return None
        
        for key, value in update_data.items():
            if hasattr(dashboard, key):
                setattr(dashboard, key, value)
        
        dashboard.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(dashboard)
        
        return dashboard

    async def delete_dashboard(self, dashboard_id: int, tenant_id: int) -> bool:
        """Delete a dashboard"""
        
        dashboard = await self.get_dashboard(dashboard_id, tenant_id)
        if not dashboard:
            return False
        
        self.db.delete(dashboard)
        self.db.commit()
        return True

    # Widget Management
    async def add_widget(
        self, 
        dashboard_id: int, 
        widget_data: Dict[str, Any]
    ) -> DashboardWidget:
        """Add a widget to a dashboard"""
        
        widget = DashboardWidget()  # type: ignore
        setattr(widget, 'dashboard_id', dashboard_id)  # type: ignore
        setattr(widget, 'widget_id', widget_data["widget_id"])  # type: ignore
        setattr(widget, 'widget_name', widget_data["widget_name"])  # type: ignore
        setattr(widget, 'widget_type', widget_data["widget_type"])  # type: ignore
        setattr(widget, 'data_source', widget_data["data_source"])  # type: ignore
        setattr(widget, 'query_config', widget_data.get("query_config", {}))  # type: ignore
        setattr(widget, 'display_config', widget_data.get("display_config", {}))  # type: ignore
        setattr(widget, 'position_x', widget_data.get("position_x", 0))  # type: ignore
        setattr(widget, 'position_y', widget_data.get("position_y", 0))  # type: ignore
        setattr(widget, 'width', widget_data.get("width", 4))  # type: ignore
        setattr(widget, 'height', widget_data.get("height", 3))  # type: ignore
        setattr(widget, 'z_index', widget_data.get("z_index", 1))  # type: ignore
        setattr(widget, 'title', widget_data.get("title"))  # type: ignore
        setattr(widget, 'subtitle', widget_data.get("subtitle"))  # type: ignore
        setattr(widget, 'is_visible', widget_data.get("is_visible", True))  # type: ignore
        setattr(widget, 'is_resizable', widget_data.get("is_resizable", True))  # type: ignore
        setattr(widget, 'is_movable', widget_data.get("is_movable", True))  # type: ignore
        setattr(widget, 'auto_refresh', widget_data.get("auto_refresh", True))  # type: ignore
        setattr(widget, 'refresh_interval', widget_data.get("refresh_interval", 300))  # type: ignore
        
        self.db.add(widget)
        self.db.commit()
        self.db.refresh(widget)
        
        return widget

    async def update_widget(
        self, 
        widget_id: int, 
        update_data: Dict[str, Any]
    ) -> Optional[DashboardWidget]:
        """Update a widget"""
        
        widget = self.db.query(DashboardWidget).filter(DashboardWidget.id == widget_id).first()
        if not widget:
            return None
        
        for key, value in update_data.items():
            if hasattr(widget, key):
                setattr(widget, key, value)
        
        setattr(widget, 'updated_at', datetime.now(timezone.utc))  # type: ignore
        self.db.commit()
        self.db.refresh(widget)
        
        return widget

    async def get_widget_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get data for a specific widget"""
        
        try:
            # Route to appropriate data source
            if widget.data_source == "enterprise_metrics":
                return await self._get_enterprise_metrics_data(widget, tenant_id)
            elif widget.data_source == "security":
                return await self._get_security_data(widget, tenant_id)
            elif widget.data_source == "workflow_automation":
                return await self._get_workflow_data(widget, tenant_id)
            elif widget.data_source == "integration":
                return await self._get_integration_data(widget, tenant_id)
            elif widget.data_source == "analytics":
                return await self._get_analytics_data(widget, tenant_id)
            elif widget.data_source == "market_intelligence":
                return await self._get_market_intelligence_data(widget, tenant_id)
            elif widget.data_source == "reporting":
                return await self._get_reporting_data(widget, tenant_id)
            else:
                return {"error": "Unknown data source"}
        
        except Exception as e:
            # Update widget error tracking
            current_error_count = getattr(widget, 'error_count', 0)  # type: ignore
            setattr(widget, 'error_count', current_error_count + 1)  # type: ignore
            setattr(widget, 'last_error', str(e))  # type: ignore
            self.db.commit()
            
            return {"error": str(e)}

    async def _get_enterprise_metrics_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get enterprise metrics data"""
        
        # Get recent metrics
        metrics = self.db.query(EnterpriseMetric).filter(
            EnterpriseMetric.tenant_id == tenant_id,
            EnterpriseMetric.period_start >= datetime.now(timezone.utc) - timedelta(days=30)
        ).order_by(desc(EnterpriseMetric.period_start)).limit(100).all()
        
        # Aggregate by category
        categories = {}
        for metric in metrics:
            metric_category = getattr(metric, 'metric_category', 'unknown')  # type: ignore
            if metric_category not in categories:
                categories[metric_category] = []
            categories[metric_category].append({
                "name": getattr(metric, 'metric_name', 'Unknown'),  # type: ignore
                "value": getattr(metric, 'value', 0),  # type: ignore
                "unit": getattr(metric, 'unit', ''),  # type: ignore
                "status": getattr(metric, 'status', 'unknown'),  # type: ignore
                "trend": getattr(metric, 'trend', 'stable'),  # type: ignore
                "change_percentage": getattr(metric, 'change_percentage', 0)  # type: ignore
            })
        
        return {
            "categories": categories,
            "total_metrics": len(metrics),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    async def _get_security_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get security dashboard data"""
        
        # This would integrate with the security service
        # For now, return mock data structure
        return {
            "security_score": 85,
            "active_alerts": 3,
            "resolved_incidents": 12,
            "policy_compliance": 92,
            "recent_events": [],
            "risk_level": "medium",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    async def _get_workflow_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get workflow automation data"""
        
        # This would integrate with the workflow automation service
        return {
            "active_workflows": 15,
            "completed_today": 42,
            "success_rate": 94.5,
            "avg_execution_time": 120,
            "automation_savings": 8.5,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    async def _get_integration_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get integration health data"""
        
        # This would integrate with the integration service
        return {
            "active_connections": 8,
            "sync_success_rate": 98.2,
            "data_transferred_mb": 1250,
            "api_calls_today": 15420,
            "last_sync": datetime.now(timezone.utc).isoformat(),
            "health_status": "healthy"
        }

    async def _get_analytics_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get analytics insights data"""
        
        # This would integrate with the analytics service
        return {
            "total_users": 245,
            "active_users_today": 89,
            "productivity_score": 87.3,
            "roi_percentage": 156.7,
            "predictions_accuracy": 91.2,
            "insights_generated": 23
        }

    async def _get_market_intelligence_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get market intelligence data"""
        
        # This would integrate with the market intelligence service
        return {
            "market_trends": 12,
            "competitive_alerts": 3,
            "industry_score": 78.5,
            "growth_opportunities": 5,
            "threat_level": "low",
            "last_analysis": datetime.now(timezone.utc).isoformat()
        }

    async def _get_reporting_data(
        self, 
        widget: DashboardWidget, 
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get reporting system data"""
        
        # This would integrate with the reporting service
        return {
            "reports_generated": 156,
            "scheduled_reports": 23,
            "export_success_rate": 99.1,
            "storage_used_gb": 12.8,
            "active_subscriptions": 45,
            "last_report": datetime.now(timezone.utc).isoformat()
        }

    # Metrics Management
    async def record_metric(
        self, 
        tenant_id: int, 
        metric_data: Dict[str, Any]
    ) -> EnterpriseMetric:
        """Record an enterprise metric"""
        
        metric = EnterpriseMetric()  # type: ignore
        setattr(metric, 'tenant_id', tenant_id)  # type: ignore
        setattr(metric, 'metric_name', metric_data["metric_name"])  # type: ignore
        setattr(metric, 'metric_category', metric_data["metric_category"])  # type: ignore
        setattr(metric, 'metric_type', metric_data["metric_type"])  # type: ignore
        setattr(metric, 'value', metric_data["value"])  # type: ignore
        setattr(metric, 'previous_value', metric_data.get("previous_value"))  # type: ignore
        setattr(metric, 'target_value', metric_data.get("target_value"))  # type: ignore
        setattr(metric, 'threshold_warning', metric_data.get("threshold_warning"))  # type: ignore
        setattr(metric, 'threshold_critical', metric_data.get("threshold_critical"))  # type: ignore
        setattr(metric, 'unit', metric_data.get("unit"))  # type: ignore
        setattr(metric, 'description', metric_data.get("description"))  # type: ignore
        setattr(metric, 'calculation_method', metric_data.get("calculation_method"))  # type: ignore
        setattr(metric, 'period_start', metric_data["period_start"])  # type: ignore
        setattr(metric, 'period_end', metric_data["period_end"])  # type: ignore
        setattr(metric, 'granularity', metric_data.get("granularity", "daily"))  # type: ignore
        setattr(metric, 'status', self._calculate_metric_status(metric_data))  # type: ignore
        setattr(metric, 'trend', self._calculate_trend(metric_data))  # type: ignore
        setattr(metric, 'change_percentage', self._calculate_change_percentage(metric_data))  # type: ignore
        setattr(metric, 'confidence_score', metric_data.get("confidence_score", 1.0))  # type: ignore
        setattr(metric, 'data_completeness', metric_data.get("data_completeness", 1.0))  # type: ignore
        
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        
        # Check for alerts
        await self._check_metric_alerts(metric)
        
        return metric

    def _calculate_metric_status(self, metric_data: Dict[str, Any]) -> str:
        """Calculate metric status based on thresholds"""
        
        value = metric_data["value"]
        warning = metric_data.get("threshold_warning")
        critical = metric_data.get("threshold_critical")
        
        if critical and value >= critical:
            return "critical"
        elif warning and value >= warning:
            return "warning"
        else:
            return "normal"

    def _calculate_trend(self, metric_data: Dict[str, Any]) -> Optional[str]:
        """Calculate trend based on previous value"""
        
        current = metric_data["value"]
        previous = metric_data.get("previous_value")
        
        if previous is None:
            return None
        
        if current > previous:
            return "increasing"
        elif current < previous:
            return "decreasing"
        else:
            return "stable"

    def _calculate_change_percentage(self, metric_data: Dict[str, Any]) -> Optional[float]:
        """Calculate percentage change from previous value"""
        
        current = metric_data["value"]
        previous = metric_data.get("previous_value")
        
        if previous is None or previous == 0:
            return None
        
        return ((current - previous) / previous) * 100

    async def _check_metric_alerts(self, metric: EnterpriseMetric) -> None:
        """Check if metric triggers any alerts"""
        
        metric_status = getattr(metric, 'status', 'normal')  # type: ignore
        if metric_status in ["warning", "critical"]:
            alert_data = {
                "alert_name": f"Metric Alert: {getattr(metric, 'metric_name', 'Unknown')}",  # type: ignore
                "alert_type": "metric",
                "severity": metric_status,
                "condition": "threshold_exceeded",
                "threshold_value": getattr(metric, 'threshold_critical', 0) if metric_status == "critical" else getattr(metric, 'threshold_warning', 0),  # type: ignore
                "message": f"Metric {getattr(metric, 'metric_name', 'Unknown')} has exceeded {metric_status} threshold",  # type: ignore
                "description": f"Current value: {getattr(metric, 'value', 0)} {getattr(metric, 'unit', '') or ''}",  # type: ignore
                "recommended_action": f"Review {getattr(metric, 'metric_category', 'unknown')} performance and take corrective action"  # type: ignore
            }
            
            tenant_id = getattr(metric, 'tenant_id', None)  # type: ignore
            if tenant_id:
                await self.create_alert(tenant_id, alert_data)

    # Alert Management
    async def create_alert(
        self, 
        tenant_id: int, 
        alert_data: Dict[str, Any]
    ) -> DashboardAlert:
        """Create a dashboard alert"""
        
        alert = DashboardAlert()  # type: ignore
        setattr(alert, 'tenant_id', tenant_id)  # type: ignore
        setattr(alert, 'alert_name', alert_data["alert_name"])  # type: ignore
        setattr(alert, 'alert_type', alert_data["alert_type"])  # type: ignore
        setattr(alert, 'severity', alert_data["severity"])  # type: ignore
        setattr(alert, 'condition', alert_data["condition"])  # type: ignore
        setattr(alert, 'threshold_value', alert_data["threshold_value"])  # type: ignore
        setattr(alert, 'message', alert_data["message"])  # type: ignore
        setattr(alert, 'description', alert_data.get("description"))  # type: ignore
        setattr(alert, 'recommended_action', alert_data.get("recommended_action"))  # type: ignore
        setattr(alert, 'notification_channels', alert_data.get("notification_channels", []))  # type: ignore
        setattr(alert, 'notification_frequency', alert_data.get("notification_frequency", "immediate"))  # type: ignore
        setattr(alert, 'suppress_duration', alert_data.get("suppress_duration", 3600))  # type: ignore
        setattr(alert, 'created_by', alert_data.get("created_by", 1))  # type: ignore
        
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        
        return alert

    async def get_active_alerts(
        self, 
        tenant_id: int, 
        severity: Optional[str] = None
    ) -> List[DashboardAlert]:
        """Get active alerts for a tenant"""
        
        query = self.db.query(DashboardAlert).filter(
            DashboardAlert.tenant_id == tenant_id,
            DashboardAlert.is_active == True,
            DashboardAlert.is_acknowledged == False
        )
        
        if severity:
            query = query.filter(DashboardAlert.severity == severity)
        
        return query.order_by(desc(DashboardAlert.created_at)).all()

    # Feature Usage Tracking
    async def track_feature_usage(
        self, 
        tenant_id: int, 
        user_id: Optional[int], 
        usage_data: Dict[str, Any]
    ) -> EnterpriseFeatureUsage:
        """Track enterprise feature usage"""
        
        usage = EnterpriseFeatureUsage()  # type: ignore
        setattr(usage, 'tenant_id', tenant_id)  # type: ignore
        setattr(usage, 'user_id', user_id)  # type: ignore
        setattr(usage, 'feature_name', usage_data["feature_name"])  # type: ignore
        setattr(usage, 'feature_category', usage_data["feature_category"])  # type: ignore
        setattr(usage, 'action', usage_data["action"])  # type: ignore
        setattr(usage, 'session_id', usage_data.get("session_id"))  # type: ignore
        setattr(usage, 'duration_seconds', usage_data.get("duration_seconds"))  # type: ignore
        setattr(usage, 'resource_consumption', usage_data.get("resource_consumption", {}))  # type: ignore
        setattr(usage, 'ip_address', usage_data.get("ip_address"))  # type: ignore
        setattr(usage, 'user_agent', usage_data.get("user_agent"))  # type: ignore
        setattr(usage, 'referrer', usage_data.get("referrer"))  # type: ignore
        setattr(usage, 'response_time_ms', usage_data.get("response_time_ms"))  # type: ignore
        setattr(usage, 'success', usage_data.get("success", True))  # type: ignore
        setattr(usage, 'error_message', usage_data.get("error_message"))  # type: ignore
        setattr(usage, 'business_value', usage_data.get("business_value"))  # type: ignore
        setattr(usage, 'cost_center', usage_data.get("cost_center"))  # type: ignore
        setattr(usage, 'project_code', usage_data.get("project_code"))  # type: ignore
        
        self.db.add(usage)
        self.db.commit()
        self.db.refresh(usage)
        
        return usage

    # Dashboard Analytics
    async def get_dashboard_analytics(
        self, 
        tenant_id: int, 
        days: int = 30
    ) -> Dict[str, Any]:
        """Get dashboard usage analytics"""
        
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Feature usage statistics
        usage_stats = self.db.query(
            EnterpriseFeatureUsage.feature_category,
            func.count(EnterpriseFeatureUsage.id).label("usage_count"),
            func.avg(EnterpriseFeatureUsage.duration_seconds).label("avg_duration"),
            func.sum(EnterpriseFeatureUsage.business_value).label("total_value")
        ).filter(
            EnterpriseFeatureUsage.tenant_id == tenant_id,
            EnterpriseFeatureUsage.timestamp >= start_date
        ).group_by(EnterpriseFeatureUsage.feature_category).all()
        
        # Dashboard view statistics
        dashboard_stats = self.db.query(
            EnterpriseDashboard.dashboard_type,
            func.sum(EnterpriseDashboard.view_count).label("total_views")
        ).filter(
            EnterpriseDashboard.tenant_id == tenant_id
        ).group_by(EnterpriseDashboard.dashboard_type).all()
        
        # Alert statistics
        alert_stats = self.db.query(
            DashboardAlert.severity,
            func.count(DashboardAlert.id).label("alert_count")
        ).filter(
            DashboardAlert.tenant_id == tenant_id,
            DashboardAlert.created_at >= start_date
        ).group_by(DashboardAlert.severity).all()
        
        return {
            "feature_usage": [
                {
                    "category": stat.feature_category,
                    "usage_count": stat.usage_count,
                    "avg_duration": float(stat.avg_duration or 0),
                    "total_value": float(stat.total_value or 0)
                }
                for stat in usage_stats
            ],
            "dashboard_views": [
                {
                    "type": stat.dashboard_type,
                    "total_views": stat.total_views
                }
                for stat in dashboard_stats
            ],
            "alerts": [
                {
                    "severity": stat.severity,
                    "count": stat.alert_count
                }
                for stat in alert_stats
            ],
            "period_days": days,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    # Export Management
    async def create_export(
        self, 
        tenant_id: int, 
        dashboard_id: int, 
        created_by: int, 
        export_data: Dict[str, Any]
    ) -> DashboardExport:
        """Create a dashboard export"""
        
        export = DashboardExport()  # type: ignore
        setattr(export, 'tenant_id', tenant_id)  # type: ignore
        setattr(export, 'dashboard_id', dashboard_id)  # type: ignore
        setattr(export, 'created_by', created_by)  # type: ignore
        setattr(export, 'export_name', export_data["export_name"])  # type: ignore
        setattr(export, 'export_format', export_data["export_format"])  # type: ignore
        setattr(export, 'export_scope', export_data.get("export_scope", "full"))  # type: ignore
        setattr(export, 'include_charts', export_data.get("include_charts", True))  # type: ignore
        setattr(export, 'include_data', export_data.get("include_data", True))  # type: ignore
        setattr(export, 'include_metadata', export_data.get("include_metadata", False))  # type: ignore
        setattr(export, 'page_orientation', export_data.get("page_orientation", "landscape"))  # type: ignore
        setattr(export, 'is_scheduled', export_data.get("is_scheduled", False))  # type: ignore
        setattr(export, 'schedule_cron', export_data.get("schedule_cron"))  # type: ignore
        setattr(export, 'next_execution', export_data.get("next_execution"))  # type: ignore
        setattr(export, 'is_public', export_data.get("is_public", False))  # type: ignore
        setattr(export, 'expires_at', export_data.get("expires_at"))  # type: ignore
        
        self.db.add(export)
        self.db.commit()
        self.db.refresh(export)
        
        return export

    async def get_enterprise_summary(self, tenant_id: int) -> Dict[str, Any]:
        """Get enterprise-wide summary statistics"""
        
        # Get counts of various enterprise features
        dashboard_count = self.db.query(EnterpriseDashboard).filter(
            EnterpriseDashboard.tenant_id == tenant_id
        ).count()
        
        active_alerts = self.db.query(DashboardAlert).filter(
            DashboardAlert.tenant_id == tenant_id,
            DashboardAlert.is_active == True,
            DashboardAlert.is_acknowledged == False
        ).count()
        
        # Recent feature usage
        recent_usage = self.db.query(func.count(EnterpriseFeatureUsage.id)).filter(
            EnterpriseFeatureUsage.tenant_id == tenant_id,
            EnterpriseFeatureUsage.timestamp >= datetime.now(timezone.utc) - timedelta(hours=24)
        ).scalar()
        
        return {
            "tenant_id": tenant_id,
            "dashboards": dashboard_count,
            "active_alerts": active_alerts,
            "usage_24h": recent_usage or 0,
            "enterprise_health": "healthy" if active_alerts < 5 else "warning",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
"""
Enterprise Dashboard service for unified enterprise feature management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
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
        
        dashboard = EnterpriseDashboard(
            tenant_id=tenant_id,
            created_by=created_by,
            name=dashboard_data["name"],
            description=dashboard_data.get("description"),
            dashboard_type=dashboard_data.get("dashboard_type", "enterprise"),
            layout_type=dashboard_data.get("layout_type", "grid"),
            layout_config=dashboard_data.get("layout_config", {}),
            is_default=dashboard_data.get("is_default", False),
            is_public=dashboard_data.get("is_public", False),
            auto_refresh=dashboard_data.get("auto_refresh", True),
            refresh_interval=dashboard_data.get("refresh_interval", 300),
            allowed_roles=dashboard_data.get("allowed_roles", []),
            allowed_users=dashboard_data.get("allowed_users", []),
            theme=dashboard_data.get("theme", "light"),
            color_scheme=dashboard_data.get("color_scheme", {}),
            custom_css=dashboard_data.get("custom_css")
        )
        
        self.db.add(dashboard)
        self.db.commit()
        self.db.refresh(dashboard)
        
        # Create default widgets if specified
        if dashboard_data.get("create_default_widgets", True):
            await self._create_default_widgets(dashboard.id)
        
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
            widget = DashboardWidget(
                dashboard_id=dashboard_id,
                **widget_data
            )
            self.db.add(widget)
        
        self.db.commit()

    async def get_dashboard(self, dashboard_id: int, tenant_id: int) -> Optional[EnterpriseDashboard]:
        """Get a dashboard by ID"""
        return self.db.query(EnterpriseDashboard).filter(
            and_(
                EnterpriseDashboard.id == dashboard_id,
                EnterpriseDashboard.tenant_id == tenant_id
            )
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
            query = query.filter(
                or_(
                    EnterpriseDashboard.is_public == True,
                    EnterpriseDashboard.created_by == user_id,
                    EnterpriseDashboard.allowed_users.contains([user_id])
                )
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
        
        dashboard.updated_at = datetime.utcnow()
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
        
        widget = DashboardWidget(
            dashboard_id=dashboard_id,
            widget_id=widget_data["widget_id"],
            widget_name=widget_data["widget_name"],
            widget_type=widget_data["widget_type"],
            data_source=widget_data["data_source"],
            query_config=widget_data.get("query_config", {}),
            display_config=widget_data.get("display_config", {}),
            position_x=widget_data.get("position_x", 0),
            position_y=widget_data.get("position_y", 0),
            width=widget_data.get("width", 4),
            height=widget_data.get("height", 3),
            z_index=widget_data.get("z_index", 1),
            title=widget_data.get("title"),
            subtitle=widget_data.get("subtitle"),
            is_visible=widget_data.get("is_visible", True),
            is_resizable=widget_data.get("is_resizable", True),
            is_movable=widget_data.get("is_movable", True),
            auto_refresh=widget_data.get("auto_refresh", True),
            refresh_interval=widget_data.get("refresh_interval", 300)
        )
        
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
        
        widget.updated_at = datetime.utcnow()
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
            widget.error_count += 1
            widget.last_error = str(e)
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
            and_(
                EnterpriseMetric.tenant_id == tenant_id,
                EnterpriseMetric.period_start >= datetime.utcnow() - timedelta(days=30)
            )
        ).order_by(desc(EnterpriseMetric.period_start)).limit(100).all()
        
        # Aggregate by category
        categories = {}
        for metric in metrics:
            if metric.metric_category not in categories:
                categories[metric.metric_category] = []
            categories[metric.metric_category].append({
                "name": metric.metric_name,
                "value": metric.value,
                "unit": metric.unit,
                "status": metric.status,
                "trend": metric.trend,
                "change_percentage": metric.change_percentage
            })
        
        return {
            "categories": categories,
            "total_metrics": len(metrics),
            "last_updated": datetime.utcnow().isoformat()
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
            "last_updated": datetime.utcnow().isoformat()
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
            "last_updated": datetime.utcnow().isoformat()
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
            "last_sync": datetime.utcnow().isoformat(),
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
            "last_analysis": datetime.utcnow().isoformat()
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
            "last_report": datetime.utcnow().isoformat()
        }

    # Metrics Management
    async def record_metric(
        self, 
        tenant_id: int, 
        metric_data: Dict[str, Any]
    ) -> EnterpriseMetric:
        """Record an enterprise metric"""
        
        metric = EnterpriseMetric(
            tenant_id=tenant_id,
            metric_name=metric_data["metric_name"],
            metric_category=metric_data["metric_category"],
            metric_type=metric_data["metric_type"],
            value=metric_data["value"],
            previous_value=metric_data.get("previous_value"),
            target_value=metric_data.get("target_value"),
            threshold_warning=metric_data.get("threshold_warning"),
            threshold_critical=metric_data.get("threshold_critical"),
            unit=metric_data.get("unit"),
            description=metric_data.get("description"),
            calculation_method=metric_data.get("calculation_method"),
            period_start=metric_data["period_start"],
            period_end=metric_data["period_end"],
            granularity=metric_data.get("granularity", "daily"),
            status=self._calculate_metric_status(metric_data),
            trend=self._calculate_trend(metric_data),
            change_percentage=self._calculate_change_percentage(metric_data),
            confidence_score=metric_data.get("confidence_score", 1.0),
            data_completeness=metric_data.get("data_completeness", 1.0)
        )
        
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
        
        if metric.status in ["warning", "critical"]:
            alert_data = {
                "alert_name": f"Metric Alert: {metric.metric_name}",
                "alert_type": "metric",
                "severity": metric.status,
                "condition": "threshold_exceeded",
                "threshold_value": metric.threshold_critical if metric.status == "critical" else metric.threshold_warning,
                "message": f"Metric {metric.metric_name} has exceeded {metric.status} threshold",
                "description": f"Current value: {metric.value} {metric.unit or ''}",
                "recommended_action": f"Review {metric.metric_category} performance and take corrective action"
            }
            
            await self.create_alert(metric.tenant_id, alert_data)

    # Alert Management
    async def create_alert(
        self, 
        tenant_id: int, 
        alert_data: Dict[str, Any]
    ) -> DashboardAlert:
        """Create a dashboard alert"""
        
        alert = DashboardAlert(
            tenant_id=tenant_id,
            alert_name=alert_data["alert_name"],
            alert_type=alert_data["alert_type"],
            severity=alert_data["severity"],
            condition=alert_data["condition"],
            threshold_value=alert_data["threshold_value"],
            message=alert_data["message"],
            description=alert_data.get("description"),
            recommended_action=alert_data.get("recommended_action"),
            notification_channels=alert_data.get("notification_channels", []),
            notification_frequency=alert_data.get("notification_frequency", "immediate"),
            suppress_duration=alert_data.get("suppress_duration", 3600),
            created_by=alert_data.get("created_by", 1)  # System user
        )
        
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
            and_(
                DashboardAlert.tenant_id == tenant_id,
                DashboardAlert.is_active == True,
                DashboardAlert.is_acknowledged == False
            )
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
        
        usage = EnterpriseFeatureUsage(
            tenant_id=tenant_id,
            user_id=user_id,
            feature_name=usage_data["feature_name"],
            feature_category=usage_data["feature_category"],
            action=usage_data["action"],
            session_id=usage_data.get("session_id"),
            duration_seconds=usage_data.get("duration_seconds"),
            resource_consumption=usage_data.get("resource_consumption", {}),
            ip_address=usage_data.get("ip_address"),
            user_agent=usage_data.get("user_agent"),
            referrer=usage_data.get("referrer"),
            response_time_ms=usage_data.get("response_time_ms"),
            success=usage_data.get("success", True),
            error_message=usage_data.get("error_message"),
            business_value=usage_data.get("business_value"),
            cost_center=usage_data.get("cost_center"),
            project_code=usage_data.get("project_code")
        )
        
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
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Feature usage statistics
        usage_stats = self.db.query(
            EnterpriseFeatureUsage.feature_category,
            func.count(EnterpriseFeatureUsage.id).label("usage_count"),
            func.avg(EnterpriseFeatureUsage.duration_seconds).label("avg_duration"),
            func.sum(EnterpriseFeatureUsage.business_value).label("total_value")
        ).filter(
            and_(
                EnterpriseFeatureUsage.tenant_id == tenant_id,
                EnterpriseFeatureUsage.timestamp >= start_date
            )
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
            and_(
                DashboardAlert.tenant_id == tenant_id,
                DashboardAlert.created_at >= start_date
            )
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
            "generated_at": datetime.utcnow().isoformat()
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
        
        export = DashboardExport(
            tenant_id=tenant_id,
            dashboard_id=dashboard_id,
            created_by=created_by,
            export_name=export_data["export_name"],
            export_format=export_data["export_format"],
            export_scope=export_data.get("export_scope", "full"),
            include_charts=export_data.get("include_charts", True),
            include_data=export_data.get("include_data", True),
            include_metadata=export_data.get("include_metadata", False),
            page_orientation=export_data.get("page_orientation", "landscape"),
            is_scheduled=export_data.get("is_scheduled", False),
            schedule_cron=export_data.get("schedule_cron"),
            next_execution=export_data.get("next_execution"),
            is_public=export_data.get("is_public", False),
            expires_at=export_data.get("expires_at")
        )
        
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
            and_(
                DashboardAlert.tenant_id == tenant_id,
                DashboardAlert.is_active == True,
                DashboardAlert.is_acknowledged == False
            )
        ).count()
        
        # Recent feature usage
        recent_usage = self.db.query(func.count(EnterpriseFeatureUsage.id)).filter(
            and_(
                EnterpriseFeatureUsage.tenant_id == tenant_id,
                EnterpriseFeatureUsage.timestamp >= datetime.utcnow() - timedelta(hours=24)
            )
        ).scalar()
        
        return {
            "tenant_id": tenant_id,
            "dashboards": dashboard_count,
            "active_alerts": active_alerts,
            "usage_24h": recent_usage or 0,
            "enterprise_health": "healthy" if active_alerts < 5 else "warning",
            "last_updated": datetime.utcnow().isoformat()
        }
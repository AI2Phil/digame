"""
Performance monitoring service for real-time dashboards and optimization tools
"""

import json
import statistics
from typing import Dict, List, Optional, Any, Tuple, Callable
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from fastapi import Depends
import numpy as np
from collections import defaultdict, Counter

from ..models.performance_monitoring import (
    PerformanceMetric, SystemHealthCheck, QueryPerformance, 
    UserExperienceMetric, PerformanceAlert, PerformanceIncident,
    PerformanceBaseline, PerformanceOptimization
)
from ..database import get_db


class PerformanceMonitoringService:
    """Service for performance monitoring, alerting, and optimization"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Metric Collection and Storage
    
    def record_performance_metric(
        self,
        tenant_id: int,
        metric_name: str,
        value: float,
        metric_category: str = "system",
        metric_type: str = "gauge",
        unit: Optional[str] = None,
        source: Optional[str] = None,
        tags: Optional[Dict[str, Any]] = None,
        dimensions: Optional[Dict[str, Any]] = None
    ) -> PerformanceMetric:
        """Record a performance metric"""
        
        metric = PerformanceMetric()
        setattr(metric, 'tenant_id', tenant_id)
        setattr(metric, 'metric_name', metric_name)
        setattr(metric, 'metric_category', metric_category)
        setattr(metric, 'metric_type', metric_type)
        setattr(metric, 'value', value)
        setattr(metric, 'unit', unit)
        setattr(metric, 'source', source)
        setattr(metric, 'tags', tags or {})
        setattr(metric, 'dimensions', dimensions or {})
        
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        
        # Check for alerts
        self._check_metric_alerts(metric)
        
        return metric
    
    def record_query_performance(
        self,
        tenant_id: int,
        query_text: str,
        execution_time_ms: float,
        rows_examined: Optional[int] = None,
        rows_returned: Optional[int] = None,
        endpoint: Optional[str] = None,
        user_id: Optional[int] = None,
        database_name: Optional[str] = None,
        table_names: Optional[List[str]] = None
    ) -> QueryPerformance:
        """Record database query performance"""
        
        # Generate query hash for grouping similar queries
        query_hash = self._generate_query_hash(query_text)
        
        # Determine if this is a slow query
        is_slow_query = execution_time_ms > 1000  # 1 second threshold
        
        # Generate optimization suggestions for slow queries
        optimization_suggestions = None
        if is_slow_query:
            optimization_suggestions = self._generate_query_optimization_suggestions(
                query_text, execution_time_ms, rows_examined, rows_returned
            )
        
        query_perf = QueryPerformance()
        setattr(query_perf, 'tenant_id', tenant_id)
        setattr(query_perf, 'query_hash', query_hash)
        setattr(query_perf, 'query_text', query_text[:5000])  # Truncate long queries
        setattr(query_perf, 'query_type', self._extract_query_type(query_text))
        setattr(query_perf, 'execution_time_ms', execution_time_ms)
        setattr(query_perf, 'rows_examined', rows_examined)
        setattr(query_perf, 'rows_returned', rows_returned)
        setattr(query_perf, 'endpoint', endpoint)
        setattr(query_perf, 'user_id', user_id)
        setattr(query_perf, 'database_name', database_name)
        setattr(query_perf, 'table_names', table_names or [])
        setattr(query_perf, 'is_slow_query', is_slow_query)
        setattr(query_perf, 'optimization_suggestions', optimization_suggestions)
        
        self.db.add(query_perf)
        self.db.commit()
        self.db.refresh(query_perf)
        
        return query_perf
    
    def record_user_experience_metric(
        self,
        tenant_id: int,
        user_id: Optional[int],
        session_id: str,
        page_url: str,
        action_type: str,
        load_time_ms: Optional[float] = None,
        device_type: Optional[str] = None,
        browser: Optional[str] = None,
        error_occurred: bool = False,
        error_message: Optional[str] = None
    ) -> UserExperienceMetric:
        """Record user experience metric"""
        
        # Determine bounce based on quick exit
        bounce = False
        if action_type == "page_load" and load_time_ms and load_time_ms > 5000:
            bounce = True
        
        ux_metric = UserExperienceMetric()
        setattr(ux_metric, 'tenant_id', tenant_id)
        setattr(ux_metric, 'user_id', user_id)
        setattr(ux_metric, 'session_id', session_id)
        setattr(ux_metric, 'page_url', page_url)
        setattr(ux_metric, 'action_type', action_type)
        setattr(ux_metric, 'load_time_ms', load_time_ms)
        setattr(ux_metric, 'device_type', device_type)
        setattr(ux_metric, 'browser', browser)
        setattr(ux_metric, 'error_occurred', error_occurred)
        setattr(ux_metric, 'error_message', error_message)
        setattr(ux_metric, 'bounce', bounce)
        
        self.db.add(ux_metric)
        self.db.commit()
        self.db.refresh(ux_metric)
        
        return ux_metric
    
    # System Health Monitoring
    
    def perform_health_check(
        self,
        tenant_id: int,
        check_name: str,
        check_type: str,
        component: str,
        check_function: Callable
    ) -> SystemHealthCheck:
        """Perform a system health check"""
        
        start_time = datetime.utcnow()
        
        try:
            # Execute the health check function
            result = check_function()
            success = result.get("success", True)
            details = result.get("details", {})
            error_message = result.get("error")
            
            # Determine status based on result
            if success:
                status = "healthy"
            elif result.get("warning"):
                status = "warning"
            else:
                status = "critical"
                
        except Exception as e:
            success = False
            status = "critical"
            error_message = str(e)
            details = {"exception": str(e)}
        
        # Calculate response time
        response_time_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        health_check = SystemHealthCheck()
        setattr(health_check, 'tenant_id', tenant_id)
        setattr(health_check, 'check_name', check_name)
        setattr(health_check, 'check_type', check_type)
        setattr(health_check, 'component', component)
        setattr(health_check, 'status', status)
        setattr(health_check, 'response_time_ms', response_time_ms)
        setattr(health_check, 'success', success)
        setattr(health_check, 'error_message', error_message)
        setattr(health_check, 'details', details)
        
        self.db.add(health_check)
        self.db.commit()
        self.db.refresh(health_check)
        
        # Create incident if health check failed
        if not success:
            self._create_health_incident(health_check)
        
        return health_check
    
    def get_system_health_status(self, tenant_id: int) -> Dict[str, Any]:
        """Get overall system health status"""
        
        # Get recent health checks (last 15 minutes)
        recent_time = datetime.utcnow() - timedelta(minutes=15)
        
        recent_checks = self.db.query(SystemHealthCheck).filter(
            and_(
                SystemHealthCheck.tenant_id.is_(tenant_id),
                SystemHealthCheck.timestamp.__ge__(recent_time)
            )
        ).all()
        
        if not recent_checks:
            return {
                "overall_status": "unknown",
                "components": {},
                "last_check": None
            }
        
        # Group by component and get latest status
        component_status = {}
        for check in recent_checks:
            if check.component not in component_status:
                component_status[check.component] = check
            elif check.timestamp > component_status[check.component].timestamp:
                component_status[check.component] = check
        
        # Determine overall status
        statuses = [check.status for check in component_status.values()]
        if "critical" in statuses:
            overall_status = "critical"
        elif "warning" in statuses:
            overall_status = "warning"
        elif all(status == "healthy" for status in statuses):
            overall_status = "healthy"
        else:
            overall_status = "unknown"
        
        return {
            "overall_status": overall_status,
            "components": {
                comp: {
                    "status": check.status,
                    "last_check": check.timestamp,
                    "response_time_ms": check.response_time_ms,
                    "error_message": check.error_message
                }
                for comp, check in component_status.items()
            },
            "last_check": max(check.timestamp for check in component_status.values())
        }
    
    # Performance Analytics and Dashboards
    
    def get_performance_dashboard_data(
        self,
        tenant_id: int,
        time_range_hours: int = 24
    ) -> Dict[str, Any]:
        """Get comprehensive performance dashboard data"""
        
        start_time = datetime.utcnow() - timedelta(hours=time_range_hours)
        
        # System metrics
        system_metrics = self._get_system_metrics_summary(tenant_id, start_time)
        
        # Database performance
        db_performance = self._get_database_performance_summary(tenant_id, start_time)
        
        # User experience metrics
        ux_metrics = self._get_user_experience_summary(tenant_id, start_time)
        
        # Active alerts
        active_alerts = self._get_active_alerts(tenant_id)
        
        # Recent incidents
        recent_incidents = self._get_recent_incidents(tenant_id, start_time)
        
        # Performance trends
        trends = self._get_performance_trends(tenant_id, start_time)
        
        return {
            "time_range_hours": time_range_hours,
            "system_metrics": system_metrics,
            "database_performance": db_performance,
            "user_experience": ux_metrics,
            "active_alerts": active_alerts,
            "recent_incidents": recent_incidents,
            "trends": trends,
            "last_updated": datetime.utcnow()
        }
    
    def get_query_optimization_recommendations(
        self,
        tenant_id: int,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get query optimization recommendations"""
        
        # Get slow queries from last 7 days
        start_time = datetime.utcnow() - timedelta(days=7)
        
        slow_queries = self.db.query(QueryPerformance).filter(
            and_(
                QueryPerformance.tenant_id.is_(tenant_id),
                QueryPerformance.is_slow_query.is_(True),
                QueryPerformance.timestamp.__ge__(start_time)
            )
        ).order_by(desc(QueryPerformance.execution_time_ms)).limit(limit * 2).all()
        
        # Group by query hash and aggregate
        query_groups = defaultdict(list)
        for query in slow_queries:
            query_groups[query.query_hash].append(query)
        
        recommendations = []
        for query_hash, queries in query_groups.items():
            if len(recommendations) >= limit:
                break
                
            # Calculate aggregated metrics
            avg_execution_time = statistics.mean(q.execution_time_ms for q in queries)
            max_execution_time = max(q.execution_time_ms for q in queries)
            frequency = len(queries)
            
            # Get representative query
            representative_query = max(queries, key=lambda q: q.execution_time_ms)
            
            # Calculate impact score
            impact_score = (avg_execution_time / 1000) * frequency
            
            recommendations.append({
                "query_hash": query_hash,
                "query_text": representative_query.query_text[:500],
                "query_type": representative_query.query_type,
                "frequency": frequency,
                "avg_execution_time_ms": avg_execution_time,
                "max_execution_time_ms": max_execution_time,
                "impact_score": impact_score,
                "tables": representative_query.table_names,
                "optimization_suggestions": representative_query.optimization_suggestions,
                "priority": self._calculate_optimization_priority(impact_score, frequency)
            })
        
        # Sort by impact score
        recommendations.sort(key=lambda x: x["impact_score"], reverse=True)
        
        return recommendations[:limit]
    
    def get_user_experience_insights(
        self,
        tenant_id: int,
        time_range_hours: int = 24
    ) -> Dict[str, Any]:
        """Get user experience insights and recommendations"""
        
        start_time = datetime.utcnow() - timedelta(hours=time_range_hours)
        
        ux_metrics = self.db.query(UserExperienceMetric).filter(
            and_(
                UserExperienceMetric.tenant_id.is_(tenant_id),
                UserExperienceMetric.timestamp.__ge__(start_time)
            )
        ).all()
        
        if not ux_metrics:
            return {"message": "No user experience data available"}
        
        # Page performance analysis
        page_performance = defaultdict(list)
        for metric in ux_metrics:
            if metric.load_time_ms:
                page_performance[metric.page_url].append(metric.load_time_ms)
        
        slow_pages = []
        for page, load_times in page_performance.items():
            avg_load_time = statistics.mean(load_times)
            if avg_load_time > 3000:  # 3 seconds threshold
                slow_pages.append({
                    "page": page,
                    "avg_load_time_ms": avg_load_time,
                    "sample_count": len(load_times),
                    "p95_load_time_ms": np.percentile(load_times, 95)
                })
        
        # Device performance analysis
        device_performance = defaultdict(list)
        for metric in ux_metrics:
            if metric.load_time_ms and metric.device_type:
                device_performance[metric.device_type].append(metric.load_time_ms)
        
        # Error analysis
        error_rate = len([m for m in ux_metrics if m.error_occurred]) / len(ux_metrics) * 100
        
        # Bounce rate analysis
        bounce_rate = len([m for m in ux_metrics if m.bounce]) / len(ux_metrics) * 100
        
        return {
            "time_range_hours": time_range_hours,
            "total_interactions": len(ux_metrics),
            "error_rate_percent": error_rate,
            "bounce_rate_percent": bounce_rate,
            "slow_pages": sorted(slow_pages, key=lambda x: x["avg_load_time_ms"], reverse=True)[:10],
            "device_performance": {
                device: {
                    "avg_load_time_ms": statistics.mean(times),
                    "sample_count": len(times)
                }
                for device, times in device_performance.items()
            },
            "recommendations": self._generate_ux_recommendations(slow_pages, error_rate, bounce_rate)
        }
    
    # Alert Management
    
    def create_performance_alert(
        self,
        tenant_id: int,
        alert_name: str,
        metric_name: str,
        threshold_value: float,
        threshold_operator: str = ">",
        severity: str = "medium",
        notification_channels: Optional[List[str]] = None
    ) -> PerformanceAlert:
        """Create a performance alert"""
        
        alert = PerformanceAlert()
        alert.tenant_id = tenant_id
        alert.alert_name = alert_name
        alert.metric_name = metric_name
        alert.alert_type = "threshold"
        alert.severity = severity
        alert.threshold_value = threshold_value
        alert.threshold_operator = threshold_operator
        alert.notification_channels = notification_channels or []
        alert.description = f"Alert when {metric_name} {threshold_operator} {threshold_value}"
        
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        
        return alert
    
    def check_all_alerts(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Check all active alerts for a tenant"""
        
        active_alerts = self.db.query(PerformanceAlert).filter(
            and_(
                PerformanceAlert.tenant_id.is_(tenant_id),
                PerformanceAlert.status.is_("active")
            )
        ).all()
        
        triggered_alerts = []
        
        for alert in active_alerts:
            # Get recent metrics for this alert
            recent_metrics = self.db.query(PerformanceMetric).filter(
                PerformanceMetric.tenant_id == tenant_id,
                PerformanceMetric.metric_name == alert.metric_name,
                PerformanceMetric.created_at >= datetime.utcnow() - timedelta(minutes=5)
            ).all()
            
            for metric in recent_metrics:
                metric_value = float(metric.value) if metric.value is not None else 0.0
                threshold_value = float(alert.threshold_value) if alert.threshold_value is not None else 0.0
                
                if self._evaluate_threshold(metric_value, threshold_value, alert.threshold_operator):
                    self._trigger_alert(alert, metric_value)
                    triggered_alerts.append({
                        "alert_id": alert.id,
                        "alert_name": alert.alert_name,
                        "severity": alert.severity,
                        "current_value": metric_value,
                        "threshold_value": threshold_value,
                        "message": f"Alert triggered: {alert.alert_name} - Current value: {metric_value}"
                    })
        
        return triggered_alerts
    
    # Optimization Recommendations
    
    def create_optimization_recommendation(
        self,
        tenant_id: int,
        optimization_type: str,
        component: str,
        title: str,
        description: str,
        current_performance: Dict[str, Any],
        expected_improvement: Dict[str, Any],
        effort_estimate: str = "medium"
    ) -> PerformanceOptimization:
        """Create a performance optimization recommendation"""
        
        priority_score = self._calculate_optimization_priority_score(
            current_performance, expected_improvement, effort_estimate
        )
        
        optimization = PerformanceOptimization()
        optimization.tenant_id = tenant_id
        optimization.optimization_type = optimization_type
        optimization.component = component
        optimization.title = title
        optimization.description = description
        optimization.current_performance = current_performance
        optimization.expected_improvement = expected_improvement
        optimization.effort_estimate = effort_estimate
        optimization.priority_score = priority_score
        
        self.db.add(optimization)
        self.db.commit()
        self.db.refresh(optimization)
        
        return optimization
    
    def get_optimization_recommendations(
        self,
        tenant_id: int,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[PerformanceOptimization]:
        """Get performance optimization recommendations"""
        
        query = self.db.query(PerformanceOptimization).filter(
            PerformanceOptimization.tenant_id == tenant_id
        )
        
        if status:
            query = query.filter(PerformanceOptimization.implementation_status == status)
        
        return query.order_by(desc(PerformanceOptimization.priority_score)).limit(limit).all()
    
    # Private Helper Methods
    
    def _generate_query_hash(self, query_text: str) -> str:
        """Generate a hash for query grouping"""
        import hashlib
        
        # Normalize query for hashing
        normalized = query_text.lower().strip()
        # Remove extra whitespace
        normalized = " ".join(normalized.split())
        
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]
    
    def _extract_query_type(self, query_text: str) -> str:
        """Extract query type from SQL text"""
        query_lower = query_text.lower().strip()
        
        if query_lower.startswith("select"):
            return "SELECT"
        elif query_lower.startswith("insert"):
            return "INSERT"
        elif query_lower.startswith("update"):
            return "UPDATE"
        elif query_lower.startswith("delete"):
            return "DELETE"
        else:
            return "OTHER"
    
    def _generate_query_optimization_suggestions(
        self,
        query_text: str,
        execution_time_ms: float,
        rows_examined: Optional[int],
        rows_returned: Optional[int]
    ) -> List[str]:
        """Generate optimization suggestions for slow queries"""
        
        suggestions = []
        
        # High execution time
        if execution_time_ms > 5000:
            suggestions.append("Consider adding appropriate indexes")
            suggestions.append("Review query complexity and consider breaking into smaller queries")
        
        # High rows examined vs returned ratio
        if rows_examined and rows_returned and rows_examined > rows_returned * 10:
            suggestions.append("Add more selective WHERE clauses")
            suggestions.append("Consider adding covering indexes")
        
        # Query pattern analysis
        query_lower = query_text.lower()
        
        if "order by" in query_lower and "limit" not in query_lower:
            suggestions.append("Consider adding LIMIT clause to ORDER BY queries")
        
        if "like '%%" in query_lower:
            suggestions.append("Avoid leading wildcards in LIKE patterns")
        
        if "select *" in query_lower:
            suggestions.append("Select only required columns instead of SELECT *")
        
        return suggestions
    
    def _check_metric_alerts(self, metric: PerformanceMetric):
        """Check if metric triggers any alerts"""
        
        alerts = self.db.query(PerformanceAlert).filter(
            and_(
                PerformanceAlert.tenant_id.is_(metric.tenant_id),
                PerformanceAlert.metric_name.is_(metric.metric_name),
                PerformanceAlert.status.is_("active")
            )
        ).all()
        
        for alert in alerts:
            metric_value = float(metric.value) if metric.value is not None else 0.0
            threshold_value = float(alert.threshold_value) if alert.threshold_value is not None else 0.0
            
            if self._evaluate_threshold(metric_value, threshold_value, alert.threshold_operator):
                self._trigger_alert(alert, metric_value)
    
    def _evaluate_threshold(self, value: float, threshold: float, operator: str) -> bool:
        """Evaluate threshold condition"""
        
        if operator == "gt" or operator == ">":
            return value > threshold
        elif operator == "lt" or operator == "<":
            return value < threshold
        elif operator == "gte" or operator == ">=":
            return value >= threshold
        elif operator == "lte" or operator == "<=":
            return value <= threshold
        elif operator == "eq" or operator == "==":
            return value == threshold
        elif operator == "ne" or operator == "!=":
            return value != threshold
        
        return False
    
    def _trigger_alert(self, alert: PerformanceAlert, current_value: float):
        """Trigger an alert"""
        
        # In a real implementation, you'd want to create a separate AlertTrigger record
        # and send notifications through the configured channels
        
        # Create incident if severity is high or critical
        if alert.severity in ["high", "critical"]:
            self._create_alert_incident(alert, current_value)
    
    def _create_health_incident(self, health_check: SystemHealthCheck):
        """Create incident from failed health check"""
        
        severity = "high" if health_check.status == "critical" else "medium"
        description = health_check.error_message or "Health check failed"
        
        incident = PerformanceIncident()
        incident.tenant_id = health_check.tenant_id
        incident.health_check_id = health_check.id
        incident.title = f"Health check failed: {health_check.check_name}"
        incident.description = description
        incident.severity = severity
        incident.category = "availability"
        incident.affected_components = [health_check.component]
        
        self.db.add(incident)
        self.db.commit()
    
    def _create_alert_incident(self, alert: PerformanceAlert, current_value: float):
        """Create incident from triggered alert"""
        
        incident = PerformanceIncident()
        incident.tenant_id = alert.tenant_id
        incident.alert_id = alert.id
        incident.title = f"Performance alert: {alert.alert_name}"
        incident.description = f"Alert triggered: {alert.alert_name} - Current value: {current_value}"
        incident.severity = alert.severity
        incident.category = "performance"
        
        self.db.add(incident)
        self.db.commit()
    
    def _get_system_metrics_summary(self, tenant_id: int, start_time: datetime) -> Dict[str, Any]:
        """Get system metrics summary"""
        
        metrics = self.db.query(PerformanceMetric).filter(
            and_(
                PerformanceMetric.tenant_id.is_(tenant_id),
                PerformanceMetric.metric_category.is_("system"),
                PerformanceMetric.timestamp.__ge__(start_time)
            )
        ).all()
        
        if not metrics:
            return {}
        
        # Group by metric name
        metric_groups = defaultdict(list)
        for metric in metrics:
            metric_groups[metric.metric_name].append(float(metric.value) if metric.value else 0.0)
        
        summary = {}
        for name, values in metric_groups.items():
            summary[name] = {
                "current": values[-1] if values else 0,
                "average": statistics.mean(values),
                "max": max(values),
                "min": min(values),
                "sample_count": len(values)
            }
        
        return summary
    
    def _get_database_performance_summary(self, tenant_id: int, start_time: datetime) -> Dict[str, Any]:
        """Get database performance summary"""
        
        queries = self.db.query(QueryPerformance).filter(
            and_(
                QueryPerformance.tenant_id.is_(tenant_id),
                QueryPerformance.timestamp.__ge__(start_time)
            )
        ).all()
        
        if not queries:
            return {}
        
        execution_times = [float(q.execution_time_ms) for q in queries]
        slow_queries_count = len([q for q in queries if q.is_slow_query])
        
        return {
            "total_queries": len(queries),
            "slow_queries_count": slow_queries_count,
            "slow_query_percentage": (slow_queries_count / len(queries)) * 100,
            "avg_execution_time_ms": statistics.mean(execution_times),
            "p95_execution_time_ms": np.percentile(execution_times, 95),
            "p99_execution_time_ms": np.percentile(execution_times, 99)
        }
    
    def _get_user_experience_summary(self, tenant_id: int, start_time: datetime) -> Dict[str, Any]:
        """Get user experience summary"""
        
        ux_metrics = self.db.query(UserExperienceMetric).filter(
            and_(
                UserExperienceMetric.tenant_id.is_(tenant_id),
                UserExperienceMetric.timestamp.__ge__(start_time)
            )
        ).all()
        
        if not ux_metrics:
            return {}
        
        load_times = [float(m.load_time_ms) for m in ux_metrics if m.load_time_ms]
        error_count = len([m for m in ux_metrics if m.error_occurred])
        bounce_count = len([m for m in ux_metrics if m.bounce])
        
        return {
            "total_interactions": len(ux_metrics),
            "avg_load_time_ms": statistics.mean(load_times) if load_times else 0,
            "error_rate_percent": (error_count / len(ux_metrics)) * 100,
            "bounce_rate_percent": (bounce_count / len(ux_metrics)) * 100,
            "unique_users": len(set(m.user_id for m in ux_metrics if m.user_id))
        }
    
    def _get_active_alerts(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get active alerts"""
        
        alerts = self.db.query(PerformanceAlert).filter(
            and_(
                PerformanceAlert.tenant_id.is_(tenant_id),
                PerformanceAlert.status.is_("active")
            )
        ).order_by(desc(PerformanceAlert.created_at)).limit(10).all()
        
        return [
            {
                "id": alert.id,
                "name": alert.alert_name,
                "severity": alert.severity,
                "created_at": alert.created_at,
                "description": alert.description
            }
            for alert in alerts
        ]
    
    def _get_recent_incidents(self, tenant_id: int, start_time: datetime) -> List[Dict[str, Any]]:
        """Get recent incidents"""
        
        incidents = self.db.query(PerformanceIncident).filter(
            and_(
                PerformanceIncident.tenant_id.is_(tenant_id),
                PerformanceIncident.started_at.__ge__(start_time)
            )
        ).order_by(desc(PerformanceIncident.started_at)).limit(10).all()
        
        return [
            {
                "id": incident.id,
                "title": incident.title,
                "severity": incident.severity,
                "status": incident.status,
                "started_at": incident.started_at,
                "resolved_at": incident.resolved_at
            }
            for incident in incidents
        ]
    
    def _get_performance_trends(self, tenant_id: int, start_time: datetime) -> Dict[str, Any]:
        """Get performance trends"""
        
        # This would implement trend analysis
        # For now, return basic structure
        return {
            "response_time_trend": "stable",
            "error_rate_trend": "improving",
            "throughput_trend": "increasing"
        }
    
    def _calculate_optimization_priority(self, impact_score: float, frequency: int) -> str:
        """Calculate optimization priority"""
        
        if impact_score > 10 and frequency > 100:
            return "critical"
        elif impact_score > 5 and frequency > 50:
            return "high"
        elif impact_score > 2 and frequency > 10:
            return "medium"
        else:
            return "low"
    
    def _calculate_optimization_priority_score(
        self,
        current_performance: Dict[str, Any],
        expected_improvement: Dict[str, Any],
        effort_estimate: str
    ) -> float:
        """Calculate optimization priority score"""
        
        # Base score from expected improvement
        improvement_score = 0
        if "response_time_improvement_percent" in expected_improvement:
            improvement_score += expected_improvement["response_time_improvement_percent"] * 2
        if "throughput_improvement_percent" in expected_improvement:
            improvement_score += expected_improvement["throughput_improvement_percent"]
        
        # Adjust for effort
        effort_multiplier = {"low": 1.5, "medium": 1.0, "high": 0.5}
        multiplier = effort_multiplier.get(effort_estimate, 1.0)
        
        return improvement_score * multiplier
    
    def _generate_ux_recommendations(
        self,
        slow_pages: List[Dict[str, Any]],
        error_rate: float,
        bounce_rate: float
    ) -> List[str]:
        """Generate UX improvement recommendations"""
        
        recommendations = []
        
        if slow_pages:
            recommendations.append("Optimize slow-loading pages to improve user experience")
            recommendations.append("Consider implementing lazy loading for heavy content")
        
        if error_rate > 5:
            recommendations.append("Investigate and fix high error rate")
            recommendations.append("Implement better error handling and user feedback")
        
        if bounce_rate > 50:
            recommendations.append("Improve page load times to reduce bounce rate")
            recommendations.append("Review page content and user experience flow")
        
        return recommendations


def get_performance_monitoring_service(db: Session = Depends(get_db)) -> PerformanceMonitoringService:
    """Dependency to get PerformanceMonitoringService instance"""
    return PerformanceMonitoringService(db)
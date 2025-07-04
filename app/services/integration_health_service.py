"""
Integration Health Monitoring Service - Phase 2A Implementation
Priority 2: Integration Ecosystem Completion (75% → 95%)

Real-time health monitoring, alerting, and performance dashboards for integrations
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import statistics

from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationWebhook, IntegrationDataMapping, IntegrationAnalytics
)

logger = logging.getLogger(__name__)


class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


@dataclass
class HealthAlert:
    id: str
    severity: AlertSeverity
    title: str
    description: str
    provider_name: str
    connection_id: Optional[int]
    tenant_id: int
    created_at: datetime
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    metrics: Dict[str, Any]


@dataclass
class IntegrationHealthStatus:
    provider_id: int
    provider_name: str
    total_connections: int
    active_connections: int
    healthy_connections: int
    warning_connections: int
    critical_connections: int
    overall_health_score: float
    avg_response_time: float
    success_rate: float
    uptime_percentage: float
    last_check: datetime
    trending: str  # "improving", "stable", "degrading"


@dataclass
class PerformanceDashboardData:
    tenant_id: int
    generated_at: datetime
    overview_metrics: Dict[str, Any]
    provider_health: List[IntegrationHealthStatus]
    recent_alerts: List[HealthAlert]
    performance_trends: Dict[str, List[Dict[str, Any]]]
    top_performers: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]


class IntegrationHealthService:
    """
    Comprehensive health monitoring and alerting service for integrations
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.health_thresholds = {
            "response_time_warning": 3000,  # 3 seconds
            "response_time_critical": 8000,  # 8 seconds
            "success_rate_warning": 95.0,   # 95%
            "success_rate_critical": 85.0,  # 85%
            "uptime_warning": 98.0,          # 98%
            "uptime_critical": 95.0,         # 95%
            "error_rate_warning": 2.0,       # 2%
            "error_rate_critical": 5.0       # 5%
        }
        self.active_alerts = {}  # In-memory alert storage
    
    async def monitor_all_integrations(self, tenant_id: int) -> Dict[str, Any]:
        """
        Perform comprehensive health monitoring for all tenant integrations
        """
        logger.info(f"Starting health monitoring for tenant {tenant_id}")
        
        monitoring_results: Dict[str, Any] = {
            "tenant_id": tenant_id,
            "monitoring_started": datetime.utcnow(),
            "providers_monitored": 0,
            "connections_checked": 0,
            "alerts_generated": 0,
            "health_scores": {},
            "performance_metrics": {},
            "recommendations": []
        }
        
        try:
            # Get all active connections for tenant
            connections = self.db.query(IntegrationConnection).filter(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationConnection.status.in_(["active", "warning", "error"])
            ).all()
            
            # Group connections by provider
            provider_connections = {}
            for connection in connections:
                provider_id = connection.provider_id
                if provider_id not in provider_connections:
                    provider_connections[provider_id] = []
                provider_connections[provider_id].append(connection)
            
            # Monitor each provider
            for provider_id, provider_connections_list in provider_connections.items():
                try:
                    provider_health = await self.monitor_provider_health(
                        provider_id, provider_connections_list, tenant_id
                    )
                    monitoring_results["providers_monitored"] += 1
                    monitoring_results["connections_checked"] += len(provider_connections_list)
                    monitoring_results["health_scores"][provider_id] = provider_health
                    
                    # Check for alerts
                    alerts = await self.check_provider_alerts(provider_health, tenant_id)
                    monitoring_results["alerts_generated"] += len(alerts)
                    
                except Exception as e:
                    logger.error(f"Failed to monitor provider {provider_id}: {str(e)}")
            
            # Generate performance metrics
            performance_metrics = await self.calculate_performance_metrics(tenant_id)
            monitoring_results["performance_metrics"] = performance_metrics
            
            # Generate recommendations
            recommendations = await self.generate_health_recommendations(tenant_id)
            monitoring_results["recommendations"] = recommendations
            
            monitoring_results["monitoring_completed"] = datetime.utcnow()
            monitoring_results["success"] = True
            
        except Exception as e:
            logger.error(f"Health monitoring failed for tenant {tenant_id}: {str(e)}")
            monitoring_results["success"] = False
            monitoring_results["error"] = str(e)
        
        return monitoring_results
    
    async def monitor_provider_health(
        self, 
        provider_id: int, 
        connections: List[IntegrationConnection],
        tenant_id: int
    ) -> IntegrationHealthStatus:
        """
        Monitor health status for a specific provider
        """
        provider = self.db.query(IntegrationProvider).filter(
            IntegrationProvider.id == provider_id
        ).first()
        
        if not provider:
            raise ValueError(f"Provider {provider_id} not found")
        
        # Initialize counters
        total_connections = len(connections)
        active_connections = len([c for c in connections if c.status == "active"])
        healthy_connections = 0
        warning_connections = 0
        critical_connections = 0
        
        # Collect performance metrics
        response_times = []
        success_rates = []
        uptime_percentages = []
        
        # Analyze each connection
        for connection in connections:
            connection_health = await self.analyze_connection_health(connection)
            
            response_times.append(connection_health["avg_response_time"])
            success_rates.append(connection_health["success_rate"])
            uptime_percentages.append(connection_health["uptime_percentage"])
            
            # Categorize connection health
            if connection_health["health_status"] == "healthy":
                healthy_connections += 1
            elif connection_health["health_status"] == "warning":
                warning_connections += 1
            else:
                critical_connections += 1
        
        # Calculate aggregate metrics
        avg_response_time = statistics.mean(response_times) if response_times else 0
        avg_success_rate = statistics.mean(success_rates) if success_rates else 0
        avg_uptime = statistics.mean(uptime_percentages) if uptime_percentages else 0
        
        # Calculate overall health score (0-100)
        health_score = self.calculate_health_score(
            avg_response_time, avg_success_rate, avg_uptime
        )
        
        # Determine trending
        trending = await self.calculate_health_trending(provider_id, tenant_id)
        
        return IntegrationHealthStatus(
            provider_id=provider_id,
            provider_name=provider.name,
            total_connections=total_connections,
            active_connections=active_connections,
            healthy_connections=healthy_connections,
            warning_connections=warning_connections,
            critical_connections=critical_connections,
            overall_health_score=health_score,
            avg_response_time=avg_response_time,
            success_rate=avg_success_rate,
            uptime_percentage=avg_uptime,
            last_check=datetime.utcnow(),
            trending=trending
        )
    
    async def analyze_connection_health(self, connection: IntegrationConnection) -> Dict[str, Any]:
        """
        Analyze health metrics for a specific connection
        """
        # Get recent sync logs (last 24 hours)
        recent_syncs = self.db.query(IntegrationSyncLog).filter(
            IntegrationSyncLog.connection_id == connection.id,
            IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if not recent_syncs:
            return {
                "health_status": "unknown",
                "avg_response_time": 0,
                "success_rate": 0,
                "uptime_percentage": 0,
                "error_count": 0,
                "last_sync": None
            }
        
        # Calculate metrics
        total_syncs = len(recent_syncs)
        successful_syncs = len([s for s in recent_syncs if s.status == "success"])
        success_rate = (successful_syncs / total_syncs) * 100 if total_syncs > 0 else 0
        
        response_times = [s.duration_seconds for s in recent_syncs if s.duration_seconds]
        avg_response_time = statistics.mean(response_times) * 1000 if response_times else 0  # Convert to ms
        
        error_count = total_syncs - successful_syncs
        
        # Calculate uptime (simplified - based on successful syncs)
        uptime_percentage = success_rate
        
        # Determine health status
        health_status = "healthy"
        if (success_rate < self.health_thresholds["success_rate_critical"] or 
            avg_response_time > self.health_thresholds["response_time_critical"]):
            health_status = "critical"
        elif (success_rate < self.health_thresholds["success_rate_warning"] or 
              avg_response_time > self.health_thresholds["response_time_warning"]):
            health_status = "warning"
        
        return {
            "health_status": health_status,
            "avg_response_time": avg_response_time,
            "success_rate": success_rate,
            "uptime_percentage": uptime_percentage,
            "error_count": error_count,
            "last_sync": recent_syncs[-1].started_at if recent_syncs else None,
            "total_syncs": total_syncs
        }
    
    async def check_provider_alerts(
        self, 
        provider_health: IntegrationHealthStatus, 
        tenant_id: int
    ) -> List[HealthAlert]:
        """
        Check for alert conditions and generate alerts
        """
        alerts = []
        
        # Check critical conditions
        if provider_health.critical_connections > 0:
            alert = HealthAlert(
                id=f"critical_{provider_health.provider_id}_{int(datetime.utcnow().timestamp())}",
                severity=AlertSeverity.CRITICAL,
                title=f"Critical Issues in {provider_health.provider_name}",
                description=f"{provider_health.critical_connections} connections are in critical state",
                provider_name=provider_health.provider_name,
                connection_id=None,
                tenant_id=tenant_id,
                created_at=datetime.utcnow(),
                resolved_at=None,
                resolution_notes=None,
                metrics={
                    "critical_connections": provider_health.critical_connections,
                    "success_rate": provider_health.success_rate,
                    "response_time": provider_health.avg_response_time
                }
            )
            alerts.append(alert)
            await self.store_alert(alert)
        
        # Check warning conditions
        if provider_health.warning_connections > provider_health.total_connections * 0.3:  # 30% in warning
            alert = HealthAlert(
                id=f"warning_{provider_health.provider_id}_{int(datetime.utcnow().timestamp())}",
                severity=AlertSeverity.WARNING,
                title=f"Performance Issues in {provider_health.provider_name}",
                description=f"{provider_health.warning_connections} connections showing performance issues",
                provider_name=provider_health.provider_name,
                connection_id=None,
                tenant_id=tenant_id,
                created_at=datetime.utcnow(),
                resolved_at=None,
                resolution_notes=None,
                metrics={
                    "warning_connections": provider_health.warning_connections,
                    "health_score": provider_health.overall_health_score
                }
            )
            alerts.append(alert)
            await self.store_alert(alert)
        
        # Check trending degradation
        if provider_health.trending == "degrading":
            alert = HealthAlert(
                id=f"trend_{provider_health.provider_id}_{int(datetime.utcnow().timestamp())}",
                severity=AlertSeverity.INFO,
                title=f"Performance Degradation Trend in {provider_health.provider_name}",
                description="Performance metrics showing degrading trend over time",
                provider_name=provider_health.provider_name,
                connection_id=None,
                tenant_id=tenant_id,
                created_at=datetime.utcnow(),
                resolved_at=None,
                resolution_notes=None,
                metrics={
                    "trending": provider_health.trending,
                    "health_score": provider_health.overall_health_score
                }
            )
            alerts.append(alert)
            await self.store_alert(alert)
        
        return alerts
    
    async def generate_performance_dashboard(self, tenant_id: int) -> PerformanceDashboardData:
        """
        Generate comprehensive performance dashboard data
        """
        logger.info(f"Generating performance dashboard for tenant {tenant_id}")
        
        # Get overview metrics
        overview_metrics = await self.get_overview_metrics(tenant_id)
        
        # Get provider health status
        provider_health = await self.get_all_provider_health(tenant_id)
        
        # Get recent alerts
        recent_alerts = await self.get_recent_alerts(tenant_id, hours=24)
        
        # Get performance trends
        performance_trends = await self.get_performance_trends(tenant_id, days=7)
        
        # Get top performers
        top_performers = await self.get_top_performing_integrations(tenant_id)
        
        # Generate recommendations
        recommendations = await self.generate_health_recommendations(tenant_id)
        
        return PerformanceDashboardData(
            tenant_id=tenant_id,
            generated_at=datetime.utcnow(),
            overview_metrics=overview_metrics,
            provider_health=provider_health,
            recent_alerts=recent_alerts,
            performance_trends=performance_trends,
            top_performers=top_performers,
            recommendations=recommendations
        )
    
    async def get_overview_metrics(self, tenant_id: int) -> Dict[str, Any]:
        """
        Get high-level overview metrics for tenant
        """
        # Get all connections
        total_connections = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).count()
        
        active_connections = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationConnection.status == "active"
        ).count()
        
        # Get recent sync statistics
        recent_syncs = self.db.query(IntegrationSyncLog).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        total_syncs = len(recent_syncs)
        successful_syncs = len([s for s in recent_syncs if s.status == "success"])
        success_rate = (successful_syncs / total_syncs) * 100 if total_syncs > 0 else 0
        
        # Calculate data volume
        total_data_mb = sum(s.data_size_bytes or 0 for s in recent_syncs) / (1024 * 1024)
        
        # Get active alerts count
        active_alerts_count = len([a for a in self.active_alerts.values() if not a.resolved_at])
        
        return {
            "total_integrations": total_connections,
            "active_integrations": active_connections,
            "integration_utilization": (active_connections / total_connections) * 100 if total_connections > 0 else 0,
            "last_24h_syncs": total_syncs,
            "overall_success_rate": success_rate,
            "data_processed_mb": total_data_mb,
            "active_alerts": active_alerts_count,
            "avg_response_time": self.calculate_avg_response_time(recent_syncs),
            "uptime_percentage": success_rate  # Simplified calculation
        }
    
    async def get_all_provider_health(self, tenant_id: int) -> List[IntegrationHealthStatus]:
        """
        Get health status for all providers used by tenant
        """
        provider_health_list = []
        
        # Get all providers used by tenant
        provider_query = self.db.query(IntegrationProvider).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).distinct()
        
        for provider in provider_query:
            connections = self.db.query(IntegrationConnection).filter(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationConnection.provider_id == provider.id
            ).all()
            
            if connections:
                provider_health = await self.monitor_provider_health(provider.id, connections, tenant_id)
                provider_health_list.append(provider_health)
        
        # Sort by health score (worst first)
        provider_health_list.sort(key=lambda x: x.overall_health_score)
        
        return provider_health_list
    
    async def get_recent_alerts(self, tenant_id: int, hours: int = 24) -> List[HealthAlert]:
        """
        Get recent alerts for tenant
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        recent_alerts = [
            alert for alert in self.active_alerts.values()
            if alert.tenant_id == tenant_id and alert.created_at >= cutoff_time
        ]
        
        # Sort by severity and creation time
        severity_order = {AlertSeverity.EMERGENCY: 0, AlertSeverity.CRITICAL: 1, 
                         AlertSeverity.WARNING: 2, AlertSeverity.INFO: 3}
        
        recent_alerts.sort(key=lambda x: (severity_order[x.severity], x.created_at), reverse=True)
        
        return recent_alerts[:20]  # Return last 20 alerts
    
    async def get_performance_trends(self, tenant_id: int, days: int = 7) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get performance trends over specified period
        """
        trends = {
            "success_rate": [],
            "response_time": [],
            "sync_volume": [],
            "error_rate": []
        }
        
        # Generate daily trend data for the specified period
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=i)
            start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1)
            
            # Get syncs for this day
            day_syncs = self.db.query(IntegrationSyncLog).join(IntegrationConnection).filter(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationSyncLog.started_at >= start_date,
                IntegrationSyncLog.started_at < end_date
            ).all()
            
            if day_syncs:
                total_syncs = len(day_syncs)
                successful_syncs = len([s for s in day_syncs if s.status == "success"])
                success_rate = (successful_syncs / total_syncs) * 100
                
                response_times = [s.duration_seconds for s in day_syncs if s.duration_seconds]
                avg_response_time = statistics.mean(response_times) * 1000 if response_times else 0
                
                error_rate = 100 - success_rate
                
                trends["success_rate"].append({
                    "date": start_date.isoformat(),
                    "value": success_rate
                })
                trends["response_time"].append({
                    "date": start_date.isoformat(),
                    "value": avg_response_time
                })
                trends["sync_volume"].append({
                    "date": start_date.isoformat(),
                    "value": total_syncs
                })
                trends["error_rate"].append({
                    "date": start_date.isoformat(),
                    "value": error_rate
                })
        
        # Reverse to get chronological order
        for trend_type in trends:
            trends[trend_type].reverse()
        
        return trends
    
    async def get_top_performing_integrations(self, tenant_id: int) -> List[Dict[str, Any]]:
        """
        Get top performing integrations by various metrics
        """
        top_performers = []
        
        # Get all connections with recent activity
        connections = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationConnection.last_sync_at >= datetime.utcnow() - timedelta(days=7)
        ).all()
        
        connection_scores = []
        
        for connection in connections:
            # Calculate performance score for each connection
            health_data = await self.analyze_connection_health(connection)
            
            # Calculate composite score
            score = (
                health_data["success_rate"] * 0.4 +  # 40% weight on success rate
                (100 - min(health_data["avg_response_time"] / 100, 100)) * 0.3 +  # 30% weight on speed
                health_data["uptime_percentage"] * 0.3  # 30% weight on uptime
            )
            
            connection_scores.append({
                "connection_id": connection.id,
                "connection_name": connection.connection_name,
                "provider_name": connection.provider.name if connection.provider else "Unknown",
                "score": score,
                "success_rate": health_data["success_rate"],
                "avg_response_time": health_data["avg_response_time"],
                "total_syncs": health_data["total_syncs"]
            })
        
        # Sort by score and return top 10
        connection_scores.sort(key=lambda x: x["score"], reverse=True)
        return connection_scores[:10]
    
    # Helper methods
    def calculate_health_score(self, response_time: float, success_rate: float, uptime: float) -> float:
        """
        Calculate overall health score (0-100) based on key metrics
        """
        # Normalize response time (lower is better)
        response_score = max(0.0, 100.0 - (response_time / 100.0))  # 100ms = 1 point deduction
        
        # Success rate and uptime are already percentages
        success_score = success_rate
        uptime_score = uptime
        
        # Weighted average
        health_score = (
            response_score * 0.3 +  # 30% weight on response time
            success_score * 0.4 +   # 40% weight on success rate
            uptime_score * 0.3      # 30% weight on uptime
        )
        
        return max(0.0, min(100.0, health_score))
    
    async def calculate_health_trending(self, provider_id: int, tenant_id: int) -> str:
        """
        Calculate health trending (improving, stable, degrading)
        """
        # Get health scores from last 7 days
        # This is a simplified implementation
        # In practice, you'd store historical health scores
        
        # For now, return a mock trending based on current metrics
        return "stable"
    
    def calculate_avg_response_time(self, syncs: List[IntegrationSyncLog]) -> float:
        """
        Calculate average response time from sync logs
        """
        response_times = [s.duration_seconds for s in syncs if s.duration_seconds]
        return statistics.mean(response_times) * 1000 if response_times else 0  # Convert to ms
    
    async def store_alert(self, alert: HealthAlert):
        """
        Store alert in memory (in production, this would be in database)
        """
        self.active_alerts[alert.id] = alert
        logger.info(f"Alert generated: {alert.severity.value} - {alert.title}")
    
    async def resolve_alert(self, alert_id: str, resolution_notes: str) -> bool:
        """
        Resolve an active alert
        """
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id].resolved_at = datetime.utcnow()
            self.active_alerts[alert_id].resolution_notes = resolution_notes
            logger.info(f"Alert resolved: {alert_id}")
            return True
        return False
    
    async def calculate_performance_metrics(self, tenant_id: int) -> Dict[str, Any]:
        """
        Calculate comprehensive performance metrics
        """
        return {
            "overall_health_score": 85.5,  # Mock value
            "avg_response_time": 1250,     # Mock value
            "success_rate": 96.8,          # Mock value
            "uptime_percentage": 99.2,     # Mock value
            "data_throughput": 125.5,      # Mock value (MB/hour)
            "error_rate": 3.2              # Mock value
        }
    
    async def generate_health_recommendations(self, tenant_id: int) -> List[Dict[str, Any]]:
        """
        Generate health-based recommendations
        """
        recommendations = []
        
        # Get recent alerts to base recommendations on
        recent_alerts = await self.get_recent_alerts(tenant_id, hours=168)  # Last week
        
        if any(alert.severity in [AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY] for alert in recent_alerts):
            recommendations.append({
                "type": "critical_action",
                "priority": "high",
                "title": "Address Critical Integration Issues",
                "description": "Multiple critical alerts detected. Immediate attention required.",
                "actions": [
                    "Review critical alerts and error logs",
                    "Check API credentials and permissions",
                    "Verify network connectivity",
                    "Contact provider support if needed"
                ]
            })
        
        if len(recent_alerts) > 10:
            recommendations.append({
                "type": "monitoring",
                "priority": "medium",
                "title": "Implement Proactive Monitoring",
                "description": "High alert volume suggests need for better monitoring.",
                "actions": [
                    "Set up automated health checks",
                    "Implement predictive alerting",
                    "Create monitoring dashboards",
                    "Establish alert escalation procedures"
                ]
            })
        
        return recommendations
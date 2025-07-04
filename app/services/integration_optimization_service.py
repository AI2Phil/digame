"""
Integration Optimization Service - Phase 2A Implementation
Priority 2: Integration Ecosystem Completion (75% → 95%)

Enhanced integration optimization, monitoring, and performance management
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
import logging
from dataclasses import dataclass
from enum import Enum
import statistics

from ..models.integration import (
    IntegrationProvider, IntegrationConnection, IntegrationSyncLog,
    IntegrationWebhook, IntegrationDataMapping, IntegrationAnalytics
)

logger = logging.getLogger(__name__)


class HealthStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


@dataclass
class IntegrationHealth:
    provider_id: int
    provider_name: str
    status: HealthStatus
    success_rate: float
    avg_response_time: float
    error_count: int
    last_check: datetime
    issues: List[str]
    recommendations: List[str]


@dataclass
class PerformanceMetrics:
    provider_id: int
    connection_id: Optional[int]
    avg_response_time: float
    success_rate: float
    throughput: float
    error_rate: float
    uptime_percentage: float
    last_24h_syncs: int
    data_volume_mb: float


class IntegrationOptimizationService:
    """
    Advanced integration optimization and monitoring service
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.performance_thresholds = {
            "response_time_warning": 5000,  # 5 seconds
            "response_time_critical": 10000,  # 10 seconds
            "success_rate_warning": 90.0,  # 90%
            "success_rate_critical": 80.0,  # 80%
            "error_rate_warning": 5.0,  # 5%
            "error_rate_critical": 10.0,  # 10%
            "uptime_warning": 95.0,  # 95%
            "uptime_critical": 90.0  # 90%
        }
    
    async def optimize_all_integrations(self, tenant_id: int) -> Dict[str, Any]:
        """
        Perform comprehensive optimization for all tenant integrations
        """
        logger.info(f"Starting integration optimization for tenant {tenant_id}")
        
        optimization_results: Dict[str, Any] = {
            "tenant_id": tenant_id,
            "optimization_started": datetime.utcnow(),
            "providers_optimized": 0,
            "connections_optimized": 0,
            "performance_improvements": [],
            "health_checks": [],
            "recommendations": [],
            "errors": []
        }
        
        try:
            # Get all active connections for tenant
            connections = self.db.query(IntegrationConnection).filter(
                IntegrationConnection.tenant_id == tenant_id,
                IntegrationConnection.status == "active"
            ).all()
            
            # Optimize each connection
            for connection in connections:
                try:
                    connection_result = await self.optimize_connection(connection.id)
                    optimization_results["connections_optimized"] += 1
                    
                    if connection_result.get("improvements"):
                        optimization_results["performance_improvements"].extend(
                            connection_result["improvements"]
                        )
                    
                except Exception as e:
                    logger.error(f"Failed to optimize connection {connection.id}: {str(e)}")
                    optimization_results["errors"].append({
                        "connection_id": connection.id,
                        "error": str(e)
                    })
            
            # Perform health checks
            health_results = await self.perform_health_checks(tenant_id)
            optimization_results["health_checks"] = health_results
            
            # Generate optimization recommendations
            recommendations = await self.generate_optimization_recommendations(tenant_id)
            optimization_results["recommendations"] = recommendations
            
            # Update optimization metrics
            await self.update_optimization_metrics(tenant_id, optimization_results)
            
            optimization_results["optimization_completed"] = datetime.utcnow()
            optimization_results["success"] = True
            
        except Exception as e:
            logger.error(f"Integration optimization failed for tenant {tenant_id}: {str(e)}")
            optimization_results["success"] = False
            optimization_results["error"] = str(e)
        
        return optimization_results
    
    async def optimize_connection(self, connection_id: int) -> Dict[str, Any]:
        """
        Optimize a specific integration connection
        """
        # Get connection from database
        connection = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id
        ).first()
        
        if not connection:
            return {
                "connection_id": connection_id,
                "error": "Connection not found"
            }
        
        optimization_result: Dict[str, Any] = {
            "connection_id": connection.id,
            "provider_name": connection.provider.name if connection.provider else "unknown",
            "improvements": [],
            "performance_before": {},
            "performance_after": {},
            "optimizations_applied": []
        }
        
        try:
            # Get current performance metrics
            performance_before = await self.get_connection_performance(connection.id)
            optimization_result["performance_before"] = performance_before.__dict__
            
            # Apply rate limit optimization
            if await self.optimize_rate_limits(connection):
                optimization_result["optimizations_applied"].append("rate_limit_optimization")
            
            # Optimize retry mechanisms
            if await self.optimize_retry_strategy(connection):
                optimization_result["optimizations_applied"].append("retry_strategy_optimization")
            
            # Optimize data sync settings
            if await self.optimize_sync_settings(connection):
                optimization_result["optimizations_applied"].append("sync_settings_optimization")
            
            # Optimize webhook configuration
            if await self.optimize_webhooks(connection):
                optimization_result["optimizations_applied"].append("webhook_optimization")
            
            # Update connection configuration
            await self.update_connection_config(connection, optimization_result["optimizations_applied"])
            
            # Get performance metrics after optimization
            performance_after = await self.get_connection_performance(connection.id)
            optimization_result["performance_after"] = performance_after.__dict__
            
            # Calculate improvements
            improvements = self.calculate_performance_improvements(performance_before, performance_after)
            optimization_result["improvements"] = improvements
            
        except Exception as e:
            logger.error(f"Failed to optimize connection {connection.id}: {str(e)}")
            optimization_result["error"] = str(e)
        
        return optimization_result
    
    async def perform_health_checks(self, tenant_id: int) -> List[IntegrationHealth]:
        """
        Perform comprehensive health checks for all integrations
        """
        health_results = []
        
        # Get all providers used by tenant
        provider_query = self.db.query(IntegrationProvider).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).distinct()
        
        for provider in provider_query:
            try:
                health = await self.check_provider_health(provider, tenant_id)
                health_results.append(health)
            except Exception as e:
                logger.error(f"Health check failed for provider {provider.name}: {str(e)}")
                health_results.append(IntegrationHealth(
                    provider_id=provider.id,
                    provider_name=provider.name,
                    status=HealthStatus.UNKNOWN,
                    success_rate=0.0,
                    avg_response_time=0.0,
                    error_count=0,
                    last_check=datetime.utcnow(),
                    issues=[f"Health check failed: {str(e)}"],
                    recommendations=["Investigate health check failure"]
                ))
        
        return health_results
    
    async def check_provider_health(self, provider: IntegrationProvider, tenant_id: int) -> IntegrationHealth:
        """
        Check health status for a specific provider
        """
        # Get recent sync logs for this provider
        recent_syncs = self.db.query(IntegrationSyncLog).join(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id,
            IntegrationConnection.provider_id == provider.id,
            IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if not recent_syncs:
            return IntegrationHealth(
                provider_id=provider.id,
                provider_name=provider.name,
                status=HealthStatus.UNKNOWN,
                success_rate=0.0,
                avg_response_time=0.0,
                error_count=0,
                last_check=datetime.utcnow(),
                issues=["No recent sync activity"],
                recommendations=["Verify integration is properly configured"]
            )
        
        # Calculate metrics
        total_syncs = len(recent_syncs)
        successful_syncs = len([s for s in recent_syncs if s.status == "success"])
        success_rate = (successful_syncs / total_syncs) * 100 if total_syncs > 0 else 0
        
        response_times = [s.duration_seconds for s in recent_syncs if s.duration_seconds]
        avg_response_time = statistics.mean(response_times) * 1000 if response_times else 0  # Convert to ms
        
        error_count = total_syncs - successful_syncs
        
        # Determine health status
        status = HealthStatus.HEALTHY
        issues = []
        recommendations = []
        
        if success_rate < self.performance_thresholds["success_rate_critical"]:
            status = HealthStatus.CRITICAL
            issues.append(f"Critical success rate: {success_rate:.1f}%")
            recommendations.append("Investigate connection authentication and API limits")
        elif success_rate < self.performance_thresholds["success_rate_warning"]:
            status = HealthStatus.WARNING
            issues.append(f"Low success rate: {success_rate:.1f}%")
            recommendations.append("Review error logs and optimize retry strategy")
        
        if avg_response_time > self.performance_thresholds["response_time_critical"]:
            status = HealthStatus.CRITICAL
            issues.append(f"Critical response time: {avg_response_time:.0f}ms")
            recommendations.append("Optimize API calls and implement caching")
        elif avg_response_time > self.performance_thresholds["response_time_warning"]:
            if status != HealthStatus.CRITICAL:
                status = HealthStatus.WARNING
            issues.append(f"Slow response time: {avg_response_time:.0f}ms")
            recommendations.append("Consider request batching and connection pooling")
        
        return IntegrationHealth(
            provider_id=provider.id,
            provider_name=provider.name,
            status=status,
            success_rate=success_rate,
            avg_response_time=avg_response_time,
            error_count=error_count,
            last_check=datetime.utcnow(),
            issues=issues,
            recommendations=recommendations
        )
    
    async def get_connection_performance(self, connection_id: int) -> PerformanceMetrics:
        """
        Get detailed performance metrics for a connection
        """
        # Get recent sync logs
        recent_syncs = self.db.query(IntegrationSyncLog).filter(
            IntegrationSyncLog.connection_id == connection_id,
            IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if not recent_syncs:
            return PerformanceMetrics(
                provider_id=0,
                connection_id=connection_id,
                avg_response_time=0.0,
                success_rate=0.0,
                throughput=0.0,
                error_rate=0.0,
                uptime_percentage=0.0,
                last_24h_syncs=0,
                data_volume_mb=0.0
            )
        
        # Calculate metrics
        total_syncs = len(recent_syncs)
        successful_syncs = len([s for s in recent_syncs if s.status == "success"])
        success_rate = (successful_syncs / total_syncs) * 100 if total_syncs > 0 else 0
        error_rate = 100 - success_rate
        
        response_times = [s.duration_seconds for s in recent_syncs if s.duration_seconds]
        avg_response_time = statistics.mean(response_times) * 1000 if response_times else 0
        
        # Calculate throughput (records per hour)
        total_records = sum(s.records_processed or 0 for s in recent_syncs)
        throughput = total_records / 24.0  # records per hour
        
        # Calculate data volume
        total_bytes = sum(s.data_size_bytes or 0 for s in recent_syncs)
        data_volume_mb = total_bytes / (1024 * 1024)
        
        # Estimate uptime (simplified)
        uptime_percentage = success_rate  # Simplified calculation
        
        return PerformanceMetrics(
            provider_id=recent_syncs[0].connection.provider_id if recent_syncs[0].connection else 0,
            connection_id=connection_id,
            avg_response_time=avg_response_time,
            success_rate=success_rate,
            throughput=throughput,
            error_rate=error_rate,
            uptime_percentage=uptime_percentage,
            last_24h_syncs=total_syncs,
            data_volume_mb=data_volume_mb
        )
    
    async def optimize_rate_limits(self, connection: IntegrationConnection) -> bool:
        """
        Optimize rate limiting configuration for connection
        """
        try:
            provider = connection.provider
            if not provider or not provider.rate_limits:
                return False
            
            # Get current sync settings
            sync_settings: Dict[str, Any] = dict(connection.sync_settings or {})
            
            # Calculate optimal batch size based on rate limits
            rate_limits = provider.rate_limits
            optimal_batch_size = self.calculate_optimal_batch_size(rate_limits)
            
            # Update sync settings if different
            current_batch_size = sync_settings.get("batch_size", 100)
            if optimal_batch_size != current_batch_size:
                sync_settings["batch_size"] = optimal_batch_size
                sync_settings["rate_limit_optimized"] = True
                sync_settings["optimization_timestamp"] = datetime.utcnow().isoformat()
                
                connection.sync_settings = sync_settings
                self.db.commit()
                
                logger.info(f"Optimized batch size for connection {connection.id}: {current_batch_size} -> {optimal_batch_size}")
                return True
            
        except Exception as e:
            logger.error(f"Failed to optimize rate limits for connection {connection.id}: {str(e)}")
        
        return False
    
    async def optimize_retry_strategy(self, connection: IntegrationConnection) -> bool:
        """
        Optimize retry strategy based on historical performance
        """
        try:
            # Analyze recent failures
            recent_failures = self.db.query(IntegrationSyncLog).filter(
                IntegrationSyncLog.connection_id == connection.id,
                IntegrationSyncLog.status == "failed",
                IntegrationSyncLog.started_at >= datetime.utcnow() - timedelta(days=7)
            ).all()
            
            if not recent_failures:
                return False
            
            # Analyze failure patterns
            failure_analysis = self.analyze_failure_patterns(recent_failures)
            
            # Update retry configuration
            sync_settings: Dict[str, Any] = dict(connection.sync_settings or {})
            retry_config: Dict[str, Any] = dict(sync_settings.get("retry_config", {}))
            
            # Optimize based on failure patterns
            if failure_analysis["rate_limit_errors"] > 0.3:  # 30% rate limit errors
                retry_config["exponential_backoff"] = True
                retry_config["max_retry_delay"] = 300  # 5 minutes
                retry_config["base_delay"] = 60  # 1 minute
            
            if failure_analysis["timeout_errors"] > 0.2:  # 20% timeout errors
                retry_config["timeout_multiplier"] = 1.5
                retry_config["max_timeout"] = 300  # 5 minutes
            
            if failure_analysis["temporary_errors"] > 0.4:  # 40% temporary errors
                retry_config["max_retries"] = 5
                retry_config["retry_on_timeout"] = True
            
            # Update connection if changes made
            if retry_config != sync_settings.get("retry_config", {}):
                sync_settings["retry_config"] = retry_config
                sync_settings["retry_optimized"] = True
                sync_settings["optimization_timestamp"] = datetime.utcnow().isoformat()
                
                connection.sync_settings = sync_settings
                self.db.commit()
                
                logger.info(f"Optimized retry strategy for connection {connection.id}")
                return True
            
        except Exception as e:
            logger.error(f"Failed to optimize retry strategy for connection {connection.id}: {str(e)}")
        
        return False
    
    async def optimize_sync_settings(self, connection: IntegrationConnection) -> bool:
        """
        Optimize synchronization settings based on usage patterns
        """
        try:
            # Analyze sync patterns
            sync_analysis = await self.analyze_sync_patterns(connection.id)
            
            sync_settings: Dict[str, Any] = dict(connection.sync_settings or {})
            optimizations_made = False
            
            # Optimize sync frequency
            if sync_analysis["avg_data_change_rate"] < 0.1:  # Low change rate
                optimal_interval = max(sync_settings.get("sync_interval", 3600), 7200)  # At least 2 hours
                if sync_settings.get("sync_interval", 3600) != optimal_interval:
                    sync_settings["sync_interval"] = optimal_interval
                    optimizations_made = True
            
            # Optimize incremental sync
            if sync_analysis["incremental_efficiency"] > 0.8:  # High efficiency
                sync_settings["prefer_incremental"] = True
                sync_settings["full_sync_interval"] = 86400  # Daily full sync
                optimizations_made = True
            
            # Optimize field selection
            if sync_analysis["unused_fields_ratio"] > 0.3:  # 30% unused fields
                sync_settings["optimize_field_selection"] = True
                sync_settings["exclude_unused_fields"] = True
                optimizations_made = True
            
            if optimizations_made:
                sync_settings["sync_optimized"] = True
                sync_settings["optimization_timestamp"] = datetime.utcnow().isoformat()
                
                connection.sync_settings = sync_settings
                self.db.commit()
                
                logger.info(f"Optimized sync settings for connection {connection.id}")
                return True
            
        except Exception as e:
            logger.error(f"Failed to optimize sync settings for connection {connection.id}: {str(e)}")
        
        return False
    
    async def optimize_webhooks(self, connection: IntegrationConnection) -> bool:
        """
        Optimize webhook configuration for better performance
        """
        try:
            webhooks = self.db.query(IntegrationWebhook).filter(
                IntegrationWebhook.connection_id == connection.id,
                IntegrationWebhook.is_active == True
            ).all()
            
            if not webhooks:
                return False
            
            optimizations_made = False
            
            for webhook in webhooks:
                # Analyze webhook performance
                webhook_analysis = await self.analyze_webhook_performance(webhook.id)
                
                # Optimize timeout settings
                if webhook_analysis["avg_response_time"] > webhook.timeout_seconds * 0.8:
                    new_timeout = min(webhook.timeout_seconds * 1.5, 300)  # Max 5 minutes
                    webhook.timeout_seconds = int(new_timeout)
                    optimizations_made = True
                
                # Optimize retry configuration
                if webhook_analysis["failure_rate"] > 0.1:  # 10% failure rate
                    retry_config = webhook.retry_config or {}
                    retry_config["max_retries"] = 3
                    retry_config["exponential_backoff"] = True
                    retry_config["base_delay"] = 5
                    webhook.retry_config = retry_config
                    optimizations_made = True
                
                # Optimize event filtering
                if webhook_analysis["irrelevant_events_ratio"] > 0.2:  # 20% irrelevant
                    # This would require more sophisticated event analysis
                    # For now, just flag for manual review
                    webhook.needs_optimization = True
                    optimizations_made = True
            
            if optimizations_made:
                self.db.commit()
                logger.info(f"Optimized webhooks for connection {connection.id}")
                return True
            
        except Exception as e:
            logger.error(f"Failed to optimize webhooks for connection {connection.id}: {str(e)}")
        
        return False
    
    async def generate_optimization_recommendations(self, tenant_id: int) -> List[Dict[str, Any]]:
        """
        Generate optimization recommendations based on analysis
        """
        recommendations = []
        
        try:
            # Analyze overall tenant integration performance
            tenant_analysis = await self.analyze_tenant_performance(tenant_id)
            
            # Generate recommendations based on analysis
            if tenant_analysis["avg_success_rate"] < 95:
                recommendations.append({
                    "type": "reliability",
                    "priority": "high",
                    "title": "Improve Integration Reliability",
                    "description": f"Overall success rate is {tenant_analysis['avg_success_rate']:.1f}%. Consider implementing better error handling and retry strategies.",
                    "actions": [
                        "Review failed sync logs",
                        "Implement exponential backoff",
                        "Add connection health monitoring",
                        "Set up alerting for failures"
                    ],
                    "estimated_impact": "20-30% improvement in success rate"
                })
            
            if tenant_analysis["avg_response_time"] > 5000:  # 5 seconds
                recommendations.append({
                    "type": "performance",
                    "priority": "medium",
                    "title": "Optimize API Response Times",
                    "description": f"Average response time is {tenant_analysis['avg_response_time']:.0f}ms. Consider implementing caching and request optimization.",
                    "actions": [
                        "Implement response caching",
                        "Optimize API request batching",
                        "Use connection pooling",
                        "Implement request compression"
                    ],
                    "estimated_impact": "40-60% reduction in response time"
                })
            
            if tenant_analysis["underutilized_integrations"] > 0:
                recommendations.append({
                    "type": "utilization",
                    "priority": "low",
                    "title": "Increase Integration Utilization",
                    "description": f"{tenant_analysis['underutilized_integrations']} integrations are underutilized. Consider training or automation.",
                    "actions": [
                        "Provide user training",
                        "Set up automated workflows",
                        "Create integration templates",
                        "Add usage analytics dashboard"
                    ],
                    "estimated_impact": "Increased ROI from existing integrations"
                })
            
            if tenant_analysis["data_redundancy"] > 0.3:  # 30% redundancy
                recommendations.append({
                    "type": "efficiency",
                    "priority": "medium",
                    "title": "Reduce Data Redundancy",
                    "description": f"High data redundancy detected ({tenant_analysis['data_redundancy']:.1%}). Optimize field mappings and sync settings.",
                    "actions": [
                        "Review field mappings",
                        "Implement selective sync",
                        "Use incremental sync where possible",
                        "Optimize data transformation"
                    ],
                    "estimated_impact": "30-50% reduction in data transfer"
                })
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations for tenant {tenant_id}: {str(e)}")
            recommendations.append({
                "type": "error",
                "priority": "high",
                "title": "Analysis Error",
                "description": f"Failed to analyze tenant performance: {str(e)}",
                "actions": ["Contact support for assistance"],
                "estimated_impact": "Unknown"
            })
        
        return recommendations
    
    # Helper methods
    def calculate_optimal_batch_size(self, rate_limits: Dict[str, Any]) -> int:
        """Calculate optimal batch size based on rate limits"""
        if "requests_per_minute" in rate_limits:
            return min(rate_limits["requests_per_minute"] // 10, 100)
        elif "requests_per_second" in rate_limits:
            return min(rate_limits["requests_per_second"] * 5, 50)
        elif "requests_per_hour" in rate_limits:
            return min(rate_limits["requests_per_hour"] // 100, 200)
        return 50  # Default batch size
    
    def analyze_failure_patterns(self, failures: List[IntegrationSyncLog]) -> Dict[str, float]:
        """Analyze patterns in sync failures"""
        total_failures = len(failures)
        if total_failures == 0:
            return {"rate_limit_errors": 0, "timeout_errors": 0, "temporary_errors": 0}
        
        rate_limit_errors = len([f for f in failures if "rate limit" in (f.error_message or "").lower()])
        timeout_errors = len([f for f in failures if "timeout" in (f.error_message or "").lower()])
        temporary_errors = len([f for f in failures if any(term in (f.error_message or "").lower() 
                                                         for term in ["temporary", "503", "502", "504"])])
        
        return {
            "rate_limit_errors": rate_limit_errors / total_failures,
            "timeout_errors": timeout_errors / total_failures,
            "temporary_errors": temporary_errors / total_failures
        }
    
    async def analyze_sync_patterns(self, connection_id: int) -> Dict[str, float]:
        """Analyze synchronization patterns for optimization"""
        # This would implement sophisticated pattern analysis
        # For now, return mock data
        return {
            "avg_data_change_rate": 0.15,
            "incremental_efficiency": 0.85,
            "unused_fields_ratio": 0.25
        }
    
    async def analyze_webhook_performance(self, webhook_id: int) -> Dict[str, float]:
        """Analyze webhook performance metrics"""
        # This would implement webhook performance analysis
        # For now, return mock data
        return {
            "avg_response_time": 2.5,
            "failure_rate": 0.05,
            "irrelevant_events_ratio": 0.15
        }
    
    async def analyze_tenant_performance(self, tenant_id: int) -> Dict[str, Any]:
        """Analyze overall tenant integration performance"""
        # Get all connections for tenant
        connections = self.db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == tenant_id
        ).all()
        
        if not connections:
            return {
                "avg_success_rate": 0,
                "avg_response_time": 0,
                "underutilized_integrations": 0,
                "data_redundancy": 0
            }
        
        # Calculate aggregate metrics
        total_success_rate = 0
        total_response_time = 0
        active_connections = 0
        
        for connection in connections:
            if connection.total_syncs and connection.total_syncs > 0:
                success_rate = (connection.successful_syncs / connection.total_syncs) * 100
                total_success_rate += success_rate
                total_response_time += connection.avg_sync_duration or 0
                active_connections += 1
        
        avg_success_rate = total_success_rate / active_connections if active_connections > 0 else 0
        avg_response_time = (total_response_time / active_connections) * 1000 if active_connections > 0 else 0  # Convert to ms
        
        # Count underutilized integrations (less than 1 sync per day on average)
        underutilized = len([c for c in connections if (c.total_syncs or 0) < 7])  # Less than 7 syncs in recent period
        
        return {
            "avg_success_rate": avg_success_rate,
            "avg_response_time": avg_response_time,
            "underutilized_integrations": underutilized,
            "data_redundancy": 0.2  # Mock value
        }
    
    def calculate_performance_improvements(self, before: PerformanceMetrics, after: PerformanceMetrics) -> List[Dict[str, Any]]:
        """Calculate performance improvements between before and after metrics"""
        improvements = []
        
        # Response time improvement
        if before.avg_response_time > 0 and after.avg_response_time < before.avg_response_time:
            improvement_pct = ((before.avg_response_time - after.avg_response_time) / before.avg_response_time) * 100
            improvements.append({
                "metric": "response_time",
                "improvement_percentage": improvement_pct,
                "before_value": before.avg_response_time,
                "after_value": after.avg_response_time,
                "description": f"Response time improved by {improvement_pct:.1f}%"
            })
        
        # Success rate improvement
        if after.success_rate > before.success_rate:
            improvement_pct = after.success_rate - before.success_rate
            improvements.append({
                "metric": "success_rate",
                "improvement_percentage": improvement_pct,
                "before_value": before.success_rate,
                "after_value": after.success_rate,
                "description": f"Success rate improved by {improvement_pct:.1f} percentage points"
            })
        
        # Throughput improvement
        if after.throughput > before.throughput:
            improvement_pct = ((after.throughput - before.throughput) / before.throughput) * 100 if before.throughput > 0 else 0
            improvements.append({
                "metric": "throughput",
                "improvement_percentage": improvement_pct,
                "before_value": before.throughput,
                "after_value": after.throughput,
                "description": f"Throughput improved by {improvement_pct:.1f}%"
            })
        
        return improvements
    
    async def update_connection_config(self, connection: IntegrationConnection, optimizations: Any):
        """Update connection configuration with optimization flags"""
        try:
            sync_settings: Dict[str, Any] = dict(connection.sync_settings or {})
            sync_settings["optimizations_applied"] = optimizations
            sync_settings["last_optimization"] = datetime.utcnow().isoformat()
            sync_settings["optimization_version"] = "2.0"
            
            connection.sync_settings = sync_settings
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to update connection config for {connection.id}: {str(e)}")
    
    async def update_optimization_metrics(self, tenant_id: int, optimization_results: Dict[str, Any]):
        """Update optimization metrics in database"""
        try:
            # This would update optimization metrics in the database
            # For now, just log the results
            logger.info(f"Optimization metrics updated for tenant {tenant_id}: {optimization_results}")
        except Exception as e:
            logger.error(f"Failed to update optimization metrics: {str(e)}")
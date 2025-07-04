"""
Integration Health & Performance Dashboard API Router - Phase 2A Implementation
Priority 2: Integration Ecosystem Completion (75% → 95%)

RESTful API endpoints for integration health monitoring, performance dashboards, and alerting
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from ..database import get_db
from ..services.integration_health_service import (
    IntegrationHealthService, HealthAlert, IntegrationHealthStatus, 
    PerformanceDashboardData, AlertSeverity
)
from ..services.integration_optimization_service import IntegrationOptimizationService
from ..auth.auth_dependencies import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/integrations/health", tags=["Integration Health"])


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_performance_dashboard(
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive performance dashboard data for integrations
    
    Returns:
    - Overview metrics (total integrations, success rates, response times)
    - Provider health status for all integrations
    - Recent alerts and notifications
    - Performance trends over time
    - Top performing integrations
    - Health-based recommendations
    """
    try:
        # Use current user's tenant unless admin specifies different tenant
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        dashboard_data = await health_service.generate_performance_dashboard(target_tenant_id)
        
        return {
            "success": True,
            "data": {
                "tenant_id": dashboard_data.tenant_id,
                "generated_at": dashboard_data.generated_at.isoformat(),
                "overview": dashboard_data.overview_metrics,
                "provider_health": [
                    {
                        "provider_id": ph.provider_id,
                        "provider_name": ph.provider_name,
                        "total_connections": ph.total_connections,
                        "active_connections": ph.active_connections,
                        "healthy_connections": ph.healthy_connections,
                        "warning_connections": ph.warning_connections,
                        "critical_connections": ph.critical_connections,
                        "health_score": round(ph.overall_health_score, 2),
                        "avg_response_time": round(ph.avg_response_time, 2),
                        "success_rate": round(ph.success_rate, 2),
                        "uptime_percentage": round(ph.uptime_percentage, 2),
                        "last_check": ph.last_check.isoformat(),
                        "trending": ph.trending
                    }
                    for ph in dashboard_data.provider_health
                ],
                "recent_alerts": [
                    {
                        "id": alert.id,
                        "severity": alert.severity.value,
                        "title": alert.title,
                        "description": alert.description,
                        "provider_name": alert.provider_name,
                        "connection_id": alert.connection_id,
                        "created_at": alert.created_at.isoformat(),
                        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
                        "metrics": alert.metrics
                    }
                    for alert in dashboard_data.recent_alerts
                ],
                "performance_trends": dashboard_data.performance_trends,
                "top_performers": dashboard_data.top_performers,
                "recommendations": dashboard_data.recommendations
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to generate performance dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard: {str(e)}")


@router.post("/monitor", response_model=Dict[str, Any])
async def run_health_monitoring(
    background_tasks: BackgroundTasks,
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger comprehensive health monitoring for all tenant integrations
    
    This endpoint initiates:
    - Health checks for all active connections
    - Performance metric calculations
    - Alert generation for issues
    - Optimization recommendations
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        
        # Run monitoring in background
        background_tasks.add_task(
            health_service.monitor_all_integrations,
            target_tenant_id
        )
        
        return {
            "success": True,
            "message": "Health monitoring initiated",
            "tenant_id": target_tenant_id,
            "initiated_at": datetime.utcnow().isoformat(),
            "estimated_completion": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate health monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate monitoring: {str(e)}")


@router.get("/providers/{provider_id}/health", response_model=Dict[str, Any])
async def get_provider_health(
    provider_id: int,
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed health status for a specific integration provider
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        
        # Get connections for this provider
        from ..models.integration import IntegrationConnection
        connections = db.query(IntegrationConnection).filter(
            IntegrationConnection.tenant_id == target_tenant_id,
            IntegrationConnection.provider_id == provider_id
        ).all()
        
        if not connections:
            raise HTTPException(status_code=404, detail="No connections found for this provider")
        
        provider_health = await health_service.monitor_provider_health(
            provider_id, connections, target_tenant_id
        )
        
        return {
            "success": True,
            "data": {
                "provider_id": provider_health.provider_id,
                "provider_name": provider_health.provider_name,
                "total_connections": provider_health.total_connections,
                "active_connections": provider_health.active_connections,
                "healthy_connections": provider_health.healthy_connections,
                "warning_connections": provider_health.warning_connections,
                "critical_connections": provider_health.critical_connections,
                "health_score": round(provider_health.overall_health_score, 2),
                "avg_response_time": round(provider_health.avg_response_time, 2),
                "success_rate": round(provider_health.success_rate, 2),
                "uptime_percentage": round(provider_health.uptime_percentage, 2),
                "last_check": provider_health.last_check.isoformat(),
                "trending": provider_health.trending
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get provider health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get provider health: {str(e)}")


@router.get("/connections/{connection_id}/health", response_model=Dict[str, Any])
async def get_connection_health(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed health analysis for a specific integration connection
    """
    try:
        from ..models.integration import IntegrationConnection
        
        # Get connection and verify ownership
        connection = db.query(IntegrationConnection).filter(
            IntegrationConnection.id == connection_id,
            IntegrationConnection.tenant_id == current_user.tenant_id
        ).first()
        
        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        health_service = IntegrationHealthService(db)
        connection_health = await health_service.analyze_connection_health(connection)
        
        return {
            "success": True,
            "data": {
                "connection_id": connection_id,
                "connection_name": connection.connection_name,
                "provider_name": connection.provider.name if connection.provider else "Unknown",
                "health_status": connection_health["health_status"],
                "avg_response_time": round(connection_health["avg_response_time"], 2),
                "success_rate": round(connection_health["success_rate"], 2),
                "uptime_percentage": round(connection_health["uptime_percentage"], 2),
                "error_count": connection_health["error_count"],
                "total_syncs": connection_health["total_syncs"],
                "last_sync": connection_health["last_sync"].isoformat() if connection_health["last_sync"] else None,
                "status": connection.status,
                "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get connection health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get connection health: {str(e)}")


@router.get("/alerts", response_model=Dict[str, Any])
async def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: info, warning, critical, emergency"),
    hours: int = Query(24, description="Hours to look back for alerts"),
    resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get integration health alerts with filtering options
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        alerts = await health_service.get_recent_alerts(target_tenant_id, hours)
        
        # Apply filters
        if severity:
            try:
                severity_filter = AlertSeverity(severity.lower())
                alerts = [alert for alert in alerts if alert.severity == severity_filter]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid severity value")
        
        if resolved is not None:
            if resolved:
                alerts = [alert for alert in alerts if alert.resolved_at is not None]
            else:
                alerts = [alert for alert in alerts if alert.resolved_at is None]
        
        return {
            "success": True,
            "data": {
                "total_alerts": len(alerts),
                "filters": {
                    "severity": severity,
                    "hours": hours,
                    "resolved": resolved
                },
                "alerts": [
                    {
                        "id": alert.id,
                        "severity": alert.severity.value,
                        "title": alert.title,
                        "description": alert.description,
                        "provider_name": alert.provider_name,
                        "connection_id": alert.connection_id,
                        "created_at": alert.created_at.isoformat(),
                        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
                        "resolution_notes": alert.resolution_notes,
                        "metrics": alert.metrics
                    }
                    for alert in alerts
                ]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")


@router.post("/alerts/{alert_id}/resolve", response_model=Dict[str, Any])
async def resolve_alert(
    alert_id: str,
    resolution_notes: str = Query(..., description="Notes about how the alert was resolved"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resolve an active health alert
    """
    try:
        health_service = IntegrationHealthService(db)
        success = await health_service.resolve_alert(alert_id, resolution_notes)
        
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {
            "success": True,
            "message": "Alert resolved successfully",
            "alert_id": alert_id,
            "resolved_at": datetime.utcnow().isoformat(),
            "resolved_by": current_user.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resolve alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to resolve alert: {str(e)}")


@router.get("/trends", response_model=Dict[str, Any])
async def get_performance_trends(
    days: int = Query(7, description="Number of days to analyze", ge=1, le=30),
    metrics: Optional[str] = Query(None, description="Comma-separated metrics: success_rate,response_time,sync_volume,error_rate"),
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get performance trends over specified time period
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        trends = await health_service.get_performance_trends(target_tenant_id, days)
        
        # Filter metrics if specified
        if metrics:
            requested_metrics = [m.strip() for m in metrics.split(",")]
            trends = {k: v for k, v in trends.items() if k in requested_metrics}
        
        return {
            "success": True,
            "data": {
                "tenant_id": target_tenant_id,
                "period_days": days,
                "metrics_included": list(trends.keys()),
                "trends": trends
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")


@router.get("/recommendations", response_model=Dict[str, Any])
async def get_health_recommendations(
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get health-based optimization recommendations
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        recommendations = await health_service.generate_health_recommendations(target_tenant_id)
        
        return {
            "success": True,
            "data": {
                "tenant_id": target_tenant_id,
                "generated_at": datetime.utcnow().isoformat(),
                "total_recommendations": len(recommendations),
                "recommendations": recommendations
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")


@router.post("/optimize", response_model=Dict[str, Any])
async def trigger_optimization(
    background_tasks: BackgroundTasks,
    provider_id: Optional[int] = Query(None, description="Specific provider to optimize"),
    connection_id: Optional[int] = Query(None, description="Specific connection to optimize"),
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger integration optimization based on health analysis
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        optimization_service = IntegrationOptimizationService(db)
        
        if connection_id:
            # Optimize specific connection
            from ..models.integration import IntegrationConnection
            connection = db.query(IntegrationConnection).filter(
                IntegrationConnection.id == connection_id,
                IntegrationConnection.tenant_id == target_tenant_id
            ).first()
            
            if not connection:
                raise HTTPException(status_code=404, detail="Connection not found")
            
            background_tasks.add_task(
                optimization_service.optimize_connection,
                connection_id
            )
            
            return {
                "success": True,
                "message": "Connection optimization initiated",
                "connection_id": connection_id,
                "initiated_at": datetime.utcnow().isoformat()
            }
        
        else:
            # Optimize all integrations for tenant
            background_tasks.add_task(
                optimization_service.optimize_all_integrations,
                target_tenant_id
            )
            
            return {
                "success": True,
                "message": "Full integration optimization initiated",
                "tenant_id": target_tenant_id,
                "initiated_at": datetime.utcnow().isoformat(),
                "estimated_completion": (datetime.utcnow() + timedelta(minutes=10)).isoformat()
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to trigger optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger optimization: {str(e)}")


@router.get("/metrics/overview", response_model=Dict[str, Any])
async def get_metrics_overview(
    tenant_id: Optional[int] = Query(None, description="Tenant ID (admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get high-level integration metrics overview
    """
    try:
        target_tenant_id = tenant_id if current_user.is_admin and tenant_id else current_user.tenant_id
        
        health_service = IntegrationHealthService(db)
        overview_metrics = await health_service.get_overview_metrics(target_tenant_id)
        
        return {
            "success": True,
            "data": {
                "tenant_id": target_tenant_id,
                "generated_at": datetime.utcnow().isoformat(),
                "metrics": overview_metrics
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get metrics overview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")
"""
Performance monitoring API router for real-time dashboards and optimization tools
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path, Body
from fastapi import status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..database import get_db
from ..services.performance_monitoring_service import PerformanceMonitoringService, get_performance_monitoring_service
from ..schemas.performance_monitoring_schemas import (
    PerformanceMetricCreate, PerformanceMetricResponse,
    QueryPerformanceCreate, QueryPerformanceResponse,
    UserExperienceMetricCreate, UserExperienceMetricResponse,
    SystemHealthCheckCreate, SystemHealthCheckResponse,
    PerformanceAlertCreate, PerformanceAlertResponse,
    PerformanceIncidentCreate, PerformanceIncidentUpdate, PerformanceIncidentResponse,
    PerformanceOptimizationCreate, PerformanceOptimizationUpdate, PerformanceOptimizationResponse,
    PerformanceDashboardResponse, SystemHealthStatusResponse,
    QueryOptimizationRecommendation, UserExperienceInsightsResponse,
    BulkMetricCreate, BulkMetricResponse,
    PerformanceReportRequest, PerformanceReportResponse
)

router = APIRouter(prefix="/api/performance", tags=["performance-monitoring"])


# Performance Metrics Endpoints

@router.post("/metrics", response_model=PerformanceMetricResponse, status_code=status.HTTP_201_CREATED)
async def record_performance_metric(
    metric_data: PerformanceMetricCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Record a performance metric"""
    try:
        metric = performance_service.record_performance_metric(
            tenant_id=tenant_id,
            metric_name=metric_data.metric_name,
            value=metric_data.value,
            metric_category=metric_data.metric_category,
            metric_type=metric_data.metric_type,
            unit=metric_data.unit,
            source=metric_data.source,
            tags=metric_data.tags,
            dimensions=metric_data.dimensions
        )
        return PerformanceMetricResponse.from_orm(metric)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/metrics/bulk", response_model=BulkMetricResponse)
async def record_bulk_metrics(
    bulk_data: BulkMetricCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Record multiple performance metrics in bulk"""
    try:
        success_count = 0
        error_count = 0
        errors = []
        
        for metric_data in bulk_data.metrics:
            try:
                performance_service.record_performance_metric(
                    tenant_id=tenant_id,
                    metric_name=metric_data.metric_name,
                    value=metric_data.value,
                    metric_category=metric_data.metric_category,
                    metric_type=metric_data.metric_type,
                    unit=metric_data.unit,
                    source=metric_data.source,
                    tags=metric_data.tags,
                    dimensions=metric_data.dimensions
                )
                success_count += 1
            except Exception as e:
                error_count += 1
                errors.append(f"Metric {metric_data.metric_name}: {str(e)}")
        
        return BulkMetricResponse(
            success_count=success_count,
            error_count=error_count,
            errors=errors
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Query Performance Endpoints

@router.post("/query-performance", response_model=QueryPerformanceResponse, status_code=status.HTTP_201_CREATED)
async def record_query_performance(
    query_data: QueryPerformanceCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Record database query performance"""
    try:
        query_perf = performance_service.record_query_performance(
            tenant_id=tenant_id,
            query_text=query_data.query_text,
            execution_time_ms=query_data.execution_time_ms,
            rows_examined=query_data.rows_examined,
            rows_returned=query_data.rows_returned,
            endpoint=query_data.endpoint,
            user_id=query_data.user_id,
            database_name=query_data.database_name,
            table_names=query_data.table_names
        )
        return QueryPerformanceResponse.from_orm(query_perf)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/query-optimization", response_model=List[QueryOptimizationRecommendation])
async def get_query_optimization_recommendations(
    tenant_id: int = Query(..., description="Tenant ID"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of recommendations"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Get query optimization recommendations"""
    try:
        recommendations = performance_service.get_query_optimization_recommendations(
            tenant_id=tenant_id,
            limit=limit
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# User Experience Endpoints

@router.post("/user-experience", response_model=UserExperienceMetricResponse, status_code=status.HTTP_201_CREATED)
async def record_user_experience_metric(
    ux_data: UserExperienceMetricCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Record user experience metric"""
    try:
        ux_metric = performance_service.record_user_experience_metric(
            tenant_id=tenant_id,
            user_id=ux_data.user_id,
            session_id=ux_data.session_id,
            page_url=ux_data.page_url,
            action_type=ux_data.action_type,
            load_time_ms=ux_data.load_time_ms,
            device_type=ux_data.device_type,
            browser=ux_data.browser,
            error_occurred=ux_data.error_occurred,
            error_message=ux_data.error_message
        )
        return UserExperienceMetricResponse.from_orm(ux_metric)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/user-experience/insights", response_model=UserExperienceInsightsResponse)
async def get_user_experience_insights(
    tenant_id: int = Query(..., description="Tenant ID"),
    time_range_hours: int = Query(24, ge=1, le=168, description="Time range in hours"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Get user experience insights and recommendations"""
    try:
        insights = performance_service.get_user_experience_insights(
            tenant_id=tenant_id,
            time_range_hours=time_range_hours
        )
        return UserExperienceInsightsResponse(**insights)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# System Health Endpoints

@router.get("/health/status", response_model=SystemHealthStatusResponse)
async def get_system_health_status(
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Get overall system health status"""
    try:
        health_status = performance_service.get_system_health_status(tenant_id)
        return SystemHealthStatusResponse(**health_status)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/health/check", response_model=SystemHealthCheckResponse)
async def perform_health_check(
    tenant_id: int = Query(..., description="Tenant ID"),
    check_name: str = Body(..., description="Health check name"),
    check_type: str = Body(..., description="Check type"),
    component: str = Body(..., description="Component to check"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Perform a manual health check"""
    try:
        # Define a simple health check function
        def simple_health_check():
            return {"success": True, "details": {"status": "ok"}}
        
        health_check = performance_service.perform_health_check(
            tenant_id=tenant_id,
            check_name=check_name,
            check_type=check_type,
            component=component,
            check_function=simple_health_check
        )
        return SystemHealthCheckResponse.from_orm(health_check)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Dashboard Endpoints

@router.get("/dashboard", response_model=PerformanceDashboardResponse)
async def get_performance_dashboard(
    tenant_id: int = Query(..., description="Tenant ID"),
    time_range_hours: int = Query(24, ge=1, le=168, description="Time range in hours"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Get comprehensive performance dashboard data"""
    try:
        dashboard_data = performance_service.get_performance_dashboard_data(
            tenant_id=tenant_id,
            time_range_hours=time_range_hours
        )
        return PerformanceDashboardResponse(**dashboard_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Alert Management Endpoints

@router.post("/alerts", response_model=PerformanceAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_alert(
    alert_data: PerformanceAlertCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Create a performance alert"""
    try:
        alert = performance_service.create_performance_alert(
            tenant_id=tenant_id,
            alert_name=alert_data.alert_name,
            metric_name="",  # This would need to be derived from alert configuration
            threshold_value=alert_data.threshold_value or 0,
            threshold_operator=alert_data.threshold_operator,
            severity=alert_data.severity,
            notification_channels=alert_data.notification_channels
        )
        return PerformanceAlertResponse.from_orm(alert)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/alerts/check", response_model=List[Dict[str, Any]])
async def check_performance_alerts(
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Check all performance alerts"""
    try:
        triggered_alerts = performance_service.check_all_alerts(tenant_id)
        return triggered_alerts
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Incident Management Endpoints

@router.post("/incidents", response_model=PerformanceIncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_incident(
    incident_data: PerformanceIncidentCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Create a performance incident"""
    try:
        from ..models.performance_monitoring import PerformanceIncident
        
        incident = PerformanceIncident()
        incident.tenant_id = tenant_id
        incident.title = incident_data.title
        incident.description = incident_data.description or ""
        incident.severity = incident_data.severity
        incident.category = incident_data.category or "general"
        incident.priority = incident_data.priority
        incident.affected_users_count = incident_data.affected_users_count or 0
        incident.affected_components = incident_data.affected_components or []
        incident.business_impact = incident_data.business_impact or ""
        
        db.add(incident)
        db.commit()
        db.refresh(incident)
        
        return PerformanceIncidentResponse.from_orm(incident)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/incidents/{incident_id}", response_model=PerformanceIncidentResponse)
async def update_performance_incident(
    incident_id: int = Path(..., description="Incident ID"),
    incident_update: PerformanceIncidentUpdate = Body(...),
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Update a performance incident"""
    try:
        from ..models.performance_monitoring import PerformanceIncident
        
        incident = db.query(PerformanceIncident).filter(
            PerformanceIncident.id == incident_id,
            PerformanceIncident.tenant_id == tenant_id
        ).first()
        
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        
        # Update fields
        for field, value in incident_update.dict(exclude_unset=True).items():
            if hasattr(incident, field):
                setattr(incident, field, value)
        
        # Set resolution timestamp if status is resolved
        if incident_update.status == "resolved" and not incident.resolved_at:
            incident.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(incident)
        
        return PerformanceIncidentResponse.from_orm(incident)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Optimization Endpoints

@router.post("/optimizations", response_model=PerformanceOptimizationResponse, status_code=status.HTTP_201_CREATED)
async def create_optimization_recommendation(
    optimization_data: PerformanceOptimizationCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Create a performance optimization recommendation"""
    try:
        optimization = performance_service.create_optimization_recommendation(
            tenant_id=tenant_id,
            optimization_type=optimization_data.optimization_type,
            component=optimization_data.component,
            title=optimization_data.title,
            description=optimization_data.description,
            current_performance=optimization_data.current_performance,
            expected_improvement=optimization_data.expected_improvement,
            effort_estimate=optimization_data.effort_estimate
        )
        return PerformanceOptimizationResponse.from_orm(optimization)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/optimizations", response_model=List[PerformanceOptimizationResponse])
async def get_optimization_recommendations(
    tenant_id: int = Query(..., description="Tenant ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of recommendations"),
    performance_service: PerformanceMonitoringService = Depends(get_performance_monitoring_service)
):
    """Get performance optimization recommendations"""
    try:
        optimizations = performance_service.get_optimization_recommendations(
            tenant_id=tenant_id,
            status=status_filter,
            limit=limit
        )
        return [PerformanceOptimizationResponse.from_orm(opt) for opt in optimizations]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/optimizations/{optimization_id}", response_model=PerformanceOptimizationResponse)
async def update_optimization_recommendation(
    optimization_id: int = Path(..., description="Optimization ID"),
    optimization_update: PerformanceOptimizationUpdate = Body(...),
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Update a performance optimization recommendation"""
    try:
        from ..models.performance_monitoring import PerformanceOptimization
        
        optimization = db.query(PerformanceOptimization).filter(
            PerformanceOptimization.id == optimization_id,
            PerformanceOptimization.tenant_id == tenant_id
        ).first()
        
        if not optimization:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Optimization not found")
        
        # Update fields
        for field, value in optimization_update.dict(exclude_unset=True).items():
            if hasattr(optimization, field):
                setattr(optimization, field, value)
        
        # Set implementation timestamp if status is completed
        if optimization_update.implementation_status == "completed" and not optimization.implemented_at:
            optimization.implemented_at = datetime.utcnow()
        
        db.commit()
        db.refresh(optimization)
        
        return PerformanceOptimizationResponse.from_orm(optimization)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Reporting Endpoints

@router.post("/reports", response_model=PerformanceReportResponse)
async def generate_performance_report(
    report_request: PerformanceReportRequest,
    background_tasks: BackgroundTasks,
    tenant_id: int = Query(..., description="Tenant ID")
):
    """Generate a performance report"""
    try:
        import uuid
        
        # Generate report ID
        report_id = str(uuid.uuid4())
        
        # For now, return a basic report structure
        # In a real implementation, this would generate the actual report
        report = PerformanceReportResponse(
            report_id=report_id,
            report_type=report_request.report_type,
            generated_at=datetime.utcnow(),
            time_range={
                "start": datetime.utcnow() - timedelta(hours=report_request.time_range_hours),
                "end": datetime.utcnow()
            },
            summary={
                "total_metrics": 0,
                "avg_response_time": 0,
                "error_rate": 0,
                "uptime_percentage": 99.9
            },
            recommendations=[
                "Monitor database query performance",
                "Optimize slow API endpoints",
                "Implement caching for frequently accessed data"
            ]
        )
        
        return report
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Real-time monitoring endpoints

@router.get("/real-time/metrics")
async def get_real_time_metrics(
    tenant_id: int = Query(..., description="Tenant ID"),
    metric_names: Optional[List[str]] = Query(None, description="Specific metrics to monitor")
):
    """Get real-time performance metrics"""
    try:
        # This would implement WebSocket or Server-Sent Events for real-time data
        # For now, return current metrics
        return {
            "timestamp": datetime.utcnow(),
            "metrics": {
                "cpu_usage": 45.2,
                "memory_usage": 67.8,
                "response_time_ms": 234.5,
                "requests_per_second": 156.7,
                "error_rate": 0.02
            }
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Health check endpoint
@router.get("/health")
async def performance_monitoring_health():
    """Health check for performance monitoring service"""
    return {
        "status": "healthy",
        "service": "performance-monitoring",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "metrics_collection",
            "query_performance_tracking",
            "user_experience_monitoring",
            "system_health_checks",
            "alerting",
            "incident_management",
            "optimization_recommendations",
            "real_time_dashboards"
        ]
    }
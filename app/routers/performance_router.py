"""
Performance & Monitoring API Router
Database-driven endpoints for Performance & Monitoring Components
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.services.performance_service import PerformanceService
from app.auth.auth_dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/performance", tags=["Performance & Monitoring"])

# Create a separate router for v1 API compatibility
v1_router = APIRouter(prefix="/api/v1/performance", tags=["Performance Metrics V1"])

@v1_router.get("/metrics")
async def get_performance_metrics_v1(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get performance metrics - v1 API compatibility endpoint"""
    try:
        service = PerformanceService(db)
        dashboard_data = service.get_performance_dashboard_data()
        
        return {
            "success": True,
            "data": dashboard_data,
            "message": "Performance metrics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/user-experience/analytics")
async def get_user_experience_analytics(
    time_range: str = Query("24h", description="Time range: 1h, 24h, 7d, 30d"),
    device_filter: str = Query("all", description="Device filter: all, desktop, mobile, tablet"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive user experience analytics"""
    try:
        service = PerformanceService(db)
        analytics = service.get_user_experience_analytics(time_range, device_filter)
        
        return {
            "success": True,
            "data": analytics,
            "message": "User experience analytics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user experience analytics: {str(e)}")

@router.post("/user-experience/session")
async def create_user_session(
    session_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new user session"""
    try:
        service = PerformanceService(db)
        session = service.create_user_session(session_data)
        
        return {
            "success": True,
            "data": {"session_id": session.id},
            "message": "User session created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user session: {str(e)}")

@router.put("/user-experience/session/{session_id}")
async def update_session_metrics(
    session_id: str,
    metrics: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update session metrics"""
    try:
        service = PerformanceService(db)
        session = service.update_session_metrics(session_id, metrics)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": {"session_id": session.id},
            "message": "Session metrics updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session metrics: {str(e)}")

@router.post("/user-experience/page-view")
async def record_page_view(
    page_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a page view"""
    try:
        service = PerformanceService(db)
        page_view = service.record_page_view(page_data)
        
        return {
            "success": True,
            "data": {"page_view_id": page_view.id},
            "message": "Page view recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record page view: {str(e)}")

@router.post("/user-experience/web-vital")
async def record_web_vital(
    vital_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a Core Web Vital metric"""
    try:
        service = PerformanceService(db)
        web_vital = service.record_web_vital(vital_data)
        
        return {
            "success": True,
            "data": {"web_vital_id": web_vital.id},
            "message": "Web vital recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record web vital: {str(e)}")

@router.get("/query-optimization/analytics")
async def get_query_optimization_analytics(
    database_filter: str = Query("all", description="Database filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get query optimization analytics"""
    try:
        service = PerformanceService(db)
        analytics = service.get_query_performance_analytics(database_filter)
        
        return {
            "success": True,
            "data": analytics,
            "message": "Query optimization analytics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get query optimization analytics: {str(e)}")

@router.post("/query-optimization/record")
async def record_database_query(
    query_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a database query execution"""
    try:
        service = PerformanceService(db)
        db_query = service.record_database_query(query_data)
        
        return {
            "success": True,
            "data": {"query_id": db_query.id},
            "message": "Database query recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record database query: {str(e)}")

@router.get("/bundle-analysis")
async def get_bundle_analysis(
    build_id: Optional[str] = Query(None, description="Build ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get bundle analysis data"""
    try:
        service = PerformanceService(db)
        analysis = service.get_bundle_analysis(build_id)
        
        return {
            "success": True,
            "data": analysis,
            "message": "Bundle analysis retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bundle analysis: {str(e)}")

@router.post("/bundle-analysis/record")
async def record_bundle_analysis(
    build_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record bundle analysis results"""
    try:
        service = PerformanceService(db)
        build_id = build_data.get("build_id")
        assets_data = build_data.get("assets", [])
        
        if not build_id or not assets_data:
            raise HTTPException(status_code=400, detail="build_id and assets are required")
        
        assets = service.record_bundle_analysis(build_id, assets_data)
        
        return {
            "success": True,
            "data": {"build_id": build_id, "assets_count": len(assets)},
            "message": "Bundle analysis recorded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record bundle analysis: {str(e)}")

@router.get("/monitoring/dashboard")
async def get_performance_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive performance dashboard data"""
    try:
        service = PerformanceService(db)
        dashboard_data = service.get_performance_dashboard_data()
        
        return {
            "success": True,
            "data": dashboard_data,
            "message": "Performance dashboard data retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance dashboard data: {str(e)}")

@router.post("/monitoring/metric")
async def record_performance_metric(
    metric_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a performance metric"""
    try:
        service = PerformanceService(db)
        metric = service.record_performance_metric(metric_data)
        
        return {
            "success": True,
            "data": {"metric_id": metric.id},
            "message": "Performance metric recorded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record performance metric: {str(e)}")

@router.get("/monitoring/system-health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current system health metrics"""
    try:
        service = PerformanceService(db)
        system_health = service._get_current_system_health()
        
        return {
            "success": True,
            "data": system_health,
            "message": "System health retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")

@router.get("/monitoring/alerts")
async def get_performance_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    limit: int = Query(50, description="Limit number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get performance alerts"""
    try:
        from app.models.performance_models import GeneralPerformanceAlert
        from sqlalchemy import desc
        
        query = db.query(GeneralPerformanceAlert)
        
        if severity:
            query = query.filter(GeneralPerformanceAlert.severity == severity)
        
        if resolved is not None:
            query = query.filter(GeneralPerformanceAlert.resolved == resolved)
        
        alerts = query.order_by(desc(GeneralPerformanceAlert.created_at)).limit(limit).all()
        
        formatted_alerts = []
        for alert in alerts:
            formatted_alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'title': alert.title,
                'description': alert.description,
                'component': alert.component,
                'resolved': alert.resolved,
                'timestamp': alert.created_at,
                'actions': alert.actions_taken or []
            })
        
        return {
            "success": True,
            "data": {"alerts": formatted_alerts},
            "message": "Performance alerts retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance alerts: {str(e)}")

@router.post("/monitoring/alert")
async def create_performance_alert(
    alert_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a performance alert"""
    try:
        from app.models.performance_models import GeneralPerformanceAlert
        
        alert = GeneralPerformanceAlert(
            alert_type=alert_data.get('type'),
            severity=alert_data.get('severity'),
            title=alert_data.get('title'),
            description=alert_data.get('description'),
            component=alert_data.get('component'),
            metric_name=alert_data.get('metric_name'),
            metric_value=alert_data.get('metric_value'),
            threshold_value=alert_data.get('threshold_value')
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        return {
            "success": True,
            "data": {"alert_id": alert.id},
            "message": "Performance alert created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create performance alert: {str(e)}")

@router.put("/monitoring/alert/{alert_id}/resolve")
async def resolve_performance_alert(
    alert_id: str,
    resolution_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve a performance alert"""
    try:
        from app.models.performance_models import GeneralPerformanceAlert
        
        alert = db.query(GeneralPerformanceAlert).filter(GeneralPerformanceAlert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.resolved = True
        alert.resolved_at = datetime.now(timezone.utc)
        alert.resolved_by = current_user.id
        alert.actions_taken = resolution_data.get('actions_taken', [])
        alert.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(alert)
        
        return {
            "success": True,
            "data": {"alert_id": alert.id},
            "message": "Performance alert resolved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve performance alert: {str(e)}")

@router.get("/optimization/recommendations")
async def get_optimization_recommendations(
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get performance optimization recommendations"""
    try:
        service = PerformanceService(db)
        recommendations = service._get_performance_optimizations()
        
        # Apply filters
        if category:
            recommendations = [r for r in recommendations if r.get('category') == category]
        
        if priority:
            recommendations = [r for r in recommendations if r.get('priority') == priority]
        
        return {
            "success": True,
            "data": {"recommendations": recommendations},
            "message": "Optimization recommendations retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get optimization recommendations: {str(e)}")

# Health check endpoint
@router.get("/health")
async def performance_health_check():
    """Health check for performance monitoring system"""
    try:
        import psutil
        
        # Basic system checks
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_status = "healthy"
        if isinstance(cpu_percent, (int, float)) and cpu_percent > 90:
            health_status = "warning"
        elif memory.percent > 90 or disk.percent > 90:
            health_status = "warning"
        
        return {
            "success": True,
            "data": {
                "status": health_status,
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "timestamp": datetime.now(timezone.utc)
            },
            "message": "Performance monitoring system is operational"
        }
    except Exception as e:
        return {
            "success": False,
            "data": {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc)
            },
            "message": "Performance monitoring system health check failed"
        }

# Export both routers for inclusion in main app
__all__ = ["router", "v1_router"]
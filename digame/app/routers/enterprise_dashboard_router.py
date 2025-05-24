"""
Enterprise Dashboard router for unified enterprise feature management
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ..database import get_db
from ..services.enterprise_dashboard_service import EnterpriseDashboardService
from ..models.enterprise_dashboard import (
    EnterpriseDashboard, DashboardWidget, EnterpriseMetric, 
    DashboardAlert, EnterpriseFeatureUsage, DashboardExport
)

router = APIRouter(prefix="/enterprise/dashboard", tags=["Enterprise Dashboard"])


# Pydantic Models
class DashboardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dashboard_type: str = Field(default="enterprise")
    layout_type: str = Field(default="grid")
    layout_config: Dict[str, Any] = Field(default_factory=dict)
    is_default: bool = False
    is_public: bool = False
    auto_refresh: bool = True
    refresh_interval: int = Field(default=300, ge=30, le=3600)
    allowed_roles: List[str] = Field(default_factory=list)
    allowed_users: List[int] = Field(default_factory=list)
    theme: str = Field(default="light")
    color_scheme: Dict[str, Any] = Field(default_factory=dict)
    custom_css: Optional[str] = None
    create_default_widgets: bool = True


class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    dashboard_type: Optional[str] = None
    layout_type: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None
    auto_refresh: Optional[bool] = None
    refresh_interval: Optional[int] = Field(None, ge=30, le=3600)
    allowed_roles: Optional[List[str]] = None
    allowed_users: Optional[List[int]] = None
    theme: Optional[str] = None
    color_scheme: Optional[Dict[str, Any]] = None
    custom_css: Optional[str] = None


class DashboardResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    description: Optional[str]
    dashboard_type: str
    layout_type: str
    layout_config: Dict[str, Any]
    is_default: bool
    is_public: bool
    auto_refresh: bool
    refresh_interval: int
    allowed_roles: List[str]
    allowed_users: List[int]
    theme: str
    color_scheme: Dict[str, Any]
    custom_css: Optional[str]
    view_count: int
    last_viewed: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: int

    class Config:
        from_attributes = True


class WidgetCreate(BaseModel):
    widget_id: str = Field(..., min_length=1, max_length=100)
    widget_name: str = Field(..., min_length=1, max_length=200)
    widget_type: str = Field(..., min_length=1, max_length=50)
    data_source: str = Field(..., min_length=1, max_length=100)
    query_config: Dict[str, Any] = Field(default_factory=dict)
    display_config: Dict[str, Any] = Field(default_factory=dict)
    position_x: int = Field(default=0, ge=0)
    position_y: int = Field(default=0, ge=0)
    width: int = Field(default=4, ge=1, le=12)
    height: int = Field(default=3, ge=1, le=12)
    z_index: int = Field(default=1, ge=1)
    title: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    is_visible: bool = True
    is_resizable: bool = True
    is_movable: bool = True
    auto_refresh: bool = True
    refresh_interval: int = Field(default=300, ge=30, le=3600)


class WidgetUpdate(BaseModel):
    widget_name: Optional[str] = Field(None, min_length=1, max_length=200)
    widget_type: Optional[str] = Field(None, min_length=1, max_length=50)
    data_source: Optional[str] = Field(None, min_length=1, max_length=100)
    query_config: Optional[Dict[str, Any]] = None
    display_config: Optional[Dict[str, Any]] = None
    position_x: Optional[int] = Field(None, ge=0)
    position_y: Optional[int] = Field(None, ge=0)
    width: Optional[int] = Field(None, ge=1, le=12)
    height: Optional[int] = Field(None, ge=1, le=12)
    z_index: Optional[int] = Field(None, ge=1)
    title: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    is_visible: Optional[bool] = None
    is_resizable: Optional[bool] = None
    is_movable: Optional[bool] = None
    auto_refresh: Optional[bool] = None
    refresh_interval: Optional[int] = Field(None, ge=30, le=3600)


class WidgetResponse(BaseModel):
    id: int
    dashboard_id: int
    widget_id: str
    widget_name: str
    widget_type: str
    data_source: str
    query_config: Dict[str, Any]
    display_config: Dict[str, Any]
    position_x: int
    position_y: int
    width: int
    height: int
    z_index: int
    title: Optional[str]
    subtitle: Optional[str]
    is_visible: bool
    is_resizable: bool
    is_movable: bool
    auto_refresh: bool
    refresh_interval: int
    last_refreshed: Optional[datetime]
    load_time_ms: float
    error_count: int
    last_error: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class MetricCreate(BaseModel):
    metric_name: str = Field(..., min_length=1, max_length=100)
    metric_category: str = Field(..., min_length=1, max_length=50)
    metric_type: str = Field(..., min_length=1, max_length=50)
    value: float
    previous_value: Optional[float] = None
    target_value: Optional[float] = None
    threshold_warning: Optional[float] = None
    threshold_critical: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    calculation_method: Optional[str] = None
    period_start: datetime
    period_end: datetime
    granularity: str = Field(default="daily")
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    data_completeness: float = Field(default=1.0, ge=0.0, le=1.0)


class MetricResponse(BaseModel):
    id: int
    tenant_id: int
    metric_name: str
    metric_category: str
    metric_type: str
    value: float
    previous_value: Optional[float]
    target_value: Optional[float]
    threshold_warning: Optional[float]
    threshold_critical: Optional[float]
    unit: Optional[str]
    description: Optional[str]
    calculation_method: Optional[str]
    period_start: datetime
    period_end: datetime
    granularity: str
    status: str
    trend: Optional[str]
    change_percentage: Optional[float]
    confidence_score: float
    data_completeness: float
    last_calculated: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    alert_name: str = Field(..., min_length=1, max_length=200)
    alert_type: str = Field(..., min_length=1, max_length=50)
    severity: str = Field(..., regex="^(low|medium|high|critical)$")
    condition: str = Field(..., min_length=1, max_length=100)
    threshold_value: float
    message: str = Field(..., min_length=1)
    description: Optional[str] = None
    recommended_action: Optional[str] = None
    notification_channels: List[str] = Field(default_factory=list)
    notification_frequency: str = Field(default="immediate")
    suppress_duration: int = Field(default=3600, ge=0)


class AlertResponse(BaseModel):
    id: int
    tenant_id: int
    alert_name: str
    alert_type: str
    severity: str
    condition: str
    threshold_value: float
    is_active: bool
    is_triggered: bool
    trigger_count: int
    last_triggered: Optional[datetime]
    message: str
    description: Optional[str]
    recommended_action: Optional[str]
    notification_channels: List[str]
    notification_frequency: str
    suppress_duration: int
    is_acknowledged: bool
    acknowledged_by: Optional[int]
    acknowledged_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: int

    class Config:
        from_attributes = True


class FeatureUsageCreate(BaseModel):
    feature_name: str = Field(..., min_length=1, max_length=100)
    feature_category: str = Field(..., min_length=1, max_length=50)
    action: str = Field(..., min_length=1, max_length=100)
    session_id: Optional[str] = Field(None, max_length=100)
    duration_seconds: Optional[float] = Field(None, ge=0)
    resource_consumption: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = None
    referrer: Optional[str] = Field(None, max_length=500)
    response_time_ms: Optional[float] = Field(None, ge=0)
    success: bool = True
    error_message: Optional[str] = None
    business_value: Optional[float] = None
    cost_center: Optional[str] = Field(None, max_length=100)
    project_code: Optional[str] = Field(None, max_length=100)


class ExportCreate(BaseModel):
    export_name: str = Field(..., min_length=1, max_length=200)
    export_format: str = Field(..., regex="^(pdf|excel|csv|json|png)$")
    export_scope: str = Field(default="full", regex="^(full|widgets|data_only)$")
    include_charts: bool = True
    include_data: bool = True
    include_metadata: bool = False
    page_orientation: str = Field(default="landscape", regex="^(portrait|landscape)$")
    is_scheduled: bool = False
    schedule_cron: Optional[str] = Field(None, max_length=100)
    next_execution: Optional[datetime] = None
    is_public: bool = False
    expires_at: Optional[datetime] = None


class ExportResponse(BaseModel):
    id: int
    tenant_id: int
    dashboard_id: int
    export_name: str
    export_format: str
    export_scope: str
    include_charts: bool
    include_data: bool
    include_metadata: bool
    page_orientation: str
    is_scheduled: bool
    schedule_cron: Optional[str]
    next_execution: Optional[datetime]
    status: str
    file_path: Optional[str]
    file_size_bytes: Optional[int]
    generation_time_seconds: Optional[float]
    error_message: Optional[str]
    retry_count: int
    is_public: bool
    access_token: Optional[str]
    expires_at: Optional[datetime]
    download_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: int

    class Config:
        from_attributes = True


# Dashboard Management Endpoints
@router.post("/dashboards", response_model=DashboardResponse)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="User ID of creator"),
    db: Session = Depends(get_db)
):
    """Create a new enterprise dashboard"""
    try:
        service = EnterpriseDashboardService(db)
        dashboard = await service.create_dashboard(
            tenant_id=tenant_id,
            created_by=created_by,
            dashboard_data=dashboard_data.dict()
        )
        return DashboardResponse.from_orm(dashboard)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create dashboard: {str(e)}"
        )


@router.get("/dashboards", response_model=List[DashboardResponse])
async def list_dashboards(
    tenant_id: int = Query(..., description="Tenant ID"),
    user_id: Optional[int] = Query(None, description="User ID for access control"),
    dashboard_type: Optional[str] = Query(None, description="Filter by dashboard type"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """List enterprise dashboards for a tenant"""
    try:
        service = EnterpriseDashboardService(db)
        dashboards = await service.list_dashboards(
            tenant_id=tenant_id,
            user_id=user_id,
            dashboard_type=dashboard_type,
            skip=skip,
            limit=limit
        )
        return [DashboardResponse.from_orm(dashboard) for dashboard in dashboards]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list dashboards: {str(e)}"
        )


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Get a specific enterprise dashboard"""
    try:
        service = EnterpriseDashboardService(db)
        dashboard = await service.get_dashboard(dashboard_id, tenant_id)
        if not dashboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dashboard not found"
            )
        return DashboardResponse.from_orm(dashboard)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard: {str(e)}"
        )


@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: int,
    dashboard_data: DashboardUpdate,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Update an enterprise dashboard"""
    try:
        service = EnterpriseDashboardService(db)
        dashboard = await service.update_dashboard(
            dashboard_id=dashboard_id,
            tenant_id=tenant_id,
            update_data=dashboard_data.dict(exclude_unset=True)
        )
        if not dashboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dashboard not found"
            )
        return DashboardResponse.from_orm(dashboard)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dashboard: {str(e)}"
        )


@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Delete an enterprise dashboard"""
    try:
        service = EnterpriseDashboardService(db)
        success = await service.delete_dashboard(dashboard_id, tenant_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dashboard not found"
            )
        return {"message": "Dashboard deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dashboard: {str(e)}"
        )


# Widget Management Endpoints
@router.post("/dashboards/{dashboard_id}/widgets", response_model=WidgetResponse)
async def add_widget(
    dashboard_id: int,
    widget_data: WidgetCreate,
    db: Session = Depends(get_db)
):
    """Add a widget to a dashboard"""
    try:
        service = EnterpriseDashboardService(db)
        widget = await service.add_widget(
            dashboard_id=dashboard_id,
            widget_data=widget_data.dict()
        )
        return WidgetResponse.from_orm(widget)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add widget: {str(e)}"
        )


@router.put("/widgets/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: int,
    widget_data: WidgetUpdate,
    db: Session = Depends(get_db)
):
    """Update a dashboard widget"""
    try:
        service = EnterpriseDashboardService(db)
        widget = await service.update_widget(
            widget_id=widget_id,
            update_data=widget_data.dict(exclude_unset=True)
        )
        if not widget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Widget not found"
            )
        return WidgetResponse.from_orm(widget)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update widget: {str(e)}"
        )


@router.get("/widgets/{widget_id}/data")
async def get_widget_data(
    widget_id: int,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Get data for a specific widget"""
    try:
        service = EnterpriseDashboardService(db)
        widget = db.query(DashboardWidget).filter(DashboardWidget.id == widget_id).first()
        if not widget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Widget not found"
            )
        
        data = await service.get_widget_data(widget, tenant_id)
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get widget data: {str(e)}"
        )


# Metrics Management Endpoints
@router.post("/metrics", response_model=MetricResponse)
async def record_metric(
    metric_data: MetricCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Record an enterprise metric"""
    try:
        service = EnterpriseDashboardService(db)
        metric = await service.record_metric(
            tenant_id=tenant_id,
            metric_data=metric_data.dict()
        )
        return MetricResponse.from_orm(metric)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record metric: {str(e)}"
        )


@router.get("/metrics", response_model=List[MetricResponse])
async def get_metrics(
    tenant_id: int = Query(..., description="Tenant ID"),
    category: Optional[str] = Query(None, description="Filter by metric category"),
    days: int = Query(30, ge=1, le=365, description="Number of days to retrieve"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get enterprise metrics"""
    try:
        from datetime import timedelta
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = db.query(EnterpriseMetric).filter(
            EnterpriseMetric.tenant_id == tenant_id,
            EnterpriseMetric.period_start >= start_date
        )
        
        if category:
            query = query.filter(EnterpriseMetric.metric_category == category)
        
        metrics = query.order_by(EnterpriseMetric.period_start.desc()).offset(skip).limit(limit).all()
        return [MetricResponse.from_orm(metric) for metric in metrics]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )


# Alert Management Endpoints
@router.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="User ID of creator"),
    db: Session = Depends(get_db)
):
    """Create a dashboard alert"""
    try:
        service = EnterpriseDashboardService(db)
        alert_dict = alert_data.dict()
        alert_dict["created_by"] = created_by
        alert = await service.create_alert(tenant_id, alert_dict)
        return AlertResponse.from_orm(alert)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create alert: {str(e)}"
        )


@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    tenant_id: int = Query(..., description="Tenant ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    active_only: bool = Query(True, description="Show only active alerts"),
    db: Session = Depends(get_db)
):
    """Get dashboard alerts"""
    try:
        service = EnterpriseDashboardService(db)
        if active_only:
            alerts = await service.get_active_alerts(tenant_id, severity)
        else:
            query = db.query(DashboardAlert).filter(DashboardAlert.tenant_id == tenant_id)
            if severity:
                query = query.filter(DashboardAlert.severity == severity)
            alerts = query.order_by(DashboardAlert.created_at.desc()).all()
        
        return [AlertResponse.from_orm(alert) for alert in alerts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get alerts: {str(e)}"
        )


@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    acknowledged_by: int = Query(..., description="User ID acknowledging the alert"),
    resolution_notes: Optional[str] = Query(None, description="Resolution notes"),
    db: Session = Depends(get_db)
):
    """Acknowledge a dashboard alert"""
    try:
        alert = db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        alert.is_acknowledged = True
        alert.acknowledged_by = acknowledged_by
        alert.acknowledged_at = datetime.utcnow()
        if resolution_notes:
            alert.resolution_notes = resolution_notes
        
        db.commit()
        return {"message": "Alert acknowledged successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to acknowledge alert: {str(e)}"
        )


# Feature Usage Tracking Endpoints
@router.post("/usage")
async def track_feature_usage(
    usage_data: FeatureUsageCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    user_id: Optional[int] = Query(None, description="User ID"),
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Track enterprise feature usage"""
    try:
        service = EnterpriseDashboardService(db)
        
        # Track usage in background to avoid blocking the request
        background_tasks.add_task(
            service.track_feature_usage,
            tenant_id,
            user_id,
            usage_data.dict()
        )
        
        return {"message": "Usage tracked successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track usage: {str(e)}"
        )


# Analytics Endpoints
@router.get("/analytics")
async def get_dashboard_analytics(
    tenant_id: int = Query(..., description="Tenant ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days for analytics"),
    db: Session = Depends(get_db)
):
    """Get dashboard usage analytics"""
    try:
        service = EnterpriseDashboardService(db)
        analytics = await service.get_dashboard_analytics(tenant_id, days)
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )


@router.get("/summary")
async def get_enterprise_summary(
    tenant_id: int = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Get enterprise-wide summary statistics"""
    try:
        service = EnterpriseDashboardService(db)
        summary = await service.get_enterprise_summary(tenant_id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get summary: {str(e)}"
        )


# Export Management Endpoints
@router.post("/dashboards/{dashboard_id}/exports", response_model=ExportResponse)
async def create_export(
    dashboard_id: int,
    export_data: ExportCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="User ID of creator"),
    db: Session = Depends(get_db)
):
    """Create a dashboard export"""
    try:
        service = EnterpriseDashboardService(db)
        export = await service.create_export(
            tenant_id=tenant_id,
            dashboard_id=dashboard_id,
            created_by=created_by,
            export_data=export_data.dict()
        )
        return ExportResponse.from_orm(export)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create export: {str(e)}"
        )


@router.get("/exports", response_model=List[ExportResponse])
async def get_exports(
    tenant_id: int = Query(..., description="Tenant ID"),
    dashboard_id: Optional[int] = Query(None, description="Filter by dashboard ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get dashboard exports"""
    try:
        query = db.query(DashboardExport).filter(DashboardExport.tenant_id == tenant_id)
        
        if dashboard_id:
            query = query.filter(DashboardExport.dashboard_id == dashboard_id)
        
        if status_filter:
            query = query.filter(DashboardExport.status == status_filter)
        
        exports = query.order_by(DashboardExport.created_at.desc()).offset(skip).limit(limit).all()
        return [ExportResponse.from_orm(export) for export in exports]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get exports: {str(e)}"
        )


# Health Check Endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint for enterprise dashboard service"""
    return {
        "status": "healthy",
        "service": "enterprise_dashboard",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
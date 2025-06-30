"""
Enhanced Reports Router for Advanced Analytics & Visualization
Provides automated report generation, scheduling, and export capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import asyncio

from ..database import get_db
from ..services.analytics_service import AnalyticsService, get_analytics_service
from ..services.dashboard_service_custom import CustomDashboardService, get_custom_dashboard_service
from ..services.report_generation_service import (
    ReportGenerationService, 
    get_report_generation_service,
    ReportDefinition,
    ReportSchedule,
    ReportContentBlock
)
from ..schemas import analytics_schemas as schemas
from ..models.user import User
from ..auth.auth_dependencies import get_current_active_user

router = APIRouter(
    prefix="/analytics/reports",
    tags=["Analytics Reports"],
    responses={404: {"description": "Not found"}},
)

# --- Report Generation Endpoints ---

@router.post(
    "/generate",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Generate an ad-hoc analytics report"
)
async def generate_adhoc_report(
    report_definition: ReportDefinition,
    filters: Optional[Dict[str, Any]] = None,
    time_range: Optional[Dict[str, Any]] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    report_service: ReportGenerationService = Depends(get_report_generation_service),
    current_user: User = Depends(get_current_active_user)
):
    """Generate an ad-hoc report based on the provided definition"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    try:
        # Generate report asynchronously
        user_id = getattr(current_user, 'id', 0)  # type: ignore
        result = await report_service.generate_report(
            report_definition=report_definition,
            tenant_id=tenant_id,
            user_id=user_id,
            filters=filters,
            time_range=time_range
        )
        
        return {
            "success": True,
            "message": "Report generated successfully",
            "report": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

@router.post(
    "/dashboards/{dashboard_id}/export",
    response_model=Dict[str, Any],
    summary="Export a dashboard as a report"
)
async def export_dashboard_as_report(
    dashboard_id: int,
    export_format: str = "pdf",
    include_data: bool = True,
    filters: Optional[Dict[str, Any]] = None,
    time_range: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    report_service: ReportGenerationService = Depends(get_report_generation_service),
    current_user: User = Depends(get_current_active_user)
):
    """Export a dashboard as a formatted report"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    try:
        result = await report_service.export_dashboard_as_report(
            dashboard_id=dashboard_id,
            tenant_id=tenant_id,
            export_format=export_format,
            include_data=include_data,
            filters=filters,
            time_range=time_range
        )
        
        return {
            "success": True,
            "message": "Dashboard exported successfully",
            "export": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export dashboard: {str(e)}"
        )

# --- Report Templates Endpoints ---

@router.get(
    "/templates",
    response_model=List[Dict[str, Any]],
    summary="Get available report templates"
)
async def get_report_templates(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get available report templates"""
    
    # Mock report templates - in production, these would be stored in database
    templates = [
        {
            "id": "executive_summary",
            "name": "Executive Summary",
            "description": "High-level KPIs and trends for executive reporting",
            "category": "executive",
            "content_blocks": [
                {
                    "title": "Key Performance Indicators",
                    "block_type": "kpi_summary",
                    "data_source": {
                        "type": "performance_metric_list",
                        "params": {"category": "executive", "limit": 6}
                    }
                },
                {
                    "title": "Performance Trends",
                    "block_type": "chart",
                    "data_source": {
                        "type": "performance_metric_timeseries",
                        "params": {"metric_name": "revenue", "history_limit": 12}
                    },
                    "display_options": {"chart_type": "line"}
                }
            ]
        },
        {
            "id": "operational_dashboard",
            "name": "Operational Dashboard",
            "description": "Detailed operational metrics and analytics",
            "category": "operations",
            "content_blocks": [
                {
                    "title": "System Performance",
                    "block_type": "table",
                    "data_source": {
                        "type": "performance_metric_list",
                        "params": {"category": "system", "limit": 20}
                    }
                },
                {
                    "title": "User Activity",
                    "block_type": "chart",
                    "data_source": {
                        "type": "analytics_model_list",
                        "params": {"model_type": "engagement"}
                    },
                    "display_options": {"chart_type": "bar"}
                }
            ]
        },
        {
            "id": "financial_analysis",
            "name": "Financial Analysis",
            "description": "ROI calculations and financial performance metrics",
            "category": "finance",
            "content_blocks": [
                {
                    "title": "ROI Summary",
                    "block_type": "kpi_summary",
                    "data_source": {
                        "type": "roi_calculation_list",
                        "params": {"limit": 10}
                    }
                },
                {
                    "title": "Investment Performance",
                    "block_type": "chart",
                    "data_source": {
                        "type": "roi_calculation_list",
                        "params": {"entity_type": "project"}
                    },
                    "display_options": {"chart_type": "pie"}
                }
            ]
        }
    ]
    
    if category:
        templates = [t for t in templates if t.get("category") == category]
    
    return templates

@router.post(
    "/from-template/{template_id}",
    response_model=Dict[str, Any],
    summary="Generate report from template"
)
async def generate_report_from_template(
    template_id: str,
    customizations: Optional[Dict[str, Any]] = None,
    filters: Optional[Dict[str, Any]] = None,
    time_range: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    report_service: ReportGenerationService = Depends(get_report_generation_service),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a report using a predefined template"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Get template (this would typically come from database)
    templates_response = await get_report_templates(current_user=current_user)
    template = next((t for t in templates_response if t["id"] == template_id), None)
    
    if not template:
        raise HTTPException(status_code=404, detail="Report template not found")
    
    # Create report definition from template
    content_blocks = [
        ReportContentBlock(**block) for block in template["content_blocks"]
    ]
    
    # Safe ReportDefinition instantiation
    report_def = ReportDefinition()  # type: ignore
    setattr(report_def, 'name', customizations.get("name", template["name"]) if customizations else template["name"])  # type: ignore
    setattr(report_def, 'description', template["description"])  # type: ignore
    setattr(report_def, 'content_blocks', content_blocks)  # type: ignore
    setattr(report_def, 'output_format', customizations.get("output_format", "pdf") if customizations else "pdf")  # type: ignore
    
    try:
        user_id = getattr(current_user, 'id', 0)  # type: ignore
        result = await report_service.generate_report(
            report_definition=report_def,
            tenant_id=tenant_id,
            user_id=user_id,
            filters=filters,
            time_range=time_range
        )
        
        return {
            "success": True,
            "message": "Report generated from template successfully",
            "template_id": template_id,
            "report": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report from template: {str(e)}"
        )

# --- Report Scheduling Endpoints ---

@router.post(
    "/schedules",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Create a scheduled report"
)
async def create_report_schedule(
    schedule_data: ReportSchedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new scheduled report"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation - in production, this would save to database
    schedule_id = str(uuid.uuid4())
    
    return {
        "success": True,
        "message": "Report schedule created successfully",
        "schedule": {
            "id": schedule_id,
            "tenant_id": tenant_id,
            "created_by": getattr(current_user, 'id', None),  # type: ignore
            "created_at": datetime.utcnow().isoformat(),
            **schedule_data.dict()
        }
    }

@router.get(
    "/schedules",
    response_model=List[Dict[str, Any]],
    summary="List scheduled reports"
)
async def list_report_schedules(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all scheduled reports for the current tenant"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation - in production, this would query database
    schedules = [
        {
            "id": "schedule-1",
            "report_definition_id": 1,
            "name": "Weekly Executive Summary",
            "cron_schedule": "0 9 * * MON",
            "recipients": ["exec@company.com"],
            "is_active": True,
            "next_run_time": "2025-06-30T09:00:00Z",
            "last_run_time": "2025-06-23T09:00:00Z",
            "last_run_status": "success"
        },
        {
            "id": "schedule-2",
            "report_definition_id": 2,
            "name": "Monthly Financial Report",
            "cron_schedule": "0 8 1 * *",
            "recipients": ["finance@company.com", "cfo@company.com"],
            "is_active": True,
            "next_run_time": "2025-07-01T08:00:00Z",
            "last_run_time": "2025-06-01T08:00:00Z",
            "last_run_status": "success"
        }
    ]
    
    if active_only:
        schedules = [s for s in schedules if s["is_active"]]
    
    return schedules

@router.put(
    "/schedules/{schedule_id}",
    response_model=Dict[str, Any],
    summary="Update a scheduled report"
)
async def update_report_schedule(
    schedule_id: str,
    schedule_update: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing scheduled report"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation
    return {
        "success": True,
        "message": "Report schedule updated successfully",
        "schedule_id": schedule_id,
        "updated_fields": list(schedule_update.keys())
    }

@router.delete(
    "/schedules/{schedule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a scheduled report"
)
async def delete_report_schedule(
    schedule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a scheduled report"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation
    return

# --- Report History and Management ---

@router.get(
    "/history",
    response_model=List[Dict[str, Any]],
    summary="Get report generation history"
)
async def get_report_history(
    limit: int = 50,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get history of generated reports"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation
    history = [
        {
            "report_id": "report-123",
            "name": "Executive Summary",
            "generated_at": "2025-06-24T10:30:00Z",
            "generated_by": getattr(current_user, 'id', None),  # type: ignore
            "status": "completed",
            "format": "pdf",
            "file_size": 2048576,
            "download_url": "/api/reports/download/report-123"
        },
        {
            "report_id": "report-124",
            "name": "Dashboard Export",
            "generated_at": "2025-06-24T11:15:00Z",
            "generated_by": getattr(current_user, 'id', None),  # type: ignore
            "status": "completed",
            "format": "excel",
            "file_size": 1024000,
            "download_url": "/api/reports/download/report-124"
        }
    ]
    
    if status_filter:
        history = [h for h in history if h["status"] == status_filter]
    
    return history[:limit]

@router.get(
    "/download/{report_id}",
    summary="Download a generated report"
)
async def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download a previously generated report"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock implementation - in production, this would serve the actual file
    return {
        "message": "Report download would be served here",
        "report_id": report_id,
        "note": "In production, this would return the actual file using FileResponse"
    }

# --- Analytics Insights for Reports ---

@router.get(
    "/insights/usage",
    response_model=Dict[str, Any],
    summary="Get report usage analytics"
)
async def get_report_usage_insights(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analytics about report usage and generation patterns"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock analytics data
    return {
        "period_days": days,
        "total_reports_generated": 45,
        "scheduled_reports": 12,
        "adhoc_reports": 33,
        "most_popular_format": "pdf",
        "format_distribution": {
            "pdf": 28,
            "excel": 12,
            "html": 5
        },
        "most_used_templates": [
            {"template_id": "executive_summary", "usage_count": 15},
            {"template_id": "operational_dashboard", "usage_count": 8},
            {"template_id": "financial_analysis", "usage_count": 6}
        ],
        "generation_trends": [
            {"date": "2025-06-20", "count": 3},
            {"date": "2025-06-21", "count": 5},
            {"date": "2025-06-22", "count": 2},
            {"date": "2025-06-23", "count": 7},
            {"date": "2025-06-24", "count": 4}
        ]
    }

@router.post(
    "/insights/recommendations",
    response_model=List[Dict[str, Any]],
    summary="Get AI-powered report recommendations"
)
async def get_report_recommendations(
    context: Dict[str, Any],
    db: Session = Depends(get_db),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-powered recommendations for report content and scheduling"""
    
    tenant_id = getattr(current_user, 'tenant_id', None)  # type: ignore
    if tenant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID not found.")
    
    # Mock AI recommendations
    recommendations = [
        {
            "type": "content_suggestion",
            "title": "Add Performance Trend Analysis",
            "description": "Based on your recent dashboard activity, consider adding performance trend charts to your executive reports",
            "confidence": 0.85,
            "suggested_block": {
                "title": "Performance Trends",
                "block_type": "chart",
                "data_source": {
                    "type": "performance_metric_timeseries",
                    "params": {"metric_name": "productivity_score", "history_limit": 30}
                }
            }
        },
        {
            "type": "scheduling_suggestion",
            "title": "Optimize Report Timing",
            "description": "Your reports are typically accessed on Monday mornings. Consider scheduling them for Sunday evening",
            "confidence": 0.72,
            "suggested_schedule": "0 20 * * SUN"
        },
        {
            "type": "format_suggestion",
            "title": "Consider Interactive Format",
            "description": "Your stakeholders frequently drill down into data. HTML format with interactive charts might be more effective",
            "confidence": 0.68,
            "suggested_format": "html"
        }
    ]
    
    return recommendations
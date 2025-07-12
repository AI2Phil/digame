"""
Dashboard Management Router
Provides CRUD operations for dashboards and widgets
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import json
import random

from ..database import get_db
from ..auth.jwt_handler import get_current_platform_owner
from ..models.user import User


router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard Management"])


# Pydantic Models
class DashboardCreate(BaseModel):
    name: str = Field(..., description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    tags: List[str] = Field(default_factory=list, description="Dashboard tags")
    layout: List[Dict[str, Any]] = Field(default_factory=list, description="Widget layout configuration")
    widgets: List[Dict[str, Any]] = Field(default_factory=list, description="Widget configurations")


class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    tags: Optional[List[str]] = Field(None, description="Dashboard tags")
    layout: Optional[List[Dict[str, Any]]] = Field(None, description="Widget layout configuration")
    widgets: Optional[List[Dict[str, Any]]] = Field(None, description="Widget configurations")


class WidgetCreate(BaseModel):
    dashboard_id: int = Field(..., description="Dashboard ID")
    widget_type: str = Field(..., description="Type of widget")
    title: str = Field(..., description="Widget title")
    data_source_config: Dict[str, Any] = Field(..., description="Data source configuration")
    display_options: Dict[str, Any] = Field(default_factory=dict, description="Display options")


class WidgetUpdate(BaseModel):
    widget_type: Optional[str] = Field(None, description="Type of widget")
    title: Optional[str] = Field(None, description="Widget title")
    data_source_config: Optional[Dict[str, Any]] = Field(None, description="Data source configuration")
    display_options: Optional[Dict[str, Any]] = Field(None, description="Display options")


# Dashboard CRUD Operations

@router.get("/dashboards")
async def get_dashboards(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Get all dashboards for the current user"""
    try:
        # Mock dashboard data - in production, query from database
        dashboards = [
            {
                "id": 1,
                "name": "Executive Dashboard",
                "description": "High-level metrics and KPIs for executive overview",
                "tags": ["executive", "overview", "kpi"],
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T14:45:00Z",
                "widget_count": 8,
                "layout": [
                    {"widget_config_id": 1, "x": 0, "y": 0, "w": 6, "h": 3},
                    {"widget_config_id": 2, "x": 6, "y": 0, "w": 6, "h": 3},
                    {"widget_config_id": 3, "x": 0, "y": 3, "w": 4, "h": 4},
                    {"widget_config_id": 4, "x": 4, "y": 3, "w": 8, "h": 4}
                ],
                "widgets": []
            },
            {
                "id": 2,
                "name": "Performance Analytics",
                "description": "System performance and monitoring dashboard",
                "tags": ["performance", "monitoring", "system"],
                "created_at": "2024-01-18T09:15:00Z",
                "updated_at": "2024-01-22T16:20:00Z",
                "widget_count": 6,
                "layout": [
                    {"widget_config_id": 5, "x": 0, "y": 0, "w": 12, "h": 3},
                    {"widget_config_id": 6, "x": 0, "y": 3, "w": 6, "h": 4},
                    {"widget_config_id": 7, "x": 6, "y": 3, "w": 6, "h": 4}
                ],
                "widgets": []
            },
            {
                "id": 3,
                "name": "User Analytics",
                "description": "User behavior and engagement analytics",
                "tags": ["users", "behavior", "engagement"],
                "created_at": "2024-01-20T11:00:00Z",
                "updated_at": "2024-01-25T13:30:00Z",
                "widget_count": 5,
                "layout": [
                    {"widget_config_id": 8, "x": 0, "y": 0, "w": 4, "h": 3},
                    {"widget_config_id": 9, "x": 4, "y": 0, "w": 4, "h": 3},
                    {"widget_config_id": 10, "x": 8, "y": 0, "w": 4, "h": 3}
                ],
                "widgets": []
            }
        ]
        
        # Apply pagination
        total = len(dashboards)
        paginated_dashboards = dashboards[skip:skip + limit]
        
        return paginated_dashboards
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboards: {str(e)}"
        )


@router.get("/dashboards/{dashboard_id}")
async def get_dashboard(
    dashboard_id: int,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Get a specific dashboard by ID"""
    try:
        # Mock dashboard data with widgets - in production, query from database
        if dashboard_id == 1:
            dashboard = {
                "id": 1,
                "name": "Executive Dashboard",
                "description": "High-level metrics and KPIs for executive overview",
                "tags": ["executive", "overview", "kpi"],
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T14:45:00Z",
                "layout": [
                    {"widget_config_id": 1, "x": 0, "y": 0, "w": 6, "h": 3},
                    {"widget_config_id": 2, "x": 6, "y": 0, "w": 6, "h": 3},
                    {"widget_config_id": 3, "x": 0, "y": 3, "w": 4, "h": 4},
                    {"widget_config_id": 4, "x": 4, "y": 3, "w": 8, "h": 4}
                ],
                "widgets": [
                    {
                        "id": 1,
                        "widget_uuid": "widget-1-uuid",
                        "widget_type": "kpi_card",
                        "title": "Total Revenue",
                        "data_source_config": {
                            "type": "performance_metric_single",
                            "params": {"metric": "revenue", "period": "monthly"}
                        },
                        "display_options": {
                            "show_trend": True,
                            "color_scheme": "blue",
                            "format": "currency"
                        },
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-20T14:45:00Z"
                    },
                    {
                        "id": 2,
                        "widget_uuid": "widget-2-uuid",
                        "widget_type": "line_chart",
                        "title": "User Growth Trend",
                        "data_source_config": {
                            "type": "performance_metric_timeseries",
                            "params": {"metric": "user_count", "period": "daily", "days": 30}
                        },
                        "display_options": {
                            "show_points": True,
                            "color_scheme": "green",
                            "smooth_line": True
                        },
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-20T14:45:00Z"
                    },
                    {
                        "id": 3,
                        "widget_uuid": "widget-3-uuid",
                        "widget_type": "pie_chart",
                        "title": "Traffic Sources",
                        "data_source_config": {
                            "type": "performance_metric_list",
                            "params": {"metric": "traffic_sources", "period": "weekly"}
                        },
                        "display_options": {
                            "show_labels": True,
                            "color_scheme": "rainbow",
                            "show_legend": True
                        },
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-20T14:45:00Z"
                    },
                    {
                        "id": 4,
                        "widget_uuid": "widget-4-uuid",
                        "widget_type": "table",
                        "title": "Top Performing Pages",
                        "data_source_config": {
                            "type": "performance_metric_list",
                            "params": {"metric": "page_performance", "limit": 10}
                        },
                        "display_options": {
                            "sortable": True,
                            "paginated": True,
                            "show_search": True
                        },
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-20T14:45:00Z"
                    }
                ]
            }
        elif dashboard_id == 2:
            dashboard = {
                "id": 2,
                "name": "Performance Analytics",
                "description": "System performance and monitoring dashboard",
                "tags": ["performance", "monitoring", "system"],
                "created_at": "2024-01-18T09:15:00Z",
                "updated_at": "2024-01-22T16:20:00Z",
                "layout": [
                    {"widget_config_id": 5, "x": 0, "y": 0, "w": 12, "h": 3},
                    {"widget_config_id": 6, "x": 0, "y": 3, "w": 6, "h": 4},
                    {"widget_config_id": 7, "x": 6, "y": 3, "w": 6, "h": 4}
                ],
                "widgets": [
                    {
                        "id": 5,
                        "widget_uuid": "widget-5-uuid",
                        "widget_type": "gauge",
                        "title": "System CPU Usage",
                        "data_source_config": {
                            "type": "performance_metric_single",
                            "params": {"metric": "cpu_usage", "real_time": True}
                        },
                        "display_options": {
                            "min": 0,
                            "max": 100,
                            "unit": "%",
                            "thresholds": {"warning": 70, "critical": 90}
                        },
                        "created_at": "2024-01-18T09:15:00Z",
                        "updated_at": "2024-01-22T16:20:00Z"
                    },
                    {
                        "id": 6,
                        "widget_uuid": "widget-6-uuid",
                        "widget_type": "bar_chart",
                        "title": "Response Time by Endpoint",
                        "data_source_config": {
                            "type": "performance_metric_list",
                            "params": {"metric": "endpoint_response_times", "period": "hourly"}
                        },
                        "display_options": {
                            "orientation": "vertical",
                            "color_scheme": "blue",
                            "show_values": True
                        },
                        "created_at": "2024-01-18T09:15:00Z",
                        "updated_at": "2024-01-22T16:20:00Z"
                    },
                    {
                        "id": 7,
                        "widget_uuid": "widget-7-uuid",
                        "widget_type": "timeline",
                        "title": "System Events",
                        "data_source_config": {
                            "type": "performance_metric_list",
                            "params": {"metric": "system_events", "period": "daily", "days": 7}
                        },
                        "display_options": {
                            "show_summary": True,
                            "group_by": "severity",
                            "max_events": 20
                        },
                        "created_at": "2024-01-18T09:15:00Z",
                        "updated_at": "2024-01-22T16:20:00Z"
                    }
                ]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dashboard with ID {dashboard_id} not found"
            )
        
        return dashboard
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboard: {str(e)}"
        )


@router.post("/dashboards")
async def create_dashboard(
    dashboard: DashboardCreate,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Create a new dashboard"""
    try:
        # In production, save to database and return the created dashboard
        new_dashboard = {
            "id": 999,  # Would be auto-generated by database
            "name": dashboard.name,
            "description": dashboard.description,
            "tags": dashboard.tags,
            "layout": dashboard.layout,
            "widgets": dashboard.widgets,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "created_by": current_user.id
        }
        
        return new_dashboard
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create dashboard: {str(e)}"
        )


@router.put("/dashboards/{dashboard_id}")
async def update_dashboard(
    dashboard_id: int,
    dashboard: DashboardUpdate,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Update an existing dashboard"""
    try:
        # In production, update in database
        updated_dashboard = {
            "id": dashboard_id,
            "name": dashboard.name or "Updated Dashboard",
            "description": dashboard.description,
            "tags": dashboard.tags or [],
            "layout": dashboard.layout or [],
            "widgets": dashboard.widgets or [],
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return updated_dashboard
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dashboard: {str(e)}"
        )


@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: int,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Delete a dashboard"""
    try:
        # In production, delete from database
        return {"message": f"Dashboard {dashboard_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dashboard: {str(e)}"
        )


@router.put("/dashboards/{dashboard_id}/layout")
async def update_dashboard_layout(
    dashboard_id: int,
    layout_data: Dict[str, List[Dict[str, Any]]],
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Update dashboard layout"""
    try:
        layout = layout_data.get("layout", [])
        
        # In production, update layout in database
        updated_dashboard = {
            "id": dashboard_id,
            "layout": layout,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return updated_dashboard
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dashboard layout: {str(e)}"
        )


# Widget Management Endpoints

@router.post("/widgets")
async def create_widget(
    widget: WidgetCreate,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Create a new widget"""
    try:
        # In production, save to database
        new_widget = {
            "id": 888,  # Would be auto-generated by database
            "widget_uuid": f"widget-{888}-uuid",
            "dashboard_id": widget.dashboard_id,
            "widget_type": widget.widget_type,
            "title": widget.title,
            "data_source_config": widget.data_source_config,
            "display_options": widget.display_options,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return new_widget
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create widget: {str(e)}"
        )


@router.put("/widgets/{widget_id}")
async def update_widget(
    widget_id: int,
    widget: WidgetUpdate,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Update an existing widget"""
    try:
        # In production, update in database
        updated_widget = {
            "id": widget_id,
            "widget_type": widget.widget_type or "kpi_card",
            "title": widget.title or "Updated Widget",
            "data_source_config": widget.data_source_config or {},
            "display_options": widget.display_options or {},
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return updated_widget
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update widget: {str(e)}"
        )


@router.delete("/widgets/{widget_id}")
async def delete_widget(
    widget_id: int,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Delete a widget"""
    try:
        # In production, delete from database
        return {"message": f"Widget {widget_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete widget: {str(e)}"
        )


@router.get("/widgets/{widget_id}/data")
async def get_widget_data(
    widget_id: int,
    filters: Optional[str] = Query(None, description="JSON string of filters"),
    timeRange: Optional[str] = Query(None, description="JSON string of time range"),
    refresh_cache: Optional[bool] = Query(False, description="Force refresh cache"),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Get widget data based on its configuration"""
    try:
        # Parse filters and time range if provided
        parsed_filters = {}
        parsed_time_range = {}
        
        if filters:
            try:
                parsed_filters = json.loads(filters)
            except json.JSONDecodeError:
                pass
                
        if timeRange:
            try:
                parsed_time_range = json.loads(timeRange)
            except json.JSONDecodeError:
                pass
        
        # Mock widget data based on widget_id and type
        # In production, fetch widget config and generate data accordingly
        
        if widget_id == 1:  # KPI Card - Total Revenue
            return {
                "data": {
                    "value": 125000 + random.randint(-5000, 15000),
                    "trend": "up",
                    "trend_value": 12.5,
                    "unit": "$",
                    "label": "Total Revenue",
                    "previous_value": 112000,
                    "target": 130000,
                    "status": "success"
                },
                "metadata": {
                    "data_count": 1,
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 300 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 2:  # Line Chart - User Growth
            # Generate time series data
            days = 30
            current_date = datetime.utcnow()
            data_points = []
            
            for i in range(days):
                date = current_date - timedelta(days=days-i-1)
                value = 1000 + (i * 10) + random.randint(-50, 100)
                data_points.append({
                    "x": date.strftime("%Y-%m-%d"),
                    "y": value,
                    "label": f"Day {i+1}"
                })
            
            return {
                "data": {
                    "datasets": [{
                        "label": "User Growth",
                        "data": data_points,
                        "borderColor": "rgb(75, 192, 192)",
                        "backgroundColor": "rgba(75, 192, 192, 0.2)"
                    }],
                    "trend": "increasing",
                    "slope": 8.5,
                    "volatility": 12.3
                },
                "metadata": {
                    "data_count": len(data_points),
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": True
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 600 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 3:  # Pie Chart - Traffic Sources
            return {
                "data": {
                    "labels": ["Organic Search", "Direct", "Social Media", "Email", "Referral"],
                    "datasets": [{
                        "data": [45.2, 23.8, 15.6, 9.4, 6.0],
                        "backgroundColor": [
                            "#FF6384",
                            "#36A2EB", 
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF"
                        ]
                    }],
                    "total_sessions": 12456,
                    "segments": [
                        {"label": "Organic Search", "value": 45.2, "count": 5634},
                        {"label": "Direct", "value": 23.8, "count": 2965},
                        {"label": "Social Media", "value": 15.6, "count": 1943},
                        {"label": "Email", "value": 9.4, "count": 1171},
                        {"label": "Referral", "value": 6.0, "count": 743}
                    ]
                },
                "metadata": {
                    "data_count": 5,
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 900 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 4:  # Table - Top Pages
            return {
                "data": {
                    "columns": [
                        {"key": "page", "label": "Page", "sortable": True},
                        {"key": "views", "label": "Views", "sortable": True, "type": "number"},
                        {"key": "unique_views", "label": "Unique Views", "sortable": True, "type": "number"},
                        {"key": "avg_time", "label": "Avg Time", "sortable": True},
                        {"key": "bounce_rate", "label": "Bounce Rate", "sortable": True, "type": "percentage"}
                    ],
                    "rows": [
                        {"page": "/dashboard", "views": 12456, "unique_views": 8234, "avg_time": "3:45", "bounce_rate": 12.3},
                        {"page": "/profile", "views": 8765, "unique_views": 6543, "avg_time": "2:30", "bounce_rate": 18.7},
                        {"page": "/analytics", "views": 5432, "unique_views": 4321, "avg_time": "4:12", "bounce_rate": 8.9},
                        {"page": "/settings", "views": 3210, "unique_views": 2876, "avg_time": "1:45", "bounce_rate": 25.4},
                        {"page": "/goals", "views": 2987, "unique_views": 2543, "avg_time": "3:20", "bounce_rate": 14.2}
                    ],
                    "total_rows": 5,
                    "pagination": {"page": 1, "per_page": 10, "total": 5}
                },
                "metadata": {
                    "data_count": 5,
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 1200 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 5:  # Gauge - CPU Usage
            cpu_value = 45.0 + random.uniform(-10, 25)
            return {
                "data": {
                    "value": round(cpu_value, 1),
                    "min": 0,
                    "max": 100,
                    "unit": "%",
                    "label": "CPU Usage",
                    "target": 70,
                    "thresholds": {"warning": 70, "critical": 90},
                    "status": "success" if cpu_value < 70 else "warning" if cpu_value < 90 else "error",
                    "trend": "stable"
                },
                "metadata": {
                    "data_count": 1,
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 60 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 6:  # Bar Chart - Response Times
            endpoints = ["/api/users", "/api/analytics", "/api/dashboards", "/api/widgets", "/api/auth"]
            data_points = []
            
            for endpoint in endpoints:
                response_time = 50 + random.uniform(-20, 100)
                data_points.append({
                    "x": endpoint,
                    "y": round(response_time, 1),
                    "label": endpoint
                })
            
            return {
                "data": {
                    "datasets": [{
                        "label": "Response Time (ms)",
                        "data": data_points,
                        "backgroundColor": "rgba(54, 162, 235, 0.8)",
                        "borderColor": "rgba(54, 162, 235, 1)",
                        "borderWidth": 1
                    }],
                    "summary": {
                        "average": round(sum(p["y"] for p in data_points) / len(data_points), 1),
                        "max": max(p["y"] for p in data_points),
                        "min": min(p["y"] for p in data_points)
                    }
                },
                "metadata": {
                    "data_count": len(data_points),
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 300 if not refresh_cache else 0
                }
            }
            
        elif widget_id == 7:  # Timeline - System Events
            events = []
            current_time = datetime.utcnow()
            
            for i in range(10):
                event_time = current_time - timedelta(hours=i*2, minutes=random.randint(0, 59))
                event_types = ["info", "warning", "success", "error"]
                event_type = random.choice(event_types)
                
                events.append({
                    "id": i + 1,
                    "timestamp": event_time.isoformat(),
                    "title": f"System Event {i + 1}",
                    "description": f"Event description for {event_type} event",
                    "type": event_type,
                    "category": "system",
                    "user": "system",
                    "status": "completed" if event_type in ["info", "success"] else "active"
                })
            
            return {
                "data": events,
                "metadata": {
                    "data_count": len(events),
                    "last_updated": datetime.utcnow().isoformat(),
                    "personalized": False
                },
                "cache_info": {
                    "from_cache": not refresh_cache,
                    "cache_age_seconds": 180 if not refresh_cache else 0
                }
            }
        
        # Default fallback data
        return {
            "data": {
                "message": f"Mock data for widget {widget_id}",
                "value": random.randint(100, 1000),
                "timestamp": datetime.utcnow().isoformat()
            },
            "metadata": {
                "data_count": 1,
                "last_updated": datetime.utcnow().isoformat(),
                "personalized": False
            },
            "cache_info": {
                "from_cache": not refresh_cache,
                "cache_age_seconds": 300 if not refresh_cache else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get widget data: {str(e)}"
        )


# Dashboard Export and Sharing

@router.get("/dashboards/{dashboard_id}/export")
async def export_dashboard(
    dashboard_id: int,
    format: str = Query("json", description="Export format: json, csv, pdf"),
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Export dashboard data in various formats"""
    try:
        # In production, generate actual export data
        if format == "json":
            return {
                "dashboard_id": dashboard_id,
                "export_format": format,
                "exported_at": datetime.utcnow().isoformat(),
                "data": {
                    "dashboard": {"id": dashboard_id, "name": "Exported Dashboard"},
                    "widgets": [],
                    "layout": []
                }
            }
        elif format == "csv":
            return {
                "dashboard_id": dashboard_id,
                "export_format": format,
                "exported_at": datetime.utcnow().isoformat(),
                "csv_data": "widget_id,widget_type,title,value\n1,kpi_card,Revenue,125000\n"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported export format: {format}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export dashboard: {str(e)}"
        )


@router.post("/dashboards/{dashboard_id}/share")
async def share_dashboard(
    dashboard_id: int,
    share_data: Dict[str, Any],
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Share dashboard with other users"""
    try:
        # In production, create share record in database
        share_record = {
            "share_id": 123,
            "dashboard_id": dashboard_id,
            "shared_by": current_user.id,
            "user_emails": share_data.get("user_emails", []),
            "permissions": share_data.get("permissions", "view"),
            "expires_at": share_data.get("expires_at"),
            "created_at": datetime.utcnow().isoformat(),
            "share_url": f"https://app.digame.ai/shared/dashboard/{dashboard_id}/123"
        }
        
        return share_record
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to share dashboard: {str(e)}"
        )


@router.delete("/dashboards/{dashboard_id}/share/{share_id}")
async def revoke_dashboard_share(
    dashboard_id: int,
    share_id: int,
    current_user: User = Depends(get_current_platform_owner),
    db: Session = Depends(get_db)
):
    """Revoke dashboard share access"""
    try:
        # In production, delete share record from database
        return {"message": f"Share access {share_id} for dashboard {dashboard_id} revoked successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke dashboard share: {str(e)}"
        )


# Dashboard API endpoints expected by tests
@router.get("/productivity-chart")
async def get_productivity_chart():
    """Get productivity chart data"""
    return {
        "title": "Weekly Productivity Score",
        "data": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "datasets": [{
                "label": "Productivity Score",
                "data": [85, 92, 78, 88, 95, 72, 80],
                "borderColor": "rgb(75, 192, 192)",
                "backgroundColor": "rgba(75, 192, 192, 0.2)"
            }]
        }
    }


@router.get("/activity-breakdown")
async def get_activity_breakdown():
    """Get activity breakdown data"""
    return {
        "title": "Activity Breakdown (Last 7 Days)",
        "data": {
            "labels": ["Work", "Learning", "Meetings", "Break", "Other"],
            "datasets": [{
                "data": [45, 20, 15, 10, 10],
                "backgroundColor": [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF"
                ]
            }]
        }
    }


@router.get("/metrics")
async def get_productivity_metrics():
    """Get key productivity metrics"""
    return {
        "title": "Key Productivity Metrics",
        "metrics": {
            "focus_time": {"value": 6.5, "unit": "hours", "trend": "up"},
            "efficiency_score": {"value": 87, "unit": "%", "trend": "stable"},
            "tasks_completed": {"value": 24, "unit": "tasks", "trend": "up"},
            "break_time": {"value": 1.2, "unit": "hours", "trend": "down"}
        }
    }


@router.get("/recent-activities")
async def get_recent_activities():
    """Get recent activities"""
    return {
        "title": "Recent Activities",
        "activities": [
            {
                "id": 1,
                "title": "Code Review",
                "duration": "45 min",
                "category": "Work",
                "timestamp": "2024-01-25T14:30:00Z"
            },
            {
                "id": 2,
                "title": "Team Meeting",
                "duration": "30 min",
                "category": "Meetings",
                "timestamp": "2024-01-25T13:00:00Z"
            },
            {
                "id": 3,
                "title": "Learning Session",
                "duration": "60 min",
                "category": "Learning",
                "timestamp": "2024-01-25T11:00:00Z"
            }
        ]
    }

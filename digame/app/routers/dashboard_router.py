from fastapi import APIRouter, Depends, HTTPException # Assuming HTTPException for auth later
from typing import Dict

from digame.app.models.dashboard_models import (
    ProductivityChart, ActivityBreakdown,
    ProductivityMetricsGroup, RecentActivities
)
from digame.app.services.dashboard_service import DashboardService, get_dashboard_service

# Placeholder for an auth dependency - replace with actual auth later
async def get_current_user_id() -> str:
    # In a real app, this would come from a token or session
    # For now, returning a dummy user ID
    return "user123"

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["dashboard"],
    # dependencies=[Depends(get_current_active_user)] # Add actual auth dependency later
)

@router.get("/productivity-chart", response_model=ProductivityChart)
async def read_productivity_chart(
    current_user_id: str = Depends(get_current_user_id),
    service: DashboardService = Depends(get_dashboard_service)
):
    # Example: Check if user_id is available, raise error if not (basic auth check)
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.get_productivity_chart_data(user_id=current_user_id)

@router.get("/activity-breakdown", response_model=ActivityBreakdown)
async def read_activity_breakdown(
    current_user_id: str = Depends(get_current_user_id),
    service: DashboardService = Depends(get_dashboard_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.get_activity_breakdown(user_id=current_user_id)

@router.get("/metrics", response_model=ProductivityMetricsGroup)
async def read_productivity_metrics(
    current_user_id: str = Depends(get_current_user_id),
    service: DashboardService = Depends(get_dashboard_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.get_productivity_metrics(user_id=current_user_id)

@router.get("/recent-activities", response_model=RecentActivities)
async def read_recent_activities(
    current_user_id: str = Depends(get_current_user_id),
    service: DashboardService = Depends(get_dashboard_service)
):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await service.get_recent_activities(user_id=current_user_id)

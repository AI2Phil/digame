from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..services.process_optimization_service import ProcessOptimizationService, get_process_optimization_service
from ..schemas.workflow_automation_schemas import (
    OptimizationRecommendationResponse,
    OptimizationRecommendationUpdate
)
from ..auth.auth_dependencies import get_current_active_user, PermissionChecker # Assuming standard auth
from ..models.user import User as SQLAlchemyUser # For current_user type hint

# Assuming get_db dependency is available from a central location like database.py
from ..database import get_db

router = APIRouter(
    prefix="/optimization",
    tags=["Process Optimization"],
)

# Define permissions if needed, e.g., "view_process_optimizations", "manage_process_optimizations"
PERMISSION_VIEW_OPTIMIZATIONS = "view_process_optimizations"
PERMISSION_MANAGE_OPTIMIZATIONS = "manage_process_optimizations" # For updating status


@router.post("/tenant/{tenant_id}/generate-recommendations",
             response_model=List[OptimizationRecommendationResponse],
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OPTIMIZATIONS))]) # Generating might be a manage perm
async def generate_tenant_recommendations_endpoint(
    tenant_id: int = Path(..., description="Tenant ID for which to generate recommendations"),
    service: ProcessOptimizationService = Depends(get_process_optimization_service),
    # current_user: SQLAlchemyUser = Depends(get_current_active_user) # For logging who triggered it
):
    """
    Triggers the generation of new process optimization recommendations for a tenant.
    Returns a list of newly created recommendations.
    """
    try:
        # The service method currently doesn't take created_by_user_id for the recommendation itself.
        # This might need to be passed if recommendations require a 'created_by' user.
        # For system-generated ones, this might be a specific system user ID.
        new_recommendations = service.generate_recommendations_for_tenant(tenant_id=tenant_id)
        return [OptimizationRecommendationResponse.from_orm(rec) for rec in new_recommendations]
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate recommendations: {str(e)}")


@router.get("/tenant/{tenant_id}/recommendations",
            response_model=List[OptimizationRecommendationResponse],
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OPTIMIZATIONS))])
async def list_tenant_recommendations_endpoint(
    tenant_id: int = Path(..., description="Tenant ID for which to list recommendations"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter recommendations by status (e.g., new, viewed)"),
    workflow_template_id: Optional[int] = Query(None, description="Filter by affected workflow template ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    service: ProcessOptimizationService = Depends(get_process_optimization_service),
    # current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Lists process optimization recommendations for a tenant, with optional filters.
    """
    recommendations = service.list_recommendations(
        tenant_id=tenant_id,
        status=status_filter,
        workflow_template_id=workflow_template_id,
        skip=skip,
        limit=limit
    )
    return [OptimizationRecommendationResponse.from_orm(rec) for rec in recommendations]


@router.get("/recommendations/{recommendation_id}",
            response_model=OptimizationRecommendationResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_VIEW_OPTIMIZATIONS))])
async def get_recommendation_endpoint(
    recommendation_id: int = Path(..., description="ID of the recommendation to retrieve"),
    tenant_id: int = Query(..., description="Tenant ID (for ensuring access scope)"), # Usually path, but Query for explicit check
    service: ProcessOptimizationService = Depends(get_process_optimization_service),
    # current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Retrieves a specific process optimization recommendation by its ID.
    Tenant ID is required to ensure the user has access to this tenant's data.
    """
    recommendation = service.get_recommendation(recommendation_id=recommendation_id, tenant_id=tenant_id)
    if not recommendation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return OptimizationRecommendationResponse.from_orm(recommendation)


@router.put("/recommendations/{recommendation_id}",
            response_model=OptimizationRecommendationResponse,
            dependencies=[Depends(PermissionChecker(PERMISSION_MANAGE_OPTIMIZATIONS))])
async def update_recommendation_status_endpoint(
    recommendation_id: int = Path(..., description="ID of the recommendation to update"),
    update_data: OptimizationRecommendationUpdate = Body(...),
    tenant_id: int = Query(..., description="Tenant ID"), # To ensure user is operating within their tenant
    service: ProcessOptimizationService = Depends(get_process_optimization_service),
    current_user: SQLAlchemyUser = Depends(get_current_active_user) # For reviewed_by
):
    """
    Updates the status or priority of a process optimization recommendation.
    """
    updated_recommendation = service.update_recommendation_status(
        recommendation_id=recommendation_id,
        tenant_id=tenant_id,
        status_update=update_data,
        reviewed_by_user_id=current_user.id
    )
    if not updated_recommendation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found or update failed")
    return OptimizationRecommendationResponse.from_orm(updated_recommendation)

# Note: Add this router to main.py:
# from app.routers import process_optimization_router
# app.include_router(process_optimization_router.router)

# Ensure new permissions (PERMISSION_VIEW_OPTIMIZATIONS, PERMISSION_MANAGE_OPTIMIZATIONS)
# are defined and assigned to relevant roles in RBAC setup.
# For example, in init_auth_db.py, add to `all_permissions`:
# {"name": "view_process_optimizations", "description": "Allows viewing process optimization recommendations"},
# {"name": "manage_process_optimizations", "description": "Allows managing (e.g. updating status of) process optimization recommendations"},
# And assign them appropriately.

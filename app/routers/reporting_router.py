"""
Reporting API Router for Report Definitions and Schedules
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from ..database import get_db
from ..auth.auth_dependencies import get_current_active_user # Actual dependency
from ..models.user import User # Actual User model
from ..schemas import analytics_schemas as schemas # Our defined schemas
# Import services
from ..services.reporting_service_part1 import ReportingService, get_reporting_service
from ..services.reporting_service_part2 import ReportSchedulingService, get_reporting_services # get_reporting_services provides a dict

router = APIRouter(
    prefix="/reporting", # Changed prefix for clarity
    tags=["Reporting - Definitions & Schedules"],
    responses={404: {"description": "Not found"}},
)

# Dependency for ReportSchedulingService
# get_reporting_services returns a dictionary of services. We need to extract the scheduling service.
def get_schedule_service(services: Dict[str, Any] = Depends(get_reporting_services)) -> ReportSchedulingService:
    schedule_service = services.get("scheduling") # Key used in get_reporting_services
    if not schedule_service:
        # This case should ideally not happen if get_reporting_services is set up correctly
        raise HTTPException(status_code=500, detail="ReportSchedulingService not available")
    # Ensure the returned object is of the correct type, if necessary for type hinting or Pylint
    if not isinstance(schedule_service, ReportSchedulingService):
        raise HTTPException(status_code=500, detail="Fetched scheduling service is of incorrect type.")
    return schedule_service

# --- ReportDefinition Endpoints ---

@router.post("/definitions/", response_model=schemas.ReportDefinitionInDB, status_code=status.HTTP_201_CREATED)
async def create_report_definition(
    report_def_create: schemas.ReportDefinitionCreate,
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service)
):
    """Create a new Report Definition."""
    # tenant_id will be derived from current_user
    # user_id for creation will also be from current_user
    # This service method needs to be created in ReportingService
    report_def = reporting_service.create_report_definition(
        report_def_create=report_def_create,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id
    )
    return report_def

@router.get("/definitions/{definition_id}", response_model=schemas.ReportDefinitionInDB)
async def get_report_definition(
    definition_id: int,
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service)
):
    """Get a specific Report Definition."""
    # Service method get_report_definition already added conceptually to ReportingService
    report_def = reporting_service.get_report_definition(
        report_definition_id=definition_id,
        tenant_id=current_user.tenant_id
    )
    if not report_def:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Definition not found")
    return report_def

@router.get("/definitions/", response_model=List[schemas.ReportDefinitionInDB])
async def list_report_definitions(
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service),
    skip: int = 0,
    limit: int = 100
):
    """List all Report Definitions for the current user's tenant."""
    # This service method needs to be created in ReportingService
    report_defs = reporting_service.list_report_definitions(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id, # Potentially for filtering by user ownership if needed
        skip=skip,
        limit=limit
    )
    return report_defs

@router.put("/definitions/{definition_id}", response_model=schemas.ReportDefinitionInDB)
async def update_report_definition(
    definition_id: int,
    report_def_update: schemas.ReportDefinitionUpdate,
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service)
):
    """Update a Report Definition."""
    # This service method needs to be created in ReportingService
    report_def = reporting_service.update_report_definition(
        report_definition_id=definition_id,
        report_def_update=report_def_update,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id # For ownership/permission check
    )
    if not report_def:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Definition not found or not authorized to update")
    return report_def

@router.delete("/definitions/{definition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report_definition(
    definition_id: int,
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service)
):
    """Delete a Report Definition."""
    # This service method needs to be created in ReportingService
    success = reporting_service.delete_report_definition(
        report_definition_id=definition_id,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id # For ownership/permission check
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Definition not found or not authorized to delete")
    return

# Endpoint for on-demand report data generation
@router.post("/definitions/{definition_id}/generate-data", response_model=Dict[str, Any])
async def generate_report_definition_data(
    definition_id: int,
    current_user: User = Depends(get_current_active_user),
    reporting_service: ReportingService = Depends(get_reporting_service)
):
    """Generate data for a Report Definition on-demand."""
    try:
        report_data = await reporting_service.generate_report_data(
            report_definition_id=definition_id,
            tenant_id=current_user.tenant_id
        )
        return report_data
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate report data")

# --- ReportSchedule Endpoints (for ReportDefinition) ---

@router.post("/schedules/", response_model=schemas.ReportScheduleInDB, status_code=status.HTTP_201_CREATED)
async def create_report_schedule(
    schedule_create: schemas.ReportScheduleCreate, # Uses report_definition_id
    current_user: User = Depends(get_current_active_user),
    schedule_service: ReportSchedulingService = Depends(get_schedule_service)
):
    """Create a new schedule for a Report Definition."""
    # Ensure the ReportDefinition exists and belongs to the tenant
    # This check could also be done within the service.
    # reporting_service = get_reporting_service(db=Depends(get_db), custom_dashboard_service=...) # How to get this here?
    # For now, assume schedule_service might do a basic check or this is handled by FK constraints later.

    # The ReportScheduleCreate schema expects report_definition_id.
    # The service method create_definition_schedule handles it.
    try:
        schedule = schedule_service.create_definition_schedule(
            schedule_data=schedule_create,
            tenant_id=current_user.tenant_id,
            created_by_user_id=current_user.id
        )
        return schedule
    except ValueError as ve: # Catch validation errors from service (e.g. invalid cron)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.get("/schedules/{schedule_id}", response_model=schemas.ReportScheduleInDB)
async def get_report_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_active_user),
    schedule_service: ReportSchedulingService = Depends(get_schedule_service)
):
    """Get a specific Report Schedule."""
    schedule = schedule_service.get_definition_schedule(
        schedule_id=schedule_id,
        tenant_id=current_user.tenant_id
    )
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Schedule not found")
    return schedule

@router.get("/schedules/", response_model=List[schemas.ReportScheduleInDB])
async def list_report_schedules(
    report_definition_id: Optional[int] = None, # Filter by report definition
    current_user: User = Depends(get_current_active_user),
    schedule_service: ReportSchedulingService = Depends(get_schedule_service)
):
    """List Report Schedules for the current tenant, optionally filtered by Report Definition ID."""
    schedules = schedule_service.list_definition_schedules(
        tenant_id=current_user.tenant_id,
        report_definition_id=report_definition_id
    )
    return schedules

@router.put("/schedules/{schedule_id}", response_model=schemas.ReportScheduleInDB)
async def update_report_schedule(
    schedule_id: int,
    schedule_update: schemas.ReportScheduleUpdate,
    current_user: User = Depends(get_current_active_user),
    schedule_service: ReportSchedulingService = Depends(get_schedule_service)
):
    """Update a Report Schedule."""
    # The service method update_definition_schedule handles tenant check.
    try:
        updated_schedule = schedule_service.update_definition_schedule(
            schedule_id=schedule_id,
            schedule_update_data=schedule_update,
            tenant_id=current_user.tenant_id
        )
        if not updated_schedule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Schedule not found or not authorized to update")
        return updated_schedule
    except ValueError as ve: # Catch validation errors from service (e.g. invalid cron)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_active_user),
    schedule_service: ReportSchedulingService = Depends(get_schedule_service)
):
    """Delete a Report Schedule."""
    success = schedule_service.delete_definition_schedule(
        schedule_id=schedule_id,
        tenant_id=current_user.tenant_id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report Schedule not found or not authorized to delete")
    return
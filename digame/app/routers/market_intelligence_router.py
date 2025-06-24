"""
Market Intelligence router for industry trend analysis and competitive intelligence
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Body, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging # For logging, can be replaced by a more structured logger

from ..services.market_intelligence_service import MarketIntelligenceService, get_market_intelligence_service
# from ..services.market_intelligence_reports_service import get_market_intelligence_reports_service # If used
from ..models.market_intelligence import MarketTrend, CompetitiveAnalysis, IntelligenceReport, MarketDataSource
from ..schemas import market_intelligence_schemas as mi_schemas
from ..auth.auth_dependencies import get_current_active_user, PermissionChecker, get_tenant_id # Assuming get_tenant_id
from ..models.user import User as SQLAlchemyUser
from ..database import get_db # Actual DB dependency

router = APIRouter(
    prefix="/market-intelligence",
    tags=["Market Intelligence"]
)

# Permissions (example names, define these in your RBAC system)
PERM_VIEW_MI = "market_intelligence:view"
PERM_MANAGE_MI_SOURCES = "market_intelligence:manage_sources"
PERM_MANAGE_MI_TRENDS = "market_intelligence:manage_trends"
PERM_MANAGE_MI_REPORTS = "market_intelligence:manage_reports"
PERM_TRIGGER_MI_ANALYSIS = "market_intelligence:trigger_analysis"


# --- Market Trends Endpoints ---
@router.get("/trends",
            response_model=List[mi_schemas.MarketTrendResponse],
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def list_market_trends_endpoint(
    industry: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    trend_type: Optional[str] = Query(None),
    impact_level: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    tenant_id: int = Depends(get_tenant_id), # Get tenant_id from auth
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """List market trends for the current tenant."""
    trends = service.get_market_trends(
        tenant_id=tenant_id, industry=industry, category=category,
        trend_type=trend_type, impact_level=impact_level, active_only=active_only
    ) # Assuming get_market_trends handles skip/limit or add them
    # For now, assuming service handles pagination if needed, or apply here.
    # This example doesn't show pagination in the service call, but it's in the mock.
    return [mi_schemas.MarketTrendResponse.from_orm(t) for t in trends[skip:skip+limit]]

@router.post("/trends",
             response_model=mi_schemas.MarketTrendResponse,
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_TRENDS))])
async def create_market_trend_endpoint(
    trend_data: mi_schemas.MarketTrendCreate,
    tenant_id: int = Depends(get_tenant_id),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Create a new market trend."""
    try:
        trend = service.create_market_trend(
            tenant_id=tenant_id,
            trend_data=trend_data.dict(), # Pass as dict
            created_by_user_id=current_user.id
        )
        return mi_schemas.MarketTrendResponse.from_orm(trend)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logging.error(f"Failed to create market trend: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create market trend")

@router.get("/trends/{trend_id}/impact-analysis",
            response_model=Dict[str, Any], # Or a specific Pydantic model for impact analysis
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def analyze_trend_impact_endpoint(
    trend_id: int = Path(..., description="ID of the market trend"),
    tenant_id: int = Depends(get_tenant_id), # Ensure trend belongs to user's tenant
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Analyze the impact of a specific market trend."""
    # Ensure trend_id is accessible by tenant_id first
    trend = service.db.query(MarketTrend).filter(MarketTrend.id == trend_id, MarketTrend.tenant_id == tenant_id).first()
    if not trend:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market trend not found for this tenant.")
    try:
        analysis = service.analyze_trend_impact(trend_id=trend_id)
        return analysis
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve)) # If trend_id not found in service
    except Exception as e:
        logging.error(f"Failed to analyze trend impact: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error analyzing trend impact.")


# --- Market Data Source Endpoints (New) ---
@router.post("/data-sources",
             response_model=mi_schemas.MarketDataSourceResponse,
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_SOURCES))])
async def create_market_data_source_endpoint(
    source_data: mi_schemas.MarketDataSourceCreate,
    tenant_id: int = Depends(get_tenant_id),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Create a new market data source."""
    data_source = service.create_market_data_source(
        tenant_id=tenant_id, source_data=source_data, created_by_user_id=current_user.id
    )
    return mi_schemas.MarketDataSourceResponse.from_orm(data_source)

@router.get("/data-sources",
            response_model=List[mi_schemas.MarketDataSourceResponse],
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def list_market_data_sources_endpoint(
    source_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """List market data sources for the current tenant."""
    sources = service.list_market_data_sources(
        tenant_id=tenant_id, source_type=source_type, is_active=is_active, skip=skip, limit=limit
    )
    return [mi_schemas.MarketDataSourceResponse.from_orm(s) for s in sources]

@router.get("/data-sources/{source_id}",
            response_model=mi_schemas.MarketDataSourceResponse,
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def get_market_data_source_endpoint(
    source_id: int = Path(..., description="ID of the market data source"),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Get a specific market data source."""
    source = service.get_market_data_source(source_id=source_id, tenant_id=tenant_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market data source not found.")
    return mi_schemas.MarketDataSourceResponse.from_orm(source)

@router.put("/data-sources/{source_id}",
            response_model=mi_schemas.MarketDataSourceResponse,
            dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_SOURCES))])
async def update_market_data_source_endpoint(
    source_id: int = Path(..., description="ID of the market data source to update"),
    update_data: mi_schemas.MarketDataSourceUpdate = Body(...),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Update a market data source."""
    updated_source = service.update_market_data_source(
        source_id=source_id, tenant_id=tenant_id, update_data=update_data
    )
    if not updated_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market data source not found or update failed.")
    return mi_schemas.MarketDataSourceResponse.from_orm(updated_source)

@router.delete("/data-sources/{source_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_SOURCES))])
async def delete_market_data_source_endpoint(
    source_id: int = Path(..., description="ID of the market data source to delete"),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Delete a market data source."""
    if not service.delete_market_data_source(source_id=source_id, tenant_id=tenant_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market data source not found.")
    return


# --- Industry Report Ingestion Endpoint (New) ---
class ReportTrendUpload(BaseModel):
    report_data_source_id: int = Field(..., description="ID of the MarketDataSource representing the uploaded report.")
    extracted_trends: List[mi_schemas.MarketTrendCreate] = Field(..., description="List of structured trends extracted from the report.")

@router.post("/industry-reports/process",
             response_model=List[mi_schemas.MarketTrendResponse],
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_TRENDS))]) # Or a more specific permission
async def process_uploaded_industry_report_endpoint(
    upload_data: ReportTrendUpload,
    tenant_id: int = Depends(get_tenant_id),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """
    Processes structured trend data extracted from an uploaded industry report
    and creates MarketTrend entries.
    """
    try:
        created_trends = service.process_uploaded_industry_report(
            report_data_source_id=upload_data.report_data_source_id,
            extracted_trends_data=upload_data.extracted_trends,
            tenant_id=tenant_id,
            created_by_user_id=current_user.id
        )
        return [mi_schemas.MarketTrendResponse.from_orm(t) for t in created_trends]
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logging.error(f"Failed to process industry report: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process industry report.")


# --- Skill Demand Forecast Endpoint (New) ---
@router.get("/skill-demand-forecast",
            response_model=mi_schemas.SkillDemandForecastResponse,
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def get_skill_demand_forecast_endpoint(
    skills: List[str] = Query(..., description="List of skill keywords to analyze, e.g., ?skills=Python&skills=API"),
    time_horizon_months: int = Query(6, ge=1, le=24, description="Historical data window in months"),
    job_sample_size: int = Query(200, ge=50, le=1000, description="Conceptual sample size for job analysis"),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """
    Provides a forecast for skill demand based on job postings and industry trends.
    """
    if not skills:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one skill keyword must be provided.")
    try:
        forecast = service.forecast_skill_demand(
            skill_keywords=skills,
            tenant_id=tenant_id,
            time_horizon_months=time_horizon_months,
            job_description_sample_size=job_sample_size
        )
        return forecast
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logging.error(f"Failed to generate skill demand forecast: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error generating skill demand forecast.")


# --- Existing Competitive Analysis & Intelligence Report Endpoints (To Be Refactored) ---
# These would be refactored similarly to the /trends endpoints, using the service and schemas.
# For brevity, I'm not fully refactoring them here but indicating the pattern.

@router.get("/competitive-analysis",
            response_model=List[mi_schemas.CompetitiveAnalysisResponse], # Example, use actual schema
            dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def list_competitive_analyses_endpoint(
    industry: Optional[str] = Query(None),
    analysis_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Refactored: Get competitive analyses for tenant."""
    analyses = service.get_competitive_analyses(
        tenant_id=tenant_id, industry=industry, analysis_type=analysis_type, limit=limit
    )
    # Apply skip here if not handled by service
    return [mi_schemas.CompetitiveAnalysisResponse.from_orm(a) for a in analyses[skip:skip+limit]]

@router.post("/competitive-analysis",
             response_model=mi_schemas.CompetitiveAnalysisResponse, # Example
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(PermissionChecker(PERM_MANAGE_MI_REPORTS))]) # Example perm
async def create_competitive_analysis_endpoint(
    analysis_data: mi_schemas.CompetitiveAnalysisCreate, # Example
    tenant_id: int = Depends(get_tenant_id),
    current_user: SQLAlchemyUser = Depends(get_current_active_user),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Refactored: Create a new competitive analysis."""
    try:
        analysis = service.create_competitive_analysis(
            tenant_id=tenant_id, analysis_data=analysis_data.dict(), created_by_user_id=current_user.id
        )
        return mi_schemas.CompetitiveAnalysisResponse.from_orm(analysis)
    except Exception as e:
        logging.error(f"Failed to create competitive analysis: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create competitive analysis")

# ... Other existing endpoints like /porter-analysis, /reports, /reports/generate, /dashboard
# would be refactored following the same pattern:
# - Use actual service methods instead of mocks.
# - Use Pydantic schemas for request/response.
# - Use proper dependency injection for db, service, current_user, tenant_id.
# - Add appropriate permission checks.

# Mocked /dashboard endpoint for now, to be refactored
@router.get("/dashboard", response_model=Dict[str, Any], dependencies=[Depends(PermissionChecker(PERM_VIEW_MI))])
async def get_market_intelligence_dashboard_endpoint(
    tenant_id: int = Depends(get_tenant_id),
    service: MarketIntelligenceService = Depends(get_market_intelligence_service)
):
    """Refactored: Get market intelligence dashboard data."""
    try:
        dashboard_data = service.get_market_intelligence_dashboard(tenant_id=tenant_id)
        return {"success": True, "dashboard": dashboard_data, "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logging.error(f"Failed to get MI dashboard: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching MI dashboard.")

# Note: The mock background task `mock_report_generation` and its endpoint `/reports/generate`
# would need to be properly integrated with IntelligenceReport model and service.
# `get_market_intelligence_reports_service` is available if needed for IntelligenceReport specific logic.

# Ensure `get_tenant_id` is a valid dependency providing the current user's tenant ID.
# Example:
# async def get_tenant_id(current_user: SQLAlchemyUser = Depends(get_current_active_user), db: Session = Depends(get_db)) -> int:
#     # Logic to get tenant_id from user, e.g., user.tenants[0].tenant_id
#     # This needs to be robust based on your multi-tenancy setup.
#     if not current_user.tenants: # Assuming User model has a 'tenants' relationship
#         raise HTTPException(status_code=403, detail="User not associated with a tenant.")
#     return current_user.tenants[0].id # Simplified example
# This should be defined in auth_dependencies or a similar shared location.
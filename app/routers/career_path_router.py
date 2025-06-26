"""
API router for Career Path Modeling and Salary Progression Forecasting
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..services.career_path_modeling_service import get_career_path_modeling_service, CareerPathModelingService
from ..schemas import career_path_schemas as cp_schemas
from ..models.user import User

router = APIRouter(
    prefix="/career-path",
    tags=["Career Path Modeling"],
    responses={404: {"description": "Not found"}}
)


@router.post(
    "/salary-forecast",
    response_model=cp_schemas.SalaryProgressionResponse,
    summary="Generate Salary Progression Forecast",
    description="Generate comprehensive salary progression forecast based on market data, industry trends, and career path analysis"
)
async def forecast_salary_progression(
    request: cp_schemas.SalaryProgressionRequest,
    tenant_id: int = Query(default=1, description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive salary progression forecast including:
    - Market-based salary benchmarking
    - Skill premium analysis
    - Industry trend impact
    - Career path scenarios
    - Confidence intervals
    """
    try:
        service = get_career_path_modeling_service(db)
        
        # Validate input ranges
        if request.current_salary <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current salary must be greater than 0"
            )
        
        if request.years_experience < 0 or request.years_experience > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Years of experience must be between 0 and 50"
            )
        
        if request.forecast_years < 1 or request.forecast_years > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forecast years must be between 1 and 10"
            )
        
        if len(request.skills) > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 20 skills allowed"
            )
        
        forecast = service.forecast_salary_progression(
            tenant_id=tenant_id,
            current_role=request.current_role,
            current_salary=request.current_salary,
            years_experience=request.years_experience,
            industry=request.industry,
            location=request.location,
            skills=request.skills,
            target_roles=request.target_roles,
            forecast_years=request.forecast_years
        )
        
        return forecast
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating salary forecast: {str(e)}"
        )


@router.get(
    "/industry-trends/{industry}",
    response_model=cp_schemas.IndustryTrendsResponse,
    summary="Get Real-time Industry Trends",
    description="Get real-time industry trends affecting career paths and salaries"
)
async def get_industry_trends(
    industry: str,
    refresh_data: bool = Query(default=False, description="Whether to refresh data from external sources"),
    tenant_id: int = Query(default=1, description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """
    Get real-time industry trends including:
    - Career impact analysis
    - Salary trend indicators
    - Skill demand changes
    - Job market indicators
    - Key insights and recommendations
    """
    try:
        service = get_career_path_modeling_service(db)
        
        trends = service.get_real_time_industry_trends(
            industry=industry,
            tenant_id=tenant_id,
            refresh_data=refresh_data
        )
        
        return trends
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching industry trends: {str(e)}"
        )


@router.get(
    "/industries",
    response_model=List[str],
    summary="Get Available Industries",
    description="Get list of industries available for career path analysis"
)
async def get_available_industries(
    db: Session = Depends(get_db)
):
    """Get list of industries available for analysis"""
    try:
        # Return common industries (in real implementation, query from database)
        industries = [
            "Technology",
            "Finance",
            "Healthcare",
            "Manufacturing",
            "Retail",
            "Education",
            "Consulting",
            "Energy",
            "Media",
            "Transportation",
            "Real Estate",
            "Government",
            "Non-profit",
            "Telecommunications",
            "Aerospace"
        ]
        
        return industries
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching industries: {str(e)}"
        )


@router.get(
    "/roles/{industry}",
    response_model=List[str],
    summary="Get Common Roles by Industry",
    description="Get list of common job roles for a specific industry"
)
async def get_industry_roles(
    industry: str,
    db: Session = Depends(get_db)
):
    """Get common job roles for a specific industry"""
    try:
        # Return common roles by industry (in real implementation, query from database)
        industry_roles = {
            "technology": [
                "Software Engineer",
                "Senior Software Engineer",
                "Staff Engineer",
                "Principal Engineer",
                "Data Scientist",
                "Data Analyst",
                "Product Manager",
                "Engineering Manager",
                "DevOps Engineer",
                "UX Designer",
                "Technical Lead",
                "Architect"
            ],
            "finance": [
                "Financial Analyst",
                "Investment Banker",
                "Portfolio Manager",
                "Risk Analyst",
                "Quantitative Analyst",
                "Financial Advisor",
                "Compliance Officer",
                "Auditor",
                "Controller",
                "CFO"
            ],
            "healthcare": [
                "Physician",
                "Nurse",
                "Medical Technician",
                "Healthcare Administrator",
                "Pharmacist",
                "Physical Therapist",
                "Medical Researcher",
                "Healthcare Analyst",
                "Clinical Coordinator"
            ]
        }
        
        roles = industry_roles.get(industry.lower(), [
            "Manager",
            "Senior Manager",
            "Director",
            "Vice President",
            "Analyst",
            "Senior Analyst",
            "Specialist",
            "Coordinator",
            "Administrator"
        ])
        
        return roles
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching roles: {str(e)}"
        )


@router.get(
    "/skills/trending",
    response_model=cp_schemas.SkillDemandChanges,
    summary="Get Trending Skills",
    description="Get trending skills across all industries"
)
async def get_trending_skills(
    industry: Optional[str] = Query(default=None, description="Filter by specific industry"),
    tenant_id: int = Query(default=1, description="Tenant ID"),
    db: Session = Depends(get_db)
):
    """Get trending skills with demand changes"""
    try:
        service = get_career_path_modeling_service(db)
        
        # Use the service method to get skill demand changes
        skill_changes = service._get_skill_demand_changes(
            industry=industry or "technology",
            tenant_id=tenant_id
        )
        
        return skill_changes
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching trending skills: {str(e)}"
        )


@router.get(
    "/health",
    summary="Career Path Service Health Check",
    description="Check the health status of the career path modeling service"
)
async def health_check(
    db: Session = Depends(get_db)
):
    """Health check endpoint for career path modeling service"""
    try:
        service = get_career_path_modeling_service(db)
        
        return {
            "status": "healthy",
            "service": "career_path_modeling",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )
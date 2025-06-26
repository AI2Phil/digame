"""
Simulation and Decision Support API router for scenario planning and strategic analysis
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path, Body
from fastapi import status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..database import get_db
from ..services.simulation_service import SimulationService, get_simulation_service
from ..models.simulation import Simulation, Scenario, DecisionAnalysis, RiskAssessment, StrategicPlan
from ..schemas.simulation_schemas import (
    SimulationCreate, SimulationUpdate, SimulationResponse, SimulationSummary,
    ScenarioCreate, ScenarioResponse,
    DecisionAnalysisCreate, DecisionAnalysisResponse,
    RiskAssessmentCreate, RiskAssessmentResponse,
    StrategicPlanCreate, StrategicPlanResponse,
    SimulationTemplateCreate, SimulationTemplateResponse,
    ScenarioPlanningRequest, DecisionImpactRequest, RiskAssessmentRequest,
    StrategicPlanningRequest, ResourceOptimizationRequest, PerformanceForecastingRequest,
    SimulationExecutionRequest, SimulationResults, SimulationAnalytics
)

router = APIRouter(prefix="/api/simulation", tags=["simulation-decision-support"])


# Simulation Management Endpoints

@router.post("/simulations", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    simulation_data: SimulationCreate,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a new simulation
    """
    try:
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data.dict()
        )
        return SimulationResponse.from_orm(simulation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/simulations", response_model=List[SimulationSummary])
async def get_simulations(
    tenant_id: int = Query(..., description="Tenant ID"),
    simulation_type: Optional[str] = Query(None, description="Filter by simulation type"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Get simulations for a tenant with optional filtering
    """
    try:
        simulations = simulation_service.get_simulations(
            tenant_id=tenant_id,
            simulation_type=simulation_type,
            status=status_filter,
            skip=skip,
            limit=limit
        )
        
        # Convert to summary format
        summaries = []
        for sim in simulations:
            # Handle insights and recommendations safely
            insights_data = sim.insights if hasattr(sim, 'insights') and sim.insights else []
            recommendations_data = sim.recommendations if hasattr(sim, 'recommendations') and sim.recommendations else []
            
            # Convert to list if it's a JSON field
            if isinstance(insights_data, str):
                try:
                    import json
                    insights_data = json.loads(insights_data)
                except:
                    insights_data = []
            if isinstance(recommendations_data, str):
                try:
                    import json
                    recommendations_data = json.loads(recommendations_data)
                except:
                    recommendations_data = []
            
            summary = SimulationSummary(
                id=sim.id,
                name=sim.name,
                simulation_type=sim.simulation_type,
                status=sim.status,
                confidence_score=sim.confidence_score,
                created_at=sim.created_at,
                execution_duration=sim.execution_duration,
                insights_count=len(insights_data) if isinstance(insights_data, list) else 0,
                recommendations_count=len(recommendations_data) if isinstance(recommendations_data, list) else 0
            )
            summaries.append(summary)
        
        return summaries
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: int = Path(..., description="Simulation ID"),
    tenant_id: int = Query(..., description="Tenant ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Get a specific simulation by ID
    """
    try:
        simulation = simulation_service.get_simulation(simulation_id, tenant_id)
        if not simulation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
        
        return SimulationResponse.from_orm(simulation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/simulations/{simulation_id}/execute", response_model=SimulationResults)
async def execute_simulation(
    simulation_id: int = Path(..., description="Simulation ID"),
    execution_request: SimulationExecutionRequest = Body(...),
    tenant_id: int = Query(..., description="Tenant ID"),
    background_tasks: BackgroundTasks = Depends(),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Execute a simulation and return results
    """
    try:
        # Verify simulation exists and belongs to tenant
        simulation = simulation_service.get_simulation(simulation_id, tenant_id)
        if not simulation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
        
        # Execute simulation
        results = simulation_service.run_simulation(simulation_id)
        
        return SimulationResults(
            simulation_id=simulation_id,
            execution_time=results.get("execution_time", 0.0),
            results=results["results"],
            insights=results["insights"],
            recommendations=results["recommendations"],
            confidence_score=results["confidence_score"],
            status="completed"
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Specialized Simulation Creation Endpoints

@router.post("/scenario-planning", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario_planning_simulation(
    request: ScenarioPlanningRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a scenario planning simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "scenario_planning",
            "base_scenario": request.base_scenario,
            "variables": request.variables,
            "simulation_parameters": {
                "num_alternative_scenarios": request.num_alternative_scenarios,
                "variable_weights": request.variable_weights
            },
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/decision-impact", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_decision_impact_simulation(
    request: DecisionImpactRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a decision impact analysis simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "decision_impact",
            "base_scenario": request.base_scenario,
            "simulation_parameters": {
                "decision_options": request.decision_options,
                "criteria": request.criteria
            },
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/risk-assessment", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_risk_assessment_simulation(
    request: RiskAssessmentRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a risk assessment simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "risk_assessment",
            "base_scenario": request.base_scenario,
            "simulation_parameters": {
                "risk_categories": request.risk_categories,
                "assessment_scope": request.assessment_scope
            },
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/strategic-planning", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_strategic_planning_simulation(
    request: StrategicPlanningRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a strategic planning simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "strategic_planning",
            "base_scenario": request.base_scenario,
            "simulation_parameters": {
                "objectives": request.objectives,
                "time_horizon_months": request.time_horizon_months,
                "vision": request.vision,
                "mission": request.mission
            },
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/resource-optimization", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_resource_optimization_simulation(
    request: ResourceOptimizationRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a resource optimization simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "resource_optimization",
            "base_scenario": request.base_scenario,
            "simulation_parameters": {
                "resources": request.resources,
                "objectives": request.objectives
            },
            "constraints": request.constraints,
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/performance-forecasting", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_forecasting_simulation(
    request: PerformanceForecastingRequest,
    tenant_id: int = Query(..., description="Tenant ID"),
    created_by: int = Query(..., description="Creator user ID"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Create a performance forecasting simulation
    """
    try:
        simulation_data = {
            "name": request.name,
            "description": request.description,
            "simulation_type": "performance_forecasting",
            "base_scenario": request.base_scenario,
            "simulation_parameters": {
                "historical_data": request.historical_data,
                "metrics": request.metrics,
                "forecast_horizon_months": request.forecast_horizon_months
            },
            "tags": request.tags
        }
        
        simulation = simulation_service.create_simulation(
            tenant_id=tenant_id,
            created_by=created_by,
            simulation_data=simulation_data
        )
        return SimulationResponse.from_orm(simulation)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Analytics and Insights Endpoints

@router.get("/analytics", response_model=SimulationAnalytics)
async def get_simulation_analytics(
    tenant_id: int = Query(..., description="Tenant ID"),
    time_period_days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Get comprehensive simulation analytics for a tenant
    """
    try:
        # Get simulations for the time period
        start_date = datetime.utcnow() - timedelta(days=time_period_days)
        
        # This would be implemented in the service layer
        # For now, return a basic structure
        analytics = SimulationAnalytics(
            total_simulations=0,
            completed_simulations=0,
            average_execution_time=0.0,
            success_rate=0.0,
            simulation_types={},
            recent_simulations=[],
            top_insights=[],
            common_recommendations=[]
        )
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/insights/trending")
async def get_trending_insights(
    tenant_id: int = Query(..., description="Tenant ID"),
    limit: int = Query(10, ge=1, le=50),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Get trending insights across all simulations
    """
    try:
        # This would analyze insights across simulations to find common patterns
        trending_insights = [
            {
                "insight": "Resource allocation optimization shows 15% efficiency gains on average",
                "frequency": 8,
                "confidence": 0.85,
                "simulation_types": ["resource_optimization", "strategic_planning"]
            },
            {
                "insight": "Risk mitigation strategies reduce impact by 30% in most scenarios",
                "frequency": 6,
                "confidence": 0.78,
                "simulation_types": ["risk_assessment", "scenario_planning"]
            }
        ]
        
        return {
            "trending_insights": trending_insights[:limit],
            "analysis_period": f"Last {30} days",
            "total_insights_analyzed": 150
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/recommendations/actionable")
async def get_actionable_recommendations(
    tenant_id: int = Query(..., description="Tenant ID"),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100),
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """
    Get actionable recommendations from recent simulations
    """
    try:
        # This would aggregate recommendations across simulations
        recommendations = [
            {
                "recommendation": "Implement automated resource reallocation based on demand forecasting",
                "priority": "high",
                "category": "resource_optimization",
                "estimated_impact": "15-20% efficiency improvement",
                "implementation_effort": "medium",
                "source_simulations": [1, 3, 7],
                "confidence": 0.88
            },
            {
                "recommendation": "Establish early warning system for identified risk factors",
                "priority": "high",
                "category": "risk_management",
                "estimated_impact": "30% risk reduction",
                "implementation_effort": "low",
                "source_simulations": [2, 5, 9],
                "confidence": 0.82
            }
        ]
        
        # Apply filters
        if priority:
            recommendations = [r for r in recommendations if r["priority"] == priority]
        if category:
            recommendations = [r for r in recommendations if r["category"] == category]
        
        return {
            "actionable_recommendations": recommendations[:limit],
            "total_recommendations": len(recommendations),
            "filters_applied": {"priority": priority, "category": category}
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Simulation Templates

@router.get("/templates", response_model=List[SimulationTemplateResponse])
async def get_simulation_templates(
    tenant_id: int = Query(..., description="Tenant ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    simulation_type: Optional[str] = Query(None, description="Filter by simulation type"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    db: Session = Depends(get_db)
):
    """
    Get available simulation templates
    """
    try:
        # This would be implemented to fetch templates
        # For now, return empty list
        return []
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Health check endpoint
@router.get("/health")
async def simulation_health():
    """
    Health check for simulation and decision support service
    """
    return {
        "status": "healthy",
        "service": "simulation-decision-support",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "scenario_planning",
            "decision_impact_analysis",
            "risk_assessment",
            "strategic_planning",
            "resource_optimization",
            "performance_forecasting"
        ]
    }
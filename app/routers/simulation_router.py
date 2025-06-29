"""
Simulation Router - API endpoints for digital twin simulation functionality
Provides REST API access to simulation engine operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.services.simulation_engine import SimulationEngine, SimulationParameters, SimulationType
from app.crud.digital_twin_crud import get_digital_twin
from app.models.user import User
from app.auth.auth_dependencies import get_current_user

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# Pydantic models for request/response
class SimulationRequest(BaseModel):
    simulation_type: str = Field(..., description="Type of simulation to run")
    time_horizon: int = Field(7, description="Number of days to simulate (1-30)")
    optimization_target: str = Field("productivity", description="Optimization target: productivity, efficiency, balance")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Simulation constraints")
    variables: Dict[str, Any] = Field(default_factory=dict, description="Simulation variables")

class SimulationResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class SimulationResultResponse(BaseModel):
    simulation_id: str
    simulation_type: str
    status: str
    results: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, float]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    confidence_score: Optional[float] = None
    execution_time_ms: Optional[int] = None
    created_at: str

# Global simulation engine instance
simulation_engine = SimulationEngine()

def get_user_id(user: User) -> int:
    """Helper function to safely extract user ID from SQLAlchemy model"""
    try:
        return int(str(user.id))
    except (ValueError, TypeError):
        return int(str(user.id))

@router.post("/run", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run a new simulation for the user's digital twin
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Validate simulation type
        try:
            sim_type = SimulationType(request.simulation_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid simulation type: {request.simulation_type}"
            )
        
        # Create simulation parameters
        parameters = SimulationParameters(
            simulation_type=sim_type,
            time_horizon=request.time_horizon,
            optimization_target=request.optimization_target,
            constraints=request.constraints,
            variables=request.variables
        )
        
        # Run simulation
        result = await simulation_engine.run_simulation(parameters)
        
        # Convert result to response format
        response_data = {
            "simulation_id": result.simulation_id,
            "simulation_type": result.simulation_type.value,
            "status": "completed",
            "results": result.results,
            "metrics": result.metrics,
            "recommendations": result.recommendations,
            "confidence_score": result.confidence_score,
            "execution_time_ms": result.execution_time_ms,
            "created_at": result.created_at.isoformat()
        }
        
        return SimulationResponse(
            success=True,
            message="Simulation completed successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run simulation: {str(e)}"
        )

@router.get("/result/{simulation_id}", response_model=SimulationResponse)
async def get_simulation_result(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get results from a specific simulation
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found."
            )
        
        # Get simulation result
        result = simulation_engine.get_simulation_result(simulation_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulation {simulation_id} not found"
            )
        
        # Convert result to response format
        response_data = {
            "simulation_id": result.simulation_id,
            "simulation_type": result.simulation_type.value,
            "status": "completed",
            "results": result.results,
            "metrics": result.metrics,
            "recommendations": result.recommendations,
            "confidence_score": result.confidence_score,
            "execution_time_ms": result.execution_time_ms,
            "created_at": result.created_at.isoformat()
        }
        
        return SimulationResponse(
            success=True,
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation result: {str(e)}"
        )

@router.get("/history", response_model=SimulationResponse)
async def get_simulation_history(
    limit: Optional[int] = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get simulation history for the user
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found."
            )
        
        # Get all simulation IDs
        simulation_ids = simulation_engine.list_simulations()
        
        # Get results for each simulation (limited)
        simulations = []
        for sim_id in simulation_ids[:limit]:
            result = simulation_engine.get_simulation_result(sim_id)
            if result:
                simulations.append({
                    "simulation_id": result.simulation_id,
                    "simulation_type": result.simulation_type.value,
                    "status": "completed",
                    "metrics": result.metrics,
                    "confidence_score": result.confidence_score,
                    "execution_time_ms": result.execution_time_ms,
                    "created_at": result.created_at.isoformat()
                })
        
        return SimulationResponse(
            success=True,
            data={
                "simulations": simulations,
                "total_count": len(simulations)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation history: {str(e)}"
        )

@router.post("/schedule-optimization", response_model=SimulationResponse)
async def run_schedule_optimization(
    time_horizon: int = 7,
    optimization_target: str = "productivity",
    work_hours_start: int = 9,
    work_hours_end: int = 17,
    break_duration: int = 15,
    break_frequency: int = 2,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick schedule optimization simulation
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Create simulation request
        request = SimulationRequest(
            simulation_type="schedule_optimization",
            time_horizon=time_horizon,
            optimization_target=optimization_target,
            constraints={
                "work_hours": {"start": work_hours_start, "end": work_hours_end},
                "breaks": {"duration": break_duration, "frequency": break_frequency}
            },
            variables={
                "current_schedule": [],
                "energy_patterns": {"morning": 80, "afternoon": 60, "evening": 40}
            }
        )
        
        # Run the simulation
        return await run_simulation(request, current_user, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run schedule optimization: {str(e)}"
        )

@router.post("/productivity-scenario", response_model=SimulationResponse)
async def run_productivity_scenario(
    scenarios: List[str] = ["baseline", "optimized", "stressed"],
    time_horizon: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick productivity scenario simulation
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Create simulation request
        request = SimulationRequest(
            simulation_type="productivity_scenario",
            time_horizon=time_horizon,
            optimization_target="productivity",
            constraints={},
            variables={
                "scenarios": scenarios,
                "baseline_productivity": 70
            }
        )
        
        # Run the simulation
        return await run_simulation(request, current_user, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run productivity scenario: {str(e)}"
        )

@router.post("/workload-analysis", response_model=SimulationResponse)
async def run_workload_analysis(
    current_workload: int = 100,
    capacity: int = 120,
    time_horizon: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick workload analysis simulation
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Create simulation request
        request = SimulationRequest(
            simulation_type="workload_analysis",
            time_horizon=time_horizon,
            optimization_target="efficiency",
            constraints={},
            variables={
                "current_workload": current_workload,
                "capacity": capacity
            }
        )
        
        # Run the simulation
        return await run_simulation(request, current_user, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run workload analysis: {str(e)}"
        )

@router.post("/energy-management", response_model=SimulationResponse)
async def run_energy_management(
    morning_energy: int = 80,
    afternoon_energy: int = 60,
    evening_energy: int = 40,
    time_horizon: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick energy management simulation
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found. Please initialize your twin first."
            )
        
        # Create simulation request
        request = SimulationRequest(
            simulation_type="energy_management",
            time_horizon=time_horizon,
            optimization_target="balance",
            constraints={},
            variables={
                "energy_patterns": {
                    "morning": morning_energy,
                    "afternoon": afternoon_energy,
                    "evening": evening_energy
                }
            }
        )
        
        # Run the simulation
        return await run_simulation(request, current_user, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run energy management simulation: {str(e)}"
        )

@router.delete("/clear-cache", response_model=SimulationResponse)
async def clear_simulation_cache(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear the simulation cache (admin function)
    """
    try:
        # Verify user has a digital twin
        twin = get_digital_twin(db, user_id=get_user_id(current_user))
        if not twin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital twin not found."
            )
        
        # Clear cache
        simulation_engine.clear_cache()
        
        return SimulationResponse(
            success=True,
            message="Simulation cache cleared successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear simulation cache: {str(e)}"
        )

@router.get("/types", response_model=SimulationResponse)
async def get_simulation_types():
    """
    Get available simulation types and their descriptions
    """
    try:
        simulation_types = [
            {
                "type": "schedule_optimization",
                "name": "Schedule Optimization",
                "description": "Optimize your daily schedule for maximum productivity",
                "parameters": ["time_horizon", "optimization_target", "work_hours", "breaks"]
            },
            {
                "type": "productivity_scenario",
                "name": "Productivity Scenario",
                "description": "Compare different productivity scenarios and their outcomes",
                "parameters": ["scenarios", "time_horizon", "baseline_productivity"]
            },
            {
                "type": "workload_analysis",
                "name": "Workload Analysis",
                "description": "Analyze optimal workload distribution and capacity utilization",
                "parameters": ["current_workload", "capacity", "time_horizon"]
            },
            {
                "type": "energy_management",
                "name": "Energy Management",
                "description": "Optimize energy levels and work patterns for sustainability",
                "parameters": ["energy_patterns", "time_horizon", "optimization_target"]
            }
        ]
        
        return SimulationResponse(
            success=True,
            data={"simulation_types": simulation_types}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation types: {str(e)}"
        )
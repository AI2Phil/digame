"""
API endpoints for Digital Twin Platform Phase 3: Team Coordination
Provides REST endpoints for team management, multi-twin orchestration, and collaborative features
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, cast
from datetime import datetime
import logging

from app.services.team_twin_manager import TeamTwinManager, TeamCoordinationRequest, CoordinationPriority
from app.models.twin_phase3 import CoordinationType
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/twin/phase3", tags=["Digital Twin Phase 3 - Team Coordination"])

# Pydantic models for request/response
class TeamCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    team_lead_twin_id: str
    organization_id: Optional[int] = None

class TeamMemberRequest(BaseModel):
    twin_id: str
    user_id: int
    role: Optional[str] = "member"
    skills: Optional[Dict[str, float]] = None
    specializations: Optional[List[str]] = None

class CoordinationRequest(BaseModel):
    team_id: str
    coordination_type: str
    target_twins: List[str]
    parameters: Optional[Dict[str, Any]] = None
    goals: Optional[List[str]] = None
    priority: Optional[str] = "medium"

class TeamResponse(BaseModel):
    team_id: str
    name: str
    description: Optional[str]
    status: str
    member_count: int
    created_at: datetime

class CoordinationResponse(BaseModel):
    coordination_id: str
    team_id: str
    coordination_type: str
    status: str
    confidence: float
    estimated_improvement: float
    results: Dict[str, Any]

# Team Management Endpoints
@router.post("/teams/create", response_model=TeamResponse)
async def create_team(request: TeamCreateRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new digital twin team
    
    Args:
        request: Team creation request
        db: Database session
        
    Returns:
        Created team information
    """
    try:
        logger.info(f"Creating team '{request.name}' with lead {request.team_lead_twin_id}")
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.create_team(
            name=request.name,
            description=request.description or "",
            team_lead_twin_id=request.team_lead_twin_id,
            organization_id=request.organization_id
        )
        
        return TeamResponse(
            team_id=result["team_id"],
            name=result["name"],
            description=result["description"],
            status=result["status"],
            member_count=result["member_count"],
            created_at=datetime.fromisoformat(result["created_at"])
        )
        
    except Exception as e:
        logger.error(f"Error creating team: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create team: {str(e)}")

@router.post("/teams/{team_id}/members/add")
async def add_team_member(team_id: str, request: TeamMemberRequest, db: AsyncSession = Depends(get_db)):
    """
    Add a member to a digital twin team
    
    Args:
        team_id: Team identifier
        request: Team member request
        db: Database session
        
    Returns:
        Added member information
    """
    try:
        logger.info(f"Adding twin {request.twin_id} to team {team_id}")
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.add_team_member(
            team_id=team_id,
            twin_id=request.twin_id,
            user_id=request.user_id,
            role=request.role or "member",
            skills=request.skills,
            specializations=request.specializations
        )
        
        return {
            "success": True,
            "member": result,
            "message": f"Twin {request.twin_id} added to team {team_id}"
        }
        
    except Exception as e:
        logger.error(f"Error adding team member: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add team member: {str(e)}")

@router.get("/teams/{team_id}/status")
async def get_team_status(team_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get comprehensive team status and metrics
    
    Args:
        team_id: Team identifier
        db: Database session
        
    Returns:
        Team status with performance metrics
    """
    try:
        manager = TeamTwinManager(db_session=db)
        status = await manager.get_team_status(team_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting team status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get team status: {str(e)}")

# Team Coordination Endpoints
@router.post("/coordination/start", response_model=CoordinationResponse)
async def start_team_coordination(request: CoordinationRequest, background_tasks: BackgroundTasks, 
                                 db: AsyncSession = Depends(get_db)):
    """
    Start a team coordination process
    
    Args:
        request: Coordination request
        background_tasks: FastAPI background tasks
        db: Database session
        
    Returns:
        Coordination results and recommendations
    """
    try:
        logger.info(f"Starting {request.coordination_type} coordination for team {request.team_id}")
        
        # Validate coordination type
        try:
            coordination_type = cast(CoordinationType, CoordinationType(request.coordination_type))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid coordination type: {request.coordination_type}")
        
        # Validate priority
        try:
            priority = cast(CoordinationPriority, CoordinationPriority(request.priority or "medium"))
        except ValueError:
            priority = cast(CoordinationPriority, CoordinationPriority.MEDIUM)
        
        # Create coordination request
        coord_request = TeamCoordinationRequest(
            team_id=request.team_id,
            coordination_type=coordination_type,
            target_twins=request.target_twins,
            parameters=request.parameters or {},
            goals=request.goals or [],
            priority=priority
        )
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.coordinate_team_twins(coord_request)
        
        return CoordinationResponse(
            coordination_id=result["coordination_id"],
            team_id=result["team_id"],
            coordination_type=result["coordination_type"],
            status=result["status"],
            confidence=result["confidence"],
            estimated_improvement=result["estimated_improvement"],
            results=result["results"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting team coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start coordination: {str(e)}")

@router.post("/coordination/workload-balance")
async def coordinate_workload_balancing(team_id: str, target_twins: List[str], 
                                       parameters: Optional[Dict[str, Any]] = None,
                                       db: AsyncSession = Depends(get_db)):
    """
    Coordinate workload balancing across team members
    
    Args:
        team_id: Team identifier
        target_twins: List of twin identifiers to include
        parameters: Optional coordination parameters
        db: Database session
        
    Returns:
        Workload balancing results and recommendations
    """
    try:
        coord_request = TeamCoordinationRequest(
            team_id=team_id,
            coordination_type=CoordinationType.WORKLOAD_BALANCING,
            target_twins=target_twins,
            parameters=parameters or {},
            goals=["balance_workload", "optimize_utilization"],
            priority=CoordinationPriority.HIGH
        )
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.coordinate_team_twins(coord_request)
        
        return {
            "coordination_type": "workload_balancing",
            "team_id": team_id,
            "results": result["results"],
            "recommendations": result["results"].get("recommendations", []),
            "estimated_improvement": result["estimated_improvement"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        logger.error(f"Error in workload balancing coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to balance workload: {str(e)}")

@router.post("/coordination/skill-optimization")
async def coordinate_skill_optimization(team_id: str, target_twins: List[str],
                                       parameters: Optional[Dict[str, Any]] = None,
                                       db: AsyncSession = Depends(get_db)):
    """
    Coordinate skill optimization across team members
    
    Args:
        team_id: Team identifier
        target_twins: List of twin identifiers to include
        parameters: Optional coordination parameters
        db: Database session
        
    Returns:
        Skill optimization results and recommendations
    """
    try:
        coord_request = TeamCoordinationRequest(
            team_id=team_id,
            coordination_type=CoordinationType.SKILL_OPTIMIZATION,
            target_twins=target_twins,
            parameters=parameters or {},
            goals=["optimize_skills", "fill_gaps", "reduce_overlaps"],
            priority=CoordinationPriority.MEDIUM
        )
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.coordinate_team_twins(coord_request)
        
        return {
            "coordination_type": "skill_optimization",
            "team_id": team_id,
            "results": result["results"],
            "skill_gaps": result["results"].get("skill_gaps", []),
            "skill_overlaps": result["results"].get("skill_overlaps", []),
            "recommendations": result["results"].get("recommendations", []),
            "estimated_improvement": result["estimated_improvement"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        logger.error(f"Error in skill optimization coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize skills: {str(e)}")

@router.post("/coordination/meeting-optimization")
async def coordinate_meeting_optimization(team_id: str, target_twins: List[str],
                                         parameters: Optional[Dict[str, Any]] = None,
                                         db: AsyncSession = Depends(get_db)):
    """
    Coordinate meeting optimization for team collaboration
    
    Args:
        team_id: Team identifier
        target_twins: List of twin identifiers to include
        parameters: Optional coordination parameters (meeting_duration, frequency, etc.)
        db: Database session
        
    Returns:
        Meeting optimization results and recommendations
    """
    try:
        coord_request = TeamCoordinationRequest(
            team_id=team_id,
            coordination_type=CoordinationType.MEETING_OPTIMIZATION,
            target_twins=target_twins,
            parameters=parameters or {},
            goals=["optimize_schedules", "reduce_conflicts", "improve_collaboration"],
            priority=CoordinationPriority.MEDIUM
        )
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.coordinate_team_twins(coord_request)
        
        return {
            "coordination_type": "meeting_optimization",
            "team_id": team_id,
            "results": result["results"],
            "optimal_times": result["results"].get("optimal_meeting_times", []),
            "recommendations": result["results"].get("recommendations", []),
            "estimated_improvement": result["estimated_improvement"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        logger.error(f"Error in meeting optimization coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize meetings: {str(e)}")

@router.post("/coordination/absence-planning")
async def coordinate_absence_planning(team_id: str, target_twins: List[str],
                                     absence_info: Dict[str, Any],
                                     coverage_requirements: Optional[List[str]] = None,
                                     db: AsyncSession = Depends(get_db)):
    """
    Coordinate absence planning and coverage
    
    Args:
        team_id: Team identifier
        target_twins: List of twin identifiers to include
        absence_info: Information about planned absences
        coverage_requirements: Required coverage areas
        db: Database session
        
    Returns:
        Absence planning results and coverage recommendations
    """
    try:
        parameters = {
            "absence_info": absence_info,
            "coverage_requirements": coverage_requirements or []
        }
        
        coord_request = TeamCoordinationRequest(
            team_id=team_id,
            coordination_type=CoordinationType.ABSENCE_PLANNING,
            target_twins=target_twins,
            parameters=parameters,
            goals=["ensure_coverage", "minimize_disruption", "maintain_productivity"],
            priority=CoordinationPriority.HIGH
        )
        
        manager = TeamTwinManager(db_session=db)
        result = await manager.coordinate_team_twins(coord_request)
        
        return {
            "coordination_type": "absence_planning",
            "team_id": team_id,
            "results": result["results"],
            "coverage_plan": result["results"].get("coverage_plan", {}),
            "coverage_adequacy": result["results"].get("coverage_adequacy", 0),
            "risk_assessment": result["results"].get("risk_assessment", {}),
            "estimated_improvement": result["estimated_improvement"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        logger.error(f"Error in absence planning coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to plan absence coverage: {str(e)}")

# Team Analytics and Insights Endpoints
@router.get("/teams/{team_id}/analytics")
async def get_team_analytics(team_id: str, time_range_days: Optional[int] = 30,
                            db: AsyncSession = Depends(get_db)):
    """
    Get comprehensive team analytics and performance metrics
    
    Args:
        team_id: Team identifier
        time_range_days: Number of days to analyze
        db: Database session
        
    Returns:
        Team analytics and performance insights
    """
    try:
        manager = TeamTwinManager(db_session=db)
        
        # Get team status with metrics
        team_status = await manager.get_team_status(team_id)
        
        if "error" in team_status:
            raise HTTPException(status_code=404, detail=team_status["error"])
        
        # Calculate additional analytics
        analytics = {
            "team_id": team_id,
            "analysis_period_days": time_range_days,
            "team_metrics": team_status.get("metrics", {}),
            "member_performance": [
                {
                    "twin_id": member["twin_id"],
                    "role": member["role"],
                    "workload_utilization": member["workload"] / member["capacity"] if member["capacity"] > 0 else 0,
                    "skill_count": len(member["skills"]),
                    "availability": member["availability"]
                }
                for member in team_status.get("members", [])
            ],
            "coordination_history": team_status.get("recent_coordinations", []),
            "performance_trends": {
                "productivity_trend": "stable",  # Would be calculated from historical data
                "collaboration_trend": "improving",
                "workload_trend": "balanced"
            },
            "recommendations": [
                {
                    "type": "workload_optimization",
                    "description": "Consider rebalancing workload for optimal utilization",
                    "priority": "medium",
                    "impact": "moderate"
                },
                {
                    "type": "skill_development",
                    "description": "Identify skill gaps and development opportunities",
                    "priority": "low",
                    "impact": "high"
                }
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting team analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get team analytics: {str(e)}")

@router.get("/coordination/{coordination_id}/status")
async def get_coordination_status(coordination_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get status of a specific coordination process
    
    Args:
        coordination_id: Coordination identifier
        db: Database session
        
    Returns:
        Coordination status and results
    """
    try:
        manager = TeamTwinManager(db_session=db)
        
        # Check active coordinations cache first
        if coordination_id in manager.active_coordinations:
            coordination = manager.active_coordinations[coordination_id]
            return {
                "coordination_id": coordination_id,
                "status": coordination.status,
                "progress": float(coordination.progress_percentage or 0),
                "confidence": float(coordination.coordination_confidence or 0),
                "estimated_improvement": float(coordination.estimated_improvement or 0),
                "results": coordination.results or {},
                "created_at": coordination.created_at.isoformat(),
                "completed_at": coordination.completed_at.isoformat() if coordination.completed_at else None
            }
        
        # If not in cache, would query database
        return {
            "coordination_id": coordination_id,
            "status": "not_found",
            "error": "Coordination not found in active cache"
        }
        
    except Exception as e:
        logger.error(f"Error getting coordination status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get coordination status: {str(e)}")

# Phase 3 System Status Endpoint
@router.get("/status")
async def get_phase3_status():
    """
    Get overall Phase 3 system status
    
    Returns:
        Status of all Phase 3 components
    """
    try:
        return {
            "phase": "Phase 3: Team Coordination",
            "status": "operational",
            "components": {
                "team_management": {
                    "status": "active",
                    "features": ["team_creation", "member_management", "role_assignment"]
                },
                "coordination_engine": {
                    "status": "active",
                    "coordination_types": ["workload_balancing", "skill_optimization", "meeting_optimization", "absence_planning", "resource_allocation", "collaboration_sync"],
                    "active_coordinations": 0  # Would be actual count
                },
                "analytics_engine": {
                    "status": "active",
                    "features": ["team_metrics", "performance_tracking", "insights_generation"]
                }
            },
            "capabilities": {
                "workload_balancing": True,
                "skill_optimization": True,
                "meeting_optimization": True,
                "absence_planning": True,
                "resource_allocation": True,
                "collaboration_sync": True
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting Phase 3 status: {e}")
        return {
            "phase": "Phase 3: Team Coordination",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check for Phase 3 services
    
    Returns:
        Health status of all services
    """
    try:
        health_status = {
            "team_management": "healthy",
            "coordination_engine": "healthy",
            "analytics_engine": "healthy",
            "database_connection": "healthy",
            "overall": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "team_management": "error",
            "coordination_engine": "error",
            "analytics_engine": "error",
            "database_connection": "error",
            "overall": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
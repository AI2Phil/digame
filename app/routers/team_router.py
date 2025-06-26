from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..schemas import team_schemas as schemas
from ..models.user import User
from ..services.team_service import TeamService
from ..database import get_db # Function to get DB session
from ..auth.auth_service import get_current_user as get_current_active_user # Auth dependency

router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
    responses={404: {"description": "Not found"}},
)

# Dependency for TeamService
def get_team_service(db: Session = Depends(get_db)) -> TeamService:
    return TeamService(db)

@router.post("/", response_model=schemas.Team, status_code=status.HTTP_201_CREATED)
def create_new_team(
    team: schemas.TeamCreate,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new team. The creating user will be an admin of the team.
    """
    return team_service.create_team(team_create=team, current_user_id=current_user.id)

@router.get("/", response_model=List[schemas.Team])
def read_teams(
    skip: int = 0,
    limit: int = 100,
    team_service: TeamService = Depends(get_team_service),
    # current_user: User = Depends(get_current_active_user) # All users can list teams for now
):
    """
    Retrieve a list of all teams.
    """
    return team_service.get_all_teams(skip=skip, limit=limit)

@router.get("/{team_id}", response_model=schemas.TeamWithFullDetails) # Or schemas.Team for less detail
def read_team_details(
    team_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user) # Auth check if needed for specific team details
):
    """
    Get detailed information about a specific team, including members, metrics, etc.
    """
    db_team = team_service.get_team(team_id=team_id, include_details=True)
    if not team_service.is_user_team_member(current_user.id, db_team) and not team_service.is_system_admin(current_user.id):
        # Basic privacy: only members or system admins can see full details. Public info might be different.
        # Modify this logic if teams can be public.
        # raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this team's details")
        pass # For now, let's assume if you can get the team, you can see its details. Service layer can refine.

    return db_team


@router.put("/{team_id}", response_model=schemas.Team)
def update_existing_team(
    team_id: int,
    team_update: schemas.TeamUpdate,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a team's name or description. Requires team admin or creator privileges.
    """
    return team_service.update_team_details(team_id=team_id, team_update=team_update, current_user_id=current_user.id)

@router.delete("/{team_id}", status_code=status.HTTP_200_OK)
def delete_existing_team(
    team_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a team. Requires team admin or creator privileges.
    """
    return team_service.remove_team(team_id=team_id, current_user_id=current_user.id)

# Team Members
@router.post("/{team_id}/members", response_model=schemas.TeamMember, status_code=status.HTTP_201_CREATED)
def add_member_to_team(
    team_id: int,
    member_action: schemas.TeamMemberAction, # user_id and optional role
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a user to a team. Requires team admin or leader privileges.
    """
    return team_service.add_team_member(team_id=team_id, member_action=member_action, current_user_id=current_user.id)

@router.get("/{team_id}/members", response_model=List[schemas.TeamMember])
def list_members_of_team(
    team_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user) # Check if user can view members
):
    """
    List all members of a team.
    """
    # Basic check: user should be part of the team or a system admin to list members
    db_team = team_service.get_team(team_id)
    if not team_service.is_user_team_member(current_user.id, db_team) and not team_service.is_system_admin(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view members of this team")
    return team_service.list_team_members(team_id=team_id)

@router.put("/{team_id}/members/{user_id_to_update}", response_model=schemas.TeamMember)
def update_team_member_details( # e.g., role
    team_id: int,
    user_id_to_update: int,
    member_update: schemas.TeamMemberUpdate, # Contains new role or custom_attributes
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a team member's role or attributes. Requires team admin or leader privileges.
    """
    return team_service.update_team_member_role(team_id=team_id, user_id_to_update=user_id_to_update, member_update=member_update, current_user_id=current_user.id)

@router.delete("/{team_id}/members/{user_id_to_remove}", status_code=status.HTTP_200_OK)
def remove_member_from_team_endpoint( # Renamed to avoid conflict with service method
    team_id: int,
    user_id_to_remove: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove a user from a team. Users can remove themselves, or team admin/leader can remove others.
    """
    return team_service.remove_member_from_team(team_id=team_id, user_id_to_remove=user_id_to_remove, current_user_id=current_user.id)

# Team Analytics & Insights Endpoints
@router.get("/{team_id}/analytics", response_model=schemas.TeamAnalyticsDashboard)
def get_team_analytics_dashboard(
    team_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the analytics dashboard for a team, including performance, skill gaps, etc.
    Requires team member privileges.
    """
    return team_service.get_team_performance_analytics(team_id=team_id, current_user_id=current_user.id)

@router.get("/{team_id}/performance", response_model=schemas.TeamAnalyticsDashboard)
def get_team_performance_analytics(
    team_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get performance analytics for a team (alias for analytics endpoint).
    Requires team member privileges.
    """
    return team_service.get_team_performance_analytics(team_id=team_id, current_user_id=current_user.id)

# Endpoints for Performance Metrics, Skill Gaps, Workflows (CRUD for sub-entities)

# TeamPerformanceMetric Endpoints
@router.post("/{team_id}/metrics", response_model=schemas.TeamPerformanceMetric, status_code=status.HTTP_201_CREATED)
def create_team_metric(
    team_id: int,
    metric: schemas.TeamPerformanceMetricCreate = Body(..., example={"team_id": 0, "metric_name": "Tasks Completed", "metric_value": {"count": 150, "period": "weekly"}}), # Ensure team_id in body matches path
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    if metric.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID in path and body must match.")
    return team_service.add_team_performance_metric(team_id, metric, current_user.id)

@router.get("/{team_id}/metrics", response_model=List[schemas.TeamPerformanceMetric])
def list_team_metrics(
    team_id: int,
    skip: int = 0, limit: int = 100,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_metrics_for_team(team_id, current_user.id, skip, limit)

@router.get("/{team_id}/metrics/{metric_id}", response_model=schemas.TeamPerformanceMetric)
def get_specific_team_metric(
    team_id: int,
    metric_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    # Service method will also need to verify metric belongs to team_id for consistency,
    # though auth is primary.
    return team_service.get_team_metric_for_team(team_id=team_id, metric_id=metric_id, current_user_id=current_user.id)


@router.put("/{team_id}/metrics/{metric_id}", response_model=schemas.TeamPerformanceMetric)
def update_specific_team_metric(
    team_id: int,
    metric_id: int,
    metric_update: schemas.TeamPerformanceMetricUpdate,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.update_team_metric_for_team(team_id=team_id, metric_id=metric_id, metric_update=metric_update, current_user_id=current_user.id)

@router.delete("/{team_id}/metrics/{metric_id}", status_code=status.HTTP_200_OK)
def delete_specific_team_metric(
    team_id: int,
    metric_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.delete_team_metric_entry_for_team(team_id=team_id, metric_id=metric_id, current_user_id=current_user.id)


# TeamSkillGap Endpoints
@router.post("/{team_id}/skillgaps", response_model=schemas.TeamSkillGap, status_code=status.HTTP_201_CREATED)
def create_team_skill_gap_entry(
    team_id: int,
    skill_gap: schemas.TeamSkillGapCreate = Body(..., example={"team_id": 0, "skill_name": "Advanced Python", "description": "Lack of advanced Python skills for data analysis tasks."}),
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    if skill_gap.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID in path and body must match.")
    return team_service.add_team_skill_gap(team_id, skill_gap, current_user.id)

@router.get("/{team_id}/skillgaps", response_model=List[schemas.TeamSkillGap])
def list_team_skill_gaps(
    team_id: int,
    skip: int = 0, limit: int = 100,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_skill_gaps_for_team(team_id, current_user.id, skip, limit)

@router.get("/{team_id}/skillgaps/{skill_gap_id}", response_model=schemas.TeamSkillGap)
def get_specific_team_skill_gap(
    team_id: int,
    skill_gap_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_team_skill_gap_for_team(team_id=team_id, skill_gap_id=skill_gap_id, current_user_id=current_user.id)

@router.put("/{team_id}/skillgaps/{skill_gap_id}", response_model=schemas.TeamSkillGap)
def update_specific_team_skill_gap(
    team_id: int,
    skill_gap_id: int,
    skill_gap_update: schemas.TeamSkillGapUpdate,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.update_team_skill_gap_entry_for_team(team_id=team_id, skill_gap_id=skill_gap_id, skill_gap_update=skill_gap_update, current_user_id=current_user.id)

@router.delete("/{team_id}/skillgaps/{skill_gap_id}", status_code=status.HTTP_200_OK)
def delete_specific_team_skill_gap(
    team_id: int,
    skill_gap_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.delete_team_skill_gap_entry_for_team(team_id=team_id, skill_gap_id=skill_gap_id, current_user_id=current_user.id)

# TeamWorkflow Endpoints
@router.post("/{team_id}/workflows", response_model=schemas.TeamWorkflow, status_code=status.HTTP_201_CREATED)
def create_team_workflow_entry(
    team_id: int,
    workflow: schemas.TeamWorkflowCreate = Body(..., example={"team_id": 0, "workflow_name": "New Client Onboarding", "steps": [{"name": "Initial Contact"}, {"name": "Proposal"}]}),
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    if workflow.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID in path and body must match.")
    return team_service.add_team_workflow(team_id, workflow, current_user.id)

@router.get("/{team_id}/workflows", response_model=List[schemas.TeamWorkflow])
def list_team_workflows(
    team_id: int,
    skip: int = 0, limit: int = 100,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_workflows_for_team(team_id, current_user.id, skip, limit)

@router.get("/{team_id}/workflows/{workflow_id}", response_model=schemas.TeamWorkflow)
def get_specific_team_workflow(
    team_id: int,
    workflow_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_team_workflow_for_team(team_id=team_id, workflow_id=workflow_id, current_user_id=current_user.id)

@router.put("/{team_id}/workflows/{workflow_id}", response_model=schemas.TeamWorkflow)
def update_specific_team_workflow(
    team_id: int,
    workflow_id: int,
    workflow_update: schemas.TeamWorkflowUpdate,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.update_team_workflow_entry_for_team(team_id=team_id, workflow_id=workflow_id, workflow_update=workflow_update, current_user_id=current_user.id)

@router.delete("/{team_id}/workflows/{workflow_id}", status_code=status.HTTP_200_OK)
def delete_specific_team_workflow(
    team_id: int,
    workflow_id: int,
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.delete_team_workflow_entry_for_team(team_id=team_id, workflow_id=workflow_id, current_user_id=current_user.id)


# Placeholder for remaining insight-related endpoints if they are not covered by analytics dashboard
# e.g., specific endpoint for workflow optimization suggestions if needed separately.
# e.g., specific endpoint for team development planning.

@router.post("/{team_id}/development-plan", response_model=Dict[str, Any])
def create_or_update_team_development_plan(
    team_id: int,
    plan_data: Dict[str, Any] = Body(..., example={"goal": "Improve Python skills by Q4", "actions": ["Online courses", "Mentorship program"]}),
    team_service: TeamService = Depends(get_team_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create or update a development plan for the team.
    (This is a placeholder, full implementation in service needed)
    """
    return team_service.plan_team_development(team_id=team_id, development_plan_data=plan_data, current_user_id=current_user.id)

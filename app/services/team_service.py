from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status

from app import crud, models, schemas
from app.services import behavior_service # Assuming this service exists for behavioral analysis

class TeamService:
    def __init__(self, db: Session):
        self.db = db

    # Team Management
    def create_team(self, team_create: schemas.TeamCreate, current_user_id: int) -> models.Team:
        user = crud.get_user(self.db, user_id=current_user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creating user not found")

        db_team = crud.create_team(self.db, team=team_create, created_by_user_id=current_user_id)

        creator_is_member = False
        if team_create.initial_members:
            for member_data in team_create.initial_members:
                if member_data.user_id == current_user_id:
                    creator_is_member = True
                    break

        if not creator_is_member:
            creator_member_data = schemas.TeamMemberCreate(user_id=current_user_id, role=schemas.TeamRoleEnumSchema.ADMIN)
            crud.create_team_member(self.db, team_id=db_team.id, member=creator_member_data)
            self.db.refresh(db_team)

        return db_team

    def get_team(self, team_id: int, include_details: bool = False) -> models.Team:
        db_team = crud.get_team(self.db, team_id=team_id)
        if not db_team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
        return db_team

    def get_all_teams(self, skip: int = 0, limit: int = 100) -> List[models.Team]:
        return crud.get_teams(self.db, skip=skip, limit=limit)

    def update_team_details(self, team_id: int, team_update: schemas.TeamUpdate, current_user_id: int) -> models.Team:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_creator(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this team")
        updated_team = crud.update_team(self.db, team_id=team_id, team_update=team_update)
        if not updated_team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found for update")
        return updated_team

    def remove_team(self, team_id: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_creator(current_user_id, db_team, allow_system_admin=True):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this team")
        deleted_team = crud.delete_team(self.db, team_id=team_id)
        if not deleted_team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found for deletion")
        return {"message": "Team deleted successfully"}

    # Team Member Management
    def add_team_member(self, team_id: int, member_action: schemas.TeamMemberAction, current_user_id: int) -> models.TeamMember:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add members to this team")
        user_to_add = crud.get_user(self.db, user_id=member_action.user_id)
        if not user_to_add:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {member_action.user_id} not found")
        member_create_schema = schemas.TeamMemberCreate(
            user_id=member_action.user_id,
            role=member_action.role or schemas.TeamRoleEnumSchema.MEMBER
        )
        db_member = crud.create_team_member(self.db, team_id=team_id, member=member_create_schema)
        return db_member

    def get_team_member_info(self, team_id: int, user_id: int) -> models.TeamMember:
        member = crud.get_team_member(self.db, team_id=team_id, user_id=user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
        return member

    def list_team_members(self, team_id: int) -> List[models.TeamMember]:
        self.get_team(team_id)
        return crud.get_team_members(self.db, team_id=team_id)

    def update_team_member_role(self, team_id: int, user_id_to_update: int, member_update: schemas.TeamMemberUpdate, current_user_id: int) -> models.TeamMember:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update member roles in this team")
        updated_member = crud.update_team_member(self.db, team_id=team_id, user_id=user_id_to_update, member_update=member_update)
        if not updated_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found for update")
        return updated_member

    def remove_member_from_team(self, team_id: int, user_id_to_remove: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if current_user_id != user_id_to_remove and not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove this member")
        deleted_member = crud.delete_team_member(self.db, team_id=team_id, user_id=user_id_to_remove)
        if not deleted_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found for removal")
        return {"message": "Team member removed successfully"}

    # Authorization helpers
    def _get_member_role(self, user_id: int, team: models.Team) -> Optional[schemas.TeamRoleEnumSchema]:
        for member in team.members: # Assumes team.members is loaded
            if member.user_id == user_id:
                return schemas.TeamRoleEnumSchema(member.role.value)
        return None

    def is_user_team_admin(self, user_id: int, team: models.Team) -> bool:
        role = self._get_member_role(user_id, team)
        return role == schemas.TeamRoleEnumSchema.ADMIN

    def is_user_team_leader(self, user_id: int, team: models.Team) -> bool:
        role = self._get_member_role(user_id, team)
        return role == schemas.TeamRoleEnumSchema.LEADER

    def is_user_team_admin_or_leader(self, user_id: int, team: models.Team) -> bool:
        role = self._get_member_role(user_id, team)
        return role in [schemas.TeamRoleEnumSchema.ADMIN, schemas.TeamRoleEnumSchema.LEADER]

    def is_user_team_member(self, user_id: int, team: models.Team) -> bool:
        return self._get_member_role(user_id, team) is not None

    def is_user_team_admin_or_creator(self, user_id: int, team: models.Team, allow_system_admin: bool = False) -> bool:
        if allow_system_admin and self.is_system_admin(user_id):
            return True
        if team.created_by_user_id == user_id:
            return True
        return self.is_user_team_admin(user_id, team)

    def is_system_admin(self, user_id: int) -> bool:
        # Placeholder for actual system admin check
        return False

    # Team Analytics & Insights
    def get_team_performance_analytics(self, team_id: int, current_user_id: int) -> schemas.TeamAnalyticsDashboard:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view analytics for this team")

        metrics = crud.get_team_performance_metrics_for_team(self.db, team_id=team_id)
        skill_gaps = crud.get_team_skill_gaps_for_team(self.db, team_id=team_id)
        workflows = crud.get_team_workflows_for_team(self.db, team_id=team_id)
        collaboration_patterns = self.analyze_collaboration_patterns(team_id)

        # TODO: Implement actual calculation for overall_performance_score and team_development_progress
        overall_score_placeholder = 7.5
        dev_progress_placeholder = {"python_skill_progress": "70%"}

        return schemas.TeamAnalyticsDashboard(
            team_id=team_id,
            overall_performance_score=overall_score_placeholder,
            key_metrics=metrics,
            identified_skill_gaps=skill_gaps,
            workflow_optimizations_summary=workflows,
            collaboration_patterns=collaboration_patterns,
            team_development_progress=dev_progress_placeholder
        )

    def analyze_collaboration_patterns(self, team_id: int) -> List[schemas.TeamCollaborationPattern]:
        # Placeholder implementation
        team_members = crud.get_team_members(self.db, team_id=team_id)
        if not team_members or len(team_members) == 0: # check length
            return []
        return [
            schemas.TeamCollaborationPattern(
                pattern_name="High Centralization Example",
                description="Communication flows primarily through one member (example).",
                metrics={"centrality_score": 0.8, "key_member_id": team_members[0].user_id}
            )
        ]

    def plan_team_development(self, team_id: int, development_plan_data: Dict[str, Any], current_user_id: int) -> Dict[str, Any]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to plan development for this team")
        # Placeholder
        return {"status": "Development plan received (not implemented yet)", "team_id": team_id, "plan_data": development_plan_data}

    # CRUD for TeamPerformanceMetric
    def add_team_performance_metric(self, team_id: int, metric_create: schemas.TeamPerformanceMetricCreate, current_user_id: int) -> models.TeamPerformanceMetric:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add metrics")
        if metric_create.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_performance_metric(self.db, metric=metric_create)

    def get_metrics_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamPerformanceMetric]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_performance_metrics_for_team(self.db, team_id, skip, limit)

    def get_team_metric_for_team(self, team_id: int, metric_id: int, current_user_id: int) -> models.TeamPerformanceMetric:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view metrics for this team")
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric or metric.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found or does not belong to this team")
        return metric

    def update_team_metric_for_team(self, team_id: int, metric_id: int, metric_update: schemas.TeamPerformanceMetricUpdate, current_user_id: int) -> models.TeamPerformanceMetric:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update metrics for this team")
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric or metric.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found or does not belong to this team")
        return crud.update_team_performance_metric(self.db, metric_id=metric_id, metric_update=metric_update)

    def delete_team_metric_entry_for_team(self, team_id: int, metric_id: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete metrics for this team")
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric or metric.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found or does not belong to this team")
        crud.delete_team_performance_metric(self.db, metric_id=metric_id)
        return {"message": "Metric deleted successfully"}

    # CRUD for TeamSkillGap
    def add_team_skill_gap(self, team_id: int, skill_gap_create: schemas.TeamSkillGapCreate, current_user_id: int) -> models.TeamSkillGap:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add skill gaps")
        if skill_gap_create.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_skill_gap(self.db, skill_gap=skill_gap_create)

    def get_skill_gaps_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamSkillGap]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_skill_gaps_for_team(self.db, team_id, skip, limit)

    def get_team_skill_gap_for_team(self, team_id: int, skill_gap_id: int, current_user_id: int) -> models.TeamSkillGap:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        skill_gap = crud.get_team_skill_gap(self.db, skill_gap_id)
        if not skill_gap or skill_gap.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill gap not found or does not belong to this team")
        return skill_gap

    def update_team_skill_gap_entry_for_team(self, team_id: int, skill_gap_id: int, skill_gap_update: schemas.TeamSkillGapUpdate, current_user_id: int) -> models.TeamSkillGap:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        skill_gap = crud.get_team_skill_gap(self.db, skill_gap_id)
        if not skill_gap or skill_gap.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill gap not found or does not belong to this team")
        return crud.update_team_skill_gap(self.db, skill_gap_id=skill_gap_id, skill_gap_update=skill_gap_update)

    def delete_team_skill_gap_entry_for_team(self, team_id: int, skill_gap_id: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        skill_gap = crud.get_team_skill_gap(self.db, skill_gap_id)
        if not skill_gap or skill_gap.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill gap not found or does not belong to this team")
        crud.delete_team_skill_gap(self.db, skill_gap_id=skill_gap_id)
        return {"message": "Skill gap deleted successfully"}

    # CRUD for TeamWorkflow
    def add_team_workflow(self, team_id: int, workflow_create: schemas.TeamWorkflowCreate, current_user_id: int) -> models.TeamWorkflow:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add workflows")
        if workflow_create.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_workflow(self.db, workflow=workflow_create)

    def get_workflows_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamWorkflow]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_workflows_for_team(self.db, team_id, skip, limit)

    def get_team_workflow_for_team(self, team_id: int, workflow_id: int, current_user_id: int) -> models.TeamWorkflow:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        workflow = crud.get_team_workflow(self.db, workflow_id)
        if not workflow or workflow.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found or does not belong to this team")
        return workflow

    def update_team_workflow_entry_for_team(self, team_id: int, workflow_id: int, workflow_update: schemas.TeamWorkflowUpdate, current_user_id: int) -> models.TeamWorkflow:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        workflow = crud.get_team_workflow(self.db, workflow_id)
        if not workflow or workflow.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found or does not belong to this team")
        return crud.update_team_workflow(self.db, workflow_id=workflow_id, workflow_update=workflow_update)

    def delete_team_workflow_entry_for_team(self, team_id: int, workflow_id: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        workflow = crud.get_team_workflow(self.db, workflow_id)
        if not workflow or workflow.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found or does not belong to this team")
        crud.delete_team_workflow(self.db, workflow_id=workflow_id)
        return {"message": "Workflow deleted successfully"}

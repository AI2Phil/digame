from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status

from digame.app import crud, models, schemas
from digame.app.services import behavior_service # Assuming this service exists for behavioral analysis

class TeamService:
    def __init__(self, db: Session):
        self.db = db

    # Team Management
    def create_team(self, team_create: schemas.TeamCreate, current_user_id: int) -> models.Team:
        # Basic check: Does user exist? (Could be handled by auth dependency)
        user = crud.get_user(self.db, user_id=current_user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creating user not found")

        db_team = crud.create_team(self.db, team=team_create, created_by_user_id=current_user_id)

        # Add the creator as an admin member if not already specified in initial_members
        creator_is_member = False
        if team_create.initial_members:
            for member_data in team_create.initial_members:
                if member_data.user_id == current_user_id:
                    creator_is_member = True
                    # Ensure creator is admin if they are in initial_members
                    if member_data.role != schemas.TeamRoleEnumSchema.ADMIN:
                         # This logic might be too complex for create; better to enforce in schema or specific add_member
                         pass # For now, we let the initial_members define the role
                    break

        if not creator_is_member:
            creator_member_data = schemas.TeamMemberCreate(user_id=current_user_id, role=schemas.TeamRoleEnumSchema.ADMIN)
            crud.create_team_member(self.db, team_id=db_team.id, member=creator_member_data)
            self.db.refresh(db_team) # Refresh to include the creator member

        return db_team

    def get_team(self, team_id: int, include_details: bool = False) -> models.Team:
        db_team = crud.get_team(self.db, team_id=team_id)
        if not db_team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
        # If include_details, we can eager load or explicitly load related data
        # For now, relationships are loaded based on schema used by the router
        return db_team

    def get_all_teams(self, skip: int = 0, limit: int = 100) -> List[models.Team]:
        return crud.get_teams(self.db, skip=skip, limit=limit)

    def update_team_details(self, team_id: int, team_update: schemas.TeamUpdate, current_user_id: int) -> models.Team:
        db_team = self.get_team(team_id) # get_team includes existence check
        # Authorization: Check if current_user is admin/leader of the team or system admin
        if not self.is_user_team_admin_or_creator(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this team")

        updated_team = crud.update_team(self.db, team_id=team_id, team_update=team_update)
        if not updated_team: # Should not happen if get_team passed
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found for update")
        return updated_team

    def remove_team(self, team_id: int, current_user_id: int):
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_creator(current_user_id, db_team, allow_system_admin=True): # System admin can delete
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

        # Check if user to be added exists
        user_to_add = crud.get_user(self.db, user_id=member_action.user_id)
        if not user_to_add:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {member_action.user_id} not found")

        member_create_schema = schemas.TeamMemberCreate(
            user_id=member_action.user_id,
            role=member_action.role or schemas.TeamRoleEnumSchema.MEMBER # Default to member if role not specified
        )

        # crud.create_team_member handles if member already exists
        db_member = crud.create_team_member(self.db, team_id=team_id, member=member_create_schema)
        return db_member

    def get_team_member_info(self, team_id: int, user_id: int) -> models.TeamMember:
        member = crud.get_team_member(self.db, team_id=team_id, user_id=user_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
        return member

    def list_team_members(self, team_id: int) -> List[models.TeamMember]:
        self.get_team(team_id) # Existence check for team
        return crud.get_team_members(self.db, team_id=team_id)

    def update_team_member_role(self, team_id: int, user_id_to_update: int, member_update: schemas.TeamMemberUpdate, current_user_id: int) -> models.TeamMember:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update member roles in this team")

        # Prevent self-demotion from last admin (more complex logic, for future)
        # Prevent leader from demoting admin if leader is not admin (also more complex)

        updated_member = crud.update_team_member(self.db, team_id=team_id, user_id=user_id_to_update, member_update=member_update)
        if not updated_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found for update")
        return updated_member

    def remove_member_from_team(self, team_id: int, user_id_to_remove: int, current_user_id: int):
        db_team = self.get_team(team_id)

        # Users can remove themselves OR team admin/leader can remove others
        if current_user_id == user_id_to_remove:
            pass # Allowed
        elif not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove this member")

        # Prevent removing the last admin (more complex logic, for future)

        deleted_member = crud.delete_team_member(self.db, team_id=team_id, user_id=user_id_to_remove)
        if not deleted_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found for removal")
        return {"message": "Team member removed successfully"}

    # Authorization helpers
    def _get_member_role(self, user_id: int, team: models.Team) -> Optional[schemas.TeamRoleEnumSchema]:
        for member in team.members:
            if member.user_id == user_id:
                return schemas.TeamRoleEnumSchema(member.role.value) # Ensure it's the schema enum
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
        # This is a placeholder for system admin check. In a real app, this would check a global role.
        if allow_system_admin and self.is_system_admin(user_id): # is_system_admin needs implementation
            return True
        if team.created_by_user_id == user_id:
            return True
        return self.is_user_team_admin(user_id, team)

    def is_system_admin(self, user_id: int) -> bool:
        # Placeholder: In a real application, this would check if the user has a global system admin role.
        # For example, query user roles:
        # user = crud.get_user(self.db, user_id)
        # if user and any(role.name == 'system_admin' for role in user.roles):
        #    return True
        return False # Default to false for now

    # Team Analytics & Insights (Stubs for now, to be expanded)
    def get_team_performance_analytics(self, team_id: int, current_user_id: int) -> schemas.TeamAnalyticsDashboard:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team): # Any member can view analytics
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view analytics for this team")

        metrics = crud.get_team_performance_metrics_for_team(self.db, team_id=team_id)
        skill_gaps = crud.get_team_skill_gaps_for_team(self.db, team_id=team_id)
        workflows = crud.get_team_workflows_for_team(self.db, team_id=team_id) # Filter for optimized or get all

        # Placeholder for collaborative behavioral analysis
        collaboration_patterns = self.analyze_collaboration_patterns(team_id)

        return schemas.TeamAnalyticsDashboard(
            team_id=team_id,
            key_metrics=metrics,
            identified_skill_gaps=skill_gaps,
            workflow_optimizations_summary=workflows, # This might need further processing
            collaboration_patterns=collaboration_patterns,
            # overall_performance_score and team_development_progress need calculation logic
        )

    def analyze_collaboration_patterns(self, team_id: int) -> List[schemas.TeamCollaborationPattern]:
        # Placeholder: This would involve more complex logic:
        # 1. Fetch relevant data: team member activities, communication logs (if available), task assignments etc.
        # 2. Use behavior_service or similar to process this data.
        # 3. Identify patterns like communication bottlenecks, knowledge silos, workload distribution.
        # For now, returning dummy data.
        team_members = crud.get_team_members(self.db, team_id=team_id)
        if not team_members:
            return []

        # Example: Use behavior_service if it can operate on a list of user IDs
        # user_ids = [member.user_id for member in team_members]
        # team_behavior_summary = behavior_service.get_aggregated_behavior_summary_for_users(self.db, user_ids)

        return [
            schemas.TeamCollaborationPattern(
                pattern_name="High Centralization",
                description="Communication flows primarily through one member.",
                metrics={"centrality_score": 0.8, "key_member_id": team_members[0].user_id if team_members else None}
            )
        ]

    def identify_team_skill_gaps(self, team_id: int, current_user_id: int) -> List[models.TeamSkillGap]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage skill gaps for this team")
        # Actual identification might involve analyzing project requirements vs team skills
        return crud.get_team_skill_gaps_for_team(self.db, team_id=team_id)

    def suggest_workflow_optimizations(self, team_id: int, current_user_id: int) -> List[models.TeamWorkflow]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage workflows for this team")
        # Actual suggestions would involve analyzing existing workflows
        return crud.get_team_workflows_for_team(self.db, team_id=team_id) # Could filter for non-optimized

    def plan_team_development(self, team_id: int, development_plan_data: Dict[str, Any], current_user_id: int) -> Dict[str, Any]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to plan development for this team")
        # This is a placeholder. Actual implementation would store and manage development plans,
        # possibly linking them to skill gaps or team goals.
        return {"status": "Development plan received (not implemented yet)", "team_id": team_id, "plan_data": development_plan_data}

    # CRUD passthroughs for sub-entities, with authorization
    # TeamPerformanceMetric
    def add_team_performance_metric(self, team_id: int, metric_create: schemas.TeamPerformanceMetricCreate, current_user_id: int) -> models.TeamPerformanceMetric:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add metrics")
        if metric_create.team_id != team_id: # Ensure consistency
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_performance_metric(self.db, metric=metric_create)

    def get_team_metric(self, metric_id: int, current_user_id: int) -> models.TeamPerformanceMetric:
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found")
        db_team = self.get_team(metric.team_id) # Check team existence
        if not self.is_user_team_member(current_user_id, db_team): # Any member can view
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this metric")
        return metric

    # ... similar CRUD service methods for TeamSkillGap, TeamWorkflow with authorization ...
    # For brevity, only create methods are shown below, getters/updates/deletes would follow the same pattern

    def add_team_skill_gap(self, team_id: int, skill_gap_create: schemas.TeamSkillGapCreate, current_user_id: int) -> models.TeamSkillGap:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add skill gaps")
        if skill_gap_create.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_skill_gap(self.db, skill_gap=skill_gap_create)

    def add_team_workflow(self, team_id: int, workflow_create: schemas.TeamWorkflowCreate, current_user_id: int) -> models.TeamWorkflow:
        db_team = self.get_team(team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add workflows")
        if workflow_create.team_id != team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID mismatch")
        return crud.create_team_workflow(self.db, workflow=workflow_create)

    # Getters for sub-entities, with auth
    def get_metrics_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamPerformanceMetric]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_performance_metrics_for_team(self.db, team_id, skip, limit)

    def get_skill_gaps_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamSkillGap]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team): # Admins/leaders to manage, members to view
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_skill_gaps_for_team(self.db, team_id, skip, limit)

    def get_workflows_for_team(self, team_id: int, current_user_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamWorkflow]:
        db_team = self.get_team(team_id)
        if not self.is_user_team_member(current_user_id, db_team): # Admins/leaders to manage, members to view
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.get_team_workflows_for_team(self.db, team_id, skip, limit)

    # Update methods for sub-entities
    def update_team_metric(self, metric_id: int, metric_update: schemas.TeamPerformanceMetricUpdate, current_user_id: int) -> models.TeamPerformanceMetric:
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found")
        db_team = self.get_team(metric.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this metric")
        return crud.update_team_performance_metric(self.db, metric_id, metric_update)

    def update_team_skill_gap_entry(self, skill_gap_id: int, skill_gap_update: schemas.TeamSkillGapUpdate, current_user_id: int) -> models.TeamSkillGap:
        skill_gap = crud.get_team_skill_gap(self.db, skill_gap_id)
        if not skill_gap:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill gap not found")
        db_team = self.get_team(skill_gap.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.update_team_skill_gap(self.db, skill_gap_id, skill_gap_update)

    def update_team_workflow_entry(self, workflow_id: int, workflow_update: schemas.TeamWorkflowUpdate, current_user_id: int) -> models.TeamWorkflow:
        workflow = crud.get_team_workflow(self.db, workflow_id)
        if not workflow:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
        db_team = self.get_team(workflow.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return crud.update_team_workflow(self.db, workflow_id, workflow_update)

    # Delete methods for sub-entities
    def delete_team_metric_entry(self, metric_id: int, current_user_id: int):
        metric = crud.get_team_performance_metric(self.db, metric_id)
        if not metric:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found")
        db_team = self.get_team(metric.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this metric")
        crud.delete_team_performance_metric(self.db, metric_id)
        return {"message": "Metric deleted successfully"}

    def delete_team_skill_gap_entry(self, skill_gap_id: int, current_user_id: int):
        skill_gap = crud.get_team_skill_gap(self.db, skill_gap_id)
        if not skill_gap:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill gap not found")
        db_team = self.get_team(skill_gap.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        crud.delete_team_skill_gap(self.db, skill_gap_id)
        return {"message": "Skill gap deleted successfully"}

    def delete_team_workflow_entry(self, workflow_id: int, current_user_id: int):
        workflow = crud.get_team_workflow(self.db, workflow_id)
        if not workflow:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
        db_team = self.get_team(workflow.team_id)
        if not self.is_user_team_admin_or_leader(current_user_id, db_team):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        crud.delete_team_workflow(self.db, workflow_id)
        return {"message": "Workflow deleted successfully"}

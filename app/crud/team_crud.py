from sqlalchemy.orm import Session
from typing import List, Optional, Type, Any
from pydantic import BaseModel
from app import models, schemas # Assuming models and schemas are accessible this way

# CRUD for Team
def create_team(db: Session, team: schemas.TeamCreate, created_by_user_id: Optional[int] = None) -> models.Team:
    db_team = models.Team(
        name=team.name,
        description=team.description,
        created_by_user_id=created_by_user_id if created_by_user_id else team.created_by_user_id
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)

    if team.initial_members:
        for member_data in team.initial_members:
            create_team_member(db, team_id=db_team.id, member=member_data)
    db.refresh(db_team) # Refresh again to get members if any were added
    return db_team

def get_team(db: Session, team_id: int) -> Optional[models.Team]:
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[models.Team]:
    return db.query(models.Team).offset(skip).limit(limit).all()

def update_team(db: Session, team_id: int, team_update: schemas.TeamUpdate) -> Optional[models.Team]:
    db_team = get_team(db, team_id)
    if db_team:
        update_data = team_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_team, key, value)
        db.commit()
        db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: int) -> Optional[models.Team]:
    db_team = get_team(db, team_id)
    if db_team:
        db.delete(db_team)
        db.commit()
    return db_team

# CRUD for TeamMember
def create_team_member(db: Session, team_id: int, member: schemas.TeamMemberCreate) -> models.TeamMember:
    # Check if user is already a member of the team
    existing_member = db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == member.user_id).first()
    if existing_member:
        # Optionally, update the existing member's role or attributes, or raise an error
        # For now, let's just return the existing member to avoid duplicates
        return existing_member

    db_member = models.TeamMember(
        team_id=team_id,
        user_id=member.user_id,
        role=member.role,
        custom_attributes=member.custom_attributes
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def get_team_member(db: Session, team_id: int, user_id: int) -> Optional[models.TeamMember]:
    return db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == user_id).first()

def get_team_members(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamMember]:
    return db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id).offset(skip).limit(limit).all()

def update_team_member(db: Session, team_id: int, user_id: int, member_update: schemas.TeamMemberUpdate) -> Optional[models.TeamMember]:
    db_member = get_team_member(db, team_id, user_id)
    if db_member:
        update_data = member_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_member, key, value)
        db.commit()
        db.refresh(db_member)
    return db_member

def delete_team_member(db: Session, team_id: int, user_id: int) -> Optional[models.TeamMember]:
    db_member = get_team_member(db, team_id, user_id)
    if db_member:
        db.delete(db_member)
        db.commit()
    return db_member

# Generic CRUD creator for PerformanceMetric, SkillGap, Workflow
def _create_team_related_item(db: Session, item_create_schema: BaseModel, model_cls: Type[models.Base]) -> models.Base:
    item_data = item_create_schema.dict()
    db_item = model_cls(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Generic CRUD getter for PerformanceMetric, SkillGap, Workflow by ID
def _get_team_related_item_by_id(db: Session, item_id: int, model_cls: Type[models.Base]) -> Optional[models.Base]:
    return db.query(model_cls).filter(model_cls.id == item_id).first()

# Generic CRUD getter for PerformanceMetric, SkillGap, Workflow by Team ID
def _get_team_related_items_by_team_id(db: Session, team_id: int, model_cls: Type[models.Base], skip: int = 0, limit: int = 100) -> List[models.Base]:
    return db.query(model_cls).filter(model_cls.team_id == team_id).offset(skip).limit(limit).all()

# Generic CRUD updater for PerformanceMetric, SkillGap, Workflow
def _update_team_related_item(db: Session, item_id: int, item_update_schema: BaseModel, model_cls: Type[models.Base]) -> Optional[models.Base]:
    db_item = _get_team_related_item_by_id(db, item_id, model_cls)
    if db_item:
        update_data = item_update_schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# Generic CRUD deleter for PerformanceMetric, SkillGap, Workflow
def _delete_team_related_item(db: Session, item_id: int, model_cls: Type[models.Base]) -> Optional[models.Base]:
    db_item = _get_team_related_item_by_id(db, item_id, model_cls)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item


# CRUD for TeamPerformanceMetric
def create_team_performance_metric(db: Session, metric: schemas.TeamPerformanceMetricCreate) -> models.TeamPerformanceMetric:
    return _create_team_related_item(db, metric, models.TeamPerformanceMetric)

def get_team_performance_metric(db: Session, metric_id: int) -> Optional[models.TeamPerformanceMetric]:
    return _get_team_related_item_by_id(db, metric_id, models.TeamPerformanceMetric)

def get_team_performance_metrics_for_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamPerformanceMetric]:
    return _get_team_related_items_by_team_id(db, team_id, models.TeamPerformanceMetric, skip, limit)

def update_team_performance_metric(db: Session, metric_id: int, metric_update: schemas.TeamPerformanceMetricUpdate) -> Optional[models.TeamPerformanceMetric]:
    return _update_team_related_item(db, metric_id, metric_update, models.TeamPerformanceMetric)

def delete_team_performance_metric(db: Session, metric_id: int) -> Optional[models.TeamPerformanceMetric]:
    return _delete_team_related_item(db, metric_id, models.TeamPerformanceMetric)


# CRUD for TeamSkillGap
def create_team_skill_gap(db: Session, skill_gap: schemas.TeamSkillGapCreate) -> models.TeamSkillGap:
    return _create_team_related_item(db, skill_gap, models.TeamSkillGap)

def get_team_skill_gap(db: Session, skill_gap_id: int) -> Optional[models.TeamSkillGap]:
    return _get_team_related_item_by_id(db, skill_gap_id, models.TeamSkillGap)

def get_team_skill_gaps_for_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamSkillGap]:
    return _get_team_related_items_by_team_id(db, team_id, models.TeamSkillGap, skip, limit)

def update_team_skill_gap(db: Session, skill_gap_id: int, skill_gap_update: schemas.TeamSkillGapUpdate) -> Optional[models.TeamSkillGap]:
    return _update_team_related_item(db, skill_gap_id, skill_gap_update, models.TeamSkillGap)

def delete_team_skill_gap(db: Session, skill_gap_id: int) -> Optional[models.TeamSkillGap]:
    return _delete_team_related_item(db, skill_gap_id, models.TeamSkillGap)


# CRUD for TeamWorkflow
def create_team_workflow(db: Session, workflow: schemas.TeamWorkflowCreate) -> models.TeamWorkflow:
    return _create_team_related_item(db, workflow, models.TeamWorkflow)

def get_team_workflow(db: Session, workflow_id: int) -> Optional[models.TeamWorkflow]:
    return _get_team_related_item_by_id(db, workflow_id, models.TeamWorkflow)

def get_team_workflows_for_team(db: Session, team_id: int, skip: int = 0, limit: int = 100) -> List[models.TeamWorkflow]:
    return _get_team_related_items_by_team_id(db, team_id, models.TeamWorkflow, skip, limit)

def update_team_workflow(db: Session, workflow_id: int, workflow_update: schemas.TeamWorkflowUpdate) -> Optional[models.TeamWorkflow]:
    return _update_team_related_item(db, workflow_id, workflow_update, models.TeamWorkflow)

def delete_team_workflow(db: Session, workflow_id: int) -> Optional[models.TeamWorkflow]:
    return _delete_team_related_item(db, workflow_id, models.TeamWorkflow)

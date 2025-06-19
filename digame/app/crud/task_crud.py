# digame/app/crud/task_crud.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from digame.app.models import Task as TaskModel # Ensure Task is imported from models package
from digame.app.schemas import task_schemas # For TaskCreate schema if used in create_task

def get_tasks_by_user_id(db: Session, user_id: int, exclude_statuses: Optional[List[str]] = None) -> List[TaskModel]:
    query = db.query(TaskModel).filter(TaskModel.user_id == user_id)
    if exclude_statuses:
        query = query.filter(~TaskModel.status.in_(exclude_statuses))
    # Added default sorting: by priority (desc), then due_date (asc), then created_at (desc)
    return query.order_by(
        TaskModel.priority_score.desc().nullslast(),
        TaskModel.due_date_inferred.asc().nullslast(),
        TaskModel.created_at.desc()
    ).all()

def update_task(db: Session, task_id: int, task_in: Dict[str, Any], user_id_for_verification: int) -> Optional[TaskModel]:
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id, TaskModel.user_id == user_id_for_verification).first()
    if db_task:
        for key, value in task_in.items():
            if hasattr(db_task, key): # Check if attribute exists before setting
                setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[TaskModel]: # Added user_id for ownership check
    return db.query(TaskModel).filter(TaskModel.id == task_id, TaskModel.user_id == user_id).first()

def create_task(db: Session, task_in: task_schemas.TaskCreate, user_id: int) -> TaskModel: # Using schema for task_in
    db_task_data = task_in.dict()
    # Ensure process_note_id is handled correctly if it comes from task_in or needs to be set
    # Example: process_note_id = db_task_data.pop("process_note_id", None)
    # if "process_note_id" not in TaskModel.__table__.columns:
    #    db_task_data.pop("process_note_id", None) # remove if not a direct column

    db_task = TaskModel(**db_task_data, user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int) -> bool: # Added user_id for ownership check
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id, TaskModel.user_id == user_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

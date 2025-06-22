from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.task import Task
from ..schemas.task_schemas import TaskCreate, TaskUpdate

def get_task_by_id(db: Session, task_id: int, user_id: Optional[int] = None) -> Optional[Task]:
    """Get a task by ID with optional user ownership check"""
    query = db.query(Task).filter(Task.id == task_id)
    if user_id is not None:
        query = query.filter(Task.user_id == user_id)
    return query.first()

def get_tasks_by_user_id(db: Session, user_id: int, status: Optional[str] = None, exclude_statuses: Optional[List[str]] = None, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks for a user, optionally filtered by status or excluding statuses"""
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    if exclude_statuses:
        query = query.filter(~Task.status.in_(exclude_statuses))
    
    # Added default sorting: by priority (desc), then due_date (asc), then created_at (desc)
    return query.order_by(
        Task.priority_score.desc().nullslast(),
        Task.due_date_inferred.asc().nullslast(),
        Task.created_at.desc()
    ).offset(skip).limit(limit).all()

def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    """Create a new task"""
    task_data = {
        "user_id": user_id,
        "description": task.description,
        "source_type": task.source_type,
        "source_identifier": task.source_identifier,
        "priority_score": task.priority_score,
        "status": task.status or 'suggested',
        "notes": task.notes,
        "due_date_inferred": task.due_date_inferred,
        "process_note_id": task.process_note_id
    }
    db_task = Task(**task_data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: Optional[int] = None) -> Optional[Task]:
    """Update a task with optional user ownership check"""
    db_task = get_task_by_id(db, task_id, user_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task_status(db: Session, task_id: int, new_status: str, user_id: Optional[int] = None) -> Optional[Task]:
    """Update task status with optional user ownership check"""
    db_task = get_task_by_id(db, task_id, user_id)
    if not db_task:
        return None
    
    db_task.status = new_status
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: Optional[int] = None) -> bool:
    """Delete a task with optional user ownership check"""
    db_task = get_task_by_id(db, task_id, user_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True

def get_tasks_by_process_note_id(db: Session, process_note_id: int) -> List[Task]:
    """Get all tasks generated from a specific process note"""
    return db.query(Task).filter(Task.process_note_id == process_note_id).all()

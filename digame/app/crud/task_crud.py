from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models.task import Task
from ..schemas.task_schemas import TaskCreate, TaskUpdate

def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    """Get a task by ID"""
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks_by_user_id(db: Session, user_id: int, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks for a user, optionally filtered by status"""
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    """Create a new task"""
    db_task = Task(
        user_id=user_id,
        description=task.description,
        source_type=task.source_type,
        source_identifier=task.source_identifier,
        priority_score=task.priority_score,
        status=task.status or 'suggested',
        notes=task.notes,
        due_date_inferred=task.due_date_inferred,
        process_note_id=task.process_note_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """Update a task"""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task_status(db: Session, task_id: int, new_status: str) -> Optional[Task]:
    """Update task status"""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return None
    
    db_task.status = new_status
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task"""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True

def get_tasks_by_process_note_id(db: Session, process_note_id: int) -> List[Task]:
    """Get all tasks generated from a specific process note"""
    return db.query(Task).filter(Task.process_note_id == process_note_id).all()
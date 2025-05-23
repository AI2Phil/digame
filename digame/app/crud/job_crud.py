from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import uuid

from ..models.job import Job


def create_job(
    db: Session,
    user_id: int,
    job_type: str,
    status: str = "pending",
    progress: float = 0.0,
    result: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
) -> Job:
    """
    Create a new job record.
    
    Args:
        db: Database session
        user_id: ID of the user who owns the job
        job_type: Type of job (e.g., "model_training", "pattern_recognition")
        status: Initial status of the job ("pending", "running", "completed", "failed")
        progress: Initial progress of the job (0-100)
        result: Optional result data
        error: Optional error message
        
    Returns:
        The created job
    """
    job = Job(
        user_id=user_id,
        job_type=job_type,
        status=status,
        progress=progress,
        result=result,
        error=error
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return job


def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
    """
    Get a job by its ID.
    
    Args:
        db: Database session
        job_id: ID of the job to get
        
    Returns:
        The job if found, None otherwise
    """
    return db.query(Job).filter(Job.id == job_id).first()


def get_jobs_for_user(
    db: Session,
    user_id: int,
    job_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[Job]:
    """
    Get jobs for a user.
    
    Args:
        db: Database session
        user_id: ID of the user
        job_type: Optional filter by job type
        status: Optional filter by status
        limit: Maximum number of jobs to return
        skip: Number of jobs to skip
        
    Returns:
        List of jobs
    """
    query = db.query(Job).filter(Job.user_id == user_id)
    
    if job_type:
        query = query.filter(Job.job_type == job_type)
    
    if status:
        query = query.filter(Job.status == status)
    
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


def update_job_status(
    db: Session,
    job_id: int,
    status: str,
    progress: Optional[float] = None,
    result: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
) -> Optional[Job]:
    """
    Update the status of a job.
    
    Args:
        db: Database session
        job_id: ID of the job to update
        status: New status of the job
        progress: New progress of the job (0-100)
        result: Optional result data
        error: Optional error message
        
    Returns:
        The updated job if found, None otherwise
    """
    job = get_job_by_id(db, job_id)
    if not job:
        return None
    
    job.status = status
    
    if progress is not None:
        job.progress = progress
    
    if result is not None:
        job.result = result
    
    if error is not None:
        job.error = error
    
    db.commit()
    db.refresh(job)
    
    return job


def delete_job(db: Session, job_id: int) -> bool:
    """
    Delete a job.
    
    Args:
        db: Database session
        job_id: ID of the job to delete
        
    Returns:
        True if the job was deleted, False otherwise
    """
    job = get_job_by_id(db, job_id)
    if not job:
        return False
    
    db.delete(job)
    db.commit()
    
    return True
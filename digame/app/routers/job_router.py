from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db import get_db
from ..models.user import User as SQLAlchemyUser
from ..auth.auth_dependencies import get_current_active_user
from ..crud.job_crud import create_job, get_job_by_id, get_jobs_for_user, update_job_status
from ..schemas.job_schemas import Job, JobCreate, JobResponse, JobUpdate

# Import the services that will be run asynchronously
from ..services.behavior_service import train_behavioral_model

router = APIRouter(
    tags=["jobs"],
)


@router.post("/jobs", response_model=JobResponse)
async def create_new_job(
    job_create: JobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Create a new job and start it in the background.
    """
    # Create a job record
    job = create_job(
        db=db,
        user_id=current_user.id,
        job_type=job_create.job_type,
        status="pending",
        progress=0.0
    )
    
    # Start the job in the background based on job_type
    if job_create.job_type == "model_training":
        # Extract parameters from job_create.result if provided
        params = job_create.result or {}
        
        # Start the training in the background
        background_tasks.add_task(
            train_model_async,
            db=db,
            user_id=current_user.id,
            job_id=job.id,
            **params
        )
        
        return {"job": job, "message": "Model training started in background"}
    
    # Add more job types here as needed
    
    else:
        # Update job status to failed for unsupported job type
        update_job_status(
            db=db,
            job_id=job.id,
            status="failed",
            error=f"Unsupported job type: {job_create.job_type}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported job type: {job_create.job_type}"
        )


@router.get("/jobs/{job_id}", response_model=Job)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Get a job by ID.
    """
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if the user is authorized to access this job
    if job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this job"
        )
    
    return job


@router.get("/jobs", response_model=List[Job])
async def get_jobs(
    job_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    """
    Get all jobs for the current user.
    """
    return get_jobs_for_user(
        db=db,
        user_id=current_user.id,
        job_type=job_type,
        status=status
    )


# Asynchronous task functions

async def train_model_async(
    db: Session,
    user_id: int,
    job_id: int,
    **kwargs
):
    """
    Train a behavioral model asynchronously.
    
    This function is called by the background task worker and updates the job
    status as it progresses.
    """
    try:
        # Update job status to running
        update_job_status(db, job_id, "running", progress=10)
        
        # Extract parameters
        n_clusters = kwargs.get("n_clusters", 5)
        algorithm = kwargs.get("algorithm", "kmeans")
        auto_optimize = kwargs.get("auto_optimize", True)
        include_enriched_features = kwargs.get("include_enriched_features", True)
        
        # Update progress
        update_job_status(db, job_id, "running", progress=20)
        
        # Train the model
        result = train_behavioral_model(
            db=db,
            user_id=user_id,
            n_clusters=n_clusters,
            algorithm=algorithm,
            auto_optimize=auto_optimize,
            include_enriched_features=include_enriched_features
        )
        
        # Update progress
        update_job_status(db, job_id, "running", progress=90)
        
        # Update job status to completed
        update_job_status(
            db=db,
            job_id=job_id,
            status="completed",
            progress=100,
            result={
                "model_id": result.id,
                "num_clusters": result.num_clusters,
                "algorithm": result.algorithm,
                "silhouette_score": result.silhouette_score
            }
        )
        
    except Exception as e:
        # Update job status to failed
        update_job_status(
            db=db,
            job_id=job_id,
            status="failed",
            error=str(e)
        )
        # Re-raise the exception for logging
        raise
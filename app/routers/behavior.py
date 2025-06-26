from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Any, Optional, Dict

from sqlalchemy.orm import Session

# Import services and models - avoid circular imports
# Instead of importing the behavior module directly, import specific functions from behavior_service
from ..services.behavior_service import (
    train_and_save_behavior_model,
    get_behavior_patterns_for_user,
    get_latest_behavior_model_for_user
)
from ..models.activity import Activity as SQLAlchemyActivity # For type hinting if needed
from ..models.user import User as SQLAlchemyUser # For current_user type hint
from ..models.behavior_model import BehavioralModel # For type hinting

# Import PermissionChecker and dependencies
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from ..db import get_db # Import get_db directly from the db module

router = APIRouter(
    tags=["Behavior Recognition"],
)

# --- Schemas (redefined here for clarity, could be in a behavior_schemas.py) ---
class BehaviorTrainingRequest(BaseModel):
    user_id: int # Specify for which user to train, admin might do this
    n_clusters: Optional[int] = None # Default is None to use automatic optimization
    include_enriched_features: bool = True # Whether to include enriched features
    algorithm: str = "kmeans" # Options: "kmeans", "dbscan", "hierarchical"
    auto_optimize: bool = True # Whether to automatically optimize the number of clusters

class BehaviorTrainingResponse(BaseModel):
    user_id: int
    status: str
    message: Optional[str] = None
    clusters_found: Optional[int] = None
    silhouette_score: Optional[float] = None
    algorithm: Optional[str] = None  # The algorithm used for clustering
    auto_optimized: Optional[bool] = None  # Whether the number of clusters was automatically optimized
    # Optionally, return a sample of data with clusters, or store it and provide an ID
    # For now, keeping it simple

class ActivityPatternResponse(BaseModel):
    activity_id: int
    timestamp: Any # datetime
    activity_type: str
    cluster_label: int
    # Add other relevant fields from raw_df if needed, like enriched features
    app_category: Optional[str] = None
    project_context: Optional[str] = None
    website_category: Optional[str] = None
    is_context_switch: Optional[bool] = None


# --- Placeholder for storing/retrieving clustering results ---
# In a real app, this would be a database or a cache.
# {user_id: {"raw_df_with_clusters": pd.DataFrame, "silhouette": float, "n_clusters": int}}
TEMP_CLUSTER_RESULTS_STORAGE: Dict[int, Dict[str, Any]] = {}


# --- Endpoints ---

@router.post("/train", 
             response_model=BehaviorTrainingResponse, 
             status_code=status.HTTP_200_OK, # Changed from 202 as it's now synchronous for simplicity
             dependencies=[Depends(PermissionChecker("train_own_behavior_model"))]) # Assuming user trains their own model
async def train_behavior_model_for_user(
    training_request: BehaviorTrainingRequest, 
    db: Session = Depends(get_db),
    current_user: "SQLAlchemyUser" = Depends(get_current_active_user) # Assuming SQLAlchemyUser type
):
    """
    Trains a behavior model for the specified user using their activity logs.
    Requires 'train_own_behavior_model' permission.
    Currently, user can only train their own model (user_id in request must match current_user.id).
    """
    if current_user.id != training_request.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to train behavior model for this user."
        )

    user_id = training_request.user_id
    
    # Train and save the behavior model using the persistent storage service
    db_model, result_status, error_message = train_and_save_behavior_model(
        db=db,
        user_id=user_id,
        n_clusters=training_request.n_clusters,
        include_enriched_features=training_request.include_enriched_features,
        algorithm=training_request.algorithm,
        auto_optimize=training_request.auto_optimize,
        name=f"Behavioral Model for User {user_id}"
    )
    
    if result_status == "failed":
        return BehaviorTrainingResponse(
            user_id=user_id,
            status="failed",
            message=error_message
        )
    
    # Handle the case where db_model might be None
    clusters_found = getattr(db_model, 'num_clusters', None)
    silhouette = getattr(db_model, 'silhouette_score', None)
    algorithm_used = getattr(db_model, 'algorithm', training_request.algorithm)
    
    return BehaviorTrainingResponse(
        user_id=user_id,
        status="success",
        message="Behavior model training completed and saved to database.",
        clusters_found=clusters_found,
        silhouette_score=silhouette,
        algorithm=algorithm_used,
        auto_optimized=training_request.auto_optimize
    )

@router.get("/patterns",
            response_model=List[ActivityPatternResponse],
            dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def get_user_behavior_patterns(
    user_id: int, # Path parameter to specify user, or get from current_user
    db: Session = Depends(get_db), # db might be needed if fetching from DB
    current_user: "SQLAlchemyUser" = Depends(get_current_active_user)
):
    """
    Retrieves recognized behavioral patterns (activities with cluster labels) for the current user.
    Requires 'view_own_behavior_patterns' permission.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,  # Use integer directly to avoid conflict with status variable
            detail="Not authorized to view behavior patterns for this user."
        )
        
    # Get patterns from the database using the behavior service
    patterns_data = get_behavior_patterns_for_user(db, user_id)
    
    if not patterns_data:
        raise HTTPException(
            status_code=404,  # Use integer directly to avoid conflict with status variable
            detail="No behavior patterns found. Please train the model first using POST /behavior/train."
        )

    # Convert data to ActivityPatternResponse objects
    response_patterns = []
    for pattern in patterns_data:
        response_patterns.append(
            ActivityPatternResponse(
                activity_id=pattern["activity_id"],
                timestamp=pattern["timestamp"],
                activity_type=pattern["activity_type"],
                cluster_label=pattern["cluster_label"],
                app_category=pattern.get("app_category"),
                project_context=pattern.get("project_context"),
                website_category=pattern.get("website_category"),
                is_context_switch=pattern.get("is_context_switch")
            )
        )
    return response_patterns

# Note: The original POST /behavior/train and GET /behavior/patterns were placeholders.
# This implementation makes them functional by calling the service and using temporary in-memory storage.
# A proper implementation would involve:
# - Asynchronous training for POST /train.
# - Persistent storage for trained models/cluster results.
# - More robust error handling and input validation.
# - The `user_id` in training_request for POST /train is a bit redundant if user can only train their own.
#   It could be removed and `current_user.id` used directly.
# - The `GET /patterns` currently takes a `user_id` path parameter. This is fine for an admin,
#   but if it's for a user viewing their own, it could be `/patterns/me` or derive user_id from `current_user`.
#   Current implementation restricts to `current_user.id == user_id`.

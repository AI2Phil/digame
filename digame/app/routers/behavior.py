from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Any, Optional, Dict

from sqlalchemy.orm import Session

# Import services and models
from digame.app import behavior as behavior_service # To call preprocess_activity_logs, cluster_activity_logs
from digame.app.models.activity import Activity as SQLAlchemyActivity # For type hinting if needed
# from digame.app.models.user import User as SQLAlchemyUser # For current_user type hint

# Import PermissionChecker and dependencies
from ..auth.auth_dependencies import PermissionChecker, get_current_active_user
from .admin_rbac_router import get_db # Placeholder: using get_db from another router

router = APIRouter(
    prefix="/behavior",
    tags=["Behavior Recognition"],
)

# --- Schemas (redefined here for clarity, could be in a behavior_schemas.py) ---
class BehaviorTrainingRequest(BaseModel):
    user_id: int # Specify for which user to train, admin might do this
    n_clusters: Optional[int] = 5 # Default number of clusters, can be optimized
    include_enriched_features: bool = True # New flag

class BehaviorTrainingResponse(BaseModel):
    user_id: int
    status: str
    message: Optional[str] = None
    clusters_found: Optional[int] = None
    silhouette_score: Optional[float] = None
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
    
    # Step 1: Preprocess data including enriched features based on flag
    raw_df, processed_df = behavior_service.preprocess_activity_logs(
        db, 
        user_id=user_id, 
        include_enriched_features=training_request.include_enriched_features
    )

    if raw_df is None or processed_df is None or processed_df.empty:
        TEMP_CLUSTER_RESULTS_STORAGE.pop(user_id, None) # Clear any old results
        return BehaviorTrainingResponse(
            user_id=user_id,
            status="failed",
            message="Preprocessing failed or no data available for clustering."
        )

    # Step 2: Cluster the data
    n_clusters = training_request.n_clusters
    cluster_labels, silhouette = behavior_service.cluster_activity_logs(
        processed_df, 
        n_clusters=n_clusters
    )

    if cluster_labels is None:
        TEMP_CLUSTER_RESULTS_STORAGE.pop(user_id, None) # Clear any old results
        return BehaviorTrainingResponse(
            user_id=user_id,
            status="failed",
            message="Clustering process failed."
        )

    # Step 3: Store results (temporarily for this example)
    # Add cluster labels back to the raw_df for context
    raw_df['cluster_label'] = cluster_labels
    TEMP_CLUSTER_RESULTS_STORAGE[user_id] = {
        "raw_df_with_clusters": raw_df, # Storing the DataFrame directly is not scalable for production
        "silhouette_score": silhouette,
        "n_clusters": len(set(cluster_labels)) # Actual number of clusters formed
    }
    
    return BehaviorTrainingResponse(
        user_id=user_id,
        status="success",
        message="Behavior model training completed.",
        clusters_found=len(set(cluster_labels)),
        silhouette_score=silhouette
    )

@router.get("/patterns", 
            response_model=List[ActivityPatternResponse],
            dependencies=[Depends(PermissionChecker("view_own_behavior_patterns"))])
async def get_behavior_patterns_for_user(
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
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view behavior patterns for this user."
        )
        
    user_results = TEMP_CLUSTER_RESULTS_STORAGE.get(user_id)
    if not user_results or "raw_df_with_clusters" not in user_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No behavior patterns found. Please train the model first using POST /behavior/train."
        )

    df_with_clusters = user_results["raw_df_with_clusters"]
    
    # Convert DataFrame rows to list of ActivityPatternResponse objects
    response_patterns = []
    for _, row in df_with_clusters.iterrows():
        response_patterns.append(
            ActivityPatternResponse(
                activity_id=row["activity_id"],
                timestamp=row["timestamp"],
                activity_type=row["activity_type"],
                cluster_label=row["cluster_label"],
                app_category=row.get("app_category"), # Use .get() for safety if column might be missing
                project_context=row.get("project_context"),
                website_category=row.get("website_category"),
                is_context_switch=row.get("is_context_switch")
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

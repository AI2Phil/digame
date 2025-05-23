import pickle
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models.behavior_model import BehavioralModel, BehavioralPattern
from ..models.activity import Activity
from ..models.activity_features import ActivityEnrichedFeature
from ..crud.behavior_model_crud import (
    create_behavioral_model,
    get_behavioral_model,
    get_behavioral_models_for_user,
    update_behavioral_model,
    create_behavioral_pattern,
    get_patterns_for_model
)
# Import specific functions from behavior module to avoid circular dependencies
from ..behavior import (
    preprocess_activity_logs,
    cluster_activity_logs
)

# Define extract_cluster_patterns function locally to avoid circular imports
def extract_cluster_patterns(raw_df, cluster_labels):
    """
    Extract patterns from clusters.
    This is a simplified version to avoid circular imports.
    """
    raw_df_with_clusters = raw_df.copy()
    raw_df_with_clusters['cluster_label'] = cluster_labels
    return raw_df_with_clusters

def save_clustering_model(
    db: Session,
    user_id: int,
    algorithm: str,
    parameters: Dict[str, Any],
    cluster_labels: np.ndarray,
    silhouette_score: Optional[float],
    raw_df: pd.DataFrame,
    processed_df: pd.DataFrame,
    model_data=None,
    name: str = "Behavioral Clustering Model"
) -> BehavioralModel:
    """
    Save a clustering model and its results to the database.
    
    Args:
        db: Database session
        user_id: ID of the user this model belongs to
        algorithm: Algorithm used (kmeans, dbscan, hierarchical)
        parameters: Dictionary of algorithm parameters
        cluster_labels: Cluster labels from the clustering algorithm
        silhouette_score: Silhouette score of the clustering
        raw_df: Raw data frame with original features
        processed_df: Processed data frame used for clustering
        model_data: Serialized model data (optional)
        name: Name of the model
        
    Returns:
        The created BehavioralModel instance
    """
    # Serialize model data if provided
    serialized_model = None
    if model_data is not None:
        serialized_model = pickle.dumps(model_data)
    
    # Create the behavioral model
    db_model = create_behavioral_model(
        db=db,
        user_id=user_id,
        name=name,
        algorithm=algorithm,
        parameters=parameters,
        model_data=serialized_model,
        silhouette_score=silhouette_score,
        num_clusters=len(set(cluster_labels))
    )
    
    # Create patterns for each cluster
    for cluster_label in set(cluster_labels):
        # Get activities in this cluster
        cluster_mask = cluster_labels == cluster_label
        cluster_df = raw_df[cluster_mask]
        
        # Calculate centroid for this cluster
        if processed_df is not None and not processed_df.empty:
            cluster_processed_df = processed_df[cluster_mask]
            centroid = cluster_processed_df.mean().to_dict()
        else:
            centroid = None
        
        # Get representative activities (sample of activity IDs)
        representative_activities = cluster_df['activity_id'].sample(
            min(5, len(cluster_df))
        ).tolist() if not cluster_df.empty else []
        
        # Calculate temporal distribution (hour of day, day of week)
        temporal_distribution = None
        if 'hour_of_day' in cluster_df.columns and 'day_of_week' in cluster_df.columns:
            hour_counts = cluster_df['hour_of_day'].value_counts().to_dict()
            day_counts = cluster_df['day_of_week'].value_counts().to_dict()
            temporal_distribution = {
                'hour_of_day': {str(k): v for k, v in hour_counts.items()},
                'day_of_week': {str(k): v for k, v in day_counts.items()}
            }
        
        # Calculate activity type distribution
        activity_distribution = None
        if 'activity_type' in cluster_df.columns:
            activity_counts = cluster_df['activity_type'].value_counts().to_dict()
            activity_distribution = {str(k): v for k, v in activity_counts.items()}
        
        # Calculate context features
        context_features = {}  # Initialize as empty dict instead of None
        context_columns = ['app_category', 'project_context', 'website_category', 'is_context_switch']
        if all(col in cluster_df.columns for col in context_columns):
            # context_features already initialized as empty dict
            for col in context_columns:
                if col == 'is_context_switch':
                    # For boolean column, calculate percentage of True values
                    context_features[col] = cluster_df[col].mean() if not cluster_df.empty else 0
                else:
                    # For categorical columns, get value counts
                    context_features[col] = cluster_df[col].value_counts().to_dict()
        
        # Create the pattern
        create_behavioral_pattern(
            db=db,
            model_id=db_model.id,
            pattern_label=int(cluster_label),
            size=len(cluster_df),
            name=f"Pattern {cluster_label}",
            description=f"Behavioral pattern {cluster_label} with {len(cluster_df)} activities",
            centroid=centroid,
            representative_activities=representative_activities,
            temporal_distribution=temporal_distribution,
            activity_distribution=activity_distribution,
            context_features=context_features
        )
    
    return db_model

def train_and_save_behavior_model(
    db: Session,
    user_id: int,
    n_clusters: Optional[int] = None,
    include_enriched_features: bool = True,
    algorithm: str = "kmeans",
    auto_optimize: bool = True,
    name: str = "Behavioral Clustering Model"
) -> Tuple[Optional[BehavioralModel], str, Optional[str]]:
    """
    Train a behavior model for a user and save it to the database.
    
    Args:
        db: Database session
        user_id: ID of the user to train the model for
        n_clusters: Number of clusters (for KMeans and Hierarchical)
        include_enriched_features: Whether to include enriched features
        algorithm: Clustering algorithm to use ("kmeans", "dbscan", "hierarchical")
        auto_optimize: Whether to automatically optimize the number of clusters
        name: Name of the model
        
    Returns:
        Tuple containing:
        - The created BehavioralModel instance or None if failed
        - Status ("success" or "failed")
        - Error message if failed, None otherwise
    """
    # Step 1: Preprocess data
    raw_df, processed_df = preprocess_activity_logs(
        db,
        user_id=user_id,
        include_enriched_features=include_enriched_features
    )
    
    if raw_df is None or processed_df is None or processed_df.empty:
        return None, "failed", "Preprocessing failed or no data available for clustering."
    
    # Step 2: Cluster the data
    cluster_labels, silhouette = cluster_activity_logs(
        processed_df,
        n_clusters=n_clusters,
        algorithm=algorithm,
        auto_optimize=auto_optimize
    )
    
    if cluster_labels is None:
        return None, "failed", "Clustering process failed."
    
    # Step 3: Save the model and patterns to the database
    parameters = {
        "n_clusters": n_clusters,
        "include_enriched_features": include_enriched_features,
        "auto_optimize": auto_optimize
    }
    
    # Add cluster labels to raw_df for pattern creation
    raw_df['cluster_label'] = cluster_labels
    
    # Save the model and patterns
    db_model = save_clustering_model(
        db=db,
        user_id=user_id,
        algorithm=algorithm,
        parameters=parameters,
        cluster_labels=cluster_labels,
        silhouette_score=silhouette,
        raw_df=raw_df,
        processed_df=processed_df,
        name=name
    )
    
    return db_model, "success", None

def get_latest_behavior_model_for_user(db: Session, user_id: int) -> Optional[BehavioralModel]:
    """
    Get the latest behavior model for a user.
    
    Args:
        db: Database session
        user_id: ID of the user
        
    Returns:
        The latest BehavioralModel instance or None if not found
    """
    models = get_behavioral_models_for_user(db, user_id)
    if not models:
        return None
    
    # Sort by created_at in descending order and return the first one
    return sorted(models, key=lambda m: m.created_at, reverse=True)[0]

def get_behavior_patterns_for_user(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Get behavior patterns for a user.
    
    Args:
        db: Database session
        user_id: ID of the user
        
    Returns:
        List of behavior patterns with activity details
    """
    # Get the latest model for the user
    model = get_latest_behavior_model_for_user(db, user_id)
    if model is None:
        return []
    
    # Get patterns for the model
    patterns = get_patterns_for_model(db, model.id)
    
    # Get activities for each pattern
    result = []
    for pattern in patterns:
        # Get representative activities for this pattern
        if pattern.representative_activities:
            activity_ids = pattern.representative_activities
            
            # Query activities and their enriched features
            activities = (
                db.query(Activity, ActivityEnrichedFeature)
                .outerjoin(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
                .filter(Activity.id.in_(activity_ids))
                .all()
            )
            
            # Convert to dictionaries
            for activity, feature in activities:
                activity_dict = {
                    "activity_id": activity.id,
                    "timestamp": activity.timestamp,
                    "activity_type": activity.activity_type,
                    "cluster_label": pattern.pattern_label,
                    "app_category": feature.app_category if feature else None,
                    "project_context": feature.project_context if feature else None,
                    "website_category": feature.website_category if feature else None,
                    "is_context_switch": feature.is_context_switch if feature else None
                }
                result.append(activity_dict)
    
    return result
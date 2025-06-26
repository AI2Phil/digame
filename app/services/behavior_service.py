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
# Removed circular import - functions implemented locally

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

# Alias for backward compatibility
def train_behavioral_model(*args, **kwargs):
    """Alias for train_and_save_behavior_model for backward compatibility."""
    return train_and_save_behavior_model(*args, **kwargs)

class BehaviorService:
    def __init__(self, db: Session):
        self.db = db
        # Placeholder for AIIntegrationService if needed by other methods in this class in the future
        # from .ai_integration_service import AIIntegrationService
        # self.ai_integration_service = AIIntegrationService(db=self.db)


    async def get_ai_coaching_recommendations(self, user_id: int) -> Dict[str, Any]:
        """
        Generates AI-powered coaching recommendations based on user's behavioral patterns.
        """
        from .ai_integration_service import AIIntegrationService # Local import to avoid circularity if BehaviorService is widely imported
        from ..crud import user_setting_crud # Local import
        import logging # Local import
        logger = logging.getLogger(__name__)

        logger.info(f"Generating AI coaching recommendations for user_id: {user_id}")

        user_settings = user_setting_crud.get_user_setting(self.db, user_id=user_id)
        api_key = None
        if user_settings and user_settings.api_keys:
            try:
                api_keys_dict = json.loads(user_settings.api_keys)
                api_key = api_keys_dict.get("openai_api_key")
            except json.JSONDecodeError:
                logger.error(f"Failed to parse API keys for user {user_id} in BehaviorService.")
                # Not raising HTTPException here, allow fallback or specific handling if desired
                # For now, if key parsing fails, api_key remains None.

        if not api_key:
            logger.warning(f"OpenAI API key ('openai_api_key') not configured for user {user_id}. Cannot get AI coaching.")
            # Depending on requirements, could return empty recommendations or raise an error.
            # For now, let's return a message indicating the issue.
            return {"error": "API key not configured. Unable to generate AI coaching recommendations."}

        ai_integration_service = AIIntegrationService(db=self.db)

        # 1. Fetch behavioral data
        latest_model = get_latest_behavior_model_for_user(self.db, user_id)
        if not latest_model:
            logger.info(f"No behavioral model found for user {user_id}. Cannot generate coaching.")
            return {"info": "No behavioral model found. AI coaching requires behavioral data."}

        patterns = get_patterns_for_model(self.db, latest_model.id)
        if not patterns:
            logger.info(f"No behavioral patterns found for user {user_id} in model {latest_model.id}.")
            return {"info": "No behavioral patterns found. AI coaching requires behavioral patterns."}

        # 2. Summarize behavioral data for the prompt
        # We need to convert SQLAlchemy models (BehavioralPattern) to dicts for JSON serialization
        patterns_summary = []
        for p in patterns:
            pattern_dict = {
                "pattern_label": p.pattern_label,
                "size": p.size,
                "name": p.name,
                "description": p.description,
                "centroid": p.centroid, # Already a dict
                "temporal_distribution": p.temporal_distribution, # Already a dict
                "activity_distribution": p.activity_distribution, # Already a dict
                "context_features": p.context_features # Already a dict
            }
            patterns_summary.append(pattern_dict)

        behavioral_data_summary = {
            "model_name": latest_model.name,
            "model_algorithm": latest_model.algorithm,
            "num_clusters": latest_model.num_clusters,
            "silhouette_score": latest_model.silhouette_score,
            "patterns": patterns_summary
        }
        # Potentially add analytics summary here if available/integrated

        # 3. Define prompts for OpenAI
        system_prompt = """You are an AI professional development coach.
Given a summary of a user's behavioral patterns (derived from their activity logs),
provide 2-3 specific, actionable, and personalized coaching recommendations.
Focus on helping them improve productivity, work habits, focus, or well-being.
Phrase recommendations positively and constructively.
Respond in JSON format with a top-level key "coaching_recommendations",
which is a list of recommendation objects. Each object should have:
'area' (string, e.g., 'Time Management', 'Focus Improvement', 'Work-Life Balance', 'Task Prioritization'),
'recommendation_text' (string, the specific advice),
'reasoning' (string, briefly explaining why this is suggested based on their patterns).
If patterns are too generic or insufficient, provide general productivity tips.
"""
        user_prompt_content = f"User's behavioral data summary: {json.dumps(behavioral_data_summary, default=str)}" # Use default=str for datetime etc.

        # 4. Construct payload for OpenAI
        ai_payload = {
            "model": "gpt-3.5-turbo", # Or "gpt-4" for more nuanced coaching
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_content}
            ],
            "response_format": {"type": "json_object"}
        }

        logger.debug(f"Calling OpenAI for coaching recommendations for user {user_id}.")

        # 5. Call OpenAI via AIIntegrationService
        try:
            openai_response_data = await ai_integration_service.make_request(
                api_key=api_key,
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                method="POST",
                payload=ai_payload,
            )

            if not openai_response_data.get("choices") or \
               not openai_response_data["choices"][0].get("message") or \
               not openai_response_data["choices"][0]["message"].get("content"):
                logger.error(f"Unexpected OpenAI response structure for coaching for user {user_id}: {openai_response_data}")
                # Avoid raising HTTPException directly from service layer if possible, return error dict
                return {"error": "Coaching AI service received an unexpected response format."}

            content_str = openai_response_data["choices"][0]["message"]["content"]
            coaching_result = json.loads(content_str)

            logger.info(f"Successfully received and parsed AI coaching recommendations for user {user_id}: {coaching_result}")
            return coaching_result

        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from OpenAI coaching response for user {user_id}: {content_str if 'content_str' in locals() else 'N/A'}")
            return {"error": "Coaching AI service failed to parse provider's response."}
        except ValueError as ve: # From AIIntegrationService if API key is missing (though checked above)
            logger.error(f"ValueError during AI coaching request for user {user_id}: {ve}")
            return {"error": str(ve)}
        except Exception as e: # Catch other exceptions from make_request or general issues
            logger.error(f"Exception during AI coaching recommendations for user {user_id}: {e}")
            # Check if it's an HTTPException-like structure from make_request before raising a generic one
            if hasattr(e, 'status_code') and hasattr(e, 'detail'):
                 return {"error": f"AI service error: {e.detail}", "status_code": e.status_code} # type: ignore
            return {"error": f"Failed to get coaching recommendations via AI: {str(e)}"}

# Ensure the class structure is maintained if other methods exist or are added above this class.
# If BehaviorService class was not intended, the method could be a standalone async function.
# For now, assuming it's a new method in an existing or new BehaviorService class.
# If the file was purely functional, we'd just add the async def.
# The original file appears to be mostly functional, but let's wrap this in a class for consistency with other services.
# If there were existing functions not part of a class, we'd add this one similarly.
# The provided behavior_service.py does not have a class structure for its main functions.
# Re-evaluating: It's better to add this as a standalone async function in behavior_service.py
# to match the existing style of the file, rather than introducing a class just for this.
# However, the plan refers to "modifying the relevant service".
# Given other services are classes (NotificationService, VoiceNLUService),
# it's more consistent to make BehaviorService a class if it's to be a "service".

# Let's assume the intention is to make BehaviorService a class like others.
# If not, the method get_ai_coaching_recommendations can be defined at the top level.
# The current structure of behavior_service.py is a set of functions.
# To add get_ai_coaching_recommendations as a method, we would need to refactor behavior_service.py
# to have a class structure, or create a new service file for AI-driven behavioral coaching.

# For now, I will add it as a method to a new BehaviorService class,
# assuming this is the desired "service" structure.
# The existing functions like train_and_save_behavior_model would ideally become methods of this class too,
# or remain utility functions called by the service methods.

# The provided snippet for replacement assumes BehaviorService class exists or is being created.
# The original file does not have BehaviorService class.
# Let's define the class and add the new method.
# The existing functions will remain outside the class for now, as refactoring them is out of scope.
# This is a common pattern: utility/core logic functions, and a service class that orchestrates.

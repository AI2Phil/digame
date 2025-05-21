import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sqlalchemy.orm import Session, joinedload
from typing import List, Tuple, Dict, Any, Optional
import numpy as np # For NaN handling if needed

from digame.app.models.activity import Activity
from digame.app.models.activity_features import ActivityEnrichedFeature # Import the new model

# --- Data Preprocessing with Enriched Features ---
def preprocess_activity_logs(
    db: Session, 
    user_id: int, 
    include_enriched_features: bool = True # Flag to control inclusion
) -> Tuple[Optional[pd.DataFrame], Optional[pd.DataFrame]]:
    """
    Fetches activity logs for a user, incorporates enriched features, 
    and preprocesses them for clustering.

    Returns:
        A tuple containing:
        - pd.DataFrame: The raw data frame including original and enriched features (for inspection/mapping back).
        - pd.DataFrame: The processed feature matrix ready for clustering.
        Returns (None, None) if no suitable data.
    """
    
    # Query activities and left join with enriched features
    query = (
        db.query(Activity, ActivityEnrichedFeature)
        .outerjoin(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.timestamp)
    )
    
    results = query.all()

    if not results:
        return None, None

    # Convert to DataFrame
    # Each 'row' in results is a tuple (Activity_obj, ActivityEnrichedFeature_obj_or_None)
    activities_data = []
    for activity, feature in results:
        record = {
            "activity_id": activity.id,
            "activity_type": activity.activity_type,
            "timestamp": activity.timestamp,
            # Enriched features (handle None if no feature record exists)
            "app_category": feature.app_category if feature else None,
            "project_context": feature.project_context if feature else None,
            "website_category": feature.website_category if feature else None,
            "is_context_switch": feature.is_context_switch if feature else False, # Default to False if no feature
        }
        activities_data.append(record)
        
    raw_df = pd.DataFrame(activities_data)

    if raw_df.empty:
        return None, None

    # --- Feature Engineering ---
    # Time-based features (example, can be expanded)
    raw_df["hour_of_day"] = raw_df["timestamp"].dt.hour
    raw_df["day_of_week"] = raw_df["timestamp"].dt.dayofweek # Monday=0, Sunday=6

    # --- Feature Selection and Preprocessing Pipeline ---
    numerical_features = ["hour_of_day", "day_of_week"]
    categorical_features = ["activity_type"]
    
    if include_enriched_features:
        # Handle potential None values for enriched features before encoding
        # Option 1: Impute with a specific string like "Missing"
        raw_df["app_category"] = raw_df["app_category"].fillna("Missing_AppCategory")
        raw_df["project_context"] = raw_df["project_context"].fillna("Missing_ProjectContext") # Or use a boolean "has_project_context"
        raw_df["website_category"] = raw_df["website_category"].fillna("Missing_WebsiteCategory")
        # is_context_switch is boolean, fillna with False (as per default) or treat as a category
        raw_df["is_context_switch"] = raw_df["is_context_switch"].fillna(False).astype(int) # Convert boolean to int (0 or 1)

        # Add enriched features to the lists for preprocessing
        categorical_features.extend(["app_category", "project_context", "website_category"])
        numerical_features.append("is_context_switch") # Already 0 or 1

    # Define transformers
    numerical_transformer = StandardScaler()
    # handle_unknown='ignore' will prevent errors if a category seen in fit is not in transform (or vice-versa during partial fits)
    # It assigns all zeros to that category.
    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False) 

    # Create preprocessor
    # Note: If a category (e.g. project_context) has too many unique values, OneHotEncoding can lead to a very wide DataFrame.
    # Consider other encoding strategies for high-cardinality features (e.g., target encoding, frequency encoding, or feature hashing)
    # For now, using OneHotEncoder as a baseline.
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_transformer, numerical_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    # Apply preprocessing
    try:
        processed_data = preprocessor.fit_transform(raw_df)
        # Get feature names after one-hot encoding
        feature_names = numerical_features # Start with numerical
        # Add one-hot encoded feature names
        if 'cat' in preprocessor.named_transformers_: # Check if categorical transformer was applied
            cat_encoder = preprocessor.named_transformers_['cat']
            # get_feature_names_out is preferred, fallback for older sklearn
            if hasattr(cat_encoder, 'get_feature_names_out'):
                feature_names.extend(cat_encoder.get_feature_names_out(categorical_features))
            elif hasattr(cat_encoder, 'get_feature_names'): # Older scikit-learn
                 feature_names.extend(cat_encoder.get_feature_names(categorical_features))


        processed_df = pd.DataFrame(processed_data, columns=feature_names)
    except ValueError as e:
        # Handle cases where some features might be completely missing or have no variance
        print(f"Error during preprocessing: {e}. This might happen if data is too sparse or categories are all NaN.")
        return raw_df, None # Return raw_df and None for processed_df to indicate failure

    return raw_df, processed_df


# --- Clustering Logic (Placeholder - can be kept as is if it just takes processed_data) ---
def cluster_activity_logs(
    processed_data: pd.DataFrame, 
    n_clusters: int = 5 # Default, can be optimized
) -> Tuple[Optional[np.ndarray], Optional[float]]:
    """
    Performs K-Means clustering on the preprocessed activity data.
    """
    if processed_data is None or processed_data.empty:
        return None, None
    
    if processed_data.shape[0] < n_clusters: # Not enough samples to form n_clusters
        # Handle this case: maybe return error, or reduce n_clusters, or skip clustering
        print(f"Warning: Number of samples ({processed_data.shape[0]}) is less than n_clusters ({n_clusters}). Skipping clustering.")
        return None, None

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    try:
        cluster_labels = kmeans.fit_predict(processed_data)
        
        # Calculate silhouette score only if there's more than 1 unique cluster label and enough samples
        unique_labels = np.unique(cluster_labels)
        if len(unique_labels) > 1 and processed_data.shape[0] > len(unique_labels):
            score = silhouette_score(processed_data, cluster_labels)
        else:
            score = None # Cannot compute silhouette score
            print("Silhouette score cannot be computed (not enough unique clusters or samples).")
            
        return cluster_labels, score
    except Exception as e:
        print(f"Error during clustering: {e}")
        return None, None

# Example of how this might be used in a service or API endpoint:
# def run_behavioral_analysis_for_user(db: Session, user_id: int):
#     raw_df, processed_df = preprocess_activity_logs(db, user_id, include_enriched_features=True)
#     if processed_df is None:
#         return {"error": "Preprocessing failed or no data."}
#
#     # Determine optimal k (e.g., using an optimizer endpoint or a fixed value)
#     optimal_k = 5 # Placeholder
#
#     cluster_labels, silhouette = cluster_activity_logs(processed_df, n_clusters=optimal_k)
#
#     if cluster_labels is not None:
#         # Add cluster labels back to the raw_df for context
#         raw_df['cluster'] = cluster_labels
#         # Now raw_df contains original data, enriched features (if used), and cluster labels
#         # This can be used to interpret clusters or return results.
#         return {"clusters_found": len(np.unique(cluster_labels)), "silhouette_score": silhouette, "data_with_clusters": raw_df.to_dict(orient='records')}
#     else:
#         return {"error": "Clustering failed."}

# Placeholder for optimization logic (if needed)
# def optimize_clusters(processed_data: pd.DataFrame, max_k: int = 10):
#     # ... logic to find best k ...
#     pass

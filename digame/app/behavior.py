import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sqlalchemy.orm import Session, joinedload
from typing import List, Tuple, Dict, Any, Optional
import numpy as np # For NaN handling if needed

# Use relative imports to avoid circular dependencies
from .models.activity import Activity
from .models.activity_features import ActivityEnrichedFeature # Import the new model

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    n_clusters: Optional[int] = None, # Default is None to use automatic optimization
    algorithm: str = "kmeans", # Options: "kmeans", "dbscan", "hierarchical"
    auto_optimize: bool = True # Whether to automatically optimize the number of clusters
) -> Tuple[Optional[np.ndarray], Optional[float]]:
    """
    Performs clustering on the preprocessed activity data using the specified algorithm.
    
    Args:
        processed_data: Preprocessed activity data
        n_clusters: Number of clusters (for KMeans and Hierarchical)
        algorithm: Clustering algorithm to use ("kmeans", "dbscan", "hierarchical")
        auto_optimize: Whether to automatically optimize the number of clusters
        
    Returns:
        Tuple containing cluster labels and silhouette score (if applicable)
    """
    if processed_data is None or processed_data.empty:
        return None, None
    
    # Determine the optimal number of clusters if auto_optimize is True and algorithm supports it
    if auto_optimize and algorithm in ["kmeans", "hierarchical"] and n_clusters is None:
        n_clusters = optimize_clusters(processed_data)
        print(f"Automatically determined optimal number of clusters: {n_clusters}")
    elif n_clusters is None:
        # Default to 5 clusters if not specified and not auto-optimized
        n_clusters = 5
    
    if processed_data.shape[0] < n_clusters and algorithm in ["kmeans", "hierarchical"]:
        # Handle this case: maybe return error, or reduce n_clusters, or skip clustering
        print(f"Warning: Number of samples ({processed_data.shape[0]}) is less than n_clusters ({n_clusters}). Adjusting.")
        n_clusters = max(2, processed_data.shape[0] // 2)
    
    # Choose the appropriate clustering algorithm
    if algorithm == "dbscan":
        return dbscan_cluster_activity_logs(processed_data)
    elif algorithm == "hierarchical":
        return hierarchical_cluster_activity_logs(processed_data, n_clusters)
    else:  # Default to KMeans
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

# Optimization logic for finding the best number of clusters
def optimize_clusters(processed_data: pd.DataFrame, min_k: int = 2, max_k: int = 10) -> int:
    """
    Determines the optimal number of clusters using both the Elbow Method and Silhouette Score.
    
    Args:
        processed_data: Preprocessed activity data
        min_k: Minimum number of clusters to try
        max_k: Maximum number of clusters to try
        
    Returns:
        The optimal number of clusters
    """
    if processed_data is None or processed_data.empty:
        return 5  # Default if no data
    
    # Ensure we don't try more clusters than we have samples
    max_possible_k = min(max_k, processed_data.shape[0] - 1)
    if max_possible_k < min_k:
        return min(5, processed_data.shape[0] // 2)  # Fallback
    
    # Initialize metrics
    inertia_values = []
    silhouette_values = []
    k_values = range(min_k, max_possible_k + 1)
    
    # Calculate metrics for each k
    for k in k_values:
        # KMeans clustering
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        cluster_labels = kmeans.fit_predict(processed_data)
        
        # Inertia (sum of squared distances to closest centroid)
        inertia_values.append(kmeans.inertia_)
        
        # Silhouette score (measure of how similar an object is to its own cluster compared to other clusters)
        if len(np.unique(cluster_labels)) > 1:
            silhouette_avg = silhouette_score(processed_data, cluster_labels)
            silhouette_values.append(silhouette_avg)
        else:
            silhouette_values.append(-1)  # Invalid score for single cluster
    
    # Find optimal k using the Elbow Method
    # Calculate the rate of decrease in inertia
    inertia_diffs = np.diff(inertia_values)
    inertia_diffs = np.append(inertia_diffs, inertia_diffs[-1])  # Pad to match length
    inertia_rate = inertia_diffs / inertia_values
    elbow_k = k_values[np.argmax(inertia_rate)]
    
    # Find optimal k using Silhouette Score
    silhouette_k = k_values[np.argmax(silhouette_values)]
    
    # Combine both methods (prefer silhouette if it's valid)
    if max(silhouette_values) > 0.1:  # Threshold for a reasonable silhouette score
        optimal_k = silhouette_k
    else:
        optimal_k = elbow_k
    
    print(f"Optimal number of clusters determined: {optimal_k} (Elbow: {elbow_k}, Silhouette: {silhouette_k})")
    return optimal_k

# Function to implement DBSCAN clustering as an alternative to KMeans
def dbscan_cluster_activity_logs(
    processed_data: pd.DataFrame,
    eps: float = 0.5,  # Maximum distance between two samples to be considered in the same neighborhood
    min_samples: int = 5  # Minimum number of samples in a neighborhood for a point to be a core point
) -> Tuple[Optional[np.ndarray], Optional[float]]:
    """
    Performs DBSCAN clustering on the preprocessed activity data.
    DBSCAN is density-based and can find clusters of arbitrary shape.
    It can also identify outliers as noise.
    
    Args:
        processed_data: Preprocessed activity data
        eps: Maximum distance between two samples to be considered in the same neighborhood
        min_samples: Minimum number of samples in a neighborhood for a point to be a core point
        
    Returns:
        Tuple containing cluster labels and silhouette score (if applicable)
    """
    if processed_data is None or processed_data.empty:
        return None, None
    
    # Adjust min_samples if we have few data points
    if processed_data.shape[0] < min_samples * 2:
        min_samples = max(2, processed_data.shape[0] // 4)
    
    try:
        # Apply DBSCAN
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        cluster_labels = dbscan.fit_predict(processed_data)
        
        # Calculate silhouette score if we have more than one cluster and no noise points (-1)
        unique_labels = np.unique(cluster_labels)
        if len(unique_labels) > 1 and -1 not in unique_labels:
            score = silhouette_score(processed_data, cluster_labels)
        else:
            # If we have noise points, calculate silhouette only on clustered points
            if -1 in unique_labels and len(unique_labels) > 2:
                mask = cluster_labels != -1
                score = silhouette_score(processed_data[mask], cluster_labels[mask])
            else:
                score = None
                print("Silhouette score cannot be computed for DBSCAN results.")
        
        return cluster_labels, score
    except Exception as e:
        print(f"Error during DBSCAN clustering: {e}")
        return None, None

# Function to implement Hierarchical Clustering as another alternative
def hierarchical_cluster_activity_logs(
    processed_data: pd.DataFrame,
    n_clusters: int = 5,  # Number of clusters
    linkage: str = 'ward'  # Linkage criterion: 'ward', 'complete', 'average', or 'single'
) -> Tuple[Optional[np.ndarray], Optional[float]]:
    """
    Performs Hierarchical Clustering on the preprocessed activity data.
    Hierarchical clustering creates a tree of clusters and can reveal
    the hierarchical structure in the data.
    
    Args:
        processed_data: Preprocessed activity data
        n_clusters: Number of clusters
        linkage: Linkage criterion to use
        
    Returns:
        Tuple containing cluster labels and silhouette score
    """
    if processed_data is None or processed_data.empty:
        return None, None
    
    if processed_data.shape[0] < n_clusters:
        print(f"Warning: Number of samples ({processed_data.shape[0]}) is less than n_clusters ({n_clusters}). Adjusting.")
        n_clusters = max(2, processed_data.shape[0] // 2)
    
    try:
        # Apply Hierarchical Clustering
        hierarchical = AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage)
        cluster_labels = hierarchical.fit_predict(processed_data)
        
        # Calculate silhouette score
        unique_labels = np.unique(cluster_labels)
        if len(unique_labels) > 1 and processed_data.shape[0] > len(unique_labels):
            score = silhouette_score(processed_data, cluster_labels)
        else:
            score = None
            print("Silhouette score cannot be computed for hierarchical clustering results.")
        
        return cluster_labels, score
    except Exception as e:
        print(f"Error during hierarchical clustering: {e}")
        return None, None

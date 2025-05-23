import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, and_ # For count and filtering
from datetime import datetime, timedelta, time
from typing import Dict, Optional, Tuple, List, Any
import numpy as np # For std, mean if needed, though pandas handles it

from ..models.activity import Activity
from ..models.activity_features import ActivityEnrichedFeature
from ..models.anomaly import DetectedAnomaly
from ..models.user import User # For type hinting if needed

# --- Baseline Calculation Logic ---

def calculate_hourly_activity_baselines(db: Session, user_id: int) -> Dict[str, Dict[str, Dict[int, Dict[int, dict]]]]:
    """
    Calculates historical hourly activity baselines (mean, std) for a user,
    separated by category_type (app_category, website_category) and then by specific category value.

    Returns:
        A dictionary structure:
        {
            "app_category": {
                "Development": {
                    0 (Mon): { 9 (9am): {"mean": 5.0, "std": 1.5}, ... }, ...
                }, ...
            },
            "website_category": { ... }
        }
    """
    baselines: Dict[str, Dict[str, Dict[int, Dict[int, dict]]]] = {
        "app_category": {},
        "website_category": {}
    }

    # Query to fetch relevant data: activity timestamp and enriched features
    # We need to join Activity with ActivityEnrichedFeature
    query_results = (
        db.query(
            Activity.timestamp,
            ActivityEnrichedFeature.app_category,
            ActivityEnrichedFeature.website_category
        )
        .join(ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .all()
    )

    if not query_results:
        return baselines

    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(query_results, columns=pd.Index(['timestamp', 'app_category', 'website_category']))
    
    # Extract day of week and hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek # Monday=0, Sunday=6
    df['hour'] = df['timestamp'].dt.hour
    df['date'] = df['timestamp'].dt.date # To count activities per day-hour block

    for category_type in ["app_category", "website_category"]:
        # Group by category_value, day_of_week, hour, and date to count activities
        # then group again to calculate mean/std of these daily counts.
        
        # Handle cases where category might be None (e.g., website_category for app_usage activity)
        # For baseline calculation, we might want to ignore these or treat 'None' as a specific category.
        # Let's fillna with a placeholder like "N/A" for grouping purposes.
        df_cat_type = df[[category_type, 'day_of_week', 'hour', 'date']].copy()
        df_cat_type = df_cat_type.copy()
        # Handle null values in category column
        try:
            df_cat_type[category_type] = df_cat_type[category_type].fillna("N/A_Baseline")  # type: ignore
        except AttributeError:
            # If fillna doesn't exist, handle manually
            pass
        
        # Count activities per category, day, hour, date
        # This gives us the number of activities for a specific category within a specific hour of a specific day
        hourly_counts_per_day = (
            df_cat_type.groupby([category_type, 'day_of_week', 'hour', 'date'])
            .size() # Count rows, which corresponds to activities
            .to_frame(name='activity_count')
            .reset_index()
        )

        # Now, calculate mean and std of these 'activity_count's across different dates
        # for each category, day_of_week, and hour combination.
        baseline_stats = (
            hourly_counts_per_day.groupby([category_type, 'day_of_week', 'hour'])['activity_count']
            .agg(['mean', 'std'])
            .reset_index()
        )
        
        # Populate the baselines dictionary
        if category_type not in baselines:
            baselines[category_type] = {}

        for _, row in baseline_stats.iterrows():
            cat_value = str(row[category_type])
            dow = int(row['day_of_week'])
            hr = int(row['hour'])
            mean_val = row['mean']
            std_val = row['std']

            if cat_value not in baselines[category_type]:
                baselines[category_type][cat_value] = {}
            if dow not in baselines[category_type][cat_value]:
                baselines[category_type][cat_value][dow] = {}
            
            # Store std_val, fill with 0.0 if NaN (e.g., only one data point for that group)
            baselines[category_type][cat_value][dow][hr] = {
                "mean": mean_val,
                "std": std_val if pd.notna(std_val) else 0.0 
            }
            
    return baselines


# --- Anomaly Detection Logic ---

def check_activity_for_anomalies(
    db: Session, 
    user_id: int, 
    current_activity_time: datetime, 
    activity_category_value: str, # e.g., "Development"
    category_type: str, # "app_category" or "website_category"
    baselines: Dict[str, Dict[str, Dict[int, Dict[int, Dict[str, float]]]]],
    std_dev_threshold: float = 2.0,
    recent_window_minutes: int = 60 # Window to count current activities
) -> Optional[DetectedAnomaly]:
    """
    Checks current activity frequency against baselines for anomalies.
    """
    day_of_week = current_activity_time.weekday() # Monday=0, Sunday=6
    hour = current_activity_time.hour

    # Get baseline mean and std for this context
    try:
        baseline_for_context = baselines[category_type][activity_category_value][day_of_week][hour]
        mean_activities = baseline_for_context["mean"]
        std_activities = baseline_for_context["std"]
    except KeyError:
        # No baseline data for this specific category/day/hour, so cannot determine anomaly
        return None

    # Fetch current activity count in the recent window for this category
    window_start_time = current_activity_time - timedelta(minutes=recent_window_minutes)
    
    query = db.query(func.count(Activity.id)).join(
        ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id
    ).filter(Activity.user_id == user_id)
    
    if category_type == "app_category":
        query = query.filter(ActivityEnrichedFeature.app_category == activity_category_value)
    elif category_type == "website_category":
        query = query.filter(ActivityEnrichedFeature.website_category == activity_category_value)
    else:
        return None # Invalid category_type

    current_hour_activity_count = query.filter(
        Activity.timestamp >= window_start_time,
        Activity.timestamp <= current_activity_time # Ensure up to current time
    ).scalar() or 0 # scalar() returns None if no rows, so default to 0

    # Check for anomaly
    # If std_activities is very small (e.g., 0 due to constant past values),
    # any small deviation could be flagged. Add a small epsilon or min_std.
    min_std_dev = 0.5 # Example: if std is less than this, use this value to avoid over-sensitivity
    effective_std = max(std_activities, min_std_dev)
    
    lower_bound = mean_activities - (std_dev_threshold * effective_std)
    upper_bound = mean_activities + (std_dev_threshold * effective_std)

    anomaly_detected = False
    deviation_type = ""
    if current_hour_activity_count > upper_bound:
        anomaly_detected = True
        deviation_type = "higher"
    elif current_hour_activity_count < lower_bound and lower_bound > 0: # Avoid flagging anomaly if baseline is near zero
         # Also consider if mean is very low, e.g. mean=1, std=0.5, lower_bound=0. User did 0. Is it an anomaly?
         # This might need more nuanced handling, e.g. if mean > some_min_mean_threshold
        if mean_activities > effective_std * std_dev_threshold : # only if lower bound is positive
            anomaly_detected = True
            deviation_type = "lower"

    if anomaly_detected:
        anomaly_type_str = f"Unusual{category_type.replace('_', '').title()}Frequency"
        description = (
            f"Activity count for '{activity_category_value}' ({category_type.split('_')[0]}) "
            f"during {current_activity_time.strftime('%A %I-%I%p').replace(' 0', ' ')} was {current_hour_activity_count} (expected ~{mean_activities:.1f} +/- {effective_std:.1f} * {std_dev_threshold}). "
            f"Observed count was {deviation_type} than expected."
        )
        severity = abs(current_hour_activity_count - mean_activities) / effective_std if effective_std > 0 else std_dev_threshold + 1
        
        # Fetch related activity IDs within the window
        # This is similar to the count query but fetches IDs
        related_ids_query = db.query(Activity.id).join(
            ActivityEnrichedFeature, Activity.id == ActivityEnrichedFeature.activity_id
        ).filter(Activity.user_id == user_id)
        if category_type == "app_category":
            related_ids_query = related_ids_query.filter(ActivityEnrichedFeature.app_category == activity_category_value)
        else: # website_category
            related_ids_query = related_ids_query.filter(ActivityEnrichedFeature.website_category == activity_category_value)
        
        related_activity_ids_tuples = related_ids_query.filter(
            Activity.timestamp >= window_start_time,
            Activity.timestamp <= current_activity_time
        ).all()
        related_ids = [id_tuple[0] for id_tuple in related_activity_ids_tuples]


        anomaly = DetectedAnomaly()
        anomaly.user_id = user_id  # type: ignore
        anomaly.timestamp = current_activity_time  # type: ignore
        anomaly.anomaly_type = anomaly_type_str  # type: ignore
        anomaly.severity_score = min(severity / std_dev_threshold, 1.0) if std_dev_threshold > 0 else 0.5  # type: ignore
        anomaly.related_activity_ids = related_ids if related_ids else None  # type: ignore
        anomaly.status = "new"  # type: ignore
        anomaly.description = description  # type: ignore
        return anomaly
        
    return None


# --- Main Service Orchestrator ---

def detect_frequency_anomalies_for_user(
    db: Session, 
    user_id: int, 
    current_time: datetime, # The time "now" for which detection is being run
    std_dev_threshold: float = 2.0,
    recent_window_minutes: int = 60
) -> List[DetectedAnomaly]:
    """
    Orchestrates anomaly detection for a user based on current activity patterns.
    """
    # 1. Calculate (or fetch cached) baselines
    # For this implementation, we recalculate each time. Caching would be a performance optimization.
    baselines = calculate_hourly_activity_baselines(db, user_id)
    if not baselines or (not baselines["app_category"] and not baselines["website_category"]):
        # No baselines available for the user.
        return []

    detected_anomalies_list: List[DetectedAnomaly] = []

    # 2. Get a summary of categories active in the last hour for the user
    # This avoids checking every single category if it wasn't even used recently.
    window_start = current_time - timedelta(minutes=recent_window_minutes)
    
    recent_categories_query = (
        db.query(
            ActivityEnrichedFeature.app_category,
            ActivityEnrichedFeature.website_category
        )
        .join(Activity, Activity.id == ActivityEnrichedFeature.activity_id)
        .filter(Activity.user_id == user_id)
        .filter(Activity.timestamp >= window_start)
        .filter(Activity.timestamp <= current_time)
        .distinct() # Get unique categories active in the window
        .all()
    )
    
    active_categories_to_check: Dict[str, set] = {"app_category": set(), "website_category": set()}
    for app_cat, web_cat in recent_categories_query:
        if app_cat and app_cat != "N/A_Baseline": # Avoid checking our baseline placeholder
            active_categories_to_check["app_category"].add(app_cat)
        if web_cat and web_cat != "N/A_Baseline":
            active_categories_to_check["website_category"].add(web_cat)

    # 3. For each active category, check for anomalies
    for category_type, category_values in active_categories_to_check.items():
        for cat_value in category_values:
            anomaly = check_activity_for_anomalies(
                db, user_id, current_time, cat_value, category_type, baselines, 
                std_dev_threshold, recent_window_minutes
            )
            if anomaly:
                detected_anomalies_list.append(anomaly)

    # 4. Save all detected anomalies for this run
    if detected_anomalies_list:
        try:
            db.add_all(detected_anomalies_list)
            db.commit()
            # Refresh instances if IDs are needed immediately (usually handled by SQLAlchemy)
            for anom in detected_anomalies_list:
                db.refresh(anom) 
        except Exception as e:
            db.rollback()
            # Log error e
            print(f"Error saving detected anomalies: {e}") # Replace with proper logging
            # Depending on desired behavior, could re-raise or return empty list/error status
            raise
            
    return detected_anomalies_list

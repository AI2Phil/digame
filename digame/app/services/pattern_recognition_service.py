import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use relative imports to avoid circular dependencies
from ..models.behavior_model import BehavioralModel, BehavioralPattern
from ..models.activity import Activity
from ..models.activity_features import ActivityEnrichedFeature
from ..crud.behavior_model_crud import get_behavioral_model, get_patterns_for_model

# Create a simple anomaly creation function if the import fails
def create_anomaly(db: Session, **kwargs):
    """
    Fallback function for creating anomalies if the import fails.
    This logs the anomaly instead of storing it in the database.
    """
    logger.info(f"Anomaly detected: {json.dumps(kwargs, default=str)}")
    return None

def get_anomalies_for_user(db: Session, user_id: int):
    """
    Fallback function for getting anomalies if the import fails.
    This returns an empty list.
    """
    logger.info(f"Getting anomalies for user {user_id}")
    return []

# Try to import the actual functions, use fallbacks if they fail
# Try to import the actual functions, use fallbacks if they fail
# Import directly to avoid circular dependencies
from ..crud.anomaly_crud import create_anomaly, get_anomalies_for_user

class PatternCategory:
    """Enum-like class for pattern categories"""
    PRODUCTIVITY = "productivity"
    COMMUNICATION = "communication"
    RESEARCH = "research"
    DEVELOPMENT = "development"
    MEETINGS = "meetings"
    BREAKS = "breaks"
    CONTEXT_SWITCHING = "context_switching"
    OTHER = "other"

def categorize_pattern(pattern: BehavioralPattern) -> str:
    """
    Categorize a behavioral pattern based on its characteristics.
    
    Args:
        pattern: The behavioral pattern to categorize
        
    Returns:
        The category of the pattern
    """
    # Extract pattern characteristics
    activity_distribution = pattern.activity_distribution or {}
    context_features = pattern.context_features or {}
    
    # Define category thresholds
    category_scores = {
        PatternCategory.PRODUCTIVITY: 0,
        PatternCategory.COMMUNICATION: 0,
        PatternCategory.RESEARCH: 0,
        PatternCategory.DEVELOPMENT: 0,
        PatternCategory.MEETINGS: 0,
        PatternCategory.BREAKS: 0,
        PatternCategory.CONTEXT_SWITCHING: 0,
        PatternCategory.OTHER: 0
    }
    
    # Score based on activity types
    for activity_type, count in activity_distribution.items():
        activity_type = activity_type.lower()
        if "email" in activity_type or "chat" in activity_type or "message" in activity_type:
            category_scores[PatternCategory.COMMUNICATION] += count
        elif "code" in activity_type or "ide" in activity_type or "git" in activity_type:
            category_scores[PatternCategory.DEVELOPMENT] += count
        elif "browser" in activity_type or "search" in activity_type:
            category_scores[PatternCategory.RESEARCH] += count
        elif "meeting" in activity_type or "call" in activity_type or "conference" in activity_type:
            category_scores[PatternCategory.MEETINGS] += count
        elif "document" in activity_type or "spreadsheet" in activity_type or "presentation" in activity_type:
            category_scores[PatternCategory.PRODUCTIVITY] += count
        elif "break" in activity_type or "idle" in activity_type:
            category_scores[PatternCategory.BREAKS] += count
        else:
            category_scores[PatternCategory.OTHER] += count
    
    # Score based on context features
    if context_features.get("is_context_switch", 0) > 0.3:  # If more than 30% of activities involve context switching
        category_scores[PatternCategory.CONTEXT_SWITCHING] += 10
    
    # Return the category with the highest score
    return max(category_scores.items(), key=lambda x: x[1])[0]

def generate_pattern_label(pattern: BehavioralPattern) -> str:
    """
    Generate a human-readable label for a behavioral pattern.
    
    Args:
        pattern: The behavioral pattern to label
        
    Returns:
        A human-readable label for the pattern
    """
    # Get the pattern category
    category = categorize_pattern(pattern)
    
    # Extract pattern characteristics
    temporal_distribution = pattern.temporal_distribution or {}
    hour_distribution = temporal_distribution.get("hour_of_day", {})
    day_distribution = temporal_distribution.get("day_of_week", {})
    
    # Determine time of day
    morning_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(5, 12))
    afternoon_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(12, 17))
    evening_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(17, 24))
    night_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(0, 5))
    
    time_of_day = "Morning" if morning_hours > max(afternoon_hours, evening_hours, night_hours) else \
                  "Afternoon" if afternoon_hours > max(morning_hours, evening_hours, night_hours) else \
                  "Evening" if evening_hours > max(morning_hours, afternoon_hours, night_hours) else \
                  "Night"
    
    # Determine day type (weekday vs weekend)
    weekday_count = sum(int(day_distribution.get(str(d), 0)) for d in range(0, 5))  # Monday to Friday
    weekend_count = sum(int(day_distribution.get(str(d), 0)) for d in range(5, 7))  # Saturday and Sunday
    
    day_type = "Weekday" if weekday_count > weekend_count else "Weekend"
    
    # Generate label based on category and time characteristics
    if category == PatternCategory.PRODUCTIVITY:
        return f"{time_of_day} {day_type} Productivity"
    elif category == PatternCategory.COMMUNICATION:
        return f"{time_of_day} {day_type} Communication"
    elif category == PatternCategory.RESEARCH:
        return f"{time_of_day} {day_type} Research"
    elif category == PatternCategory.DEVELOPMENT:
        return f"{time_of_day} {day_type} Development"
    elif category == PatternCategory.MEETINGS:
        return f"{time_of_day} {day_type} Meetings"
    elif category == PatternCategory.BREAKS:
        return f"{time_of_day} {day_type} Breaks"
    elif category == PatternCategory.CONTEXT_SWITCHING:
        return f"{time_of_day} {day_type} Context Switching"
    else:
        return f"{time_of_day} {day_type} Activities"

def detect_anomalies(
    db: Session,
    user_id: int,
    model_id: Optional[int] = None,
    threshold: float = 2.0,
    time_window: Optional[int] = None  # Time window in days
) -> List[Dict[str, Any]]:
    """
    Detect anomalies in user behavior based on deviation from established patterns.
    
    Args:
        db: Database session
        user_id: ID of the user to detect anomalies for
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        threshold: Standard deviation threshold for anomaly detection
        time_window: Time window in days to look for anomalies (optional)
        
    Returns:
        List of detected anomalies
    """
    # Get the behavioral model
    model = None
    if model_id:
        model = get_behavioral_model(db, model_id)
    else:
        # Get the latest model for the user
        models = db.query(BehavioralModel).filter(BehavioralModel.user_id == user_id).order_by(
            BehavioralModel.created_at.desc()
        ).all()
        if models:
            model = models[0]
    
    if not model:
        return []
    
    # Get patterns for the model
    patterns = get_patterns_for_model(db, model.id)
    if not patterns:
        return []
    
    # Get recent activities
    query = db.query(Activity).filter(Activity.user_id == user_id)
    
    if time_window:
        start_date = datetime.now() - timedelta(days=time_window)
        query = query.filter(Activity.timestamp >= start_date)
    
    recent_activities = query.order_by(Activity.timestamp.desc()).all()
    
    if not recent_activities:
        return []
    
    # Convert activities to DataFrame for analysis
    activities_data = []
    for activity in recent_activities:
        # Get enriched features if available
        enriched_feature = db.query(ActivityEnrichedFeature).filter(
            ActivityEnrichedFeature.activity_id == activity.id
        ).first()
        
        activity_data = {
            "activity_id": activity.id,
            "timestamp": activity.timestamp,
            "activity_type": activity.activity_type,
            "app_category": enriched_feature.app_category if enriched_feature else None,
            "project_context": enriched_feature.project_context if enriched_feature else None,
            "website_category": enriched_feature.website_category if enriched_feature else None,
            "is_context_switch": enriched_feature.is_context_switch if enriched_feature else None
        }
        activities_data.append(activity_data)
    
    activities_df = pd.DataFrame(activities_data)
    
    # Detect anomalies
    anomalies = []
    
    # 1. Detect time-based anomalies (activities at unusual times)
    activities_df['hour'] = activities_df['timestamp'].dt.hour
    
    # Group by hour and count activities
    hourly_counts = activities_df.groupby('hour').size()
    
    # Calculate mean and standard deviation
    mean_count = hourly_counts.mean()
    std_count = hourly_counts.std()
    
    # Identify anomalous hours
    anomalous_hours = hourly_counts[abs(hourly_counts - mean_count) > threshold * std_count].index.tolist()
    
    for hour in anomalous_hours:
        # Get activities in anomalous hours
        anomalous_activities = activities_df[activities_df['hour'] == hour]
        
        for _, activity in anomalous_activities.iterrows():
            anomaly = {
                "user_id": user_id,
                "activity_id": activity['activity_id'],
                "anomaly_type": "time_anomaly",
                "description": f"Activity at unusual hour ({hour}:00)",
                "severity": "medium",
                "detected_at": datetime.now(),
                "metadata": {
                    "hour": int(hour),
                    "mean_count": float(mean_count),
                    "std_count": float(std_count),
                    "actual_count": int(hourly_counts[hour])
                }
            }
            
            # Create anomaly in database
            create_anomaly(db, **anomaly)
            anomalies.append(anomaly)
    
    # 2. Detect activity type anomalies (unusual activity types)
    activity_type_counts = activities_df['activity_type'].value_counts()
    mean_type_count = activity_type_counts.mean()
    std_type_count = activity_type_counts.std()
    
    # Identify anomalous activity types
    anomalous_types = activity_type_counts[abs(activity_type_counts - mean_type_count) > threshold * std_type_count].index.tolist()
    
    for activity_type in anomalous_types:
        # Get activities with anomalous types
        anomalous_activities = activities_df[activities_df['activity_type'] == activity_type]
        
        for _, activity in anomalous_activities.iterrows():
            anomaly = {
                "user_id": user_id,
                "activity_id": activity['activity_id'],
                "anomaly_type": "activity_type_anomaly",
                "description": f"Unusual frequency of activity type: {activity_type}",
                "severity": "medium",
                "detected_at": datetime.now(),
                "metadata": {
                    "activity_type": activity_type,
                    "mean_count": float(mean_type_count),
                    "std_count": float(std_type_count),
                    "actual_count": int(activity_type_counts[activity_type])
                }
            }
            
            # Create anomaly in database
            create_anomaly(db, **anomaly)
            anomalies.append(anomaly)
    
    # 3. Detect context switching anomalies
    if 'is_context_switch' in activities_df.columns:
        context_switch_rate = activities_df['is_context_switch'].mean()
        
        # Get patterns with context switch information
        pattern_switch_rates = []
        for pattern in patterns:
            if pattern.context_features and 'is_context_switch' in pattern.context_features:
                pattern_switch_rates.append(pattern.context_features['is_context_switch'])
        
        if pattern_switch_rates:
            mean_switch_rate = np.mean(pattern_switch_rates)
            std_switch_rate = np.std(pattern_switch_rates)
            
            if abs(context_switch_rate - mean_switch_rate) > threshold * std_switch_rate:
                # This is an anomalous context switching rate
                for _, activity in activities_df[activities_df['is_context_switch'] == True].iterrows():
                    anomaly = {
                        "user_id": user_id,
                        "activity_id": activity['activity_id'],
                        "anomaly_type": "context_switch_anomaly",
                        "description": f"Unusual context switching rate",
                        "severity": "high",
                        "detected_at": datetime.now(),
                        "metadata": {
                            "current_rate": float(context_switch_rate),
                            "mean_rate": float(mean_switch_rate),
                            "std_rate": float(std_switch_rate)
                        }
                    }
                    
                    # Create anomaly in database
                    create_anomaly(db, **anomaly)
                    anomalies.append(anomaly)
    
    return anomalies

def analyze_temporal_patterns(
    db: Session,
    user_id: int,
    model_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Analyze temporal patterns in user behavior.
    
    Args:
        db: Database session
        user_id: ID of the user to analyze
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        
    Returns:
        Dictionary with temporal pattern analysis
    """
    # Get the behavioral model
    model = None
    if model_id:
        model = get_behavioral_model(db, model_id)
    else:
        # Get the latest model for the user
        models = db.query(BehavioralModel).filter(BehavioralModel.user_id == user_id).order_by(
            BehavioralModel.created_at.desc()
        ).all()
        if models:
            model = models[0]
    
    if not model:
        return {"error": "No behavioral model found for user"}
    
    # Get patterns for the model
    patterns = get_patterns_for_model(db, model.id)
    if not patterns:
        return {"error": "No patterns found for model"}
    
    # Initialize result structure with proper typing
    result = {
        "daily_patterns": {},
        "weekly_patterns": {},
        "hourly_patterns": {},
        "pattern_transitions": [],
        "productivity_insights": {}
    }
    
    # Analyze daily patterns
    for pattern in patterns:
        if not pattern.temporal_distribution or "hour_of_day" not in pattern.temporal_distribution:
            continue
        
        hour_distribution = pattern.temporal_distribution["hour_of_day"]
        
        # Categorize into time blocks
        morning_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(5, 12))
        afternoon_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(12, 17))
        evening_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(17, 24))
        night_hours = sum(int(hour_distribution.get(str(h), 0)) for h in range(0, 5))
        
        total_hours = morning_hours + afternoon_hours + evening_hours + night_hours
        if total_hours == 0:
            continue
        
        # Calculate percentages
        pattern_label = generate_pattern_label(pattern)
        pattern_category = categorize_pattern(pattern)
        
        # Ensure daily_patterns is initialized as a dictionary
        if not isinstance(result["daily_patterns"], dict):
            result["daily_patterns"] = {}
        
        # Use pattern_label as a string key
        result["daily_patterns"][str(pattern_label)] = {
            "pattern_id": pattern.id,
            "pattern_label": pattern_label,
            "pattern_category": pattern_category,
            "morning_percentage": round(morning_hours / total_hours * 100, 2),
            "afternoon_percentage": round(afternoon_hours / total_hours * 100, 2),
            "evening_percentage": round(evening_hours / total_hours * 100, 2),
            "night_percentage": round(night_hours / total_hours * 100, 2),
            "peak_hour": max(hour_distribution.items(), key=lambda x: int(x[1]))[0]
        }
    
    # Analyze weekly patterns
    for pattern in patterns:
        if not pattern.temporal_distribution or "day_of_week" not in pattern.temporal_distribution:
            continue
        
        day_distribution = pattern.temporal_distribution["day_of_week"]
        
        # Calculate day percentages
        total_days = sum(int(day_distribution.get(str(d), 0)) for d in range(7))
        if total_days == 0:
            continue
        
        pattern_label = generate_pattern_label(pattern)
        pattern_category = categorize_pattern(pattern)
        
        day_percentages = {}
        for d in range(7):
            day_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][d]
            day_count = int(day_distribution.get(str(d), 0))
            day_percentages[day_name] = round(day_count / total_days * 100, 2)
        
        # Ensure weekly_patterns is initialized as a dictionary
        if not isinstance(result["weekly_patterns"], dict):
            result["weekly_patterns"] = {}
            
        # Use pattern_label as a string key
        result["weekly_patterns"][str(pattern_label)] = {
            "pattern_id": pattern.id,
            "pattern_label": pattern_label,
            "pattern_category": pattern_category,
            "day_percentages": day_percentages,
            "peak_day": max(day_percentages.items(), key=lambda x: x[1])[0],
            "weekday_percentage": float(sum(day_percentages[d] for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])),
            "weekend_percentage": float(sum(day_percentages[d] for d in ["Saturday", "Sunday"]))
        }
    
    # Analyze hourly patterns
    hourly_pattern_map = {}
    for pattern in patterns:
        if not pattern.temporal_distribution or "hour_of_day" not in pattern.temporal_distribution:
            continue
        
        hour_distribution = pattern.temporal_distribution["hour_of_day"]
        pattern_label = generate_pattern_label(pattern)
        pattern_category = categorize_pattern(pattern)
        
        for hour, count in hour_distribution.items():
            if int(count) > 0:
                if hour not in hourly_pattern_map:
                    hourly_pattern_map[hour] = []
                
                hourly_pattern_map[hour].append({
                    "pattern_id": pattern.id,
                    "pattern_label": pattern_label,
                    "pattern_category": pattern_category,
                    "count": int(count)
                })
    
    # Sort patterns by count for each hour
    for hour, patterns_list in hourly_pattern_map.items():
        sorted_patterns = sorted(patterns_list, key=lambda x: x["count"], reverse=True)
        # Ensure hourly_patterns is initialized as a dictionary
        if not isinstance(result["hourly_patterns"], dict):
            result["hourly_patterns"] = {}
            
        # Initialize hourly_patterns as a dictionary if it's not already
        if not isinstance(result["hourly_patterns"], dict):
            result["hourly_patterns"] = {}
            
        # Convert hour to string to ensure it's a valid dictionary key
        hour_key = str(hour)
        # Create a new dictionary with patterns
        if not isinstance(result["hourly_patterns"], dict):
            result["hourly_patterns"] = {}
        result["hourly_patterns"][hour_key] = {"patterns": sorted_patterns}
    
    # Generate productivity insights
    productivity_patterns = [p for p in patterns if categorize_pattern(p) == PatternCategory.PRODUCTIVITY]
    development_patterns = [p for p in patterns if categorize_pattern(p) == PatternCategory.DEVELOPMENT]
    meeting_patterns = [p for p in patterns if categorize_pattern(p) == PatternCategory.MEETINGS]
    context_switch_patterns = [p for p in patterns if categorize_pattern(p) == PatternCategory.CONTEXT_SWITCHING]
    
    # Calculate peak productivity hours
    productivity_hours = {}
    for pattern in productivity_patterns + development_patterns:
        if not pattern.temporal_distribution or "hour_of_day" not in pattern.temporal_distribution:
            continue
        
        hour_distribution = pattern.temporal_distribution["hour_of_day"]
        for hour, count in hour_distribution.items():
            if hour not in productivity_hours:
                productivity_hours[hour] = 0
            productivity_hours[hour] += int(count)
    
    if productivity_hours:
        peak_productivity_hour = max(productivity_hours.items(), key=lambda x: x[1])[0]
        # Ensure productivity_insights is initialized as a dictionary
        if not isinstance(result["productivity_insights"], dict):
            result["productivity_insights"] = {}
            
        # Initialize productivity_insights as a dictionary if it's not already
        if not isinstance(result["productivity_insights"], dict):
            result["productivity_insights"] = {}
            
        # Ensure productivity_insights is a dictionary
        if not isinstance(result["productivity_insights"], dict):
            result["productivity_insights"] = {}
            
        # Update the dictionary with the peak productivity hour
        result["productivity_insights"]["peak_productivity_hour"] = str(peak_productivity_hour)
    
    # Calculate meeting impact
    if meeting_patterns:
        meeting_hours = {}
        for pattern in meeting_patterns:
            if not pattern.temporal_distribution or "hour_of_day" not in pattern.temporal_distribution:
                continue
            
            hour_distribution = pattern.temporal_distribution["hour_of_day"]
            for hour, count in hour_distribution.items():
                if hour not in meeting_hours:
                    meeting_hours[hour] = 0
                meeting_hours[hour] += int(count)
        
        if meeting_hours:
            peak_meeting_hour = max(meeting_hours.items(), key=lambda x: x[1])[0]
            # Ensure productivity_insights is initialized as a dictionary
            if not isinstance(result["productivity_insights"], dict):
                result["productivity_insights"] = {}
                
            # Ensure productivity_insights is a dictionary
            if not isinstance(result["productivity_insights"], dict):
                result["productivity_insights"] = {}
                
            # Update with peak meeting hour
            result["productivity_insights"]["peak_meeting_hour"] = str(peak_meeting_hour)
            
            # Check if meetings overlap with peak productivity
            if isinstance(result["productivity_insights"], dict) and "peak_productivity_hour" in result["productivity_insights"]:
                if str(peak_meeting_hour) == result["productivity_insights"]["peak_productivity_hour"]:
                    result["productivity_insights"]["meeting_productivity_conflict"] = True
    
    # Calculate context switching impact
    if context_switch_patterns:
        context_switch_hours = {}
        for pattern in context_switch_patterns:
            if not pattern.temporal_distribution or "hour_of_day" not in pattern.temporal_distribution:
                continue
            
            hour_distribution = pattern.temporal_distribution["hour_of_day"]
            for hour, count in hour_distribution.items():
                if hour not in context_switch_hours:
                    context_switch_hours[hour] = 0
                context_switch_hours[hour] += int(count)
        
        if context_switch_hours:
            peak_context_switch_hour = max(context_switch_hours.items(), key=lambda x: x[1])[0]
            # Ensure productivity_insights is initialized as a dictionary
            if not isinstance(result["productivity_insights"], dict):
                result["productivity_insights"] = {}
                
            # Ensure productivity_insights is a dictionary
            if not isinstance(result["productivity_insights"], dict):
                result["productivity_insights"] = {}
                
            # Update with peak context switch hour
            result["productivity_insights"]["peak_context_switch_hour"] = str(peak_context_switch_hour)
            
            # Check if context switching overlaps with peak productivity
            if isinstance(result["productivity_insights"], dict) and "peak_productivity_hour" in result["productivity_insights"]:
                if str(peak_context_switch_hour) == result["productivity_insights"]["peak_productivity_hour"]:
                    result["productivity_insights"]["context_switch_productivity_conflict"] = True
    
    return result
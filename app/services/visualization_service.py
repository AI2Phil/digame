import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models.behavior_model import BehavioralModel, BehavioralPattern
from ..models.activity import Activity
from ..models.activity_features import ActivityEnrichedFeature
from ..crud.behavior_model_crud import get_behavioral_model, get_patterns_for_model
from .pattern_recognition_service import categorize_pattern, generate_pattern_label

def generate_pattern_heatmap(
    db: Session,
    user_id: int,
    model_id: Optional[int] = None,
    time_window: Optional[int] = None  # Time window in days
) -> Dict[str, Any]:
    """
    Generate a heatmap visualization of behavioral patterns by hour and day.
    
    Args:
        db: Database session
        user_id: ID of the user to generate heatmap for
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        time_window: Time window in days to look for patterns (optional)
        
    Returns:
        Dictionary with heatmap data
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
    model_id = getattr(model, 'id', None)  # type: ignore
    if not model_id:
        return {"error": "Invalid model ID"}
    patterns = get_patterns_for_model(db, model_id)
    if not patterns:
        return {"error": "No patterns found for model"}
    
    # Initialize heatmap data structure
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours = list(range(24))
    
    heatmap_data = {
        "days": days,
        "hours": hours,
        "data": [],
        "categories": {}
    }
    
    # Create a 7x24 matrix initialized with zeros
    activity_matrix = np.zeros((7, 24))
    category_matrices = {}
    
    # Process patterns
    for pattern in patterns:
        temporal_distribution = getattr(pattern, 'temporal_distribution', None)  # type: ignore
        if not temporal_distribution:
            continue
        
        # Get pattern category
        category = categorize_pattern(pattern)
        if category not in category_matrices:
            category_matrices[category] = np.zeros((7, 24))
        
        # Extract hour and day distributions
        hour_dist = temporal_distribution.get("hour_of_day", {})
        day_dist = temporal_distribution.get("day_of_week", {})
        
        # Calculate the total count for normalization
        total_hours = sum(int(count) for count in hour_dist.values())
        total_days = sum(int(count) for count in day_dist.values())
        
        if total_hours == 0 or total_days == 0:
            continue
        
        # Normalize distributions
        hour_probs = {int(hour): int(count) / total_hours for hour, count in hour_dist.items()}
        day_probs = {int(day): int(count) / total_days for day, count in day_dist.items()}
        
        # Calculate joint probability for each day-hour combination
        for day_idx, day in enumerate(range(7)):  # 0-6 for Monday-Sunday
            day_prob = day_probs.get(day, 0)
            for hour_idx, hour in enumerate(range(24)):  # 0-23 for hours
                hour_prob = hour_probs.get(hour, 0)
                # Joint probability (assuming independence)
                pattern_size = getattr(pattern, 'size', 1)  # type: ignore
                joint_prob = day_prob * hour_prob * pattern_size
                activity_matrix[day_idx, hour_idx] += joint_prob
                category_matrices[category][day_idx, hour_idx] += joint_prob
    
    # Normalize the matrix for better visualization
    if np.max(activity_matrix) > 0:
        activity_matrix = activity_matrix / np.max(activity_matrix) * 100
    
    # Convert matrix to list format for the heatmap
    for day_idx, day in enumerate(days):
        for hour_idx, hour in enumerate(hours):
            if not isinstance(heatmap_data["data"], list):
                heatmap_data["data"] = []
            
            # Safe numpy array access
            try:
                matrix_value = float(activity_matrix[day_idx, hour_idx])  # type: ignore
            except (IndexError, TypeError):
                matrix_value = 0.0
                
            heatmap_data["data"].append({  # type: ignore
                "day": day,
                "hour": hour,
                "value": matrix_value
            })
    
    # Process category matrices
    for category, matrix in category_matrices.items():
        if np.max(matrix) > 0:
            matrix = matrix / np.max(matrix) * 100
        
        category_data = []
        for day_idx, day in enumerate(days):
            for hour_idx, hour in enumerate(hours):
                # Safe numpy array access
                try:
                    matrix_value = float(matrix[day_idx, hour_idx])  # type: ignore
                except (IndexError, TypeError):
                    matrix_value = 0.0
                    
                category_data.append({
                    "day": day,
                    "hour": hour,
                    "value": matrix_value
                })
        
        if "categories" not in heatmap_data:
            heatmap_data["categories"] = {}
            
        if isinstance(heatmap_data["categories"], dict):
            heatmap_data["categories"][category] = category_data  # type: ignore
    
    return heatmap_data

def generate_pattern_sankey(
    db: Session,
    user_id: int,
    model_id: Optional[int] = None,
    time_window: Optional[int] = None  # Time window in days
) -> Dict[str, Any]:
    """
    Generate a Sankey diagram visualization of transitions between behavioral patterns.
    
    Args:
        db: Database session
        user_id: ID of the user to generate diagram for
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        time_window: Time window in days to look for patterns (optional)
        
    Returns:
        Dictionary with Sankey diagram data
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
    model_id = getattr(model, 'id', None)  # type: ignore
    if not model_id:
        return {"error": "Invalid model ID"}
    patterns = get_patterns_for_model(db, model_id)
    if not patterns:
        return {"error": "No patterns found for model"}
    
    # Get recent activities
    query = db.query(Activity).filter(Activity.user_id == user_id)
    
    if time_window:
        start_date = datetime.now() - timedelta(days=time_window)
        query = query.filter(Activity.timestamp >= start_date)
    
    activities = query.order_by(Activity.timestamp.asc()).all()
    
    if len(activities) < 2:
        return {"error": "Not enough activities to generate transitions"}
    
    # Get pattern assignments for activities
    activity_patterns = {}
    for pattern in patterns:
        representative_activities = getattr(pattern, 'representative_activities', None)  # type: ignore
        if not representative_activities:
            continue
        
        pattern_id = getattr(pattern, 'id', None)  # type: ignore
        if pattern_id:
            for activity_id in representative_activities:
                activity_patterns[activity_id] = pattern_id
    
    # Count transitions between patterns
    transitions = {}
    pattern_counts = {}
    
    prev_pattern_id = None
    for activity in activities:
        activity_id = getattr(activity, 'id', None)  # type: ignore
        if not activity_id or activity_id not in activity_patterns:
            continue
        
        pattern_id = activity_patterns[activity_id]
        
        # Count pattern occurrences
        if pattern_id not in pattern_counts:
            pattern_counts[pattern_id] = 0
        pattern_counts[pattern_id] += 1
        
        # Count transitions
        if prev_pattern_id is not None and prev_pattern_id != pattern_id:
            transition_key = f"{prev_pattern_id}-{pattern_id}"
            if transition_key not in transitions:
                transitions[transition_key] = 0
            transitions[transition_key] += 1
        
        prev_pattern_id = pattern_id
    
    # Prepare Sankey diagram data
    nodes = []
    links = []
    
    # Create a mapping from pattern ID to node index
    pattern_to_index = {}
    
    # Add nodes
    for i, pattern in enumerate(patterns):
        pattern_id = getattr(pattern, 'id', None)  # type: ignore
        if pattern_id and pattern_id in pattern_counts:
            pattern_to_index[pattern_id] = i
            nodes.append({
                "id": pattern_id,
                "name": generate_pattern_label(pattern),
                "category": categorize_pattern(pattern),
                "count": pattern_counts.get(pattern_id, 0)
            })
    
    # Add links
    for transition_key, count in transitions.items():
        source_id, target_id = map(int, transition_key.split('-'))
        if source_id in pattern_to_index and target_id in pattern_to_index:
            links.append({
                "source": pattern_to_index[source_id],
                "target": pattern_to_index[target_id],
                "value": count
            })
    
    return {
        "nodes": nodes,
        "links": links
    }

def generate_pattern_radar(
    db: Session,
    user_id: int,
    model_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a radar chart visualization of behavioral pattern categories.
    
    Args:
        db: Database session
        user_id: ID of the user to generate chart for
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        
    Returns:
        Dictionary with radar chart data
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
    model_id = getattr(model, 'id', None)  # type: ignore
    if not model_id:
        return {"error": "Invalid model ID"}
    patterns = get_patterns_for_model(db, model_id)
    if not patterns:
        return {"error": "No patterns found for model"}
    
    # Count patterns by category
    category_counts: Dict[str, int] = {}
    total_size = 0
    
    for pattern in patterns:
        try:
            category = categorize_pattern(pattern)
            if category and isinstance(category, str):
                if category not in category_counts:
                    category_counts[category] = 0
                
                pattern_size = getattr(pattern, 'size', 0)  # type: ignore
                if isinstance(pattern_size, (int, float)):
                    category_counts[category] += int(pattern_size)
                    total_size += int(pattern_size)
        except Exception:
            # Skip patterns that can't be categorized
            continue
    
    # Calculate percentages
    categories = []
    values = []
    
    for category, count in category_counts.items():
        categories.append(category)
        values.append(round(count / total_size * 100, 2) if total_size > 0 else 0)
    
    return {
        "categories": categories,
        "values": values
    }

def generate_pattern_timeline(
    db: Session,
    user_id: int,
    days: int = 7,
    model_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generate a timeline visualization of behavioral patterns over time.
    
    Args:
        db: Database session
        user_id: ID of the user to generate timeline for
        days: Number of days to include in the timeline
        model_id: ID of the behavioral model to use (optional, uses latest if not provided)
        
    Returns:
        Dictionary with timeline data
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
    model_id = getattr(model, 'id', None)  # type: ignore
    if not model_id:
        return {"error": "Invalid model ID"}
    patterns = get_patterns_for_model(db, model_id)
    if not patterns:
        return {"error": "No patterns found for model"}
    
    # Get recent activities
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    activities = db.query(Activity).filter(
        Activity.user_id == user_id,
        Activity.timestamp >= start_date,
        Activity.timestamp <= end_date
    ).order_by(Activity.timestamp.asc()).all()
    
    if not activities:
        return {"error": "No activities found in the specified time range"}
    
    # Get pattern assignments for activities
    activity_patterns = {}
    pattern_info = {}
    
    for pattern in patterns:
        representative_activities = getattr(pattern, 'representative_activities', None)  # type: ignore
        if not representative_activities:
            continue
        
        pattern_id = getattr(pattern, 'id', None)  # type: ignore
        if pattern_id:
            pattern_info[pattern_id] = {
                "id": pattern_id,
                "label": generate_pattern_label(pattern),
                "category": categorize_pattern(pattern)
            }
            
            for activity_id in representative_activities:
                activity_patterns[activity_id] = pattern_id
    
    # Group activities by day and hour
    timeline_data = {}
    
    for activity in activities:
        # Format date as YYYY-MM-DD
        activity_timestamp = getattr(activity, 'timestamp', None)  # type: ignore
        if not activity_timestamp:
            continue
            
        date_str = activity_timestamp.strftime("%Y-%m-%d")
        hour = activity_timestamp.hour
        
        if date_str not in timeline_data:
            timeline_data[date_str] = {hour: {} for hour in range(24)}
        
        if hour not in timeline_data[date_str]:
            timeline_data[date_str][hour] = {}
        
        activity_id = getattr(activity, 'id', None)  # type: ignore
        pattern_id = activity_patterns.get(activity_id) if activity_id else None
        if pattern_id:
            pattern_key = str(pattern_id)
            if pattern_key not in timeline_data[date_str][hour]:
                timeline_data[date_str][hour][pattern_key] = 0
            timeline_data[date_str][hour][pattern_key] += 1
    
    # Format data for visualization
    result = {
        "dates": sorted(timeline_data.keys()),
        "hours": list(range(24)),
        "patterns": pattern_info,
        "data": []
    }
    
    for date in result["dates"]:
        for hour in result["hours"]:
            hour_data = timeline_data[date].get(hour, {})
            for pattern_id, count in hour_data.items():
                try:
                    pattern_id_int = int(pattern_id)
                    if pattern_id_int in pattern_info:
                        if "data" not in result:
                            result["data"] = []
                        
                        if isinstance(result["data"], list):
                            result["data"].append({  # type: ignore
                                "date": date,
                                "hour": hour,
                                "pattern_id": pattern_id_int,
                                "pattern_label": pattern_info[pattern_id_int]["label"],
                                "pattern_category": pattern_info[pattern_id_int]["category"],
                                "count": count
                            })
                except (ValueError, KeyError):
                    continue
    
    return result
from sqlalchemy.orm import Session
import pickle
import json
from datetime import datetime

from ..models.behavior_model import BehavioralModel, BehavioralPattern
from ..models.user import User

def create_behavioral_model(
    db: Session,
    user_id: int,
    name: str,
    algorithm: str,
    parameters: dict,
    model_data=None,
    silhouette_score=None,
    num_clusters=None,
    version="1.0.0"
):
    """
    Create a new behavioral model for a user.
    
    Args:
        db: Database session
        user_id: ID of the user this model belongs to
        name: Name of the model
        algorithm: Algorithm used (kmeans, dbscan, hierarchical)
        parameters: Dictionary of algorithm parameters
        model_data: Serialized model data (optional)
        silhouette_score: Model performance metric (optional)
        num_clusters: Number of clusters found (optional)
        version: Model version (default: "1.0.0")
        
    Returns:
        The created BehavioralModel instance
    """
    db_model = BehavioralModel(
        user_id=user_id,
        name=name,
        version=version,
        algorithm=algorithm,
        parameters=parameters,
        model_data=model_data,
        silhouette_score=silhouette_score,
        num_clusters=num_clusters,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_behavioral_model(db: Session, model_id: int):
    """
    Get a behavioral model by ID.
    
    Args:
        db: Database session
        model_id: ID of the model to retrieve
        
    Returns:
        The BehavioralModel instance or None if not found
    """
    return db.query(BehavioralModel).filter(BehavioralModel.id == model_id).first()

def get_behavioral_models_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Get all behavioral models for a user.
    
    Args:
        db: Database session
        user_id: ID of the user
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of BehavioralModel instances
    """
    return db.query(BehavioralModel).filter(
        BehavioralModel.user_id == user_id
    ).offset(skip).limit(limit).all()

def update_behavioral_model(
    db: Session,
    model_id: int,
    name=None,
    algorithm=None,
    parameters=None,
    model_data=None,
    silhouette_score=None,
    num_clusters=None,
    version=None
):
    """
    Update a behavioral model.
    
    Args:
        db: Database session
        model_id: ID of the model to update
        name: New name (optional)
        algorithm: New algorithm (optional)
        parameters: New parameters (optional)
        model_data: New model data (optional)
        silhouette_score: New silhouette score (optional)
        num_clusters: New number of clusters (optional)
        version: New version (optional)
        
    Returns:
        The updated BehavioralModel instance or None if not found
    """
    db_model = get_behavioral_model(db, model_id)
    if db_model is None:
        return None
        
    if name is not None:
        db_model.name = name
    if algorithm is not None:
        db_model.algorithm = algorithm
    if parameters is not None:
        db_model.parameters = parameters
    if model_data is not None:
        db_model.model_data = model_data
    if silhouette_score is not None:
        db_model.silhouette_score = silhouette_score
    if num_clusters is not None:
        db_model.num_clusters = num_clusters
    if version is not None:
        db_model.version = version
        
    db_model.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_model)
    return db_model

def delete_behavioral_model(db: Session, model_id: int):
    """
    Delete a behavioral model.
    
    Args:
        db: Database session
        model_id: ID of the model to delete
        
    Returns:
        True if the model was deleted, False if not found
    """
    db_model = get_behavioral_model(db, model_id)
    if db_model is None:
        return False
        
    db.delete(db_model)
    db.commit()
    return True

def create_behavioral_pattern(
    db: Session,
    model_id: int,
    pattern_label: int,
    size: int,
    name=None,
    description=None,
    centroid=None,
    representative_activities=None,
    temporal_distribution=None,
    activity_distribution=None,
    context_features=None
):
    """
    Create a new behavioral pattern.
    
    Args:
        db: Database session
        model_id: ID of the behavioral model this pattern belongs to
        pattern_label: Cluster label or pattern identifier
        size: Number of activities in this pattern
        name: Human-readable name (optional)
        description: Human-readable description (optional)
        centroid: Centroid coordinates (optional)
        representative_activities: Sample activity IDs (optional)
        temporal_distribution: Time distribution (optional)
        activity_distribution: Activity type distribution (optional)
        context_features: Common contextual features (optional)
        
    Returns:
        The created BehavioralPattern instance
    """
    db_pattern = BehavioralPattern(
        model_id=model_id,
        pattern_label=pattern_label,
        size=size,
        name=name,
        description=description,
        centroid=centroid,
        representative_activities=representative_activities,
        temporal_distribution=temporal_distribution,
        activity_distribution=activity_distribution,
        context_features=context_features,
        created_at=datetime.utcnow()
    )
    
    db.add(db_pattern)
    db.commit()
    db.refresh(db_pattern)
    return db_pattern

def get_patterns_for_model(db: Session, model_id: int, skip: int = 0, limit: int = 100):
    """
    Get all patterns for a behavioral model.
    
    Args:
        db: Database session
        model_id: ID of the behavioral model
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of BehavioralPattern instances
    """
    return db.query(BehavioralPattern).filter(
        BehavioralPattern.model_id == model_id
    ).offset(skip).limit(limit).all()

def get_pattern(db: Session, pattern_id: int):
    """
    Get a behavioral pattern by ID.
    
    Args:
        db: Database session
        pattern_id: ID of the pattern to retrieve
        
    Returns:
        The BehavioralPattern instance or None if not found
    """
    return db.query(BehavioralPattern).filter(BehavioralPattern.id == pattern_id).first()

def update_pattern(
    db: Session,
    pattern_id: int,
    name=None,
    description=None,
    centroid=None,
    representative_activities=None,
    temporal_distribution=None,
    activity_distribution=None,
    context_features=None
):
    """
    Update a behavioral pattern.
    
    Args:
        db: Database session
        pattern_id: ID of the pattern to update
        name: New name (optional)
        description: New description (optional)
        centroid: New centroid (optional)
        representative_activities: New representative activities (optional)
        temporal_distribution: New temporal distribution (optional)
        activity_distribution: New activity distribution (optional)
        context_features: New context features (optional)
        
    Returns:
        The updated BehavioralPattern instance or None if not found
    """
    db_pattern = get_pattern(db, pattern_id)
    if db_pattern is None:
        return None
        
    if name is not None:
        db_pattern.name = name
    if description is not None:
        db_pattern.description = description
    if centroid is not None:
        db_pattern.centroid = centroid
    if representative_activities is not None:
        db_pattern.representative_activities = representative_activities
    if temporal_distribution is not None:
        db_pattern.temporal_distribution = temporal_distribution
    if activity_distribution is not None:
        db_pattern.activity_distribution = activity_distribution
    if context_features is not None:
        db_pattern.context_features = context_features
    
    db.commit()
    db.refresh(db_pattern)
    return db_pattern

def delete_pattern(db: Session, pattern_id: int):
    """
    Delete a behavioral pattern.
    
    Args:
        db: Database session
        pattern_id: ID of the pattern to delete
        
    Returns:
        True if the pattern was deleted, False if not found
    """
    db_pattern = get_pattern(db, pattern_id)
    if db_pattern is None:
        return False
        
    db.delete(db_pattern)
    db.commit()
    return True
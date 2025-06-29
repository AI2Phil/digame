"""
CRUD operations for Digital Twin models
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.models.digital_twin import DigitalTwin, ActivityPattern, BehavioralLearning, TwinInteraction

def get_digital_twin(db: Session, user_id: Optional[int] = None, twin_id: Optional[str] = None) -> Optional[DigitalTwin]:
    """
    Get digital twin by user_id or twin_id
    
    Args:
        db: Database session
        user_id: User ID to find twin for
        twin_id: Twin ID to find
        
    Returns:
        DigitalTwin object or None
    """
    if twin_id:
        return db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
    elif user_id:
        return db.query(DigitalTwin).filter(DigitalTwin.user_id == user_id).first()
    else:
        return None

def create_digital_twin(db: Session, twin_data: Dict[str, Any]) -> DigitalTwin:
    """
    Create a new digital twin
    
    Args:
        db: Database session
        twin_data: Dictionary containing twin data
        
    Returns:
        Created DigitalTwin object
    """
    twin = DigitalTwin(
        user_id=twin_data["user_id"],
        name=twin_data["name"],
        status=twin_data.get("status", "initializing"),
        learning_progress=twin_data.get("learning_progress", 0.0),
        accuracy_score=twin_data.get("accuracy_score", 0.0),
        model_version=twin_data.get("model_version", "1.0.0"),
        last_training_at=twin_data.get("last_training_at"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(twin)
    db.commit()
    db.refresh(twin)
    return twin

def update_digital_twin(db: Session, twin_id: str, update_data: Dict[str, Any]) -> Optional[DigitalTwin]:
    """
    Update digital twin
    
    Args:
        db: Database session
        twin_id: Twin ID to update
        update_data: Dictionary containing update data
        
    Returns:
        Updated DigitalTwin object or None
    """
    twin = db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
    if not twin:
        return None
    
    for key, value in update_data.items():
        if hasattr(twin, key):
            setattr(twin, key, value)
    
    twin.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(twin)
    return twin

def delete_digital_twin(db: Session, twin_id: str) -> bool:
    """
    Delete digital twin
    
    Args:
        db: Database session
        twin_id: Twin ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    twin = db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
    if not twin:
        return False
    
    db.delete(twin)
    db.commit()
    return True

def get_user_twins(db: Session, user_id: int) -> List[DigitalTwin]:
    """
    Get all digital twins for a user
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        List of DigitalTwin objects
    """
    return db.query(DigitalTwin).filter(DigitalTwin.user_id == user_id).all()

def create_activity_pattern(db: Session, pattern_data: Dict[str, Any]) -> ActivityPattern:
    """
    Create activity pattern
    
    Args:
        db: Database session
        pattern_data: Pattern data dictionary
        
    Returns:
        Created ActivityPattern object
    """
    pattern = ActivityPattern(
        twin_id=pattern_data["twin_id"],
        pattern_type=pattern_data["pattern_type"],
        pattern_data=pattern_data["pattern_data"],
        confidence_score=pattern_data.get("confidence_score"),
        frequency_score=pattern_data.get("frequency_score"),
        impact_score=pattern_data.get("impact_score"),
        discovered_at=pattern_data.get("discovered_at", datetime.utcnow()),
        validated_at=pattern_data.get("validated_at")
    )
    
    db.add(pattern)
    db.commit()
    db.refresh(pattern)
    return pattern

def get_twin_patterns(db: Session, twin_id: str, pattern_type: Optional[str] = None,
                     limit: Optional[int] = None) -> List[ActivityPattern]:
    """
    Get activity patterns for a twin
    
    Args:
        db: Database session
        twin_id: Twin ID
        pattern_type: Optional pattern type filter
        limit: Optional limit on results
        
    Returns:
        List of ActivityPattern objects
    """
    query = db.query(ActivityPattern).filter(ActivityPattern.twin_id == twin_id)
    
    if pattern_type:
        query = query.filter(ActivityPattern.pattern_type == pattern_type)
    
    query = query.order_by(desc(ActivityPattern.discovered_at))
    
    if limit:
        query = query.limit(limit)
    
    return query.all()

def create_behavioral_learning(db: Session, learning_data: Dict[str, Any]) -> BehavioralLearning:
    """
    Create behavioral learning entry
    
    Args:
        db: Database session
        learning_data: Learning data dictionary
        
    Returns:
        Created BehavioralLearning object
    """
    learning = BehavioralLearning(
        twin_id=learning_data["twin_id"],
        behavior_category=learning_data["behavior_category"],
        learning_data=learning_data["learning_data"],
        confidence_level=learning_data.get("confidence_level"),
        learning_iteration=learning_data.get("learning_iteration", 1),
        created_at=datetime.utcnow()
    )
    
    db.add(learning)
    db.commit()
    db.refresh(learning)
    return learning

def get_twin_learning_data(db: Session, twin_id: str,
                          behavior_category: Optional[str] = None) -> List[BehavioralLearning]:
    """
    Get behavioral learning data for a twin
    
    Args:
        db: Database session
        twin_id: Twin ID
        behavior_category: Optional category filter
        
    Returns:
        List of BehavioralLearning objects
    """
    query = db.query(BehavioralLearning).filter(BehavioralLearning.twin_id == twin_id)
    
    if behavior_category:
        query = query.filter(BehavioralLearning.behavior_category == behavior_category)
    
    return query.order_by(desc(BehavioralLearning.created_at)).all()

def create_twin_interaction(db: Session, interaction_data: Dict[str, Any]) -> TwinInteraction:
    """
    Create twin interaction log entry
    
    Args:
        db: Database session
        interaction_data: Interaction data dictionary
        
    Returns:
        Created TwinInteraction object
    """
    interaction = TwinInteraction(
        twin_id=interaction_data["twin_id"],
        interaction_type=interaction_data["interaction_type"],
        input_data=interaction_data.get("input_data"),
        response_data=interaction_data.get("response_data"),
        processing_time_ms=interaction_data.get("processing_time_ms"),
        user_feedback=interaction_data.get("user_feedback"),
        created_at=datetime.utcnow()
    )
    
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

def get_twin_interactions(db: Session, twin_id: str,
                         interaction_type: Optional[str] = None,
                         limit: Optional[int] = None) -> List[TwinInteraction]:
    """
    Get twin interactions
    
    Args:
        db: Database session
        twin_id: Twin ID
        interaction_type: Optional interaction type filter
        limit: Optional limit on results
        
    Returns:
        List of TwinInteraction objects
    """
    query = db.query(TwinInteraction).filter(TwinInteraction.twin_id == twin_id)
    
    if interaction_type:
        query = query.filter(TwinInteraction.interaction_type == interaction_type)
    
    query = query.order_by(desc(TwinInteraction.created_at))
    
    if limit:
        query = query.limit(limit)
    
    return query.all()

def get_twin_statistics(db: Session, twin_id: str) -> Dict[str, Any]:
    """
    Get statistics for a twin
    
    Args:
        db: Database session
        twin_id: Twin ID
        
    Returns:
        Dictionary containing twin statistics
    """
    twin = get_digital_twin(db, twin_id=twin_id)
    if not twin:
        return {}
    
    # Count patterns
    pattern_count = db.query(ActivityPattern).filter(ActivityPattern.twin_id == twin_id).count()
    
    # Count interactions
    interaction_count = db.query(TwinInteraction).filter(TwinInteraction.twin_id == twin_id).count()
    
    # Count learning entries
    learning_count = db.query(BehavioralLearning).filter(BehavioralLearning.twin_id == twin_id).count()
    
    # Get recent activity
    recent_interactions = get_twin_interactions(db, twin_id, limit=5)
    recent_patterns = get_twin_patterns(db, twin_id, limit=5)
    
    return {
        "twin_id": twin_id,
        "status": twin.status,
        "learning_progress": twin.learning_progress,
        "accuracy_score": twin.accuracy_score,
        "pattern_count": pattern_count,
        "interaction_count": interaction_count,
        "learning_count": learning_count,
        "recent_interactions": len(recent_interactions),
        "recent_patterns": len(recent_patterns),
        "last_training": twin.last_training_at.isoformat() if twin.last_training_at else None,
        "created_at": twin.created_at.isoformat() if twin.created_at else None,
        "updated_at": twin.updated_at.isoformat() if twin.updated_at else None
    }
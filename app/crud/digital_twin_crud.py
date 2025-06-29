"""
CRUD operations for Digital Twin models
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from app.models.digital_twin import (
    DigitalTwin, ActivityPattern, BehavioralLearning, 
    TwinInteraction, ActivityStream, TwinKnowledge, TwinStatus
)
from app.schemas.digital_twin_schemas import (
    DigitalTwinCreate, DigitalTwinUpdate, ActivityPatternCreate,
    TwinInteractionCreate, ActivityDataInput
)
import uuid
from datetime import datetime

class DigitalTwinCRUD:
    """CRUD operations for Digital Twin"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Digital Twin CRUD
    def create_digital_twin(self, user_id: int, twin_data: DigitalTwinCreate) -> DigitalTwin:
        """Create a new digital twin"""
        twin = DigitalTwin(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=twin_data.name,
            status=twin_data.status.value if twin_data.status else TwinStatus.INITIALIZING.value
        )
        self.db.add(twin)
        self.db.commit()
        self.db.refresh(twin)
        return twin
    
    def get_digital_twin(self, twin_id: str) -> Optional[DigitalTwin]:
        """Get digital twin by ID"""
        return self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
    
    def get_digital_twins_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[DigitalTwin]:
        """Get all digital twins for a user"""
        return self.db.query(DigitalTwin)\
            .filter(DigitalTwin.user_id == user_id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def update_digital_twin(self, twin_id: str, twin_data: DigitalTwinUpdate) -> Optional[DigitalTwin]:
        """Update digital twin"""
        twin = self.get_digital_twin(twin_id)
        if not twin:
            return None
        
        update_data = twin_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and value:
                setattr(twin, field, value.value)
            else:
                setattr(twin, field, value)
        
        # updated_at will be automatically set by SQLAlchemy onupdate
        self.db.commit()
        self.db.refresh(twin)
        return twin
    
    def delete_digital_twin(self, twin_id: str) -> bool:
        """Delete digital twin"""
        twin = self.get_digital_twin(twin_id)
        if not twin:
            return False
        
        self.db.delete(twin)
        self.db.commit()
        return True
    
    # Activity Pattern CRUD
    def create_activity_pattern(self, pattern_data: ActivityPatternCreate) -> ActivityPattern:
        """Create a new activity pattern"""
        pattern = ActivityPattern(
            id=str(uuid.uuid4()),
            twin_id=pattern_data.twin_id,
            pattern_type=pattern_data.pattern_type,
            pattern_data=pattern_data.pattern_data,
            confidence_score=pattern_data.confidence_score,
            frequency_score=pattern_data.frequency_score,
            impact_score=pattern_data.impact_score
        )
        self.db.add(pattern)
        self.db.commit()
        self.db.refresh(pattern)
        return pattern
    
    def get_activity_patterns(self, twin_id: str, skip: int = 0, limit: int = 100) -> List[ActivityPattern]:
        """Get activity patterns for a twin"""
        return self.db.query(ActivityPattern)\
            .filter(ActivityPattern.twin_id == twin_id)\
            .order_by(desc(ActivityPattern.discovered_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def get_activity_patterns_by_type(self, twin_id: str, pattern_type: str) -> List[ActivityPattern]:
        """Get activity patterns by type"""
        return self.db.query(ActivityPattern)\
            .filter(and_(
                ActivityPattern.twin_id == twin_id,
                ActivityPattern.pattern_type == pattern_type
            ))\
            .order_by(desc(ActivityPattern.discovered_at))\
            .all()
    
    # Twin Interaction CRUD
    def create_twin_interaction(self, twin_id: str, interaction_data: TwinInteractionCreate) -> TwinInteraction:
        """Create a new twin interaction"""
        interaction = TwinInteraction(
            id=str(uuid.uuid4()),
            twin_id=twin_id,
            interaction_type=interaction_data.interaction_type,
            input_data=interaction_data.input_data,
            user_feedback=interaction_data.user_feedback
        )
        self.db.add(interaction)
        self.db.commit()
        self.db.refresh(interaction)
        return interaction
    
    def get_twin_interactions(self, twin_id: str, skip: int = 0, limit: int = 100) -> List[TwinInteraction]:
        """Get twin interactions"""
        return self.db.query(TwinInteraction)\
            .filter(TwinInteraction.twin_id == twin_id)\
            .order_by(desc(TwinInteraction.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def update_interaction_response(self, interaction_id: str, response_data: Dict[str, Any], processing_time_ms: int) -> Optional[TwinInteraction]:
        """Update interaction with response data"""
        interaction = self.db.query(TwinInteraction).filter(TwinInteraction.id == interaction_id).first()
        if not interaction:
            return None
        
        interaction.response_data = response_data
        interaction.processing_time_ms = processing_time_ms
        self.db.commit()
        self.db.refresh(interaction)
        return interaction
    
    # Activity Stream CRUD
    def create_activity_stream(self, twin_id: str, activity_data: ActivityDataInput) -> ActivityStream:
        """Create activity stream entry"""
        stream_entry = ActivityStream(
            id=str(uuid.uuid4()),
            twin_id=twin_id,
            activity_type=activity_data.activity_type,
            activity_data=activity_data.activity_data,
            timestamp=activity_data.timestamp or datetime.utcnow(),
            processed=False
        )
        self.db.add(stream_entry)
        self.db.commit()
        self.db.refresh(stream_entry)
        return stream_entry
    
    def get_unprocessed_activities(self, twin_id: str, limit: int = 100) -> List[ActivityStream]:
        """Get unprocessed activities for a twin"""
        return self.db.query(ActivityStream)\
            .filter(and_(
                ActivityStream.twin_id == twin_id,
                ActivityStream.processed == False
            ))\
            .order_by(ActivityStream.timestamp)\
            .limit(limit)\
            .all()
    
    def mark_activity_processed(self, activity_id: str) -> bool:
        """Mark activity as processed"""
        activity = self.db.query(ActivityStream).filter(ActivityStream.id == activity_id).first()
        if not activity:
            return False
        
        activity.processed = True
        self.db.commit()
        return True
    
    # Behavioral Learning CRUD
    def create_behavioral_learning(self, twin_id: str, behavior_category: str, learning_data: Dict[str, Any]) -> BehavioralLearning:
        """Create behavioral learning entry"""
        learning = BehavioralLearning(
            id=str(uuid.uuid4()),
            twin_id=twin_id,
            behavior_category=behavior_category,
            learning_data=learning_data,
            confidence_level=70.0,  # Default
            learning_iteration=1
        )
        self.db.add(learning)
        self.db.commit()
        self.db.refresh(learning)
        return learning
    
    def get_behavioral_learning(self, twin_id: str, behavior_category: Optional[str] = None) -> List[BehavioralLearning]:
        """Get behavioral learning data"""
        query = self.db.query(BehavioralLearning).filter(BehavioralLearning.twin_id == twin_id)
        
        if behavior_category:
            query = query.filter(BehavioralLearning.behavior_category == behavior_category)
        
        return query.order_by(desc(BehavioralLearning.created_at)).all()
    
    # Twin Knowledge CRUD
    def create_twin_knowledge(self, twin_id: str, knowledge_type: str, knowledge_data: Dict[str, Any], source: Optional[str] = None) -> TwinKnowledge:
        """Create twin knowledge entry"""
        knowledge = TwinKnowledge(
            id=str(uuid.uuid4()),
            twin_id=twin_id,
            knowledge_type=knowledge_type,
            knowledge_data=knowledge_data,
            confidence_score=80.0,  # Default
            source=source
        )
        self.db.add(knowledge)
        self.db.commit()
        self.db.refresh(knowledge)
        return knowledge
    
    def get_twin_knowledge(self, twin_id: str, knowledge_type: Optional[str] = None) -> List[TwinKnowledge]:
        """Get twin knowledge"""
        query = self.db.query(TwinKnowledge).filter(TwinKnowledge.twin_id == twin_id)
        
        if knowledge_type:
            query = query.filter(TwinKnowledge.knowledge_type == knowledge_type)
        
        return query.order_by(desc(TwinKnowledge.updated_at)).all()
    
    # Statistics and Analytics
    def get_twin_statistics(self, twin_id: str) -> Dict[str, Any]:
        """Get twin statistics"""
        patterns_count = self.db.query(func.count(ActivityPattern.id))\
            .filter(ActivityPattern.twin_id == twin_id)\
            .scalar()
        
        interactions_count = self.db.query(func.count(TwinInteraction.id))\
            .filter(TwinInteraction.twin_id == twin_id)\
            .scalar()
        
        activities_count = self.db.query(func.count(ActivityStream.id))\
            .filter(ActivityStream.twin_id == twin_id)\
            .scalar()
        
        processed_activities = self.db.query(func.count(ActivityStream.id))\
            .filter(and_(
                ActivityStream.twin_id == twin_id,
                ActivityStream.processed == True
            ))\
            .scalar()
        
        return {
            "patterns_discovered": patterns_count,
            "total_interactions": interactions_count,
            "total_activities": activities_count,
            "processed_activities": processed_activities,
            "processing_rate": (processed_activities / activities_count * 100) if activities_count > 0 else 0
        }
    
    def get_recent_activity_summary(self, twin_id: str, days: int = 7) -> Dict[str, Any]:
        """Get recent activity summary"""
        from datetime import timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        recent_patterns = self.db.query(func.count(ActivityPattern.id))\
            .filter(and_(
                ActivityPattern.twin_id == twin_id,
                ActivityPattern.discovered_at >= cutoff_date
            ))\
            .scalar()
        
        recent_interactions = self.db.query(func.count(TwinInteraction.id))\
            .filter(and_(
                TwinInteraction.twin_id == twin_id,
                TwinInteraction.created_at >= cutoff_date
            ))\
            .scalar()
        
        return {
            "period_days": days,
            "new_patterns": recent_patterns,
            "interactions": recent_interactions,
            "summary_generated_at": datetime.utcnow().isoformat()
        }
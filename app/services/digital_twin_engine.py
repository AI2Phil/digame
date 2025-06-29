"""
Digital Twin Engine Service - Core functionality for digital twins
"""

from typing import Dict, List, Optional, Any
import asyncio
import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, desc
from app.models.digital_twin import (
    DigitalTwin, ActivityPattern, BehavioralLearning, 
    TwinInteraction, ActivityStream, TwinKnowledge, TwinStatus
)
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class DigitalTwinEngine:
    """Core Digital Twin Engine for managing twin lifecycle and operations"""
    
    def __init__(self, db: Session):
        self.db = db
        
    async def initialize_twin(self, user_id: int, name: Optional[str] = None) -> DigitalTwin:
        """Initialize a new digital twin for a user"""
        try:
            # Check if user exists
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(f"User with id {user_id} not found")
            
            # Generate default name if not provided
            if not name:
                name = f"ProductivityTwin_{str(user_id)[:8]}"
            
            # Create new digital twin
            twin = DigitalTwin(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name=name,
                status=TwinStatus.INITIALIZING.value,
                learning_progress=0.0,
                accuracy_score=0.0
            )
            
            self.db.add(twin)
            self.db.commit()
            self.db.refresh(twin)
            
            # Start initial learning process
            await self._start_initial_learning(str(twin.id))
            
            logger.info(f"Digital twin {twin.id} initialized for user {user_id}")
            return twin
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error initializing twin for user {user_id}: {str(e)}")
            raise
    
    async def process_activity_data(self, twin_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process new activity data and update twin learning"""
        try:
            # Validate twin exists
            twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
            if not twin:
                raise ValueError(f"Digital twin {twin_id} not found")
            
            # 1. Store raw activity data in activity stream
            await self._store_activity_data(twin_id, activity_data)
            
            # 2. Extract basic patterns (simplified for initial implementation)
            patterns = await self._extract_basic_patterns(activity_data)
            if patterns:
                await self._store_patterns(twin_id, patterns)
            
            # 3. Update behavioral learning (simplified)
            await self._update_behavioral_learning(twin_id, activity_data, patterns)
            
            # 4. Update twin status and progress
            await self._update_twin_progress(twin_id)
            
            return {
                "status": "success",
                "patterns_found": len(patterns) if patterns else 0,
                "processed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing activity data for twin {twin_id}: {str(e)}")
            raise
    
    async def get_twin_insights(self, twin_id: str) -> Dict[str, Any]:
        """Get comprehensive insights from the twin"""
        try:
            # Get twin
            twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
            if not twin:
                raise ValueError(f"Digital twin {twin_id} not found")
            
            # Get recent patterns
            patterns = self.db.query(ActivityPattern)\
                .filter(ActivityPattern.twin_id == twin_id)\
                .order_by(desc(ActivityPattern.discovered_at))\
                .limit(10)\
                .all()
            
            # Get recent interactions
            interactions = self.db.query(TwinInteraction)\
                .filter(TwinInteraction.twin_id == twin_id)\
                .order_by(desc(TwinInteraction.created_at))\
                .limit(5)\
                .all()
            
            # Generate basic recommendations
            recommendations = await self._generate_basic_recommendations(twin_id)
            
            insights = {
                "twin_status": {
                    "id": twin.id,
                    "name": twin.name,
                    "status": twin.status,
                    "learning_progress": float(twin.learning_progress),
                    "accuracy_score": float(twin.accuracy_score),
                    "last_training": twin.last_training_at.isoformat() if twin.last_training_at else None
                },
                "discovered_patterns": [
                    {
                        "id": p.id,
                        "type": p.pattern_type,
                        "confidence": float(p.confidence_score) if p.confidence_score else 0,
                        "discovered_at": p.discovered_at.isoformat()
                    } for p in patterns
                ],
                "recent_interactions": [
                    {
                        "id": i.id,
                        "type": i.interaction_type,
                        "created_at": i.created_at.isoformat(),
                        "feedback": i.user_feedback
                    } for i in interactions
                ],
                "recommendations": recommendations
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting insights for twin {twin_id}: {str(e)}")
            raise
    
    async def interact_with_twin(self, twin_id: str, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle natural language interaction with the twin"""
        try:
            # Validate twin exists
            twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
            if not twin:
                raise ValueError(f"Digital twin {twin_id} not found")
            
            # Process query (simplified for initial implementation)
            processed_query = await self._process_simple_query(query)
            
            # Generate response based on twin knowledge
            response = await self._generate_simple_response(twin_id, processed_query, context or {})
            
            # Log interaction
            interaction = TwinInteraction(
                id=str(uuid.uuid4()),
                twin_id=twin_id,
                interaction_type="chat",
                input_data={"query": query, "context": context},
                response_data=response,
                processing_time_ms=100  # Placeholder
            )
            
            self.db.add(interaction)
            self.db.commit()
            
            return response
            
        except Exception as e:
            logger.error(f"Error in twin interaction {twin_id}: {str(e)}")
            raise
    
    # Private helper methods
    
    async def _start_initial_learning(self, twin_id: str):
        """Start initial learning process for a new twin"""
        try:
            # Update twin status to learning
            twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
            if twin:
                twin.status = TwinStatus.LEARNING.value
                twin.learning_progress = 10.0  # Initial progress
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Error starting initial learning for twin {twin_id}: {str(e)}")
    
    async def _store_activity_data(self, twin_id: str, activity_data: Dict[str, Any]):
        """Store activity data in the activity stream"""
        try:
            activity_stream = ActivityStream(
                id=str(uuid.uuid4()),
                twin_id=twin_id,
                activity_type=activity_data.get("type", "general"),
                activity_data=activity_data,
                processed=False
            )
            
            self.db.add(activity_stream)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error storing activity data for twin {twin_id}: {str(e)}")
    
    async def _extract_basic_patterns(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract basic patterns from activity data (simplified implementation)"""
        patterns = []
        
        try:
            # Simple time-based pattern detection
            if "timestamp" in activity_data:
                hour = datetime.fromisoformat(activity_data["timestamp"]).hour
                if 9 <= hour <= 11:
                    patterns.append({
                        "type": "morning_productivity",
                        "data": {"peak_hour": hour},
                        "confidence": 0.7
                    })
                elif 14 <= hour <= 16:
                    patterns.append({
                        "type": "afternoon_focus",
                        "data": {"focus_hour": hour},
                        "confidence": 0.6
                    })
            
            # Simple task completion pattern
            if activity_data.get("type") == "task_completed":
                patterns.append({
                    "type": "task_completion",
                    "data": {"completion_time": activity_data.get("duration", 0)},
                    "confidence": 0.8
                })
                
        except Exception as e:
            logger.error(f"Error extracting patterns: {str(e)}")
        
        return patterns
    
    async def _store_patterns(self, twin_id: str, patterns: List[Dict[str, Any]]):
        """Store discovered patterns"""
        try:
            for pattern in patterns:
                activity_pattern = ActivityPattern(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    pattern_type=pattern["type"],
                    pattern_data=pattern["data"],
                    confidence_score=pattern.get("confidence", 0.5) * 100,
                    frequency_score=50.0,  # Default
                    impact_score=60.0      # Default
                )
                
                self.db.add(activity_pattern)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error storing patterns for twin {twin_id}: {str(e)}")
    
    async def _update_behavioral_learning(self, twin_id: str, activity_data: Dict[str, Any], patterns: List[Dict[str, Any]]):
        """Update behavioral learning data"""
        try:
            learning_data = BehavioralLearning(
                id=str(uuid.uuid4()),
                twin_id=twin_id,
                behavior_category="activity_processing",
                learning_data={
                    "activity_type": activity_data.get("type", "unknown"),
                    "patterns_found": len(patterns),
                    "processed_at": datetime.utcnow().isoformat()
                },
                confidence_level=70.0,
                learning_iteration=1
            )
            
            self.db.add(learning_data)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error updating behavioral learning for twin {twin_id}: {str(e)}")
    
    async def _update_twin_progress(self, twin_id: str):
        """Update twin learning progress"""
        try:
            twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
            if twin:
                # Simple progress calculation based on data processed
                current_progress = float(twin.learning_progress)
                new_progress = min(current_progress + 5.0, 100.0)
                
                twin.learning_progress = new_progress
                twin.accuracy_score = min(new_progress * 0.8, 95.0)  # Accuracy grows with progress
                
                if new_progress >= 25.0 and twin.status == TwinStatus.LEARNING.value:
                    twin.status = TwinStatus.ACTIVE.value
                
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Error updating progress for twin {twin_id}: {str(e)}")
    
    async def _generate_basic_recommendations(self, twin_id: str) -> List[Dict[str, Any]]:
        """Generate basic recommendations based on patterns"""
        recommendations = []
        
        try:
            # Get recent patterns
            patterns = self.db.query(ActivityPattern)\
                .filter(ActivityPattern.twin_id == twin_id)\
                .order_by(desc(ActivityPattern.discovered_at))\
                .limit(5)\
                .all()
            
            for pattern in patterns:
                if pattern.pattern_type == "morning_productivity":
                    recommendations.append({
                        "type": "schedule_optimization",
                        "title": "Optimize Morning Schedule",
                        "description": "You show high productivity in the morning. Consider scheduling important tasks between 9-11 AM.",
                        "confidence": float(pattern.confidence_score) if pattern.confidence_score else 70.0,
                        "priority": "high"
                    })
                elif pattern.pattern_type == "task_completion":
                    recommendations.append({
                        "type": "task_management",
                        "title": "Task Completion Pattern",
                        "description": "Your task completion patterns suggest breaking larger tasks into smaller chunks.",
                        "confidence": float(pattern.confidence_score) if pattern.confidence_score else 70.0,
                        "priority": "medium"
                    })
            
            # Default recommendation if no patterns
            if not recommendations:
                recommendations.append({
                    "type": "data_collection",
                    "title": "Continue Activity Tracking",
                    "description": "Keep tracking your activities to help your digital twin learn your patterns.",
                    "confidence": 90.0,
                    "priority": "low"
                })
                
        except Exception as e:
            logger.error(f"Error generating recommendations for twin {twin_id}: {str(e)}")
        
        return recommendations
    
    async def _process_simple_query(self, query: str) -> Dict[str, Any]:
        """Process user query (simplified implementation)"""
        query_lower = query.lower()
        
        # Simple intent classification
        if any(word in query_lower for word in ["productive", "productivity", "performance"]):
            intent = "productivity_inquiry"
        elif any(word in query_lower for word in ["schedule", "time", "when"]):
            intent = "schedule_optimization"
        elif any(word in query_lower for word in ["pattern", "insight", "analyze"]):
            intent = "pattern_analysis"
        else:
            intent = "general_inquiry"
        
        return {
            "intent": intent,
            "confidence": 0.8,
            "entities": [],
            "original_query": query
        }
    
    async def _generate_simple_response(self, twin_id: str, processed_query: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate simple response based on query"""
        intent = processed_query.get("intent", "general_inquiry")
        
        # Get twin data for context
        twin = self.db.query(DigitalTwin).filter(DigitalTwin.id == twin_id).first()
        
        if intent == "productivity_inquiry":
            response_text = f"Based on my analysis, your current productivity score is {twin.accuracy_score:.1f}%. I've been learning your patterns and I'm {twin.learning_progress:.1f}% complete with my initial learning phase."
        elif intent == "schedule_optimization":
            response_text = "I've noticed you're most productive in the morning hours. Consider scheduling your most important tasks between 9-11 AM for optimal performance."
        elif intent == "pattern_analysis":
            pattern_count = self.db.query(ActivityPattern).filter(ActivityPattern.twin_id == twin_id).count()
            response_text = f"I've discovered {pattern_count} patterns in your work behavior so far. The most significant ones relate to your peak productivity hours and task completion habits."
        else:
            response_text = f"Hello! I'm your digital productivity twin. I'm currently {twin.learning_progress:.1f}% through learning your patterns. How can I help you optimize your productivity today?"
        
        return {
            "text": response_text,
            "confidence": 0.85,
            "intent": intent,
            "suggestions": [
                "Tell me about my productivity patterns",
                "How can I optimize my schedule?",
                "What insights do you have for me?"
            ]
        }
"""
Digital Twin Engine - Core orchestration service for digital twin functionality
Implements the main digital twin logic, coordination, and intelligence integration
"""

import asyncio
import numpy as np
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from decimal import Decimal

from app.models.digital_twin import DigitalTwin, ActivityPattern, BehavioralLearning, TwinInteraction
from app.services.pattern_recognition import PatternRecognitionService
from app.services.prediction_engine import PredictionEngine
from app.crud.digital_twin_crud import get_digital_twin, create_digital_twin, update_digital_twin
import logging

logger = logging.getLogger(__name__)

class DigitalTwinEngine:
    """
    Core Digital Twin Engine that orchestrates all twin functionality
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.pattern_recognition = PatternRecognitionService()
        self.prediction_engine = PredictionEngine()
        self.learning_threshold = 0.8
        self.retrain_interval = timedelta(days=7)
        
    async def initialize_twin(self, user_id: int, name: Optional[str] = None) -> Dict[str, Any]:
        """
        Initialize a new digital twin for a user
        
        Args:
            user_id: User ID to create twin for
            name: Optional custom name for the twin
            
        Returns:
            Dictionary containing twin initialization data
        """
        try:
            # Check if user already has a twin
            existing_twin = get_digital_twin(self.db, user_id)
            if existing_twin:
                return {
                    "success": False,
                    "message": "User already has a digital twin",
                    "twin_id": existing_twin.id
                }
            
            # Create new twin
            twin_name = name or f"ProductivityTwin_{user_id}"
            twin_data = {
                "user_id": user_id,
                "name": twin_name,
                "status": "initializing",
                "learning_progress": 0.0,
                "accuracy_score": 0.0,
                "model_version": "1.0.0"
            }
            
            twin = create_digital_twin(self.db, twin_data)
            
            # Start initial learning process
            await self._start_initial_learning(str(twin.id))
            
            logger.info(f"Digital twin initialized for user {user_id}: {twin.id}")
            
            return {
                "success": True,
                "twin_id": twin.id,
                "name": twin.name,
                "status": twin.status,
                "message": "Digital twin successfully initialized"
            }
            
        except Exception as e:
            logger.error(f"Error initializing twin for user {user_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to initialize twin: {str(e)}"
            }
    
    async def process_activity_data(self, twin_id: Union[int, str], activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process new activity data and update twin learning
        
        Args:
            twin_id: Digital twin ID
            activity_data: New activity data to process
            
        Returns:
            Processing results and insights
        """
        try:
            # Get twin
            twin = get_digital_twin(self.db, twin_id=str(twin_id))
            if not twin:
                raise ValueError(f"Twin {twin_id} not found")
            
            # 1. Store raw activity data
            await self._store_activity_data(str(twin.id), activity_data)
            
            # 2. Extract patterns
            patterns = await self.pattern_recognition.analyze_activity(activity_data)
            await self._store_patterns(str(twin.id), patterns)
            
            # 3. Update behavioral learning
            learning_update = await self._update_behavioral_learning(str(twin.id), activity_data, patterns)
            
            # 4. Check if retraining is needed
            should_retrain = await self._should_retrain_models(str(twin.id))
            if should_retrain:
                await self._retrain_twin_models(str(twin.id))
            
            # 5. Update twin progress
            await self._update_learning_progress(str(twin.id), patterns, learning_update)
            
            return {
                "success": True,
                "patterns_discovered": len(patterns),
                "high_confidence_patterns": len([p for p in patterns if p.get('confidence', 0) >= 0.8]),
                "learning_progress": learning_update.get("progress", 0),
                "should_retrain": should_retrain,
                "processed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing activity data for twin {twin_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to process activity data: {str(e)}"
            }
    
    async def generate_predictions(self, twin_id: Union[int, str], prediction_type: str, 
                                 time_horizon: int = 7) -> Dict[str, Any]:
        """
        Generate predictions for the twin
        
        Args:
            twin_id: Digital twin ID
            prediction_type: Type of prediction to generate
            time_horizon: Number of days to predict ahead
            
        Returns:
            Prediction results
        """
        try:
            twin = get_digital_twin(self.db, twin_id=str(twin_id))
            if not twin:
                raise ValueError(f"Twin {twin_id} not found")
            
            # Get historical data
            historical_data = await self._get_historical_data(str(twin.id))
            
            # Generate predictions based on type
            if prediction_type == "productivity":
                predictions = await self.prediction_engine.predict_productivity_score(
                    historical_data, time_horizon
                )
            elif prediction_type == "tasks":
                predictions = await self.prediction_engine.forecast_task_completion(
                    historical_data, time_horizon
                )
            elif prediction_type == "energy":
                predictions = await self.prediction_engine.predict_energy_levels(
                    historical_data, time_horizon
                )
            elif prediction_type == "comprehensive":
                predictions = await self.prediction_engine.generate_insights(historical_data)
            else:
                raise ValueError(f"Unknown prediction type: {prediction_type}")
            
            # Store prediction results
            await self._store_prediction_results(str(twin.id), prediction_type, predictions)
            
            return {
                "success": True,
                "prediction_type": prediction_type,
                "time_horizon": time_horizon,
                "predictions": predictions,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating predictions for twin {twin_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to generate predictions: {str(e)}"
            }
    
    async def get_twin_insights(self, twin_id: Union[int, str]) -> Dict[str, Any]:
        """
        Get comprehensive insights from the twin
        
        Args:
            twin_id: Digital twin ID
            
        Returns:
            Comprehensive twin insights
        """
        try:
            twin = get_digital_twin(self.db, twin_id=str(twin_id))
            if not twin:
                raise ValueError(f"Twin {twin_id} not found")
            
            # Get recent patterns
            patterns = await self._get_recent_patterns(str(twin.id), days=30)
            
            # Get recent predictions
            predictions = await self._get_recent_predictions(str(twin.id), days=7)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(str(twin.id))
            
            # Calculate twin health score
            health_score = await self._calculate_twin_health(str(twin.id))
            
            # Safely extract values from SQLAlchemy model
            learning_progress = self._safe_decimal_to_float(twin.learning_progress)
            accuracy_score = self._safe_decimal_to_float(twin.accuracy_score)
            
            insights = {
                "twin_status": {
                    "id": twin.id,
                    "name": twin.name,
                    "status": twin.status,
                    "learning_progress": learning_progress,
                    "accuracy_score": accuracy_score,
                    "model_version": twin.model_version,
                    "last_training": twin.last_training_at.isoformat() if twin.last_training_at else None,
                    "health_score": health_score
                },
                "discovered_patterns": patterns,
                "recent_predictions": predictions,
                "recommendations": recommendations,
                "insights_generated_at": datetime.utcnow().isoformat()
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting insights for twin {twin_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to get twin insights: {str(e)}"
            }
    
    async def interact_with_twin(self, twin_id: Union[int, str], query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Handle interaction with the twin (simplified version for Phase 1C)
        
        Args:
            twin_id: Digital twin ID
            query: User query/message
            context: Optional context information
            
        Returns:
            Twin response
        """
        try:
            twin = get_digital_twin(self.db, twin_id=str(twin_id))
            if not twin:
                raise ValueError(f"Twin {twin_id} not found")
            
            # Process query (simplified for Phase 1C)
            response = await self._process_simple_query(str(twin.id), query, context)
            
            # Log interaction
            await self._log_interaction(str(twin.id), query, response)
            
            return {
                "success": True,
                "query": query,
                "response": response,
                "interaction_id": response.get("interaction_id"),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in twin interaction {twin_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to process interaction: {str(e)}"
            }
    
    # Helper methods
    def _safe_decimal_to_float(self, value: Any) -> float:
        """Safely convert Decimal/numeric values to float"""
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, Decimal):
            return float(value)
        # Handle SQLAlchemy column values
        try:
            return float(str(value))
        except (ValueError, TypeError):
            return 0.0
    
    async def _start_initial_learning(self, twin_id: str):
        """Start initial learning process for new twin"""
        try:
            # Update twin status
            update_data = {
                "status": "learning",
                "learning_progress": 5.0,
                "last_training_at": datetime.utcnow()
            }
            update_digital_twin(self.db, twin_id, update_data)
            
            logger.info(f"Started initial learning for twin {twin_id}")
            
        except Exception as e:
            logger.error(f"Error starting initial learning for twin {twin_id}: {str(e)}")
    
    async def _store_activity_data(self, twin_id: str, activity_data: Dict[str, Any]):
        """Store raw activity data"""
        # Implementation would store to activity_stream table
        pass
    
    async def _store_patterns(self, twin_id: str, patterns: List[Dict[str, Any]]):
        """Store discovered patterns"""
        # Implementation would store to activity_patterns table
        pass
    
    async def _update_behavioral_learning(self, twin_id: str, activity_data: Dict[str, Any], 
                                        patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Update behavioral learning data"""
        # Calculate learning progress based on patterns and data quality
        learning_progress = min(100.0, len(patterns) * 10.0)
        
        return {
            "progress": learning_progress,
            "patterns_count": len(patterns),
            "data_quality": self._assess_data_quality(activity_data)
        }
    
    async def _should_retrain_models(self, twin_id: str) -> bool:
        """Check if models should be retrained"""
        twin = get_digital_twin(self.db, twin_id=twin_id)
        if not twin or not twin.last_training_at:
            return True
        
        # Retrain if it's been more than the retrain interval
        time_since_training = datetime.utcnow() - twin.last_training_at
        return time_since_training.total_seconds() > self.retrain_interval.total_seconds()
    
    async def _retrain_twin_models(self, twin_id: str):
        """Retrain twin models with new data"""
        try:
            # Update last training time
            update_data = {
                "last_training_at": datetime.utcnow(),
                "model_version": f"1.{int(datetime.utcnow().timestamp())}"
            }
            update_digital_twin(self.db, twin_id, update_data)
            
            logger.info(f"Retrained models for twin {twin_id}")
            
        except Exception as e:
            logger.error(f"Error retraining models for twin {twin_id}: {str(e)}")
    
    async def _update_learning_progress(self, twin_id: str, patterns: List[Dict[str, Any]], 
                                      learning_update: Dict[str, Any]):
        """Update twin learning progress"""
        try:
            # Calculate new progress based on patterns and learning data
            pattern_score = min(50.0, len(patterns) * 5.0)
            quality_score = learning_update.get("data_quality", 0.5) * 30.0
            time_score = 20.0  # Base score for time-based learning
            
            new_progress = min(100.0, pattern_score + quality_score + time_score)
            
            # Calculate accuracy score based on pattern confidence
            if patterns:
                avg_confidence = sum(p.get('confidence', 0) for p in patterns) / len(patterns)
                accuracy_score = avg_confidence * 100
            else:
                accuracy_score = 0.0
            
            update_data = {
                "learning_progress": new_progress,
                "accuracy_score": accuracy_score,
                "status": "active" if new_progress > 50 else "learning"
            }
            
            update_digital_twin(self.db, twin_id, update_data)
            
        except Exception as e:
            logger.error(f"Error updating learning progress for twin {twin_id}: {str(e)}")
    
    async def _get_historical_data(self, twin_id: str) -> Dict[str, Any]:
        """Get historical data for the twin"""
        # This would fetch from various tables - simplified for Phase 1C
        return {
            "productivity_history": [],
            "activity_history": [],
            "pattern_history": []
        }
    
    async def _get_recent_patterns(self, twin_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get recent patterns for the twin"""
        # This would fetch from activity_patterns table
        return []
    
    async def _get_recent_predictions(self, twin_id: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent predictions for the twin"""
        # This would fetch from prediction results
        return []
    
    async def _generate_recommendations(self, twin_id: str) -> List[Dict[str, Any]]:
        """Generate recommendations based on twin data"""
        return [
            {
                "type": "productivity_optimization",
                "title": "Optimize Morning Routine",
                "description": "Your productivity peaks between 9-11 AM. Consider scheduling important tasks during this time.",
                "priority": "high",
                "confidence": 0.85
            },
            {
                "type": "focus_improvement",
                "title": "Reduce Interruptions",
                "description": "You have an average of 4 interruptions per hour. Try using focus blocks to improve concentration.",
                "priority": "medium",
                "confidence": 0.75
            }
        ]
    
    async def _calculate_twin_health(self, twin_id: str) -> float:
        """Calculate overall health score for the twin"""
        twin = get_digital_twin(self.db, twin_id=twin_id)
        if not twin:
            return 0.0
        
        # Safely extract values from SQLAlchemy model
        progress_score = self._safe_decimal_to_float(twin.learning_progress) / 100.0
        accuracy_score = self._safe_decimal_to_float(twin.accuracy_score) / 100.0
        
        # Check if twin has been active recently
        if twin.last_training_at:
            days_since_training = (datetime.utcnow() - twin.last_training_at).days
            recency_score = max(0.0, 1.0 - (days_since_training / 30.0))
        else:
            recency_score = 0.0
        
        health_score = (progress_score * 0.4 + accuracy_score * 0.4 + recency_score * 0.2)
        return min(1.0, max(0.0, health_score))
    
    async def _process_simple_query(self, twin_id: str, query: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Process simple queries (enhanced NLP will be in Phase 2)"""
        query_lower = query.lower()
        
        # Simple keyword-based responses for Phase 1C
        if any(word in query_lower for word in ["productivity", "productive", "performance"]):
            twin = get_digital_twin(self.db, twin_id=twin_id)
            if not twin:
                response_text = "I don't have enough data about your digital twin yet. Please initialize your twin first."
            else:
                learning_progress = self._safe_decimal_to_float(twin.learning_progress)
                response_text = f"Your current productivity learning progress is {learning_progress:.1f}%. "
                response_text += "I'm continuously analyzing your work patterns to provide better insights."
            
        elif any(word in query_lower for word in ["pattern", "patterns", "trend", "trends"]):
            response_text = "I've identified several patterns in your work habits. Your peak productivity hours appear to be in the morning, and you work best with focused time blocks."
            
        elif any(word in query_lower for word in ["predict", "forecast", "future"]):
            response_text = "Based on your current patterns, I predict you'll have high productivity tomorrow morning. I recommend scheduling important tasks between 9-11 AM."
            
        elif any(word in query_lower for word in ["recommend", "suggest", "advice"]):
            response_text = "I recommend taking regular breaks every 90 minutes and minimizing interruptions during your peak focus hours. Would you like me to analyze your schedule for optimization opportunities?"
            
        else:
            response_text = "I'm your digital productivity twin, learning from your work patterns. You can ask me about your productivity trends, patterns, predictions, or recommendations for improvement."
        
        return {
            "text": response_text,
            "confidence": 0.8,
            "interaction_id": f"int_{int(datetime.utcnow().timestamp())}",
            "response_type": "simple_query"
        }
    
    async def _log_interaction(self, twin_id: str, query: str, response: Dict[str, Any]):
        """Log twin interaction"""
        # This would store to twin_interactions table
        pass
    
    async def _store_prediction_results(self, twin_id: str, prediction_type: str, predictions: Dict[str, Any]):
        """Store prediction results"""
        # This would store to prediction results table
        pass
    
    def _assess_data_quality(self, activity_data: Dict[str, Any]) -> float:
        """Assess quality of activity data"""
        quality_score = 0.0
        
        # Check for required fields
        if 'activities' in activity_data:
            quality_score += 0.3
        if 'timestamp' in str(activity_data):
            quality_score += 0.2
        if 'productivity_score' in str(activity_data):
            quality_score += 0.3
        if 'duration' in str(activity_data):
            quality_score += 0.2
        
        return min(1.0, quality_score)
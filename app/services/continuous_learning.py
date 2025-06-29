"""
Continuous Learning Pipeline for Digital Twin Platform
Implements real-time model training and adaptation capabilities
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import numpy as np
import json
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class LearningPriority(Enum):
    """Priority levels for learning tasks"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class ModelType(Enum):
    """Types of models that can be trained"""
    PATTERN_RECOGNITION = "pattern_recognition"
    PRODUCTIVITY_PREDICTION = "productivity_prediction"
    ENERGY_FORECASTING = "energy_forecasting"
    TASK_COMPLETION = "task_completion"
    BEHAVIOR_ANALYSIS = "behavior_analysis"

@dataclass
class LearningItem:
    """Represents a learning task in the pipeline"""
    twin_id: str
    data_type: str
    data: Dict[str, Any]
    timestamp: datetime
    priority: LearningPriority
    model_type: ModelType
    metadata: Dict[str, Any]

@dataclass
class ModelPerformance:
    """Represents model performance metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confidence: float
    training_samples: int
    last_updated: datetime
    improvement: float

class ContinuousLearningPipeline:
    """
    Advanced continuous learning pipeline for digital twin models
    Provides real-time model training and adaptation
    """
    
    def __init__(self):
        self.learning_queue = asyncio.Queue()
        self.model_registry = {}
        self.performance_history = {}
        self.learning_scheduler: Optional[asyncio.Task] = None
        self.queue_processor: Optional[asyncio.Task] = None
        self.is_running = False
        self.learning_stats = {
            "total_processed": 0,
            "successful_updates": 0,
            "failed_updates": 0,
            "models_improved": 0
        }
        
    async def start_learning_pipeline(self):
        """Start the continuous learning pipeline"""
        if self.is_running:
            logger.warning("Learning pipeline is already running")
            return
            
        self.is_running = True
        logger.info("Starting continuous learning pipeline")
        
        # Start background tasks
        self.learning_scheduler = asyncio.create_task(self._learning_scheduler())
        self.queue_processor = asyncio.create_task(self._process_learning_queue())
        
        logger.info("Continuous learning pipeline started successfully")
    
    async def stop_learning_pipeline(self):
        """Stop the continuous learning pipeline"""
        if not self.is_running:
            return
            
        self.is_running = False
        logger.info("Stopping continuous learning pipeline")
        
        # Cancel background tasks
        if self.learning_scheduler:
            self.learning_scheduler.cancel()
        if self.queue_processor:
            self.queue_processor.cancel()
            
        logger.info("Continuous learning pipeline stopped")
    
    async def add_learning_data(self, twin_id: str, data_type: str,
                               data: Dict[str, Any], model_type: Optional[ModelType] = None,
                               priority: LearningPriority = LearningPriority.MEDIUM,
                               metadata: Optional[Dict[str, Any]] = None):
        """
        Add new data for learning
        
        Args:
            twin_id: Digital twin identifier
            data_type: Type of data being added
            data: The actual data for learning
            model_type: Type of model to update
            priority: Learning priority
            metadata: Additional metadata
        """
        if not self.is_running:
            logger.warning("Learning pipeline is not running. Starting it now.")
            await self.start_learning_pipeline()
        
        # Determine model type if not provided
        if model_type is None:
            model_type = self._infer_model_type(data_type)
        
        # Calculate priority if not provided
        calculated_priority = self._calculate_priority(data_type, data, priority)
        
        learning_item = LearningItem(
            twin_id=twin_id,
            data_type=data_type,
            data=data,
            timestamp=datetime.utcnow(),
            priority=calculated_priority,
            model_type=model_type,
            metadata=metadata or {}
        )
        
        await self.learning_queue.put(learning_item)
        logger.debug(f"Added learning item for twin {twin_id}, type {data_type}, priority {calculated_priority.name}")
    
    async def _process_learning_queue(self):
        """Process learning queue continuously"""
        logger.info("Starting learning queue processor")
        
        while self.is_running:
            try:
                # Get learning item with timeout
                learning_item = await asyncio.wait_for(
                    self.learning_queue.get(), timeout=1.0
                )
                
                # Process the learning item
                success = await self._process_learning_item(learning_item)
                
                # Update statistics
                self.learning_stats["total_processed"] += 1
                if success:
                    self.learning_stats["successful_updates"] += 1
                else:
                    self.learning_stats["failed_updates"] += 1
                
                # Mark task as done
                self.learning_queue.task_done()
                
            except asyncio.TimeoutError:
                # No items in queue, continue
                continue
            except Exception as e:
                logger.error(f"Error processing learning item: {e}")
                self.learning_stats["failed_updates"] += 1
                await asyncio.sleep(1)
    
    async def _process_learning_item(self, item: LearningItem) -> bool:
        """
        Process individual learning item
        
        Args:
            item: Learning item to process
            
        Returns:
            True if processing was successful
        """
        try:
            logger.debug(f"Processing learning item for twin {item.twin_id}, type {item.data_type}")
            
            # Get or create model
            model_key = f"{item.twin_id}_{item.model_type.value}"
            current_model = self.model_registry.get(model_key)
            
            if current_model is None:
                current_model = await self._initialize_model(item.twin_id, item.model_type)
                self.model_registry[model_key] = current_model
                logger.info(f"Initialized new model for {model_key}")
            
            # Perform incremental learning
            old_performance = await self._get_model_performance(model_key)
            await self._incremental_update(current_model, item)
            new_performance = await self._evaluate_model_performance(current_model, item)
            
            # Check if model improved
            if self._model_improved(old_performance, new_performance):
                await self._save_model(item.twin_id, item.model_type, current_model, new_performance)
                self.learning_stats["models_improved"] += 1
                logger.info(f"Model {model_key} improved: {new_performance.improvement:.2%}")
            
            # Store performance history
            await self._store_performance_history(model_key, new_performance)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to process learning item: {e}")
            return False
    
    async def _initialize_model(self, twin_id: str, model_type: ModelType) -> Dict[str, Any]:
        """
        Initialize a new model for the given type
        
        Args:
            twin_id: Digital twin identifier
            model_type: Type of model to initialize
            
        Returns:
            Initialized model configuration
        """
        model_configs = {
            ModelType.PATTERN_RECOGNITION: {
                "type": "pattern_recognition",
                "algorithm": "clustering",
                "parameters": {
                    "n_clusters": 5,
                    "learning_rate": 0.01,
                    "adaptation_rate": 0.1
                },
                "features": ["time_patterns", "activity_patterns", "context_patterns"],
                "training_data": [],
                "performance": ModelPerformance(
                    accuracy=0.5, precision=0.5, recall=0.5, f1_score=0.5,
                    confidence=0.5, training_samples=0, 
                    last_updated=datetime.utcnow(), improvement=0.0
                )
            },
            ModelType.PRODUCTIVITY_PREDICTION: {
                "type": "productivity_prediction",
                "algorithm": "gradient_boosting",
                "parameters": {
                    "n_estimators": 100,
                    "learning_rate": 0.1,
                    "max_depth": 6
                },
                "features": ["historical_productivity", "time_features", "context_features"],
                "training_data": [],
                "performance": ModelPerformance(
                    accuracy=0.6, precision=0.6, recall=0.6, f1_score=0.6,
                    confidence=0.6, training_samples=0,
                    last_updated=datetime.utcnow(), improvement=0.0
                )
            },
            ModelType.ENERGY_FORECASTING: {
                "type": "energy_forecasting",
                "algorithm": "time_series",
                "parameters": {
                    "window_size": 24,
                    "forecast_horizon": 7,
                    "seasonality": "daily"
                },
                "features": ["energy_history", "sleep_patterns", "activity_levels"],
                "training_data": [],
                "performance": ModelPerformance(
                    accuracy=0.65, precision=0.65, recall=0.65, f1_score=0.65,
                    confidence=0.65, training_samples=0,
                    last_updated=datetime.utcnow(), improvement=0.0
                )
            },
            ModelType.TASK_COMPLETION: {
                "type": "task_completion",
                "algorithm": "random_forest",
                "parameters": {
                    "n_estimators": 50,
                    "max_depth": 8,
                    "min_samples_split": 5
                },
                "features": ["task_complexity", "time_estimates", "historical_completion"],
                "training_data": [],
                "performance": ModelPerformance(
                    accuracy=0.7, precision=0.7, recall=0.7, f1_score=0.7,
                    confidence=0.7, training_samples=0,
                    last_updated=datetime.utcnow(), improvement=0.0
                )
            },
            ModelType.BEHAVIOR_ANALYSIS: {
                "type": "behavior_analysis",
                "algorithm": "neural_network",
                "parameters": {
                    "hidden_layers": [64, 32],
                    "activation": "relu",
                    "dropout": 0.2
                },
                "features": ["behavior_sequences", "context_switches", "interaction_patterns"],
                "training_data": [],
                "performance": ModelPerformance(
                    accuracy=0.55, precision=0.55, recall=0.55, f1_score=0.55,
                    confidence=0.55, training_samples=0,
                    last_updated=datetime.utcnow(), improvement=0.0
                )
            }
        }
        
        return model_configs.get(model_type, model_configs[ModelType.PATTERN_RECOGNITION])
    
    async def _incremental_update(self, model: Dict[str, Any], item: LearningItem):
        """
        Perform incremental model update
        
        Args:
            model: Model to update
            item: Learning item with new data
        """
        # Extract features from the learning item
        features = await self._extract_features(item.data, model["features"])
        target = await self._extract_target(item.data, model["type"])
        
        # Add to training data
        model["training_data"].append({
            "features": features,
            "target": target,
            "timestamp": item.timestamp.isoformat(),
            "weight": self._calculate_sample_weight(item)
        })
        
        # Keep only recent training data (sliding window)
        max_samples = 1000
        if len(model["training_data"]) > max_samples:
            model["training_data"] = model["training_data"][-max_samples:]
        
        # Update model parameters based on new data
        await self._update_model_parameters(model, features, target)
    
    async def _extract_features(self, data: Dict[str, Any], feature_types: List[str]) -> List[float]:
        """
        Extract features from data based on feature types
        
        Args:
            data: Raw data
            feature_types: Types of features to extract
            
        Returns:
            Extracted feature vector
        """
        features = []
        
        for feature_type in feature_types:
            if feature_type == "time_patterns":
                # Extract time-based features
                timestamp = data.get("timestamp", datetime.utcnow())
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                features.extend([
                    timestamp.hour / 24.0,  # Hour of day normalized
                    timestamp.weekday() / 6.0,  # Day of week normalized
                    timestamp.day / 31.0,  # Day of month normalized
                ])
            
            elif feature_type == "activity_patterns":
                # Extract activity-based features
                activity_type = data.get("activity_type", "unknown")
                activity_duration = data.get("duration", 0)
                activity_intensity = data.get("intensity", 0.5)
                
                features.extend([
                    hash(activity_type) % 100 / 100.0,  # Activity type hash normalized
                    min(activity_duration / 3600.0, 1.0),  # Duration in hours, capped at 1
                    activity_intensity
                ])
            
            elif feature_type == "context_patterns":
                # Extract context-based features
                context = data.get("context", {})
                features.extend([
                    context.get("focus_level", 0.5),
                    context.get("interruption_count", 0) / 10.0,  # Normalized interruptions
                    context.get("energy_level", 0.5)
                ])
            
            elif feature_type == "historical_productivity":
                # Extract historical productivity features
                productivity_score = data.get("productivity_score", 0.5)
                task_completion = data.get("task_completion_rate", 0.5)
                focus_time = data.get("focus_time", 0.5)
                
                features.extend([productivity_score, task_completion, focus_time])
            
            else:
                # Default feature extraction
                features.extend([0.5, 0.5, 0.5])  # Default neutral values
        
        return features
    
    async def _extract_target(self, data: Dict[str, Any], model_type: str) -> float:
        """
        Extract target value from data based on model type
        
        Args:
            data: Raw data
            model_type: Type of model
            
        Returns:
            Target value for training
        """
        target_mappings = {
            "pattern_recognition": data.get("pattern_strength", 0.5),
            "productivity_prediction": data.get("productivity_score", 0.5),
            "energy_forecasting": data.get("energy_level", 0.5),
            "task_completion": data.get("completion_probability", 0.5),
            "behavior_analysis": data.get("behavior_score", 0.5)
        }
        
        return target_mappings.get(model_type, 0.5)
    
    def _calculate_sample_weight(self, item: LearningItem) -> float:
        """
        Calculate weight for training sample based on recency and priority
        
        Args:
            item: Learning item
            
        Returns:
            Sample weight
        """
        # Base weight from priority
        priority_weights = {
            LearningPriority.LOW: 0.5,
            LearningPriority.MEDIUM: 1.0,
            LearningPriority.HIGH: 1.5,
            LearningPriority.CRITICAL: 2.0
        }
        
        base_weight = priority_weights.get(item.priority, 1.0)
        
        # Recency weight (more recent data gets higher weight)
        hours_old = (datetime.utcnow() - item.timestamp).total_seconds() / 3600
        recency_weight = max(0.1, 1.0 - (hours_old / 168))  # Decay over a week
        
        return base_weight * recency_weight
    
    async def _update_model_parameters(self, model: Dict[str, Any], 
                                     features: List[float], target: float):
        """
        Update model parameters based on new data
        
        Args:
            model: Model to update
            features: Feature vector
            target: Target value
        """
        # Simple parameter adaptation based on prediction error
        if len(model["training_data"]) > 1:
            # Calculate prediction error (simplified)
            predicted = await self._make_prediction(model, features)
            error = abs(target - predicted)
            
            # Adapt learning rate based on error
            if error > 0.2:  # High error
                model["parameters"]["learning_rate"] = min(
                    model["parameters"].get("learning_rate", 0.1) * 1.1, 0.5
                )
            else:  # Low error
                model["parameters"]["learning_rate"] = max(
                    model["parameters"].get("learning_rate", 0.1) * 0.95, 0.001
                )
    
    async def _make_prediction(self, model: Dict[str, Any], features: List[float]) -> float:
        """
        Make a prediction using the model
        
        Args:
            model: Model to use
            features: Feature vector
            
        Returns:
            Predicted value
        """
        # Simplified prediction based on training data
        if not model["training_data"]:
            return 0.5  # Default prediction
        
        # Use weighted average of similar samples
        similarities = []
        for sample in model["training_data"][-10:]:  # Use last 10 samples
            sample_features = sample["features"]
            if len(sample_features) == len(features):
                # Calculate similarity (inverse of distance)
                distance = sum((f1 - f2) ** 2 for f1, f2 in zip(features, sample_features))
                similarity = 1.0 / (1.0 + distance)
                similarities.append((similarity, sample["target"], sample.get("weight", 1.0)))
        
        if not similarities:
            return 0.5
        
        # Weighted average prediction
        total_weight = sum(sim * weight for sim, target, weight in similarities)
        weighted_sum = sum(sim * target * weight for sim, target, weight in similarities)
        
        return weighted_sum / total_weight if total_weight > 0 else 0.5
    
    async def _evaluate_model_performance(self, model: Dict[str, Any], 
                                        item: LearningItem) -> ModelPerformance:
        """
        Evaluate model performance
        
        Args:
            model: Model to evaluate
            item: Recent learning item
            
        Returns:
            Performance metrics
        """
        if len(model["training_data"]) < 5:
            # Not enough data for evaluation
            return model["performance"]
        
        # Simple evaluation using recent samples
        recent_samples = model["training_data"][-10:]
        predictions = []
        actuals = []
        
        for sample in recent_samples:
            pred = await self._make_prediction(model, sample["features"])
            predictions.append(pred)
            actuals.append(sample["target"])
        
        # Calculate metrics
        if predictions and actuals:
            # Mean Absolute Error
            mae = sum(abs(p - a) for p, a in zip(predictions, actuals)) / len(predictions)
            accuracy = max(0.0, 1.0 - mae)
            
            # Simple precision/recall approximation
            precision = accuracy * 0.9  # Simplified
            recall = accuracy * 0.95     # Simplified
            f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            # Confidence based on consistency
            variance = sum((p - sum(predictions)/len(predictions))**2 for p in predictions) / len(predictions)
            confidence = max(0.1, 1.0 - variance)
            
            # Calculate improvement
            old_accuracy = model["performance"].accuracy
            improvement = (accuracy - old_accuracy) / old_accuracy if old_accuracy > 0 else 0
            
            return ModelPerformance(
                accuracy=accuracy,
                precision=precision,
                recall=recall,
                f1_score=f1_score,
                confidence=confidence,
                training_samples=len(model["training_data"]),
                last_updated=datetime.utcnow(),
                improvement=improvement
            )
        
        return model["performance"]
    
    async def _get_model_performance(self, model_key: str) -> ModelPerformance:
        """Get current model performance"""
        if model_key in self.model_registry:
            return self.model_registry[model_key]["performance"]
        
        # Default performance for new models
        return ModelPerformance(
            accuracy=0.5, precision=0.5, recall=0.5, f1_score=0.5,
            confidence=0.5, training_samples=0,
            last_updated=datetime.utcnow(), improvement=0.0
        )
    
    def _model_improved(self, old_performance: ModelPerformance, 
                       new_performance: ModelPerformance) -> bool:
        """
        Check if model performance improved
        
        Args:
            old_performance: Previous performance
            new_performance: New performance
            
        Returns:
            True if model improved
        """
        # Consider improvement if accuracy increased by at least 1%
        return new_performance.accuracy > old_performance.accuracy + 0.01
    
    async def _save_model(self, twin_id: str, model_type: ModelType, 
                         model: Dict[str, Any], performance: ModelPerformance):
        """
        Save improved model
        
        Args:
            twin_id: Digital twin identifier
            model_type: Type of model
            model: Model data
            performance: Performance metrics
        """
        model["performance"] = performance
        model["last_saved"] = datetime.utcnow().isoformat()
        
        logger.info(f"Saved improved model for twin {twin_id}, type {model_type.value}")
    
    async def _store_performance_history(self, model_key: str, performance: ModelPerformance):
        """Store performance history for tracking"""
        if model_key not in self.performance_history:
            self.performance_history[model_key] = []
        
        self.performance_history[model_key].append({
            "timestamp": performance.last_updated.isoformat(),
            "accuracy": performance.accuracy,
            "confidence": performance.confidence,
            "training_samples": performance.training_samples,
            "improvement": performance.improvement
        })
        
        # Keep only last 100 performance records
        if len(self.performance_history[model_key]) > 100:
            self.performance_history[model_key] = self.performance_history[model_key][-100:]
    
    def _infer_model_type(self, data_type: str) -> ModelType:
        """Infer model type from data type"""
        type_mappings = {
            "activity_data": ModelType.PATTERN_RECOGNITION,
            "productivity_data": ModelType.PRODUCTIVITY_PREDICTION,
            "energy_data": ModelType.ENERGY_FORECASTING,
            "task_data": ModelType.TASK_COMPLETION,
            "behavior_data": ModelType.BEHAVIOR_ANALYSIS
        }
        
        return type_mappings.get(data_type, ModelType.PATTERN_RECOGNITION)
    
    def _calculate_priority(self, data_type: str, data: Dict[str, Any], 
                          default_priority: LearningPriority) -> LearningPriority:
        """Calculate learning priority based on data characteristics"""
        # High priority for recent, high-impact data
        if data.get("impact_score", 0) > 0.8:
            return LearningPriority.HIGH
        
        # Critical priority for anomalies or significant changes
        if data.get("anomaly_score", 0) > 0.9:
            return LearningPriority.CRITICAL
        
        return default_priority
    
    async def _learning_scheduler(self):
        """Schedule periodic learning tasks"""
        logger.info("Starting learning scheduler")
        
        while self.is_running:
            try:
                # Daily model evaluation
                await self._daily_model_evaluation()
                
                # Weekly model cleanup
                if datetime.now().weekday() == 0:  # Monday
                    await self._weekly_model_cleanup()
                
                # Sleep for 1 hour
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Error in learning scheduler: {e}")
                await asyncio.sleep(300)  # 5 minutes
    
    async def _daily_model_evaluation(self):
        """Perform daily model evaluation"""
        logger.debug("Performing daily model evaluation")
        
        for model_key, model in self.model_registry.items():
            try:
                # Check if model needs retraining
                last_update = model["performance"].last_updated
                if (datetime.utcnow() - last_update).days >= 1:
                    # Trigger model evaluation
                    logger.info(f"Model {model_key} needs evaluation")
                    
            except Exception as e:
                logger.error(f"Error evaluating model {model_key}: {e}")
    
    async def _weekly_model_cleanup(self):
        """Perform weekly model cleanup"""
        logger.info("Performing weekly model cleanup")
        
        # Clean up old performance history
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        for model_key in list(self.performance_history.keys()):
            history = self.performance_history[model_key]
            cleaned_history = [
                record for record in history
                if datetime.fromisoformat(record["timestamp"]) > cutoff_date
            ]
            self.performance_history[model_key] = cleaned_history
    
    def get_learning_stats(self) -> Dict[str, Any]:
        """Get learning pipeline statistics"""
        return {
            **self.learning_stats,
            "queue_size": self.learning_queue.qsize(),
            "active_models": len(self.model_registry),
            "is_running": self.is_running,
            "performance_history_size": sum(len(h) for h in self.performance_history.values())
        }
    
    def get_model_status(self, twin_id: str) -> Dict[str, Any]:
        """Get status of all models for a twin"""
        twin_models = {
            key: model for key, model in self.model_registry.items()
            if key.startswith(f"{twin_id}_")
        }
        
        status = {}
        for model_key, model in twin_models.items():
            model_type = model_key.split("_", 1)[1]
            performance = model["performance"]
            
            status[model_type] = {
                "accuracy": performance.accuracy,
                "confidence": performance.confidence,
                "training_samples": performance.training_samples,
                "last_updated": performance.last_updated.isoformat(),
                "improvement": performance.improvement
            }
        
        return status
"""
Prediction Engine for Digital Twin Platform
Implements predictive insights and forecasting capabilities
"""

try:
    import numpy as np
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_squared_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    # Fallback for missing ML dependencies
    np = None
    pd = None
    LinearRegression = None
    RandomForestRegressor = None
    StandardScaler = None
    mean_squared_error = None
    r2_score = None
    SKLEARN_AVAILABLE = False

from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

class PredictionEngine:
    """
    Advanced prediction engine for productivity forecasting and insights
    """
    
    def __init__(self) -> None:
        if SKLEARN_AVAILABLE and LinearRegression and RandomForestRegressor and StandardScaler:
            self.productivity_model: Optional[Any] = LinearRegression()
            self.task_completion_model: Optional[Any] = RandomForestRegressor(n_estimators=50, random_state=42)
            self.energy_model: Optional[Any] = LinearRegression()
            self.scaler: Optional[Any] = StandardScaler()
        else:
            self.productivity_model: Optional[Any] = None
            self.task_completion_model: Optional[Any] = None
            self.energy_model: Optional[Any] = None
            self.scaler: Optional[Any] = None
        self.is_trained: bool = False
        self.model_accuracy: Dict[str, float] = {}
        
    async def predict_productivity_score(self, user_data: Dict[str, Any], 
                                       prediction_horizon: int = 7) -> Dict[str, Any]:
        """
        Predict productivity scores for the next N days
        
        Args:
            user_data: Historical user activity and productivity data
            prediction_horizon: Number of days to predict ahead
            
        Returns:
            Dictionary containing predictions and confidence intervals
        """
        try:
            # Extract and prepare historical data
            historical_data = self._prepare_productivity_data(user_data)
            
            if len(historical_data) < 7:  # Need at least a week of data
                return self._generate_baseline_predictions(prediction_horizon)
            
            # Train or update the model
            await self._train_productivity_model(historical_data)
            
            # Generate predictions
            predictions = []
            confidence_intervals = []
            
            for days_ahead in range(1, prediction_horizon + 1):
                prediction_date = datetime.now() + timedelta(days=days_ahead)
                
                # Create feature vector for prediction
                features = self._create_prediction_features(
                    historical_data, prediction_date, user_data
                )
                
                # Make prediction
                if self.productivity_model and hasattr(self.productivity_model, 'predict'):
                    try:
                        prediction_result = self.productivity_model.predict([features])
                        predicted_score = float(prediction_result[0]) if prediction_result is not None else 0.7
                    except (AttributeError, IndexError, TypeError, ValueError):
                        predicted_score = 0.7
                else:
                    # Fallback prediction
                    predicted_score = 0.7  # Default productivity score
                
                # Calculate confidence interval
                confidence = self._calculate_prediction_confidence(
                    features, historical_data
                )
                
                predictions.append({
                    "date": prediction_date.isoformat(),
                    "predicted_score": float(max(0.0, min(1.0, predicted_score))),
                    "confidence": float(confidence),
                    "day_of_week": prediction_date.strftime('%A'),
                    "factors": self._identify_prediction_factors(features)
                })
                
                confidence_intervals.append({
                    "lower": float(max(0.0, predicted_score - (1 - confidence) * 0.3)),
                    "upper": float(min(1.0, predicted_score + (1 - confidence) * 0.3))
                })
            
            # Calculate trend analysis
            trend_analysis = self._analyze_productivity_trend(predictions)
            
            return {
                "predictions": predictions,
                "confidence_intervals": confidence_intervals,
                "trend_analysis": trend_analysis,
                "model_accuracy": self.model_accuracy.get('productivity', 0.0),
                "recommendation": self._generate_productivity_recommendations(predictions),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting productivity score: {str(e)}")
            return self._generate_baseline_predictions(prediction_horizon)
    
    async def forecast_task_completion(self, task_data: Dict[str, Any], 
                                     days_ahead: int = 14) -> Dict[str, Any]:
        """
        Forecast task completion patterns and deadlines
        
        Args:
            task_data: Historical task completion data
            days_ahead: Number of days to forecast
            
        Returns:
            Task completion forecasts and insights
        """
        try:
            # Prepare task completion data
            completion_data = self._prepare_task_data(task_data)
            
            if len(completion_data) < 10:  # Need sufficient task history
                return self._generate_baseline_task_forecast(days_ahead)
            
            # Train task completion model
            await self._train_task_completion_model(completion_data)
            
            # Generate daily completion forecasts
            daily_forecasts = []
            
            for day in range(1, days_ahead + 1):
                forecast_date = datetime.now() + timedelta(days=day)
                
                # Predict tasks likely to be completed
                completion_probability = self._predict_daily_completion_rate(
                    forecast_date, completion_data
                )
                
                # Estimate task volume
                estimated_tasks = self._estimate_task_volume(
                    forecast_date, completion_data
                )
                
                daily_forecasts.append({
                    "date": forecast_date.isoformat(),
                    "estimated_completions": int(estimated_tasks * completion_probability),
                    "completion_probability": float(completion_probability),
                    "estimated_task_volume": int(estimated_tasks),
                    "day_type": self._classify_day_type(forecast_date),
                    "confidence": self._calculate_task_forecast_confidence(completion_data)
                })
            
            # Analyze completion patterns
            pattern_analysis = self._analyze_completion_patterns(daily_forecasts)
            
            return {
                "daily_forecasts": daily_forecasts,
                "pattern_analysis": pattern_analysis,
                "bottleneck_predictions": self._predict_bottlenecks(daily_forecasts),
                "optimization_suggestions": self._suggest_task_optimizations(daily_forecasts),
                "model_accuracy": self.model_accuracy.get('task_completion', 0.0),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error forecasting task completion: {str(e)}")
            return self._generate_baseline_task_forecast(days_ahead)
    
    async def predict_energy_levels(self, energy_data: Dict[str, Any], 
                                  prediction_days: int = 7) -> Dict[str, Any]:
        """
        Predict energy levels and optimal work periods
        
        Args:
            energy_data: Historical energy level data
            prediction_days: Number of days to predict
            
        Returns:
            Energy level predictions and optimal scheduling recommendations
        """
        try:
            # Prepare energy data
            historical_energy = self._prepare_energy_data(energy_data)
            
            if len(historical_energy) < 14:  # Need at least 2 weeks of data
                return self._generate_baseline_energy_predictions(prediction_days)
            
            # Train energy prediction model
            await self._train_energy_model(historical_energy)
            
            # Generate hourly energy predictions for each day
            energy_predictions = []
            
            for day in range(1, prediction_days + 1):
                prediction_date = datetime.now() + timedelta(days=day)
                daily_energy = []
                
                for hour in range(24):
                    prediction_time = prediction_date.replace(hour=hour, minute=0, second=0)
                    
                    # Create features for energy prediction
                    features = self._create_energy_features(
                        prediction_time, historical_energy
                    )
                    
                    # Predict energy level
                    if self.energy_model and hasattr(self.energy_model, 'predict'):
                        try:
                            prediction_result = self.energy_model.predict([features])
                            predicted_energy = float(prediction_result[0]) if prediction_result is not None else 0.5
                        except (AttributeError, IndexError, TypeError, ValueError):
                            predicted_energy = 0.5
                    else:
                        # Fallback energy prediction based on hour
                        if 6 <= hour <= 10:
                            predicted_energy = 0.8
                        elif 11 <= hour <= 15:
                            predicted_energy = 0.7
                        elif 16 <= hour <= 19:
                            predicted_energy = 0.6
                        else:
                            predicted_energy = 0.3
                    
                    daily_energy.append({
                        "hour": hour,
                        "predicted_energy": float(max(0.0, min(1.0, predicted_energy))),
                        "optimal_for_deep_work": predicted_energy > 0.7,
                        "optimal_for_routine_tasks": 0.4 <= predicted_energy <= 0.7,
                        "rest_recommended": predicted_energy < 0.4
                    })
                
                # Identify optimal periods
                optimal_periods = self._identify_optimal_periods(daily_energy)
                
                energy_predictions.append({
                    "date": prediction_date.isoformat(),
                    "day_of_week": prediction_date.strftime('%A'),
                    "hourly_predictions": daily_energy,
                    "optimal_periods": optimal_periods,
                    "daily_energy_score": float(sum(h["predicted_energy"] for h in daily_energy) / len(daily_energy)) if daily_energy else 0.0,
                    "peak_energy_hours": [h["hour"] for h in daily_energy if isinstance(h.get("predicted_energy"), (int, float)) and h["predicted_energy"] > 0.8]
                })
            
            # Generate scheduling recommendations
            scheduling_recommendations = self._generate_scheduling_recommendations(energy_predictions)
            
            return {
                "energy_predictions": energy_predictions,
                "scheduling_recommendations": scheduling_recommendations,
                "weekly_energy_pattern": self._analyze_weekly_energy_pattern(energy_predictions),
                "model_accuracy": self.model_accuracy.get('energy', 0.0),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting energy levels: {str(e)}")
            return self._generate_baseline_energy_predictions(prediction_days)
    
    async def generate_insights(self, comprehensive_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive predictive insights combining all models
        
        Args:
            comprehensive_data: All available user data
            
        Returns:
            Comprehensive insights and recommendations
        """
        try:
            # Get predictions from all models
            productivity_predictions = await self.predict_productivity_score(
                comprehensive_data, prediction_horizon=7
            )
            
            task_forecasts = await self.forecast_task_completion(
                comprehensive_data, days_ahead=14
            )
            
            energy_predictions = await self.predict_energy_levels(
                comprehensive_data, prediction_days=7
            )
            
            # Combine insights
            combined_insights = self._combine_predictions(
                productivity_predictions, task_forecasts, energy_predictions
            )
            
            # Generate actionable recommendations
            recommendations = self._generate_comprehensive_recommendations(
                productivity_predictions, task_forecasts, energy_predictions
            )
            
            return {
                "productivity_insights": productivity_predictions,
                "task_completion_insights": task_forecasts,
                "energy_insights": energy_predictions,
                "combined_insights": combined_insights,
                "actionable_recommendations": recommendations,
                "confidence_score": self._calculate_overall_confidence(),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating comprehensive insights: {str(e)}")
            return {
                "error": "Unable to generate insights",
                "message": str(e),
                "generated_at": datetime.utcnow().isoformat()
            }
    
    # Helper methods for data preparation
    def _prepare_productivity_data(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prepare productivity data for model training"""
        productivity_data: List[Dict[str, Any]] = []
        
        if 'productivity_history' in user_data and isinstance(user_data['productivity_history'], list):
            for entry in user_data['productivity_history']:
                if isinstance(entry, dict) and 'date' in entry and 'score' in entry:
                    try:
                        score_value = float(entry['score'])
                        productivity_data.append({
                            'date': str(entry['date']),
                            'score': score_value,
                            'day_of_week': self._get_day_of_week(str(entry['date'])),
                            'tasks_completed': int(entry.get('tasks_completed', 0)),
                            'focus_time': float(entry.get('focus_time', 0)),
                            'interruptions': int(entry.get('interruptions', 0))
                        })
                    except (ValueError, TypeError):
                        continue
        
        return sorted(productivity_data, key=lambda x: x['date'])
    
    def _prepare_task_data(self, task_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prepare task completion data for model training"""
        completion_data: List[Dict[str, Any]] = []
        
        if 'task_history' in task_data and isinstance(task_data['task_history'], list):
            for task in task_data['task_history']:
                if isinstance(task, dict) and 'completed_at' in task:
                    try:
                        completion_data.append({
                            'completed_at': str(task['completed_at']),
                            'priority': str(task.get('priority', 'medium')),
                            'estimated_duration': float(task.get('estimated_duration', 60)),
                            'actual_duration': float(task.get('actual_duration', 60)),
                            'complexity': str(task.get('complexity', 'medium')),
                            'day_of_week': self._get_day_of_week(str(task['completed_at']))
                        })
                    except (ValueError, TypeError):
                        continue
        
        return sorted(completion_data, key=lambda x: x['completed_at'])
    
    def _prepare_energy_data(self, energy_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prepare energy level data for model training"""
        energy_history: List[Dict[str, Any]] = []
        
        if 'energy_history' in energy_data and isinstance(energy_data['energy_history'], list):
            for entry in energy_data['energy_history']:
                if isinstance(entry, dict) and 'timestamp' in entry and 'energy_level' in entry:
                    try:
                        energy_level_value = float(entry['energy_level'])
                        energy_history.append({
                            'timestamp': str(entry['timestamp']),
                            'energy_level': energy_level_value,
                            'hour': self._get_hour(str(entry['timestamp'])),
                            'day_of_week': self._get_day_of_week(str(entry['timestamp'])),
                            'sleep_quality': float(entry.get('sleep_quality', 0.7)),
                            'exercise': bool(entry.get('exercise', False)),
                            'caffeine': bool(entry.get('caffeine', False))
                        })
                    except (ValueError, TypeError):
                        continue
        
        return sorted(energy_history, key=lambda x: x['timestamp'])
    
    # Model training methods
    async def _train_productivity_model(self, historical_data: List[Dict[str, Any]]) -> None:
        """Train the productivity prediction model"""
        if (len(historical_data) < 7 or not self.productivity_model or
            not hasattr(self.productivity_model, 'fit') or not r2_score):
            return
        
        # Prepare features and targets
        features: List[List[float]] = []
        targets: List[float] = []
        
        for entry in historical_data:
            try:
                feature_vector = [
                    float(entry['day_of_week']),
                    float(entry['tasks_completed']),
                    float(entry['focus_time']),
                    float(entry['interruptions']),
                    float(self._get_week_number(entry['date'])),
                    float(self._get_month_number(entry['date']))
                ]
                features.append(feature_vector)
                targets.append(float(entry['score']))
            except (ValueError, TypeError, KeyError):
                continue
        
        if len(features) < 7 or len(targets) < 7:
            return
        
        try:
            # Train the model
            if self.productivity_model and hasattr(self.productivity_model, 'fit'):
                self.productivity_model.fit(features, targets)
                
                # Calculate model accuracy
                if hasattr(self.productivity_model, 'predict'):
                    predictions = self.productivity_model.predict(features)
                    if predictions is not None:
                        self.model_accuracy['productivity'] = float(r2_score(targets, predictions))
                    else:
                        self.model_accuracy['productivity'] = 0.0
                
                self.is_trained = True
        except Exception as e:
            logger.error(f"Error training productivity model: {e}")
            self.model_accuracy['productivity'] = 0.0
    
    async def _train_task_completion_model(self, completion_data: List[Dict[str, Any]]) -> None:
        """Train the task completion prediction model"""
        if (len(completion_data) < 10 or not self.task_completion_model or
            not hasattr(self.task_completion_model, 'fit') or not r2_score):
            return
        
        # Prepare features for task completion prediction
        features: List[List[float]] = []
        targets: List[float] = []
        
        # Group by day and calculate completion rates
        daily_completions: Dict[str, List[Dict[str, Any]]] = {}
        for task in completion_data:
            try:
                date = str(task['completed_at'])[:10]  # Extract date part
                if date not in daily_completions:
                    daily_completions[date] = []
                daily_completions[date].append(task)
            except (KeyError, TypeError):
                continue
        
        for date, tasks in daily_completions.items():
            if not tasks:
                continue
            try:
                high_priority_count = sum(1 for t in tasks if str(t.get('priority', '')).lower() == 'high')
                avg_duration = sum(float(t.get('actual_duration', 0)) for t in tasks) / len(tasks)
                
                feature_vector = [
                    float(self._get_day_of_week(date)),
                    float(len(tasks)),
                    float(high_priority_count),
                    float(avg_duration),
                    float(self._get_week_number(date))
                ]
                features.append(feature_vector)
                targets.append(float(len(tasks)))
            except (ValueError, TypeError, ZeroDivisionError):
                continue
        
        if len(features) < 5 or len(targets) < 5:
            return
        
        try:
            # Train the model
            if self.task_completion_model and hasattr(self.task_completion_model, 'fit'):
                self.task_completion_model.fit(features, targets)
                
                # Calculate accuracy
                if hasattr(self.task_completion_model, 'predict'):
                    predictions = self.task_completion_model.predict(features)
                    if predictions is not None:
                        self.model_accuracy['task_completion'] = float(r2_score(targets, predictions))
                    else:
                        self.model_accuracy['task_completion'] = 0.0
        except Exception as e:
            logger.error(f"Error training task completion model: {e}")
            self.model_accuracy['task_completion'] = 0.0
    
    async def _train_energy_model(self, energy_history: List[Dict[str, Any]]) -> None:
        """Train the energy level prediction model"""
        if (len(energy_history) < 14 or not self.energy_model or
            not hasattr(self.energy_model, 'fit') or not r2_score):
            return
        
        # Prepare features and targets
        features: List[List[float]] = []
        targets: List[float] = []
        
        for entry in energy_history:
            try:
                feature_vector = [
                    float(entry['hour']),
                    float(entry['day_of_week']),
                    float(entry['sleep_quality']),
                    float(1 if entry['exercise'] else 0),
                    float(1 if entry['caffeine'] else 0),
                    float(self._get_week_number(entry['timestamp']))
                ]
                features.append(feature_vector)
                targets.append(float(entry['energy_level']))
            except (ValueError, TypeError, KeyError):
                continue
        
        if len(features) < 14 or len(targets) < 14:
            return
        
        try:
            # Train the model
            if self.energy_model and hasattr(self.energy_model, 'fit'):
                self.energy_model.fit(features, targets)
                
                # Calculate accuracy
                if hasattr(self.energy_model, 'predict'):
                    predictions = self.energy_model.predict(features)
                    if predictions is not None:
                        self.model_accuracy['energy'] = float(r2_score(targets, predictions))
                    else:
                        self.model_accuracy['energy'] = 0.0
        except Exception as e:
            logger.error(f"Error training energy model: {e}")
            self.model_accuracy['energy'] = 0.0
    
    # Feature creation methods
    def _create_prediction_features(self, historical_data: List[Dict[str, Any]], 
                                  prediction_date: datetime, user_data: Dict[str, Any]) -> List[float]:
        """Create feature vector for productivity prediction"""
        day_of_week = prediction_date.weekday()
        week_number = prediction_date.isocalendar()[1]
        month_number = prediction_date.month
        
        # Calculate recent averages
        recent_data = historical_data[-7:] if len(historical_data) >= 7 else historical_data
        avg_tasks = sum(d['tasks_completed'] for d in recent_data) / len(recent_data)
        avg_focus = sum(d['focus_time'] for d in recent_data) / len(recent_data)
        avg_interruptions = sum(d['interruptions'] for d in recent_data) / len(recent_data)
        
        return [day_of_week, avg_tasks, avg_focus, avg_interruptions, week_number, month_number]
    
    def _create_energy_features(self, prediction_time: datetime, 
                              energy_history: List[Dict[str, Any]]) -> List[float]:
        """Create feature vector for energy prediction"""
        hour = prediction_time.hour
        day_of_week = prediction_time.weekday()
        week_number = prediction_time.isocalendar()[1]
        
        # Default values for sleep quality, exercise, caffeine
        sleep_quality = 0.7  # Default assumption
        exercise = 0  # Default assumption
        caffeine = 0  # Default assumption
        
        return [hour, day_of_week, sleep_quality, exercise, caffeine, week_number]
    
    # Utility methods
    def _get_day_of_week(self, date_str: Union[str, datetime]) -> int:
        """Get day of week as integer (0=Monday, 6=Sunday)"""
        try:
            if isinstance(date_str, str):
                # Handle various date formats
                clean_date = date_str.replace('Z', '+00:00')
                date_obj = datetime.fromisoformat(clean_date)
            elif isinstance(date_str, datetime):
                date_obj = date_str
            else:
                return 0
            return date_obj.weekday()
        except (ValueError, TypeError, AttributeError):
            return 0
    
    def _get_hour(self, timestamp_str: Union[str, datetime]) -> int:
        """Extract hour from timestamp"""
        try:
            if isinstance(timestamp_str, str):
                clean_timestamp = timestamp_str.replace('Z', '+00:00')
                timestamp = datetime.fromisoformat(clean_timestamp)
            elif isinstance(timestamp_str, datetime):
                timestamp = timestamp_str
            else:
                return 12
            return timestamp.hour
        except (ValueError, TypeError, AttributeError):
            return 12
    
    def _get_week_number(self, date_str: Union[str, datetime]) -> int:
        """Get week number of the year"""
        try:
            if isinstance(date_str, str):
                clean_date = date_str.replace('Z', '+00:00')
                date_obj = datetime.fromisoformat(clean_date)
            elif isinstance(date_str, datetime):
                date_obj = date_str
            else:
                return 1
            return date_obj.isocalendar()[1]
        except (ValueError, TypeError, AttributeError):
            return 1
    
    def _get_month_number(self, date_str: Union[str, datetime]) -> int:
        """Get month number"""
        try:
            if isinstance(date_str, str):
                clean_date = date_str.replace('Z', '+00:00')
                date_obj = datetime.fromisoformat(clean_date)
            elif isinstance(date_str, datetime):
                date_obj = date_str
            else:
                return 1
            return date_obj.month
        except (ValueError, TypeError, AttributeError):
            return 1
    
    # Baseline prediction methods (when insufficient data)
    def _generate_baseline_predictions(self, prediction_horizon: int) -> Dict[str, Any]:
        """Generate baseline predictions when insufficient data is available"""
        predictions = []
        
        for days_ahead in range(1, prediction_horizon + 1):
            prediction_date = datetime.now() + timedelta(days=days_ahead)
            
            # Simple baseline: slightly lower productivity on weekends
            base_score = 0.7 if prediction_date.weekday() < 5 else 0.6
            
            predictions.append({
                "date": prediction_date.isoformat(),
                "predicted_score": base_score,
                "confidence": 0.5,
                "day_of_week": prediction_date.strftime('%A'),
                "factors": ["baseline_prediction"]
            })
        
        return {
            "predictions": predictions,
            "confidence_intervals": [{"lower": 0.4, "upper": 0.8} for _ in predictions],
            "trend_analysis": {"trend": "stable", "confidence": 0.5},
            "model_accuracy": 0.0,
            "recommendation": "Collect more data for better predictions",
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _generate_baseline_task_forecast(self, days_ahead: int) -> Dict[str, Any]:
        """Generate baseline task completion forecast"""
        daily_forecasts = []
        
        for day in range(1, days_ahead + 1):
            forecast_date = datetime.now() + timedelta(days=day)
            
            # Simple baseline: fewer tasks on weekends
            estimated_tasks = 5 if forecast_date.weekday() < 5 else 2
            completion_rate = 0.8 if forecast_date.weekday() < 5 else 0.6
            
            daily_forecasts.append({
                "date": forecast_date.isoformat(),
                "estimated_completions": int(estimated_tasks * completion_rate),
                "completion_probability": completion_rate,
                "estimated_task_volume": estimated_tasks,
                "day_type": "weekday" if forecast_date.weekday() < 5 else "weekend",
                "confidence": 0.5
            })
        
        return {
            "daily_forecasts": daily_forecasts,
            "pattern_analysis": {"pattern": "baseline", "confidence": 0.5},
            "bottleneck_predictions": [],
            "optimization_suggestions": ["Collect more task data for better forecasting"],
            "model_accuracy": 0.0,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _generate_baseline_energy_predictions(self, prediction_days: int) -> Dict[str, Any]:
        """Generate baseline energy level predictions"""
        energy_predictions = []
        
        for day in range(1, prediction_days + 1):
            prediction_date = datetime.now() + timedelta(days=day)
            daily_energy = []
            
            # Simple baseline energy pattern
            for hour in range(24):
                if 6 <= hour <= 10:  # Morning peak
                    energy = 0.8
                elif 11 <= hour <= 15:  # Afternoon moderate
                    energy = 0.7
                elif 16 <= hour <= 19:  # Evening moderate
                    energy = 0.6
                else:  # Night/early morning low
                    energy = 0.3
                
                daily_energy.append({
                    "hour": hour,
                    "predicted_energy": energy,
                    "optimal_for_deep_work": energy > 0.7,
                    "optimal_for_routine_tasks": 0.4 <= energy <= 0.7,
                    "rest_recommended": energy < 0.4
                })
            
            energy_predictions.append({
                "date": prediction_date.isoformat(),
                "day_of_week": prediction_date.strftime('%A'),
                "hourly_predictions": daily_energy,
                "optimal_periods": [{"start": 6, "end": 10, "type": "deep_work"}],
                "daily_energy_score": 0.6,
                "peak_energy_hours": [7, 8, 9]
            })
        
        return {
            "energy_predictions": energy_predictions,
            "scheduling_recommendations": ["Schedule important work in the morning"],
            "weekly_energy_pattern": {"pattern": "baseline", "confidence": 0.5},
            "model_accuracy": 0.0,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    # Analysis and recommendation methods
    def _calculate_prediction_confidence(self, features: List[float], 
                                       historical_data: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for predictions"""
        if not self.is_trained or len(historical_data) < 7:
            return 0.5
        
        # Base confidence on model accuracy and data recency
        model_confidence = self.model_accuracy.get('productivity', 0.5)
        data_recency = min(1.0, len(historical_data) / 30.0)  # More data = higher confidence
        
        return (model_confidence + data_recency) / 2
    
    def _identify_prediction_factors(self, features: List[float]) -> List[str]:
        """Identify key factors influencing the prediction"""
        factors = []
        
        if len(features) >= 6:
            day_of_week = int(features[0])
            if day_of_week >= 5:  # Weekend
                factors.append("weekend_effect")
            
            if features[1] > 5:  # High task volume
                factors.append("high_task_volume")
            
            if features[2] > 4:  # High focus time
                factors.append("high_focus_time")
            
            if features[3] > 3:  # High interruptions
                factors.append("high_interruptions")
        
        return factors if factors else ["general_patterns"]
    
    def _analyze_productivity_trend(self, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze productivity trend from predictions"""
        if len(predictions) < 3:
            return {"trend": "insufficient_data", "confidence": 0.0}
        
        scores = [p["predicted_score"] for p in predictions]
        
        # Simple trend analysis
        if scores[-1] > scores[0] + 0.1:
            trend = "improving"
        elif scores[-1] < scores[0] - 0.1:
            trend = "declining"
        else:
            trend = "stable"
        
        # Calculate trend confidence
        variance = sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)
        confidence = max(0.5, 1.0 - variance)
        
        return {
            "trend": trend,
            "confidence": float(confidence),
            "average_score": float(sum(scores) / len(scores)),
            "score_range": {"min": float(min(scores)), "max": float(max(scores))}
        }
    
    def _generate_productivity_recommendations(self, predictions: List[Dict[str, Any]]) -> List[str]:
        """Generate productivity recommendations based on predictions"""
        recommendations = []
        
        if not predictions:
            return ["Collect more data for personalized recommendations"]
        
        avg_score = sum(p["predicted_score"] for p in predictions) / len(predictions)
        
        if avg_score < 0.6:
            recommendations.append("Focus on reducing interruptions and improving focus time")
            recommendations.append("Consider adjusting your schedule to align with peak energy periods")
        
        weekend_scores = [p["predicted_score"] for p in predictions if "Saturday" in p["day_of_week"] or "Sunday" in p["day_of_week"]]
        if weekend_scores and sum(weekend_scores) / len(weekend_scores) < 0.5:
            recommendations.append("Plan lighter workloads for weekends to maintain work-life balance")
        
        if not recommendations:
            recommendations.append("Maintain current productivity patterns - they look good!")
        
        return recommendations
    
    def _predict_daily_completion_rate(self, forecast_date: datetime,
                                     completion_data: List[Dict[str, Any]]) -> float:
        """Predict task completion rate for a specific day"""
        try:
            day_of_week = forecast_date.weekday()
            
            # Simple baseline: weekdays have higher completion rates
            if day_of_week < 5:  # Weekday
                return 0.8
            else:  # Weekend
                return 0.6
        except (AttributeError, TypeError):
            return 0.7  # Default completion rate
    
    def _estimate_task_volume(self, forecast_date: datetime,
                            completion_data: List[Dict[str, Any]]) -> float:
        """Estimate number of tasks for a specific day"""
        try:
            day_of_week = forecast_date.weekday()
            
            # Simple baseline: more tasks on weekdays
            if day_of_week < 5:  # Weekday
                return 6.0
            else:  # Weekend
                return 3.0
        except (AttributeError, TypeError):
            return 5.0  # Default task volume
    
    def _classify_day_type(self, date: datetime) -> str:
        """Classify day type for task forecasting"""
        try:
            if date.weekday() < 5:
                return "weekday"
            else:
                return "weekend"
        except (AttributeError, TypeError):
            return "unknown"
    
    def _calculate_task_forecast_confidence(self, completion_data: List[Dict[str, Any]]) -> float:
        """Calculate confidence for task completion forecasts"""
        if len(completion_data) < 10:
            return 0.5
        
        # Base confidence on data volume and model accuracy
        data_confidence = min(1.0, len(completion_data) / 50.0)
        model_confidence = self.model_accuracy.get('task_completion', 0.5)
        
        return (data_confidence + model_confidence) / 2
    
    def _analyze_completion_patterns(self, daily_forecasts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns in task completion forecasts"""
        if not daily_forecasts:
            return {"pattern": "no_data"}
        
        weekday_completions = [f.get("estimated_completions", 0) for f in daily_forecasts if isinstance(f.get("estimated_completions"), (int, float)) and f.get("day_type") == "weekday"]
        weekend_completions = [f.get("estimated_completions", 0) for f in daily_forecasts if isinstance(f.get("estimated_completions"), (int, float)) and f.get("day_type") == "weekend"]
        
        # Safe calculation of max value for peak days
        completion_values = [f.get("estimated_completions", 0) for f in daily_forecasts if isinstance(f.get("estimated_completions"), (int, float))]
        max_completions = max(completion_values) if completion_values else 0
        
        analysis = {
            "weekday_average": float(sum(weekday_completions) / len(weekday_completions)) if weekday_completions else 0,
            "weekend_average": float(sum(weekend_completions) / len(weekend_completions)) if weekend_completions else 0,
            "total_estimated": sum(f.get("estimated_completions", 0) for f in daily_forecasts if isinstance(f.get("estimated_completions"), (int, float))),
            "peak_days": [f["date"] for f in daily_forecasts if isinstance(f.get("estimated_completions"), (int, float)) and f["estimated_completions"] == max_completions]
        }
        
        return analysis
    
    def _predict_bottlenecks(self, daily_forecasts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predict potential bottlenecks in task completion"""
        bottlenecks = []
        
        for forecast in daily_forecasts:
            if forecast["estimated_task_volume"] > forecast["estimated_completions"] * 1.5:
                bottlenecks.append({
                    "date": forecast["date"],
                    "type": "high_volume",
                    "severity": "medium",
                    "description": "High task volume may cause completion delays"
                })
            
            if forecast["completion_probability"] < 0.6:
                bottlenecks.append({
                    "date": forecast["date"],
                    "type": "low_completion_rate",
                    "severity": "high",
                    "description": "Low completion probability indicates potential bottleneck"
                })
        
        return bottlenecks
    
    def _suggest_task_optimizations(self, daily_forecasts: List[Dict[str, Any]]) -> List[str]:
        """Suggest task optimization strategies"""
        suggestions = []
        
        completion_probs = [f.get("completion_probability", 0) for f in daily_forecasts if isinstance(f.get("completion_probability"), (int, float))]
        avg_completion_rate = sum(completion_probs) / len(completion_probs) if completion_probs else 0.7
        
        if avg_completion_rate < 0.7:
            suggestions.append("Consider breaking large tasks into smaller, manageable chunks")
            suggestions.append("Prioritize high-impact tasks during peak energy periods")
        
        high_volume_days = [f for f in daily_forecasts if f["estimated_task_volume"] > 8]
        if high_volume_days:
            suggestions.append("Redistribute tasks from high-volume days to maintain balance")
        
        if not suggestions:
            suggestions.append("Current task distribution looks well-balanced")
        
        return suggestions
    
    def _identify_optimal_periods(self, daily_energy: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify optimal work periods from hourly energy predictions"""
        optimal_periods = []
        current_period: Optional[Dict[str, Any]] = None
        
        for hour_data in daily_energy:
            if hour_data["optimal_for_deep_work"]:
                if current_period is None:
                    current_period = {"start": hour_data["hour"], "type": "deep_work"}
                current_period["end"] = hour_data["hour"]
            else:
                if current_period is not None:
                    optimal_periods.append(current_period)
                    current_period = None
        
        # Close any open period
        if current_period is not None:
            optimal_periods.append(current_period)
        
        return optimal_periods
    
    def _generate_scheduling_recommendations(self, energy_predictions: List[Dict[str, Any]]) -> List[str]:
        """Generate scheduling recommendations based on energy predictions"""
        recommendations = []
        
        # Find most common peak hours across all days
        all_peak_hours = []
        for day in energy_predictions:
            all_peak_hours.extend(day["peak_energy_hours"])
        
        if all_peak_hours:
            most_common_peak = max(set(all_peak_hours), key=all_peak_hours.count)
            recommendations.append(f"Schedule your most important work around {most_common_peak}:00")
        
        # Analyze daily energy scores
        daily_scores = [day["daily_energy_score"] for day in energy_predictions]
        avg_energy = sum(daily_scores) / len(daily_scores)
        
        if avg_energy < 0.6:
            recommendations.append("Consider adjusting sleep schedule or adding energy-boosting activities")
        
        # Find best days for intensive work
        best_days = [day for day in energy_predictions if day["daily_energy_score"] > 0.7]
        if best_days:
            best_day_names = [day["day_of_week"] for day in best_days]
            recommendations.append(f"Plan intensive work for {', '.join(set(best_day_names))}")
        
        return recommendations if recommendations else ["Maintain current energy management strategies"]
    
    def _analyze_weekly_energy_pattern(self, energy_predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze weekly energy patterns"""
        if not energy_predictions:
            return {"pattern": "no_data"}
        
        daily_averages = {}
        for day in energy_predictions:
            day_name = day["day_of_week"]
            if day_name not in daily_averages:
                daily_averages[day_name] = []
            daily_averages[day_name].append(day["daily_energy_score"])
        
        # Calculate averages for each day of week
        weekly_pattern = {}
        for day_name, scores in daily_averages.items():
            weekly_pattern[day_name] = sum(scores) / len(scores)
        
        # Find best and worst days
        best_day = "Unknown"
        worst_day = "Unknown"
        if weekly_pattern:
            max_score = max(weekly_pattern.values())
            min_score = min(weekly_pattern.values())
            for day, score in weekly_pattern.items():
                if score == max_score:
                    best_day = day
                if score == min_score:
                    worst_day = day
        
        return {
            "daily_averages": weekly_pattern,
            "best_energy_day": best_day,
            "worst_energy_day": worst_day,
            "weekly_variance": self._calculate_variance(list(weekly_pattern.values())),
            "pattern_strength": "strong" if self._calculate_variance(list(weekly_pattern.values())) > 0.1 else "weak"
        }
    
    def _combine_predictions(self, productivity_predictions: Dict[str, Any],
                           task_forecasts: Dict[str, Any],
                           energy_predictions: Dict[str, Any]) -> Dict[str, Any]:
        """Combine insights from all prediction models"""
        key_insights = []
        risk_factors = []
        opportunities = []
        
        combined = {
            "overall_outlook": "positive",
            "key_insights": key_insights,
            "risk_factors": risk_factors,
            "opportunities": opportunities
        }
        
        # Analyze productivity trend
        if productivity_predictions.get("trend_analysis", {}).get("trend") == "improving":
            key_insights.append("Productivity is trending upward")
            combined["overall_outlook"] = "positive"
        elif productivity_predictions.get("trend_analysis", {}).get("trend") == "declining":
            key_insights.append("Productivity shows declining trend")
            risk_factors.append("Declining productivity requires attention")
        
        # Analyze task completion patterns
        task_analysis = task_forecasts.get("pattern_analysis", {})
        if task_analysis.get("weekday_average", 0) > task_analysis.get("weekend_average", 0) * 1.5:
            key_insights.append("Strong weekday vs weekend productivity difference")
        
        # Analyze energy patterns
        energy_analysis = energy_predictions.get("weekly_energy_pattern", {})
        if energy_analysis.get("pattern_strength") == "strong":
            opportunities.append("Strong energy patterns enable optimized scheduling")
        
        return combined
    
    def _generate_comprehensive_recommendations(self, productivity_predictions: Dict[str, Any],
                                              task_forecasts: Dict[str, Any],
                                              energy_predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive actionable recommendations"""
        recommendations = []
        
        # Productivity recommendations
        prod_recs = productivity_predictions.get("recommendation", "")
        if prod_recs and prod_recs != "Collect more data for better predictions":
            recommendations.append({
                "category": "productivity",
                "priority": "high",
                "action": prod_recs,
                "expected_impact": "Improve overall productivity scores"
            })
        
        # Task management recommendations
        task_suggestions = task_forecasts.get("optimization_suggestions", [])
        for suggestion in task_suggestions[:2]:  # Take top 2
            if "well-balanced" not in suggestion:
                recommendations.append({
                    "category": "task_management",
                    "priority": "medium",
                    "action": suggestion,
                    "expected_impact": "Better task completion rates"
                })
        
        # Energy management recommendations
        energy_recs = energy_predictions.get("scheduling_recommendations", [])
        for rec in energy_recs[:2]:  # Take top 2
            if "current" not in rec.lower():
                recommendations.append({
                    "category": "energy_management",
                    "priority": "medium",
                    "action": rec,
                    "expected_impact": "Optimized energy utilization"
                })
        
        # Add default recommendation if none generated
        if not recommendations:
            recommendations.append({
                "category": "general",
                "priority": "low",
                "action": "Continue current practices and collect more data for personalized insights",
                "expected_impact": "Improved prediction accuracy over time"
            })
        
        return recommendations
    
    def _calculate_overall_confidence(self) -> float:
        """Calculate overall confidence score across all models"""
        if not self.model_accuracy:
            return 0.5
        
        accuracies = list(self.model_accuracy.values())
        return sum(accuracies) / len(accuracies) if accuracies else 0.5
    
    def _calculate_variance(self, values: List[float]) -> float:
        """Calculate variance of a list of values"""
        if len(values) < 2:
            return 0.0
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        return variance
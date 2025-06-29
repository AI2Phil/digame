"""
Advanced Analytics Service with ML-based Predictions and Anomaly Detection
Provides intelligent insights, behavioral analysis, and predictive modeling
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
import json
from sqlalchemy.orm import Session
from sqlalchemy import text

# ML libraries (optional dependencies)
try:
    from sklearn.ensemble import IsolationForest, RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import DBSCAN
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

logger = logging.getLogger(__name__)


class AnalyticsType(Enum):
    USER_BEHAVIOR = "user_behavior"
    PLATFORM_USAGE = "platform_usage"
    REVENUE_PREDICTION = "revenue_prediction"
    CHURN_PREDICTION = "churn_prediction"
    ANOMALY_DETECTION = "anomaly_detection"
    GROWTH_FORECASTING = "growth_forecasting"


@dataclass
class AnalyticsResult:
    """Analytics result container"""
    analytics_type: AnalyticsType
    timestamp: datetime
    data: Dict[str, Any]
    confidence: float
    insights: List[str]
    recommendations: List[str]


@dataclass
class AnomalyDetection:
    """Anomaly detection result"""
    timestamp: datetime
    metric_name: str
    value: float
    expected_range: Tuple[float, float]
    anomaly_score: float
    severity: str  # low, medium, high, critical
    description: str


@dataclass
class PredictionResult:
    """Prediction result container"""
    metric: str
    predicted_value: float
    confidence_interval: Tuple[float, float]
    prediction_date: datetime
    model_accuracy: float
    factors: List[Dict[str, Any]]


class AdvancedAnalyticsService:
    """
    Advanced analytics service with ML capabilities
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.anomaly_detectors: Dict[str, IsolationForest] = {}
        self.ml_available = ML_AVAILABLE
        
        if not self.ml_available:
            logger.warning("ML libraries not available. Some features will be limited.")
    
    async def analyze_user_behavior(self, user_id: Optional[int] = None, days: int = 30) -> AnalyticsResult:
        """Analyze user behavior patterns"""
        try:
            # Get user activity data
            query = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as activity_count,
                COUNT(DISTINCT user_id) as unique_users,
                AVG(EXTRACT(HOUR FROM created_at)) as avg_hour
            FROM security_events 
            WHERE created_at >= NOW() - INTERVAL %s DAY
            """
            
            if user_id:
                query += " AND user_id = %s"
                params = (days, user_id)
            else:
                params = (days,)
            
            query += " GROUP BY DATE(created_at) ORDER BY date"
            
            result = self.db.execute(text(query), params).fetchall()
            
            if not result:
                return AnalyticsResult(
                    analytics_type=AnalyticsType.USER_BEHAVIOR,
                    timestamp=datetime.utcnow(),
                    data={"message": "No data available"},
                    confidence=0.0,
                    insights=["Insufficient data for analysis"],
                    recommendations=["Increase user engagement"]
                )
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(result, columns=['date', 'activity_count', 'unique_users', 'avg_hour'])
            
            # Basic statistics
            stats = {
                "total_activities": int(df['activity_count'].sum()),
                "avg_daily_activities": float(df['activity_count'].mean()),
                "peak_activity_day": str(df.loc[df['activity_count'].idxmax(), 'date']),
                "avg_activity_hour": float(df['avg_hour'].mean()),
                "activity_trend": self._calculate_trend(df['activity_count'].tolist())
            }
            
            # Generate insights
            insights = []
            recommendations = []
            
            if stats["activity_trend"] > 0.1:
                insights.append("User activity is increasing")
                recommendations.append("Maintain current engagement strategies")
            elif stats["activity_trend"] < -0.1:
                insights.append("User activity is declining")
                recommendations.append("Implement re-engagement campaigns")
            
            if stats["avg_activity_hour"] < 9:
                insights.append("Users are most active in early morning")
            elif stats["avg_activity_hour"] > 17:
                insights.append("Users are most active in evening")
            
            # ML-based clustering if available
            if self.ml_available and len(df) > 5:
                features = df[['activity_count', 'unique_users', 'avg_hour']].values
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(features)
                
                clustering = DBSCAN(eps=0.5, min_samples=2)
                clusters = clustering.fit_predict(scaled_features)
                
                stats["behavior_clusters"] = len(set(clusters)) - (1 if -1 in clusters else 0)
                
                if stats["behavior_clusters"] > 1:
                    insights.append(f"Identified {stats['behavior_clusters']} distinct behavior patterns")
            
            return AnalyticsResult(
                analytics_type=AnalyticsType.USER_BEHAVIOR,
                timestamp=datetime.utcnow(),
                data=stats,
                confidence=0.8 if len(df) > 10 else 0.5,
                insights=insights,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"User behavior analysis error: {e}")
            return AnalyticsResult(
                analytics_type=AnalyticsType.USER_BEHAVIOR,
                timestamp=datetime.utcnow(),
                data={"error": str(e)},
                confidence=0.0,
                insights=["Analysis failed"],
                recommendations=["Check data quality"]
            )
    
    async def predict_revenue(self, days_ahead: int = 30) -> PredictionResult:
        """Predict revenue using ML models"""
        try:
            if not self.ml_available:
                raise ValueError("ML libraries not available for revenue prediction")
            
            # Get historical revenue data (simulated for now)
            query = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) * 10 as daily_revenue  -- Simulated revenue
            FROM users 
            WHERE created_at >= NOW() - INTERVAL 90 DAY
            GROUP BY DATE(created_at)
            ORDER BY date
            """
            
            result = self.db.execute(text(query)).fetchall()
            
            if len(result) < 30:
                raise ValueError("Insufficient historical data for prediction")
            
            df = pd.DataFrame(result, columns=['date', 'daily_revenue'])
            df['date'] = pd.to_datetime(df['date'])
            df['day_of_week'] = df['date'].dt.dayofweek
            df['day_of_month'] = df['date'].dt.day
            df['month'] = df['date'].dt.month
            
            # Prepare features
            features = ['day_of_week', 'day_of_month', 'month']
            X = df[features].values
            y = df['daily_revenue'].values
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X, y)
            
            # Make prediction
            future_date = datetime.utcnow() + timedelta(days=days_ahead)
            future_features = np.array([[
                future_date.weekday(),
                future_date.day,
                future_date.month
            ]])
            
            prediction = model.predict(future_features)[0]
            
            # Calculate confidence interval (simplified)
            predictions = []
            for estimator in model.estimators_:
                pred = estimator.predict(future_features)[0]
                predictions.append(pred)
            
            std_dev = np.std(predictions)
            confidence_interval = (
                prediction - 1.96 * std_dev,
                prediction + 1.96 * std_dev
            )
            
            # Feature importance
            feature_importance = model.feature_importances_
            factors = [
                {"factor": features[i], "importance": float(feature_importance[i])}
                for i in range(len(features))
            ]
            factors.sort(key=lambda x: x["importance"], reverse=True)
            
            # Model accuracy (on training data - simplified)
            train_predictions = model.predict(X)
            accuracy = 1 - mean_absolute_error(y, train_predictions) / np.mean(y)
            
            return PredictionResult(
                metric="daily_revenue",
                predicted_value=float(prediction),
                confidence_interval=confidence_interval,
                prediction_date=future_date,
                model_accuracy=float(max(0, min(1, accuracy))),
                factors=factors
            )
            
        except Exception as e:
            logger.error(f"Revenue prediction error: {e}")
            raise
    
    async def detect_anomalies(self, metric: str = "user_activity", days: int = 30) -> List[AnomalyDetection]:
        """Detect anomalies in platform metrics"""
        try:
            if not self.ml_available:
                # Simple statistical anomaly detection
                return await self._statistical_anomaly_detection(metric, days)
            
            # Get metric data
            if metric == "user_activity":
                query = """
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as value
                FROM security_events 
                WHERE created_at >= NOW() - INTERVAL %s DAY
                GROUP BY DATE(created_at)
                ORDER BY date
                """
            else:
                # Default to user registrations
                query = """
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as value
                FROM users 
                WHERE created_at >= NOW() - INTERVAL %s DAY
                GROUP BY DATE(created_at)
                ORDER BY date
                """
            
            result = self.db.execute(text(query), (days,)).fetchall()
            
            if len(result) < 7:
                return []
            
            df = pd.DataFrame(result, columns=['date', 'value'])
            values = df['value'].values.reshape(-1, 1)
            
            # Train anomaly detector
            detector = IsolationForest(contamination=0.1, random_state=42)
            anomaly_scores = detector.fit_predict(values)
            anomaly_scores_numeric = detector.decision_function(values)
            
            anomalies = []
            for i, (is_anomaly, score) in enumerate(zip(anomaly_scores, anomaly_scores_numeric)):
                if is_anomaly == -1:  # Anomaly detected
                    value = float(df.iloc[i]['value'])
                    date = df.iloc[i]['date']
                    
                    # Calculate expected range
                    normal_values = values[anomaly_scores == 1]
                    if len(normal_values) > 0:
                        mean_val = np.mean(normal_values)
                        std_val = np.std(normal_values)
                        expected_range = (
                            float(mean_val - 2 * std_val),
                            float(mean_val + 2 * std_val)
                        )
                    else:
                        expected_range = (0.0, float(np.max(values)))
                    
                    # Determine severity
                    severity = "high" if abs(score) > 0.5 else "medium"
                    
                    anomalies.append(AnomalyDetection(
                        timestamp=pd.to_datetime(date),
                        metric_name=metric,
                        value=value,
                        expected_range=expected_range,
                        anomaly_score=float(abs(score)),
                        severity=severity,
                        description=f"Unusual {metric} value detected: {value}"
                    ))
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return []
    
    async def _statistical_anomaly_detection(self, metric: str, days: int) -> List[AnomalyDetection]:
        """Simple statistical anomaly detection without ML"""
        try:
            # Get data (simplified query)
            query = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as value
            FROM users 
            WHERE created_at >= NOW() - INTERVAL %s DAY
            GROUP BY DATE(created_at)
            ORDER BY date
            """
            
            result = self.db.execute(text(query), (days,)).fetchall()
            
            if len(result) < 7:
                return []
            
            values = [float(row[1]) for row in result]
            mean_val = np.mean(values)
            std_val = np.std(values)
            
            anomalies = []
            for i, (date, value) in enumerate(result):
                z_score = abs((value - mean_val) / std_val) if std_val > 0 else 0
                
                if z_score > 2:  # More than 2 standard deviations
                    severity = "critical" if z_score > 3 else "high" if z_score > 2.5 else "medium"
                    
                    anomalies.append(AnomalyDetection(
                        timestamp=pd.to_datetime(date),
                        metric_name=metric,
                        value=float(value),
                        expected_range=(mean_val - 2*std_val, mean_val + 2*std_val),
                        anomaly_score=z_score,
                        severity=severity,
                        description=f"Statistical anomaly in {metric}: {value} (z-score: {z_score:.2f})"
                    ))
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Statistical anomaly detection error: {e}")
            return []
    
    async def predict_churn(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Predict user churn probability"""
        try:
            # Get user engagement data
            query = """
            SELECT 
                u.id,
                u.created_at,
                u.last_login,
                COUNT(se.id) as activity_count,
                MAX(se.created_at) as last_activity
            FROM users u
            LEFT JOIN security_events se ON u.id = se.user_id
            WHERE u.created_at >= NOW() - INTERVAL 90 DAY
            """
            
            if user_id:
                query += " AND u.id = %s"
                params = (user_id,)
            else:
                params = ()
            
            query += " GROUP BY u.id, u.created_at, u.last_login"
            
            result = self.db.execute(text(query), params).fetchall()
            
            if not result:
                return {"error": "No user data found"}
            
            # Calculate churn indicators
            churn_predictions = []
            
            for row in result:
                user_id, created_at, last_login, activity_count, last_activity = row
                
                # Calculate days since last activity
                if last_activity:
                    days_inactive = (datetime.utcnow() - last_activity).days
                else:
                    days_inactive = (datetime.utcnow() - created_at).days
                
                # Simple churn probability calculation
                if days_inactive > 30:
                    churn_prob = min(0.9, 0.3 + (days_inactive - 30) * 0.02)
                elif days_inactive > 14:
                    churn_prob = 0.1 + (days_inactive - 14) * 0.01
                else:
                    churn_prob = max(0.05, 0.1 - activity_count * 0.01)
                
                risk_level = "high" if churn_prob > 0.7 else "medium" if churn_prob > 0.4 else "low"
                
                churn_predictions.append({
                    "user_id": user_id,
                    "churn_probability": round(churn_prob, 3),
                    "risk_level": risk_level,
                    "days_inactive": days_inactive,
                    "activity_count": activity_count,
                    "factors": [
                        f"Inactive for {days_inactive} days",
                        f"Activity count: {activity_count}"
                    ]
                })
            
            return {
                "predictions": churn_predictions,
                "summary": {
                    "total_users": len(churn_predictions),
                    "high_risk": len([p for p in churn_predictions if p["risk_level"] == "high"]),
                    "medium_risk": len([p for p in churn_predictions if p["risk_level"] == "medium"]),
                    "low_risk": len([p for p in churn_predictions if p["risk_level"] == "low"])
                }
            }
            
        except Exception as e:
            logger.error(f"Churn prediction error: {e}")
            return {"error": str(e)}
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend direction (-1 to 1)"""
        if len(values) < 2:
            return 0.0
        
        # Simple linear trend calculation
        x = np.arange(len(values))
        y = np.array(values)
        
        if np.std(x) == 0:
            return 0.0
        
        correlation = np.corrcoef(x, y)[0, 1]
        return correlation if not np.isnan(correlation) else 0.0
    
    async def generate_insights_report(self, days: int = 30) -> Dict[str, Any]:
        """Generate comprehensive insights report"""
        try:
            # Gather all analytics
            user_behavior = await self.analyze_user_behavior(days=days)
            anomalies = await self.detect_anomalies(days=days)
            churn_analysis = await self.predict_churn()
            
            # Try revenue prediction
            revenue_prediction = None
            try:
                revenue_prediction = await self.predict_revenue(days_ahead=30)
            except Exception as e:
                logger.warning(f"Revenue prediction failed: {e}")
            
            # Compile insights
            all_insights = user_behavior.insights.copy()
            all_recommendations = user_behavior.recommendations.copy()
            
            if anomalies:
                all_insights.append(f"Detected {len(anomalies)} anomalies in platform metrics")
                all_recommendations.append("Investigate anomalous patterns")
            
            if churn_analysis.get("summary"):
                high_risk = churn_analysis["summary"]["high_risk"]
                if high_risk > 0:
                    all_insights.append(f"{high_risk} users at high risk of churn")
                    all_recommendations.append("Implement retention strategies for high-risk users")
            
            return {
                "report_date": datetime.utcnow().isoformat(),
                "period_days": days,
                "user_behavior": user_behavior.data,
                "anomalies": [
                    {
                        "metric": a.metric_name,
                        "value": a.value,
                        "severity": a.severity,
                        "description": a.description
                    }
                    for a in anomalies
                ],
                "churn_analysis": churn_analysis,
                "revenue_prediction": {
                    "predicted_value": revenue_prediction.predicted_value,
                    "confidence_interval": revenue_prediction.confidence_interval,
                    "model_accuracy": revenue_prediction.model_accuracy
                } if revenue_prediction else None,
                "key_insights": all_insights,
                "recommendations": all_recommendations,
                "ml_enabled": self.ml_available
            }
            
        except Exception as e:
            logger.error(f"Insights report generation error: {e}")
            return {
                "error": str(e),
                "report_date": datetime.utcnow().isoformat()
            }
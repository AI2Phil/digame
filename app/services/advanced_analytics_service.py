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
        # Safe initialization with getattr fallbacks
        if ML_AVAILABLE:
            try:
                self.scalers: Dict[str, Any] = {}  # type: ignore
                self.anomaly_detectors: Dict[str, Any] = {}  # type: ignore
            except Exception:
                self.scalers = {}
                self.anomaly_detectors = {}
        else:
            self.scalers = {}
            self.anomaly_detectors = {}
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
            
            try:
                result = self.db.execute(text(query), params).fetchall()  # type: ignore
            except Exception as e:
                logger.error(f"Database query error: {e}")
                result = []
            
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
            try:
                df = pd.DataFrame(result, columns=['date', 'activity_count', 'unique_users', 'avg_hour'])  # type: ignore
            except Exception:
                df = pd.DataFrame(result)  # type: ignore
            
            # Basic statistics with safe access
            activity_counts = getattr(df, 'activity_count', pd.Series([0]))
            avg_hours = getattr(df, 'avg_hour', pd.Series([12]))
            
            # Safe peak day calculation
            try:
                peak_idx = activity_counts.idxmax() if len(activity_counts) > 0 else 0
                try:
                    peak_idx_int = int(peak_idx) if isinstance(peak_idx, (int, float)) else 0
                    peak_day = str(getattr(df.iloc[peak_idx_int], 'date', 'N/A')) if len(df) > peak_idx_int else 'N/A'
                except Exception:
                    peak_day = 'N/A'
            except Exception:
                peak_day = 'N/A'
            
            stats = {
                "total_activities": int(activity_counts.sum() if len(activity_counts) > 0 else 0),
                "avg_daily_activities": float(activity_counts.mean() if len(activity_counts) > 0 else 0),
                "peak_activity_day": peak_day,
                "avg_activity_hour": float(avg_hours.mean() if len(avg_hours) > 0 else 12),
                "activity_trend": float(self._calculate_trend(activity_counts.tolist() if len(activity_counts) > 0 else []))
            }
            
            # Generate insights
            insights = []
            recommendations = []
            
            activity_trend = float(stats.get("activity_trend", 0))
            avg_hour = float(stats.get("avg_activity_hour", 12))
            
            if activity_trend > 0.1:
                insights.append("User activity is increasing")
                recommendations.append("Maintain current engagement strategies")
            elif activity_trend < -0.1:
                insights.append("User activity is declining")
                recommendations.append("Implement re-engagement campaigns")
            
            if avg_hour < 9:
                insights.append("Users are most active in early morning")
            elif avg_hour > 17:
                insights.append("Users are most active in evening")
            
            # ML-based clustering if available
            if self.ml_available and len(df) > 5:
                try:
                    features = df[['activity_count', 'unique_users', 'avg_hour']].values
                    scaler_class = getattr(__import__('sklearn.preprocessing', fromlist=['StandardScaler']), 'StandardScaler', None)
                    dbscan_class = getattr(__import__('sklearn.cluster', fromlist=['DBSCAN']), 'DBSCAN', None)
                    
                    if scaler_class and dbscan_class:
                        scaler = scaler_class()  # type: ignore
                        scaled_features = scaler.fit_transform(features)  # type: ignore
                        
                        clustering = dbscan_class(eps=0.5, min_samples=2)  # type: ignore
                        clusters = clustering.fit_predict(scaled_features)  # type: ignore
                        
                        cluster_count = len(set(clusters)) - (1 if -1 in clusters else 0)
                        stats["behavior_clusters"] = cluster_count
                        
                        if cluster_count > 1:
                            insights.append(f"Identified {cluster_count} distinct behavior patterns")
                except Exception as e:
                    logger.warning(f"Clustering analysis failed: {e}")
            
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
            
            try:
                result = self.db.execute(text(query)).fetchall()  # type: ignore
            except Exception as e:
                logger.error(f"Database query error: {e}")
                result = []
            
            if len(result) < 30:
                raise ValueError("Insufficient historical data for prediction")
            
            try:
                df = pd.DataFrame(result, columns=['date', 'daily_revenue'])  # type: ignore
            except Exception:
                df = pd.DataFrame(result)  # type: ignore
            df['date'] = pd.to_datetime(df['date'])
            df['day_of_week'] = df['date'].dt.dayofweek
            df['day_of_month'] = df['date'].dt.day
            df['month'] = df['date'].dt.month
            
            # Prepare features
            features = ['day_of_week', 'day_of_month', 'month']
            X = df[features].values
            y = df['daily_revenue'].values
            
            # Train model with safe import
            try:
                rf_class = getattr(__import__('sklearn.ensemble', fromlist=['RandomForestRegressor']), 'RandomForestRegressor', None)
                if not rf_class:
                    raise ValueError("RandomForestRegressor not available")
                model = rf_class(n_estimators=100, random_state=42)  # type: ignore
                model.fit(X, y)  # type: ignore
            except Exception as e:
                logger.error(f"Model training error: {e}")
                raise
            
            # Make prediction
            future_date = datetime.utcnow() + timedelta(days=days_ahead)
            future_features = np.array([[
                future_date.weekday(),
                future_date.day,
                future_date.month
            ]])
            
            prediction_result = model.predict(future_features)  # type: ignore
            prediction = float(prediction_result[0]) if len(prediction_result) > 0 else 0.0
            
            # Calculate confidence interval (simplified)
            predictions = []
            try:
                estimators = getattr(model, 'estimators_', [])
                for estimator in estimators:
                    pred_result = estimator.predict(future_features)  # type: ignore
                    pred = float(pred_result[0]) if len(pred_result) > 0 else 0.0
                    predictions.append(pred)
            except Exception:
                predictions = [prediction]
            
            std_dev = float(np.std(predictions)) if len(predictions) > 1 else 0.0
            confidence_interval = (
                prediction - 1.96 * std_dev,
                prediction + 1.96 * std_dev
            )
            
            # Feature importance with safe access
            try:
                feature_importance = getattr(model, 'feature_importances_', [])
                factors = [
                    {"factor": features[i], "importance": float(feature_importance[i])}
                    for i in range(min(len(features), len(feature_importance)))
                ]
                factors.sort(key=lambda x: x.get("importance", 0), reverse=True)
            except Exception:
                factors = [{"factor": f, "importance": 0.0} for f in features]
            
            # Model accuracy (on training data - simplified)
            try:
                train_predictions = model.predict(X)  # type: ignore
                mae_func = getattr(__import__('sklearn.metrics', fromlist=['mean_absolute_error']), 'mean_absolute_error', None)
                if mae_func and len(train_predictions) > 0:
                    mae = mae_func(y, train_predictions)  # type: ignore
                    mean_y = float(np.mean(y)) if len(y) > 0 else 1.0
                    accuracy = 1 - mae / mean_y if mean_y > 0 else 0.0
                else:
                    accuracy = 0.5
            except Exception:
                accuracy = 0.5
            
            return PredictionResult(
                metric="daily_revenue",
                predicted_value=float(prediction),
                confidence_interval=confidence_interval,
                prediction_date=future_date,
                model_accuracy=float(max(0.0, min(1.0, accuracy))),
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
            
            try:
                result = self.db.execute(text(query), (days,)).fetchall()  # type: ignore
            except Exception as e:
                logger.error(f"Database query error: {e}")
                result = []
            
            if len(result) < 7:
                return []
            
            try:
                df = pd.DataFrame(result, columns=['date', 'value'])  # type: ignore
                values_array = df['value'].values
                values = getattr(values_array, 'reshape', lambda *args: values_array)(-1, 1)  # type: ignore
            except Exception:
                df = pd.DataFrame(result)  # type: ignore
                values = [[float(row[1])] for row in result]  # type: ignore
            
            # Train anomaly detector with safe import
            try:
                if_class = getattr(__import__('sklearn.ensemble', fromlist=['IsolationForest']), 'IsolationForest', None)
                if not if_class:
                    raise ValueError("IsolationForest not available")
                detector = if_class(contamination=0.1, random_state=42)  # type: ignore
                anomaly_scores = detector.fit_predict(values)  # type: ignore
                anomaly_scores_numeric = detector.decision_function(values)  # type: ignore
            except Exception as e:
                logger.error(f"Anomaly detection error: {e}")
                return []
            
            anomalies = []
            for i, (is_anomaly, score) in enumerate(zip(anomaly_scores, anomaly_scores_numeric)):
                if is_anomaly == -1:  # Anomaly detected
                    try:
                        row_data = df.iloc[i] if i < len(df) else None
                        if row_data is not None:
                            value = float(getattr(row_data, 'value', 0))
                            date = getattr(row_data, 'date', datetime.utcnow().date())
                        else:
                            continue
                    except Exception:
                        continue
                    
                    # Calculate expected range
                    normal_values = values[anomaly_scores == 1]
                    if len(normal_values) > 0:
                        try:
                            mean_val = float(np.mean(normal_values))  # type: ignore
                            std_val = float(np.std(normal_values))  # type: ignore
                        except Exception:
                            mean_val = 0.0
                            std_val = 1.0
                        expected_range = (
                            float(mean_val - 2 * std_val),
                            float(mean_val + 2 * std_val)
                        )
                    else:
                        try:
                            max_val = float(np.max(values))  # type: ignore
                        except Exception:
                            max_val = 100.0
                        expected_range = (0.0, max_val)
                    
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
            
            try:
                result = self.db.execute(text(query), (days,)).fetchall()  # type: ignore
            except Exception as e:
                logger.error(f"Database query error: {e}")
                result = []
            
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
                        expected_range=(float(mean_val - 2*std_val), float(mean_val + 2*std_val)),
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
            
            try:
                result = self.db.execute(text(query), params).fetchall()  # type: ignore
            except Exception as e:
                logger.error(f"Database query error: {e}")
                result = []
            
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
        
        try:
            # Simple linear trend calculation
            x = np.arange(len(values))
            y = np.array(values)
            
            try:
                x_std = float(np.std(x)) if len(x) > 0 else 0.0  # type: ignore
            except Exception:
                x_std = 0.0
            if x_std == 0:
                return 0.0
            
            # Safe correlation calculation
            try:
                corr_matrix = np.corrcoef(x, y)  # type: ignore
            except Exception:
                return 0.0
            if corr_matrix.shape == (2, 2):
                correlation = float(corr_matrix[0, 1])
                return correlation if not np.isnan(correlation) else 0.0
            else:
                return 0.0
        except Exception as e:
            logger.warning(f"Trend calculation error: {e}")
            return 0.0
    
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
            
            # Safe dictionary access for churn analysis
            churn_summary = churn_analysis.get("summary", {}) if isinstance(churn_analysis, dict) else {}
            if churn_summary:
                high_risk = churn_summary.get("high_risk", 0)
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
                    "predicted_value": getattr(revenue_prediction, 'predicted_value', 0.0),
                    "confidence_interval": getattr(revenue_prediction, 'confidence_interval', (0.0, 0.0)),
                    "model_accuracy": getattr(revenue_prediction, 'model_accuracy', 0.0)
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
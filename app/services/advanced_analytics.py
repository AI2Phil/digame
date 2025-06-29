"""
Advanced Analytics Engine for Digital Twin Platform
Provides multi-dimensional analysis and insights
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import json
from dataclasses import dataclass
from enum import Enum
import statistics
import math

logger = logging.getLogger(__name__)

class AnalysisType(Enum):
    """Types of analytics that can be performed"""
    PRODUCTIVITY_ANALYSIS = "productivity_analysis"
    PATTERN_DISCOVERY = "pattern_discovery"
    TREND_ANALYSIS = "trend_analysis"
    CORRELATION_ANALYSIS = "correlation_analysis"
    ANOMALY_DETECTION = "anomaly_detection"
    PREDICTIVE_INSIGHTS = "predictive_insights"
    BEHAVIORAL_ANALYSIS = "behavioral_analysis"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"

class TimeGranularity(Enum):
    """Time granularity for analysis"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

@dataclass
class AnalysisResult:
    """Represents the result of an analytics operation"""
    analysis_type: AnalysisType
    twin_id: str
    timestamp: datetime
    insights: List[Dict[str, Any]]
    metrics: Dict[str, float]
    confidence: float
    recommendations: List[str]
    data_points: int
    time_range: Tuple[datetime, datetime]

@dataclass
class Insight:
    """Represents a single analytical insight"""
    title: str
    description: str
    impact_score: float
    confidence: float
    category: str
    actionable: bool
    data_support: Dict[str, Any]

class AdvancedAnalyticsEngine:
    """
    Advanced analytics engine providing multi-dimensional analysis
    for digital twin data and behavior patterns
    """
    
    def __init__(self):
        self.analysis_cache = {}
        self.insight_history = {}
        self.correlation_matrix = {}
        self.trend_models = {}
        self.anomaly_thresholds = {}
        self.analytics_stats = {
            "total_analyses": 0,
            "insights_generated": 0,
            "recommendations_made": 0,
            "anomalies_detected": 0
        }
    
    async def perform_comprehensive_analysis(self, twin_id: str, 
                                           data: Dict[str, Any],
                                           analysis_types: Optional[List[AnalysisType]] = None,
                                           time_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, AnalysisResult]:
        """
        Perform comprehensive analysis across multiple dimensions
        
        Args:
            twin_id: Digital twin identifier
            data: Data to analyze
            analysis_types: Specific analysis types to perform
            time_range: Time range for analysis
            
        Returns:
            Dictionary of analysis results by type
        """
        if analysis_types is None:
            analysis_types = [
                AnalysisType.PRODUCTIVITY_ANALYSIS,
                AnalysisType.PATTERN_DISCOVERY,
                AnalysisType.TREND_ANALYSIS,
                AnalysisType.CORRELATION_ANALYSIS,
                AnalysisType.ANOMALY_DETECTION,
                AnalysisType.PREDICTIVE_INSIGHTS,
                AnalysisType.BEHAVIORAL_ANALYSIS,
                AnalysisType.PERFORMANCE_OPTIMIZATION
            ]
        
        if time_range is None:
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=30)
            time_range = (start_time, end_time)
        
        logger.info(f"Starting comprehensive analysis for twin {twin_id}")
        
        results = {}
        
        for analysis_type in analysis_types:
            try:
                result = await self._perform_single_analysis(
                    twin_id, data, analysis_type, time_range
                )
                results[analysis_type.value] = result
                self.analytics_stats["total_analyses"] += 1
                
            except Exception as e:
                logger.error(f"Error in {analysis_type.value} analysis: {e}")
                continue
        
        # Generate cross-analysis insights
        cross_insights = await self._generate_cross_analysis_insights(results)
        if cross_insights:
            results["cross_analysis"] = cross_insights
        
        # Cache results
        cache_key = f"{twin_id}_{hash(str(analysis_types))}"
        self.analysis_cache[cache_key] = {
            "results": results,
            "timestamp": datetime.utcnow(),
            "ttl": 3600  # 1 hour cache
        }
        
        logger.info(f"Completed comprehensive analysis for twin {twin_id}")
        return results
    
    async def _generate_cross_analysis_insights(self, results: Dict[str, AnalysisResult]) -> Optional[AnalysisResult]:
        """Generate insights from cross-analysis of multiple result types"""
        if len(results) < 2:
            return None
        
        insights = []
        metrics = {}
        recommendations = []
        
        # Combine insights from different analyses
        all_insights = []
        for result in results.values():
            all_insights.extend(result.insights)
        
        # Find common themes
        high_impact_insights = [i for i in all_insights if i.get("impact_score", 0) > 0.7]
        actionable_insights = [i for i in all_insights if i.get("actionable", False)]
        
        if len(high_impact_insights) > 2:
            insights.append({
                "title": "Multiple High-Impact Areas Identified",
                "description": f"Found {len(high_impact_insights)} high-impact insights across different analyses",
                "impact_score": 0.8,
                "confidence": 0.9,
                "category": "summary",
                "actionable": True
            })
        
        if len(actionable_insights) > 3:
            recommendations.append("Prioritize addressing the multiple actionable insights identified")
        
        metrics["total_insights"] = len(all_insights)
        metrics["high_impact_insights"] = len(high_impact_insights)
        metrics["actionable_insights"] = len(actionable_insights)
        
        return AnalysisResult(
            analysis_type=AnalysisType.PRODUCTIVITY_ANALYSIS,  # Placeholder
            twin_id="cross_analysis",
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=sum(r.data_points for r in results.values()),
            time_range=(datetime.utcnow() - timedelta(days=30), datetime.utcnow())
        )
    
    async def _perform_single_analysis(self, twin_id: str, data: Dict[str, Any],
                                     analysis_type: AnalysisType,
                                     time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """
        Perform a single type of analysis
        
        Args:
            twin_id: Digital twin identifier
            data: Data to analyze
            analysis_type: Type of analysis to perform
            time_range: Time range for analysis
            
        Returns:
            Analysis result
        """
        analysis_methods = {
            AnalysisType.PRODUCTIVITY_ANALYSIS: self._analyze_productivity,
            AnalysisType.PATTERN_DISCOVERY: self._discover_patterns,
            AnalysisType.TREND_ANALYSIS: self._analyze_trends,
            AnalysisType.CORRELATION_ANALYSIS: self._analyze_correlations,
            AnalysisType.ANOMALY_DETECTION: self._detect_anomalies,
            AnalysisType.PREDICTIVE_INSIGHTS: self._generate_predictive_insights,
            AnalysisType.BEHAVIORAL_ANALYSIS: self._analyze_behavior,
            AnalysisType.PERFORMANCE_OPTIMIZATION: self._optimize_performance
        }
        
        method = analysis_methods.get(analysis_type)
        if not method:
            raise ValueError(f"Unknown analysis type: {analysis_type}")
        
        return await method(twin_id, data, time_range)
    
    def _extract_time_series_data(self, data: Dict[str, Any], metric: str, 
                                 time_range: Tuple[datetime, datetime]) -> List[float]:
        """Extract time series data for a specific metric"""
        events = data.get("events", [])
        values = []
        
        for event in events:
            event_time = event.get("timestamp")
            if isinstance(event_time, str):
                event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
            
            if time_range[0] <= event_time <= time_range[1]:
                value = event.get(metric)
                if value is not None:
                    values.append(float(value))
        
        return values
    
    def _extract_temporal_data(self, data: Dict[str, Any], field: str,
                              time_range: Tuple[datetime, datetime]) -> List[Dict[str, Any]]:
        """Extract temporal data with timestamps"""
        events = data.get("events", [])
        temporal_data = []
        
        for event in events:
            event_time = event.get("timestamp")
            if isinstance(event_time, str):
                event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
            
            if time_range[0] <= event_time <= time_range[1]:
                value = event.get(field)
                if value is not None:
                    temporal_data.append({
                        "timestamp": event_time,
                        "value": value
                    })
        
        return temporal_data
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend using simple linear regression"""
        if len(values) < 2:
            return 0.0
        
        n = len(values)
        x = list(range(n))
        
        # Calculate slope using least squares
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 0.0
        
        slope = numerator / denominator
        return slope / max(abs(y_mean), 0.1)  # Normalize by mean
    
    def _calculate_correlation(self, x: List[float], y: List[float]) -> float:
        """Calculate Pearson correlation coefficient"""
        if len(x) != len(y) or len(x) < 2:
            return 0.0
        
        n = len(x)
        x_mean = sum(x) / n
        y_mean = sum(y) / n
        
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        x_var = sum((x[i] - x_mean) ** 2 for i in range(n))
        y_var = sum((y[i] - y_mean) ** 2 for i in range(n))
        
        denominator = math.sqrt(x_var * y_var)
        
        if denominator == 0:
            return 0.0
        
        return numerator / denominator
    
    async def _analyze_productivity(self, twin_id: str, data: Dict[str, Any],
                                  time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Analyze productivity patterns and metrics"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Extract productivity data
        productivity_data = self._extract_time_series_data(data, "productivity_score", time_range)
        focus_data = self._extract_time_series_data(data, "focus_time", time_range)
        task_completion_data = self._extract_time_series_data(data, "task_completion_rate", time_range)
        
        if productivity_data:
            # Calculate productivity metrics
            avg_productivity = statistics.mean(productivity_data)
            productivity_trend = self._calculate_trend(productivity_data)
            productivity_variance = statistics.variance(productivity_data) if len(productivity_data) > 1 else 0
            
            metrics.update({
                "average_productivity": avg_productivity,
                "productivity_trend": productivity_trend,
                "productivity_consistency": 1.0 - min(productivity_variance, 1.0),
                "peak_productivity": max(productivity_data),
                "low_productivity": min(productivity_data)
            })
            
            # Generate productivity insights
            if avg_productivity > 0.8:
                insights.append({
                    "title": "High Productivity Performance",
                    "description": f"Maintaining excellent productivity with {avg_productivity:.1%} average score",
                    "impact_score": 0.9,
                    "confidence": 0.85,
                    "category": "performance",
                    "actionable": False
                })
            elif avg_productivity < 0.5:
                insights.append({
                    "title": "Productivity Improvement Opportunity",
                    "description": f"Current productivity at {avg_productivity:.1%} - significant improvement potential",
                    "impact_score": 0.8,
                    "confidence": 0.9,
                    "category": "improvement",
                    "actionable": True
                })
                recommendations.append("Consider implementing focused work blocks and minimizing distractions")
        
        self.analytics_stats["insights_generated"] += len(insights)
        self.analytics_stats["recommendations_made"] += len(recommendations)
        
        return AnalysisResult(
            analysis_type=AnalysisType.PRODUCTIVITY_ANALYSIS,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.85,
            recommendations=recommendations,
            data_points=len(productivity_data),
            time_range=time_range
        )
    
    async def _discover_patterns(self, twin_id: str, data: Dict[str, Any],
                               time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Discover behavioral and temporal patterns"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Extract temporal data
        activity_data = self._extract_temporal_data(data, "activity_type", time_range)
        
        # Simple pattern analysis
        if activity_data:
            # Find most common activities
            activities = [item["value"] for item in activity_data]
            activity_counts = {}
            for activity in activities:
                activity_counts[activity] = activity_counts.get(activity, 0) + 1
            
            if activity_counts:
                most_common = max(activity_counts.items(), key=lambda x: x[1])
                metrics["most_common_activity"] = most_common[0]
                metrics["activity_frequency"] = most_common[1] / len(activities)
                
                insights.append({
                    "title": "Primary Activity Pattern",
                    "description": f"Most frequent activity: {most_common[0]} ({most_common[1]/len(activities):.1%} of time)",
                    "impact_score": 0.6,
                    "confidence": 0.8,
                    "category": "pattern",
                    "actionable": True
                })
        
        self.analytics_stats["insights_generated"] += len(insights)
        
        return AnalysisResult(
            analysis_type=AnalysisType.PATTERN_DISCOVERY,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=len(activity_data),
            time_range=time_range
        )
    
    async def _analyze_trends(self, twin_id: str, data: Dict[str, Any],
                            time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Analyze trends in various metrics"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Analyze trends in key metrics
        trend_metrics = ["productivity_score", "energy_level", "focus_time"]
        
        for metric in trend_metrics:
            time_series = self._extract_time_series_data(data, metric, time_range)
            if len(time_series) >= 5:
                trend = self._calculate_trend(time_series)
                metrics[f"{metric}_trend"] = trend
                
                if abs(trend) > 0.1:
                    direction = "increasing" if trend > 0 else "decreasing"
                    insights.append({
                        "title": f"{metric.replace('_', ' ').title()} Trend",
                        "description": f"{metric.replace('_', ' ').title()} is {direction}",
                        "impact_score": abs(trend),
                        "confidence": 0.8,
                        "category": "trend",
                        "actionable": trend < 0
                    })
        
        self.analytics_stats["insights_generated"] += len(insights)
        
        return AnalysisResult(
            analysis_type=AnalysisType.TREND_ANALYSIS,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=sum(len(self._extract_time_series_data(data, m, time_range)) for m in trend_metrics),
            time_range=time_range
        )
    
    async def _analyze_correlations(self, twin_id: str, data: Dict[str, Any],
                                  time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Analyze correlations between different metrics"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Extract data for correlation analysis
        correlation_metrics = ["productivity_score", "energy_level", "focus_time"]
        metric_data = {}
        
        for metric in correlation_metrics:
            time_series = self._extract_time_series_data(data, metric, time_range)
            if len(time_series) >= 5:
                metric_data[metric] = time_series
        
        # Calculate correlations
        for i, metric1 in enumerate(metric_data.keys()):
            for metric2 in list(metric_data.keys())[i+1:]:
                correlation = self._calculate_correlation(metric_data[metric1], metric_data[metric2])
                if abs(correlation) > 0.3:
                    metrics[f"{metric1}_vs_{metric2}"] = correlation
                    
                    strength = "strong" if abs(correlation) > 0.7 else "moderate"
                    direction = "positive" if correlation > 0 else "negative"
                    
                    insights.append({
                        "title": f"{strength.title()} {direction.title()} Correlation",
                        "description": f"{metric1.replace('_', ' ').title()} and {metric2.replace('_', ' ').title()} show {strength} {direction} correlation",
                        "impact_score": abs(correlation),
                        "confidence": 0.8,
                        "category": "correlation",
                        "actionable": True
                    })
        
        self.analytics_stats["insights_generated"] += len(insights)
        
        return AnalysisResult(
            analysis_type=AnalysisType.CORRELATION_ANALYSIS,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=sum(len(data) for data in metric_data.values()),
            time_range=time_range
        )
    
    async def _detect_anomalies(self, twin_id: str, data: Dict[str, Any],
                              time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Detect anomalies in behavior and metrics"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Simple anomaly detection
        anomaly_metrics = ["productivity_score", "energy_level"]
        anomalies_found = 0
        
        for metric in anomaly_metrics:
            time_series = self._extract_time_series_data(data, metric, time_range)
            if len(time_series) >= 10:
                mean_val = statistics.mean(time_series)
                std_val = statistics.stdev(time_series) if len(time_series) > 1 else 0
                
                # Find values outside 2 standard deviations
                anomalies = [v for v in time_series if abs(v - mean_val) > 2 * std_val]
                if anomalies:
                    anomalies_found += len(anomalies)
                    metrics[f"{metric}_anomalies"] = len(anomalies)
                    
                    insights.append({
                        "title": f"Anomalies in {metric.replace('_', ' ').title()}",
                        "description": f"Found {len(anomalies)} unusual values in {metric.replace('_', ' ')}",
                        "impact_score": min(len(anomalies) / len(time_series), 1.0),
                        "confidence": 0.8,
                        "category": "anomaly",
                        "actionable": True
                    })
        
        metrics["total_anomalies"] = anomalies_found
        self.analytics_stats["anomalies_detected"] += anomalies_found
        self.analytics_stats["insights_generated"] += len(insights)
        
        return AnalysisResult(
            analysis_type=AnalysisType.ANOMALY_DETECTION,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.85,
            recommendations=recommendations,
            data_points=sum(len(self._extract_time_series_data(data, m, time_range)) for m in anomaly_metrics),
            time_range=time_range
        )
    
    async def _generate_predictive_insights(self, twin_id: str, data: Dict[str, Any],
                                          time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Generate predictive insights based on historical data"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Simple prediction based on trends
        productivity_data = self._extract_time_series_data(data, "productivity_score", time_range)
        if len(productivity_data) >= 7:
            trend = self._calculate_trend(productivity_data)
            current_avg = statistics.mean(productivity_data[-3:]) if len(productivity_data) >= 3 else statistics.mean(productivity_data)
            predicted_value = current_avg + (trend * 7)  # 7 days ahead
            
            metrics["predicted_productivity_7d"] = max(0.0, min(1.0, predicted_value))
            
            if trend > 0.05:
                insights.append({
                    "title": "Productivity Improvement Predicted",
                    "description": "Productivity is expected to continue improving",
                    "impact_score": 0.7,
                    "confidence": 0.7,
                    "category": "prediction",
                    "actionable": False
                })
            elif trend < -0.05:
                insights.append({
                    "title": "Productivity Decline Predicted",
                    "description": "Productivity may decrease - consider intervention",
                    "impact_score": 0.8,
                    "confidence": 0.7,
                    "category": "warning",
                    "actionable": True
                })
                recommendations.append("Take proactive measures to maintain productivity levels")
        
        self.analytics_stats["insights_generated"] += len(insights)
        self.analytics_stats["recommendations_made"] += len(recommendations)
        
        return AnalysisResult(
            analysis_type=AnalysisType.PREDICTIVE_INSIGHTS,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.7,
            recommendations=recommendations,
            data_points=len(productivity_data),
            time_range=time_range
        )
    
    async def _analyze_behavior(self, twin_id: str, data: Dict[str, Any],
                              time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Analyze behavioral patterns and changes"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Simple behavior analysis
        activity_data = self._extract_temporal_data(data, "activity_type", time_range)
        if activity_data:
            activities = [item["value"] for item in activity_data]
            unique_activities = len(set(activities))
            total_activities = len(activities)
            
            diversity = unique_activities / total_activities if total_activities > 0 else 0
            metrics["activity_diversity"] = diversity
            
            if diversity > 0.7:
                insights.append({
                    "title": "High Activity Diversity",
                    "description": "Engaging in a wide variety of activities",
                    "impact_score": 0.6,
                    "confidence": 0.8,
                    "category": "behavior",
                    "actionable": False
                })
            elif diversity < 0.3:
                insights.append({
                    "title": "Low Activity Diversity",
                    "description": "Limited variety in activities - consider diversification",
                    "impact_score": 0.5,
                    "confidence": 0.8,
                    "category": "improvement",
                    "actionable": True
                })
                recommendations.append("Introduce more variety in daily activities")
        
        self.analytics_stats["insights_generated"] += len(insights)
        self.analytics_stats["recommendations_made"] += len(recommendations)
        
        return AnalysisResult(
            analysis_type=AnalysisType.BEHAVIORAL_ANALYSIS,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=len(activity_data),
            time_range=time_range
        )
    
    async def _optimize_performance(self, twin_id: str, data: Dict[str, Any],
                                  time_range: Tuple[datetime, datetime]) -> AnalysisResult:
        """Optimize performance based on analysis"""
        insights = []
        metrics = {}
        recommendations = []
        
        # Performance optimization suggestions
        productivity_data = self._extract_time_series_data(data, "productivity_score", time_range)
        if productivity_data:
            avg_productivity = statistics.mean(productivity_data)
            
            if avg_productivity < 0.7:
                insights.append({
                    "title": "Performance Optimization Opportunity",
                    "description": "Multiple areas identified for performance improvement",
                    "impact_score": 0.8,
                    "confidence": 0.8,
                    "category": "optimization",
                    "actionable": True
                })
                recommendations.extend([
                    "Implement time-blocking for focused work",
                    "Reduce context switching between tasks",
                    "Establish consistent daily routines"
                ])
        
        metrics["optimization_potential"] = max(0.0, 1.0 - statistics.mean(productivity_data)) if productivity_data else 0.5
        
        self.analytics_stats["insights_generated"] += len(insights)
        self.analytics_stats["recommendations_made"] += len(recommendations)
        
        return AnalysisResult(
            analysis_type=AnalysisType.PERFORMANCE_OPTIMIZATION,
            twin_id=twin_id,
            timestamp=datetime.utcnow(),
            insights=insights,
            metrics=metrics,
            confidence=0.8,
            recommendations=recommendations,
            data_points=len(productivity_data),
            time_range=time_range
        )
    
    def get_analytics_stats(self) -> Dict[str, Any]:
        """Get analytics engine statistics"""
        return {
            **self.analytics_stats,
            "cache_size": len(self.analysis_cache),
            "correlation_matrices": len(self.correlation_matrix),
            "trend_models": len(self.trend_models)
        }
    
    def get_twin_insights_summary(self, twin_id: str) -> Dict[str, Any]:
        """Get summary of insights for a specific twin"""
        twin_insights = self.insight_history.get(twin_id, [])
        
        if not twin_insights:
            return {"total_insights": 0, "categories": {}, "recent_insights": []}
        
        categories = {}
        for insight in twin_insights:
            category = insight.get("category", "unknown")
            categories[category] = categories.get(category, 0) + 1
        
        recent_insights = sorted(twin_insights, key=lambda x: x.get("timestamp", ""), reverse=True)[:5]
        
        return {
            "total_insights": len(twin_insights),
            "categories": categories,
            "recent_insights": recent_insights,
            "avg_impact_score": statistics.mean([i.get("impact_score", 0) for i in twin_insights])
        }
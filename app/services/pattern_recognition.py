"""
Pattern Recognition Service for Digital Twin Platform
Implements advanced pattern analysis for productivity optimization
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from scipy import stats
from collections import defaultdict
import asyncio
import logging

logger = logging.getLogger(__name__)

class PatternRecognitionService:
    """
    Advanced pattern recognition service for analyzing user productivity patterns
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.clustering_model = DBSCAN(eps=0.5, min_samples=5)
        self.pattern_cache = {}
        self.confidence_threshold = 0.7
        
    async def analyze_activity(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze activity data to identify comprehensive patterns
        
        Args:
            activity_data: Dictionary containing user activity data
            
        Returns:
            List of discovered patterns with confidence scores
        """
        patterns = []
        
        try:
            # 1. Time-based patterns
            time_patterns = await self._analyze_time_patterns(activity_data)
            patterns.extend(time_patterns)
            
            # 2. Focus patterns
            focus_patterns = await self._analyze_focus_patterns(activity_data)
            patterns.extend(focus_patterns)
            
            # 3. Task completion patterns
            completion_patterns = await self._analyze_completion_patterns(activity_data)
            patterns.extend(completion_patterns)
            
            # 4. Energy level patterns
            energy_patterns = await self._analyze_energy_patterns(activity_data)
            patterns.extend(energy_patterns)
            
            # Filter patterns by confidence threshold
            high_confidence_patterns = [
                p for p in patterns 
                if p.get('confidence', 0) >= self.confidence_threshold
            ]
            
            logger.info(f"Discovered {len(high_confidence_patterns)} high-confidence patterns")
            return high_confidence_patterns
            
        except Exception as e:
            logger.error(f"Error analyzing activity patterns: {str(e)}")
            return []
    
    async def _analyze_time_patterns(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identify time-based productivity patterns
        
        Analyzes:
        - Peak productivity hours
        - Daily productivity cycles
        - Weekly patterns
        - Seasonal variations
        """
        patterns = []
        
        try:
            # Extract time-based data
            time_data = self._extract_time_data(activity_data)
            if not time_data:
                return patterns
            
            # 1. Peak productivity hours analysis
            hourly_productivity = self._calculate_hourly_productivity(time_data)
            peak_hours = self._identify_peak_hours(hourly_productivity)
            
            if peak_hours:
                confidence = self._calculate_time_pattern_confidence(peak_hours, hourly_productivity)
                patterns.append({
                    "type": "peak_productivity_hours",
                    "pattern_category": "temporal",
                    "data": {
                        "peak_hours": peak_hours,
                        "productivity_scores": {str(h): hourly_productivity.get(h, 0) for h in peak_hours},
                        "average_peak_score": np.mean([hourly_productivity.get(h, 0) for h in peak_hours]),
                        "improvement_potential": self._calculate_improvement_potential(hourly_productivity)
                    },
                    "confidence": confidence,
                    "impact": "high",
                    "frequency_score": len(peak_hours) / 24.0,
                    "discovered_at": datetime.utcnow().isoformat()
                })
            
            # 2. Morning vs Afternoon productivity
            morning_afternoon_pattern = self._analyze_morning_afternoon_patterns(hourly_productivity)
            if morning_afternoon_pattern:
                patterns.append(morning_afternoon_pattern)
            
            # 3. Day-of-week patterns
            daily_patterns = self._analyze_daily_patterns(time_data)
            if daily_patterns:
                patterns.append({
                    "type": "weekly_productivity_pattern",
                    "pattern_category": "temporal",
                    "data": daily_patterns,
                    "confidence": 0.8,
                    "impact": "medium",
                    "frequency_score": 0.85,
                    "discovered_at": datetime.utcnow().isoformat()
                })
            
            # 4. Productivity rhythm analysis
            rhythm_pattern = self._analyze_productivity_rhythm(time_data)
            if rhythm_pattern:
                patterns.append(rhythm_pattern)
                
        except Exception as e:
            logger.error(f"Error in time pattern analysis: {str(e)}")
        
        return patterns
    
    async def _analyze_focus_patterns(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze focus and deep work patterns
        
        Analyzes:
        - Deep work sessions
        - Distraction patterns
        - Context switching behavior
        - Flow state indicators
        """
        patterns = []
        
        try:
            # Extract focus-related data
            focus_data = self._extract_focus_data(activity_data)
            if not focus_data:
                return patterns
            
            # 1. Deep work sessions analysis
            deep_work_sessions = self._identify_deep_work_sessions(focus_data)
            if deep_work_sessions:
                optimal_times = self._find_optimal_deep_work_times(deep_work_sessions)
                average_duration = np.mean([s["duration"] for s in deep_work_sessions])
                
                patterns.append({
                    "type": "deep_work_pattern",
                    "pattern_category": "focus",
                    "data": {
                        "average_duration": float(average_duration),
                        "optimal_times": optimal_times,
                        "frequency": len(deep_work_sessions),
                        "quality_score": self._calculate_deep_work_quality(deep_work_sessions),
                        "sessions_per_day": len(deep_work_sessions) / max(1, self._get_data_span_days(focus_data)),
                        "best_duration_range": self._find_optimal_duration_range(deep_work_sessions)
                    },
                    "confidence": 0.85,
                    "impact": "high",
                    "frequency_score": min(1.0, len(deep_work_sessions) / 10.0),
                    "discovered_at": datetime.utcnow().isoformat()
                })
            
            # 2. Distraction patterns analysis
            distraction_patterns = self._analyze_distraction_patterns(focus_data)
            if distraction_patterns:
                patterns.append({
                    "type": "distraction_pattern",
                    "pattern_category": "focus",
                    "data": distraction_patterns,
                    "confidence": 0.75,
                    "impact": "medium",
                    "frequency_score": distraction_patterns.get("frequency_score", 0.5),
                    "discovered_at": datetime.utcnow().isoformat()
                })
            
            # 3. Context switching analysis
            context_switching = self._analyze_context_switching(focus_data)
            if context_switching:
                patterns.append(context_switching)
            
            # 4. Flow state detection
            flow_patterns = self._detect_flow_states(focus_data)
            if flow_patterns:
                patterns.append(flow_patterns)
                
        except Exception as e:
            logger.error(f"Error in focus pattern analysis: {str(e)}")
        
        return patterns
    
    async def _analyze_completion_patterns(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze task completion patterns"""
        patterns = []
        
        try:
            completion_data = self._extract_completion_data(activity_data)
            if not completion_data:
                return patterns
            
            # Task completion rate by time of day
            completion_by_hour = self._analyze_completion_by_hour(completion_data)
            if completion_by_hour:
                patterns.append({
                    "type": "task_completion_timing",
                    "pattern_category": "completion",
                    "data": completion_by_hour,
                    "confidence": 0.8,
                    "impact": "medium",
                    "frequency_score": 0.7,
                    "discovered_at": datetime.utcnow().isoformat()
                })
            
            # Task complexity patterns
            complexity_patterns = self._analyze_task_complexity_patterns(completion_data)
            if complexity_patterns:
                patterns.append(complexity_patterns)
                
        except Exception as e:
            logger.error(f"Error in completion pattern analysis: {str(e)}")
        
        return patterns
    
    async def _analyze_energy_patterns(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze energy level patterns"""
        patterns = []
        
        try:
            energy_data = self._extract_energy_data(activity_data)
            if not energy_data:
                return patterns
            
            # Energy cycles throughout the day
            energy_cycles = self._analyze_energy_cycles(energy_data)
            if energy_cycles:
                patterns.append({
                    "type": "energy_cycle_pattern",
                    "pattern_category": "energy",
                    "data": energy_cycles,
                    "confidence": 0.75,
                    "impact": "high",
                    "frequency_score": 0.8,
                    "discovered_at": datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error in energy pattern analysis: {str(e)}")
        
        return patterns
    
    # Helper methods for time pattern analysis
    def _extract_time_data(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract time-based activity data"""
        time_data = []
        
        # Extract from various data sources
        if 'activities' in activity_data:
            for activity in activity_data['activities']:
                if 'timestamp' in activity and 'productivity_score' in activity:
                    time_data.append({
                        'timestamp': activity['timestamp'],
                        'productivity_score': activity['productivity_score'],
                        'activity_type': activity.get('type', 'unknown'),
                        'duration': activity.get('duration', 0)
                    })
        
        return time_data
    
    def _calculate_hourly_productivity(self, time_data: List[Dict[str, Any]]) -> Dict[int, float]:
        """Calculate average productivity score for each hour of the day"""
        hourly_scores = defaultdict(list)
        
        for data_point in time_data:
            try:
                if isinstance(data_point['timestamp'], str):
                    timestamp = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = data_point['timestamp']
                
                hour = timestamp.hour
                score = float(data_point['productivity_score'])
                hourly_scores[hour].append(score)
            except (ValueError, KeyError) as e:
                continue
        
        # Calculate averages
        hourly_productivity = {}
        for hour, scores in hourly_scores.items():
            hourly_productivity[hour] = np.mean(scores)
        
        return hourly_productivity
    
    def _identify_peak_hours(self, hourly_productivity: Dict[int, float]) -> List[int]:
        """Identify peak productivity hours"""
        if not hourly_productivity:
            return []
        
        # Calculate threshold (top 25% of hours)
        scores = list(hourly_productivity.values())
        threshold = np.percentile(scores, 75)
        
        peak_hours = [
            hour for hour, score in hourly_productivity.items()
            if score >= threshold
        ]
        
        return sorted(peak_hours)
    
    def _calculate_time_pattern_confidence(self, peak_hours: List[int], 
                                         hourly_productivity: Dict[int, float]) -> float:
        """Calculate confidence score for time patterns"""
        if not peak_hours or not hourly_productivity:
            return 0.0
        
        # Base confidence on consistency and data volume
        peak_scores = [hourly_productivity[h] for h in peak_hours]
        non_peak_scores = [score for h, score in hourly_productivity.items() if h not in peak_hours]
        
        if not non_peak_scores:
            return 0.5
        
        # Statistical significance test
        try:
            t_stat, p_value = stats.ttest_ind(peak_scores, non_peak_scores)
            statistical_confidence = 1 - p_value if p_value < 0.05 else 0.5
        except:
            statistical_confidence = 0.5
        
        # Data volume confidence
        data_volume_confidence = min(1.0, len(hourly_productivity) / 24.0)
        
        # Combined confidence
        confidence = (statistical_confidence + data_volume_confidence) / 2
        return min(1.0, max(0.0, confidence))
    
    def _calculate_improvement_potential(self, hourly_productivity: Dict[int, float]) -> float:
        """Calculate potential for productivity improvement"""
        if not hourly_productivity:
            return 0.0
        
        scores = list(hourly_productivity.values())
        max_score = max(scores)
        avg_score = np.mean(scores)
        
        # Improvement potential as percentage
        if max_score > 0:
            return ((max_score - avg_score) / max_score) * 100
        return 0.0
    
    def _analyze_morning_afternoon_patterns(self, hourly_productivity: Dict[int, float]) -> Optional[Dict[str, Any]]:
        """Analyze morning vs afternoon productivity patterns"""
        if not hourly_productivity:
            return None
        
        morning_hours = [h for h in range(6, 12) if h in hourly_productivity]
        afternoon_hours = [h for h in range(12, 18) if h in hourly_productivity]
        
        if not morning_hours or not afternoon_hours:
            return None
        
        morning_avg = np.mean([hourly_productivity[h] for h in morning_hours])
        afternoon_avg = np.mean([hourly_productivity[h] for h in afternoon_hours])
        
        preference = "morning" if morning_avg > afternoon_avg else "afternoon"
        difference = abs(morning_avg - afternoon_avg)
        
        return {
            "type": "morning_afternoon_preference",
            "pattern_category": "temporal",
            "data": {
                "preference": preference,
                "morning_average": float(morning_avg),
                "afternoon_average": float(afternoon_avg),
                "difference": float(difference),
                "confidence_level": "high" if difference > 0.2 else "medium"
            },
            "confidence": 0.8 if difference > 0.2 else 0.6,
            "impact": "medium",
            "frequency_score": 0.9,
            "discovered_at": datetime.utcnow().isoformat()
        }
    
    def _analyze_daily_patterns(self, time_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Analyze day-of-week productivity patterns"""
        daily_scores = defaultdict(list)
        
        for data_point in time_data:
            try:
                if isinstance(data_point['timestamp'], str):
                    timestamp = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = data_point['timestamp']
                
                day_name = timestamp.strftime('%A')
                score = float(data_point['productivity_score'])

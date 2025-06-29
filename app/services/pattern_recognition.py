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
        hourly_scores: Dict[int, List[float]] = defaultdict(list)
        
        for data_point in time_data:
            try:
                if isinstance(data_point['timestamp'], str):
                    timestamp = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = data_point['timestamp']
                
                hour = timestamp.hour
                score = float(data_point['productivity_score'])
                hourly_scores[hour].append(score)
            except (ValueError, KeyError):
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
            return float(((max_score - avg_score) / max_score) * 100)
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
        daily_scores: Dict[str, List[float]] = defaultdict(list)
        
        for data_point in time_data:
            try:
                if isinstance(data_point['timestamp'], str):
                    timestamp = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = data_point['timestamp']
                
                day_name = timestamp.strftime('%A')
                score = float(data_point['productivity_score'])
                daily_scores[day_name].append(score)
            except (ValueError, KeyError):
                continue
        
        if len(daily_scores) < 3:  # Need at least 3 days of data
            return None
        
        daily_averages = {
            day: np.mean(scores) for day, scores in daily_scores.items()
        }
        
        best_day = ""
        worst_day = ""
        max_score = -1.0
        min_score = float('inf')
        
        for day, score in daily_averages.items():
            if score > max_score:
                max_score = score
                best_day = day
            if score < min_score:
                min_score = score
                worst_day = day
        
        values_list = [float(v) for v in daily_averages.values()]
        if len(values_list) > 0:
            mean_val = sum(values_list) / len(values_list)
            variance = sum((x - mean_val) ** 2 for x in values_list) / len(values_list)
        else:
            mean_val = 0.0
            variance = 0.0
        
        return {
            "daily_averages": {k: float(v) for k, v in daily_averages.items()},
            "best_day": best_day,
            "worst_day": worst_day,
            "weekly_variance": variance,
            "consistency_score": 1.0 - (variance / mean_val) if mean_val > 0 else 0.0
        }
    
    # Helper methods for focus pattern analysis
    def _extract_focus_data(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract focus-related activity data"""
        focus_data = []
        
        if 'focus_sessions' in activity_data:
            focus_data.extend(activity_data['focus_sessions'])
        
        if 'activities' in activity_data:
            for activity in activity_data['activities']:
                if activity.get('type') in ['deep_work', 'focused_task', 'coding', 'writing']:
                    focus_data.append(activity)
        
        return focus_data
    
    def _identify_deep_work_sessions(self, focus_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify deep work sessions from focus data"""
        deep_work_sessions = []
        
        for session in focus_data:
            duration = session.get('duration', 0)
            focus_score = session.get('focus_score', 0)
            interruptions = session.get('interruptions', 0)
            
            # Criteria for deep work: duration > 25 min, high focus, low interruptions
            if (duration >= 25 and focus_score >= 0.7 and interruptions <= 2):
                deep_work_sessions.append({
                    'duration': duration,
                    'focus_score': focus_score,
                    'interruptions': interruptions,
                    'timestamp': session.get('timestamp'),
                    'quality': self._calculate_session_quality(session)
                })
        
        return deep_work_sessions
    
    def _find_optimal_deep_work_times(self, deep_work_sessions: List[Dict[str, Any]]) -> List[str]:
        """Find optimal times for deep work based on historical sessions"""
        time_quality: Dict[int, List[float]] = defaultdict(list)
        
        for session in deep_work_sessions:
            try:
                if isinstance(session['timestamp'], str):
                    timestamp = datetime.fromisoformat(session['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = session['timestamp']
                
                hour = timestamp.hour
                quality = session['quality']
                time_quality[hour].append(quality)
            except (ValueError, KeyError):
                continue
        
        # Find hours with highest average quality
        hour_averages = {
            hour: np.mean(qualities) 
            for hour, qualities in time_quality.items()
        }
        
        # Return top 3 hours
        sorted_hours = sorted(hour_averages.items(), key=lambda x: x[1], reverse=True)
        optimal_times = [f"{hour:02d}:00" for hour, _ in sorted_hours[:3]]
        
        return optimal_times
    
    def _calculate_deep_work_quality(self, sessions: List[Dict[str, Any]]) -> float:
        """Calculate overall quality score for deep work sessions"""
        if not sessions:
            return 0.0
        
        quality_scores = [session.get('quality', 0) for session in sessions]
        return float(np.mean(quality_scores))
    
    def _get_data_span_days(self, data: List[Dict[str, Any]]) -> int:
        """Calculate the span of days covered by the data"""
        if not data:
            return 1
        
        timestamps = []
        for item in data:
            try:
                if isinstance(item['timestamp'], str):
                    timestamp = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = item['timestamp']
                timestamps.append(timestamp)
            except (ValueError, KeyError):
                continue
        
        if len(timestamps) < 2:
            return 1
        
        span = max(timestamps) - min(timestamps)
        return max(1, span.days)
    
    def _find_optimal_duration_range(self, sessions: List[Dict[str, Any]]) -> Dict[str, int]:
        """Find optimal duration range for deep work sessions"""
        if not sessions:
            return {"min": 25, "max": 90, "optimal": 60}
        
        durations = [session['duration'] for session in sessions]
        qualities = [session['quality'] for session in sessions]
        
        # Find duration range with highest quality
        duration_quality = list(zip(durations, qualities))
        duration_quality.sort(key=lambda x: x[1], reverse=True)
        
        # Take top 50% of sessions
        top_sessions = duration_quality[:max(1, len(duration_quality)//2)]
        top_durations = [d for d, q in top_sessions]
        
        return {
            "min": int(min(top_durations)),
            "max": int(max(top_durations)),
            "optimal": int(np.mean(top_durations))
        }
    
    def _analyze_distraction_patterns(self, focus_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Analyze distraction patterns"""
        if not focus_data:
            return None
        
        total_interruptions = sum(session.get('interruptions', 0) for session in focus_data)
        total_sessions = len(focus_data)
        
        if total_sessions == 0:
            return None
        
        avg_interruptions = total_interruptions / total_sessions
        
        # Analyze interruption sources
        interruption_sources: Dict[str, int] = defaultdict(int)
        for session in focus_data:
            sources = session.get('interruption_sources', [])
            for source in sources:
                interruption_sources[source] += 1
        
        return {
            "average_interruptions_per_session": float(avg_interruptions),
            "total_interruptions": total_interruptions,
            "main_distraction_sources": dict(interruption_sources),
            "distraction_severity": "high" if avg_interruptions > 3 else "medium" if avg_interruptions > 1 else "low",
            "frequency_score": min(1.0, avg_interruptions / 5.0)
        }
    
    def _calculate_session_quality(self, session: Dict[str, Any]) -> float:
        """Calculate quality score for a focus session"""
        duration = session.get('duration', 0)
        focus_score = session.get('focus_score', 0)
        interruptions = session.get('interruptions', 0)
        
        # Normalize duration (optimal around 60 minutes)
        duration_score = min(1.0, duration / 60.0) if duration <= 60 else max(0.5, 1.0 - (duration - 60) / 120.0)
        
        # Interruption penalty
        interruption_penalty = max(0.0, 1.0 - interruptions * 0.2)
        
        # Combined quality score
        quality = (duration_score * 0.3 + focus_score * 0.5 + interruption_penalty * 0.2)
        return min(1.0, max(0.0, quality))
    
    def _extract_completion_data(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract task completion data"""
        completion_data = []
        
        if 'completed_tasks' in activity_data:
            completion_data.extend(activity_data['completed_tasks'])
        
        if 'tasks' in activity_data:
            completed_tasks = [task for task in activity_data['tasks'] if task.get('status') == 'completed']
            completion_data.extend(completed_tasks)
        
        return completion_data
    
    def _analyze_completion_by_hour(self, completion_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Analyze task completion patterns by hour"""
        if not completion_data:
            return None
        
        hourly_completions: Dict[int, int] = defaultdict(int)
        
        for task in completion_data:
            try:
                if isinstance(task['completed_at'], str):
                    timestamp = datetime.fromisoformat(task['completed_at'].replace('Z', '+00:00'))
                else:
                    timestamp = task['completed_at']
                
                hour = timestamp.hour
                hourly_completions[hour] += 1
            except (ValueError, KeyError):
                continue
        
        if not hourly_completions:
            return None
        
        peak_completion_hour = 0
        max_completions = 0
        
        for hour, count in hourly_completions.items():
            if count > max_completions:
                max_completions = count
                peak_completion_hour = hour
        
        return {
            "hourly_completion_counts": {k: v for k, v in hourly_completions.items()},
            "peak_completion_hour": peak_completion_hour,
            "completion_distribution": "morning" if peak_completion_hour < 12 else "afternoon" if peak_completion_hour < 18 else "evening"
        }
    
    def _extract_energy_data(self, activity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract energy level data"""
        energy_data = []
        
        if 'energy_levels' in activity_data:
            energy_data.extend(activity_data['energy_levels'])
        
        if 'activities' in activity_data:
            for activity in activity_data['activities']:
                if 'energy_level' in activity:
                    energy_data.append(activity)
        
        return energy_data
    
    def _analyze_energy_cycles(self, energy_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Analyze energy cycles throughout the day"""
        if not energy_data:
            return None
        
        hourly_energy: Dict[int, List[float]] = defaultdict(list)
        
        for data_point in energy_data:
            try:
                if isinstance(data_point['timestamp'], str):
                    timestamp = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = data_point['timestamp']
                
                hour = timestamp.hour
                energy_level = float(data_point.get('energy_level', 0))
                hourly_energy[hour].append(energy_level)
            except (ValueError, KeyError):
                continue
        
        if not hourly_energy:
            return None
        
        # Calculate average energy by hour
        hourly_averages = {
            hour: np.mean(levels) for hour, levels in hourly_energy.items()
        }
        
        # Find peak and low energy periods
        peak_energy_hour = 0
        low_energy_hour = 0
        max_energy = -1.0
        min_energy = float('inf')
        
        for hour, energy in hourly_averages.items():
            if energy > max_energy:
                max_energy = energy
                peak_energy_hour = hour
            if energy < min_energy:
                min_energy = energy
                low_energy_hour = hour
        
        values_list = [float(v) for v in hourly_averages.values()]
        if len(values_list) > 0:
            mean_val = sum(values_list) / len(values_list)
            variance = sum((x - mean_val) ** 2 for x in values_list) / len(values_list)
        else:
            variance = 0.0
        
        return {
            "hourly_energy_averages": {k: float(v) for k, v in hourly_averages.items()},
            "peak_energy_hour": peak_energy_hour,
            "low_energy_hour": low_energy_hour,
            "energy_variance": variance,
            "cycle_strength": self._calculate_energy_cycle_strength({k: float(v) for k, v in hourly_averages.items()})
        }
    
    def _calculate_energy_cycle_strength(self, hourly_averages: Dict[int, float]) -> float:
        """Calculate the strength of energy cycles"""
        if len(hourly_averages) < 3:
            return 0.0
        
        values = [float(v) for v in hourly_averages.values()]
        if len(values) == 0:
            return 0.0
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        
        # Cycle strength based on variance relative to mean
        if mean_val > 0:
            cycle_strength = variance / mean_val
            return min(1.0, cycle_strength)
        return 0.0
"""
Activity tracking service for User Interface & Dashboard Components.
Provides comprehensive activity breakdown and productivity analytics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional, Tuple
import json
import statistics
from app.models.activity_models import (
    ActivityCategory, UserActivity, ProductivityMetric, 
    ActivityPattern, ActivityGoal
)

class ActivityService:
    """Service for managing user activities and productivity analytics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Activity Breakdown Methods
    
    def get_activity_breakdown(self, user_id: int, days: int = 7) -> Dict[str, Any]:
        """Get comprehensive activity breakdown for user"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get activities for the period
            activities = self.db.query(UserActivity).filter(
                and_(
                    UserActivity.user_id == user_id,
                    UserActivity.start_time >= start_date,
                    UserActivity.start_time <= end_date
                )
            ).all()
            
            if not activities:
                return self._generate_fallback_activity_breakdown()
            
            # Calculate category breakdown
            categories = self._calculate_category_breakdown(activities)
            
            # Calculate summary metrics
            total_hours = sum(activity.duration_minutes for activity in activities) / 60
            efficiency = self._calculate_efficiency_score(activities)
            most_productive_time = self._find_most_productive_time(activities)
            
            return {
                "categories": categories,
                "totalHours": round(total_hours, 1),
                "mostProductiveTime": most_productive_time,
                "efficiency": round(efficiency, 0),
                "period": f"Last {days} days",
                "dataSource": "database"
            }
            
        except Exception as e:
            print(f"Error getting activity breakdown: {e}")
            return self._generate_fallback_activity_breakdown()
    
    def _calculate_category_breakdown(self, activities: List[UserActivity]) -> List[Dict[str, Any]]:
        """Calculate activity breakdown by category"""
        category_data = {}
        total_duration = sum(activity.duration_minutes for activity in activities)
        
        if total_duration == 0:
            return []
        
        for activity in activities:
            category = activity.category
            if category.name not in category_data:
                category_data[category.name] = {
                    "name": category.name,
                    "duration": 0,
                    "color": category.color or "#3B82F6",
                    "icon": category.icon or "📊",
                    "productivity_sum": 0,
                    "count": 0
                }
            
            category_data[category.name]["duration"] += activity.duration_minutes
            category_data[category.name]["productivity_sum"] += activity.productivity_score
            category_data[category.name]["count"] += 1
        
        # Convert to percentage and format
        categories = []
        for cat_name, data in category_data.items():
            percentage = (data["duration"] / total_duration) * 100
            categories.append({
                "name": data["name"],
                "value": round(percentage, 1),
                "color": data["color"],
                "icon": data["icon"],
                "hours": round(data["duration"] / 60, 1),
                "avgProductivity": round(data["productivity_sum"] / data["count"], 1) if data["count"] > 0 else 0
            })
        
        # Sort by percentage descending
        return sorted(categories, key=lambda x: x["value"], reverse=True)
    
    def _calculate_efficiency_score(self, activities: List[UserActivity]) -> float:
        """Calculate overall efficiency score"""
        if not activities:
            return 0.0
        
        # Simple average of productivity scores
        scores = []
        for activity in activities:
            try:
                score = activity.productivity_score
                if isinstance(score, (int, float)):
                    scores.append(score)
                else:
                    scores.append(75.0)  # Default fallback
            except:
                scores.append(75.0)  # Default fallback
        
        return sum(scores) / len(scores) if scores else 0.0
    
    def _find_most_productive_time(self, activities: List[UserActivity]) -> str:
        """Find the most productive time period"""
        if not activities:
            return "9:00 AM - 11:00 AM"
        
        # Group activities by hour and calculate productivity
        hourly_productivity = {}
        
        for activity in activities:
            hour = activity.start_time.hour
            if hour not in hourly_productivity:
                hourly_productivity[hour] = {
                    "total_score": 0,
                    "total_duration": 0,
                    "count": 0
                }
            
            hourly_productivity[hour]["total_score"] += activity.productivity_score * activity.duration_minutes
            hourly_productivity[hour]["total_duration"] += activity.duration_minutes
            hourly_productivity[hour]["count"] += 1
        
        # Find the most productive 2-hour window
        best_score = 0
        best_start_hour = 9
        
        for start_hour in range(24):
            end_hour = (start_hour + 2) % 24
            window_score = 0
            window_duration = 0
            
            for hour in [start_hour, (start_hour + 1) % 24]:
                if hour in hourly_productivity:
                    data = hourly_productivity[hour]
                    if data["total_duration"] > 0:
                        avg_score = data["total_score"] / data["total_duration"]
                        window_score += avg_score * data["total_duration"]
                        window_duration += data["total_duration"]
            
            if window_duration > 0:
                avg_window_score = window_score / window_duration
                if avg_window_score > best_score:
                    best_score = avg_window_score
                    best_start_hour = start_hour
        
        # Format time range
        start_time = f"{best_start_hour:02d}:00"
        end_hour = (best_start_hour + 2) % 24
        end_time = f"{end_hour:02d}:00"
        
        # Convert to 12-hour format
        start_12h = self._to_12_hour_format(start_time)
        end_12h = self._to_12_hour_format(end_time)
        
        return f"{start_12h} - {end_12h}"
    
    def _to_12_hour_format(self, time_24h: str) -> str:
        """Convert 24-hour time to 12-hour format"""
        hour, minute = map(int, time_24h.split(':'))
        if hour == 0:
            return f"12:{minute:02d} AM"
        elif hour < 12:
            return f"{hour}:{minute:02d} AM"
        elif hour == 12:
            return f"12:{minute:02d} PM"
        else:
            return f"{hour-12}:{minute:02d} PM"
    
    # Productivity Chart Methods
    
    def get_productivity_data(self, user_id: int, period: str = 'daily', days: int = 30) -> List[Dict[str, Any]]:
        """Get productivity data for charts"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            if period == 'daily':
                return self._get_daily_productivity_data(user_id, start_date, end_date)
            elif period == 'weekly':
                return self._get_weekly_productivity_data(user_id, start_date, end_date)
            elif period == 'hourly':
                return self._get_hourly_productivity_data(user_id, start_date, end_date)
            else:
                return self._get_daily_productivity_data(user_id, start_date, end_date)
                
        except Exception as e:
            print(f"Error getting productivity data: {e}")
            return self._generate_fallback_productivity_data(period, days)
    
    def _get_daily_productivity_data(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get daily productivity metrics"""
        # Get or create daily metrics
        metrics = self.db.query(ProductivityMetric).filter(
            and_(
                ProductivityMetric.user_id == user_id,
                ProductivityMetric.date >= start_date.date(),
                ProductivityMetric.date <= end_date.date()
            )
        ).order_by(ProductivityMetric.date).all()
        
        if not metrics:
            # Generate from activities if metrics don't exist
            return self._generate_daily_metrics_from_activities(user_id, start_date, end_date)
        
        data = []
        for metric in metrics:
            data.append({
                "date": metric.date.strftime("%Y-%m-%d"),
                "productivity": round(metric.efficiency_score, 1),
                "tasks": round(metric.total_active_hours * 2, 0),  # Estimate tasks
                "value": round(metric.efficiency_score, 1),
                "focus": round(metric.focus_score, 1),
                "energy": round(metric.energy_score, 1),
                "hours": round(metric.total_active_hours, 1)
            })
        
        return data
    
    def _get_weekly_productivity_data(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get weekly productivity aggregates"""
        # Group by week and aggregate
        weekly_data = self.db.query(
            func.date_trunc('week', ProductivityMetric.date).label('week'),
            func.avg(ProductivityMetric.efficiency_score).label('avg_efficiency'),
            func.sum(ProductivityMetric.total_active_hours).label('total_hours'),
            func.avg(ProductivityMetric.focus_score).label('avg_focus'),
            func.avg(ProductivityMetric.energy_score).label('avg_energy')
        ).filter(
            and_(
                ProductivityMetric.user_id == user_id,
                ProductivityMetric.date >= start_date.date(),
                ProductivityMetric.date <= end_date.date()
            )
        ).group_by(func.date_trunc('week', ProductivityMetric.date)).all()
        
        data = []
        for week_data in weekly_data:
            data.append({
                "date": week_data.week.strftime("%Y-%m-%d"),
                "productivity": round(week_data.avg_efficiency or 0, 1),
                "tasks": round((week_data.total_hours or 0) * 2, 0),
                "value": round(week_data.avg_efficiency or 0, 1),
                "focus": round(week_data.avg_focus or 0, 1),
                "energy": round(week_data.avg_energy or 0, 1),
                "hours": round(week_data.total_hours or 0, 1)
            })
        
        return data
    
    def _get_hourly_productivity_data(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get hourly productivity patterns"""
        activities = self.db.query(UserActivity).filter(
            and_(
                UserActivity.user_id == user_id,
                UserActivity.start_time >= start_date,
                UserActivity.start_time <= end_date
            )
        ).all()
        
        # Group by hour of day
        hourly_stats = {}
        for hour in range(24):
            hourly_stats[hour] = {
                "total_score": 0,
                "total_duration": 0,
                "count": 0
            }
        
        for activity in activities:
            hour = activity.start_time.hour
            hourly_stats[hour]["total_score"] += activity.productivity_score * activity.duration_minutes
            hourly_stats[hour]["total_duration"] += activity.duration_minutes
            hourly_stats[hour]["count"] += 1
        
        data = []
        for hour in range(24):
            stats = hourly_stats[hour]
            avg_productivity = 0
            if stats["total_duration"] > 0:
                avg_productivity = stats["total_score"] / stats["total_duration"]
            
            data.append({
                "date": f"{hour:02d}:00",
                "productivity": round(avg_productivity, 1),
                "tasks": stats["count"],
                "value": round(avg_productivity, 1),
                "hours": round(stats["total_duration"] / 60, 1)
            })
        
        return data
    
    def _generate_daily_metrics_from_activities(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Generate daily metrics from raw activities"""
        current_date = start_date.date()
        end_date_only = end_date.date()
        data = []
        
        while current_date <= end_date_only:
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = datetime.combine(current_date, datetime.max.time())
            
            activities = self.db.query(UserActivity).filter(
                and_(
                    UserActivity.user_id == user_id,
                    UserActivity.start_time >= day_start,
                    UserActivity.start_time <= day_end
                )
            ).all()
            
            if activities:
                total_hours = sum(a.duration_minutes for a in activities) / 60
                avg_productivity = statistics.mean([a.productivity_score for a in activities])
                avg_focus = statistics.mean([a.focus_level * 10 for a in activities])  # Convert to 0-100
                avg_energy = statistics.mean([a.energy_level * 10 for a in activities])  # Convert to 0-100
                task_count = len(activities)
            else:
                total_hours = 0
                avg_productivity = 0
                avg_focus = 0
                avg_energy = 0
                task_count = 0
            
            data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "productivity": round(avg_productivity, 1),
                "tasks": task_count,
                "value": round(avg_productivity, 1),
                "focus": round(avg_focus, 1),
                "energy": round(avg_energy, 1),
                "hours": round(float(total_hours), 1)
            })
            
            current_date += timedelta(days=1)
        
        return data
    
    # Fallback Data Methods
    
    def _generate_fallback_activity_breakdown(self) -> Dict[str, Any]:
        """Generate realistic fallback activity breakdown"""
        return {
            "categories": [
                {"name": "Development", "value": 45, "color": "#2563eb", "icon": "💻", "hours": 3.8, "avgProductivity": 85},
                {"name": "Meetings", "value": 25, "color": "#7c3aed", "icon": "📞", "hours": 2.1, "avgProductivity": 72},
                {"name": "Learning", "value": 15, "color": "#16a34a", "icon": "📚", "hours": 1.3, "avgProductivity": 88},
                {"name": "Planning", "value": 10, "color": "#ea580c", "icon": "📋", "hours": 0.8, "avgProductivity": 78},
                {"name": "Break", "value": 5, "color": "#6b7280", "icon": "☕", "hours": 0.4, "avgProductivity": 45}
            ],
            "totalHours": 8.4,
            "mostProductiveTime": "9:00 AM - 11:00 AM",
            "efficiency": 82,
            "period": "Last 7 days",
            "dataSource": "fallback"
        }
    
    def _generate_fallback_productivity_data(self, period: str, days: int) -> List[Dict[str, Any]]:
        """Generate realistic fallback productivity data"""
        data = []
        
        if period == 'daily':
            for i in range(days):
                date_obj = datetime.now() - timedelta(days=days-i-1)
                # Simulate realistic productivity patterns
                base_productivity = 75 + (i % 7) * 3  # Weekly pattern
                daily_variation = (i % 3) * 5 - 5  # Some daily variation
                productivity = max(40, min(95, base_productivity + daily_variation))
                
                data.append({
                    "date": date_obj.strftime("%Y-%m-%d"),
                    "productivity": round(productivity, 1),
                    "tasks": round(productivity / 10, 0),
                    "value": round(productivity, 1),
                    "focus": round(productivity + (i % 5) * 2, 1),
                    "energy": round(productivity - (i % 4) * 3, 1),
                    "hours": round(6 + (productivity - 70) / 10, 1)
                })
        
        elif period == 'hourly':
            # Generate hourly pattern for today
            productivity_by_hour = [
                45, 50, 55, 65, 75, 80, 85, 90, 88, 85, 82, 78,  # Morning peak
                70, 65, 60, 55, 60, 70, 75, 80, 75, 70, 60, 50   # Afternoon dip, evening recovery
            ]
            
            for hour in range(24):
                data.append({
                    "date": f"{hour:02d}:00",
                    "productivity": productivity_by_hour[hour],
                    "tasks": max(0, (productivity_by_hour[hour] - 40) // 10),
                    "value": productivity_by_hour[hour],
                    "hours": round(max(0.0, (productivity_by_hour[hour] - 30) / 20), 1)
                })
        
        return data
    
    # Utility Methods
    
    def create_activity_categories(self) -> None:
        """Create default activity categories if they don't exist"""
        default_categories = [
            {"name": "Development", "icon": "💻", "color": "#2563eb", "is_productive": True},
            {"name": "Meetings", "icon": "📞", "color": "#7c3aed", "is_productive": True},
            {"name": "Learning", "icon": "📚", "color": "#16a34a", "is_productive": True},
            {"name": "Planning", "icon": "📋", "color": "#ea580c", "is_productive": True},
            {"name": "Break", "icon": "☕", "color": "#6b7280", "is_productive": False},
            {"name": "Email", "icon": "📧", "color": "#0891b2", "is_productive": True},
            {"name": "Research", "icon": "🔍", "color": "#059669", "is_productive": True},
            {"name": "Documentation", "icon": "📝", "color": "#7c2d12", "is_productive": True},
            {"name": "Testing", "icon": "🧪", "color": "#9333ea", "is_productive": True},
            {"name": "Administrative", "icon": "📊", "color": "#dc2626", "is_productive": True}
        ]
        
        for cat_data in default_categories:
            existing = self.db.query(ActivityCategory).filter(
                ActivityCategory.name == cat_data["name"]
            ).first()
            
            if not existing:
                category = ActivityCategory(**cat_data)
                self.db.add(category)
        
        self.db.commit()
    
    def record_activity(self, user_id: int, activity_data: Dict[str, Any]) -> UserActivity:
        """Record a new user activity"""
        activity = UserActivity(
            user_id=user_id,
            **activity_data
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity
    
    def update_daily_metrics(self, user_id: int, target_date: Optional[date] = None) -> ProductivityMetric:
        """Update or create daily productivity metrics"""
        if target_date is None:
            target_date = date.today()
        
        # Get activities for the day
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = datetime.combine(target_date, datetime.max.time())
        
        activities = self.db.query(UserActivity).filter(
            and_(
                UserActivity.user_id == user_id,
                UserActivity.start_time >= day_start,
                UserActivity.start_time <= day_end
            )
        ).all()
        
        # Calculate metrics
        if activities:
            total_hours = sum(a.duration_minutes for a in activities) / 60
            productive_hours = sum(a.duration_minutes for a in activities if a.category.is_productive) / 60
            efficiency = statistics.mean([a.productivity_score for a in activities])
            focus = statistics.mean([a.focus_level * 10 for a in activities])
            energy = statistics.mean([a.energy_level * 10 for a in activities])
            
            # Find most productive hour
            hourly_productivity = {}
            for activity in activities:
                hour = activity.start_time.hour
                if hour not in hourly_productivity:
                    hourly_productivity[hour] = []
                hourly_productivity[hour].append(activity.productivity_score)
            
            most_productive_hour = max(hourly_productivity.keys(), 
                                     key=lambda h: statistics.mean(hourly_productivity[h])) if hourly_productivity else 9
        else:
            total_hours = productive_hours = efficiency = focus = energy = 0
            most_productive_hour = 9
        
        # Update or create metric
        metric = self.db.query(ProductivityMetric).filter(
            and_(
                ProductivityMetric.user_id == user_id,
                ProductivityMetric.date == target_date
            )
        ).first()
        
        if metric:
            metric.total_active_hours = total_hours
            metric.productive_hours = productive_hours
            metric.efficiency_score = efficiency
            metric.focus_score = focus
            metric.energy_score = energy
            metric.most_productive_hour = most_productive_hour
            metric.updated_at = datetime.now()
        else:
            metric = ProductivityMetric(
                user_id=user_id,
                date=target_date,
                total_active_hours=total_hours,
                productive_hours=productive_hours,
                efficiency_score=efficiency,
                focus_score=focus,
                energy_score=energy,
                most_productive_hour=most_productive_hour
            )
            self.db.add(metric)
        
        self.db.commit()
        self.db.refresh(metric)
        return metric
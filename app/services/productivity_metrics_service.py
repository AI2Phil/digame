"""
Productivity Metrics Service
Provides real database-driven productivity metrics for dashboard components
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from ..models.activity import Activity
from ..models.user import User


class ProductivityMetricsService:
    def __init__(self, db: Session):
        self.db = db

    def get_activities_today_count(self, user_id: int) -> Dict[str, Any]:
        """
        Get count of activities for the current day for a specific user
        Returns data compatible with ProductivityMetricCard component
        """
        try:
            # Get start and end of today in UTC
            today = datetime.now(timezone.utc).date()
            start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
            end_of_day = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)

            # Count activities for today
            activities_count = self.db.query(Activity).filter(
                Activity.user_id == user_id,
                Activity.timestamp >= start_of_day,
                Activity.timestamp <= end_of_day
            ).count()

            # Get yesterday's count for comparison
            yesterday = today - timedelta(days=1)
            start_of_yesterday = datetime.combine(yesterday, datetime.min.time()).replace(tzinfo=timezone.utc)
            end_of_yesterday = datetime.combine(yesterday, datetime.max.time()).replace(tzinfo=timezone.utc)

            yesterday_count = self.db.query(Activity).filter(
                Activity.user_id == user_id,
                Activity.timestamp >= start_of_yesterday,
                Activity.timestamp <= end_of_yesterday
            ).count()

            # Calculate change from yesterday
            change = activities_count - yesterday_count
            change_percentage = 0
            if yesterday_count > 0:
                change_percentage = (change / yesterday_count) * 100

            # Determine change type
            change_type = "positive" if change > 0 else "negative" if change < 0 else "neutral"

            # Format change string
            change_str = f"{change:+d}" if change != 0 else "0"
            if abs(change_percentage) >= 1:
                change_str += f" ({change_percentage:+.0f}%)"

            return {
                "success": True,
                "title": "Activities Today",
                "value": str(activities_count),
                "unit": "tasks",
                "change": change_str,
                "change_type": change_type,
                "metadata": {
                    "today_count": activities_count,
                    "yesterday_count": yesterday_count,
                    "change_absolute": change,
                    "change_percentage": change_percentage,
                    "date": today.isoformat()
                }
            }

        except Exception as e:
            return {
                "success": False,
                "title": "Activities Today",
                "value": "N/A",
                "unit": "tasks",
                "change": None,
                "change_type": "neutral",
                "error": f"Could not load data: {str(e)}",
                "metadata": {}
            }

    def get_weekly_activity_trend(self, user_id: int) -> List[int]:
        """
        Get activity counts for the last 7 days for trend visualization
        """
        try:
            trend_data = []
            today = datetime.now(timezone.utc).date()

            for i in range(6, -1, -1):  # Last 7 days, oldest first
                target_date = today - timedelta(days=i)
                start_of_day = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
                end_of_day = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)

                count = self.db.query(Activity).filter(
                    Activity.user_id == user_id,
                    Activity.timestamp >= start_of_day,
                    Activity.timestamp <= end_of_day
                ).count()

                trend_data.append(count)

            return trend_data

        except Exception as e:
            # Return empty trend on error
            return [0] * 7

    def get_productivity_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get comprehensive productivity summary for a user
        """
        try:
            # Get activities today
            activities_today = self.get_activities_today_count(user_id)

            # Get weekly trend
            weekly_trend = self.get_weekly_activity_trend(user_id)

            # Calculate weekly average
            weekly_average = sum(weekly_trend) / len(weekly_trend) if weekly_trend else 0

            # Get total activities this week
            today = datetime.now(timezone.utc).date()
            week_start = today - timedelta(days=today.weekday())  # Monday
            week_start_dt = datetime.combine(week_start, datetime.min.time()).replace(tzinfo=timezone.utc)
            week_end_dt = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)

            week_total = self.db.query(Activity).filter(
                Activity.user_id == user_id,
                Activity.timestamp >= week_start_dt,
                Activity.timestamp <= week_end_dt
            ).count()

            # Get most active day this week
            most_active_day = "Monday"  # Default
            if weekly_trend:
                max_index = weekly_trend.index(max(weekly_trend))
                days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                most_active_day = days[max_index] if max_index < len(days) else "Monday"

            return {
                "success": True,
                "activities_today": activities_today,
                "weekly_trend": weekly_trend,
                "weekly_summary": {
                    "total_activities": week_total,
                    "daily_average": round(float(weekly_average), 1),
                    "most_active_day": most_active_day,
                    "trend_direction": "increasing" if len(weekly_trend) >= 2 and weekly_trend[-1] > weekly_trend[-2] else "decreasing"
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get productivity summary: {str(e)}",
                "activities_today": {
                    "success": False,
                    "title": "Activities Today",
                    "value": "N/A",
                    "unit": "tasks",
                    "error": str(e)
                },
                "weekly_trend": [0] * 7,
                "weekly_summary": {
                    "total_activities": 0,
                    "daily_average": 0,
                    "most_active_day": "Monday",
                    "trend_direction": "stable"
                }
            }

    def get_activity_types_breakdown(self, user_id: int, days: int = 7) -> Dict[str, Any]:
        """
        Get breakdown of activity types for the last N days
        """
        try:
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)

            # Query activity types and their counts
            activity_breakdown = self.db.query(
                Activity.activity_type,
                func.count(Activity.id).label('count')
            ).filter(
                Activity.user_id == user_id,
                Activity.timestamp >= start_date,
                Activity.timestamp <= end_date
            ).group_by(Activity.activity_type).order_by(func.count(Activity.id).desc()).all()

            total_activities = sum(row.count for row in activity_breakdown)

            breakdown_data = []
            for row in activity_breakdown:
                percentage = (row.count / total_activities * 100) if total_activities > 0 else 0
                breakdown_data.append({
                    "activity_type": row.activity_type,
                    "count": row.count,
                    "percentage": round(percentage, 1)
                })

            return {
                "success": True,
                "period_days": days,
                "total_activities": total_activities,
                "breakdown": breakdown_data,
                "top_activity": breakdown_data[0]["activity_type"] if breakdown_data else "No activities"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get activity breakdown: {str(e)}",
                "period_days": days,
                "total_activities": 0,
                "breakdown": [],
                "top_activity": "No activities"
            }


def get_productivity_metrics_service(db: Session) -> ProductivityMetricsService:
    """Dependency injection function for FastAPI"""
    return ProductivityMetricsService(db)
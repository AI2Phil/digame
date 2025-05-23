from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from ..db import get_db
from ..models.user import User
from ..models.activity import Activity
from ..models.anomaly import DetectedAnomaly
from ..models.process_notes import ProcessNote
from ..models.activity_features import ActivityEnrichedFeature
from ..auth.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(
    period: str = "7d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive analytics for the user dashboard"""
    
    # Calculate date range
    now = datetime.utcnow()
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=7)
    
    # Get user activities in the period
    activities = db.query(Activity).filter(
        and_(
            Activity.user_id == current_user.id,
            Activity.timestamp >= start_date,
            Activity.timestamp <= now
        )
    ).all()
    
    # Calculate total active time (in minutes)
    total_active_time = len(activities) * 5  # Assuming 5-minute intervals
    
    # Get productivity data from enriched features
    enriched_activities = db.query(ActivityEnrichedFeature).join(
        Activity, Activity.id == ActivityEnrichedFeature.activity_id
    ).filter(
        and_(
            Activity.user_id == current_user.id,
            Activity.timestamp >= start_date
        )
    ).all()
    
    # Calculate productivity score
    productive_activities = [a for a in enriched_activities if a.productivity_score and a.productivity_score > 0.6]
    productivity_score = (len(productive_activities) / len(enriched_activities) * 100) if enriched_activities else 0
    
    # Get anomalies
    anomalies = db.query(DetectedAnomaly).filter(
        and_(
            DetectedAnomaly.user_id == current_user.id,
            DetectedAnomaly.timestamp >= start_date
        )
    ).all()
    
    # Calculate focus sessions (consecutive productive periods)
    focus_sessions = calculate_focus_sessions(enriched_activities)
    
    # Generate activity breakdown
    activity_breakdown = generate_activity_breakdown(enriched_activities)
    
    # Generate productivity trend
    productivity_trend = generate_productivity_trend(enriched_activities, start_date, now)
    
    # Generate activity timeline
    activity_timeline = generate_activity_timeline(activities[-50:])  # Last 50 activities
    
    # Get insights and recommendations
    insights = generate_insights(enriched_activities, anomalies, current_user)
    
    # Get goals progress
    goals_progress = get_goals_progress(current_user)
    
    return {
        "totalActiveTime": total_active_time,
        "activeTimeIncrease": calculate_time_increase(activities, start_date),
        "focusSessions": len(focus_sessions),
        "avgFocusTime": sum(session['duration'] for session in focus_sessions) / len(focus_sessions) if focus_sessions else 0,
        "distractions": len([a for a in anomalies if a.anomaly_type == "distraction"]),
        "distractionTrend": calculate_distraction_trend(anomalies, start_date),
        "productivity": {
            "score": round(float(productivity_score), 1),
            "trend": calculate_productivity_trend(enriched_activities, start_date)
        },
        "activityBreakdown": activity_breakdown,
        "productivityTrend": productivity_trend,
        "activityTimeline": activity_timeline,
        "insights": insights,
        "anomalies": [
            {
                "type": anomaly.anomaly_type,
                "description": anomaly.description,
                "severity": anomaly.severity_score or 0.5,
                "timestamp": anomaly.timestamp.isoformat()
            }
            for anomaly in anomalies[-10:]  # Last 10 anomalies
        ],
        "goals": goals_progress,
        "weeklyStats": calculate_weekly_stats(activities, enriched_activities),
        "detailedMetrics": calculate_detailed_metrics(activities, enriched_activities)
    }

def calculate_focus_sessions(enriched_activities):
    """Calculate focus sessions from enriched activities"""
    focus_sessions = []
    current_session = None
    
    # Type ignore for complex SQLAlchemy relationship access
    for activity in sorted(enriched_activities, key=lambda x: getattr(x, 'activity', x).timestamp):  # type: ignore
        is_productive = activity.productivity_score and activity.productivity_score > 0.6
        
        if is_productive:
            activity_obj = getattr(activity, 'activity', activity)
            if activity_obj is None:
                continue
            activity_timestamp = activity_obj.timestamp
            if current_session is None:
                current_session = {
                    'start': activity_timestamp,
                    'end': activity_timestamp,
                    'duration': 5
                }
            else:
                current_session['end'] = activity_timestamp  # type: ignore
                current_session['duration'] += 5  # type: ignore
        else:
            if current_session and current_session.get('duration', 0) >= 15:  # At least 15 minutes
                focus_sessions.append(current_session)
            current_session = None
    
    # Add final session if it exists
    if current_session and current_session.get('duration', 0) >= 15:
        focus_sessions.append(current_session)
    
    return focus_sessions

def generate_activity_breakdown(enriched_activities):
    """Generate activity breakdown by category"""
    breakdown = {}
    
    for activity in enriched_activities:
        category = activity.app_category or "Other"
        if category not in breakdown:
            breakdown[category] = {"count": 0, "time": 0}
        breakdown[category]["count"] += 1
        breakdown[category]["time"] += 5  # 5-minute intervals
    
    # Convert to list format for charts
    return [
        {
            "category": category,
            "count": data["count"],
            "time": data["time"],
            "percentage": round(data["time"] / sum(d["time"] for d in breakdown.values()) * 100, 1)
        }
        for category, data in breakdown.items()
    ]

def generate_productivity_trend(enriched_activities, start_date, end_date):
    """Generate productivity trend over time"""
    trend_data = []
    current_date = start_date.date()
    end_date = end_date.date()
    
    while current_date <= end_date:
        day_activities = [
            a for a in enriched_activities 
            if a.activity.timestamp.date() == current_date
        ]
        
        if day_activities:
            productive_count = len([a for a in day_activities if a.productivity_score and a.productivity_score > 0.6])
            productivity_score = (productive_count / len(day_activities)) * 100
        else:
            productivity_score = 0
        
        trend_data.append({
            "date": current_date.isoformat(),
            "productivity": round(float(productivity_score), 1),
            "activities": len(day_activities)
        })
        
        current_date += timedelta(days=1)
    
    return trend_data

def generate_activity_timeline(activities):
    """Generate activity timeline for visualization"""
    return [
        {
            "timestamp": activity.timestamp.isoformat(),
            "application": activity.application,
            "window_title": activity.window_title[:50] + "..." if len(activity.window_title) > 50 else activity.window_title,
            "duration": 5  # 5-minute intervals
        }
        for activity in activities
    ]

def generate_insights(enriched_activities, anomalies, user):
    """Generate AI insights and recommendations"""
    insights = {
        "productivity": []
    }
    
    # Productivity insights
    if enriched_activities:
        avg_productivity = sum(a.productivity_score or 0 for a in enriched_activities) / len(enriched_activities)
        
        if avg_productivity < 0.5:
            insights["productivity"].append({
                "title": "Low Productivity Detected",
                "description": f"Your average productivity score is {avg_productivity:.1%}",
                "recommendation": "Consider taking more breaks and focusing on high-priority tasks"
            })
        elif avg_productivity > 0.8:
            insights["productivity"].append({
                "title": "Excellent Productivity",
                "description": f"Your average productivity score is {avg_productivity:.1%}",
                "recommendation": "Keep up the great work! Consider sharing your strategies with others"
            })
    
    # Anomaly insights
    if len(anomalies) > 5:
        insights["productivity"].append({
            "title": "Multiple Anomalies Detected",
            "description": f"We detected {len(anomalies)} unusual patterns in your work",
            "recommendation": "Review your work patterns and consider adjusting your schedule"
        })
    
    return insights

def get_goals_progress(user):
    """Get user's goals progress from onboarding data"""
    if not user.onboarding_data:
        return []
    
    try:
        onboarding_data = json.loads(user.onboarding_data) if isinstance(user.onboarding_data, str) else user.onboarding_data
        goals = onboarding_data.get('goals', [])
        
        # Mock progress for demonstration
        return [
            {
                "title": f"Improve {goal}",
                "description": f"Focus on developing {goal} skills",
                "progress": min(100, hash(goal) % 100),  # Mock progress
                "status": "in_progress"
            }
            for goal in goals[:3]  # Show first 3 goals
        ]
    except:
        return []

def calculate_time_increase(activities, start_date):
    """Calculate increase in active time compared to previous period"""
    period_length = (datetime.utcnow() - start_date).days
    previous_start = start_date - timedelta(days=period_length)
    
    # This would need actual implementation with historical data
    return 30  # Mock 30-minute increase

def calculate_distraction_trend(anomalies, start_date):
    """Calculate distraction trend percentage"""
    # This would need actual implementation with historical data
    return -5  # Mock 5% decrease in distractions

def calculate_productivity_trend(enriched_activities, start_date):
    """Calculate productivity trend percentage"""
    # This would need actual implementation with historical data
    return 3  # Mock 3% increase

def calculate_weekly_stats(activities, enriched_activities):
    """Calculate weekly statistics"""
    total_hours = len(activities) * 5 / 60  # Convert minutes to hours
    productive_activities = [a for a in enriched_activities if a.productivity_score and a.productivity_score > 0.6]
    productive_hours = len(productive_activities) * 5 / 60
    
    avg_score = sum(a.productivity_score or 0 for a in enriched_activities) / len(enriched_activities) * 100 if enriched_activities else 0
    
    return {
        "totalHours": round(total_hours, 1),
        "productiveHours": round(productive_hours, 1),
        "averageScore": round(float(avg_score), 1)
    }

def calculate_detailed_metrics(activities, enriched_activities):
    """Calculate detailed performance metrics"""
    if not activities:
        return {
            "mostProductiveDay": "N/A",
            "peakHours": "N/A",
            "topApplication": "N/A",
            "focusStreak": 0
        }
    
    # Most productive day
    day_productivity = {}
    for activity in enriched_activities:
        day = activity.activity.timestamp.strftime("%A")
        if day not in day_productivity:
            day_productivity[day] = []
        day_productivity[day].append(activity.productivity_score or 0)
    
    most_productive_day = max(day_productivity.keys(), 
                            key=lambda day: sum(day_productivity[day]) / len(day_productivity[day])) if day_productivity else "N/A"
    
    # Peak hours
    hour_productivity = {}
    for activity in enriched_activities:
        hour = activity.activity.timestamp.hour
        if hour not in hour_productivity:
            hour_productivity[hour] = []
        hour_productivity[hour].append(activity.productivity_score or 0)
    
    peak_hour = max(hour_productivity.keys(),
                   key=lambda hour: sum(hour_productivity[hour]) / len(hour_productivity[hour])) if hour_productivity else 0
    peak_hours = f"{peak_hour}:00 - {peak_hour + 1}:00"
    
    # Top application
    app_usage = {}
    for activity in activities:
        app = activity.application
        app_usage[app] = app_usage.get(app, 0) + 1
    
    top_application = max(app_usage.keys(), key=lambda app: app_usage[app]) if app_usage else "N/A"
    
    return {
        "mostProductiveDay": most_productive_day,
        "peakHours": peak_hours,
        "topApplication": top_application,
        "focusStreak": 3  # Mock focus streak
    }

@router.get("/export")
async def export_analytics(
    period: str = "30d",
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export analytics data in various formats"""
    
    # Get analytics data
    analytics_data = await get_dashboard_analytics(period, db, current_user)
    
    if format == "json":
        return analytics_data
    elif format == "csv":
        # Convert to CSV format (simplified)
        return {"message": "CSV export not implemented yet"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported export format"
        )

@router.get("/goals")
async def get_user_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's goals and progress"""
    return get_goals_progress(current_user)

@router.post("/goals/{goal_id}/update")
async def update_goal_progress(
    goal_id: int,
    progress: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update progress for a specific goal"""
    
    # This would update the goal progress in the database
    # For now, return success message
    return {"message": f"Goal {goal_id} progress updated to {progress}%"}
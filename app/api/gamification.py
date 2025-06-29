"""
Gamification API Endpoints
Provides REST API for achievements, streaks, leaderboards, and user progress
"""

from typing import List, Dict, Optional, cast
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..db import get_db
from ..services.gamification_service import GamificationService
from ..models.gamification import Achievement, UserAchievement, Streak, UserPoints
from ..auth.auth_dependencies import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

# Pydantic Models for API
class AchievementResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    rarity: str
    points: int
    icon: str
    max_progress: int
    is_earned: bool = False
    current_progress: int = 0
    earned_at: Optional[str] = None
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True

class StreakResponse(BaseModel):
    id: int
    streak_type: str
    current_count: int
    longest_count: int
    is_active: bool
    start_date: str
    last_activity_date: str

    class Config:
        from_attributes = True

class UserPointsResponse(BaseModel):
    total_points: int
    level: int
    experience_points: int
    level_progress_percentage: float
    achievement_points: int
    goal_points: int
    streak_points: int
    social_points: int

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    score: int
    level: Optional[int] = None

class UserStatsResponse(BaseModel):
    points: Dict
    achievements: Dict
    streaks: Dict

# Achievement Endpoints
@router.get("/achievements", response_model=List[AchievementResponse])
async def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all achievements for the current user"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    user_achievements = service.get_user_achievements(user_id)
    available_achievements = service.get_available_achievements(user_id)
    
    # Combine earned and available achievements
    achievements = []
    
    # Add earned achievements
    for ua in user_achievements:
        if ua.earned:
            achievements.append(AchievementResponse(
                id=cast(int, ua.achievement.id),
                title=cast(str, ua.achievement.title),
                description=cast(str, ua.achievement.description),
                category=cast(str, ua.achievement.category),
                rarity=ua.achievement.rarity.value,
                points=cast(int, ua.achievement.points),
                icon=cast(str, ua.achievement.icon),
                max_progress=cast(int, ua.achievement.max_progress),
                is_earned=True,
                current_progress=cast(int, ua.current_progress) or 0,
                earned_at=ua.earned_at.isoformat() if ua.earned_at else None,
                progress_percentage=100.0
            ))
    
    # Add available achievements
    for achievement in available_achievements:
        # Check if user has progress on this achievement
        user_progress = next((ua for ua in user_achievements if ua.achievement_id == achievement.id), None)
        current_progress = user_progress.current_progress if user_progress else 0
        progress_percentage = (current_progress / achievement.max_progress) * 100 if achievement.max_progress > 0 else 0
        
        achievements.append(AchievementResponse(
            id=cast(int, achievement.id),
            title=cast(str, achievement.title),
            description=cast(str, achievement.description),
            category=cast(str, achievement.category),
            rarity=achievement.rarity.value,
            points=cast(int, achievement.points),
            icon=cast(str, achievement.icon),
            max_progress=cast(int, achievement.max_progress),
            is_earned=False,
            current_progress=cast(int, current_progress) or 0,
            progress_percentage=cast(float, progress_percentage) or 0.0
        ))
    
    return achievements

@router.get("/achievements/{achievement_id}")
async def get_achievement_details(
    achievement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific achievement"""
    service = GamificationService(db)
    
    # Get achievement
    achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    # Get user's progress on this achievement
    user_id = cast(int, current_user.id)
    user_achievement = service.check_achievement_progress(user_id, achievement_id)
    
    return {
        "achievement": achievement,
        "user_progress": user_achievement,
        "progress_percentage": user_achievement.progress_percentage if user_achievement else 0
    }

# Streak Endpoints
@router.get("/streaks", response_model=List[StreakResponse])
async def get_user_streaks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all streaks for the current user"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    streaks = service.get_user_streaks(user_id)
    
    return [
        StreakResponse(
            id=cast(int, streak.id),
            streak_type=cast(str, streak.streak_type),
            current_count=cast(int, streak.current_count) or 0,
            longest_count=cast(int, streak.longest_count) or 0,
            is_active=cast(bool, streak.is_active) or False,
            start_date=streak.start_date.isoformat(),
            last_activity_date=streak.last_activity_date.isoformat()
        )
        for streak in streaks
    ]

@router.post("/streaks/{streak_type}/update")
async def update_streak(
    streak_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific streak type"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    streak = service.update_streak(user_id, streak_type)
    
    return {
        "message": f"Streak {streak_type} updated",
        "streak": {
            "current_count": streak.current_count,
            "longest_count": streak.longest_count,
            "is_active": streak.is_active
        }
    }

# Points and Leveling Endpoints
@router.get("/points", response_model=UserPointsResponse)
async def get_user_points(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's points and level information"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    points = service.get_user_points(user_id)
    
    return UserPointsResponse(
        total_points=cast(int, points.total_points) or 0,
        level=cast(int, points.level) or 0,
        experience_points=cast(int, points.experience_points) or 0,
        level_progress_percentage=cast(float, points.level_progress_percentage) or 0.0,
        achievement_points=cast(int, points.achievement_points) or 0,
        goal_points=cast(int, points.goal_points) or 0,
        streak_points=cast(int, points.streak_points) or 0,
        social_points=cast(int, points.social_points) or 0
    )

@router.post("/points/add")
async def add_points(
    points: int,
    category: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add points to user account (admin/system use)"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    user_points = service.add_points(user_id, points, category)
    
    return {
        "message": f"Added {points} points",
        "total_points": user_points.total_points,
        "level": user_points.level
    }

# Leaderboard Endpoints
@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    leaderboard_type: str = Query("points", description="Type of leaderboard: points, achievements"),
    limit: int = Query(10, description="Number of entries to return"),
    db: Session = Depends(get_db)
):
    """Get leaderboard data"""
    service = GamificationService(db)
    leaderboard_data = service.get_leaderboard(leaderboard_type, limit)
    
    return [LeaderboardEntry(**entry) for entry in leaderboard_data]

# Statistics Endpoints
@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive user gamification statistics"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    stats = service.get_user_stats(user_id)
    
    return UserStatsResponse(**stats)

# Task Integration Endpoints
@router.post("/tasks/{task_id}/progress")
async def handle_task_progress(
    task_id: int,
    old_status: str,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle task progress updates for gamification"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    service.handle_task_progress(user_id, task_id, old_status, new_status)
    
    return {"message": "Task progress processed for gamification"}

@router.post("/tasks/{task_id}/complete")
async def handle_task_completion(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle task completion for gamification"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    service.handle_task_completion(user_id, task_id)
    
    return {"message": "Task completion processed for gamification"}

# Achievement Management (Admin)
@router.post("/achievements/{achievement_id}/award")
async def award_achievement(
    achievement_id: int,
    user_id: int,
    context_data: Optional[Dict] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Award an achievement to a user (admin only)"""
    # TODO: Add admin permission check
    service = GamificationService(db)
    success = service.award_achievement(user_id, achievement_id, context_data)
    
    if success:
        return {"message": "Achievement awarded successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to award achievement")

@router.post("/achievements/{achievement_id}/progress")
async def update_achievement_progress(
    achievement_id: int,
    progress: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update achievement progress for current user"""
    service = GamificationService(db)
    user_id = cast(int, current_user.id)
    success = service.update_achievement_progress(user_id, achievement_id, progress)
    
    if success:
        return {"message": "Achievement progress updated"}
    else:
        raise HTTPException(status_code=400, detail="Failed to update achievement progress")

# System Endpoints
@router.post("/initialize")
async def initialize_gamification(
    db: Session = Depends(get_db)
):
    """Initialize gamification system with default achievements"""
    from ..services.gamification_service import create_default_achievements
    create_default_achievements(db)
    
    return {"message": "Gamification system initialized with default achievements"}

@router.get("/health")
async def gamification_health_check():
    """Health check for gamification system"""
    return {
        "status": "healthy",
        "service": "gamification",
        "features": [
            "achievements",
            "streaks", 
            "points",
            "leaderboards",
            "task_integration"
        ]
    }
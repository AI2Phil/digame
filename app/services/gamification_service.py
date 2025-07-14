"""
Gamification Service
Handles achievement tracking, streak management, and point calculations
"""

from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import logging

from ..models.gamification import (
    Achievement, UserAchievement, Streak, Milestone, UserPoints, 
    Badge, UserBadge, LeaderboardEntry, AchievementType, AchievementRarity
)
from ..models.user import User
from ..models.imports import Task

logger = logging.getLogger(__name__)

class GamificationService:
    """Service for managing gamification features"""
    
    def __init__(self, db: Session):
        self.db = db

    # Achievement Management
    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        """Get all achievements for a user"""
        return self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).all()

    def get_available_achievements(self, user_id: int) -> List[Achievement]:
        """Get all available achievements for a user"""
        # Get achievements user doesn't have yet
        user_achievement_ids = self.db.query(UserAchievement.achievement_id).filter(
            UserAchievement.user_id == user_id,
            UserAchievement.earned == True
        ).subquery()
        
        return self.db.query(Achievement).filter(
            Achievement.is_active == True,
            ~Achievement.id.in_(user_achievement_ids)
        ).all()

    def check_achievement_progress(self, user_id: int, achievement_id: int) -> Optional[UserAchievement]:
        """Check and update achievement progress"""
        user_achievement = self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement_id
        ).first()
        
        if not user_achievement:
            # Create new achievement progress
            achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
            if not achievement:
                return None
                
            user_achievement = UserAchievement()  # type: ignore
            setattr(user_achievement, 'user_id', user_id)  # type: ignore
            setattr(user_achievement, 'achievement_id', achievement_id)  # type: ignore
            setattr(user_achievement, 'current_progress', 0)  # type: ignore
            self.db.add(user_achievement)
            self.db.commit()
        
        return user_achievement

    def award_achievement(self, user_id: int, achievement_id: int, context_data: Optional[Dict] = None) -> bool:
        """Award an achievement to a user"""
        try:
            user_achievement = self.check_achievement_progress(user_id, achievement_id)
            if not user_achievement or user_achievement.earned:
                return False
            
            achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
            if not achievement:
                return False
            
            # Mark as earned with safe attribute assignment
            setattr(user_achievement, 'earned', True)  # type: ignore
            setattr(user_achievement, 'earned_at', datetime.now(timezone.utc))  # type: ignore
            setattr(user_achievement, 'current_progress', getattr(achievement, 'max_progress', 100))  # type: ignore
            setattr(user_achievement, 'context_data', context_data or {})  # type: ignore
            
            # Award points
            self.add_points(user_id, achievement.points, "achievement")
            
            self.db.commit()
            
            # Trigger notification
            self._trigger_achievement_notification(user_id, achievement)
            
            logger.info(f"Achievement {achievement.title} awarded to user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error awarding achievement: {e}")
            self.db.rollback()
            return False

    def update_achievement_progress(self, user_id: int, achievement_id: int, progress: int) -> bool:
        """Update achievement progress"""
        try:
            user_achievement = self.check_achievement_progress(user_id, achievement_id)
            if not user_achievement or user_achievement.earned:
                return False
            
            achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
            if not achievement:
                return False
            
            max_progress = getattr(achievement, 'max_progress', 100)
            setattr(user_achievement, 'current_progress', min(progress, max_progress))  # type: ignore
            
            # Check if achievement is now complete
            current_progress = getattr(user_achievement, 'current_progress', 0)
            max_progress = getattr(achievement, 'max_progress', 100)
            if current_progress >= max_progress:
                return self.award_achievement(user_id, achievement_id)
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error updating achievement progress: {e}")
            self.db.rollback()
            return False

    # Streak Management
    def get_user_streaks(self, user_id: int) -> List[Streak]:
        """Get all streaks for a user"""
        return self.db.query(Streak).filter(Streak.user_id == user_id).all()

    def get_active_streak(self, user_id: int, streak_type: str) -> Optional[Streak]:
        """Get active streak of a specific type"""
        return self.db.query(Streak).filter(
            Streak.user_id == user_id,
            Streak.streak_type == streak_type,
            Streak.is_active == True
        ).first()

    def update_streak(self, user_id: int, streak_type: str) -> Streak:
        """Update or create a streak"""
        streak = self.get_active_streak(user_id, streak_type)
        
        if not streak:
            # Create new streak
            streak = Streak()  # type: ignore
            setattr(streak, 'user_id', user_id)  # type: ignore
            setattr(streak, 'streak_type', streak_type)  # type: ignore
            setattr(streak, 'current_count', 1)  # type: ignore
            setattr(streak, 'longest_count', 1)  # type: ignore
            setattr(streak, 'start_date', datetime.now(timezone.utc))  # type: ignore
            setattr(streak, 'last_activity_date', datetime.now(timezone.utc))  # type: ignore
            self.db.add(streak)
        else:
            # Update existing streak
            # Safe method call with fallback
            update_method = getattr(streak, 'update_streak', lambda: False)
            if update_method():
                # Streak continues
                pass
            else:
                # Streak broken, create new one
                setattr(streak, 'is_active', False)  # type: ignore
                setattr(streak, 'end_date', datetime.now(timezone.utc))  # type: ignore
                
                new_streak = Streak()  # type: ignore
                setattr(new_streak, 'user_id', user_id)  # type: ignore
                setattr(new_streak, 'streak_type', streak_type)  # type: ignore
                setattr(new_streak, 'current_count', 1)  # type: ignore
                setattr(new_streak, 'longest_count', 1)  # type: ignore
                setattr(new_streak, 'start_date', datetime.now(timezone.utc))  # type: ignore
                setattr(new_streak, 'last_activity_date', datetime.now(timezone.utc))  # type: ignore
                self.db.add(new_streak)
                streak = new_streak
        
        self.db.commit()
        
        # Check for streak achievements
        self._check_streak_achievements(user_id, streak)
        
        return streak

    def break_streak(self, user_id: int, streak_type: str) -> bool:
        """Manually break a streak"""
        streak = self.get_active_streak(user_id, streak_type)
        if streak:
            setattr(streak, 'is_active', False)  # type: ignore
            setattr(streak, 'end_date', datetime.now(timezone.utc))  # type: ignore
            self.db.commit()
            return True
        return False

    # Points and Leveling
    def get_user_points(self, user_id: int) -> UserPoints:
        """Get user points, create if doesn't exist"""
        points = self.db.query(UserPoints).filter(UserPoints.user_id == user_id).first()
        if not points:
            points = UserPoints()  # type: ignore
            setattr(points, 'user_id', user_id)  # type: ignore
            self.db.add(points)
            self.db.commit()
        return points

    def add_points(self, user_id: int, points: int, category: str = "general") -> UserPoints:
        """Add points to user account"""
        user_points = self.get_user_points(user_id)
        old_level = getattr(user_points, 'level', 1)
        
        # Safe method call with fallback
        add_points_method = getattr(user_points, 'add_points', None)
        if add_points_method:
            add_points_method(points, category)
        else:
            # Fallback: manually add points
            current_total = getattr(user_points, 'total_points', 0)
            setattr(user_points, 'total_points', current_total + points)  # type: ignore
        
        self.db.commit()
        
        # Check for level up achievements
        new_level = getattr(user_points, 'level', 1)
        if new_level > old_level:
            self._check_level_achievements(user_id, new_level)
        
        return user_points

    # Task Integration (replacing Goal Integration)
    def handle_task_progress(self, user_id: int, task_id: int, old_status: str, new_status: str):
        """Handle task progress updates for gamification"""
        # Update daily task streak
        if new_status in ["in_progress", "completed"] and old_status in ["suggested", "accepted"]:
            self.update_streak(user_id, "daily_task_progress")
        
        # Check for task completion
        if new_status == "completed" and old_status != "completed":
            self.handle_task_completion(user_id, task_id)

    def handle_task_completion(self, user_id: int, task_id: int):
        """Handle task completion for gamification"""
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return
        
        # Award points based on task priority score with safe access
        priority_score = getattr(task, 'priority_score', 0.5)
        if priority_score >= 0.8:
            points = 50  # High priority
        elif priority_score >= 0.5:
            points = 25  # Medium priority
        else:
            points = 10  # Low priority
            
        self.add_points(user_id, points, "task")
        
        # Update task completion streak
        self.update_streak(user_id, "task_completion")
        
        # Check for task-related achievements
        self._check_task_achievements(user_id)

    # Achievement Checking Logic
    def _check_task_achievements(self, user_id: int):
        """Check for task-related achievements"""
        # Get user's completed tasks count
        completed_tasks = self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.status == "completed"
        ).count()
        
        # Define task achievements
        task_achievements = [
            (1, "first_task"),
            (5, "task_achiever"),
            (10, "task_master"),
            (25, "task_legend"),
            (50, "task_champion")
        ]
        
        for count, achievement_key in task_achievements:
            if completed_tasks >= count:
                achievement = self.db.query(Achievement).filter(
                    Achievement.category == "tasks",
                    getattr(Achievement.title, 'contains', lambda x: True)(achievement_key.replace("_", " ").title())
                ).first()
                if achievement:
                    self.award_achievement(user_id, achievement.id)

    def _check_streak_achievements(self, user_id: int, streak: Streak):
        """Check for streak-related achievements"""
        streak_achievements = [
            (7, "week_warrior"),
            (30, "month_master"),
            (100, "streak_legend")
        ]
        
        for count, achievement_key in streak_achievements:
            if streak.current_count >= count:
                achievement = self.db.query(Achievement).filter(
                    Achievement.category == "activity",
                    getattr(Achievement.title, 'contains', lambda x: True)(achievement_key.replace("_", " ").title())
                ).first()
                if achievement:
                    self.award_achievement(user_id, achievement.id)

    def _check_level_achievements(self, user_id: int, level: int):
        """Check for level-related achievements"""
        level_achievements = [
            (5, "rising_star"),
            (10, "experienced_user"),
            (25, "platform_veteran"),
            (50, "legendary_user")
        ]
        
        for required_level, achievement_key in level_achievements:
            if level >= required_level:
                achievement = self.db.query(Achievement).filter(
                    Achievement.category == "profile",
                    getattr(Achievement.title, 'contains', lambda x: True)(achievement_key.replace("_", " ").title())
                ).first()
                if achievement:
                    self.award_achievement(user_id, achievement.id)

    def _check_milestone_achievements(self, user_id: int, milestone: int):
        """Check for milestone-related achievements"""
        # Award points for reaching milestones
        milestone_points = {25: 5, 50: 10, 75: 15, 90: 20}
        points = milestone_points.get(milestone, 0)
        if points:
            self.add_points(user_id, points, "goal")

    def _trigger_achievement_notification(self, user_id: int, achievement: Achievement):
        """Trigger achievement notification"""
        # This would integrate with the notification system
        # For now, just log it
        logger.info(f"Achievement notification: {achievement.title} for user {user_id}")

    # Leaderboard Management
    def get_leaderboard(self, leaderboard_type: str = "points", limit: int = 10) -> List[Dict]:
        """Get leaderboard data"""
        if leaderboard_type == "points":
            try:
                results = self.db.query(UserPoints, User).join(User).order_by(
                    getattr(UserPoints.total_points, 'desc', lambda: UserPoints.total_points)()
                ).limit(limit).all()
            except Exception as e:
                logger.error(f"Leaderboard query error: {e}")
                results = []
            
            return [
                {
                    "rank": idx + 1,
                    "user_id": getattr(points, 'user_id', 0),
                    "username": getattr(user, 'username', 'Unknown'),
                    "score": getattr(points, 'total_points', 0),
                    "level": getattr(points, 'level', 1)
                }
                for idx, (points, user) in enumerate(results)
            ]
        
        elif leaderboard_type == "achievements":
            # Count achievements per user
            from sqlalchemy import func
            try:
                results = self.db.query(
                    UserAchievement.user_id,
                    User.username,
                    func.count(UserAchievement.id).label("achievement_count")
                ).join(User).filter(
                    UserAchievement.earned == True
                ).group_by(
                    UserAchievement.user_id, User.username
                ).order_by(
                    func.count(UserAchievement.id).desc()
                ).limit(limit).all()
            except Exception as e:
                logger.error(f"Achievement leaderboard query error: {e}")
                results = []
            
            return [
                {
                    "rank": idx + 1,
                    "user_id": getattr(result, 'user_id', 0),
                    "username": getattr(result, 'username', 'Unknown'),
                    "score": getattr(result, 'achievement_count', 0)
                }
                for idx, result in enumerate(results)
            ]
        
        return []

    # Statistics
    def get_user_stats(self, user_id: int) -> Dict:
        """Get comprehensive user gamification stats"""
        points = self.get_user_points(user_id)
        achievements = self.get_user_achievements(user_id)
        streaks = self.get_user_streaks(user_id)
        
        earned_achievements = [a for a in achievements if getattr(a, 'earned', False)]
        active_streaks = [s for s in streaks if getattr(s, 'is_active', False)]
        
        return {
            "points": {
                "total": getattr(points, 'total_points', 0),
                "level": getattr(points, 'level', 1),
                "experience": getattr(points, 'experience_points', 0),
                "next_level_progress": getattr(points, 'level_progress_percentage', 0),
                "breakdown": {
                    "achievement": getattr(points, 'achievement_points', 0),
                    "goal": getattr(points, 'goal_points', 0),
                    "streak": getattr(points, 'streak_points', 0),
                    "social": getattr(points, 'social_points', 0)
                }
            },
            "achievements": {
                "total_earned": len(earned_achievements),
                "total_available": len(achievements),
                "completion_rate": len(earned_achievements) / len(achievements) * 100 if achievements else 0,
                "recent": [
                    {
                        "title": getattr(getattr(a, 'achievement', None), 'title', 'Unknown'),
                        "rarity": getattr(getattr(getattr(a, 'achievement', None), 'rarity', None), 'value', 'common'),
                        "points": getattr(getattr(a, 'achievement', None), 'points', 0),
                        "earned_at": getattr(a, 'earned_at', datetime.min).isoformat() if getattr(a, 'earned_at', None) else None
                    }
                    for a in sorted(earned_achievements, key=lambda x: getattr(x, 'earned_at', datetime.min), reverse=True)[:5]
                ]
            },
            "streaks": {
                "active_count": len(active_streaks),
                "longest_streak": max([getattr(s, 'longest_count', 0) for s in streaks], default=0),
                "current_streaks": [
                    {
                        "type": getattr(s, 'streak_type', 'unknown'),
                        "count": getattr(s, 'current_count', 0),
                        "start_date": getattr(s, 'start_date', datetime.now(timezone.utc)).isoformat()
                    }
                    for s in active_streaks
                ]
            }
        }

# Initialize default achievements
def create_default_achievements(db: Session):
    """Create default achievements for the platform"""
    default_achievements = [
        # Task Achievements
        {
            "title": "First Steps",
            "description": "Complete your first task",
            "category": "tasks",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.COMMON,
            "criteria": {"tasks_completed": 1},
            "points": 10,
            "icon": "target"
        },
        {
            "title": "Task Achiever",
            "description": "Complete 5 tasks",
            "category": "tasks",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.UNCOMMON,
            "criteria": {"tasks_completed": 5},
            "points": 25,
            "icon": "trophy"
        },
        {
            "title": "Task Master",
            "description": "Complete 10 tasks",
            "category": "tasks",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.RARE,
            "criteria": {"tasks_completed": 10},
            "points": 50,
            "icon": "crown"
        },
        
        # Streak Achievements
        {
            "title": "Week Warrior",
            "description": "Maintain a 7-day activity streak",
            "category": "activity",
            "type": AchievementType.STREAK,
            "rarity": AchievementRarity.UNCOMMON,
            "criteria": {"streak_days": 7},
            "points": 30,
            "icon": "fire"
        },
        {
            "title": "Month Master",
            "description": "Maintain a 30-day activity streak",
            "category": "activity",
            "type": AchievementType.STREAK,
            "rarity": AchievementRarity.EPIC,
            "criteria": {"streak_days": 30},
            "points": 100,
            "icon": "fire"
        },
        
        # Profile Achievements
        {
            "title": "Profile Perfectionist",
            "description": "Complete 100% of your profile",
            "category": "profile",
            "type": AchievementType.MILESTONE,
            "rarity": AchievementRarity.COMMON,
            "criteria": {"profile_completion": 100},
            "points": 15,
            "icon": "star"
        },
        
        # Learning Achievements
        {
            "title": "Learning Enthusiast",
            "description": "Complete 5 learning goals",
            "category": "learning",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.RARE,
            "criteria": {"learning_goals_completed": 5},
            "points": 40,
            "icon": "book"
        },
        
        # Social Achievements
        {
            "title": "Social Butterfly",
            "description": "Connect with 10 other users",
            "category": "social",
            "type": AchievementType.SOCIAL,
            "rarity": AchievementRarity.UNCOMMON,
            "criteria": {"connections": 10},
            "points": 20,
            "icon": "users"
        }
    ]
    
    for achievement_data in default_achievements:
        existing = db.query(Achievement).filter(
            Achievement.title == achievement_data["title"]
        ).first()
        
        if not existing:
            achievement = Achievement()  # type: ignore
            for key, value in achievement_data.items():
                setattr(achievement, key, value)  # type: ignore
            db.add(achievement)
    
    db.commit()
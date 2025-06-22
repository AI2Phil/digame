"""
Gamification Service
Handles achievement tracking, streak management, and point calculations
"""

from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from ..models.gamification import (
    Achievement, UserAchievement, Streak, Milestone, UserPoints, 
    Badge, UserBadge, LeaderboardEntry, AchievementType, AchievementRarity
)
from ..models.user import User
from ..models.goal import Goal

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
                
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement_id,
                current_progress=0
            )
            self.db.add(user_achievement)
            self.db.commit()
        
        return user_achievement

    def award_achievement(self, user_id: int, achievement_id: int, context_data: Dict = None) -> bool:
        """Award an achievement to a user"""
        try:
            user_achievement = self.check_achievement_progress(user_id, achievement_id)
            if not user_achievement or user_achievement.earned:
                return False
            
            achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
            if not achievement:
                return False
            
            # Mark as earned
            user_achievement.earned = True
            user_achievement.earned_at = datetime.utcnow()
            user_achievement.current_progress = achievement.max_progress
            user_achievement.context_data = context_data or {}
            
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
            
            user_achievement.current_progress = min(progress, achievement.max_progress)
            
            # Check if achievement is now complete
            if user_achievement.current_progress >= achievement.max_progress:
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
            streak = Streak(
                user_id=user_id,
                streak_type=streak_type,
                current_count=1,
                longest_count=1,
                start_date=datetime.utcnow(),
                last_activity_date=datetime.utcnow()
            )
            self.db.add(streak)
        else:
            # Update existing streak
            if streak.update_streak():
                # Streak continues
                pass
            else:
                # Streak broken, create new one
                streak.is_active = False
                streak.end_date = datetime.utcnow()
                
                new_streak = Streak(
                    user_id=user_id,
                    streak_type=streak_type,
                    current_count=1,
                    longest_count=1,
                    start_date=datetime.utcnow(),
                    last_activity_date=datetime.utcnow()
                )
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
            streak.is_active = False
            streak.end_date = datetime.utcnow()
            self.db.commit()
            return True
        return False

    # Points and Leveling
    def get_user_points(self, user_id: int) -> UserPoints:
        """Get user points, create if doesn't exist"""
        points = self.db.query(UserPoints).filter(UserPoints.user_id == user_id).first()
        if not points:
            points = UserPoints(user_id=user_id)
            self.db.add(points)
            self.db.commit()
        return points

    def add_points(self, user_id: int, points: int, category: str = "general") -> UserPoints:
        """Add points to user account"""
        user_points = self.get_user_points(user_id)
        old_level = user_points.level
        
        user_points.add_points(points, category)
        self.db.commit()
        
        # Check for level up achievements
        if user_points.level > old_level:
            self._check_level_achievements(user_id, user_points.level)
        
        return user_points

    # Goal Integration
    def handle_goal_progress(self, user_id: int, goal_id: int, old_progress: float, new_progress: float):
        """Handle goal progress updates for gamification"""
        # Update daily goal streak
        if new_progress > old_progress:
            self.update_streak(user_id, "daily_goal_progress")
        
        # Check for goal completion
        if new_progress >= 100 and old_progress < 100:
            self.handle_goal_completion(user_id, goal_id)
        
        # Check for milestone achievements
        milestones = [25, 50, 75, 90]
        for milestone in milestones:
            if old_progress < milestone <= new_progress:
                self._check_milestone_achievements(user_id, milestone)

    def handle_goal_completion(self, user_id: int, goal_id: int):
        """Handle goal completion for gamification"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            return
        
        # Award points based on goal priority
        points_map = {"low": 10, "medium": 25, "high": 50}
        points = points_map.get(goal.priority, 25)
        self.add_points(user_id, points, "goal")
        
        # Update goal completion streak
        self.update_streak(user_id, "goal_completion")
        
        # Check for goal-related achievements
        self._check_goal_achievements(user_id)

    # Achievement Checking Logic
    def _check_goal_achievements(self, user_id: int):
        """Check for goal-related achievements"""
        # Get user's completed goals count
        completed_goals = self.db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.current_value >= Goal.target_value
        ).count()
        
        # Define goal achievements
        goal_achievements = [
            (1, "first_goal"),
            (5, "goal_achiever"),
            (10, "goal_master"),
            (25, "goal_legend"),
            (50, "goal_champion")
        ]
        
        for count, achievement_key in goal_achievements:
            if completed_goals >= count:
                achievement = self.db.query(Achievement).filter(
                    Achievement.category == "goals",
                    Achievement.title.contains(achievement_key.replace("_", " ").title())
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
                    Achievement.title.contains(achievement_key.replace("_", " ").title())
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
                    Achievement.title.contains(achievement_key.replace("_", " ").title())
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
            results = self.db.query(UserPoints, User).join(User).order_by(
                UserPoints.total_points.desc()
            ).limit(limit).all()
            
            return [
                {
                    "rank": idx + 1,
                    "user_id": points.user_id,
                    "username": user.username,
                    "score": points.total_points,
                    "level": points.level
                }
                for idx, (points, user) in enumerate(results)
            ]
        
        elif leaderboard_type == "achievements":
            # Count achievements per user
            from sqlalchemy import func
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
            
            return [
                {
                    "rank": idx + 1,
                    "user_id": result.user_id,
                    "username": result.username,
                    "score": result.achievement_count
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
        
        earned_achievements = [a for a in achievements if a.earned]
        active_streaks = [s for s in streaks if s.is_active]
        
        return {
            "points": {
                "total": points.total_points,
                "level": points.level,
                "experience": points.experience_points,
                "next_level_progress": points.level_progress_percentage,
                "breakdown": {
                    "achievement": points.achievement_points,
                    "goal": points.goal_points,
                    "streak": points.streak_points,
                    "social": points.social_points
                }
            },
            "achievements": {
                "total_earned": len(earned_achievements),
                "total_available": len(achievements),
                "completion_rate": len(earned_achievements) / len(achievements) * 100 if achievements else 0,
                "recent": [
                    {
                        "title": a.achievement.title,
                        "rarity": a.achievement.rarity.value,
                        "points": a.achievement.points,
                        "earned_at": a.earned_at.isoformat() if a.earned_at else None
                    }
                    for a in sorted(earned_achievements, key=lambda x: x.earned_at or datetime.min, reverse=True)[:5]
                ]
            },
            "streaks": {
                "active_count": len(active_streaks),
                "longest_streak": max([s.longest_count for s in streaks], default=0),
                "current_streaks": [
                    {
                        "type": s.streak_type,
                        "count": s.current_count,
                        "start_date": s.start_date.isoformat()
                    }
                    for s in active_streaks
                ]
            }
        }

# Initialize default achievements
def create_default_achievements(db: Session):
    """Create default achievements for the platform"""
    default_achievements = [
        # Goal Achievements
        {
            "title": "First Steps",
            "description": "Complete your first goal",
            "category": "goals",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.COMMON,
            "criteria": {"goals_completed": 1},
            "points": 10,
            "icon": "target"
        },
        {
            "title": "Goal Achiever",
            "description": "Complete 5 goals",
            "category": "goals",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.UNCOMMON,
            "criteria": {"goals_completed": 5},
            "points": 25,
            "icon": "trophy"
        },
        {
            "title": "Goal Master",
            "description": "Complete 10 goals",
            "category": "goals",
            "type": AchievementType.GOAL_COMPLETION,
            "rarity": AchievementRarity.RARE,
            "criteria": {"goals_completed": 10},
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

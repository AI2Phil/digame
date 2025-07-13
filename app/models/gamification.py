"""
Gamification Models
Comprehensive gamification system with achievements, streaks, milestones, and rewards
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.database import Base

class AchievementType(enum.Enum):
    """Types of achievements"""
    GOAL_COMPLETION = "goal_completion"
    STREAK = "streak"
    MILESTONE = "milestone"
    SOCIAL = "social"
    LEARNING = "learning"
    PRODUCTIVITY = "productivity"
    PROFILE = "profile"
    ACTIVITY = "activity"

class AchievementRarity(enum.Enum):
    """Achievement rarity levels"""
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class Achievement(Base):
    """Achievement definitions"""
    __tablename__ = "achievements"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # goals, learning, social, etc.
    type = Column(Enum(AchievementType), nullable=False)
    rarity = Column(Enum(AchievementRarity), default=AchievementRarity.COMMON)
    
    # Achievement criteria
    criteria = Column(JSON, nullable=False)  # Flexible criteria definition
    points = Column(Integer, default=10)
    icon = Column(String(50), default="trophy")
    
    # Progression
    max_progress = Column(Integer, default=1)  # For progressive achievements
    is_repeatable = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)  # Secret achievements
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")

    @property
    def difficulty_score(self):
        """Calculate difficulty based on rarity and criteria"""
        rarity_multiplier = {
            AchievementRarity.COMMON: 1,
            AchievementRarity.UNCOMMON: 2,
            AchievementRarity.RARE: 3,
            AchievementRarity.EPIC: 4,
            AchievementRarity.LEGENDARY: 5
        }
        return self.points * rarity_multiplier.get(self.rarity, 1)

class UserAchievement(Base):
    """User's earned achievements"""
    __tablename__ = "user_achievements"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Progress tracking
    current_progress = Column(Integer, default=0)
    earned = Column(Boolean, default=False)
    earned_at = Column(DateTime, nullable=True)
    
    # Context data
    context_data = Column(JSON, default={})  # Additional data about how it was earned
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships
    # user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.achievement.max_progress == 0:
            return 100 if self.earned else 0
        return min((self.current_progress / self.achievement.max_progress) * 100, 100)

class Streak(Base):
    """User activity streaks"""
    __tablename__ = "streaks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Streak details
    streak_type = Column(String(50), nullable=False)  # daily_login, goal_progress, etc.
    current_count = Column(Integer, default=0)
    longest_count = Column(Integer, default=0)
    
    # Dates
    start_date = Column(DateTime, nullable=False)
    last_activity_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # When streak was broken
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships
    # user = relationship("User", back_populates="streaks")

    @property
    def days_since_last_activity(self):
        """Calculate days since last activity"""
        return (datetime.utcnow() - self.last_activity_date).days

    @property
    def is_broken(self):
        """Check if streak is broken (more than 1 day gap)"""
        return self.days_since_last_activity > 1

    def update_streak(self):
        """Update streak based on current activity"""
        if self.is_broken:
            self.is_active = False
            self.end_date = datetime.utcnow()
            return False
        
        # Update current count if activity is today
        today = datetime.utcnow().date()
        if self.last_activity_date.date() == today:
            return True  # Already counted today
        
        # Increment streak
        self.current_count += 1
        self.longest_count = max(self.longest_count, self.current_count)
        self.last_activity_date = datetime.utcnow()
        return True

class Milestone(Base):
    """Goal milestones and checkpoints"""
    __tablename__ = "milestones"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, nullable=True)  # TODO: Add ForeignKey when goals table is created
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Milestone details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=False)
    reward_points = Column(Integer, default=5)
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships
    # user = relationship("User")
    # goal = relationship("Goal", back_populates="milestones")

class UserPoints(Base):
    """User points and scoring system"""
    __tablename__ = "user_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Points breakdown
    total_points = Column(Integer, default=0)
    achievement_points = Column(Integer, default=0)
    goal_points = Column(Integer, default=0)
    streak_points = Column(Integer, default=0)
    social_points = Column(Integer, default=0)
    
    # Level system
    level = Column(Integer, default=1)
    experience_points = Column(Integer, default=0)
    points_to_next_level = Column(Integer, default=100)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships
    # user = relationship("User", back_populates="points")

    def add_points(self, points: int, category: str = "general"):
        """Add points and update level"""
        self.total_points += points
        self.experience_points += points
        
        # Update category-specific points
        if category == "achievement":
            self.achievement_points += points
        elif category == "goal":
            self.goal_points += points
        elif category == "streak":
            self.streak_points += points
        elif category == "social":
            self.social_points += points
        
        # Check for level up
        self._check_level_up()

    def _check_level_up(self):
        """Check and handle level progression"""
        while self.experience_points >= self.points_to_next_level:
            self.experience_points -= self.points_to_next_level
            self.level += 1
            # Exponential level progression
            self.points_to_next_level = int(100 * (1.5 ** (self.level - 1)))

    @property
    def level_progress_percentage(self):
        """Calculate progress to next level"""
        if self.points_to_next_level == 0:
            return 100
        return (self.experience_points / self.points_to_next_level) * 100

class Badge(Base):
    """Special badges and titles"""
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), default="badge")
    color = Column(String(20), default="blue")
    
    # Requirements
    requirements = Column(JSON, nullable=False)
    is_exclusive = Column(Boolean, default=False)  # Only one user can have it
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")

class UserBadge(Base):
    """User's earned badges"""
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    
    # Status
    earned_at = Column(DateTime, default=datetime.utcnow)
    is_displayed = Column(Boolean, default=True)  # Show on profile
    
    # Temporarily commented out to resolve SQLAlchemy mapper issues
    # # Relationships
    # user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

class LeaderboardEntry(Base):
    """Leaderboard rankings"""
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Leaderboard details
    leaderboard_type = Column(String(50), nullable=False)  # points, achievements, streaks
    score = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)
    
    # Time period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

# Update User model to include gamification relationships
# This would be added to the existing User model in models/user.py:
"""
# Add these relationships to the User model:
achievements = relationship("UserAchievement", back_populates="user")
streaks = relationship("Streak", back_populates="user")
points = relationship("UserPoints", back_populates="user", uselist=False)
badges = relationship("UserBadge", back_populates="user")
"""
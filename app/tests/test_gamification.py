"""
Test script for gamification system
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from ..models.gamification import (
    Achievement, UserAchievement, Streak, UserPoints, 
    AchievementType, AchievementRarity
)
from ..models.user import Base, User
from ..services.gamification_service import GamificationService, create_default_achievements

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_gamification.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_test_db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)

def teardown_test_db():
    """Drop test database tables"""
    Base.metadata.drop_all(bind=engine)

def test_gamification_service():
    """Test basic gamification service functionality"""
    setup_test_db()
    
    try:
        db = TestingSessionLocal()
        
        # Create test user
        test_user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True
        )
        db.add(test_user)
        db.commit()
        
        # Initialize gamification service
        service = GamificationService(db)
        
        # Create default achievements
        create_default_achievements(db)
        
        # Test user points creation
        points = service.get_user_points(test_user.id)
        assert points.total_points == 0
        assert points.level == 1
        
        # Test adding points
        updated_points = service.add_points(test_user.id, 50, "test")
        assert updated_points.total_points == 50
        
        # Test streak creation
        streak = service.update_streak(test_user.id, "daily_activity")
        assert streak.current_count == 1
        assert streak.is_active == True
        
        # Test achievement progress
        achievements = db.query(Achievement).all()
        if achievements:
            achievement = achievements[0]
            success = service.update_achievement_progress(test_user.id, achievement.id, 1)
            assert success == True
        
        # Test user stats
        stats = service.get_user_stats(test_user.id)
        assert "points" in stats
        assert "achievements" in stats
        assert "streaks" in stats
        
        print("✅ All gamification tests passed!")
        
    finally:
        db.close()
        teardown_test_db()

if __name__ == "__main__":
    test_gamification_service()
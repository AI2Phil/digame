"""
User Factory for Test Isolation
Provides safe User instance creation that bypasses SQLAlchemy registry conflicts
"""

from sqlalchemy.orm import Session
from typing import Optional, Dict, Any


class UserFactory:
    """Factory for creating User instances in tests with registry-safe resolution"""
    
    @staticmethod
    def _get_user_class():
        """Safely resolve User class from registry or direct import"""
        try:
            # First try to get from SQLAlchemy registry
            from app.database import Base
            if 'User' in Base.registry._class_registry:
                return Base.registry._class_registry['User']
        except Exception:
            pass
        
        # Fallback to direct import
        try:
            from app.models.user import User
            return User
        except Exception:
            pass
        
        # Last resort - try to find User in registry by iteration
        try:
            from app.database import Base
            for key, value in Base.registry._class_registry.items():
                if hasattr(value, '__tablename__') and getattr(value, '__tablename__', None) == 'users':
                    return value
        except Exception:
            pass
        
        raise RuntimeError("Could not resolve User class from registry or imports")
    
    @staticmethod
    def create_user(session: Session, **kwargs):
        """Create User with explicit session binding and safe class resolution"""
        UserClass = UserFactory._get_user_class()
        
        # Ensure we're using the correct User class with safe defaults
        user_data = {
            'username': kwargs.get('username', 'test_user'),
            'email': kwargs.get('email', 'test@example.com'),
            'hashed_password': kwargs.get('hashed_password', 'fake_hashed_password'),
            'first_name': kwargs.get('first_name', 'Test'),
            'last_name': kwargs.get('last_name', 'User'),
            'is_active': kwargs.get('is_active', True),
            'onboarding_completed': kwargs.get('onboarding_completed', True),
        }
        
        # Add any additional fields provided
        for key, value in kwargs.items():
            if key not in user_data:
                user_data[key] = value
        
        user = UserClass(**user_data)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    
    @staticmethod
    def build_user(**kwargs):
        """Build User instance without persisting"""
        UserClass = UserFactory._get_user_class()
        
        user_data = {
            'username': kwargs.get('username', 'test_user'),
            'email': kwargs.get('email', 'test@example.com'),
            'hashed_password': kwargs.get('hashed_password', 'fake_hashed_password'),
            'first_name': kwargs.get('first_name', 'Test'),
            'last_name': kwargs.get('last_name', 'User'),
            'is_active': kwargs.get('is_active', True),
            'onboarding_completed': kwargs.get('onboarding_completed', True),
        }
        
        # Add any additional fields provided
        for key, value in kwargs.items():
            if key not in user_data:
                user_data[key] = value
        
        return UserClass(**user_data)
    
    @staticmethod
    def create_team_owner(session: Session, **kwargs):
        """Create a user specifically for team ownership tests"""
        defaults = {
            'username': 'team_owner',
            'email': 'team_owner@example.com',
            'first_name': 'Team',
            'last_name': 'Owner',
        }
        defaults.update(kwargs)
        return UserFactory.create_user(session, **defaults)
    
    @staticmethod
    def create_admin_user(session: Session, **kwargs):
        """Create an admin user for testing"""
        defaults = {
            'username': 'admin_user',
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'User',
        }
        defaults.update(kwargs)
        return UserFactory.create_user(session, **defaults)
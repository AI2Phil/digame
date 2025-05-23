"""
Authentication Service for Digame Platform

This service provides comprehensive authentication functionality including:
- User registration and login
- Token management
- Password reset
- Account verification
- Session management
"""

from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import secrets
import logging

from .jwt_handler import TokenHandler, PasswordHandler
from ..models.user import User
from ..models.rbac import Role
from ..crud.user_crud import (
    get_user_by_email, 
    get_user_by_username, 
    create_user as crud_create_user,
    update_user as crud_update_user
)
from ..crud.rbac_crud import get_role_by_name, assign_role_to_user
from ..schemas.user_schemas import UserCreate, User as UserSchema

# Configure logging
logger = logging.getLogger(__name__)

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    pass

class AuthService:
    """Main authentication service class"""
    
    def __init__(self):
        self.token_handler = TokenHandler()
        self.password_handler = PasswordHandler()
    
    def register_user(
        self, 
        db: Session, 
        user_data: UserCreate,
        assign_default_role: bool = True
    ) -> Tuple[UserSchema, Dict[str, str]]:
        """
        Register a new user
        
        Args:
            db: Database session
            user_data: User registration data
            assign_default_role: Whether to assign default role
            
        Returns:
            Tuple of (User object, token pair)
            
        Raises:
            HTTPException: If registration fails
        """
        # Check if user already exists
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = get_user_by_username(db, user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        try:
            # Create user
            db_user = crud_create_user(db, user_data)
            
            # Assign default role if requested
            if assign_default_role:
                default_role = get_role_by_name(db, "User")
                if default_role and hasattr(db_user, 'id') and hasattr(default_role, 'id'):
                    assign_role_to_user(db, getattr(db_user, 'id'), getattr(default_role, 'id'))
                    db.refresh(db_user)
            
            # Generate tokens
            token_data = {
                "sub": str(db_user.id),
                "username": db_user.username,
                "email": db_user.email
            }
            tokens = self.token_handler.create_token_pair(token_data)
            
            logger.info(f"User registered successfully: {db_user.email}")
            
            return UserSchema.from_orm(db_user), tokens
            
        except Exception as e:
            logger.error(f"User registration failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed"
            )
    
    def authenticate_user(
        self, 
        db: Session, 
        username: str, 
        password: str
    ) -> Tuple[UserSchema, Dict[str, str]]:
        """
        Authenticate a user with username/email and password
        
        Args:
            db: Database session
            username: Username or email
            password: Plain text password
            
        Returns:
            Tuple of (User object, token pair)
            
        Raises:
            HTTPException: If authentication fails
        """
        # Try to find user by username or email
        user = get_user_by_username(db, username)
        if not user:
            user = get_user_by_email(db, username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        # Verify password
        if not self.password_handler.verify_password(password, str(user.hashed_password)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Generate tokens
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email
        }
        tokens = self.token_handler.create_token_pair(token_data)
        
        logger.info(f"User authenticated successfully: {user.email}")
        
        return UserSchema.from_orm(user), tokens
    
    def refresh_token(self, refresh_token: str) -> Dict[str, str]:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            New token pair
            
        Raises:
            HTTPException: If refresh token is invalid
        """
        payload = self.token_handler.verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new token pair
        token_data = {
            "sub": payload["sub"],
            "username": payload["username"],
            "email": payload["email"]
        }
        
        # Blacklist old refresh token
        self.token_handler.blacklist_token(refresh_token)
        
        new_tokens = self.token_handler.create_token_pair(token_data)
        
        logger.info(f"Token refreshed for user: {payload['email']}")
        
        return new_tokens
    
    def logout_user(self, access_token: str, refresh_token: Optional[str] = None) -> None:
        """
        Logout user by blacklisting tokens
        
        Args:
            access_token: User's access token
            refresh_token: User's refresh token (optional)
        """
        # Blacklist access token
        self.token_handler.blacklist_token(access_token)
        
        # Blacklist refresh token if provided
        if refresh_token:
            self.token_handler.blacklist_token(refresh_token)
        
        logger.info("User logged out successfully")
    
    def initiate_password_reset(self, db: Session, email: str) -> str:
        """
        Initiate password reset process
        
        Args:
            db: Database session
            email: User's email address
            
        Returns:
            Password reset token
            
        Raises:
            HTTPException: If user not found
        """
        user = get_user_by_email(db, email)
        if not user:
            # Don't reveal if email exists or not for security
            logger.warning(f"Password reset attempted for non-existent email: {email}")
            # Still return a token to prevent email enumeration
            return self.password_handler.generate_password_reset_token(email)
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is disabled"
            )
        
        reset_token = self.password_handler.generate_password_reset_token(email)
        
        logger.info(f"Password reset initiated for user: {email}")
        
        return reset_token
    
    def reset_password(
        self, 
        db: Session, 
        reset_token: str, 
        new_password: str
    ) -> bool:
        """
        Reset user password using reset token
        
        Args:
            db: Database session
            reset_token: Password reset token
            new_password: New password
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If reset fails
        """
        email = self.password_handler.verify_password_reset_token(reset_token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        user = get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update password
        hashed_password = self.password_handler.hash_password(new_password)
        setattr(user, 'hashed_password', hashed_password)
        setattr(user, 'updated_at', datetime.utcnow())
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Password reset completed for user: {email}")
        
        return True
    
    def change_password(
        self, 
        db: Session, 
        user_id: int, 
        current_password: str, 
        new_password: str
    ) -> bool:
        """
        Change user password (requires current password)
        
        Args:
            db: Database session
            user_id: User ID
            current_password: Current password
            new_password: New password
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If change fails
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not self.password_handler.verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        hashed_password = self.password_handler.hash_password(new_password)
        user.hashed_password = hashed_password
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"Password changed for user: {user.email}")
        
        return True
    
    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify an access token
        
        Args:
            token: Access token to verify
            
        Returns:
            Token payload if valid, None otherwise
        """
        return self.token_handler.verify_token(token, "access")
    
    def get_user_from_token(self, db: Session, token: str) -> Optional[User]:
        """
        Get user object from access token
        
        Args:
            db: Database session
            token: Access token
            
        Returns:
            User object if token is valid, None otherwise
        """
        payload = self.verify_access_token(token)
        if not payload:
            return None
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            return None
        user_id = int(user_id_str)
        return db.query(User).filter(User.id == user_id).first()

# Create singleton instance
auth_service = AuthService()
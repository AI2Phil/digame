"""
Guest User Service for Enhanced Registration and Onboarding
Phase 1: Guest Registration Flow Implementation
"""

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.user import User
from ..models.guest_onboarding import GuestOnboardingProgress, DigitalTwinProfile, EmailVerification
from ..crud.user_crud import pwd_context
from ..schemas.user_schemas import UserCreate


class GuestUserService:
    """Service for managing guest user registration and onboarding"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_guest_user(
        self, 
        email: str, 
        password: str, 
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        skip_email_verification: bool = False
    ) -> Dict[str, Any]:
        """
        Create a new guest user with enhanced registration flow
        
        Args:
            email: User's email address
            password: Plain text password
            first_name: Optional first name
            last_name: Optional last name
            skip_email_verification: Skip email verification for demo users
            
        Returns:
            Dict containing user data and verification info
        """
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.email == email) | (User.username == email)
        ).first()
        
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Generate username from email if not provided
        username = email.split('@')[0]
        counter = 1
        original_username = username
        
        # Ensure username is unique
        while self.db.query(User).filter(User.username == username).first():
            username = f"{original_username}_{counter}"
            counter += 1
        
        # Hash password
        hashed_password = pwd_context.hash(password)
        
        # Create guest user
        guest_expires_at = datetime.now(timezone.utc) + timedelta(days=30)  # 30-day guest period
        
        new_user = User()
        setattr(new_user, 'username', username)  # type: ignore
        setattr(new_user, 'email', email)  # type: ignore
        setattr(new_user, 'hashed_password', hashed_password)  # type: ignore
        setattr(new_user, 'first_name', first_name)  # type: ignore
        setattr(new_user, 'last_name', last_name)  # type: ignore
        setattr(new_user, 'is_active', True)  # type: ignore
        setattr(new_user, 'is_guest', True)  # type: ignore
        setattr(new_user, 'guest_expires_at', guest_expires_at)  # type: ignore
        setattr(new_user, 'email_verified', skip_email_verification)  # type: ignore
        setattr(new_user, 'onboarding_completed', False)  # type: ignore
        setattr(new_user, 'onboarding_step', 1)  # type: ignore
        setattr(new_user, 'created_at', datetime.now(timezone.utc))  # type: ignore
        setattr(new_user, 'updated_at', datetime.now(timezone.utc))  # type: ignore
        
        self.db.add(new_user)
        self.db.flush()  # Get the user ID
        self.db.refresh(new_user)  # Ensure the ID is properly loaded
        
        # Create onboarding progress
        onboarding_progress = GuestOnboardingProgress()
        setattr(onboarding_progress, 'user_id', getattr(new_user, 'id', 0))  # type: ignore
        setattr(onboarding_progress, 'current_step', 1)  # type: ignore
        setattr(onboarding_progress, 'total_steps', 6)  # type: ignore
        setattr(onboarding_progress, 'completed_steps', [])  # type: ignore
        setattr(onboarding_progress, 'started_at', datetime.now(timezone.utc))  # type: ignore
        setattr(onboarding_progress, 'last_activity_at', datetime.now(timezone.utc))  # type: ignore
        
        self.db.add(onboarding_progress)
        
        # Create digital twin profile
        twin_profile = DigitalTwinProfile()
        setattr(twin_profile, 'user_id', getattr(new_user, 'id', 0))  # type: ignore
        setattr(twin_profile, 'profile_completeness_score', 0.0)  # type: ignore
        setattr(twin_profile, 'twin_accuracy_score', 0.0)  # type: ignore
        setattr(twin_profile, 'last_updated', datetime.now(timezone.utc))  # type: ignore
        
        self.db.add(twin_profile)
        
        # Create email verification if needed
        verification_token = None
        if not skip_email_verification:
            verification_token = self._create_email_verification(getattr(new_user, 'id', 0), email)
        
        self.db.commit()
        
        return {
            "user": {
                "id": getattr(new_user, 'id', 0),
                "username": getattr(new_user, 'username', ''),
                "email": getattr(new_user, 'email', ''),
                "first_name": getattr(new_user, 'first_name', ''),
                "last_name": getattr(new_user, 'last_name', ''),
                "is_guest": True,
                "guest_expires_at": guest_expires_at.isoformat(),
                "email_verified": getattr(new_user, 'email_verified', False),
                "onboarding_step": 1
            },
            "onboarding": {
                "current_step": 1,
                "total_steps": 6,
                "completion_percentage": 0.0
            },
            "verification_token": verification_token,
            "requires_email_verification": not skip_email_verification
        }
    
    def _create_email_verification(self, user_id: int, email: str) -> str:
        """Create email verification record"""
        verification_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        
        email_verification = EmailVerification()
        setattr(email_verification, 'user_id', user_id)  # type: ignore
        setattr(email_verification, 'email', email)  # type: ignore
        setattr(email_verification, 'verification_token', verification_token)  # type: ignore
        setattr(email_verification, 'token_expires_at', expires_at)  # type: ignore
        setattr(email_verification, 'sent_at', datetime.now(timezone.utc))  # type: ignore
        
        self.db.add(email_verification)
        return verification_token
    
    def verify_email(self, verification_token: str) -> Dict[str, Any]:
        """Verify user email with token"""
        verification = self.db.query(EmailVerification).filter(
            EmailVerification.verification_token == verification_token
        ).first()
        
        if not verification:
            raise ValueError("Invalid verification token")
        
        if getattr(verification, 'is_verified', False):
            raise ValueError("Email already verified")
        
        token_expires_at = getattr(verification, 'token_expires_at', datetime.now(timezone.utc))
        if datetime.now(timezone.utc) > token_expires_at:
            raise ValueError("Verification token expired")
        
        # Mark as verified
        setattr(verification, 'is_verified', True)  # type: ignore
        setattr(verification, 'verified_at', datetime.now(timezone.utc))  # type: ignore
        
        # Update user
        verification_user_id = getattr(verification, 'user_id', 0)
        user = self.db.query(User).filter(User.id == verification_user_id).first()
        if user:
            setattr(user, 'email_verified', True)  # type: ignore
            setattr(user, 'updated_at', datetime.now(timezone.utc))  # type: ignore
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Email verified successfully",
            "user_id": getattr(verification, 'user_id', 0)
        }
    
    def resend_verification_email(self, email: str) -> Dict[str, Any]:
        """Resend verification email"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            raise ValueError("User not found")
        
        if getattr(user, 'email_verified', False):
            raise ValueError("Email already verified")
        
        # Check existing verification
        user_id = getattr(user, 'id', 0)
        existing_verification = self.db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id
        ).filter(
            EmailVerification.is_verified == False
        ).first()
        
        if existing_verification:
            # Update existing verification
            new_token = secrets.token_urlsafe(32)
            setattr(existing_verification, 'verification_token', new_token)  # type: ignore
            setattr(existing_verification, 'token_expires_at', datetime.now(timezone.utc) + timedelta(hours=24))  # type: ignore
            current_resent_count = getattr(existing_verification, 'resent_count', 0)
            setattr(existing_verification, 'resent_count', current_resent_count + 1)  # type: ignore
            setattr(existing_verification, 'last_resent_at', datetime.now(timezone.utc))  # type: ignore
            verification_token = new_token
        else:
            # Create new verification
            verification_token = self._create_email_verification(getattr(user, 'id', 0), email)
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Verification email sent",
            "verification_token": verification_token
        }
    
    def upgrade_guest_to_full_user(self, user_id: int) -> Dict[str, Any]:
        """Upgrade guest user to full user account"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise ValueError("User not found")
        
        if not getattr(user, 'is_guest', False):
            raise ValueError("User is not a guest")
        
        # Upgrade user
        setattr(user, 'is_guest', False)  # type: ignore
        setattr(user, 'guest_expires_at', None)  # type: ignore
        setattr(user, 'upgraded_from_guest', True)  # type: ignore
        setattr(user, 'upgrade_date', datetime.now(timezone.utc))  # type: ignore
        setattr(user, 'updated_at', datetime.now(timezone.utc))  # type: ignore
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Guest user upgraded to full account",
            "user": {
                "id": getattr(user, 'id', 0),
                "username": getattr(user, 'username', ''),
                "email": getattr(user, 'email', ''),
                "is_guest": False,
                "upgraded_from_guest": True,
                "upgrade_date": getattr(user, 'upgrade_date', datetime.now(timezone.utc)).isoformat()
            }
        }
    
    def get_guest_users_stats(self) -> Dict[str, Any]:
        """Get statistics about guest users"""
        total_guests = self.db.query(User).filter(User.is_guest == True).count()
        verified_guests = self.db.query(User).filter(
            User.is_guest == True
        ).filter(
            User.email_verified == True
        ).count()
        upgraded_users = self.db.query(User).filter(User.upgraded_from_guest == True).count()
        
        # Get onboarding completion stats
        completed_onboarding = self.db.query(GuestOnboardingProgress).filter(
            GuestOnboardingProgress.completed_at.isnot(None)
        ).count()
        
        return {
            "total_guest_users": total_guests,
            "verified_guest_users": verified_guests,
            "upgraded_users": upgraded_users,
            "completed_onboarding": completed_onboarding,
            "verification_rate": (verified_guests / total_guests * 100) if total_guests > 0 else 0,
            "upgrade_rate": (upgraded_users / total_guests * 100) if total_guests > 0 else 0,
            "onboarding_completion_rate": (completed_onboarding / total_guests * 100) if total_guests > 0 else 0
        }


def get_guest_user_service(db: Session) -> GuestUserService:
    """Dependency to get GuestUserService instance"""
    return GuestUserService(db)
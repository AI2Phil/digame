"""
Guest User Service for Enhanced Registration and Onboarding
Phase 1: Guest Registration Flow Implementation
"""

import secrets
import uuid
from datetime import datetime, timedelta
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
        guest_expires_at = datetime.utcnow() + timedelta(days=30)  # 30-day guest period
        
        new_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_guest=True,
            guest_expires_at=guest_expires_at,
            email_verified=skip_email_verification,
            onboarding_completed=False,
            onboarding_step=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self.db.add(new_user)
        self.db.flush()  # Get the user ID
        self.db.refresh(new_user)  # Ensure the ID is properly loaded
        
        # Create onboarding progress
        onboarding_progress = GuestOnboardingProgress(
            user_id=new_user.id,
            current_step=1,
            total_steps=6,
            completed_steps=[],
            started_at=datetime.utcnow(),
            last_activity_at=datetime.utcnow()
        )
        
        self.db.add(onboarding_progress)
        
        # Create digital twin profile
        twin_profile = DigitalTwinProfile(
            user_id=new_user.id,
            profile_completeness_score=0.0,
            twin_accuracy_score=0.0,
            last_updated=datetime.utcnow()
        )
        
        self.db.add(twin_profile)
        
        # Create email verification if needed
        verification_token = None
        if not skip_email_verification:
            verification_token = self._create_email_verification(new_user.id, email)
        
        self.db.commit()
        
        return {
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "is_guest": True,
                "guest_expires_at": guest_expires_at.isoformat(),
                "email_verified": new_user.email_verified,
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
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        email_verification = EmailVerification(
            user_id=user_id,
            email=email,
            verification_token=verification_token,
            token_expires_at=expires_at,
            sent_at=datetime.utcnow()
        )
        
        self.db.add(email_verification)
        return verification_token
    
    def verify_email(self, verification_token: str) -> Dict[str, Any]:
        """Verify user email with token"""
        verification = self.db.query(EmailVerification).filter(
            EmailVerification.verification_token == verification_token
        ).first()
        
        if not verification:
            raise ValueError("Invalid verification token")
        
        if verification.is_verified:
            raise ValueError("Email already verified")
        
        if datetime.utcnow() > verification.token_expires_at:
            raise ValueError("Verification token expired")
        
        # Mark as verified
        verification.is_verified = True
        verification.verified_at = datetime.utcnow()
        
        # Update user
        user = self.db.query(User).filter(User.id == verification.user_id).first()
        if user:
            user.email_verified = True
            user.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Email verified successfully",
            "user_id": verification.user_id
        }
    
    def resend_verification_email(self, email: str) -> Dict[str, Any]:
        """Resend verification email"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            raise ValueError("User not found")
        
        if user.email_verified:
            raise ValueError("Email already verified")
        
        # Check existing verification
        existing_verification = self.db.query(EmailVerification).filter(
            and_(
                EmailVerification.user_id == user.id,
                EmailVerification.is_verified == False
            )
        ).first()
        
        if existing_verification:
            # Update existing verification
            existing_verification.verification_token = secrets.token_urlsafe(32)
            existing_verification.token_expires_at = datetime.utcnow() + timedelta(hours=24)
            existing_verification.resent_count += 1
            existing_verification.last_resent_at = datetime.utcnow()
            verification_token = existing_verification.verification_token
        else:
            # Create new verification
            verification_token = self._create_email_verification(user.id, email)
        
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
        
        if not user.is_guest:
            raise ValueError("User is not a guest")
        
        # Upgrade user
        user.is_guest = False
        user.guest_expires_at = None
        user.upgraded_from_guest = True
        user.upgrade_date = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Guest user upgraded to full account",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_guest": False,
                "upgraded_from_guest": True,
                "upgrade_date": user.upgrade_date.isoformat()
            }
        }
    
    def get_guest_users_stats(self) -> Dict[str, Any]:
        """Get statistics about guest users"""
        total_guests = self.db.query(User).filter(User.is_guest == True).count()
        verified_guests = self.db.query(User).filter(
            and_(User.is_guest == True, User.email_verified == True)
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
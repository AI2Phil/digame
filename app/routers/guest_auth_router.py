"""
Guest Authentication Router
Phase 1: Enhanced Guest Registration Flow with Email Verification
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from ..database import get_db
from ..services.guest_user_service import GuestUserService, get_guest_user_service
from ..auth.auth_dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/auth/guest", tags=["guest-auth"])


# Pydantic schemas for guest registration
class GuestRegistrationRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    skip_email_verification: bool = False


class EmailVerificationRequest(BaseModel):
    verification_token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class GuestUpgradeRequest(BaseModel):
    user_id: int


@router.post("/register", response_model=Dict[str, Any])
async def register_guest_user(
    registration_data: GuestRegistrationRequest,
    db: Session = Depends(get_db)
):
    guest_service = GuestUserService(db)
    """
    Register a new guest user with enhanced onboarding flow
    
    Features:
    - Email validation and uniqueness check
    - Automatic username generation
    - 30-day guest period
    - Optional email verification
    - Onboarding progress tracking
    - Digital twin profile initialization
    """
    try:
        result = guest_service.create_guest_user(
            email=registration_data.email,
            password=registration_data.password,
            first_name=registration_data.first_name,
            last_name=registration_data.last_name,
            skip_email_verification=registration_data.skip_email_verification
        )
        
        return {
            "success": True,
            "message": "Guest user created successfully",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guest user"
        )


@router.post("/verify-email", response_model=Dict[str, Any])
async def verify_guest_email(
    verification_data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    guest_service = GuestUserService(db)
    """
    Verify guest user email with verification token
    
    Features:
    - Token validation and expiration check
    - Email verification status update
    - User account activation
    """
    try:
        result = guest_service.verify_email(verification_data.verification_token)
        
        return {
            "success": True,
            "message": "Email verified successfully",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify email"
        )


@router.post("/resend-verification", response_model=Dict[str, Any])
async def resend_verification_email(
    resend_data: ResendVerificationRequest,
    db: Session = Depends(get_db)
):
    guest_service = GuestUserService(db)
    """
    Resend email verification for guest user
    
    Features:
    - Existing verification token update
    - Resend tracking and limits
    - New token generation
    """
    try:
        result = guest_service.resend_verification_email(resend_data.email)
        
        return {
            "success": True,
            "message": "Verification email sent",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification email"
        )


@router.post("/upgrade", response_model=Dict[str, Any])
async def upgrade_guest_to_full_user(
    upgrade_data: GuestUpgradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    guest_service = GuestUserService(db)
    """
    Upgrade guest user to full user account
    
    Features:
    - Guest status removal
    - Account upgrade tracking
    - Full platform access
    
    Requires: User must be authenticated
    """
    # Ensure user can only upgrade their own account
    if current_user.id != upgrade_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upgrade this account"
        )
    
    try:
        result = guest_service.upgrade_guest_to_full_user(upgrade_data.user_id)
        
        return {
            "success": True,
            "message": "Guest user upgraded successfully",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade guest user"
        )


@router.get("/stats", response_model=Dict[str, Any])
async def get_guest_user_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    guest_service = GuestUserService(db)
    """
    Get guest user statistics and metrics
    
    Features:
    - Total guest users count
    - Email verification rates
    - Upgrade conversion rates
    - Onboarding completion rates
    
    Requires: Admin access
    """
    # For now, allow any authenticated user to view stats
    # TODO: Add proper admin role checking when RBAC is fully integrated
    pass
    
    try:
        stats = guest_service.get_guest_users_stats()
        
        return {
            "success": True,
            "message": "Guest user statistics retrieved",
            "data": stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve guest user statistics"
        )


@router.get("/check-email/{email}", response_model=Dict[str, Any])
async def check_email_availability(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Check if email is available for registration
    
    Features:
    - Email uniqueness validation
    - Real-time availability check
    - Frontend form validation support
    """
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        
        return {
            "success": True,
            "available": existing_user is None,
            "message": "Email available" if existing_user is None else "Email already registered"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check email availability"
        )


# Health check endpoint for guest auth system
@router.get("/health", response_model=Dict[str, Any])
async def guest_auth_health_check():
    """Health check for guest authentication system"""
    return {
        "success": True,
        "message": "Guest authentication system is healthy",
        "features": {
            "guest_registration": True,
            "email_verification": True,
            "account_upgrade": True,
            "onboarding_tracking": True,
            "digital_twin_initialization": True
        }
    }
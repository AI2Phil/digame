"""
Authentication Router for Digame Platform

This router provides comprehensive authentication endpoints including:
- User registration and login
- Token refresh and logout
- Password reset functionality
- User profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
import logging

from ..auth.auth_service import auth_service
from ..auth.auth_dependencies import get_current_active_user
from ..db import get_db
from ..schemas.user_schemas import UserCreate, User as UserSchema
from ..models.user import User

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for request/response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class UserRegistrationResponse(BaseModel):
    user: UserSchema
    tokens: TokenResponse

class LoginResponse(BaseModel):
    user: UserSchema
    tokens: TokenResponse

@router.post("/register", response_model=UserRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserRegistrationResponse:
    """
    Register a new user
    
    - **username**: Unique username
    - **email**: Valid email address
    - **password**: Strong password
    - **first_name**: Optional first name
    - **last_name**: Optional last name
    """
    try:
        user, tokens = auth_service.register_user(db, user_data)
        
        return UserRegistrationResponse(
            user=user,
            tokens=TokenResponse(**tokens)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> LoginResponse:
    """
    Login with username/email and password
    
    - **username**: Username or email address
    - **password**: User password
    """
    try:
        user, tokens = auth_service.authenticate_user(
            db, 
            form_data.username, 
            form_data.password
        )
        
        return LoginResponse(
            user=user,
            tokens=TokenResponse(**tokens)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_request: RefreshTokenRequest
) -> TokenResponse:
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    """
    try:
        new_tokens = auth_service.refresh_token(refresh_request.refresh_token)
        return TokenResponse(**new_tokens)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(
    refresh_token: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout user by blacklisting tokens
    
    - **refresh_token**: User's refresh token
    """
    try:
        # Get access token from the dependency (this is a simplified approach)
        # In a real implementation, you'd extract the token from the Authorization header
        auth_service.logout_user("", refresh_token)
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/password-reset/request", status_code=status.HTTP_200_OK)
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Request password reset
    
    - **email**: Email address of the account
    """
    try:
        reset_token = auth_service.initiate_password_reset(db, reset_request.email)
        
        # In a real application, you would send this token via email
        # For demo purposes, we return it (DON'T do this in production!)
        return {
            "message": "Password reset email sent",
            "reset_token": reset_token  # Remove this in production!
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Confirm password reset with token
    
    - **token**: Password reset token
    - **new_password**: New password
    """
    try:
        success = auth_service.reset_password(
            db, 
            reset_data.token, 
            reset_data.new_password
        )
        
        if success:
            return {"message": "Password reset successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirm error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset confirmation failed"
        )

@router.post("/password-change", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Change user password (requires current password)
    
    - **current_password**: Current password
    - **new_password**: New password
    """
    try:
        success = auth_service.change_password(
            db,
            getattr(current_user, 'id'),
            password_data.current_password,
            password_data.new_password
        )
        
        if success:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password change failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> UserSchema:
    """
    Get current user information
    """
    return UserSchema.from_orm(current_user)

@router.get("/verify-token", status_code=status.HTTP_200_OK)
async def verify_token(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Verify if the current token is valid
    """
    return {
        "valid": True,
        "user_id": getattr(current_user, 'id'),
        "username": getattr(current_user, 'username'),
        "email": getattr(current_user, 'email')
    }

@router.post("/me/onboarding", status_code=status.HTTP_200_OK)
async def save_onboarding_data(
    onboarding_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Save user onboarding data
    """
    try:
        # Update user with onboarding data
        user_id = getattr(current_user, 'id')
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Store onboarding data in user onboarding_data field
        # For now, we'll store it as JSON in the onboarding_data field
        import json
        user.onboarding_data = json.dumps(onboarding_data)
        user.onboarding_completed = onboarding_data.get('onboarding_completed', True)
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": "Onboarding data saved successfully",
            "onboarding_completed": user.onboarding_completed
        }
    except Exception as e:
        logger.error(f"Error saving onboarding data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save onboarding data"
        )

@router.get("/me/onboarding", status_code=status.HTTP_200_OK)
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get user onboarding status and data
    """
    try:
        user_id = getattr(current_user, 'id')
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Parse onboarding data from onboarding_data field
        onboarding_data = {}
        if hasattr(user, 'onboarding_data') and user.onboarding_data:
            try:
                import json
                onboarding_data = json.loads(user.onboarding_data)
            except json.JSONDecodeError:
                onboarding_data = {}
        
        return {
            "onboarding_completed": getattr(user, 'onboarding_completed', False),
            "onboarding_data": onboarding_data
        }
    except Exception as e:
        logger.error(f"Error getting onboarding status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding status"
        )

# Health check endpoint
@router.get("/health", status_code=status.HTTP_200_OK)
async def auth_health_check() -> Dict[str, str]:
    """
    Authentication service health check
    """
    return {"status": "healthy", "service": "authentication"}
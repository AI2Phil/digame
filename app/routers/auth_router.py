from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from ..database import get_db
from ..schemas.user_schemas import UserCreate, User as UserSchema
from ..auth.auth_service import auth_service, get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    needs_onboarding: bool
    user: UserSchema

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user
    """
    user, tokens = auth_service.register_user(db, user_data)
    
    # Convert SQLAlchemy model to Pydantic schema
    user_schema = UserSchema.from_orm(user)
    
    return AuthResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        needs_onboarding=not user.onboarding_completed,
        user=user_schema
    )

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user, tokens = auth_service.authenticate_user(db, form_data.username, form_data.password)
    return tokens

@router.post("/login", response_model=Token)
def login_user(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Alternative login endpoint with JSON body
    """
    user, tokens = auth_service.authenticate_user(db, user_login.username, user_login.password)
    return tokens

@router.get("/me", response_model=UserSchema)
def read_users_me(
    current_user = Depends(get_current_user)
):
    """
    Get current user information
    """
    return current_user

@router.get("/verify-token")
def verify_token(
    current_user = Depends(get_current_user)
):
    """
    Verify if the current token is valid
    """
    return {"valid": True, "user_id": current_user.id, "username": current_user.username}

@router.post("/refresh", response_model=Token)
def refresh_access_token(
    refresh_token: str
):
    """
    Refresh access token using refresh token
    """
    tokens = auth_service.refresh_token(refresh_token)
    return tokens

@router.post("/logout")
def logout_user(
    access_token: str,
    refresh_token: Optional[str] = None
):
    """
    Logout user by blacklisting tokens
    """
    auth_service.logout_user(access_token, refresh_token)
    return {"message": "Successfully logged out"}
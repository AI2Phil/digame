"""
JWT Token Handler for Digame Authentication System

This module provides comprehensive JWT token management including:
- Token creation and validation
- Refresh token handling
- Token blacklisting
- Secure configuration management
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib
from sqlalchemy.orm import Session

# Configuration - In production, these should come from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory token blacklist (in production, use Redis or database)
token_blacklist = set()

class TokenHandler:
    """Handles JWT token operations"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token
        
        Args:
            data: Payload data to encode in the token
            expires_delta: Custom expiration time
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """
        Create a JWT refresh token
        
        Args:
            data: Payload data to encode in the token
            
        Returns:
            Encoded JWT refresh token string
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": secrets.token_urlsafe(32)  # Unique token ID for blacklisting
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """
        Verify and decode a JWT token
        
        Args:
            token: JWT token string
            token_type: Expected token type ("access" or "refresh")
            
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            # Check if token is blacklisted
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            if token_hash in token_blacklist:
                return None
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Verify token type
            if payload.get("type") != token_type:
                return None
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None
            
            return dict(payload)
            
        except JWTError:
            return None
    
    @staticmethod
    def blacklist_token(token: str) -> None:
        """
        Add a token to the blacklist
        
        Args:
            token: JWT token string to blacklist
        """
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        token_blacklist.add(token_hash)
    
    @staticmethod
    def create_token_pair(user_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Create both access and refresh tokens
        
        Args:
            user_data: User data to encode in tokens
            
        Returns:
            Dictionary containing access_token and refresh_token
        """
        access_token = TokenHandler.create_access_token(user_data)
        refresh_token = TokenHandler.create_refresh_token(user_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

class PasswordHandler:
    """Handles password operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password from database
            
        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def generate_password_reset_token(email: str) -> str:
        """
        Generate a password reset token
        
        Args:
            email: User's email address
            
        Returns:
            Password reset token
        """
        expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        data: Dict[str, Any] = {
            "email": email,
            "type": "password_reset",
            "exp": expire
        }
        
        return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """
        Verify a password reset token and extract email
        
        Args:
            token: Password reset token
            
        Returns:
            Email address if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            if payload.get("type") != "password_reset":
                return None
            
            email = payload.get("email")
            return email
            
        except JWTError:
            return None

def get_token_expiry_info(token: str) -> Optional[Dict[str, Any]]:
    """
    Get token expiry information without full validation
    
    Args:
        token: JWT token string
        
    Returns:
        Dictionary with expiry information or None if invalid
    """
    try:
        # Decode without verification to get expiry info
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": False})
        
        exp = payload.get("exp")
        iat = payload.get("iat")
        
        if exp:
            exp_datetime = datetime.fromtimestamp(exp)
            iat_datetime = datetime.fromtimestamp(iat) if iat else None
            
            return {
                "expires_at": exp_datetime,
                "issued_at": iat_datetime,
                "is_expired": exp_datetime < datetime.utcnow(),
                "time_until_expiry": exp_datetime - datetime.utcnow() if exp_datetime > datetime.utcnow() else timedelta(0)
            }
        
        return None
        
    except JWTError:
        return None
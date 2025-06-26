"""
Enhanced Authentication Dependencies for Digame Platform

This module provides comprehensive authentication dependencies including:
- JWT token validation
- User authentication and authorization
- Role-based access control (RBAC)
- Permission checking
- Session management
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List, Callable
import logging

from .auth_service import auth_service
from .jwt_handler import get_token_expiry_info
from ..models.user import User
from ..models.rbac import Role, Permission
from ..schemas.user_schemas import User as UserSchema
from ..services.rbac_service import user_has_permission, get_user_permissions
from ..db import get_db

# Configure logging
logger = logging.getLogger(__name__)

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    scheme_name="JWT"
)

# HTTP Bearer scheme for more flexible token handling
security = HTTPBearer()

class AuthenticationError(HTTPException):
    """Custom authentication error"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class AuthorizationError(HTTPException):
    """Custom authorization error"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

async def get_token_from_header(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract token from Authorization header
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        JWT token string
        
    Raises:
        AuthenticationError: If token is missing or invalid format
    """
    if not credentials or not credentials.credentials:
        raise AuthenticationError("Missing authentication token")
    
    return credentials.credentials

async def get_current_user_from_token(
    token: str = Depends(get_token_from_header),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user from JWT token
    
    Args:
        token: JWT access token
        db: Database session
        
    Returns:
        User object
        
    Raises:
        AuthenticationError: If token is invalid or user not found
    """
    # Verify token
    payload = auth_service.verify_access_token(token)
    if not payload:
        raise AuthenticationError("Invalid or expired token")
    
    # Get user from database
    user = auth_service.get_user_from_token(db, token)
    if not user:
        raise AuthenticationError("User not found")
    
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user (OAuth2 compatible)
    
    Args:
        token: JWT access token
        db: Database session
        
    Returns:
        User object
        
    Raises:
        AuthenticationError: If authentication fails
    """
    return await get_current_user_from_token(token, db)

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user
    
    Args:
        current_user: Current user from token
        
    Returns:
        Active user object
        
    Raises:
        AuthenticationError: If user is inactive
    """
    if not getattr(current_user, 'is_active', True):
        raise AuthenticationError("User account is disabled")
    
    return current_user

async def get_current_user_with_roles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user with roles loaded
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        User object with roles loaded
    """
    # Ensure roles are loaded
    db.refresh(current_user)
    return current_user

class PermissionChecker:
    """
    Dependency factory for checking user permissions
    
    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: User = Depends(PermissionChecker("admin_access"))
        ):
            return {"message": "Admin access granted"}
    """
    
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_user_with_roles)
    ) -> User:
        """
        Check if user has required permission
        
        Args:
            current_user: Current user with roles
            
        Returns:
            User object if permission check passes
            
        Raises:
            AuthorizationError: If user lacks permission
        """
        if not user_has_permission(current_user, self.required_permission):
            raise AuthorizationError(
                f"Missing required permission: {self.required_permission}"
            )
        
        return current_user

class RoleChecker:
    """
    Dependency factory for checking user roles
    
    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: User = Depends(RoleChecker("Administrator"))
        ):
            return {"message": "Admin access granted"}
    """
    
    def __init__(self, required_role: str):
        self.required_role = required_role
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_user_with_roles)
    ) -> User:
        """
        Check if user has required role
        
        Args:
            current_user: Current user with roles
            
        Returns:
            User object if role check passes
            
        Raises:
            AuthorizationError: If user lacks role
        """
        user_roles = [role.name for role in getattr(current_user, 'roles', [])]
        
        if self.required_role not in user_roles:
            raise AuthorizationError(
                f"Missing required role: {self.required_role}"
            )
        
        return current_user

class MultiPermissionChecker:
    """
    Dependency factory for checking multiple permissions
    
    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: User = Depends(MultiPermissionChecker(["read_users", "write_users"]))
        ):
            return {"message": "Multi-permission access granted"}
    """
    
    def __init__(self, required_permissions: List[str], require_all: bool = True):
        self.required_permissions = required_permissions
        self.require_all = require_all
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_user_with_roles)
    ) -> User:
        """
        Check if user has required permissions
        
        Args:
            current_user: Current user with roles
            
        Returns:
            User object if permission checks pass
            
        Raises:
            AuthorizationError: If user lacks required permissions
        """
        user_permissions = get_user_permissions(current_user)
        
        if self.require_all:
            # User must have ALL permissions
            missing_permissions = [
                perm for perm in self.required_permissions 
                if perm not in user_permissions
            ]
            if missing_permissions:
                raise AuthorizationError(
                    f"Missing required permissions: {', '.join(missing_permissions)}"
                )
        else:
            # User must have AT LEAST ONE permission
            has_any_permission = any(
                perm in user_permissions 
                for perm in self.required_permissions
            )
            if not has_any_permission:
                raise AuthorizationError(
                    f"Missing any of required permissions: {', '.join(self.required_permissions)}"
                )
        
        return current_user

async def get_admin_user(
    current_user: User = Depends(PermissionChecker("manage_system"))
) -> User:
    """
    Dependency for admin-only endpoints
    
    Args:
        current_user: Current user (must have admin permissions)
        
    Returns:
        Admin user object
    """
    return current_user

async def get_user_or_admin(
    current_user: User = Depends(get_current_active_user),
    target_user_id: Optional[int] = None
) -> User:
    """
    Dependency that allows access if user is accessing their own data or is admin
    
    Args:
        current_user: Current user
        target_user_id: ID of user being accessed (optional)
        
    Returns:
        User object if access is allowed
        
    Raises:
        AuthorizationError: If user cannot access the resource
    """
    # If no target user specified, allow access to own data
    if target_user_id is None:
        return current_user
    
    # Allow if user is accessing their own data
    if getattr(current_user, 'id') == target_user_id:
        return current_user
    
    # Allow if user has admin permissions
    if user_has_permission(current_user, "manage_users"):
        return current_user
    
    raise AuthorizationError("Cannot access other user's data")

def create_rate_limiter(max_requests: int, window_seconds: int):
    """
    Create a rate limiting dependency
    
    Args:
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        Rate limiting dependency function
    """
    # Simple in-memory rate limiting (use Redis in production)
    request_counts = {}
    
    async def rate_limit_dependency(request: Request):
        import time
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        cutoff_time = current_time - window_seconds
        request_counts[client_ip] = [
            req_time for req_time in request_counts.get(client_ip, [])
            if req_time > cutoff_time
        ]
        
        # Check rate limit
        if len(request_counts.get(client_ip, [])) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Add current request
        if client_ip not in request_counts:
            request_counts[client_ip] = []
        request_counts[client_ip].append(current_time)
        
        return True
    
    return rate_limit_dependency

# Common dependency combinations
async def get_authenticated_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Simple authenticated user dependency"""
    return current_user

async def get_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Dependency for verified users only"""
    # Add email verification check here if implemented
    return current_user

# Rate limiting dependencies
rate_limit_auth = create_rate_limiter(max_requests=5, window_seconds=60)  # 5 requests per minute
rate_limit_general = create_rate_limiter(max_requests=100, window_seconds=60)  # 100 requests per minute
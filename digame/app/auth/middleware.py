"""
Authentication and Security Middleware for Digame Platform

This module provides middleware for:
- Request authentication
- Security headers
- CORS handling
- Request logging
- Rate limiting
"""

from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from typing import Callable, Optional, Dict, Any
import time
import logging
import json
from datetime import datetime

from .jwt_handler import get_token_expiry_info
from .auth_service import auth_service

# Configure logging
logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses
    """
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all requests and responses
    """
    
    def __init__(self, app, log_body: bool = False):
        super().__init__(app)
        self.log_body = log_body
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        
        # Log request
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        request_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method,
            "url": str(request.url),
            "client_ip": client_ip,
            "user_agent": user_agent,
            "headers": dict(request.headers) if self.log_body else {}
        }
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            response_log = {
                **request_log,
                "status_code": response.status_code,
                "process_time": round(process_time, 4),
                "response_headers": dict(response.headers) if self.log_body else {}
            }
            
            # Log based on status code
            if response.status_code >= 400:
                logger.warning(f"Request failed: {json.dumps(response_log)}")
            else:
                logger.info(f"Request processed: {json.dumps(response_log)}")
            
            # Add process time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            error_log = {
                **request_log,
                "error": str(e),
                "process_time": round(process_time, 4)
            }
            logger.error(f"Request error: {json.dumps(error_log)}")
            raise

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting requests
    """
    
    def __init__(
        self, 
        app, 
        calls: int = 100, 
        period: int = 60,
        exempt_paths: Optional[list] = None
    ):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.exempt_paths = exempt_paths or ["/docs", "/redoc", "/openapi.json", "/health"]
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Skip rate limiting for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        cutoff_time = current_time - self.period
        if client_ip in self.clients:
            self.clients[client_ip] = [
                req_time for req_time in self.clients[client_ip]
                if req_time > cutoff_time
            ]
        
        # Check rate limit
        if client_ip in self.clients and len(self.clients[client_ip]) >= self.calls:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded",
                    "retry_after": self.period
                },
                headers={"Retry-After": str(self.period)}
            )
        
        # Add current request
        if client_ip not in self.clients:
            self.clients[client_ip] = []
        self.clients[client_ip].append(current_time)
        
        return await call_next(request)

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """
    Middleware for optional authentication on all requests
    """
    
    def __init__(self, app, exempt_paths: Optional[list] = None):
        super().__init__(app)
        self.exempt_paths = exempt_paths or [
            "/docs", "/redoc", "/openapi.json", "/health",
            "/auth/login", "/auth/register", "/auth/password-reset"
        ]
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Skip authentication for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        # Extract token from Authorization header
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            # Verify token and add user info to request state
            payload = auth_service.verify_access_token(token)
            if payload:
                setattr(request.state, 'user_id', payload.get("sub"))
                setattr(request.state, 'username', payload.get("username"))
                setattr(request.state, 'email', payload.get("email"))
                setattr(request.state, 'authenticated', True)
            else:
                setattr(request.state, 'authenticated', False)
        else:
            setattr(request.state, 'authenticated', False)
        
        return await call_next(request)

class CORSMiddleware(BaseHTTPMiddleware):
    """
    Custom CORS middleware with authentication-aware handling
    """
    
    def __init__(
        self,
        app,
        allow_origins: Optional[list] = None,
        allow_credentials: bool = True,
        allow_methods: Optional[list] = None,
        allow_headers: Optional[list] = None
    ):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_credentials = allow_credentials
        self.allow_methods = allow_methods or ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        self.allow_headers = allow_headers or [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization"
        ]
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        origin = request.headers.get("origin")
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = Response()
            response.status_code = 200
        else:
            response = await call_next(request)
        
        # Add CORS headers
        if origin and (self.allow_origins == ["*"] or origin in self.allow_origins):
            response.headers["Access-Control-Allow-Origin"] = origin
        elif self.allow_origins == ["*"]:
            response.headers["Access-Control-Allow-Origin"] = "*"
        
        if self.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers)
        response.headers["Access-Control-Max-Age"] = "86400"  # 24 hours
        
        return response

class TokenValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate token expiry and provide warnings
    """
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract token from Authorization header
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            # Get token expiry info
            expiry_info = get_token_expiry_info(token)
            if expiry_info:
                # Add expiry info to response headers
                response = await call_next(request)
                
                if expiry_info["is_expired"]:
                    response.headers["X-Token-Status"] = "expired"
                elif expiry_info["time_until_expiry"].total_seconds() < 300:  # 5 minutes
                    response.headers["X-Token-Status"] = "expiring-soon"
                    response.headers["X-Token-Expires-In"] = str(int(expiry_info["time_until_expiry"].total_seconds()))
                else:
                    response.headers["X-Token-Status"] = "valid"
                
                return response
        
        return await call_next(request)

class APIVersionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle API versioning
    """
    
    def __init__(self, app, current_version: str = "v1", supported_versions: Optional[list] = None):
        super().__init__(app)
        self.current_version = current_version
        self.supported_versions = supported_versions or ["v1"]
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract version from header or URL
        api_version = request.headers.get("API-Version", self.current_version)
        
        # Validate version
        if api_version not in self.supported_versions:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "detail": f"Unsupported API version: {api_version}",
                    "supported_versions": self.supported_versions
                }
            )
        
        # Add version info to request state
        setattr(request.state, 'api_version', api_version)
        
        response = await call_next(request)
        
        # Add version info to response headers
        response.headers["API-Version"] = api_version
        response.headers["Supported-Versions"] = ", ".join(self.supported_versions)
        
        return response

# Middleware configuration helper
def configure_auth_middleware(app, config: Optional[Dict[str, Any]] = None):
    """
    Configure all authentication and security middleware
    
    Args:
        app: FastAPI application instance
        config: Configuration dictionary
    """
    config = config or {}
    
    # Add middleware in reverse order (last added is executed first)
    
    # API versioning
    if config.get("enable_versioning", True):
        app.add_middleware(
            APIVersionMiddleware,
            current_version=config.get("api_version", "v1"),
            supported_versions=config.get("supported_versions", ["v1"])
        )
    
    # Token validation
    if config.get("enable_token_validation", True):
        app.add_middleware(TokenValidationMiddleware)
    
    # CORS
    if config.get("enable_cors", True):
        app.add_middleware(
            CORSMiddleware,
            allow_origins=config.get("cors_origins", ["*"]),
            allow_credentials=config.get("cors_credentials", True),
            allow_methods=config.get("cors_methods", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]),
            allow_headers=config.get("cors_headers", [
                "Accept", "Accept-Language", "Content-Language", 
                "Content-Type", "Authorization"
            ])
        )
    
    # Authentication
    if config.get("enable_auth_middleware", True):
        app.add_middleware(
            AuthenticationMiddleware,
            exempt_paths=config.get("auth_exempt_paths", [
                "/docs", "/redoc", "/openapi.json", "/health",
                "/auth/login", "/auth/register", "/auth/password-reset"
            ])
        )
    
    # Rate limiting
    if config.get("enable_rate_limiting", True):
        app.add_middleware(
            RateLimitMiddleware,
            calls=config.get("rate_limit_calls", 100),
            period=config.get("rate_limit_period", 60),
            exempt_paths=config.get("rate_limit_exempt_paths", [
                "/docs", "/redoc", "/openapi.json", "/health"
            ])
        )
    
    # Request logging
    if config.get("enable_request_logging", True):
        app.add_middleware(
            RequestLoggingMiddleware,
            log_body=config.get("log_request_body", False)
        )
    
    # Security headers
    if config.get("enable_security_headers", True):
        app.add_middleware(SecurityHeadersMiddleware)
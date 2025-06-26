# Digame Authentication System

A comprehensive authentication and authorization system for the Digame platform, providing JWT-based authentication, role-based access control (RBAC), and security middleware.

## 🚀 Features

### Core Authentication
- **JWT Token Management**: Access and refresh tokens with automatic expiry
- **Password Security**: Bcrypt hashing with configurable complexity
- **User Registration & Login**: Complete user lifecycle management
- **Password Reset**: Secure token-based password recovery
- **Account Management**: User profile updates and password changes

### Authorization & RBAC
- **Role-Based Access Control**: Hierarchical permission system
- **Permission Management**: Granular access control
- **Dynamic Role Assignment**: Runtime role and permission management
- **Multi-Permission Checks**: Complex authorization scenarios

### Security Features
- **Security Headers**: OWASP-compliant HTTP security headers
- **Rate Limiting**: Configurable request throttling
- **CORS Management**: Cross-origin resource sharing control
- **Request Logging**: Comprehensive audit trails
- **Token Blacklisting**: Secure logout and token invalidation

### Middleware Stack
- **Authentication Middleware**: Automatic token validation
- **Authorization Middleware**: Permission-based access control
- **Security Middleware**: Headers, CORS, rate limiting
- **Logging Middleware**: Request/response monitoring

## 📁 Architecture

```
digame/app/auth/
├── __init__.py                    # Package initialization
├── README.md                      # This documentation
├── config.py                      # Configuration management
├── jwt_handler.py                 # JWT token operations
├── auth_service.py                # Core authentication logic
├── auth_dependencies.py           # Legacy dependencies (deprecated)
├── enhanced_auth_dependencies.py  # Modern dependency injection
├── middleware.py                  # Security middleware stack
├── auth_router.py                 # Authentication API endpoints
└── init_auth_db.py               # Database initialization
```

## 🔧 Quick Setup

### 1. Environment Configuration

Create a `.env` file with authentication settings:

```bash
# JWT Configuration
DIGAME_AUTH_SECRET_KEY=your-super-secret-key-at-least-32-characters-long
DIGAME_AUTH_ACCESS_TOKEN_EXPIRE_MINUTES=30
DIGAME_AUTH_REFRESH_TOKEN_EXPIRE_DAYS=7

# Security Settings
DIGAME_AUTH_RATE_LIMIT_CALLS=100
DIGAME_AUTH_RATE_LIMIT_PERIOD=60

# CORS Configuration
DIGAME_AUTH_CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Default Admin User
DIGAME_AUTH_DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DIGAME_AUTH_DEFAULT_ADMIN_USERNAME=admin
DIGAME_AUTH_DEFAULT_ADMIN_PASSWORD=change-this-password
```

### 2. Database Initialization

Initialize the authentication database with default roles and permissions:

```python
from digame.app.auth.init_auth_db import initialize_auth_database
from digame.app.db import get_db

# Initialize authentication system
db = next(get_db())
success = initialize_auth_database(db)
db.close()

if success:
    print("✅ Authentication system initialized!")
else:
    print("❌ Initialization failed!")
```

### 3. Application Integration

Add authentication to your FastAPI application:

```python
from fastapi import FastAPI
from digame.app.auth.middleware import configure_auth_middleware
from digame.app.auth.auth_router import router as auth_router

app = FastAPI()

# Configure authentication middleware
configure_auth_middleware(app)

# Include authentication routes
app.include_router(auth_router)
```

## 🔐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user info | Yes |
| GET | `/auth/verify-token` | Verify token validity | Yes |

### Password Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/password-reset/request` | Request password reset | No |
| POST | `/auth/password-reset/confirm` | Confirm password reset | No |
| POST | `/auth/password-change` | Change password | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/health` | Service health check | No |

## 🛡️ Usage Examples

### User Registration

```python
import httpx

# Register a new user
response = httpx.post("http://localhost:8000/auth/register", json={
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
})

if response.status_code == 201:
    data = response.json()
    access_token = data["tokens"]["access_token"]
    refresh_token = data["tokens"]["refresh_token"]
    print(f"✅ User registered! Access token: {access_token}")
```

### User Login

```python
# Login with username/email and password
response = httpx.post("http://localhost:8000/auth/login", data={
    "username": "johndoe",  # or email
    "password": "SecurePassword123!"
})

if response.status_code == 200:
    data = response.json()
    access_token = data["tokens"]["access_token"]
    print(f"✅ Login successful! Token: {access_token}")
```

### Protected Endpoint Access

```python
# Access protected endpoint with token
headers = {"Authorization": f"Bearer {access_token}"}
response = httpx.get("http://localhost:8000/auth/me", headers=headers)

if response.status_code == 200:
    user_data = response.json()
    print(f"✅ User info: {user_data}")
```

### Token Refresh

```python
# Refresh access token
response = httpx.post("http://localhost:8000/auth/refresh", json={
    "refresh_token": refresh_token
})

if response.status_code == 200:
    new_tokens = response.json()
    new_access_token = new_tokens["access_token"]
    print(f"✅ Token refreshed: {new_access_token}")
```

## 🔒 Permission System

### Default Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Administrator** | Full system access | All permissions |
| **Administrator** | System management | User, role, and data management |
| **Manager** | Team oversight | Team and data management |
| **Analyst** | Data analysis | Analysis and reporting |
| **User** | Standard access | Basic functionality |
| **Viewer** | Read-only access | View own data only |

### Permission Categories

#### User Management
- `view_users` - View user accounts
- `create_users` - Create new users
- `update_users` - Update user information
- `delete_users` - Delete user accounts
- `manage_users` - Full user management

#### Role & Permission Management
- `view_roles` - View roles and permissions
- `create_roles` - Create new roles
- `update_roles` - Update existing roles
- `delete_roles` - Delete roles
- `manage_roles` - Full role management
- `view_permissions` - View available permissions
- `assign_permissions` - Assign permissions to roles
- `manage_permissions` - Full permission management

#### System Administration
- `manage_system` - System administration
- `view_system_logs` - View audit logs
- `manage_settings` - System configuration

#### Data Access
- `view_own_data` - View personal data
- `view_all_data` - View all system data
- `export_data` - Export data

#### Behavioral Analysis
- `view_behavioral_models` - View models
- `create_behavioral_models` - Create models
- `update_behavioral_models` - Update models
- `delete_behavioral_models` - Delete models

### Using Permissions in Endpoints

```python
from fastapi import APIRouter, Depends
from digame.app.auth.enhanced_auth_dependencies import PermissionChecker, RoleChecker

router = APIRouter()

# Require specific permission
@router.get("/admin/users")
async def get_all_users(
    current_user = Depends(PermissionChecker("view_users"))
):
    return {"users": "all users data"}

# Require specific role
@router.post("/admin/settings")
async def update_settings(
    current_user = Depends(RoleChecker("Administrator"))
):
    return {"message": "Settings updated"}

# Require multiple permissions (all required)
@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user = Depends(MultiPermissionChecker(
        ["view_users", "delete_users"], 
        require_all=True
    ))
):
    return {"message": f"User {user_id} deleted"}

# Require any of multiple permissions
@router.get("/data/export")
async def export_data(
    current_user = Depends(MultiPermissionChecker(
        ["export_data", "manage_system"], 
        require_all=False
    ))
):
    return {"data": "exported data"}
```

## ⚙️ Configuration

### Authentication Settings

```python
from digame.app.auth.config import auth_settings

# JWT Configuration
auth_settings.secret_key = "your-secret-key"
auth_settings.access_token_expire_minutes = 30
auth_settings.refresh_token_expire_days = 7

# Password Requirements
auth_settings.password_min_length = 8
auth_settings.password_require_uppercase = True
auth_settings.password_require_lowercase = True
auth_settings.password_require_numbers = True
auth_settings.password_require_special = True

# Rate Limiting
auth_settings.rate_limit_calls = 100
auth_settings.rate_limit_period = 60

# CORS
auth_settings.cors_origins = ["http://localhost:3000"]
auth_settings.cors_credentials = True
```

### Middleware Configuration

```python
from digame.app.auth.middleware import configure_auth_middleware

# Custom middleware configuration
config = {
    "enable_rate_limiting": True,
    "rate_limit_calls": 50,
    "rate_limit_period": 60,
    "enable_cors": True,
    "cors_origins": ["https://yourdomain.com"],
    "enable_security_headers": True,
    "enable_request_logging": True,
    "log_request_body": False
}

configure_auth_middleware(app, config)
```

## 🧪 Testing

### Unit Tests

```python
import pytest
from digame.app.auth.jwt_handler import TokenHandler, PasswordHandler

def test_password_hashing():
    handler = PasswordHandler()
    password = "TestPassword123!"
    
    # Test hashing
    hashed = handler.hash_password(password)
    assert hashed != password
    
    # Test verification
    assert handler.verify_password(password, hashed)
    assert not handler.verify_password("wrong", hashed)

def test_jwt_tokens():
    handler = TokenHandler()
    data = {"sub": "123", "username": "test"}
    
    # Test token creation
    token = handler.create_access_token(data)
    assert token is not None
    
    # Test token verification
    payload = handler.verify_token(token, "access")
    assert payload["sub"] == "123"
    assert payload["username"] == "test"
```

### Integration Tests

```python
from fastapi.testclient import TestClient
from digame.app.main import app

client = TestClient(app)

def test_user_registration():
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPassword123!"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data["tokens"]

def test_user_login():
    response = client.post("/auth/login", data={
        "username": "testuser",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["tokens"]
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid or expired token"
- Check token expiry settings
- Verify secret key consistency
- Ensure proper token format in Authorization header

#### 2. "Permission denied"
- Verify user has required role/permission
- Check role-permission assignments
- Ensure user account is active

#### 3. "Rate limit exceeded"
- Adjust rate limiting settings
- Implement proper retry logic
- Consider user-specific rate limits

#### 4. CORS errors
- Configure proper CORS origins
- Check preflight request handling
- Verify credentials settings

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("digame.app.auth")
logger.setLevel(logging.DEBUG)
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Change default secret key
- [ ] Update default admin credentials
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS only
- [ ] Set up proper rate limiting
- [ ] Configure secure session storage
- [ ] Enable request logging
- [ ] Set up monitoring and alerts

### Environment Variables

```bash
# Production settings
DIGAME_AUTH_SECRET_KEY=your-production-secret-key-32-chars-min
DIGAME_AUTH_DEFAULT_ADMIN_PASSWORD=secure-admin-password
DIGAME_AUTH_CORS_ORIGINS=["https://yourdomain.com"]
DIGAME_AUTH_RATE_LIMIT_CALLS=1000
DIGAME_AUTH_REQUEST_LOGGING_ENABLED=true
```

## 📚 API Documentation

When running the application, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure security best practices
5. Test with different permission scenarios

## 📄 License

This authentication system is part of the Digame platform and follows the same licensing terms.
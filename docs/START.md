# 🚀 Getting Started with Digame Platform

Welcome to **Digame** - the Digital Professional Twin Platform! This guide will help you get up and running quickly with the platform's comprehensive authentication system and core features.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Full Application](#-running-the-full-application)
- [Authentication Setup](#-authentication-setup)
- [First Steps](#-first-steps)
- [API Documentation](#-api-documentation)
- [Common Tasks](#-common-tasks)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

## ⚡ Quick Start

Get Digame running in 5 minutes with both backend API and frontend web interface:

### Option 1: Docker (Recommended)

```bash
# 1. Clone and setup
git clone <repository-url>
cd digame

# 2. Start backend and database with Docker
docker-compose up --build

# 3. In a new terminal, start the frontend
cd digame/frontend
npm install
npm run dev
```

### Option 2: Manual Setup

```bash
# 1. Clone and setup
git clone <repository-url>
cd digame

# 2. Backend Setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Set environment variables
export DIGAME_AUTH_SECRET_KEY="your-super-secret-key-at-least-32-characters-long"
export DIGAME_AUTH_DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
export DIGAME_AUTH_DEFAULT_ADMIN_PASSWORD="secure-admin-password"

# 4. Initialize database
python -c "
from digame.app.auth.init_auth_db import initialize_auth_database
from digame.app.db import get_db
db = next(get_db())
success = initialize_auth_database(db)
print('✅ Database initialized!' if success else '❌ Initialization failed')
db.close()
"

# 5. Start the backend server
python -m uvicorn digame.app.main:app --reload

# 6. In a new terminal, start the frontend
cd digame/frontend
npm install
npm run dev
```

🎉 **That's it!** Your Digame platform is now running:
- **Backend API**: http://localhost:8000
- **Frontend Web App**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Database**: SQLite (default) or PostgreSQL
- **Memory**: 512MB minimum, 2GB recommended
- **Storage**: 1GB free space

### Development Tools (Optional)
- **Git**: For version control
- **Docker**: For containerized deployment
- **VS Code**: Recommended IDE with Python extension

## 📦 Installation

### Option 1: Standard Installation

```bash
# Clone the repository
git clone <repository-url>
cd digame

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Option 2: Docker Installation (Backend + Database)

```bash
# Clone the repository
git clone <repository-url>
cd digame

# Build and run backend with Docker Compose
docker-compose up --build
```

**Note**: This starts the backend API and database only. For the web interface, you'll need to start the frontend separately (see [Running the Full Application](#-running-the-full-application)).

### Option 3: Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd digame

# Install in development mode
pip install -e .

# Install development dependencies
pip install -r requirements-dev.txt
```

## 🚀 Running the Full Application

### Complete Application Stack

To access the full Digame platform with both the web interface and API, you need to run both the backend and frontend:

#### Method 1: Docker + Frontend (Recommended)

```bash
# Terminal 1: Start backend and database
docker-compose up --build

# Terminal 2: Start frontend (in a new terminal)
cd digame/frontend
npm install
npm run dev
```

#### Method 2: Manual Setup (Both Services)

```bash
# Terminal 1: Start backend
cd digame
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn digame.app.main:app --reload

# Terminal 2: Start frontend (in a new terminal)
cd digame/frontend
npm install
npm run dev
```

### Access Points

Once both services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Web App** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Documentation** | http://localhost:8000/docs | Interactive API docs |
| **API Health Check** | http://localhost:8000/health | Backend status |

### Service Status Check

Verify both services are running:

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend (should return HTML)
curl http://localhost:3000
```

### Troubleshooting Startup

#### Backend Issues
```bash
# Check Docker containers
docker-compose ps

# View backend logs
docker-compose logs backend

# Restart backend only
docker-compose restart backend
```

#### Frontend Issues
```bash
# Check Node.js version (requires 18+)
node --version

# Clear npm cache and reinstall
cd digame/frontend
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
```

#### Port Conflicts
If you encounter port conflicts:

```bash
# Backend (change from 8000)
docker-compose down
# Edit docker-compose.yml: "8001:8000"
docker-compose up

# Frontend (change from 3000)
cd digame/frontend
npm run dev -- --port 3001
```

## 🔐 Authentication Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# JWT Configuration
DIGAME_AUTH_SECRET_KEY=your-super-secret-key-at-least-32-characters-long
DIGAME_AUTH_ACCESS_TOKEN_EXPIRE_MINUTES=30
DIGAME_AUTH_REFRESH_TOKEN_EXPIRE_DAYS=7

# Default Admin User
DIGAME_AUTH_DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DIGAME_AUTH_DEFAULT_ADMIN_USERNAME=admin
DIGAME_AUTH_DEFAULT_ADMIN_PASSWORD=change-this-secure-password

# Security Settings
DIGAME_AUTH_RATE_LIMIT_CALLS=100
DIGAME_AUTH_RATE_LIMIT_PERIOD=60

# CORS Configuration (for frontend)
DIGAME_AUTH_CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Database (optional - defaults to SQLite)
DATABASE_URL=sqlite:///./digame.db
# DATABASE_URL=postgresql://user:password@localhost/digame
```

### 2. Database Initialization

Initialize the authentication system with default roles and admin user:

```python
# Run this Python script or execute in Python REPL
from digame.app.auth.init_auth_db import initialize_auth_database, verify_auth_setup
from digame.app.db import get_db

# Initialize database
db = next(get_db())
success = initialize_auth_database(db)

if success:
    print("✅ Authentication database initialized successfully!")
    
    # Verify setup
    verification = verify_auth_setup(db)
    print("\n📊 Setup Verification:")
    for component, status in verification.items():
        print(f"  {component}: {'✅' if status else '❌'}")
else:
    print("❌ Database initialization failed!")

db.close()
```

### 3. Verify Installation

Start the server and check the health endpoints:

```bash
# Start the development server
python -m uvicorn digame.app.main:app --reload

# In another terminal, test the endpoints
curl http://localhost:8000/health
curl http://localhost:8000/auth/health
```

## 🎯 First Steps

### 1. Access the Application

#### Web Interface (Recommended for Users)
- **Main Application**: http://localhost:3000
- **User Dashboard**: http://localhost:3000/dashboard
- **Login Page**: http://localhost:3000/auth/login

#### API Documentation (For Developers)
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Health**: http://localhost:8000/health

**Note**: To access the web interface, make sure both backend and frontend are running (see [Running the Full Application](#-running-the-full-application)).

### 2. Login as Admin

Use the default admin credentials to access admin features:

```bash
# Login request
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=change-this-secure-password"
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@yourdomain.com",
    "is_active": true
  },
  "tokens": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
  }
}
```

### 3. Register a New User

```bash
# Register a new user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 4. Access Protected Endpoints

Use the access token to access protected endpoints:

```bash
# Get current user info
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Access other protected endpoints
curl -X GET "http://localhost:8000/predictive/models" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/password-change` | Change password | Yes |
| POST | `/auth/password-reset/request` | Request password reset | No |
| POST | `/auth/password-reset/confirm` | Confirm password reset | No |

### Core Platform Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | No |
| GET | `/info` | API information | No |
| GET | `/predictive/*` | Predictive modeling | Yes |
| GET | `/behavior/*` | Behavior analysis | Yes |
| GET | `/process-notes/*` | Process documentation | Yes |
| GET | `/admin/rbac/*` | Admin role management | Yes (Admin) |

### Default User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Administrator** | Full system access | All permissions |
| **Administrator** | System management | User, role, data management |
| **Manager** | Team oversight | Team and data management |
| **Analyst** | Data analysis | Analysis and reporting |
| **User** | Standard access | Basic functionality |
| **Viewer** | Read-only access | View own data only |

## 🔧 Common Tasks

### Change Admin Password

```python
from digame.app.auth.auth_service import auth_service
from digame.app.db import get_db

db = next(get_db())
success = auth_service.change_password(
    db, 
    user_id=1,  # Admin user ID
    current_password="change-this-secure-password",
    new_password="new-secure-admin-password"
)
print("✅ Password changed!" if success else "❌ Password change failed!")
db.close()
```

### Create Custom Role

```python
from digame.app.crud.rbac_crud import create_role, add_permission_to_role
from digame.app.schemas.rbac_schemas import RoleCreate
from digame.app.db import get_db

db = next(get_db())

# Create custom role
role_data = RoleCreate(name="Data Scientist", description="Advanced data analysis role")
role = create_role(db, role_data)

# Add permissions (get permission IDs from database)
# add_permission_to_role(db, role.id, permission_id)

db.close()
```

### Add User to Role

```python
from digame.app.crud.rbac_crud import assign_role_to_user_by_names
from digame.app.db import get_db

db = next(get_db())

# Assign role to user
user = assign_role_to_user_by_names(db, user_id=2, role_name="Analyst")
print(f"✅ Role assigned to user: {user.username}" if user else "❌ Assignment failed!")

db.close()
```

### Configure CORS for Frontend

```python
# In your .env file or environment
DIGAME_AUTH_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001", "https://yourdomain.com"]
DIGAME_AUTH_CORS_CREDENTIALS=true
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid or expired token"
**Problem**: Authentication fails with token errors
**Solution**:
```bash
# Check token expiry settings
echo $DIGAME_AUTH_ACCESS_TOKEN_EXPIRE_MINUTES

# Verify secret key consistency
echo $DIGAME_AUTH_SECRET_KEY

# Test token refresh
curl -X POST "http://localhost:8000/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

#### 2. "Permission denied"
**Problem**: User cannot access certain endpoints
**Solution**:
```python
# Check user roles and permissions
from digame.app.services.rbac_service import get_user_permissions
from digame.app.crud.user_crud import get_user_by_email
from digame.app.db import get_db

db = next(get_db())
user = get_user_by_email(db, "user@example.com")
permissions = get_user_permissions(user)
print(f"User permissions: {permissions}")
db.close()
```

#### 3. "Rate limit exceeded"
**Problem**: Too many requests from same IP
**Solution**:
```bash
# Adjust rate limiting in .env
DIGAME_AUTH_RATE_LIMIT_CALLS=1000
DIGAME_AUTH_RATE_LIMIT_PERIOD=60

# Or disable rate limiting for development
DIGAME_AUTH_RATE_LIMIT_ENABLED=false
```

#### 4. Database connection errors
**Problem**: Cannot connect to database
**Solution**:
```bash
# Check database URL
echo $DATABASE_URL

# For SQLite (default), ensure directory exists
mkdir -p data/

# For PostgreSQL, verify connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("digame.app.auth")
logger.setLevel(logging.DEBUG)
```

### Health Checks

Monitor system health:

```bash
# Check overall health
curl http://localhost:8000/health

# Check authentication health
curl http://localhost:8000/auth/health

# Check API info
curl http://localhost:8000/info
```

## 🚀 Next Steps

### 1. Explore the Platform

- **Behavioral Analysis**: Visit `/behavior/*` endpoints
- **Predictive Modeling**: Explore `/predictive/*` features
- **Process Documentation**: Use `/process-notes/*` for documentation
- **Admin Panel**: Access `/admin/rbac/*` for user management

### 2. Integrate with Frontend

```javascript
// Example frontend integration
const API_BASE = 'http://localhost:8000';

// Login function
async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${username}&password=${password}`
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.tokens.access_token);
    localStorage.setItem('refresh_token', data.tokens.refresh_token);
    return data.user;
  }
  throw new Error('Login failed');
}

// Authenticated API call
async function apiCall(endpoint) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 401) {
    // Token expired, try refresh
    await refreshToken();
    return apiCall(endpoint); // Retry
  }
  
  return response.json();
}
```

### 3. Customize Configuration

```bash
# Create production configuration
cp .env .env.production

# Update production settings
DIGAME_AUTH_SECRET_KEY=production-secret-key-32-chars-minimum
DIGAME_AUTH_CORS_ORIGINS=["https://yourdomain.com"]
DIGAME_AUTH_RATE_LIMIT_CALLS=1000
DIGAME_AUTH_REQUEST_LOGGING_ENABLED=true
```

### 4. Deploy to Production

```bash
# Using Docker
docker build -t digame-platform .
docker run -p 8000:8000 --env-file .env.production digame-platform

# Using systemd service
sudo cp digame.service /etc/systemd/system/
sudo systemctl enable digame
sudo systemctl start digame
```

### 5. Monitor and Scale

- Set up monitoring with health check endpoints
- Configure log aggregation for audit trails
- Implement backup strategies for user data
- Consider Redis for token caching in high-traffic scenarios

## 📞 Support

### Documentation
- **Authentication Guide**: `/digame/app/auth/README.md`
- **API Documentation**: http://localhost:8000/docs
- **Implementation Details**: `/digame/app/auth/IMPLEMENTATION_SUMMARY.md`

### Community
- **Issues**: Report bugs and feature requests
- **Discussions**: Join community discussions
- **Contributing**: See `CONTRIBUTING.md` for contribution guidelines

### Professional Support
- **Enterprise Support**: Contact for enterprise features
- **Custom Development**: Available for custom integrations
- **Training**: Platform training and workshops

---

🎉 **Welcome to Digame!** You're now ready to build amazing digital professional twin applications with robust authentication and authorization. Happy coding! 🚀


Based on the README.md and START.md files, along with the VS Code Dev Container notification you're seeing, here's how you should proceed with the Digame platform:

## 🎯 **Recommended Approach: Use Dev Container**

The notification shows that your project has a `.devcontainer.json` file configured. Since you have Docker installed, this is the **optimal way** to get started with Digame.

### **Why Dev Container is Best:**
- **Zero Configuration**: All dependencies, environment variables, and services are pre-configured
- **Consistent Environment**: Matches the exact development environment the project was designed for
- **Full Stack Ready**: Includes backend, database, and all necessary tools
- **Docker Native**: Leverages your existing Docker installation efficiently

### **How to Proceed:**

#### **Option 1: Accept the Dev Container (Recommended)**
Click **"Reopen in Container"** in the VS Code notification. This will automatically:
- Build the development environment
- Install all Python dependencies
- Set up the database (PostgreSQL)
- Configure environment variables
- Start all necessary services

#### **Option 2: Manual Dev Container Setup**
If you missed the notification, use VS Code Command Palette (Cmd+Shift+P / Ctrl+Shift+P) and type: "Dev Containers: Reopen in Container"

### **What You'll Get:**
Once the Dev Container is running:
- **Backend API**: Automatically running on `http://localhost:8000`
- **Database**: PostgreSQL configured and initialized
- **Environment**: All dependencies installed
- **Documentation**: Available at `http://localhost:8000/docs`

### **Starting the Frontend:**
After the Dev Container is ready, start the frontend in a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### **Access Points:**
- **Web App**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`
- **Default Login**: `admin@yourdomain.com` / `change-this-secure-password`

### **Alternative: Docker Compose**
If you prefer not to use Dev Container:
```bash
# Start backend and database
docker-compose up --build

# In new terminal, start frontend
cd frontend
npm install
npm run dev
```

The Digame platform is a comprehensive Digital Professional Twin Platform with advanced ML capabilities, team collaboration features, gamification, enterprise security, and mobile support. The Dev Container approach will have you up and running with the complete stack in minutes.
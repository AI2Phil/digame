# 🚀 Digame Platform - Quick Start Guide

Welcome to **Digame** - the Digital Professional Twin Platform! This guide will get you up and running in under 5 minutes.

## 📋 Table of Contents

- [🎯 Quick Start (30 seconds)](#-quick-start-30-seconds)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🚀 Startup Options](#-startup-options)
- [🔧 Troubleshooting](#-troubleshooting)
- [📚 Next Steps](#-next-steps)

## 🎯 Quick Start (30 seconds)

### Prerequisites
- **Node.js**: 18.0+ 
- **npm**: 8.0+
- **Python**: 3.8+ (for Python backend)

### Fastest Start
```bash
# Clone and navigate
git clone <repository-url>
cd digame

# Install dependencies
npm run install:all

# Start the platform (Node.js backend + Frontend)
npm run dev
```

**🎉 That's it!** Access your platform at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8003 (Python FastAPI - Currently Working)
- **Health Check**: http://localhost:8003/health

## 🏗️ Architecture Overview

Digame supports **dual backend architecture** for maximum flexibility:

### Backend Architecture Explained

The platform has **two separate Python FastAPI backends**:

1. **`main.py` (Root Level)** - Basic FastAPI app
   - **Purpose**: Simple health monitoring and metrics
   - **Port**: 8000 (default) or 8001
   - **Features**: Health checks, system metrics, basic monitoring
   - **Use Case**: Production monitoring, Docker health checks

2. **`app/main.py` (Full Platform)** - Complete Digame platform
   - **Purpose**: Full-featured application with all API routes
   - **Port**: 8003 (currently working)
   - **Features**: Authentication, teams, analytics, ML services, all business logic
   - **Use Case**: Main application backend with complete functionality

### Backend Options
| Backend | Port | File Location | Purpose | Status |
|---------|------|---------------|---------|--------|
| **Basic FastAPI** | 8001 | `main.py` | Health monitoring, metrics | Available |
| **Full Digame Platform** | 8003 | `app/main.py` | **Complete application** | ✅ **Working** |
| **Node.js** | 8001 | `backend/` | Legacy backend | ⚠️ Has issues |

### Current Status
- ⚠️ **Node.js Backend**: Available on port 8001 (has issues)
- ✅ **Basic Python FastAPI**: Available on port 8001 (monitoring only)
- ✅ **Full Python FastAPI**: **Working on port 8003** (recommended)
- ✅ **Frontend**: Next.js on port 3000 (configured for port 8003)
- ✅ **Database**: SQLite (development) / PostgreSQL (production)
- ✅ **SQLAlchemy Models**: All relationship conflicts resolved

### Why Dual Python Backends?

- **Separation of Concerns**: Basic monitoring vs full application
- **Production Flexibility**: Can run monitoring separately from main app
- **Development**: Easy to test different configurations
- **Scalability**: Can scale monitoring and application independently

## 🚀 Startup Options

### Option 1: NPM Scripts (Recommended)

```bash
# Single backend options
npm run dev                    # Node.js backend + Frontend (has issues)
npm run dev:backend-python     # Python backend + Frontend ⭐ RECOMMENDED
npm run dev:frontend           # Frontend only

# Manual Python backend (Currently Working)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Dual backend option
npm run dev:dual-backend       # Both backends + Frontend

# Production
npm run start                  # Production Node.js setup
npm run start:dual-backend     # Production dual backend
```

### ⭐ Recommended Startup (Currently Working)

```bash
# Terminal 1: Full Python Backend (Complete Platform)
cd digame
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option 2: Manual Control (Separate Terminals)

```bash
# Terminal 1: Node.js Backend
cd backend
npm install
npm start                      # Runs on port 8001

# Terminal 2: Python Backend - Full Platform (Recommended)
cd digame
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Terminal 2 Alternative: Basic Python Backend (Monitoring Only)
cd digame
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 3: Frontend
cd frontend
npm install
npm run dev                    # Runs on port 3000
```

### Option 3: Docker (Full Stack)

```bash
# Basic setup
docker-compose up

# Dual backend setup
docker-compose --profile dual-backend up

# Full stack with database and cache
docker-compose --profile dual-backend --profile cache --profile database up
```

## 🔧 Configuration

### Database Configuration

The platform uses **SQLite by default** for local development - no additional database setup required!

#### Local Development (Recommended)
- **Database**: SQLite file (`digame.db`)
- **Auto-created**: When you start the backend server
- **Location**: Project root directory
- **No setup needed**: Just run the server

#### Database Architecture
The platform has dual database configurations:
- `app/database.py`: SQLite (main application data)
- `app/db.py`: PostgreSQL (Docker/production oriented)

**Why PostgreSQL hostname "db" appears**: The `app/db.py` file contains Docker container configuration with hostname "db" for container networking. This is normal and doesn't affect local development.

#### Production Setup
For production deployments, configure PostgreSQL:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/digame_db"
```

📖 **Detailed Information**: See [`docs/02-implementation/DATABASE_CONFIGURATION.md`](02-implementation/DATABASE_CONFIGURATION.md) for complete database configuration analysis.

### Frontend Configuration

The frontend automatically connects to the backend. Current configuration:

```bash
# Check current backend URL
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8003
```

### Backend Ports

| Service | Default Port | Alternative |
|---------|--------------|-------------|
| Frontend | 3000 | 3001 |
| Node.js Backend | 8001 | 8000 |
| Python Backend | 8002 | 8003 |
| PostgreSQL (Docker) | 5433 | 5432 |
| Redis (Docker) | 6379 | - |

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Port Conflicts
```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :8001  # Node.js backend
lsof -i :8003  # Python backend

# Kill conflicting processes
lsof -ti:8001 | xargs kill -9
```

#### 2. Backend Not Starting
```bash
# Node.js Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm start

# Python Backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003
```

#### 3. Frontend Connection Issues
```bash
# Check backend health
curl http://localhost:8003/api/teams

# Update frontend config if needed
echo "NEXT_PUBLIC_API_URL=http://localhost:8003" > frontend/.env.local
```

#### 4. Import/Module Errors (Python)
```bash
# Run from project root, not app directory
cd digame
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003
```

### Health Checks

```bash
# Check all services
curl http://localhost:3000        # Frontend (should return HTML)
curl http://localhost:8001/health # Node.js backend (may have issues)
curl http://localhost:8003/api/teams # Python backend (working)

# Test authentication
curl -X POST "http://localhost:8001/auth/demo"
```

### Debug Mode

```bash
# Backend with debug logging
cd backend
NODE_ENV=development npm start

# Python backend with debug
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload --log-level debug

# Frontend (development mode is default)
cd frontend
npm run dev
```

## 🎯 Quick Test

### 1. Verify Services
```bash
# All services should return 200 OK
curl -s http://localhost:8003/api/teams | jq .
curl -s http://localhost:3000 | head -5
```

### 2. Test Authentication
```bash
# Demo login
curl -X POST "http://localhost:8001/auth/demo" | jq .

# Register new user
curl -X POST "http://localhost:8001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User"
  }' | jq .
```

### 3. Access Web Interface
1. Open http://localhost:3000
2. Click "Get Started"
3. Try "Demo Mode" or "Create Account"
4. Complete onboarding flow
5. Explore dashboard features

### 4. Lint Commands
npm run lint:fix 
npm run lint 
npm run build 

### 5. CI/CD Pipeline Status
Test if all CI/CD scripts are working perfectly:
✅ npm run build - Complete platform build (frontend + backend)
✅ npm run lint:fix - Fixes linting issues automatically
✅ npm run lint:security - Security-focused linting with custom rules
✅ npm run test:unit - Unit testing with coverage and graceful handling
✅ npm run analyze:bundle - Bundle analysis for performance optimization
✅ npm run serve:dist - Serves built application for testing

## 📚 Next Steps

### Immediate Actions
1. **Explore the Platform**: Complete user registration and onboarding
2. **Test Features**: Try team creation, analytics, and integrations
3. **API Testing**: Use the Test Zone at http://localhost:3000/test-zone
4. **Documentation**: Read the full guide at [`docs/05-deployment/Start Docs/START.md`](05-deployment/Start%20Docs/START.md)

### Development
- **API Documentation**: http://localhost:8003/docs (Python backend)
- **Database CLI**: `npm run db:health` (from backend directory)
- **Cache Management**: `npm run icache:analytics` (from backend directory)

### Production Setup
- **Database Migration**: SQLite → PostgreSQL/MongoDB
- **Environment Variables**: Configure production settings
- **SSL/HTTPS**: Set up certificates and reverse proxy
- **Monitoring**: Add logging and health monitoring

## 🔗 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | http://localhost:3000 | Primary user interface |
| **Node.js API** | http://localhost:8001 | REST API endpoints (has issues) |
| **Python API** | http://localhost:8003 | **Working API** - ML/Analytics/Teams |
| **Test Zone** | http://localhost:3000/test-zone | Platform testing interface |
| **Health Check** | http://localhost:8001/health | System status |
| **API Docs** | http://localhost:8003/docs | Interactive API documentation |

## 🎉 Success!

You now have the complete Digame platform running with:
- ✅ **Frontend Web Application** (Next.js)
- ✅ **Backend API Services** (Node.js + Python)
- ✅ **Authentication System** (JWT-based)
- ✅ **Database** (SQLite for development)
- ✅ **User Workflow** (Registration → Onboarding → Dashboard)

**Happy exploring!** 🚀

---

**Need Help?** 
- 📖 **Full Documentation**: [`docs/05-deployment/Start Docs/START.md`](05-deployment/Start%20Docs/START.md)
- 🐛 **Troubleshooting**: See the troubleshooting section above
- 💬 **Support**: Check the issues section or community discussions
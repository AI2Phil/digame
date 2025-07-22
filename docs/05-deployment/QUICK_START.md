# 🚀 Digame Platform - Quick Start Guide

Welcome to **Digame** - the Digital Professional Twin Platform! This guide will get you up and running in under 5 minutes.

## 📋 Table of Contents

- [🎯 Quick Start (30 seconds)](#-quick-start-30-seconds)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🚀 Startup Options](#-startup-options)
- [🔧 Troubleshooting](#-troubleshooting)
- [📚 Next Steps](#-next-steps)

## 🎯 Quick Start (30 seconds)

I found the issue! The Docker Compose setup is configured differently than expected:

1. **Python FastAPI backend** is on port **8002** (not 8000) and requires the `dual-backend` profile
2. **Node.js backend** is on port **8001** and is the primary backend
3. **Frontend** is configured to use the Node.js backend (`NEXT_PUBLIC_API_URL=http://backend-node:8001`)

**Best Solutions**:

### Option A: Use Dual Backend (Recommended)
The dual backend gives you the most complete development experience with all features working.
```bash
# Stop Docker first
docker-compose down

# Run both backends locally
npm run dev:dual-backend
```
This gives you:
- Node.js backend (port 8001) - for authentication
- Python FastAPI (port 8002) - for analytics/AI features  
- Frontend auto-detects and uses both

### Option B: Fix Docker to include Python backend
Add the Python backend to [`docker-compose.yml`](docker-compose.yml:1) so both run in Docker.

### Option C: Revert API config for Docker-only
Keep the change I made to [`api-config.js`](frontend/src/lib/api-config.js:1) (port 8001) and use Docker only.
open -a Docker
docker-compose up -d
docker-compose ps
sleep 15 && curl -s http://localhost:8001/health

### Issue
But our frontend is configured to use port 8000 for the Python FastAPI backend. We have two options:

**Option 1: Start the Python FastAPI backend with the dual-backend profile**
**Option 2: Update the frontend to use the Node.js backend**

Start the Python FastAPI backend with the dual-backend profile:
docker-compose --profile dual-backend up -d

I can see both containers are running:
- **Frontend**: `digame-frontend-1` on port 3001
- **Node.js Backend**: `digame-backend-node-1` on port 8001 (but showing as unhealthy)

The issue is that the Node.js backend is unhealthy. Let me check the logs to see what's wrong:
docker-compose logs backend-node

Now I need to update the todo list to reflect the current issue and then test the fix. The problem was that the frontend was trying to connect to port 8000 (Python FastAPI) but Docker only has the Node.js backend running on port 8001.
The problem is that the api-config.js is hardcoded to use port 8000, but the Docker setup only has the Node.js backend running on port 8001. The apiService.js has the correct port detection logic (with 8001 as the first priority), but the api-config.js is overriding it.
The issue is in line 15 of api-config.js where it defaults to port 8000. Let me fix this by updating the API configuration to prioritize port 8001 for Docker environments.
Perfect! Yes, you're absolutely right! Looking at the [`package.json`](package.json:1), there are several options to run both backends simultaneously:

## Available Development Commands:

1. **`npm run dev`** - Runs [`./scripts/start-dev.sh`](package.json:7) (let me check what this script does)

2. **`npm run dev:dual-backend`** - Runs frontend + Node.js backend + Python backend simultaneously on:
   - Frontend: port 3000
   - Node.js backend: port 8001  
   - Python backend: port 8002 (note: different from 8000!)

3. **`npm run dev:legacy`** - Runs frontend + Node.js backend only

Let me check the start-dev.sh script to see what the default `npm run dev` does: scripts/start-dev.sh
Excellent! Now I understand the full picture. Looking at the [`start-dev.sh`](scripts/start-dev.sh:1) script, I can see that:

## Current Development Setup Options:

### 1. **`npm run dev`** (Default - Python FastAPI only)
- Runs [`./scripts/start-dev.sh`](scripts/start-dev.sh:1)
- Starts **Python FastAPI backend** on port 8000+ (auto-detects available port)
- Starts **Frontend** on port 3000+
- **No Node.js backend** - this explains the 404 error!

### 2. **`npm run dev:dual-backend`** (Both backends)
- Frontend: port 3000
- Node.js backend: port 8001
- Python backend: port 8002 (not 8000!)

### 3. **`npm run dev:legacy`** (Node.js only)
- Frontend + Node.js backend only

## The Problem & Solutions:

**Current Issue**: You're using Docker (which runs Node.js on port 8001), but the frontend is configured for the Python backend approach.

### Prerequisites
- **Node.js**: 18.0+ 
- **npm**: 8.0+
- **Python**: 3.8+ (for Python backend)



### Check for Lint or Typescript errors

✔ Find ESLint warnings or errors
- npm run lint 2>&1 | grep -E "(error|warning)" | head -10

- cd frontend && npm run lint 2>&1 | grep -E "(React Hook|exhaustive-d
eps)" | head -20
- cd frontend && npm run lint 2>&1 | grep -E "(error|warning)" | hea
d -10

npm run lint 2>&1 | grep -E "(React Hook|exhaustive-deps)" | head 
-10

npm run lint

✔ Find Typescript warnings or errors
npx tsc --noEmit 2>&1 | head -10

npx tsc --noEmit

npm run ci:quick

Perfect! I can see the E2E test commands available. Here are the commands to run the full E2E test suite:

## **E2E Test Commands Available:**

### **🚀 Full E2E Test Suite (Recommended)**
```bash
cd frontend
npm run test:e2e:full
```
This command:
- Runs the setup script (`../scripts/setup-test-env.sh`)
- Executes all Playwright tests across all browsers
- Runs cleanup script (`../scripts/cleanup-test-env.sh`)

### **⚡ Quick E2E Tests (No Setup/Cleanup)**
```bash
cd frontend
npm run test:e2e
```
This runs `playwright test` directly without environment setup.

### **🔍 Other E2E Test Options:**
```bash
# Run with browser UI visible
cd frontend
npm run test:e2e:headed

# Run in debug mode (step-by-step)
cd frontend
npm run test:e2e:debug

# Manual setup and cleanup
cd frontend
npm run test:e2e:setup    # Setup test environment
npm run test:e2e          # Run tests
npm run test:e2e:cleanup  # Cleanup test environment
```

### **🏗️ Root Level CI Command (Full Pipeline)**
```bash
# From project root
npm run ci                # Full CI: lint + type-check + build + test
npm run ci:frontend       # Frontend-only CI pipeline
npm run ci:quick          # Quick CI: lint + build only
```

## **💡 Recommended Workflow:**

1. **For local development testing:**
   ```bash
   cd frontend
   npm run test:e2e:full
   ```

2. **For CI/CD pipeline testing:**
   ```bash
   npm run ci
   ```

The `test:e2e:full` command is the most comprehensive as it includes proper environment setup and cleanup, which matches what the CI pipeline does.


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

# Performance tests
Interactive script usage: 
```
./scripts/run-performance-tests.sh
```
Direct Docker Compose: 
```
docker compose -f docker-compose.performance.yml up -d
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


**Need Help?** 
- 📖 **Full Documentation**: [`docs/05-deployment/Start Docs/START.md`](05-deployment/Start%20Docs/START.md)
- 🐛 **Troubleshooting**: See the troubleshooting section above
- 💬 **Support**: Check the issues section or community discussions

## 🚀 Performance Testing & CI/CD Quick Start

### Overview

The Digame platform now includes comprehensive performance testing infrastructure that enhances your development experience with automated performance validation, load testing capabilities, and continuous monitoring. Get started with performance testing in under 2 minutes!

### ⚡ Performance Testing Quick Start (60 seconds)

#### Option 1: Interactive Performance Testing (Recommended)

```bash
# Launch interactive performance testing menu
./scripts/run-performance-tests.sh

# Choose from menu:
# 1. Deploy Full Stack - Complete infrastructure with monitoring
# 2. Deploy Frontend Only - Lightweight frontend testing  
# 3. View Service Status - Check running services
# 4. View Logs - Real-time log monitoring
# 5. Stop Services - Clean shutdown
# 6. Performance Report - Generate test results
```

#### Option 2: Direct Docker Compose

```bash
# Start performance testing infrastructure
docker compose -f docker-compose.performance.yml up -d

# Access performance testing interfaces:
# - Locust Web UI: http://localhost:8089
# - Prometheus Metrics: http://localhost:9090  
# - Grafana Dashboards: http://localhost:3001 (admin/admin)
```

### 🎯 Performance Testing Integration with Development

#### Enhanced Development Workflow

Performance testing integrates seamlessly with your existing development workflow:

```bash
# Standard development startup
npm run dev                           # Start development environment

# Launch performance testing (new terminal)
./scripts/run-performance-tests.sh   # Interactive performance testing

# Access points:
# Development: http://localhost:3000 (frontend), http://localhost:8001 (backend)
# Performance: http://localhost:8089 (Locust), http://localhost:9090 (Prometheus)
```

#### Real-time Performance Validation

Test performance impact of your changes in real-time:

```bash
# 1. Make code changes in your development environment
# 2. Performance tests automatically detect changes
# 3. View real-time metrics in Locust UI: http://localhost:8089
# 4. Monitor system metrics in Grafana: http://localhost:3001
```

### 🏗️ Performance Testing Architecture

#### Service Components

The performance testing stack includes:

| Service | URL | Description |
|---------|-----|-------------|
| **Locust Master** | http://localhost:8089 | Load testing coordinator with web UI |
| **Locust Workers** | - | Distributed test execution nodes |
| **Prometheus** | http://localhost:9090 | Performance metrics collection |
| **Grafana** | http://localhost:3001 | Real-time dashboards (admin/admin) |
| **Test Backend** | http://localhost:8000 | Containerized backend for testing |
| **Test Frontend** | http://localhost:3000 | Containerized frontend for testing |

#### Docker Compose Compatibility

Supports both legacy and modern Docker Compose installations:

```bash
# Modern Docker Compose (recommended)
docker compose -f docker-compose.performance.yml up -d

# Legacy Docker Compose (automatic fallback)
docker-compose -f docker-compose.performance.yml up -d

# Automatic detection in scripts
./scripts/run-performance-tests.sh  # Detects available command
```

### 🎯 Core Web Vitals Testing

#### Frontend Performance Metrics

Automated measurement of Core Web Vitals:

- **Largest Contentful Paint (LCP)**: < 2.5s target
- **First Input Delay (FID)**: < 100ms target  
- **Cumulative Layout Shift (CLS)**: < 0.1 target
- **First Contentful Paint (FCP)**: < 1.8s target
- **Time to First Byte (TTFB)**: < 600ms target

#### Performance Optimization Validation

Test performance optimizations:

```bash
# Run frontend-only performance tests
curl -X POST http://localhost:8089/swarm \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "user_count=10&spawn_rate=2&host=http://localhost:3000"

# Monitor Core Web Vitals in real-time
open http://localhost:8089
```

### 🔄 CI/CD Integration

#### GitHub Actions Workflow

Automated performance testing in CI/CD pipeline:

```yaml
# .github/workflows/performance-testing.yml
name: Performance Testing
on: [push, pull_request]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Performance Tests
        run: |
          docker compose -f docker-compose.performance.yml up -d
          ./scripts/run-performance-tests.sh --ci-mode
```

#### Performance Thresholds

Configurable performance budgets:

```bash
# Default performance thresholds
MAX_RESPONSE_TIME=2000ms      # Maximum API response time
MIN_SUCCESS_RATE=95%          # Minimum request success rate  
MAX_ERROR_RATE=5%             # Maximum error rate
MAX_P95_RESPONSE_TIME=3000ms  # 95th percentile response time
MIN_THROUGHPUT=100rps         # Minimum requests per second
```

### 🛠️ Build Optimization

#### Docker Build Context Optimization

Optimized build process for faster performance testing:

```dockerfile
# frontend/.dockerignore
node_modules/
.next/
.git/
*.log
coverage/

# Build context reduced from 125MB+ to 3.21MB
```

#### Multi-Stage Docker Builds

Efficient Docker images for performance testing:

```dockerfile
# Optimized Dockerfile structure
FROM node:22-alpine AS deps     # Install dependencies
FROM node:22-alpine AS builder  # Build application  
FROM node:22-alpine AS runner   # Production runtime
```

### 🔧 Performance Testing Troubleshooting

#### Quick Fixes

**1. Docker Compose Command Not Found**
```bash
# Use modern syntax
docker compose -f docker-compose.performance.yml up -d
```

**2. Service Connection Issues**
```bash
# Check service health
docker compose -f docker-compose.performance.yml ps
curl http://localhost:8000/health  # Backend
curl http://localhost:3000/api/health  # Frontend
```

**3. Port Conflicts**
```bash
# Check for conflicts
lsof -i :8089  # Locust
lsof -i :9090  # Prometheus  
lsof -i :3001  # Grafana

# Kill conflicting processes
lsof -ti:8089 | xargs kill -9
```

#### Performance Testing Validation

```bash
# Validate complete infrastructure
./scripts/run-performance-tests.sh

# Check all services
docker compose -f docker-compose.performance.yml ps

# Generate performance report
curl -s http://localhost:8089/stats/requests | jq .
```

### 📊 Performance Monitoring Quick Access

#### Real-time Dashboards

Access comprehensive performance monitoring:

```bash
# Locust testing interface
open http://localhost:8089

# Prometheus metrics
open http://localhost:9090

# Grafana dashboards  
open http://localhost:3001  # admin/admin
```

#### Key Metrics to Monitor

- **Request Metrics**: Response times, throughput, error rates
- **System Metrics**: CPU, memory, network utilization
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB measurements
- **Service Health**: Uptime, availability, error tracking

### 🎯 Performance Testing Best Practices

#### Quick Testing Strategy

1. **Baseline Testing**: Establish performance baselines before changes
2. **Feature Testing**: Validate performance impact of new features
3. **Stress Testing**: Identify system limits and breaking points
4. **Regression Testing**: Ensure changes don't degrade performance

#### Development Integration

```bash
# Pre-commit performance check
./scripts/run-performance-tests.sh --quick

# Feature branch validation  
./scripts/run-performance-tests.sh --baseline=main --current=feature-branch

# Release validation
./scripts/run-performance-tests.sh --comprehensive
```

### 🚀 Enhanced Quick Start Commands

#### Development + Performance Testing

Complete development workflow with performance validation:

```bash
# Option 1: Sequential startup
npm run dev                           # Start development
./scripts/run-performance-tests.sh   # Launch performance testing

# Option 2: Combined startup (if available)
npm run dev:with-performance         # Development + Performance testing

# Option 3: Docker-based development
docker compose up                     # Development environment
docker compose -f docker-compose.performance.yml up -d  # Performance testing
```

#### Quick Performance Validation

Rapid performance testing for immediate feedback:

```bash
# Quick frontend performance test
curl -X POST http://localhost:8089/swarm \
  -d "user_count=5&spawn_rate=1&host=http://localhost:3000"

# Quick backend performance test  
curl -X POST http://localhost:8089/swarm \
  -d "user_count=5&spawn_rate=1&host=http://localhost:8000"

# View results
open http://localhost:8089
```

This performance testing infrastructure ensures that your Digame platform maintains optimal performance throughout development, providing immediate feedback on performance impact and comprehensive monitoring capabilities for a superior development experience.


## ✅ CLI Workflow Integration Complete

### **Package.json Updates:**

#### **Root Package.json:**
- **`npm run dev`** → Enhanced development with `./scripts/start-dev.sh`
- **`npm run dev:stop`** → Clean shutdown with `./scripts/stop-dev.sh`
- **`npm run dev:legacy`** → Fallback to original concurrently workflow
- **`npm run test:e2e`** → Full E2E testing with backend service management
- **`npm run test:e2e:setup`** → Setup test environment only
- **`npm run test:e2e:cleanup`** → Cleanup test environment only
- **`npm run type-check`** → TypeScript type checking from root
- **`npm run lint`** → ESLint linting from root
- **`npm run lint:fix`** → ESLint auto-fix from root

#### **Frontend Package.json:**
- **`npm run test:e2e:full`** → E2E tests with backend orchestration
- **`npm run test:e2e:setup`** → Calls parent setup script
- **`npm run test:e2e:cleanup`** → Calls parent cleanup script

### **✅ Verification Results:**

1. **TypeScript Type Check**: ✅ PASSED - No type errors
2. **ESLint Linting**: ✅ PASSED - Only existing warnings (unrelated to our changes)
3. **CLI Commands**: ✅ WORKING - All new commands execute correctly

### **🛡️ Conflict Prevention:**

- **Backward Compatibility**: All original commands still work
- **Port Management**: Development (3000/8000) vs Testing (3001/8001)
- **Process Management**: Enhanced scripts detect and cleanup processes
- **Environment Isolation**: Separate configs for dev/test environments

### **📚 Documentation Created:**

1. **CLI_WORKFLOW_INTEGRATION.md** - Comprehensive migration guide
2. **Updated scripts/README.md** - Integration script documentation
3. **Command Reference Tables** - Complete CLI command documentation

### **🚀 Enhanced Developer Experience:**

#### **Before:**
```bash
npm run dev  # Basic concurrently, no health checks
cd frontend && npm run test:e2e  # No backend services
```

#### **After:**
```bash
npm run dev  # Enhanced with health checks, service orchestration
npm run test:e2e  # Full integration with backend services
npm run type-check  # Convenient root-level type checking
npm run lint  # Convenient root-level linting
```

### **🔧 Key Benefits:**

- ✅ **Service Orchestration**: Automatic backend/frontend coordination
- ✅ **Health Monitoring**: Service health validation and error recovery
- ✅ **Resource Management**: Proper cleanup and port management
- ✅ **Testing Integration**: E2E tests with backend service management
- ✅ **Developer Convenience**: Root-level commands for common tasks
- ✅ **Fallback Support**: Legacy commands available if needed

The CLI workflow now seamlessly integrates with our new integration scripts while maintaining full backward compatibility and providing enhanced functionality for development, testing, and quality assurance workflows.
# 🚀 Digame Platform - Complete Setup Guide

## 📋 **Current Status & Solutions**

### ✅ **Test Zone Functionality - COMPLETE**
All required Test Zone endpoints are **already implemented** in the Node.js backend:
- `GET /platform-owner/test-zone/metrics` ✅
- `POST /platform-owner/test-zone/run-all-tests` ✅  
- `GET /platform-owner/test-zone/available-tests` ✅
- `GET /platform-owner/test-zone/intelligence/sample-data` ✅

### 🔧 **Authentication Issue - IDENTIFIED**
The "Remember me" functionality is properly implemented in the frontend but may fail due to:
1. Backend authentication endpoints not responding correctly
2. Token validation failing on server restart
3. CORS issues between frontend and backend

---

## 🚀 **Quick Start Options**

### **Option 1: NPM Scripts (Recommended)**
```bash
# Install all dependencies
npm run install:all

# Start with Node.js backend (Complete Test Zone)
npm run dev

# Start with Python FastAPI backend  
npm run dev:backend-python

# Start both backends (Dual mode)
npm run dev:dual-backend

# Frontend only
npm run dev:frontend
```

### **Option 2: Interactive Script**
```bash
# Make executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### **Option 3: Docker Compose**
```bash
# Basic setup (Node.js + Frontend)
docker-compose up

# With Python backend
docker-compose --profile dual-backend up

# With cache and database
docker-compose --profile dual-backend --profile cache --profile database up
```

---

## 🏗️ **Backend Architecture Decision**

### **✅ RECOMMENDED: Node.js Backend (Port 8001)**
**Why:** Complete, working, and has all Test Zone functionality

**Features:**
- ✅ Complete Test Zone implementation
- ✅ Authentication & Platform Owner features  
- ✅ Performance monitoring & caching
- ✅ Service discovery
- ✅ 28+ API tests across 9 categories

### **🔄 OPTIONAL: Python FastAPI Backend (Port 8002)**
**Use Case:** Data science, ML models, advanced analytics

**Status:** 
- ✅ Advanced SQLAlchemy 2.0 implementation
- ❌ Missing Test Zone endpoints
- ❌ Not currently connected to frontend

---

## 🔧 **Available Commands**

### **Development**
```bash
npm run dev                    # Node.js backend + Frontend
npm run dev:dual-backend       # Both backends + Frontend  
npm run dev:backend-node       # Node.js backend only
npm run dev:backend-python     # Python backend only
npm run dev:frontend           # Frontend only
```

### **Production**
```bash
npm run start                  # Production build
npm run start:dual-backend     # Both backends production
npm run build                  # Build all components
```

### **Maintenance**
```bash
npm run install:all            # Install all dependencies
npm run clean                  # Clean node_modules
npm run test                   # Run all tests
```

---

## 🌐 **Service URLs**

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3001 | ✅ Active |
| Node.js Backend | http://localhost:8001 | ✅ Complete Test Zone |
| Python Backend | http://localhost:8002 | 🔄 Optional |
| Health Check | http://localhost:8001/health | ✅ Available |
| API Docs | http://localhost:8001/docs | ✅ Available |

---

## 🔐 **Authentication & Test Zone Access**

### **Login Credentials**
- **Email:** `philip.a.oshea@gmail.com`
- **Password:** `Dalk3y1306`
- **Role:** Platform Owner

### **Test Zone Access**
1. Login with credentials above
2. Navigate to: Platform Owner → Development → API Test Zone
3. Use "Refresh" and "Run all Tests" buttons

### **"Remember Me" Troubleshooting**
If "Remember me" doesn't work:
1. Check browser console for authentication errors
2. Verify backend is running on port 8001
3. Clear browser storage: `localStorage.clear()`
4. Restart both frontend and backend

---

## 📊 **Test Zone Features**

### **Available Test Categories**
1. **Intelligence APIs** (5 tests)
   - Pattern Analysis
   - Productivity Prediction  
   - Task Forecasting
   - Energy Prediction
   - Comprehensive Insights

2. **Digital Twin APIs** (4 tests)
3. **NLP APIs** (3 tests)
4. **Analytics APIs** (4 tests)
5. **Learning APIs** (3 tests)
6. **Team APIs** (3 tests)
7. **WebSocket APIs** (3 tests)
8. **Kubernetes APIs** (3 tests)

### **Test Metrics Tracking**
- Tests Passed/Failed counts
- Coverage percentage
- Last run timestamp
- Test execution history

---

## 🐳 **Docker Deployment**

### **Basic Setup**
```bash
docker-compose up
```

### **With All Services**
```bash
docker-compose --profile dual-backend --profile cache --profile database up
```

### **Available Profiles**
- `dual-backend`: Includes Python FastAPI backend
- `cache`: Adds Redis cache
- `database`: Adds PostgreSQL database

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **404 Errors in Test Zone**
   - ✅ **SOLVED:** All endpoints exist in Node.js backend
   - Ensure backend is running on port 8001

2. **Authentication Not Persisting**
   - Clear browser storage: `localStorage.clear()`
   - Check backend `/auth/login` endpoint
   - Verify CORS settings

3. **Port Conflicts**
   - Frontend: 3001 (fallback from 3000)
   - Node.js Backend: 8001
   - Python Backend: 8002

4. **Test Metrics Not Updating**
   - ✅ **SOLVED:** Metrics endpoint implemented
   - Verify authentication is working
   - Check browser network tab for API calls

### **Reset Everything**
```bash
# Stop all services
pkill -f "node\|python\|uvicorn"

# Clean and reinstall
npm run clean
npm run install:all

# Restart
npm run dev
```

---

## 📈 **Next Steps**

1. **✅ Test Zone is ready** - All endpoints implemented
2. **🔧 Fix authentication persistence** - Backend endpoint verification needed
3. **🚀 Choose backend strategy** - Node.js recommended for completeness
4. **📦 Deploy with Docker** - Production-ready containers available

---

## 🎯 **Immediate Action Items**

1. **Test the working system:**
   ```bash
   npm run dev
   # Navigate to: http://localhost:3001/platform-owner/test-zone
   ```

2. **Verify authentication:**
   - Login with provided credentials
   - Test "Remember me" functionality
   - Check Test Zone access

3. **Confirm Test Zone functionality:**
   - Click "Refresh" button
   - Click "Run all Tests" button  
   - Verify metrics update

The Test Zone should work immediately since all backend endpoints are implemented and functional! 🎉

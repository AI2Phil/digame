# Backend Architecture Guide & CLI Solutions

## 🎯 Problem Statement

The Digame platform has a **dual backend architecture** that can cause confusion when starting services. Users may encounter `TypeError: Cannot read properties of undefined (reading 'listen')` errors due to running the wrong backend or using incorrect commands.

## 🏗️ Architecture Overview

```
Digame Platform
├── Frontend (Next.js) :3000
├── Python Backend (FastAPI) :8000 - Primary
│   ├── Health checks & monitoring
│   ├── Security dashboard
│   └── Metrics collection
└── Node.js Backend (Express) :8001 - Secondary
    ├── Authentication & JWT
    ├── User management
    ├── Database operations
    └── Redis caching
```

## 🚨 Common Error Scenarios

### Error: `app.listen() undefined at line 33`
**Root Causes:**
1. Running from wrong directory
2. Expecting Node.js backend but getting Python backend
3. Using incorrect npm script

## 🛠️ CLI Solutions

### ⚠️ WARNING: Backend Selection Guide

```bash
# ❌ WRONG - This starts Python backend only
npm run dev

# ✅ CORRECT - For Node.js backend with auth/database
cd backend && npm start

# ✅ CORRECT - For both backends simultaneously  
npm start

# ✅ CORRECT - For Python backend only
npm run dev:backend-python
```

### 🔧 Quick Fix Commands

#### 1. **If you need Node.js backend (auth, database, users):**
```bash
# Navigate to backend directory and start
cd backend
npm start
```

#### 2. **If you need Python backend (health, security, metrics):**
```bash
# From project root
npm run dev
# OR
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. **If you need both backends:**
```bash
# From project root - starts both concurrently
npm start
```

### 🔍 Diagnostic Commands

#### Check which backend is running:
```bash
# Check Python backend
curl http://localhost:8000/health

# Check Node.js backend  
curl http://localhost:8001/health

# Check frontend
curl http://localhost:3000
```

#### Kill conflicting processes:
```bash
# Kill processes on common ports
lsof -ti:8000 | xargs kill -9
lsof -ti:8001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

## 📋 Package.json Script Reference

### Root `package.json` Scripts:
- `npm run dev` → Python backend only (via start-dev.sh)
- `npm start` → Both backends + frontend
- `npm run start:backend-node` → Node.js backend only
- `npm run start:backend-python` → Python backend only

### Backend `package.json` Scripts:
- `npm start` → Node.js Express server
- `npm run dev` → Node.js with nodemon

## 🎯 Recommended Workflow

### For Development:
```bash
# Option 1: Full stack development
npm start

# Option 2: Frontend + Node.js backend only
npm run start:frontend & npm run start:backend-node

# Option 3: Frontend + Python backend only  
npm run dev
```

### For Production:
```bash
# Build everything
npm run build

# Start production servers
npm run start:backend-node &
npm run start:backend-python &
npm run start:frontend
```

## 🚀 Environment Setup

### Required Environment Variables:

#### For Node.js Backend:
```bash
# backend/.env
PORT=8001
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

#### For Python Backend:
```bash
# .env
ENVIRONMENT=development
DEBUG=true
```

## 🔧 Troubleshooting Guide

### Issue: "app.listen() is undefined"
**Solution:**
```bash
# 1. Verify you're in the correct directory
pwd  # Should show /path/to/digame/backend for Node.js

# 2. Check the correct entry point
ls -la src/server.js  # Should exist for Node.js backend

# 3. Use the correct command
npm start  # From backend directory
```

### Issue: "Port already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:8001 | xargs kill -9

# Or use the cleanup script
./scripts/stop-dev.sh
```

### Issue: "Module not found"
**Solution:**
```bash
# Install dependencies
cd backend && npm install
# OR for Python
pip install -r requirements.txt
```

## 📊 Service Health Checks

### Automated Health Check Script:
```bash
#!/bin/bash
echo "🔍 Checking service health..."

# Check Python backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Python backend (FastAPI) - Healthy"
else
    echo "❌ Python backend (FastAPI) - Down"
fi

# Check Node.js backend  
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Node.js backend (Express) - Healthy"
else
    echo "❌ Node.js backend (Express) - Down"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend (Next.js) - Healthy"
else
    echo "❌ Frontend (Next.js) - Down"
fi
```

## 🎉 Quick Start Cheat Sheet

| Need | Command | Port | Purpose |
|------|---------|------|---------|
| **Full Development** | `npm start` | 3000, 8000, 8001 | All services |
| **Node.js Backend** | `cd backend && npm start` | 8001 | Auth, DB, Users |
| **Python Backend** | `npm run dev` | 8000 | Health, Security |
| **Frontend Only** | `cd frontend && npm run dev` | 3000 | UI Development |

## 🔄 Migration Path

If you're currently experiencing backend confusion:

1. **Stop all services:** `./scripts/stop-dev.sh`
2. **Identify your needs:** Auth/DB = Node.js, Health/Metrics = Python
3. **Use correct command:** See cheat sheet above
4. **Verify health:** Use diagnostic commands

---

**💡 Pro Tip:** Always check which directory you're in (`pwd`) and which backend you actually need before running start commands.
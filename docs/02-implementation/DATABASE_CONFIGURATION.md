# Database Configuration Analysis

## Overview

The Digame platform has **dual database configurations** that can cause confusion during setup. This document explains the database architecture, why PostgreSQL hostname "db" appears, and clarifies the relationship with SQLAlchemy 2.0.

## Database Configuration Files

### 1. `app/db.py` - PostgreSQL Configuration (Docker-oriented)
```python
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://digame_user:digame_password@db:5432/digame_db"
)
```
- **Default hostname**: `db` (Docker container name)
- **Purpose**: Designed for Docker Compose deployments
- **Used by**: Authentication initialization (`app/main.py` line 428)

### 2. `app/database.py` - SQLite Configuration (Local development)
```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./digame.db")
```
- **Default**: SQLite file-based database
- **Purpose**: Local development and testing
- **Used by**: Most application models and services

## Why PostgreSQL Hostname "db" Appears

The hostname "db" in `app/db.py` is a **Docker container name**, not a local hostname:

1. **Docker Compose Context**: In Docker deployments, services communicate using container names
2. **Container Networking**: `db` would be the PostgreSQL container name in `docker-compose.yml`
3. **Local Development Issue**: When running locally without Docker, this hostname doesn't exist

## Current Architecture Analysis

### Active Database Configuration
Based on the running server (`app/main.py`), the platform uses:
- **Primary**: `app/database.py` (SQLite) for most operations
- **Authentication**: `app/db.py` (PostgreSQL) for auth initialization only

### File Usage Breakdown
```
app/database.py (SQLite):
├── Most models and services
├── User profiles, teams, analytics
├── Social collaboration features
└── Main application data

app/db.py (PostgreSQL):
├── Authentication initialization
├── get_db() dependency injection
└── Session management
```

## SQLAlchemy 2.0 and Database Backend Relationship

### Can PostgreSQL be removed?

**Short Answer**: Yes, but requires configuration changes.

**Detailed Analysis**:

1. **SQLAlchemy 2.0 is database-agnostic**
   - Works with SQLite, PostgreSQL, MySQL, etc.
   - Database choice is independent of SQLAlchemy version

2. **Current Dependencies**:
   - Authentication system imports from `app/db.py`
   - Some services may expect PostgreSQL features
   - Connection pooling configured differently

3. **To Remove PostgreSQL**:
   ```python
   # Option 1: Update app/db.py to use SQLite
   SQLALCHEMY_DATABASE_URL = os.getenv(
       "DATABASE_URL", "sqlite:///./digame.db"
   )
   
   # Option 2: Consolidate to single database.py
   # Update all imports from app.db to app.database
   ```

## Recommended Solutions

### For Local Development (Immediate)
1. **Set Environment Variable**:
   ```bash
   export DATABASE_URL="sqlite:///./digame.db"
   ```

2. **Or Update app/db.py**:
   ```python
   SQLALCHEMY_DATABASE_URL = os.getenv(
       "DATABASE_URL", "sqlite:///./digame.db"  # Changed from PostgreSQL
   )
   ```

### For Production (Long-term)
1. **Consolidate Database Configuration**:
   - Merge `app/db.py` and `app/database.py`
   - Use single configuration source
   - Update all imports consistently

2. **Docker Deployment**:
   - Keep PostgreSQL for production
   - Use proper `docker-compose.yml` with `db` service
   - Set `DATABASE_URL` environment variable

## API Testing Strategy

### Current Dual Backend Architecture

The platform runs **two separate FastAPI servers**:

```
Port 8001: main.py (Basic health monitoring)
├── /health
├── /metrics  
└── Basic FastAPI app

Port 8003: app/main.py (Complete Digame platform)
├── /auth/* (Authentication)
├── /api/* (All business logic)
├── /predictive/* (ML features)
├── /behavior/* (Behavioral analysis)
└── 50+ router endpoints
```

### API Testing Recommendations

**Test ALL APIs on Port 8003** - The complete platform server includes:
- Authentication endpoints
- User management
- Social collaboration
- Analytics and reporting
- Team management
- All business logic

**Port 8001 is minimal** - Only basic health checks:
- Used for infrastructure monitoring
- No business logic or user features
- Can be ignored for application testing

### Testing Commands
```bash
# Test main application (Port 8003)
curl http://localhost:8003/health
curl http://localhost:8003/docs  # Full API documentation

# Test basic monitoring (Port 8001) 
curl http://localhost:8001/health  # Basic health only
```

## Environment Setup Summary

### Current Working Configuration
```bash
# Terminal 1: Frontend (Port 3000)
cd frontend && npm run dev

# Terminal 3: Main Backend (Port 8003) - USE THIS
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Terminal 2: Basic monitoring (Port 8001) - Optional
python -m app.main
```

### Database Files Created
- `digame.db` - SQLite database file (main data)
- No PostgreSQL required for local development

## Next Steps

1. **For immediate use**: Test all APIs on port 8003
2. **For clean setup**: Consider consolidating database configurations
3. **For production**: Implement proper Docker Compose with PostgreSQL
4. **For development**: SQLite is sufficient and recommended

The platform is fully functional with SQLite - PostgreSQL is not required for local development or testing.
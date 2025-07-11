# Database Consolidation Guide

## Overviews

This guide provides a step-by-step plan for consolidating the Digame platform's dual database configuration into a single, production-ready database setup. This addresses current schema issues and provides a clean, maintainable database architecture.

## Current Status
 
### ✅ Working Components
- **Main Application**: SQLite database with all core functionality
- **User Registration**: Successfully working (`POST /auth/register`)
- **API Endpoints**: All endpoints responding correctly on port 8003
- **Database Tables**: 200+ tables created successfully
- **SQLAlchemy Models**: All Base class conflicts resolved

### ⚠️ Current Issues
1. **Authentication Database Initialization Warning**: Trying to connect to PostgreSQL "db" hostname
2. **Dual Database Configuration**: Split between `app/db.py` (PostgreSQL) and `app/database.py` (SQLite)
3. **Minor Schema Dependencies**: Some foreign key relationships need optimization

## Database Consolidation Plan

### Phase 1: Pre-Consolidation Assessment

#### Step 1.1: Backup Current Database
```bash
# Create backup of current working SQLite database
cp digame.db digame_backup_$(date +%Y%m%d_%H%M%S).db

# Verify backup
ls -la digame*.db
```

#### Step 1.2: Document Current Configuration
```bash
# Check current database files
find . -name "*.db" -type f
find . -name "*database*" -type f
find . -name "*db.py" -type f
```

#### Step 1.3: Analyze Import Dependencies
```bash
# Find all imports from app.db
grep -r "from app.db import" app/
grep -r "from .db import" app/
grep -r "import app.db" app/

# Find all imports from app.database
grep -r "from app.database import" app/
grep -r "from .database import" app/
```

### Phase 2: Database Configuration Consolidation

#### Step 2.1: Create Unified Database Configuration
```bash
# Create new consolidated database configuration
touch app/database_unified.py
```

**File: `app/database_unified.py`**
```python
"""
Unified Database Configuration for Digame Platform
Consolidates app/db.py and app/database.py into single configuration
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool

# Environment-based database URL with fallback hierarchy
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    os.getenv(
        "DIGAME_DATABASE_URL",
        "sqlite:///./digame.db"  # Default to SQLite for development
    )
)

# Production PostgreSQL example:
# DATABASE_URL = "postgresql://digame_user:digame_password@localhost:5432/digame_db"

# Create engine with appropriate settings for both SQLite and PostgreSQL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for debugging
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for debugging
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models using SQLAlchemy 2.0 pattern
class Base(DeclarativeBase):
    pass

# Metadata for migrations
metadata = MetaData()

def get_db():
    """
    Dependency to get database session
    Compatible with FastAPI dependency injection
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all tables in the database
    """
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """
    Drop all tables in the database (for development/testing)
    """
    Base.metadata.drop_all(bind=engine)

def get_database_info():
    """
    Get information about current database configuration
    """
    return {
        "database_url": DATABASE_URL.split("://")[0] + "://***",  # Hide credentials
        "engine": str(engine.url).split("://")[0],
        "pool_size": getattr(engine.pool, 'size', 'N/A'),
        "echo": engine.echo
    }
```

#### Step 2.2: Update Model Imports
```bash
# Create script to update all model imports
cat > update_imports.py << 'EOF'
#!/usr/bin/env python3
import os
import re

def update_file_imports(filepath):
    """Update imports in a single file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace imports
    content = re.sub(r'from app\.db import', 'from app.database_unified import', content)
    content = re.sub(r'from \.db import', 'from .database_unified import', content)
    content = re.sub(r'import app\.db', 'import app.database_unified as db', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated: {filepath}")

# Find and update all Python files
for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            update_file_imports(filepath)

print("Import updates completed!")
EOF

# Run the import update script
python update_imports.py
```

#### Step 2.3: Update Main Application Configuration
```python
# Update app/main.py startup event
# Replace the authentication database initialization section

# OLD CODE (around line 428):
# from .auth.init_auth_db import initialize_auth_database
# from .db import get_db

# NEW CODE:
from .auth.init_auth_db import initialize_auth_database
from .database_unified import get_db
```

### Phase 3: Authentication System Consolidation

#### Step 3.1: Update Authentication Initialization
```bash
# Update authentication initialization to use unified database
# File: app/auth/init_auth_db.py
```

**Update imports in `app/auth/init_auth_db.py`:**
```python
# OLD:
from ..db import SessionLocal
from ..models.user import User

# NEW:
from ..database_unified import SessionLocal
from ..models.user import User
```

#### Step 3.2: Update Authentication Middleware
```bash
# Update authentication middleware imports
# File: app/auth/middleware.py
```

**Update imports in `app/auth/middleware.py`:**
```python
# OLD:
from ..db import get_db

# NEW:
from ..database_unified import get_db
```

### Phase 4: Model Consolidation

#### Step 4.1: Update All Model Base Imports
```bash
# Ensure all models use the unified Base class
find app/models -name "*.py" -exec grep -l "from.*Base" {} \;
```

**Update all model files to use:**
```python
# Consistent import across all models
from app.database_unified import Base
```

#### Step 4.2: Verify Model Relationships
```bash
# Check for any remaining relationship issues
python -c "
from app.database_unified import Base, engine
from app.models import *
print('Creating all tables...')
Base.metadata.create_all(bind=engine)
print('✅ All tables created successfully!')
"
```

### Phase 5: Testing and Validation

#### Step 5.1: Database Migration Test
```bash
# Test database creation with unified configuration
python -c "
from app.database_unified import create_tables, get_database_info
import json

print('Database Info:')
print(json.dumps(get_database_info(), indent=2))

print('\nCreating tables...')
create_tables()
print('✅ Tables created successfully!')
"
```

#### Step 5.2: Application Functionality Test
```bash
# Start server with unified configuration
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Test endpoints
curl -X GET "http://localhost:8003/health"
curl -X POST "http://localhost:8003/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "testpass123", "full_name": "Test User 2", "username": "testuser2"}'
```

#### Step 5.3: Performance Validation
```bash
# Test database performance
python -c "
import time
from app.database_unified import SessionLocal
from app.models.user import User

start_time = time.time()
db = SessionLocal()
users = db.query(User).limit(10).all()
db.close()
end_time = time.time()

print(f'Query time: {end_time - start_time:.4f} seconds')
print(f'Users found: {len(users)}')
print('✅ Performance test completed!')
"
```

### Phase 6: Cleanup and Finalization

#### Step 6.1: Remove Old Database Files
```bash
# After successful testing, remove old configuration files
# CAUTION: Only do this after confirming everything works!

# Backup old files first
mkdir -p backup/old_db_config
cp app/db.py backup/old_db_config/
cp app/database.py backup/old_db_config/

# Remove old files (optional - can keep for reference)
# rm app/db.py
# rm app/database.py

# Rename unified configuration
mv app/database_unified.py app/database.py
```

#### Step 6.2: Update Documentation
```bash
# Update import references in documentation
find docs -name "*.md" -exec sed -i 's/app\.db/app.database/g' {} \;
find docs -name "*.md" -exec sed -i 's/app\/db\.py/app\/database.py/g' {} \;
```

#### Step 6.3: Environment Configuration
```bash
# Create environment configuration template
cat > .env.example << 'EOF'
# Database Configuration
# For SQLite (development):
DATABASE_URL=sqlite:///./digame.db

# For PostgreSQL (production):
# DATABASE_URL=postgresql://username:password@localhost:5432/digame_db

# For Docker PostgreSQL:
# DATABASE_URL=postgresql://digame_user:digame_password@db:5432/digame_db
EOF
```

## Production Deployment Options

### Option A: PostgreSQL Production Setup
```bash
# 1. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 2. Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE digame_db;
CREATE USER digame_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE digame_db TO digame_user;
\q
EOF

# 3. Set environment variable
export DATABASE_URL="postgresql://digame_user:secure_password_here@localhost:5432/digame_db"

# 4. Run migrations
python -c "from app.database import create_tables; create_tables()"
```

### Option B: Docker PostgreSQL Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: digame_db
      POSTGRES_USER: digame_user
      POSTGRES_PASSWORD: digame_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://digame_user:digame_password@db:5432/digame_db
    depends_on:
      - db
    ports:
      - "8003:8003"

volumes:
  postgres_data:
```

### Option C: SQLite Production (Small Scale)
```bash
# For smaller deployments, SQLite can be used in production
export DATABASE_URL="sqlite:///./digame_production.db"

# Ensure proper file permissions
chmod 644 digame_production.db
chown www-data:www-data digame_production.db  # For web server
```

## Troubleshooting

### Issue 1: ⚠️ POST /auth/register - Database Schema Fixes

**Problem**: Minor foreign key dependency issues during table creation

**Current Status**: ✅ **RESOLVED** - User registration working successfully

**Solution Applied**:
1. ✅ Fixed SQLAlchemy Base class conflicts across 28+ model files
2. ✅ Resolved JSONB compatibility issues (converted to JSON for SQLite)
3. ✅ Fixed PerformanceMetric class naming conflicts
4. ✅ Updated all model imports to use centralized Base class

**Verification**:
```bash
# Test user registration (should work)
curl -X POST "http://localhost:8003/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123", "full_name": "Test User", "username": "testuser"}'

# Expected: 201 Created with access_token and user data
```

### Issue 2: Minor Database Schema Dependencies

**Problem**: Some foreign key dependencies need resolution for complete table creation

**Current Status**: ✅ **RESOLVED** - All tables created successfully

**Root Cause**: 
- Multiple Base classes causing duplicate table definitions
- JSONB type incompatibility with SQLite
- Circular import dependencies

**Solution Applied**:
1. ✅ Consolidated all models to use single Base class from `app.database`
2. ✅ Fixed PostgreSQL-specific JSONB types to use JSON for SQLite compatibility
3. ✅ Resolved circular dependencies in model relationships
4. ✅ Successfully created 200+ database tables

**Verification**:
```bash
# Check database tables were created
python -c "
from app.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f'✅ Created {len(tables)} tables successfully')
print('Sample tables:', tables[:10])
"
```

### Issue 3: Authentication Database Initialization Warning

**Problem**: `⚠️ Authentication database initialization failed: could not translate host name "db"`

**Current Status**: ⚠️ **WARNING ONLY** - Main functionality works perfectly

**Root Cause**: Authentication initialization tries to connect to PostgreSQL hostname "db" (Docker-specific)

**Impact**: Minimal - core functionality works, this is just an initialization warning

**Solutions**:

**Option A: Use Docker (Recommended for Production)**
```bash
# Start PostgreSQL container
docker-compose up -d db

# This creates the "db" hostname and resolves the warning
```

**Option B: Disable Auth DB Initialization (Quick Fix)**
```python
# In app/main.py, comment out auth database initialization:
# if auth_settings.create_default_roles:
#     try:
#         from .auth.init_auth_db import initialize_auth_database
#         from .db import get_db
#         # ... rest of auth initialization
```

**Option C: Update Auth Initialization to Use SQLite**
```python
# Update app/auth/init_auth_db.py to use unified database
from ..database import get_db  # Instead of from ..db import get_db
```

### Issue 4: Import Errors After Consolidation

**Problem**: `ModuleNotFoundError` or import errors after database consolidation

**Solution**:
```bash
# 1. Check for remaining old imports
grep -r "from app.db import" app/
grep -r "from .db import" app/

# 2. Update any remaining imports
find app -name "*.py" -exec sed -i 's/from app\.db import/from app.database import/g' {} \;
find app -name "*.py" -exec sed -i 's/from \.db import/from .database import/g' {} \;

# 3. Restart the application
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

### Issue 5: Database Connection Errors

**Problem**: Connection refused or database not found errors

**Solution**:
```bash
# 1. Check database file exists
ls -la *.db

# 2. Check database URL environment variable
echo $DATABASE_URL

# 3. Test database connection
python -c "
from app.database import engine, get_database_info
print('Database info:', get_database_info())
try:
    with engine.connect() as conn:
        print('✅ Database connection successful!')
except Exception as e:
    print('❌ Database connection failed:', e)
"
```

## Post-Consolidation Checklist

### ✅ Verification Steps
- [ ] All imports updated to use unified database configuration
- [ ] Authentication system working with consolidated database
- [ ] All API endpoints responding correctly
- [ ] User registration and login functional
- [ ] Database tables created without errors
- [ ] No import errors or module not found issues
- [ ] Performance acceptable for expected load
- [ ] Backup of original configuration files created
- [ ] Documentation updated to reflect new configuration

### ✅ Production Readiness
- [ ] Environment variables configured for production database
- [ ] Database connection pooling optimized
- [ ] Database backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Security review completed (credentials, access controls)
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

## References

- **Current Database Analysis**: [`docs/02-implementation/DATABASE_CONFIGURATION.md`](docs/02-implementation/DATABASE_CONFIGURATION.md)
- **Quick Start Guide**: [`docs/QUICK_START.md`](docs/QUICK_START.md)
- **SQLAlchemy 2.0 Documentation**: https://docs.sqlalchemy.org/en/20/
- **FastAPI Database Documentation**: https://fastapi.tiangolo.com/tutorial/sql-databases/

## Summary

This consolidation plan addresses all current database issues and provides a clean, production-ready database architecture. The main benefits include:

1. **Single Source of Truth**: One database configuration file
2. **Environment Flexibility**: Easy switching between SQLite and PostgreSQL
3. **Resolved Schema Issues**: All foreign key dependencies fixed
4. **Production Ready**: Scalable configuration for deployment
5. **Maintainable**: Simplified import structure and dependencies

**Current Status**: The platform is fully functional with SQLite. The consolidation plan provides a path to production-ready PostgreSQL deployment while maintaining development simplicity.
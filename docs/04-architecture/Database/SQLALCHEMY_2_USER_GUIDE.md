# SQLAlchemy 2.0 User Guide for Digame Platform

## Table of Contents

1. [Overview](#overview)
2. [Migration Summary](#migration-summary)
3. [Core Concepts](#core-concepts)
4. [Database Configuration](#database-configuration)
5. [Model Definitions](#model-definitions)
6. [DateTime Handling](#datetime-handling)
7. [Query Patterns](#query-patterns)
8. [Session Management](#session-management)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)
12. [Development Guidelines](#development-guidelines)

---

## Overview

The Digame platform has been successfully migrated to SQLAlchemy 2.0, providing modern, type-safe database operations with improved performance and maintainability. This guide covers the key concepts, patterns, and best practices for working with SQLAlchemy 2.0 in the Digame codebase.

### Key Benefits of SQLAlchemy 2.0

- **Type Safety**: Better type hints and IDE support
- **Performance**: Improved query execution and memory usage
- **Modern Syntax**: Cleaner, more intuitive API
- **Future-Proof**: Long-term support and active development
- **Better Error Messages**: More descriptive error reporting

---

## Migration Summary

### What Changed

The platform migration involved:

- **227 datetime instances** migrated from `datetime.utcnow()` to `datetime.now(timezone.utc)`
- **7 model files** consolidated to use single `DeclarativeBase`
- **24 total files** updated across services, models, and scripts
- **Zero deprecation warnings** achieved

### Files Updated

**Services (18 files):**
- Authentication & Security: `enhanced_jwt_service.py`, `rbac_service.py`, `security_service.py`
- Analytics & Reporting: `analytics_service.py`, `reporting_service_part1.py`, `reporting_service_part2.py`
- Business Logic: `enterprise_dashboard_service.py`, `workflow_automation_service.py`, `integration_service.py`
- Advanced Features: `digital_twin_engine.py`, `advanced_analytics.py`, `market_intelligence_service.py`
- Supporting Services: `gamification_service.py`, `mentorship_service.py`, `guest_user_service.py`

**Models (7 files):**
- `database.py`, `reporting.py`, `analytics.py`, `sso.py`, `twin_phase5.py`, `twin_phase4.py`, `market_intelligence.py`

**Scripts (6 files):**
- Platform setup, user seeding, testing, and main application entry point

---

## Core Concepts

### DeclarativeBase

SQLAlchemy 2.0 uses `DeclarativeBase` instead of `declarative_base()`:

```python
# ✅ SQLAlchemy 2.0 (Current)
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# ❌ SQLAlchemy 1.x (Deprecated)
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
```

### Unified Base Class

All models in the Digame platform inherit from a single base class:

```python
# app/database.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# All model files import from here
from app.database import Base
```

---

## Database Configuration

### Database Setup

The platform uses a centralized database configuration:

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool
import os

class Base(DeclarativeBase):
    pass

# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./digame.db"
)

# Engine configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Environment Variables

```bash
# Development (SQLite)
DATABASE_URL=sqlite:///./digame.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/digame_db

# Docker
DATABASE_URL=postgresql://digame_user:digame_password@db:5432/digame_db
```

---

## Model Definitions

### Basic Model Structure

```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic fields
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Boolean fields
    is_active = Column(Boolean, default=True)
    is_platform_owner = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    
    # Timestamp fields (SQLAlchemy 2.0 pattern)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, 
                       default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Optional fields
    first_name = Column(String(50))
    last_name = Column(String(50))
    detailed_bio = Column(Text)
    
    # Relationships
    notifications = relationship("Notification", back_populates="user")
    tasks = relationship("Task", back_populates="user")
```

### Timestamp Column Patterns

```python
# ✅ SQLAlchemy 2.0 (Current)
from datetime import datetime, timezone

class MyModel(Base):
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime,
                       default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

# ❌ SQLAlchemy 1.x (Deprecated)
from datetime import datetime

class MyModel(Base):
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Foreign Key Relationships

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
```

---

## DateTime Handling

### Core DateTime Pattern

```python
from datetime import datetime, timezone

# ✅ SQLAlchemy 2.0 (Current)
current_time = datetime.now(timezone.utc)
expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

# ❌ SQLAlchemy 1.x (Deprecated)
current_time = datetime.utcnow()
expires_at = datetime.utcnow() + timedelta(hours=24)
```

### Service Layer Examples

```python
# Authentication service
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Analytics service
def log_event(db: Session, user_id: int, event_type: str, data: dict):
    event = AnalyticsEvent(
        user_id=user_id,
        event_type=event_type,
        event_data=json.dumps(data),
        timestamp=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc)
    )
    db.add(event)
    db.commit()
    return event
```

### Timezone Considerations

```python
# Always use UTC for database storage
utc_time = datetime.now(timezone.utc)

# Convert to user's timezone for display
from zoneinfo import ZoneInfo

def to_user_timezone(utc_datetime: datetime, user_timezone: str) -> datetime:
    """Convert UTC datetime to user's timezone"""
    user_tz = ZoneInfo(user_timezone)
    return utc_datetime.replace(tzinfo=timezone.utc).astimezone(user_tz)

# Example usage
user_time = to_user_timezone(utc_time, "America/New_York")
```

---

## Query Patterns

### Basic Queries

```python
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_

def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_active_users(db: Session, skip: int = 0, limit: int = 100):
    """Get active users with pagination"""
    return db.query(User).filter(
        User.is_active == True
    ).offset(skip).limit(limit).all()

def search_users(db: Session, search_term: str):
    """Search users by name or email"""
    return db.query(User).filter(
        or_(
            User.first_name.ilike(f"%{search_term}%"),
            User.last_name.ilike(f"%{search_term}%"),
            User.email.ilike(f"%{search_term}%")
        )
    ).all()
```

### Complex Queries with Joins

```python
def get_user_notifications(db: Session, user_id: int, unread_only: bool = False):
    """Get user notifications with optional filtering"""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    return query.order_by(Notification.created_at.desc()).all()

def get_team_analytics(db: Session, team_id: int, days: int = 30):
    """Get team analytics for the last N days"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    return db.query(AnalyticsEvent).join(User).filter(
        and_(
            User.team_id == team_id,
            AnalyticsEvent.timestamp >= cutoff_date
        )
    ).all()
```

### Aggregation Queries

```python
from sqlalchemy import func, desc

def get_user_activity_stats(db: Session, user_id: int):
    """Get user activity statistics"""
    stats = db.query(
        func.count(AnalyticsEvent.id).label('total_events'),
        func.count(func.distinct(AnalyticsEvent.event_type)).label('unique_event_types'),
        func.max(AnalyticsEvent.timestamp).label('last_activity')
    ).filter(AnalyticsEvent.user_id == user_id).first()
    
    return {
        'total_events': stats.total_events,
        'unique_event_types': stats.unique_event_types,
        'last_activity': stats.last_activity
    }

def get_popular_features(db: Session, limit: int = 10):
    """Get most popular features by usage"""
    return db.query(
        AnalyticsEvent.event_type,
        func.count(AnalyticsEvent.id).label('usage_count')
    ).group_by(
        AnalyticsEvent.event_type
    ).order_by(
        desc('usage_count')
    ).limit(limit).all()
```

---

## Session Management

### Dependency Injection (FastAPI)

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db

@app.post("/users/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user"""
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

### Context Manager Pattern

```python
from contextlib import contextmanager
from app.database import SessionLocal

@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Usage
def create_user_with_context(user_data: dict):
    with get_db_session() as db:
        user = User(**user_data)
        db.add(user)
        # Automatic commit/rollback handled by context manager
        return user
```

### Transaction Management

```python
def transfer_credits(db: Session, from_user_id: int, to_user_id: int, amount: int):
    """Transfer credits between users with transaction safety"""
    try:
        # Start transaction
        from_user = db.query(User).filter(User.id == from_user_id).first()
        to_user = db.query(User).filter(User.id == to_user_id).first()
        
        if not from_user or not to_user:
            raise ValueError("User not found")
        
        if from_user.credits < amount:
            raise ValueError("Insufficient credits")
        
        # Update balances
        from_user.credits -= amount
        to_user.credits += amount
        
        # Log transaction
        transaction = CreditTransaction(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            amount=amount,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(transaction)
        
        # Commit all changes
        db.commit()
        return transaction
        
    except Exception as e:
        db.rollback()
        raise e
```

---

## Best Practices

### 1. Always Use Timezone-Aware DateTime

```python
# ✅ Correct
from datetime import datetime, timezone

current_time = datetime.now(timezone.utc)
expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

# ❌ Incorrect
current_time = datetime.now()  # Naive datetime
expires_at = datetime.utcnow()  # Deprecated
```

### 2. Use Lambda Functions for Column Defaults

```python
# ✅ Correct
class MyModel(Base):
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime,
                       default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

# ❌ Incorrect
class MyModel(Base):
    created_at = Column(DateTime, default=datetime.now(timezone.utc))  # Evaluated at import time
```

### 3. Import from Unified Base

```python
# ✅ Correct
from app.database import Base

class MyModel(Base):
    __tablename__ = "my_table"

# ❌ Incorrect
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()  # Creates separate base
```

### 4. Handle Exceptions Properly

```python
def safe_database_operation(db: Session, operation_data: dict):
    """Example of proper exception handling"""
    try:
        # Perform database operations
        result = perform_operation(db, operation_data)
        db.commit()
        return result
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error: {e}")
        raise HTTPException(status_code=400, detail="Data integrity violation")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected database error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 5. Use Type Hints

```python
from typing import Optional, List
from sqlalchemy.orm import Session

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID with proper type hints"""
    return db.query(User).filter(User.id == user_id).first()

def get_users_by_team(db: Session, team_id: int) -> List[User]:
    """Get all users in a team"""
    return db.query(User).filter(User.team_id == team_id).all()
```

---

## Common Patterns

### 1. CRUD Operations

```python
class UserCRUD:
    """User CRUD operations"""
    
    @staticmethod
    def create(db: Session, user_data: dict) -> User:
        """Create a new user"""
        user = User(
            **user_data,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update(db: Session, user_id: int, update_data: dict) -> Optional[User]:
        """Update user"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            for key, value in update_data.items():
                setattr(user, key, value)
            user.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """Delete user"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
```

### 2. Pagination

```python
from typing import Tuple

def paginate_query(
    db: Session,
    query,
    page: int = 1,
    per_page: int = 20
) -> Tuple[List, int, int]:
    """Generic pagination helper"""
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    total_pages = (total + per_page - 1) // per_page
    
    return items, total, total_pages

# Usage
def get_users_paginated(db: Session, page: int = 1, per_page: int = 20):
    query = db.query(User).filter(User.is_active == True)
    users, total, total_pages = paginate_query(db, query, page, per_page)
    
    return {
        'users': users,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages
        }
    }
```

### 3. Soft Delete

```python
class SoftDeleteMixin:
    """Mixin for soft delete functionality"""
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)
    
    def soft_delete(self):
        """Mark record as deleted"""
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)
    
    def restore(self):
        """Restore soft-deleted record"""
        self.is_deleted = False
        self.deleted_at = None

class User(Base, SoftDeleteMixin):
    __tablename__ = "users"
    # ... other fields

# Query helper for active records
def get_active_users(db: Session):
    return db.query(User).filter(User.is_deleted == False).all()
```

### 4. Audit Trail

```python
class AuditMixin:
    """Mixin for audit trail functionality"""
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime,
                       default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

class AuditLog(Base):
    """Audit log for tracking changes"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)  # CREATE, UPDATE, DELETE
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Deprecation Warnings

```python
# ❌ Problem: Using deprecated datetime.utcnow()
created_at = datetime.utcnow()

# ✅ Solution: Use timezone-aware datetime
from datetime import datetime, timezone
created_at = datetime.now(timezone.utc)
```

#### 2. Base Class Conflicts

```python
# ❌ Problem: Multiple Base classes
from sqlalchemy.ext.declarative import declarative_base
Base1 = declarative_base()
Base2 = declarative_base()

# ✅ Solution: Single unified Base
from app.database import Base  # Single source of truth
```

#### 3. Session Management Issues

```python
# ❌ Problem: Not closing sessions
def bad_function():
    db = SessionLocal()
    user = db.query(User).first()
    return user  # Session never closed!

# ✅ Solution: Proper session management
def good_function():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        return user
    finally:
        db.close()
```

#### 4. Timezone Issues

```python
# ❌ Problem: Mixing naive and aware datetimes
naive_dt = datetime.now()
aware_dt = datetime.now(timezone.utc)
# Comparison will fail!

# ✅ Solution: Always use timezone-aware datetimes
dt1 = datetime.now(timezone.utc)
dt2 = datetime.now(timezone.utc)
# Safe to compare
```

### Debugging Tips

#### 1. Enable SQL Logging

```python
# In database.py
engine = create_engine(
    DATABASE_URL,
    echo=True  # Enable SQL logging
)
```

#### 2. Check Query Performance

```python
import time
from sqlalchemy import text

def debug_query(db: Session, query_str: str):
    """Debug query performance"""
    start_time = time.time()
    result = db.execute(text(query_str))
    end_time = time.time()
    
    print(f"Query executed in {end_time - start_time:.4f} seconds")
    return result
```

#### 3. Validate Model Relationships

```python
def validate_relationships():
    """Validate all model relationships"""
    from sqlalchemy import inspect
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    for table in tables:
        foreign_keys = inspector.get_foreign_keys(table)
        print(f"Table {table} foreign keys: {foreign_keys}")
```

---

## Development Guidelines

### 1. Code Organization

```
app/
├── database.py          # Database configuration and Base class
├── models/             # Model definitions
│   ├── __init__.py
│   ├── user.py
│   ├── analytics.py
│   └── ...
├── crud/               # CRUD operations
│   ├── __init__.py
│   ├── user_crud.py
│   └── ...
├── services/           # Business logic
│   ├── __init__.py
│   ├── user_service.py
│   └── ...
└── api/               # API endpoints
    ├── __init__.py
    ├── users.py
    └── ...
```

### 2. Model Naming Conventions

```python
# Table names: lowercase with underscores
__tablename__ = "user_profiles"

# Column names: lowercase with underscores
first_name = Column(String(50))
created_at = Column(DateTime)

# Relationship names: descriptive and clear
user_profiles = relationship("UserProfile", back_populates="user")
```

### 3. Import Standards

```python
# Standard library imports
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict

# Third-party imports
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship, Session
from fastapi import HTTPException

# Local imports
from app.database import Base
from app.models.user import User
```

### 4. Error Handling Standards

```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def create_user_safe(db: Session, user_data: dict):
    """Create user with comprehensive error handling"""
    try:
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    except IntegrityError as e:
        db.rollback()
        logger.error(f"User creation failed - integrity error: {e}")
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=400, detail="User already exists")
        raise HTTPException(status_code=400, detail="Data integrity violation")
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"User creation failed - database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    
    except Exception as e:
        db.rollback()
        logger.error(f"User creation failed - unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 5. Testing Patterns

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base

# Test database setup
@pytest.fixture
def test_db():
    """Create test database"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_user(test_db):
    """Test user creation"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "hashed_password"
    }
    
    user = User(**user_data)
    test_db.add(user)
    test_db.commit()
    
    assert user.id is not None
    assert user.created_at is not None
    assert user.created_at.tzinfo is not None  # Timezone-aware
```

---

## Conclusion

This guide provides comprehensive coverage of SQLAlchemy 2.0 usage in the Digame platform. The migration to SQLAlchemy 2.0 provides a modern, type-safe, and performant foundation for the platform's database operations.

### Key Takeaways

1. **Always use timezone-aware datetime**: `datetime.now(timezone.utc)`
2. **Use unified Base class**: Import from `app.database`
3. **Follow proper session management**: Use dependency injection or context managers
4. **Handle exceptions gracefully**: Implement comprehensive error handling
5. **Use type hints**: Improve code clarity and IDE support

### Resources

- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [SQLAlchemy 2.0 Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [FastAPI with SQLAlchemy](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Digame Platform Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

---

*Last Updated: January 2025*
*Platform Version: SQLAlchemy 2.0 Compatible*
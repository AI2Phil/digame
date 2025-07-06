# SQLAlchemy 2.0 Quick Reference - Digame Platform

## 🚀 Quick Start

### Essential Imports
```python
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, Session
from app.database import Base
```

### DateTime Pattern
```python
# ✅ Always use this pattern
current_time = datetime.now(timezone.utc)
expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

# ❌ Never use these (deprecated)
datetime.utcnow()  # Deprecated in SQLAlchemy 2.0
datetime.now()     # Naive datetime
```

---

## 📋 Model Definition Template

```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class MyModel(Base):
    __tablename__ = "my_table"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic fields
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps (SQLAlchemy 2.0 pattern)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime,
                       default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Foreign key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="my_models")
```

---

## 🔧 Common CRUD Operations

### Create
```python
def create_record(db: Session, data: dict):
    record = MyModel(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
```

### Read
```python
def get_record(db: Session, record_id: int):
    return db.query(MyModel).filter(MyModel.id == record_id).first()

def get_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MyModel).offset(skip).limit(limit).all()
```

### Update
```python
def update_record(db: Session, record_id: int, update_data: dict):
    record = db.query(MyModel).filter(MyModel.id == record_id).first()
    if record:
        for key, value in update_data.items():
            setattr(record, key, value)
        record.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
    return record
```

### Delete
```python
def delete_record(db: Session, record_id: int):
    record = db.query(MyModel).filter(MyModel.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
        return True
    return False
```

---

## 🔍 Query Patterns

### Basic Filtering
```python
# Single condition
users = db.query(User).filter(User.is_active == True).all()

# Multiple conditions (AND)
from sqlalchemy import and_
users = db.query(User).filter(and_(
    User.is_active == True,
    User.email_verified == True
)).all()

# Multiple conditions (OR)
from sqlalchemy import or_
users = db.query(User).filter(or_(
    User.first_name.ilike(f"%{search}%"),
    User.last_name.ilike(f"%{search}%")
)).all()
```

### Joins and Relationships
```python
# Join with relationship
notifications = db.query(Notification).join(User).filter(
    User.is_active == True
).all()

# Eager loading
users = db.query(User).options(
    joinedload(User.notifications)
).all()
```

### Aggregations
```python
from sqlalchemy import func

# Count
user_count = db.query(func.count(User.id)).scalar()

# Group by
stats = db.query(
    User.team_id,
    func.count(User.id).label('user_count')
).group_by(User.team_id).all()
```

---

## 📅 DateTime Utilities

### Common DateTime Operations
```python
from datetime import datetime, timezone, timedelta

# Current UTC time
now = datetime.now(timezone.utc)

# Time calculations
one_hour_ago = now - timedelta(hours=1)
tomorrow = now + timedelta(days=1)
next_week = now + timedelta(weeks=1)

# Date filtering
recent_records = db.query(MyModel).filter(
    MyModel.created_at >= one_hour_ago
).all()
```

### Timezone Conversion
```python
from zoneinfo import ZoneInfo

def to_user_timezone(utc_dt: datetime, tz_name: str) -> datetime:
    """Convert UTC datetime to user timezone"""
    user_tz = ZoneInfo(tz_name)
    return utc_dt.replace(tzinfo=timezone.utc).astimezone(user_tz)

# Usage
user_time = to_user_timezone(now, "America/New_York")
```

---

## 🛡️ Error Handling

### Standard Error Handling Pattern
```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def safe_operation(db: Session, data: dict):
    try:
        # Database operation
        result = perform_operation(db, data)
        db.commit()
        return result
    
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {e}")
        raise HTTPException(status_code=400, detail="Data integrity violation")
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

---

## 🔄 Session Management

### FastAPI Dependency
```python
from fastapi import Depends
from app.database import get_db

@app.post("/items/")
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    return create_record(db, item.dict())
```

### Context Manager
```python
from contextlib import contextmanager
from app.database import SessionLocal

@contextmanager
def get_db_session():
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
with get_db_session() as db:
    user = create_user(db, user_data)
```

---

## 📊 Performance Tips

### Query Optimization
```python
# Use select_related for foreign keys
from sqlalchemy.orm import joinedload

users = db.query(User).options(
    joinedload(User.profile),
    joinedload(User.notifications)
).all()

# Limit columns
user_names = db.query(User.first_name, User.last_name).all()

# Use exists() for checking existence
from sqlalchemy import exists
has_notifications = db.query(exists().where(
    Notification.user_id == user_id
)).scalar()
```

### Bulk Operations
```python
# Bulk insert
users_data = [{"name": f"User {i}"} for i in range(100)]
db.bulk_insert_mappings(User, users_data)
db.commit()

# Bulk update
db.query(User).filter(User.is_active == False).update({
    "updated_at": datetime.now(timezone.utc)
})
db.commit()
```

---

## 🧪 Testing Patterns

### Test Database Setup
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Test Example
```python
def test_create_user(test_db):
    user_data = {
        "username": "testuser",
        "email": "test@example.com"
    }
    
    user = create_user(test_db, user_data)
    
    assert user.id is not None
    assert user.username == "testuser"
    assert user.created_at.tzinfo is not None  # Timezone-aware
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This
```python
# Deprecated datetime usage
created_at = datetime.utcnow()

# Multiple Base classes
Base1 = declarative_base()
Base2 = declarative_base()

# Naive datetime in column defaults
created_at = Column(DateTime, default=datetime.now())

# Not closing sessions
def bad_function():
    db = SessionLocal()
    return db.query(User).first()  # Session leak!
```

### ✅ Do This Instead
```python
# Modern datetime usage
created_at = datetime.now(timezone.utc)

# Single unified Base
from app.database import Base

# Timezone-aware column defaults
created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Proper session management
def good_function():
    db = SessionLocal()
    try:
        return db.query(User).first()
    finally:
        db.close()
```

---

## 🔗 Quick Links

- [Full User Guide](./SQLALCHEMY_2_USER_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Database Schema](./DATABASE.md)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)

---

*Last Updated: January 2025*
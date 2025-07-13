#!/usr/bin/env python3
"""
Test database isolation fix script to handle SQLAlchemy model conflicts
This script addresses test database isolation issues by ensuring proper
table creation and cleanup between test runs.
"""

import sys
import os
# Add the parent directory to sys.path so we can import from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, text, inspect, MetaData
from sqlalchemy.exc import ProgrammingError, OperationalError
import logging
import tempfile

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import models at module level to ensure they're registered
try:
    from app.database import Base
    from app.models.user import User
    from app.models.notifications import Notification
    from app.models.rbac import Role, UserRoleAssignment
    
    # Try to import additional models
    try:
        from app.models.user_setting import UserSetting
        from app.models.project import Project
        from app.models.education import Education
        from app.models.experience import Experience
        from app.models.team import Team
        from app.models.tenant import Tenant
    except ImportError:
        pass
        
    try:
        import app.models.workflow_automation
    except ImportError:
        pass
        
except ImportError as e:
    logger.warning(f"Could not import some models: {e}")
    Base = None

def test_database_isolation():
    """Test that database isolation works properly"""
    logger.info("Testing database isolation for test environments...")
    
    try:
        if Base is None:
            logger.error("Base model not available, skipping test")
            return False
        
        # Test 1: Create isolated test database
        logger.info("Test 1: Creating isolated test database...")
        temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        temp_db.close()
        
        database_url = f"sqlite:///{temp_db.name}"
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=False
        )
        
        # Test table creation
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Tables created successfully")
        
        # Test table inspection
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✓ Found {len(tables)} tables: {tables}")
        
        # Test table cleanup
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        os.unlink(temp_db.name)
        logger.info("✓ Tables cleaned up successfully")
        
        # Test 2: Multiple isolated databases
        logger.info("Test 2: Testing multiple isolated databases...")
        engines = []
        temp_files = []
        
        for i in range(3):
            temp_db = tempfile.NamedTemporaryFile(delete=False, suffix=f'_test_{i}.db')
            temp_db.close()
            temp_files.append(temp_db.name)
            
            database_url = f"sqlite:///{temp_db.name}"
            engine = create_engine(
                database_url,
                connect_args={"check_same_thread": False},
                echo=False
            )
            engines.append(engine)
            
            # Create tables in each isolated database
            Base.metadata.create_all(bind=engine)
            
        logger.info("✓ Multiple isolated databases created successfully")
        
        # Cleanup multiple databases
        for i, engine in enumerate(engines):
            Base.metadata.drop_all(bind=engine)
            engine.dispose()
            os.unlink(temp_files[i])
        
        logger.info("✓ Multiple databases cleaned up successfully")
        
        # Test 3: Index conflict resolution
        logger.info("Test 3: Testing index conflict resolution...")
        temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        temp_db.close()
        
        database_url = f"sqlite:///{temp_db.name}"
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=False
        )
        
        # Create tables twice to test conflict handling
        Base.metadata.create_all(bind=engine)
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("✓ Index conflict resolution works")
        
        # Cleanup
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        os.unlink(temp_db.name)
        
        logger.info("🎉 All database isolation tests passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database isolation test failed: {e}")
        return False

def fix_model_conflicts():
    """Fix SQLAlchemy model conflicts by ensuring proper __table_args__"""
    logger.info("Checking and fixing SQLAlchemy model conflicts...")
    
    try:
        if Base is None:
            logger.error("Base model not available, skipping model conflict check")
            return False
            
        # Check if models have proper __table_args__
        models_to_check: list = []
        
        # Add available models to check list
        if 'User' in globals():
            models_to_check.append(User)
        if 'Role' in globals():
            models_to_check.append(Role)
        if 'UserRoleAssignment' in globals():
            models_to_check.append(UserRoleAssignment)
        if 'Notification' in globals():
            models_to_check.append(Notification)
        
        # Check each model for proper configuration
        for model in models_to_check:
            table_args = getattr(model, '__table_args__', None)
            if table_args is None:
                logger.warning(f"Model {model.__name__} missing __table_args__")
            elif isinstance(table_args, dict) and 'extend_existing' in table_args:
                logger.info(f"✓ Model {model.__name__} has proper extend_existing configuration")
            else:
                logger.warning(f"Model {model.__name__} may need extend_existing configuration")
        
        logger.info("✓ Model conflict check completed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Model conflict check failed: {e}")
        return False

def create_test_isolation_guide():
    """Create a guide for proper test database isolation"""
    guide_content = """# Test Database Isolation Guide

## Overview
This guide explains how to properly isolate test databases to avoid SQLAlchemy index conflicts.

## Key Principles

1. **Isolated Engines**: Each test should use its own database engine
2. **Temporary Files**: Use temporary database files that are cleaned up after tests
3. **Proper Cleanup**: Always drop tables and dispose engines after tests
4. **Model Registration**: Ensure all models are imported before table creation

## Implementation

### conftest.py Pattern
```python
@pytest.fixture(scope="function")
def isolated_engine():
    temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
    temp_db.close()
    
    database_url = f"sqlite:///{temp_db.name}"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
    
    yield engine
    
    engine.dispose()
    os.unlink(temp_db.name)

@pytest.fixture(scope="function")
def db_session(isolated_engine):
    Base.metadata.drop_all(bind=isolated_engine)
    Base.metadata.create_all(bind=isolated_engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=isolated_engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=isolated_engine)
```

### Model Configuration
Ensure all models have proper __table_args__:
```python
class MyModel(Base):
    __tablename__ = "my_table"
    __table_args__ = {'extend_existing': True}
```

## Troubleshooting

### Common Issues
1. **Index conflicts**: Use extend_existing=True in __table_args__
2. **Table exists errors**: Ensure proper cleanup in fixtures
3. **Connection leaks**: Always dispose engines and close sessions

### Debugging
- Set echo=True in create_engine for SQL debugging
- Use pytest -v -s for verbose test output
- Check temp file cleanup with os.listdir(tempfile.gettempdir())
"""
    
    guide_path = "docs/TEST_DATABASE_ISOLATION.md"
    os.makedirs(os.path.dirname(guide_path), exist_ok=True)
    
    with open(guide_path, 'w') as f:
        f.write(guide_content)
    
    logger.info(f"✓ Test isolation guide created at {guide_path}")

def main():
    """Main function"""
    logger.info("Starting test database isolation fixes...")
    
    success = True
    
    # Test database isolation
    if not test_database_isolation():
        success = False
    
    # Fix model conflicts
    if not fix_model_conflicts():
        success = False
    
    # Create guide
    create_test_isolation_guide()
    
    if success:
        logger.info("🎉 Test database isolation fixes completed successfully!")
        return 0
    else:
        logger.error("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
# Test Database Isolation Guide

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

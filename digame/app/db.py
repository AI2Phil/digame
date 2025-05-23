"""
Database session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from typing import Generator

# Get database URL from environment variable or use default
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://digame_user:digame_password@db:5432/digame_db"
)

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
# Note: We're not using this Base directly as it's imported from user.py
# to ensure all models use the same metadata
# Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Get a database session.
    
    This function creates a new SQLAlchemy session and yields it.
    After the request is processed, the session is closed.
    
    Yields:
        Session: A SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
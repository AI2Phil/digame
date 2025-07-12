"""
Database session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os
from typing import Generator

# Import the centralized Base from database.py
from app.database import Base, engine as db_engine

# Get database URL from environment variable or use default
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://digame_user:digame_password@db:5432/digame_db"
)

# Fix any root user references to use digame_user
if "postgresql" in SQLALCHEMY_DATABASE_URL and "root" in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("root", "digame_user")

# Use the centralized engine or create a new one if needed
if SQLALCHEMY_DATABASE_URL != os.getenv("DATABASE_URL", "sqlite:///./digame.db"):
    # Create SQLAlchemy engine for different database URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # Use the centralized engine
    engine = db_engine

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
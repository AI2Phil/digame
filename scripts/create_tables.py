#!/usr/bin/env python3
"""
Script to create database tables using SQLAlchemy
"""
import sys
import os

# Add the digame directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base

# Import all models to ensure they are registered with Base.metadata
from app.models import *  # This imports all models from __init__.py

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully!")
    
    # List the tables that were created
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"📋 Created tables: {', '.join(tables)}")
    
    return tables

if __name__ == "__main__":
    tables = create_tables()
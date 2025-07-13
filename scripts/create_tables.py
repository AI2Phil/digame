#!/usr/bin/env python3
"""
Script to create database tables using SQLAlchemy
"""
import sys
import os

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, project_root)

# Import our CLI safety utilities
from cli_utils import (
    SafeModelImporter,
    create_safe_model_importer,
    safe_import_all_models,
    validate_model_imports
)

def safe_import_database_and_models():
    """Safely import database and all models."""
    print("🔧 Performing safe model imports...")
    
    try:
        # First try direct imports
        from app.database import engine, Base
        
        # Use safe model importer to import all models
        importer = create_safe_model_importer()
        modules = safe_import_all_models()
        
        print(f"✅ Successfully imported {len(modules)} model modules")
        
        # Validate the imports
        validation_report = validate_model_imports()
        if not validation_report["import_success"]:
            print("⚠️  Model import validation found issues:")
            for error in validation_report["import_errors"]:
                print(f"   - {error}")
        else:
            print(f"✅ Model validation passed: {validation_report['total_models']} models found")
        
        return engine, Base, modules
        
    except Exception as e:
        print(f"❌ Safe model import failed: {e}")
        raise

# Perform safe imports
engine, Base, model_modules = safe_import_database_and_models()

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
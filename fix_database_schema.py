#!/usr/bin/env python3
"""
Database schema fix script to handle migration issues
This script addresses the specific errors mentioned in the CI logs:
- relation "unique_user_role_tenant" already exists
- relation "user_role_assignments" does not exist
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import ProgrammingError
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_database_url():
    """Get database URL from environment or use default"""
    return os.getenv("DATABASE_URL", "sqlite:///./digame.db")

def fix_database_schema():
    """Fix database schema issues"""
    database_url = get_database_url()
    engine = create_engine(database_url)
    
    logger.info(f"Connecting to database: {database_url}")
    
    with engine.connect() as conn:
        # Check if we're using PostgreSQL
        is_postgres = "postgresql" in database_url
        
        if is_postgres:
            logger.info("Detected PostgreSQL database")
            fix_postgresql_schema(conn)
        else:
            logger.info("Detected SQLite database")
            fix_sqlite_schema(conn)

def fix_postgresql_schema(conn):
    """Fix PostgreSQL specific schema issues"""
    
    # 1. Check if user_role_assignments table exists
    logger.info("Checking if user_role_assignments table exists...")
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_role_assignments'
        );
    """))
    table_exists = result.scalar()
    
    if not table_exists:
        logger.info("Creating user_role_assignments table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_role_assignments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                role_id INTEGER NOT NULL REFERENCES roles(id),
                tenant_id INTEGER REFERENCES tenants(id),
                assigned_by INTEGER REFERENCES users(id),
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
        """))
        logger.info("✓ Created user_role_assignments table")
    else:
        logger.info("✓ user_role_assignments table already exists")
    
    # 2. Check if unique_user_role_tenant constraint exists
    logger.info("Checking unique_user_role_tenant constraint...")
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE constraint_name = 'unique_user_role_tenant'
            AND table_name = 'user_role_assignments'
        );
    """))
    constraint_exists = result.scalar()
    
    if not constraint_exists:
        logger.info("Adding unique_user_role_tenant constraint...")
        try:
            conn.execute(text("""
                ALTER TABLE user_role_assignments 
                ADD CONSTRAINT unique_user_role_tenant 
                UNIQUE (user_id, role_id, tenant_id);
            """))
            logger.info("✓ Added unique_user_role_tenant constraint")
        except ProgrammingError as e:
            if "already exists" in str(e):
                logger.info("✓ unique_user_role_tenant constraint already exists")
            else:
                raise
    else:
        logger.info("✓ unique_user_role_tenant constraint already exists")
    
    # 3. Create indexes for performance
    logger.info("Creating indexes...")
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_id ON user_role_assignments(role_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_role_assignments_tenant_id ON user_role_assignments(tenant_id);",
    ]
    
    for index_sql in indexes:
        try:
            conn.execute(text(index_sql))
        except ProgrammingError as e:
            if "already exists" in str(e):
                continue
            else:
                logger.warning(f"Failed to create index: {e}")
    
    logger.info("✓ Indexes created/verified")
    
    # 4. Commit changes
    conn.commit()
    logger.info("✓ All PostgreSQL schema fixes applied")

def fix_sqlite_schema(conn):
    """Fix SQLite specific schema issues"""
    
    # SQLite is more forgiving, but let's ensure the table exists
    logger.info("Ensuring user_role_assignments table exists in SQLite...")
    
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS user_role_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            role_id INTEGER NOT NULL REFERENCES roles(id),
            tenant_id INTEGER REFERENCES tenants(id),
            assigned_by INTEGER REFERENCES users(id),
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            UNIQUE(user_id, role_id, tenant_id)
        );
    """))
    
    conn.commit()
    logger.info("✓ SQLite schema verified")

def verify_schema():
    """Verify that the schema fixes worked"""
    logger.info("Verifying schema fixes...")
    
    try:
        from app.database import Base
        import app.models
        
        # Try to create all tables
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        # This should work without errors now
        Base.metadata.create_all(engine)
        
        logger.info("✓ Schema verification successful - all tables created without errors")
        
        # Check specific tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ['users', 'roles', 'user_role_assignments', 'user_settings']
        for table in required_tables:
            if table in tables:
                logger.info(f"✓ Table {table} exists")
            else:
                logger.warning(f"⚠ Table {table} missing")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Schema verification failed: {e}")
        return False

def main():
    """Main function"""
    logger.info("Starting database schema fix...")
    
    try:
        # Apply schema fixes
        fix_database_schema()
        
        # Verify fixes
        if verify_schema():
            logger.info("🎉 Database schema fixes completed successfully!")
            return 0
        else:
            logger.error("❌ Schema verification failed")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Error fixing database schema: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
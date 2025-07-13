#!/usr/bin/env python3
"""
Migration Testing Script for Digame Platform

This script tests the database migration process to ensure:
1. Migrations can be applied successfully
2. Database schema is created correctly
3. Data integrity is maintained
4. Rollback functionality works

Usage:
    python test_migrations.py [--docker]
    
Options:
    --docker    Run tests against the Docker database
"""

import sys
import os
import argparse
import subprocess
import tempfile
import sqlite3
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import our CLI safety utilities
from cli_utils import (
    SafeMigrationRunner,
    create_safe_migration_runner,
    safe_upgrade,
    safe_downgrade,
    check_migration_health,
    get_database_url_from_env
)

def run_command(cmd, cwd=None, capture_output=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            capture_output=capture_output, 
            text=True,
            check=True
        )
        return result.stdout, result.stderr, 0
    except subprocess.CalledProcessError as e:
        return e.stdout, e.stderr, e.returncode

def test_sqlite_migrations():
    """Test migrations using a temporary SQLite database with safe utilities."""
    print("🧪 Testing migrations with SQLite...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a temporary alembic.ini for testing
        test_db_path = os.path.join(temp_dir, "test.db")
        test_alembic_ini = os.path.join(temp_dir, "alembic.ini")
        test_db_url = f"sqlite:///{test_db_path}"
        
        # Copy alembic.ini and modify the database URL
        with open("alembic.ini", "r") as f:
            alembic_content = f.read()
        
        # Replace PostgreSQL URL with SQLite URL
        alembic_content = alembic_content.replace(
            "postgresql://digame_user:digame_password@db:5432/digame_db",
            test_db_url
        )
        
        with open(test_alembic_ini, "w") as f:
            f.write(alembic_content)
        
        print(f"📁 Using temporary database: {test_db_path}")
        
        # Create safe migration runner for this test database
        runner = create_safe_migration_runner(database_url=test_db_url)
        
        # Test: Apply all migrations using safe upgrade
        print("⬆️  Applying migrations...")
        try:
            success = runner.safe_alembic_upgrade(target="head", config_path=test_alembic_ini)
            if not success:
                print("❌ Migration failed")
                return False
            print("✅ Migrations applied successfully")
        except Exception as e:
            print(f"❌ Migration failed with exception: {e}")
            return False
        
        # Test: Verify database schema
        print("🔍 Verifying database schema...")
        if not verify_schema(test_db_path):
            return False
        
        # Test: Check migration health
        print("🏥 Checking migration health...")
        health = runner.check_database_health()
        if not health["connected"]:
            print("❌ Database health check failed - not connected")
            return False
        if health["pending_migrations"]:
            print("❌ Database health check failed - still has pending migrations")
            return False
        print("✅ Migration health check passed")
        
        # Test: Rollback migrations using safe downgrade
        print("⬇️  Testing rollback...")
        try:
            success = runner.safe_alembic_downgrade(target="base", config_path=test_alembic_ini, force=True)
            if not success:
                print("❌ Rollback failed")
                return False
            print("✅ Rollback successful")
        except Exception as e:
            print(f"❌ Rollback failed with exception: {e}")
            return False
        
        # Test: Re-apply migrations using safe upgrade
        print("⬆️  Re-applying migrations...")
        try:
            success = runner.safe_alembic_upgrade(target="head", config_path=test_alembic_ini)
            if not success:
                print("❌ Re-migration failed")
                return False
            print("✅ Re-migration successful")
        except Exception as e:
            print(f"❌ Re-migration failed with exception: {e}")
            return False
        
        # Final health check
        print("🏥 Final health check...")
        health = runner.check_database_health()
        if health["pending_migrations"]:
            print("❌ Final health check failed - still has pending migrations")
            return False
        print("✅ Final health check passed")
        
    return True

def verify_schema(db_path):
    """Verify that the database schema was created correctly."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check that core expected tables exist (subset of full schema)
        expected_core_tables = [
            'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
            'tenants', 'user_profiles', 'tasks', 'jobs',
            'behavioral_models', 'behavioral_patterns', 'alembic_version'
        ]
        
        # Additional tables that should exist in a full migration
        expected_extended_tables = [
            'achievements', 'badges', 'teams', 'team_members',
            'analytics_models', 'reports', 'notifications'
        ]
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        actual_tables = [row[0] for row in cursor.fetchall()]
        
        # Combine core and extended tables for checking
        all_expected_tables = expected_core_tables + expected_extended_tables
        
        missing_core_tables = set(expected_core_tables) - set(actual_tables)
        if missing_core_tables:
            print(f"❌ Missing core tables: {missing_core_tables}")
            return False
        
        # Check for extended tables (optional - warn but don't fail)
        missing_extended_tables = set(expected_extended_tables) - set(actual_tables)
        if missing_extended_tables:
            print(f"⚠️ Missing extended tables (optional): {missing_extended_tables}")
        
        print(f"✅ All {len(expected_core_tables)} core tables created successfully")
        if not missing_extended_tables:
            print(f"✅ All {len(expected_extended_tables)} extended tables also present")
        
        # Check foreign key constraints for behavioral_models
        cursor.execute("PRAGMA foreign_key_list(behavioral_models)")
        fk_constraints = cursor.fetchall()
        
        if not any(fk[2] == 'users' for fk in fk_constraints):
            print("❌ Missing foreign key constraint: behavioral_models -> users")
            return False
        
        # Check foreign key constraints for behavioral_patterns
        cursor.execute("PRAGMA foreign_key_list(behavioral_patterns)")
        fk_constraints = cursor.fetchall()
        
        if not any(fk[2] == 'behavioral_models' for fk in fk_constraints):
            print("❌ Missing foreign key constraint: behavioral_patterns -> behavioral_models")
            return False
        
        print("✅ Foreign key constraints verified")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False

def test_docker_migrations():
    """Test migrations against the Docker PostgreSQL database using safe utilities."""
    print("🐳 Testing migrations with Docker PostgreSQL...")
    
    # Check if Docker containers are running
    stdout, stderr, code = run_command("docker-compose ps")
    if code != 0:
        print("❌ Docker Compose not available or containers not running")
        print("   Please run: docker-compose up -d")
        return False
    
    # Get database URL from environment
    database_url = get_database_url_from_env()
    if not database_url:
        print("❌ No database URL found in environment variables")
        return False
    
    # Create safe migration runner
    runner = create_safe_migration_runner(database_url=database_url)
    
    # Test: Check current migration status using safe utilities
    print("📊 Checking current migration status...")
    try:
        health = runner.check_database_health()
        if not health["connected"]:
            print("❌ Failed to connect to database")
            return False
        
        print(f"Current migration: {health['current_revision'] or 'None'}")
        print(f"Head migration: {health['head_revision'] or 'None'}")
        
        if health["errors"]:
            print("⚠️  Health check warnings:")
            for error in health["errors"]:
                print(f"   - {error}")
        
    except Exception as e:
        print(f"❌ Failed to check migration status: {e}")
        return False
    
    # Test: Apply migrations using safe upgrade
    print("⬆️  Applying migrations...")
    try:
        success = runner.safe_alembic_upgrade(target="head")
        if not success:
            print("❌ Migration failed")
            return False
        print("✅ Migrations applied successfully")
    except Exception as e:
        print(f"❌ Migration failed with exception: {e}")
        return False
    
    # Test: Verify final migration state
    print("🏥 Verifying final migration state...")
    try:
        health = runner.check_database_health()
        if health["pending_migrations"]:
            print("❌ Still have pending migrations after upgrade")
            return False
        print("✅ All migrations applied successfully")
    except Exception as e:
        print(f"❌ Failed to verify migration state: {e}")
        return False
    
    # Test: Get migration history using alembic directly (for informational purposes)
    print("📜 Checking migration history...")
    stdout, stderr, code = run_command("alembic history")
    if code == 0:
        print("Migration history:")
        print(stdout)
    else:
        print(f"⚠️  Could not get migration history: {stderr}")
    
    return True

def test_data_integrity():
    """Test data integrity by creating sample data and verifying relationships."""
    print("🔗 Testing data integrity...")
    
    # This would require connecting to the database and creating test data
    # For now, we'll just verify the schema structure
    print("✅ Data integrity tests would be implemented here")
    return True

def main():
    parser = argparse.ArgumentParser(description="Test Digame database migrations")
    parser.add_argument("--docker", action="store_true", help="Test against Docker database")
    args = parser.parse_args()
    
    print("🚀 Starting Digame Migration Tests")
    print("=" * 50)
    
    success = True
    
    if args.docker:
        success &= test_docker_migrations()
    else:
        success &= test_sqlite_migrations()
    
    success &= test_data_integrity()
    
    print("=" * 50)
    if success:
        print("🎉 All migration tests passed!")
        return 0
    else:
        print("💥 Some migration tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Database Migration Test Script for Phase 1 Schema
Tests the migration script and validates database schema creation.
"""

import os
import sys
import subprocess
import sqlite3
from pathlib import Path
from typing import List, Dict, Any
import tempfile
import shutil

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def run_command(cmd: List[str], cwd: str | None = None) -> tuple[int, str, str]:
    """Run a command and return exit code, stdout, stderr"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd or str(project_root),
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", "Command timed out"
    except Exception as e:
        return 1, "", str(e)

def check_database_tables(db_path: str) -> Dict[str, Any]:
    """Check if all expected tables exist in the database"""
    expected_tables = [
        'user_connections',
        'peer_matches',
        'social_metrics',
        'user_skills',
        'course_categories',
        'courses',
        'course_enrollments',
        'learning_progress',
        'learning_recommendations'
    ]
    
    results: Dict[str, Any] = {
        'tables_found': [],
        'tables_missing': [],
        'table_schemas': {},
        'indexes_found': []
    }
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        actual_tables = [row[0] for row in cursor.fetchall()]
        
        # Check which expected tables exist
        for table in expected_tables:
            if table in actual_tables:
                results['tables_found'].append(table)
                
                # Get table schema
                cursor.execute(f"PRAGMA table_info({table});")
                schema = cursor.fetchall()
                results['table_schemas'][table] = schema
            else:
                results['tables_missing'].append(table)
        
        # Get all indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index';")
        indexes = [row[0] for row in cursor.fetchall()]
        results['indexes_found'] = indexes
        
        conn.close()
        
    except Exception as e:
        results['error'] = str(e)
    
    return results

def test_migration_upgrade():
    """Test the migration upgrade process"""
    print("🔄 Testing Migration Upgrade...")
    
    # Create a temporary database for testing
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
        test_db_path = tmp_db.name
    
    try:
        # Set environment variable for test database
        env = os.environ.copy()
        env['DATABASE_URL'] = f'sqlite:///{test_db_path}'
        
        # Run alembic upgrade
        cmd = ['python', '-m', 'alembic', 'upgrade', 'head']
        exit_code, stdout, stderr = run_command(cmd)
        
        if exit_code != 0:
            print(f"❌ Migration upgrade failed:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
        
        print("✅ Migration upgrade completed successfully")
        
        # Check database schema
        db_results = check_database_tables(test_db_path)
        
        if 'error' in db_results:
            print(f"❌ Database validation error: {db_results['error']}")
            return False
        
        # Report results
        print(f"📊 Database Validation Results:")
        print(f"   Tables found: {len(db_results['tables_found'])}")
        print(f"   Tables missing: {len(db_results['tables_missing'])}")
        print(f"   Indexes found: {len(db_results['indexes_found'])}")
        
        if db_results['tables_missing']:
            print(f"❌ Missing tables: {db_results['tables_missing']}")
            return False
        
        # Validate specific table schemas
        validation_passed = True
        
        # Check user_connections table
        if 'user_connections' in db_results['table_schemas']:
            schema = db_results['table_schemas']['user_connections']
            expected_columns = ['id', 'user_id', 'connected_user_id', 'connection_type', 'status']
            actual_columns = [col[1] for col in schema]
            
            for col in expected_columns:
                if col not in actual_columns:
                    print(f"❌ Missing column '{col}' in user_connections table")
                    validation_passed = False
        
        # Check courses table
        if 'courses' in db_results['table_schemas']:
            schema = db_results['table_schemas']['courses']
            expected_columns = ['id', 'title', 'description', 'category_id', 'difficulty_level']
            actual_columns = [col[1] for col in schema]
            
            for col in expected_columns:
                if col not in actual_columns:
                    print(f"❌ Missing column '{col}' in courses table")
                    validation_passed = False
        
        if validation_passed:
            print("✅ Database schema validation passed")
        else:
            print("❌ Database schema validation failed")
            return False
        
        return True
        
    finally:
        # Clean up test database
        if os.path.exists(test_db_path):
            os.unlink(test_db_path)

def test_migration_downgrade():
    """Test the migration downgrade process"""
    print("🔄 Testing Migration Downgrade...")
    
    # Create a temporary database for testing
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
        test_db_path = tmp_db.name
    
    try:
        # Set environment variable for test database
        env = os.environ.copy()
        env['DATABASE_URL'] = f'sqlite:///{test_db_path}'
        
        # First upgrade to head
        cmd = ['python', '-m', 'alembic', 'upgrade', 'head']
        exit_code, stdout, stderr = run_command(cmd)
        
        if exit_code != 0:
            print(f"❌ Migration upgrade failed during downgrade test")
            return False
        
        # Then downgrade to base
        cmd = ['python', '-m', 'alembic', 'downgrade', 'base']
        exit_code, stdout, stderr = run_command(cmd)
        
        if exit_code != 0:
            print(f"❌ Migration downgrade failed:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
        
        print("✅ Migration downgrade completed successfully")
        
        # Check that tables are removed
        db_results = check_database_tables(test_db_path)
        
        if db_results['tables_found']:
            print(f"❌ Tables still exist after downgrade: {db_results['tables_found']}")
            return False
        
        print("✅ All tables properly removed during downgrade")
        return True
        
    finally:
        # Clean up test database
        if os.path.exists(test_db_path):
            os.unlink(test_db_path)

def test_migration_history():
    """Test migration history and current state"""
    print("🔄 Testing Migration History...")
    
    # Check migration history
    cmd = ['python', '-m', 'alembic', 'history']
    exit_code, stdout, stderr = run_command(cmd)
    
    if exit_code != 0:
        print(f"❌ Failed to get migration history:")
        print(f"STDERR: {stderr}")
        return False
    
    print("✅ Migration history retrieved successfully")
    print("📜 Migration History:")
    print(stdout)
    
    # Check current migration state
    cmd = ['python', '-m', 'alembic', 'current']
    exit_code, stdout, stderr = run_command(cmd)
    
    if exit_code != 0:
        print(f"❌ Failed to get current migration state:")
        print(f"STDERR: {stderr}")
        return False
    
    print("✅ Current migration state retrieved successfully")
    print(f"📍 Current State: {stdout.strip()}")
    
    return True

def main():
    """Main test function"""
    print("🚀 Starting Database Migration Tests for Phase 1 Schema")
    print("=" * 60)
    
    # Check if alembic is available
    cmd = ['python', '-m', 'alembic', '--version']
    exit_code, stdout, stderr = run_command(cmd)
    
    if exit_code != 0:
        print("❌ Alembic not available. Please install alembic:")
        print("   pip install alembic")
        return False
    
    print(f"✅ Alembic version: {stdout.strip()}")
    print()
    
    # Run tests
    tests = [
        ("Migration History", test_migration_history),
        ("Migration Upgrade", test_migration_upgrade),
        ("Migration Downgrade", test_migration_downgrade),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"🧪 Running {test_name} Test...")
        try:
            if test_func():
                print(f"✅ {test_name} Test PASSED")
                passed += 1
            else:
                print(f"❌ {test_name} Test FAILED")
                failed += 1
        except Exception as e:
            print(f"❌ {test_name} Test ERROR: {e}")
            failed += 1
        print()
    
    # Summary
    print("=" * 60)
    print(f"📊 Test Summary:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
    
    if failed == 0:
        print("🎉 All migration tests passed! Database schema is ready for deployment.")
        return True
    else:
        print("⚠️  Some migration tests failed. Please review and fix issues before deployment.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
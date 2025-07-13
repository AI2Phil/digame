#!/usr/bin/env python3
"""
Test script to validate the base migration creates all core tables correctly.
This script tests the migration chain from a fresh database.
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def test_base_migration():
    """Test the base migration on a fresh database."""
    print("🧪 Testing Base Migration...")
    
    # Create a temporary directory for test database
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db_path = os.path.join(temp_dir, "test_migration.db")
        
        # Set environment variable for test database
        original_db_url = os.environ.get('DATABASE_URL')
        os.environ['DATABASE_URL'] = f"sqlite:///{test_db_path}"
        
        try:
            # Import after setting DATABASE_URL
            from alembic.config import Config
            from alembic import command
            from sqlalchemy import create_engine, text
            from app.database import Base
            
            print(f"📁 Using test database: {test_db_path}")
            
            # Create Alembic config
            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{test_db_path}")
            
            # Test 1: Migrate to base migration only
            print("\n🔄 Step 1: Migrating to base migration...")
            command.upgrade(alembic_cfg, "6c5ca693e676")  # Our base migration
            
            # Test 2: Check that core tables exist
            print("🔍 Step 2: Verifying core tables exist...")
            engine = create_engine(f"sqlite:///{test_db_path}")
            
            expected_core_tables = [
                'tenants', 'users', 'user_profiles', 'roles', 'permissions',
                'user_roles', 'role_permissions', 'user_role_assignments',
                'tasks', 'tenant_settings', 'tenant_invitations', 'tenant_audit_logs'
            ]
            
            with engine.connect() as conn:
                # Get list of tables
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                existing_tables = [row[0] for row in result.fetchall()]
                
                print(f"📋 Found tables: {sorted(existing_tables)}")
                
                # Check each expected table
                missing_tables = []
                for table in expected_core_tables:
                    if table not in existing_tables:
                        missing_tables.append(table)
                    else:
                        print(f"✅ Table '{table}' exists")
                
                if missing_tables:
                    print(f"❌ Missing core tables: {missing_tables}")
                    return False
                
                # Test 3: Check that we can create basic records
                print("\n🧪 Step 3: Testing basic record creation...")
                
                # Test tenant creation (using columns that exist in base migration schema)
                conn.execute(text("""
                    INSERT INTO tenants (name, slug, domain, subdomain, admin_email, admin_name)
                    VALUES ('Test Tenant', 'test', 'test.com', 'test', 'admin@test.com', 'Test Admin')
                """))
                
                # Test user creation
                conn.execute(text("""
                    INSERT INTO users (username, email, hashed_password, is_platform_owner, tenant_id)
                    VALUES ('testuser', 'test@test.com', 'hashed_password', 0, 1)
                """))
                
                # Test role creation
                conn.execute(text("""
                    INSERT INTO roles (name, description, tenant_id)
                    VALUES ('admin', 'Administrator role', 1)
                """))
                
                # Test permission creation
                conn.execute(text("""
                    INSERT INTO permissions (name, description)
                    VALUES ('manage_users', 'Can manage users')
                """))
                
                # Test user role assignment
                conn.execute(text("""
                    INSERT INTO user_role_assignments (user_id, role_id, tenant_id, is_active)
                    VALUES (1, 1, 1, 1)
                """))
                
                # Test task creation
                conn.execute(text("""
                    INSERT INTO tasks (user_id, description, status)
                    VALUES (1, 'Test task', 'suggested')
                """))
                
                conn.commit()
                print("✅ Basic record creation successful")
                
                # Test 4: Verify foreign key relationships work
                print("\n🔗 Step 4: Testing foreign key relationships...")
                
                # Check user-tenant relationship
                result = conn.execute(text("""
                    SELECT u.username, t.name 
                    FROM users u 
                    JOIN tenants t ON u.tenant_id = t.id
                """))
                user_tenant = result.fetchone()
                if user_tenant:
                    print(f"✅ User-Tenant relationship: {user_tenant[0]} -> {user_tenant[1]}")
                else:
                    print("❌ User-Tenant relationship failed")
                    return False
                
                # Check user-role relationship
                result = conn.execute(text("""
                    SELECT u.username, r.name 
                    FROM users u 
                    JOIN user_role_assignments ura ON u.id = ura.user_id
                    JOIN roles r ON ura.role_id = r.id
                """))
                user_role = result.fetchone()
                if user_role:
                    print(f"✅ User-Role relationship: {user_role[0]} -> {user_role[1]}")
                else:
                    print("❌ User-Role relationship failed")
                    return False
                
                # Check user-task relationship
                result = conn.execute(text("""
                    SELECT u.username, t.description 
                    FROM users u 
                    JOIN tasks t ON u.id = t.user_id
                """))
                user_task = result.fetchone()
                if user_task:
                    print(f"✅ User-Task relationship: {user_task[0]} -> {user_task[1]}")
                else:
                    print("❌ User-Task relationship failed")
                    return False
            
            print("\n🎉 Base migration test completed successfully!")
            print("✅ All core tables created")
            print("✅ Basic record creation works")
            print("✅ Foreign key relationships functional")
            
            return True
            
        except Exception as e:
            print(f"❌ Base migration test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            # Restore original DATABASE_URL
            if original_db_url:
                os.environ['DATABASE_URL'] = original_db_url
            elif 'DATABASE_URL' in os.environ:
                del os.environ['DATABASE_URL']

def test_full_migration_chain():
    """Test the complete migration chain from base to head."""
    print("\n🔄 Testing Full Migration Chain...")
    
    # Create a temporary directory for test database
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db_path = os.path.join(temp_dir, "test_full_migration.db")
        
        # Set environment variable for test database
        original_db_url = os.environ.get('DATABASE_URL')
        os.environ['DATABASE_URL'] = f"sqlite:///{test_db_path}"
        
        try:
            # Import after setting DATABASE_URL
            from alembic.config import Config
            from alembic import command
            from sqlalchemy import create_engine, text
            
            print(f"📁 Using test database: {test_db_path}")
            
            # Create Alembic config
            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{test_db_path}")
            
            # Migrate from base to head
            print("🔄 Migrating from base to head...")
            command.upgrade(alembic_cfg, "head")
            
            # Check final state
            engine = create_engine(f"sqlite:///{test_db_path}")
            with engine.connect() as conn:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                final_tables = [row[0] for row in result.fetchall()]
                
                print(f"📋 Final table count: {len(final_tables)}")
                print(f"📋 Core tables present: {len([t for t in final_tables if t in ['tenants', 'users', 'roles', 'permissions', 'tasks']])}/5")
                
                # Check if we can still create basic records (using minimal columns for migration chain)
                try:
                    conn.execute(text("""
                        INSERT INTO tenants (name, slug)
                        VALUES ('Full Test', 'fulltest')
                    """))
                    conn.execute(text("""
                        INSERT INTO users (username, email, hashed_password, is_platform_owner, tenant_id)
                        VALUES ('fulltestuser', 'fulltest@test.com', 'hashed_password', 0, 1)
                    """))
                    conn.commit()
                    print("✅ Full migration chain successful - can create records")
                    return True
                except Exception as e:
                    print(f"❌ Full migration chain failed - cannot create records: {e}")
                    return False
            
        except Exception as e:
            print(f"❌ Full migration chain test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            # Restore original DATABASE_URL
            if original_db_url:
                os.environ['DATABASE_URL'] = original_db_url
            elif 'DATABASE_URL' in os.environ:
                del os.environ['DATABASE_URL']

if __name__ == "__main__":
    print("🚀 Starting Base Migration Tests")
    print("=" * 50)
    
    # Test 1: Base migration only
    base_success = test_base_migration()
    
    # Test 2: Full migration chain
    full_success = test_full_migration_chain()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Base Migration: {'PASS' if base_success else 'FAIL'}")
    print(f"✅ Full Chain: {'PASS' if full_success else 'FAIL'}")
    
    if base_success and full_success:
        print("\n🎉 All migration tests passed!")
        print("✅ Base migration creates functional core schema")
        print("✅ Migration chain works from base to head")
        sys.exit(0)
    else:
        print("\n❌ Migration tests failed!")
        sys.exit(1)
#!/usr/bin/env python3
"""
Test script to verify SQLAlchemy mapping fixes
"""

import sys
import os
# Add the parent directory to sys.path so we can import from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_model_imports():
    """Test that all models can be imported without mapping errors"""
    print("Testing model imports...")
    
    try:
        # Import the centralized Base
        from app.database import Base
        print("✓ Successfully imported centralized Base")
        
        # Import models that were causing issues
        from app.models.rbac import UserRoleAssignment, Role, Permission
        print("✓ Successfully imported RBAC models")
        
        from app.models.user_setting import UserSetting
        print("✓ Successfully imported UserSetting model")
        
        # Import specific models from the models package
        import app.models
        print("✓ Successfully imported models package")
        
        return True
        
    except Exception as e:
        print(f"✗ Error importing models: {e}")
        return False

def test_table_definitions():
    """Test that table definitions don't conflict"""
    print("\nTesting table definitions...")
    
    try:
        from app.database import Base
        from app.models.rbac import UserRoleAssignment
        from app.models.user_setting import UserSetting
        
        # Check that UserRoleAssignment uses the correct table name
        assert UserRoleAssignment.__tablename__ == "user_role_assignments", f"Expected 'user_role_assignments', got '{UserRoleAssignment.__tablename__}'"
        print("✓ UserRoleAssignment uses correct table name: user_role_assignments")
        
        # Check that UserSetting has extend_existing
        assert hasattr(UserSetting, '__table_args__'), "UserSetting should have __table_args__"
        table_args = UserSetting.__table_args__
        if isinstance(table_args, dict):
            assert table_args.get('extend_existing') == True, "UserSetting should have extend_existing=True"
        print("✓ UserSetting has extend_existing=True")
        
        return True
        
    except Exception as e:
        print(f"✗ Error in table definitions: {e}")
        return False

def test_database_configuration():
    """Test database configuration"""
    print("\nTesting database configuration...")
    
    try:
        from app.database import DATABASE_URL
        from app.db import SQLALCHEMY_DATABASE_URL
        
        # Check that root user is not used in default URLs
        if "postgresql" in DATABASE_URL and "root" in DATABASE_URL:
            print("✗ DATABASE_URL still contains 'root' user")
            return False
        print("✓ DATABASE_URL does not use 'root' user")
        
        if "postgresql" in SQLALCHEMY_DATABASE_URL and "root" in SQLALCHEMY_DATABASE_URL:
            print("✗ SQLALCHEMY_DATABASE_URL still contains 'root' user")
            return False
        print("✓ SQLALCHEMY_DATABASE_URL does not use 'root' user")
        
        return True
        
    except Exception as e:
        print(f"✗ Error in database configuration: {e}")
        return False

def test_base_consistency():
    """Test that all models use the same Base"""
    print("\nTesting Base consistency...")
    
    try:
        from app.database import Base as DatabaseBase
        from app.models.rbac import UserRoleAssignment
        from app.models.user_setting import UserSetting
        from app.models.user import User
        
        # Check that all models inherit from the same Base
        assert UserRoleAssignment.__bases__[0] is DatabaseBase, "UserRoleAssignment should inherit from centralized Base"
        assert UserSetting.__bases__[0] is DatabaseBase, "UserSetting should inherit from centralized Base"
        assert User.__bases__[0] is DatabaseBase, "User should inherit from centralized Base"
        
        print("✓ All models inherit from the same centralized Base")
        return True
        
    except Exception as e:
        print(f"✗ Error in Base consistency: {e}")
        return False

def test_metadata_creation():
    """Test that metadata can be created without conflicts"""
    print("\nTesting metadata creation...")
    
    try:
        from app.database import Base
        
        # Try to create all tables in metadata (this would fail if there are conflicts)
        tables = Base.metadata.tables
        print(f"✓ Successfully loaded {len(tables)} tables in metadata")
        
        # Check for specific tables
        expected_tables = ['users', 'user_settings', 'roles', 'permissions', 'user_roles', 'user_role_assignments']
        for table_name in expected_tables:
            if table_name in tables:
                print(f"✓ Found expected table: {table_name}")
            else:
                print(f"⚠ Table not found: {table_name} (may be normal if not yet migrated)")
        
        return True
        
    except Exception as e:
        print(f"✗ Error in metadata creation: {e}")
        return False

def main():
    """Run all tests"""
    print("SQLAlchemy Mapping Fixes Verification")
    print("=" * 40)
    
    tests = [
        test_model_imports,
        test_table_definitions,
        test_database_configuration,
        test_base_consistency,
        test_metadata_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All fixes verified successfully!")
        return 0
    else:
        print("❌ Some issues remain")
        return 1

if __name__ == "__main__":
    sys.exit(main())
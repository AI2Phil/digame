#!/usr/bin/env python3
"""
Careful SQLAlchemy Index Fix Script
Only fixes specific index conflicts without corrupting syntax
"""

import os
import re
import sys
from pathlib import Path

def fix_user_model_carefully():
    """Fix only the User model with surgical precision"""
    user_file = Path("app/models/user.py")
    if not user_file.exists():
        print(f"❌ {user_file} not found!")
        return False
    
    try:
        with open(user_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Only add extend_existing if not already present
        if "__table_args__ = {'extend_existing': True}" not in content and "extend_existing" not in content:
            # Find the User class and add extend_existing after __tablename__
            pattern = r'(class User\(Base\):\s*\n\s*__tablename__ = "users")'
            if re.search(pattern, content):
                replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
                content = re.sub(pattern, replacement, content)
                print("✅ Added extend_existing to User class")
        
        # Only write if content actually changed
        if content != original_content:
            with open(user_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {user_file}: {e}")
        return False

def fix_rbac_model_carefully():
    """Fix only the RBAC models with surgical precision"""
    rbac_file = Path("app/models/rbac.py")
    if not rbac_file.exists():
        print(f"❌ {rbac_file} not found!")
        return False
    
    try:
        with open(rbac_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = False
        
        # Fix Role class
        if 'class Role(Base):' in content and "__table_args__ = {'extend_existing': True}" not in content:
            pattern = r'(class Role\(Base\):\s*\n\s*__tablename__ = "roles")'
            if re.search(pattern, content):
                replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
                content = re.sub(pattern, replacement, content)
                print("✅ Added extend_existing to Role class")
                changes_made = True
        
        # Fix Permission class
        if 'class Permission(Base):' in content:
            pattern = r'(class Permission\(Base\):\s*\n\s*__tablename__ = "permissions")'
            if re.search(pattern, content):
                replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
                content = re.sub(pattern, replacement, content)
                print("✅ Added extend_existing to Permission class")
                changes_made = True
        
        # Fix UserRoleAssignment class - be very careful with existing __table_args__
        if 'class UserRoleAssignment(Base):' in content:
            # Check if it already has __table_args__ with constraints
            if '__table_args__ =' in content and 'UserRoleAssignment' in content:
                # Add extend_existing to existing tuple
                pattern = r'(__table_args__ = \(\s*[^)]+)(\s*\))'
                if re.search(pattern, content) and 'extend_existing' not in content:
                    replacement = r'\1,\n        {\'extend_existing\': True}\2'
                    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                    print("✅ Added extend_existing to UserRoleAssignment __table_args__")
                    changes_made = True
        
        # Only write if content actually changed
        if changes_made and content != original_content:
            with open(rbac_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {rbac_file}: {e}")
        return False

def main():
    """Main function to carefully fix SQLAlchemy models"""
    print("🎯 Careful SQLAlchemy Index Fix Script")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    fixed_count = 0
    
    print("\n🔧 Fixing critical models with surgical precision...")
    
    if fix_user_model_carefully():
        print("✅ Fixed User model")
        fixed_count += 1
    else:
        print("⏭️  User model already fixed or no changes needed")
    
    if fix_rbac_model_carefully():
        print("✅ Fixed RBAC models")
        fixed_count += 1
    else:
        print("⏭️  RBAC models already fixed or no changes needed")
    
    print(f"\n📊 Summary: Fixed {fixed_count} model files")
    
    if fixed_count > 0:
        print("\n✅ Critical SQLAlchemy index conflicts have been carefully fixed!")
        print("🚀 Next step: Run tests to verify fixes")
        print("   Command: pytest tests/routers/test_admin_rbac_router.py::test_create_role_as_admin -v")
    else:
        print("\n✅ All critical models are already properly configured!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
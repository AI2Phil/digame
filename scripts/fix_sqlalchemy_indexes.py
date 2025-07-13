#!/usr/bin/env python3
"""
Targeted SQLAlchemy Index Fix Script
Fixes ONLY the specific index conflicts without breaking syntax
"""

import os
import re
import sys
from pathlib import Path

def fix_user_model():
    """Fix the specific User model index conflicts"""
    user_file = Path("app/models/user.py")
    if not user_file.exists():
        print(f"❌ {user_file} not found!")
        return False
    
    try:
        with open(user_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix 1: Add extend_existing to User class if not present
        if "__table_args__ = {'extend_existing': True}" not in content:
            # Find the User class and add extend_existing after __tablename__
            pattern = r'(class User\(Base\):\s*\n\s*__tablename__ = "users")'
            replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
            content = re.sub(pattern, replacement, content)
            print("✅ Added extend_existing to User class")
        
        # Fix 2: Remove index=True from primary key if present
        if 'primary_key=True, index=True' in content:
            content = content.replace('primary_key=True, index=True', 'primary_key=True')
            print("✅ Removed redundant index=True from primary key")
        
        # Only write if content changed
        if content != original_content:
            with open(user_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {user_file}: {e}")
        return False

def fix_rbac_model():
    """Fix the specific RBAC model index conflicts"""
    rbac_file = Path("app/models/rbac.py")
    if not rbac_file.exists():
        print(f"❌ {rbac_file} not found!")
        return False
    
    try:
        with open(rbac_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix 1: Add extend_existing to Role class if not present
        if 'class Role(Base):' in content and "__table_args__ = {'extend_existing': True}" not in content:
            pattern = r'(class Role\(Base\):\s*\n\s*__tablename__ = "roles")'
            replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
            content = re.sub(pattern, replacement, content)
            print("✅ Added extend_existing to Role class")
        
        # Fix 2: Add extend_existing to Permission class if not present
        if 'class Permission(Base):' in content:
            pattern = r'(class Permission\(Base\):\s*\n\s*__tablename__ = "permissions")'
            replacement = r'\1\n    __table_args__ = {\'extend_existing\': True}'
            content = re.sub(pattern, replacement, content)
            print("✅ Added extend_existing to Permission class")
        
        # Fix 3: Add extend_existing to UserRoleAssignment class if not present
        if 'class UserRoleAssignment(Base):' in content:
            # Look for existing __table_args__ and add extend_existing
            if '__table_args__' in content and 'extend_existing' not in content:
                # Find the __table_args__ tuple and add extend_existing
                pattern = r'(__table_args__ = \(\s*[^)]+)(\s*\))'
                replacement = r'\1,\n        {\'extend_existing\': True}\2'
                content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                print("✅ Added extend_existing to UserRoleAssignment __table_args__")
        
        # Fix 4: Remove index=True from primary keys
        if 'primary_key=True, index=True' in content:
            content = content.replace('primary_key=True, index=True', 'primary_key=True')
            print("✅ Removed redundant index=True from primary keys")
        
        # Only write if content changed
        if content != original_content:
            with open(rbac_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {rbac_file}: {e}")
        return False

def add_extend_existing_to_model(file_path):
    """Add extend_existing to a single model file safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Only add extend_existing if the file contains Base classes and doesn't already have it
        if 'class ' in content and '(Base):' in content and 'extend_existing' not in content:
            # Find all class definitions that inherit from Base
            pattern = r'(class\s+\w+\(Base\):\s*\n\s*__tablename__\s*=\s*["\'][^"\']+["\'])'
            
            def add_table_args(match):
                class_def = match.group(1)
                return f"{class_def}\n    __table_args__ = {{'extend_existing': True}}"
            
            content = re.sub(pattern, add_table_args, content)
            
            # Remove redundant index=True from primary keys
            content = content.replace('primary_key=True, index=True', 'primary_key=True')
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix SQLAlchemy index conflicts"""
    print("🎯 Targeted SQLAlchemy Index Fix Script")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    fixed_count = 0
    
    # Fix the most critical models first
    print("\n🔧 Fixing critical models...")
    
    if fix_user_model():
        print("✅ Fixed User model")
        fixed_count += 1
    else:
        print("⏭️  User model already fixed or no changes needed")
    
    if fix_rbac_model():
        print("✅ Fixed RBAC models")
        fixed_count += 1
    else:
        print("⏭️  RBAC models already fixed or no changes needed")
    
    # Fix other model files
    print("\n🔧 Fixing other model files...")
    models_dir = Path("app/models")
    if models_dir.exists():
        for py_file in models_dir.glob("*.py"):
            if py_file.name in ["__init__.py", "user.py", "rbac.py"]:
                continue  # Skip already processed files
            
            if add_extend_existing_to_model(py_file):
                print(f"✅ Fixed {py_file}")
                fixed_count += 1
    
    print(f"\n📊 Summary: Fixed {fixed_count} model files")
    
    if fixed_count > 0:
        print("\n✅ SQLAlchemy index conflicts have been fixed!")
        print("🚀 Next step: Run tests to verify fixes")
        print("   Command: pytest tests/routers/test_admin_rbac_router.py::test_create_role_as_admin -v")
    else:
        print("\n✅ All models are already properly configured!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
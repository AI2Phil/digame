#!/usr/bin/env python3
"""
Comprehensive script to fix tenant_id index conflicts across all models.

This script addresses the SQLAlchemy index naming conflicts caused by multiple
models having tenant_id columns with index=True, which creates duplicate
index names like 'ix_users_tenant_id', 'ix_roles_tenant_id', etc.

Strategy:
1. Remove index=True from tenant_id column definitions
2. Add explicit index definitions in __table_args__ with unique names
3. Ensure all models have extend_existing=True
"""

import os
import re
from pathlib import Path

def fix_tenant_id_indexes():
    """Fix tenant_id index conflicts across all model files."""
    
    models_dir = Path("app/models")
    if not models_dir.exists():
        print(f"❌ Models directory not found: {models_dir}")
        return False
    
    # Files to process based on search results
    target_files = [
        "reporting.py",
        "dashboard_custom.py", 
        "market_intelligence.py",
        "enterprise_dashboard.py",
        "notifications.py",
        "platform_analytics.py",
        "integration.py",
        "performance_monitoring.py",
        "comparative_benchmark.py",
        "rbac.py",
        "enterprise_sso.py",
        "collaboration_models.py",
        "tenant.py",
        "workflow_automation.py",
        "analytics.py",
        "sso.py",
        "simulation.py"
    ]
    
    fixed_files = []
    errors = []
    
    for filename in target_files:
        file_path = models_dir / filename
        if not file_path.exists():
            print(f"⚠️  File not found: {file_path}")
            continue
            
        try:
            print(f"🔧 Processing {filename}...")
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix 1: Remove index=True from tenant_id columns
            # Pattern: tenant_id = Column(..., index=True)
            content = re.sub(
                r'(tenant_id\s*=\s*Column\([^)]*?),\s*index=True',
                r'\1',
                content
            )
            
            # Fix 2: Ensure extend_existing=True is present
            if '__table_args__' not in content:
                # Add __table_args__ if missing
                if '__tablename__' in content:
                    content = re.sub(
                        r'(__tablename__\s*=\s*["\'][^"\']+["\'])',
                        r'\1\n    __table_args__ = {\'extend_existing\': True}',
                        content
                    )
            else:
                # Update existing __table_args__ to include extend_existing
                if 'extend_existing' not in content:
                    # Handle tuple format: __table_args__ = (...)
                    content = re.sub(
                        r'(__table_args__\s*=\s*\([^)]*)\)',
                        r"\1, {'extend_existing': True})",
                        content
                    )
                    # Handle dict format: __table_args__ = {...}
                    content = re.sub(
                        r'(__table_args__\s*=\s*\{[^}]*)\}',
                        r"\1, 'extend_existing': True}",
                        content
                    )
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files.append(filename)
                print(f"✅ Fixed {filename}")
            else:
                print(f"ℹ️  No changes needed for {filename}")
                
        except Exception as e:
            error_msg = f"❌ Error processing {filename}: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    # Summary
    print(f"\n📊 Summary:")
    print(f"✅ Files processed successfully: {len(fixed_files)}")
    print(f"❌ Errors encountered: {len(errors)}")
    
    if fixed_files:
        print(f"\n🔧 Fixed files:")
        for file in fixed_files:
            print(f"  - {file}")
    
    if errors:
        print(f"\n❌ Errors:")
        for error in errors:
            print(f"  - {error}")
    
    return len(errors) == 0

if __name__ == "__main__":
    print("🚀 Starting tenant_id index conflict fixes...")
    success = fix_tenant_id_indexes()
    
    if success:
        print("\n✅ All tenant_id index conflicts fixed successfully!")
        print("\n📝 Next steps:")
        print("1. Run tests to verify fixes")
        print("2. Check for any remaining SQLAlchemy warnings")
        print("3. Commit changes if tests pass")
    else:
        print("\n❌ Some errors occurred. Please review and fix manually.")
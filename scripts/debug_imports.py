#!/usr/bin/env python3
"""
Diagnostic script to debug UserRoleAssignment imports and SQLAlchemy registry conflicts
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

print("=== Debugging UserRoleAssignment imports ===")

# Clear all cached modules
modules_to_clear = [k for k in sys.modules.keys() if 'user_role' in k.lower() or 'rbac' in k.lower()]
for mod in modules_to_clear:
    if mod in sys.modules:
        del sys.modules[mod]
        print(f"Cleared module: {mod}")

try:
    # Try to import and see what happens
    print("1. Importing from imports module...")
    from app.models.imports import UserRoleAssignment as URA1
    print(f"   Success: {URA1.__module__}.{URA1.__name__}")
    
    print("2. Importing from models...")
    from app.models import UserRoleAssignment as URA2
    print(f"   Success: {URA2.__module__}.{URA2.__name__}")
    
    print(f"3. Same class? {URA1 is URA2}")
    print(f"4. URA1 ID: {id(URA1)}")
    print(f"5. URA2 ID: {id(URA2)}")
    
    # Check SQLAlchemy registry
    from app.database import Base
    if hasattr(Base, 'registry'):
        registry_items = Base.registry._class_registry
        ura_items = {k: v for k, v in registry_items.items() if 'UserRole' in str(k)}
        print(f"6. Registry items with UserRole: {ura_items}")
    
    print("7. Testing model creation...")
    # Try to create a simple instance
    test_instance = URA1(user_id=1, role_id=1, tenant_id=1)
    print(f"   Created instance: {test_instance}")
    
    print("8. All imports successful!")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
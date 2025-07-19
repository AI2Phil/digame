#!/usr/bin/env python3

import sys
sys.path.append('.')

print("=== DEBUG USER CLASS ===")

# Test 1: Direct import
print("\n1. Direct import from app.models.user:")
try:
    from app.models.user import User
    print(f"User class: {User}")
    print(f"User.__name__: {User.__name__}")
    print(f"User.__module__: {User.__module__}")
    print(f"User.__tablename__: {getattr(User, '__tablename__', 'NO TABLENAME')}")
    
    # Check if it has username field
    if hasattr(User, '__table__'):
        try:
            columns = list(User.__table__.columns.keys())
            print(f"User columns: {columns}")
            print(f"Has username: {'username' in columns}")
        except Exception as e:
            print(f"Could not get columns: {e}")
    else:
        print("User has no __table__ attribute")
        
    # Try to create instance
    try:
        user = User(username="test")
        print("✓ User(username='test') works")
    except Exception as e:
        print(f"✗ User(username='test') failed: {e}")
        
except Exception as e:
    print(f"Failed to import User: {e}")

# Test 2: Check SQLAlchemy registry
print("\n2. SQLAlchemy registry check:")
try:
    from app.database import Base
    if hasattr(Base, 'registry'):
        registry = Base.registry._class_registry
        print(f"Registry keys: {list(registry.keys())}")
        
        # Check what 'User' resolves to
        if 'User' in registry:
            user_class = registry['User']
            print(f"Registry['User']: {user_class}")
            print(f"Registry['User'].__name__: {getattr(user_class, '__name__', 'NO NAME')}")
            print(f"Registry['User'].__module__: {getattr(user_class, '__module__', 'NO MODULE')}")
        else:
            print("'User' not found in registry")
            
        # Check for UserRoleAssignment
        if 'UserRoleAssignment' in registry:
            ura_class = registry['UserRoleAssignment']
            print(f"Registry['UserRoleAssignment']: {ura_class}")
        else:
            print("'UserRoleAssignment' not found in registry")
            
    else:
        print("Base has no registry")
except Exception as e:
    print(f"Registry check failed: {e}")

# Test 3: Import order test
print("\n3. Import order test:")
try:
    # Clear any existing imports
    modules_to_clear = [k for k in sys.modules.keys() if k.startswith('app.models')]
    for mod in modules_to_clear:
        if mod in sys.modules:
            del sys.modules[mod]
    
    # Import in specific order
    from app.models.user import User as UserDirect
    from app.models.user_role_assignment import UserRoleAssignment
    
    print(f"After imports - UserDirect: {UserDirect}")
    print(f"After imports - UserRoleAssignment: {UserRoleAssignment}")
    
    # Check registry again
    from app.database import Base
    if hasattr(Base, 'registry'):
        registry = Base.registry._class_registry
        print(f"Registry after imports: {list(registry.keys())}")
        if 'User' in registry:
            print(f"Registry['User'] after imports: {registry['User']}")
            
except Exception as e:
    print(f"Import order test failed: {e}")

print("\n=== END DEBUG ===")
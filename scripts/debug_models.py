print("=== Model Diagnostic ===")

try:
    from app.models.user import User
    from app.models.tenant import Tenant
    from app.models.notifications import Notification
    
    print("✅ Models imported successfully")
    
    # Check User model
    print(f"User attributes: {dir(User)}")
    print(f"User.__init__ signature: {User.__init__.__annotations__ if hasattr(User.__init__, '__annotations__') else 'No annotations'}")
    
    # Check if models have expected attributes
    user_attrs = ['id', 'username', 'email']
    for attr in user_attrs:
        has_attr = hasattr(User, attr)
        print(f"User.{attr}: {'✅' if has_attr else '❌'}")
    
    # Try creating instances
    print("Testing model creation...")
    
    # Test User creation with minimal data
    try:
        user = User()
        print("✅ User() creation successful")
    except Exception as e:
        print(f"❌ User() creation failed: {e}")
    
    # Test with parameters
    try:
        user = User(username="test", email="test@example.com")
        print("✅ User(username, email) creation successful")
    except Exception as e:
        print(f"❌ User(username, email) creation failed: {e}")
        
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()

print("\n=== SQLAlchemy Base Diagnostic ===")

try:
    from app.database import Base
    from sqlalchemy.orm import configure_mappers
    
    print(f"Base class: {Base}")
    print(f"Base registry: {hasattr(Base, 'registry')}")
    
    if hasattr(Base, 'registry'):
        registry_data = Base.registry._class_registry
        print(f"Registry entries: {len(registry_data)}")
        
        user_entries = {k: v for k, v in registry_data.items() if 'User' in str(k)}
        print(f"User-related entries: {user_entries}")
    
    # Try configuring mappers
    configure_mappers()
    print("✅ Mappers configured successfully")
    
except Exception as e:
    print(f"❌ Configuration error: {e}")
    import traceback
    traceback.print_exc()
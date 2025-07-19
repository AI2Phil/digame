import pytest
from app.models.user import User

def test_user_creation_debug():
    """Debug test to understand User model issues during test execution"""
    print("\n=== Debug User Creation in Test ===")
    
    # Check User class attributes
    print(f"User class: {User}")
    print(f"User.__dict__.keys(): {list(User.__dict__.keys())}")
    
    # Check if User has expected columns
    expected_attrs = ['id', 'username', 'email', 'hashed_password']
    for attr in expected_attrs:
        has_attr = hasattr(User, attr)
        print(f"User.{attr}: {'✅' if has_attr else '❌'}")
        if has_attr:
            column = getattr(User, attr)
            print(f"  Type: {type(column)}")
    
    # Check User.__init__ method
    print(f"User.__init__: {User.__init__}")
    print(f"User.__init__.__code__.co_varnames: {User.__init__.__code__.co_varnames}")
    
    # Try different creation methods
    print("\n--- Testing User Creation Methods ---")
    
    # Method 1: No arguments
    try:
        user1 = User()
        print("✅ User() - Success")
    except Exception as e:
        print(f"❌ User() - Failed: {e}")
    
    # Method 2: With keyword arguments
    try:
        user2 = User(username="test", email="test@example.com", hashed_password="hash")
        print("✅ User(username, email, hashed_password) - Success")
    except Exception as e:
        print(f"❌ User(username, email, hashed_password) - Failed: {e}")
    
    # Method 3: Using setattr after creation
    try:
        user3 = User()
        user3.username = "test"
        user3.email = "test@example.com"
        user3.hashed_password = "hash"
        print("✅ User() + setattr - Success")
    except Exception as e:
        print(f"❌ User() + setattr - Failed: {e}")
    
    # Check SQLAlchemy state
    print(f"\n--- SQLAlchemy State ---")
    print(f"User.__mapper__: {getattr(User, '__mapper__', 'Not found')}")
    print(f"User.__table__: {getattr(User, '__table__', 'Not found')}")
    
    if hasattr(User, '__table__'):
        table = User.__table__
        print(f"Table columns: {[c.name for c in table.columns]}")

if __name__ == "__main__":
    test_user_creation_debug()
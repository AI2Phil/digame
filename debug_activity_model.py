#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.abspath('.'))

print("=== Testing ActivityEnrichedFeature model ===")

# Test 1: Direct import
print("\n1. Testing direct import...")
try:
    from app.models.activity_features import ActivityEnrichedFeature as DirectModel
    print("✓ Direct import successful")
    print(f"  Columns: {[c.name for c in DirectModel.__table__.columns]}")
    
    # Test constructor
    instance = DirectModel(activity_id=1, app_category="Test")
    print("✓ Direct constructor works")
except Exception as e:
    print(f"✗ Direct import failed: {e}")

# Test 2: Centralized import
print("\n2. Testing centralized import...")
try:
    from app.models.imports import ActivityEnrichedFeature as CentralizedModel
    print("✓ Centralized import successful")
    print(f"  Columns: {[c.name for c in CentralizedModel.__table__.columns]}")
    
    # Test constructor
    instance = CentralizedModel(activity_id=1, app_category="Test")
    print("✓ Centralized constructor works")
except Exception as e:
    print(f"✗ Centralized import failed: {e}")

# Test 3: Models __init__ import
print("\n3. Testing models __init__ import...")
try:
    from app.models import ActivityEnrichedFeature as InitModel
    print("✓ Models __init__ import successful")
    print(f"  Columns: {[c.name for c in InitModel.__table__.columns]}")
    
    # Test constructor
    instance = InitModel(activity_id=1, app_category="Test")
    print("✓ Models __init__ constructor works")
except Exception as e:
    print(f"✗ Models __init__ import failed: {e}")

# Test 4: Check if they're the same object
print("\n4. Testing object identity...")
try:
    print(f"  Direct is Centralized: {DirectModel is CentralizedModel}")
    print(f"  Direct is Init: {DirectModel is InitModel}")
    print(f"  Centralized is Init: {CentralizedModel is InitModel}")
except Exception as e:
    print(f"✗ Object identity check failed: {e}")

# Test 5: Simulate pytest environment
print("\n5. Simulating pytest environment...")
try:
    # Import the nuclear reset
    from tests.conftest import reset_sqlalchemy_completely
    print("✓ Nuclear reset imported")
    
    # Run the reset
    reset_sqlalchemy_completely()
    print("✓ Nuclear reset executed")
    
    # Try import after reset
    from app.models.imports import ActivityEnrichedFeature as PostResetModel
    print("✓ Post-reset import successful")
    print(f"  Columns: {[c.name for c in PostResetModel.__table__.columns]}")
    
    # Test constructor after reset
    instance = PostResetModel(activity_id=1, app_category="Test")
    print("✓ Post-reset constructor works")
    
except Exception as e:
    print(f"✗ Pytest simulation failed: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Test complete ===")
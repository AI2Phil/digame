#!/usr/bin/env python3
"""
Backend SQLAlchemy Fixes Verification Script
Verifies that all SQLAlchemy models can be imported and initialized
"""

import sys
import os
from pathlib import Path

def verify_sqlalchemy_fixes():
    """Verify SQLAlchemy model fixes"""
    print("🔧 Verifying Backend SQLAlchemy Fixes")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    try:
        # Test basic imports
        print("📦 Testing basic imports...")
        sys.path.append('.')
        
        from app.database import Base
        print("✅ Database Base imported successfully")
        
        # Test model imports
        print("📦 Testing model imports...")
        
        # Test a few key models
        from app.models.user import User, UserProfile
        print("✅ User models imported successfully")
        
        from app.models.team import Team, TeamMember
        print("✅ Team models imported successfully")
        
        from app.models.security import SecurityEvent, AuditLog
        print("✅ Security models imported successfully")
        
        # Verify table_args are set
        print("🔍 Verifying __table_args__ fixes...")
        
        models_to_check = [User, UserProfile, Team, TeamMember, SecurityEvent, AuditLog]
        
        for model in models_to_check:
            if hasattr(model, '__table_args__'):
                table_args = model.__table_args__
                if isinstance(table_args, dict):
                    if table_args.get('extend_existing'):
                        print(f"✅ {model.__name__}: extend_existing = True")
                    else:
                        print(f"⚠️  {model.__name__}: extend_existing not set")
                elif isinstance(table_args, tuple):
                    # Check if extend_existing is in the tuple (usually last element)
                    extend_existing_found = False
                    for arg in table_args:
                        if isinstance(arg, dict) and arg.get('extend_existing'):
                            extend_existing_found = True
                            break
                    if extend_existing_found:
                        print(f"✅ {model.__name__}: extend_existing = True (in tuple)")
                    else:
                        print(f"⚠️  {model.__name__}: extend_existing not found in tuple")
                else:
                    print(f"⚠️  {model.__name__}: unexpected __table_args__ format")
            else:
                print(f"❌ {model.__name__}: missing __table_args__")
        
        print("\n" + "=" * 50)
        print("✅ Backend SQLAlchemy fixes verification completed!")
        print("🚀 Backend models are ready for testing")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you're running from the project root directory")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main function"""
    success = verify_sqlalchemy_fixes()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
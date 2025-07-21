#!/usr/bin/env python3
"""
Script to create Platform Owner user for Digame platform
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.schemas.user_schemas import UserCreate
from app.crud.user_crud import create_user, get_user_by_email
from app.auth.jwt_handler import PasswordHandler

def create_platform_owner():
    """Create Platform Owner user"""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Platform Owner credentials
        platform_owner_email = "philip.a.oshea@gmail.com"
        platform_owner_username = "philip.oshea"
        platform_owner_password = "Dalk3y1306"
        
        # Check if Platform Owner user already exists
        existing_owner = get_user_by_email(db, platform_owner_email)
        
        if existing_owner:
            print(f"✅ Platform Owner user already exists: {platform_owner_email}")
            return existing_owner
        
        # Create Platform Owner user
        owner_data = UserCreate(
            username=platform_owner_username,
            email=platform_owner_email,
            password=platform_owner_password,
            first_name="Philip",
            last_name="O'Shea",
            is_active=True
        )
        
        owner_user = create_user(db, owner_data)
        
        print(f"✅ Created Platform Owner user: {platform_owner_email}")
        print(f"   Username: {platform_owner_username}")
        print(f"   Password: {platform_owner_password}")
        
        # Commit changes
        db.commit()
        
        return owner_user
        
    except Exception as e:
        print(f"❌ Error creating Platform Owner user: {str(e)}")
        db.rollback()
        return None
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating Platform Owner user...")
    user = create_platform_owner()
    if user:
        print("🎉 Platform Owner user created successfully!")
    else:
        print("💥 Failed to create Platform Owner user!")
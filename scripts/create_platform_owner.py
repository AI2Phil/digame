#!/usr/bin/env python3
"""
Simple script to create a Platform Owner user
"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.models.user import User
from app.services.platform_auth_service import get_password_hash

# Database setup
DATABASE_URL = "sqlite:///./digame.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_platform_owner():
    """Create a Platform Owner user"""
    
    # Platform Owner credentials
    email = "owner@digame.com"
    password = "PlatformOwner123!"
    username = "owner"
    
    print(f"Creating Platform Owner with email: {email}")
    
    db = SessionLocal()
    try:
        # Check if platform owner already exists
        existing_owner = db.query(User).filter(
            User.email == email
        ).first()
        
        if existing_owner:
            # Update existing user to be Platform Owner
            existing_owner.is_platform_owner = True
            existing_owner.platform_owner_level = 3
            existing_owner.subscription_tier = "platform_owner"
            existing_owner.subscription_status = "active"
            existing_owner.is_active = True
            existing_owner.email_verified = True
            db.commit()
            print(f"Updated existing user {email} to Platform Owner")
            return existing_owner
        
        # Create new platform owner
        hashed_password = get_password_hash(password)
        
        platform_owner = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            is_platform_owner=True,
            platform_owner_level=3,
            tenant_id=None,  # Platform owners don't belong to tenants
            subscription_tier="platform_owner",
            subscription_status="active",
            is_active=True,
            email_verified=True,
            created_at=datetime.utcnow()
        )
        
        db.add(platform_owner)
        db.commit()
        db.refresh(platform_owner)
        
        print(f"✅ Created Platform Owner: {email}")
        print(f"🔑 Password: {password}")
        print(f"👑 Platform Owner Level: {platform_owner.platform_owner_level}")
        print(f"📧 Email: {platform_owner.email}")
        print(f"🆔 Username: {platform_owner.username}")
        print(f"\n🎯 You can now sign in with these credentials!")
        
        return platform_owner
        
    except Exception as e:
        print(f"❌ Error creating Platform Owner: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_platform_owner()
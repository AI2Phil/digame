"""
Script to create a platform owner user account using SQLAlchemy 2.0 patterns
"""

import sys
import os
from datetime import datetime
from passlib.context import CryptContext

# Add the app directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_platform_owner():
    """Create a platform owner user account"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "philip.a.oshea@gmail.com").first()
        if existing_user:
            print("User already exists. Updating to platform owner...")
            existing_user.is_platform_owner = True
            existing_user.platform_owner_level = 3  # Super admin level
            existing_user.subscription_tier = "enterprise"
            existing_user.email_verified = True
            existing_user.is_active = True
            db.commit()
            print(f"Updated user: {existing_user.username} to platform owner")
            return existing_user
        
        # Create new platform owner user
        hashed_password = hash_password("Dalk3y1306")
        
        new_user = User(
            username="philip.oshea",
            email="philip.a.oshea@gmail.com",
            hashed_password=hashed_password,
            first_name="Philip",
            last_name="O'Shea",
            is_platform_owner=True,
            platform_owner_level=3,  # Super admin level
            subscription_tier="enterprise",
            subscription_status="active",
            email_verified=True,
            is_active=True,
            onboarding_completed=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"Created platform owner user: {new_user.username} ({new_user.email})")
        print(f"Platform Owner: {new_user.is_platform_owner}")
        print(f"Platform Owner Level: {new_user.platform_owner_level}")
        print(f"Subscription Tier: {new_user.subscription_tier}")
        
        return new_user
        
    except Exception as e:
        print(f"Error creating platform owner: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_platform_owner()
#!/usr/bin/env python3
"""
Script to check user credentials in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.database import DATABASE_URL

def check_user_credentials(email):
    """Check if user exists and display their information"""
    
    # Create engine and session
    engine = create_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        # Search for user by email
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"✅ User found!")
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"First Name: {user.first_name}")
            print(f"Last Name: {user.last_name}")
            print(f"Is Active: {user.is_active}")
            print(f"Is Guest: {user.is_guest}")
            print(f"Email Verified: {user.email_verified}")
            print(f"Onboarding Completed: {user.onboarding_completed}")
            print(f"Created At: {user.created_at}")
            print(f"Last Login: {user.last_login}")
            print(f"Subscription Tier: {user.subscription_tier}")
            print(f"Is Platform Owner: {user.is_platform_owner}")
            print(f"Platform Owner Level: {user.platform_owner_level}")
            print(f"Failed Login Attempts: {user.failed_login_attempts}")
            
            # Note: We don't display the hashed password for security reasons
            print(f"Has Password: {'Yes' if user.hashed_password else 'No'}")
            if user.hashed_password:
                print(f"Password Hash (first 20 chars): {user.hashed_password[:20]}...")
            
            return user
        else:
            print(f"❌ No user found with email: {email}")
            return None
            
    except Exception as e:
        print(f"❌ Error querying database: {e}")
        return None
    finally:
        db.close()

def list_all_users():
    """List all users in the database"""
    
    # Create engine and session
    engine = create_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if users:
            print(f"\n📋 Found {len(users)} users in database:")
            print("-" * 80)
            for user in users:
                print(f"ID: {user.id} | Email: {user.email} | Username: {user.username} | Active: {user.is_active}")
        else:
            print("📋 No users found in database")
            
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    target_email = "philip.a.oshea@gmail.com"
    
    print(f"🔍 Searching for user with email: {target_email}")
    print("=" * 60)
    
    user = check_user_credentials(target_email)
    
    print("\n" + "=" * 60)
    list_all_users()
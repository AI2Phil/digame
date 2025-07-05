#!/usr/bin/env python3
"""
Demo User Seeding Script for Digame Platform
Creates default demo users for testing and demonstration purposes.
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.crud.user_crud import pwd_context
from datetime import datetime, timezone
import json

def create_demo_users(db: Session):
    """Create demo users for testing purposes."""
    
    demo_users = [
        {
            "username": "demo",
            "email": "demo@digame.com",
            "password": "demo",
            "first_name": "Demo",
            "last_name": "User",
            "is_active": True,
            "onboarding_completed": True,
            "detailed_bio": "Demo user for testing the Digame platform features.",
            "skills": json.dumps(["Leadership", "Project Management", "Strategic Planning"]),
            "kudos_count": 15
        },
        {
            "username": "sarah_demo",
            "email": "sarah@digame.com", 
            "password": "demo123",
            "first_name": "Sarah",
            "last_name": "Johnson",
            "is_active": True,
            "onboarding_completed": True,
            "detailed_bio": "Senior Product Manager with 8 years of experience in tech startups.",
            "skills": json.dumps(["Product Management", "Agile", "User Research", "Data Analysis"]),
            "kudos_count": 42
        },
        {
            "username": "alex_demo",
            "email": "alex@digame.com",
            "password": "demo123", 
            "first_name": "Alex",
            "last_name": "Chen",
            "is_active": True,
            "onboarding_completed": False,
            "detailed_bio": "Software Engineer transitioning to team leadership role.",
            "skills": json.dumps(["Software Development", "Python", "React", "Team Leadership"]),
            "kudos_count": 28
        },
        {
            "username": "guest",
            "email": "guest@digame.com",
            "password": "guest",
            "first_name": "Guest",
            "last_name": "User",
            "is_active": True,
            "onboarding_completed": False,
            "detailed_bio": "Guest user for exploring platform features.",
            "skills": json.dumps(["Exploring", "Learning"]),
            "kudos_count": 0
        }
    ]
    
    created_users = []
    
    for user_data in demo_users:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == user_data["username"]) | 
            (User.email == user_data["email"])
        ).first()
        
        if existing_user:
            print(f"User {user_data['username']} already exists, skipping...")
            continue
            
        # Create new user
        hashed_password = pwd_context.hash(user_data["password"])
        
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            is_active=user_data["is_active"],
            onboarding_completed=user_data["onboarding_completed"],
            detailed_bio=user_data["detailed_bio"],
            skills=user_data["skills"],
            kudos_count=user_data["kudos_count"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.add(new_user)
        created_users.append(user_data["username"])
        print(f"Created demo user: {user_data['username']} ({user_data['email']})")
    
    try:
        db.commit()
        print(f"\n✅ Successfully created {len(created_users)} demo users!")
        print("Demo credentials:")
        print("- Username: demo, Password: demo")
        print("- Username: sarah_demo, Password: demo123") 
        print("- Username: alex_demo, Password: demo123")
        print("- Username: guest, Password: guest")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating demo users: {e}")
        raise

def main():
    """Main function to seed demo users."""
    print("🌱 Seeding demo users for Digame platform...")
    
    try:
        # Get database session
        db = next(get_db())
        
        # Create demo users
        create_demo_users(db)
        
        # Close database session
        db.close()
        
        print("\n🎉 Demo user seeding completed successfully!")
        print("\nYou can now log in with:")
        print("- demo/demo (fully onboarded user)")
        print("- guest/guest (new user for onboarding testing)")
        
    except Exception as e:
        print(f"❌ Failed to seed demo users: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
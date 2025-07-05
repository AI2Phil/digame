#!/usr/bin/env python3
"""
Simple script to create a Platform Owner user with basic columns
"""

import sqlite3
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_platform_owner():
    """Create a Platform Owner user directly in SQLite"""
    
    # Platform Owner credentials
    email = "owner@digame.com"
    password = "PlatformOwner123!"
    username = "owner"
    
    print(f"Creating Platform Owner with email: {email}")
    
    # Connect to database
    conn = sqlite3.connect('digame.db')
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute("SELECT id, email FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            # Update existing user to be Platform Owner
            cursor.execute("""
                UPDATE users 
                SET is_platform_owner = 1, 
                    platform_owner_level = 3,
                    subscription_tier = 'platform_owner',
                    subscription_status = 'active',
                    is_active = 1,
                    email_verified = 1
                WHERE email = ?
            """, (email,))
            print(f"✅ Updated existing user {email} to Platform Owner")
        else:
            # Create new platform owner
            hashed_password = hash_password(password)
            
            cursor.execute("""
                INSERT INTO users (
                    username, email, hashed_password, 
                    is_platform_owner, platform_owner_level,
                    subscription_tier, subscription_status,
                    is_active, email_verified, created_at,
                    onboarding_completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                username, email, hashed_password,
                1, 3,  # is_platform_owner=True, level=3
                'platform_owner', 'active',
                1, 1,  # is_active=True, email_verified=True
                datetime.utcnow().isoformat(),
                1  # onboarding_completed=True
            ))
            print(f"✅ Created new Platform Owner: {email}")
        
        conn.commit()
        
        print(f"🔑 Password: {password}")
        print(f"👑 Platform Owner Level: 3")
        print(f"📧 Email: {email}")
        print(f"🆔 Username: {username}")
        print(f"\n🎯 You can now sign in with these credentials!")
        print(f"🚀 The comprehensive navigation should now work for this user!")
        
    except Exception as e:
        print(f"❌ Error creating Platform Owner: {str(e)}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_platform_owner()
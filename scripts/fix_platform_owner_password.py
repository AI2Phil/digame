#!/usr/bin/env python3

import sqlite3
from passlib.context import CryptContext

# Initialize password context (same as used in the app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def fix_platform_owner_password():
    """Fix the Platform Owner password to use proper bcrypt hashing"""
    
    # Connect to database
    conn = sqlite3.connect('digame.db')
    cursor = conn.cursor()
    
    try:
        # Hash the password properly using bcrypt
        password = "PlatformOwner123!"
        hashed_password = pwd_context.hash(password)
        
        print(f"🔐 Generating bcrypt hash for password...")
        print(f"📝 New hash: {hashed_password}")
        
        # Update the user's password
        cursor.execute("""
            UPDATE users 
            SET hashed_password = ? 
            WHERE email = 'owner@digame.com'
        """, (hashed_password,))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"✅ Successfully updated Platform Owner password hash!")
            print(f"🔑 Email: owner@digame.com")
            print(f"🔑 Password: {password}")
            print(f"🎯 The user can now log in with proper bcrypt authentication!")
        else:
            print(f"❌ No user found with email owner@digame.com")
            
    except Exception as e:
        print(f"❌ Error updating password: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_platform_owner_password()
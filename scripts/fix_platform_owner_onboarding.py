#!/usr/bin/env python3
"""
Fix the platform owner onboarding status
"""

import sqlite3
import os

def fix_platform_owner_onboarding():
    """Fix the onboarding status for the platform owner"""
    
    # The Node.js backend database is at backend/data/digame.db
    db_path = "backend/data/digame.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Backend database file does not exist: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Update the platform owner's onboarding status
        cursor.execute("""
            UPDATE users 
            SET onboardingCompleted = 1,
                onboardingData = '{"interests":["analytics","ai","productivity","team_management"],"goals":["productivity","data_insights","team_optimization"],"experienceLevel":"expert","teamChoice":"create_team"}'
            WHERE email = ? AND role = 'platform_owner'
        """, ("philip.a.oshea@gmail.com",))
        
        if cursor.rowcount > 0:
            print(f"✅ Updated onboarding status for platform owner")
            
            # Verify the update
            cursor.execute("SELECT email, username, role, onboardingCompleted, onboardingData FROM users WHERE email = ?", ("philip.a.oshea@gmail.com",))
            user = cursor.fetchone()
            
            if user:
                print(f"\n📋 Updated user details:")
                print(f"  Email: {user[0]}")
                print(f"  Username: {user[1]}")
                print(f"  Role: {user[2]}")
                print(f"  Onboarding Completed: {user[3]}")
                print(f"  Onboarding Data: {user[4]}")
        else:
            print(f"❌ No platform owner found with email: philip.a.oshea@gmail.com")
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔧 Fixing platform owner onboarding status...")
    print("=" * 60)
    fix_platform_owner_onboarding()
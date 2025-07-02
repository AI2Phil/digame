#!/usr/bin/env python3
"""
Get full details for a specific user
"""

import sqlite3
import os

def get_user_details(user_id):
    """Get full details for a specific user"""
    
    db_path = "digame.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get user details
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        user = cursor.fetchone()
        
        if user:
            # Get column names
            cursor.execute("PRAGMA table_info(users);")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            print(f"✅ User ID {user_id} details:")
            print("-" * 50)
            
            for i, value in enumerate(user):
                if column_names[i] == 'hashed_password' and value:
                    print(f"{column_names[i]}: {value[:30]}... (truncated for security)")
                else:
                    print(f"{column_names[i]}: {value}")
        else:
            print(f"❌ No user found with ID: {user_id}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Getting user details for ID 2 (poshea100@hotmail.com)...")
    print("=" * 60)
    get_user_details(2)
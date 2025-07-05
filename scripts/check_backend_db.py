#!/usr/bin/env python3
"""
Check the Node.js backend database for user credentials
"""

import sqlite3
import os

def check_backend_database():
    """Check the Node.js backend database"""
    
    # The Node.js backend database is at backend/data/digame.db
    db_path = "backend/data/digame.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Backend database file does not exist: {db_path}")
        return
    
    print(f"✅ Found backend database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Search for the specific email
        cursor.execute("SELECT * FROM users WHERE email = ?;", ("philip.a.oshea@gmail.com",))
        user = cursor.fetchone()
        
        if user:
            print(f"\n✅ Found user with email: philip.a.oshea@gmail.com")
            
            # Get column names
            cursor.execute("PRAGMA table_info(users);")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            print("\n📋 User details:")
            for i, value in enumerate(user):
                if column_names[i] == 'passwordHash' and value:
                    print(f"  {column_names[i]}: {value[:30]}... (truncated for security)")
                else:
                    print(f"  {column_names[i]}: {value}")
        else:
            print(f"\n❌ No user found with email: philip.a.oshea@gmail.com")
            
            # Show all users in backend database
            cursor.execute("SELECT id, email, username, firstName, lastName FROM users;")
            all_users = cursor.fetchall()
            
            if all_users:
                print(f"\n📋 All users in backend database:")
                for user_row in all_users:
                    print(f"  ID: {user_row[0]} | Email: {user_row[1]} | Username: {user_row[2]} | Name: {user_row[3]} {user_row[4]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Checking Node.js backend database for philip.a.oshea@gmail.com...")
    print("=" * 70)
    check_backend_database()
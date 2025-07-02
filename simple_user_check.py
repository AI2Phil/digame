#!/usr/bin/env python3
"""
Simple script to check users table directly
"""

import sqlite3
import os

def check_users_table():
    """Check the users table directly"""
    
    db_path = "digame.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file does not exist: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ Users table does not exist")
            
            # List all tables to see what we have
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"📋 Available tables ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]}")
            return
        
        print("✅ Users table exists")
        
        # Get table schema
        cursor.execute("PRAGMA table_info(users);")
        columns = cursor.fetchall()
        
        print("\n📋 Users table schema:")
        for col in columns:
            col_id, col_name, col_type, not_null, default_val, primary_key = col
            pk_marker = " (PK)" if primary_key else ""
            null_marker = " NOT NULL" if not_null else ""
            default_marker = f" DEFAULT {default_val}" if default_val else ""
            print(f"  - {col_name}: {col_type}{pk_marker}{null_marker}{default_marker}")
        
        # Get row count
        cursor.execute("SELECT COUNT(*) FROM users;")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total users: {count}")
        
        if count > 0:
            # Search for the specific email
            cursor.execute("SELECT * FROM users WHERE email = ?;", ("philip.a.oshea@gmail.com",))
            user = cursor.fetchone()
            
            if user:
                print(f"\n✅ Found user with email: philip.a.oshea@gmail.com")
                
                # Get column names for better display
                column_names = [description[0] for description in cursor.description]
                
                print("\n📋 User details:")
                for i, value in enumerate(user):
                    if column_names[i] == 'hashed_password' and value:
                        print(f"  {column_names[i]}: {value[:20]}... (truncated)")
                    else:
                        print(f"  {column_names[i]}: {value}")
            else:
                print(f"\n❌ No user found with email: philip.a.oshea@gmail.com")
                
                # Show all users
                cursor.execute("SELECT id, email, username FROM users LIMIT 10;")
                all_users = cursor.fetchall()
                
                if all_users:
                    print(f"\n📋 All users in database:")
                    for user_row in all_users:
                        print(f"  ID: {user_row[0]} | Email: {user_row[1]} | Username: {user_row[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Checking users table...")
    print("=" * 50)
    check_users_table()
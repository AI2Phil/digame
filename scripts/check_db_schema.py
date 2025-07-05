#!/usr/bin/env python3
"""
Script to check the actual database schema
"""

import sys
import os
import sqlite3

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import DATABASE_URL

def check_database_schema():
    """Check what tables and columns actually exist in the database"""
    
    # Extract the database file path from the URL
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if db_path.startswith("./"):
        db_path = db_path[2:]
    
    print(f"📁 Database file: {db_path}")
    
    # Check if database file exists
    if not os.path.exists(db_path):
        print(f"❌ Database file does not exist: {db_path}")
        return
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("📋 No tables found in database")
            return
        
        print(f"📋 Found {len(tables)} tables:")
        print("-" * 60)
        
        for table in tables:
            table_name = table[0]
            print(f"\n🔍 Table: {table_name}")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            if columns:
                print("   Columns:")
                for col in columns:
                    col_id, col_name, col_type, not_null, default_val, primary_key = col
                    pk_marker = " (PK)" if primary_key else ""
                    null_marker = " NOT NULL" if not_null else ""
                    default_marker = f" DEFAULT {default_val}" if default_val else ""
                    print(f"     - {col_name}: {col_type}{pk_marker}{null_marker}{default_marker}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"   Rows: {count}")
            
            # If it's the users table, show some sample data
            if table_name == "users" and count > 0:
                print("   Sample data:")
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
                rows = cursor.fetchall()
                for row in rows:
                    print(f"     {row}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    print("🔍 Checking database schema...")
    print("=" * 60)
    check_database_schema()
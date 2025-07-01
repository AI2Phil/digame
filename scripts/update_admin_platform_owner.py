#!/usr/bin/env python3
"""
Script to update admin user to Platform Owner status
"""

import os
import sys
sys.path.append('/app/digame')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://digame_user:digame_password@db:5432/digame_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_admin_to_platform_owner():
    """Update admin user to Platform Owner"""
    db = SessionLocal()
    try:
        # Update admin user directly with SQL
        result = db.execute(
            text("""
                UPDATE users 
                SET is_platform_owner = true, 
                    platform_owner_level = 3,
                    updated_at = NOW()
                WHERE email = 'admin@digame.com'
                RETURNING id, email, is_platform_owner, platform_owner_level
            """)
        )
        
        updated_user = result.fetchone()
        if updated_user:
            print(f"✅ Updated user {updated_user.email} to Platform Owner level {updated_user.platform_owner_level}")
            db.commit()
            return True
        else:
            print("❌ Admin user not found")
            return False
            
    except Exception as e:
        print(f"❌ Error updating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = update_admin_to_platform_owner()
    sys.exit(0 if success else 1)
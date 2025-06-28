"""
Platform Owner Setup Script
Initialize Platform Owner infrastructure and create first Platform Owner account
"""

import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import get_db
from app.models.user import User
from app.models.platform_roles import PlatformRole, UserPlatformRole
from app.services.platform_auth_service import get_password_hash


def create_platform_roles(db: Session):
    """Create the standard platform roles"""
    
    roles = [
        {
            "name": "Platform Admin",
            "level": 1,
            "description": "Basic platform administration access",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": False,
            "can_create_tenants": False,
            "can_manage_all_tenants": False,
            "can_access_all_data": False,
            "can_modify_platform_settings": False
        },
        {
            "name": "Platform Super Admin",
            "level": 2,
            "description": "Advanced platform administration with tenant management",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": True,
            "can_create_tenants": True,
            "can_manage_all_tenants": True,
            "can_access_all_data": True,
            "can_modify_platform_settings": False
        },
        {
            "name": "Platform Owner",
            "level": 3,
            "description": "Full platform ownership with all permissions",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": True,
            "can_create_tenants": True,
            "can_manage_all_tenants": True,
            "can_access_all_data": True,
            "can_modify_platform_settings": True
        }
    ]
    
    for role_data in roles:
        existing_role = db.query(PlatformRole).filter(PlatformRole.name == role_data["name"]).first()
        if not existing_role:
            role = PlatformRole(**role_data)
            db.add(role)
            print(f"Created platform role: {role_data['name']}")
    
    db.commit()


def create_initial_platform_owner(db: Session):
    """Create the initial platform owner"""
    
    # Get credentials from environment or use defaults
    email = os.getenv("PLATFORM_OWNER_EMAIL", "owner@digame.com")
    password = os.getenv("PLATFORM_OWNER_PASSWORD", "PlatformOwner123!")
    
    print(f"Setting up Platform Owner with email: {email}")
    
    # Check if platform owner already exists
    existing_owner = db.query(User).filter(
        User.email == email,
        User.is_platform_owner == True
    ).first()
    
    if existing_owner:
        print(f"Platform owner {email} already exists")
        return existing_owner
    
    # Create platform owner
    hashed_password = get_password_hash(password)
    
    platform_owner = User(
        email=email,
        username=email.split('@')[0],
        hashed_password=hashed_password,
        is_platform_owner=True,
        platform_owner_level=3,
        tenant_id=None,  # Platform owners don't belong to tenants
        subscription_tier="platform_owner",
        subscription_status="active",
        is_active=True,
        email_verified=True,
        created_at=datetime.utcnow()
    )
    
    db.add(platform_owner)
    db.commit()
    db.refresh(platform_owner)
    
    # Assign Platform Owner role
    platform_owner_role = db.query(PlatformRole).filter(PlatformRole.level == 3).first()
    if platform_owner_role:
        user_role = UserPlatformRole(
            user_id=platform_owner.id,
            platform_role_id=platform_owner_role.id,
            assigned_by=platform_owner.id  # Self-assigned
        )
        db.add(user_role)
        db.commit()
    
    print(f"Created initial platform owner: {email}")
    return platform_owner


def main():
    """Main setup function"""
    print("🚀 Setting up Platform Owner infrastructure...")
    
    try:
        db = next(get_db())
        
        # Create platform roles
        print("\n📋 Creating platform roles...")
        create_platform_roles(db)
        
        # Create initial platform owner
        print("\n👑 Creating initial platform owner...")
        platform_owner = create_initial_platform_owner(db)
        
        if platform_owner:
            print(f"\n✅ Platform Owner setup complete!")
            print(f"📧 Email: {platform_owner.email}")
            print(f"🔑 Platform Owner Level: {platform_owner.platform_owner_level}")
            print(f"📅 Created at: {platform_owner.created_at}")
            print(f"\n🔐 You can now log in with the Platform Owner credentials")
            print(f"🎯 Access platform management at: /platform/overview")
            print(f"\n⚠️  Remember to change the default password in production!")
        
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if 'db' in locals():
            db.close()


if __name__ == "__main__":
    main()
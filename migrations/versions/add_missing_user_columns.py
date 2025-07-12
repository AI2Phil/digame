"""Add missing user columns

Revision ID: add_missing_user_columns
Revises: 001_initial_schema
Create Date: 2025-01-12 11:39:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_missing_user_columns'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to users table."""
    
    # Check if columns exist before adding them
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Get existing columns
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Add missing columns only if they don't exist
    columns_to_add = [
        ('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), True, True),
        ('is_guest', sa.Boolean(), None, False, True),
        ('guest_expires_at', sa.DateTime(), None, True, True),
        ('is_platform_owner', sa.Boolean(), None, False, False),
        ('platform_owner_level', sa.Integer(), None, 0, True),
        ('subscription_tier', sa.String(), None, 'free', True),
        ('subscription_status', sa.String(), None, 'active', True),
        ('subscription_expires', sa.DateTime(), None, True, True),
        ('is_founding_member', sa.Boolean(), None, False, True),
        ('founding_member_enrolled_at', sa.DateTime(), None, True, True),
        ('founding_member_discount_percent', sa.Integer(), None, True, True),
        ('founding_member_monthly_price', sa.Float(), None, True, True),
        ('subscription_updated_at', sa.DateTime(), None, True, True),
        ('last_login', sa.DateTime(), None, True, True),
        ('failed_login_attempts', sa.Integer(), None, 0, True),
        ('account_locked_until', sa.DateTime(), None, True, True),
        ('password_changed_at', sa.DateTime(), None, True, True),
        ('email_verified', sa.Boolean(), None, False, True),
        ('email_verification_token', sa.String(), None, True, True),
        ('email_verification_sent_at', sa.DateTime(), None, True, True),
        ('upgraded_from_guest', sa.Boolean(), None, False, True),
        ('upgrade_date', sa.DateTime(), None, True, True),
        ('created_by', sa.Integer(), sa.ForeignKey('users.id'), True, True),
        ('onboarding_completed', sa.Boolean(), None, False, True),
        ('onboarding_data', sa.Text(), None, True, True),
        ('onboarding_step', sa.Integer(), None, 0, True),
        ('detailed_bio', sa.Text(), None, True, True),
        ('contact_info', sa.Text(), None, True, True),
        ('skills_json', sa.Text(), None, True, True),
        ('kudos_count', sa.Integer(), None, 0, True),
    ]
    
    for col_name, col_type, foreign_key, default_val, nullable in columns_to_add:
        if col_name not in existing_columns:
            print(f"Adding column: {col_name}")
            if foreign_key:
                op.add_column('users', sa.Column(col_name, col_type, foreign_key, nullable=nullable, default=default_val))
            else:
                op.add_column('users', sa.Column(col_name, col_type, nullable=nullable, default=default_val))
        else:
            print(f"Column {col_name} already exists, skipping")
    
    # Add indexes for new columns that need them
    indexes_to_add = [
        ('ix_users_tenant_id', ['tenant_id']),
        ('ix_users_is_guest', ['is_guest']),
        ('ix_users_subscription_tier', ['subscription_tier']),
        ('ix_users_email_verified', ['email_verified']),
    ]
    
    existing_indexes = [idx['name'] for idx in inspector.get_indexes('users')]
    
    for idx_name, columns in indexes_to_add:
        if idx_name not in existing_indexes:
            print(f"Adding index: {idx_name}")
            op.create_index(idx_name, 'users', columns, unique=False)
        else:
            print(f"Index {idx_name} already exists, skipping")
    
    # Fix is_active column type (change from Integer to Boolean if needed)
    if 'is_active' in existing_columns:
        # Check current column type
        columns_info = inspector.get_columns('users')
        is_active_col = next((col for col in columns_info if col['name'] == 'is_active'), None)
        
        if is_active_col and str(is_active_col['type']) != 'BOOLEAN':
            print("Converting is_active from Integer to Boolean")
            # First update existing data - use integers instead of boolean literals
            op.execute("UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 1 ELSE 0 END WHERE is_active IS NOT NULL")
            # Then alter column type using USING clause for PostgreSQL compatibility
            op.execute("ALTER TABLE users ALTER COLUMN is_active TYPE boolean USING (is_active = 1)")


def downgrade() -> None:
    """Remove added columns from users table."""
    
    # Remove indexes first
    indexes_to_remove = [
        'ix_users_tenant_id',
        'ix_users_is_guest', 
        'ix_users_subscription_tier',
        'ix_users_email_verified',
    ]
    
    for idx_name in indexes_to_remove:
        try:
            op.drop_index(idx_name, table_name='users')
        except Exception:
            pass  # Index might not exist
    
    # Remove columns
    columns_to_remove = [
        'kudos_count',
        'skills_json',
        'contact_info',
        'detailed_bio',
        'onboarding_step',
        'onboarding_data',
        'onboarding_completed',
        'created_by',
        'upgrade_date',
        'upgraded_from_guest',
        'email_verification_sent_at',
        'email_verification_token',
        'email_verified',
        'password_changed_at',
        'account_locked_until',
        'failed_login_attempts',
        'last_login',
        'subscription_updated_at',
        'founding_member_monthly_price',
        'founding_member_discount_percent',
        'founding_member_enrolled_at',
        'is_founding_member',
        'subscription_expires',
        'subscription_status',
        'subscription_tier',
        'platform_owner_level',
        'is_platform_owner',
        'guest_expires_at',
        'is_guest',
        'tenant_id',
    ]
    
    for col_name in columns_to_remove:
        try:
            op.drop_column('users', col_name)
        except Exception:
            pass  # Column might not exist
    
    # Revert is_active back to Integer if needed
    try:
        op.alter_column('users', 'is_active', type_=sa.Integer(), nullable=True)
    except Exception:
        pass
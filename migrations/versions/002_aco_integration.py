"""ACO Integration Migration

Revision ID: 002_aco_integration
Revises: 001_platform_owner_infra
Create Date: 2025-06-28 14:56:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_aco_integration'
down_revision = '001_platform_owner_infra'
branch_labels = None
depends_on = None


def upgrade():
    """
    Apply ACO Integration database changes
    """
    
    # Add founding member fields to users table
    op.add_column('users', sa.Column('founding_member_enrolled_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('founding_member_discount_percent', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('founding_member_monthly_price', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('subscription_updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add owner_id to tenants table
    op.add_column('tenants', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_tenants_owner_id', 'tenants', 'users', ['owner_id'], ['id'])
    op.create_index('ix_tenants_owner_id', 'tenants', ['owner_id'])
    
    # Add ACO-specific columns to existing platform_usage_metrics table
    # (Table was already created in 001_platform_owner_infra migration)
    try:
        op.add_column('platform_usage_metrics', sa.Column('metric_metadata', sa.JSON(), nullable=True))
    except:
        pass  # Column might already exist
    
    # Add indexes for founding member fields (column was added in 001_platform_owner_infra)
    try:
        op.create_index('ix_users_is_founding_member', 'users', ['is_founding_member'])
    except:
        pass  # Index might already exist
    
    print("✅ ACO Integration migration completed successfully")


def downgrade():
    """
    Reverse ACO Integration database changes
    """
    
    # Remove ACO-specific columns from platform_usage_metrics table
    # (Don't drop the table as it was created in 001_platform_owner_infra)
    try:
        op.drop_column('platform_usage_metrics', 'metric_metadata')
    except:
        pass  # Column might not exist
    
    # Remove owner_id from tenants table
    try:
        op.drop_index('ix_tenants_owner_id', 'tenants')
    except:
        pass
    try:
        op.drop_constraint('fk_tenants_owner_id', 'tenants', type_='foreignkey')
    except:
        pass
    op.drop_column('tenants', 'owner_id')
    
    # Remove founding member fields from users table (but keep is_founding_member as it's from 001_platform_owner_infra)
    try:
        op.drop_index('ix_users_is_founding_member', 'users')
    except:
        pass  # Index might not exist
    op.drop_column('users', 'subscription_updated_at')
    op.drop_column('users', 'founding_member_monthly_price')
    op.drop_column('users', 'founding_member_discount_percent')
    op.drop_column('users', 'founding_member_enrolled_at')
    
    print("✅ ACO Integration migration rollback completed successfully")
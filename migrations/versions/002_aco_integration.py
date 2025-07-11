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
    
    # Check if platform_usage_metrics table already exists
    from sqlalchemy import inspect
    from alembic import context
    
    # Get the current connection
    connection = context.get_bind()
    inspector = inspect(connection)
    
    # Only create platform_usage_metrics table if it doesn't exist
    if 'platform_usage_metrics' not in inspector.get_table_names():
        # Create platform_usage_metrics table
        op.create_table('platform_usage_metrics',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('tenant_id', sa.Integer(), nullable=True),
            sa.Column('metric_type', sa.String(length=100), nullable=False),
            sa.Column('metric_value', sa.Float(), nullable=True, default=1.0),
            sa.Column('metric_metadata', sa.JSON(), nullable=True),
            sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        # Create indexes for the new table
        op.create_index('ix_platform_usage_metrics_id', 'platform_usage_metrics', ['id'])
        op.create_index('ix_platform_usage_metrics_user_id', 'platform_usage_metrics', ['user_id'])
        op.create_index('ix_platform_usage_metrics_tenant_id', 'platform_usage_metrics', ['tenant_id'])
        op.create_index('ix_platform_usage_metrics_metric_type', 'platform_usage_metrics', ['metric_type'])
        op.create_index('ix_platform_usage_metrics_timestamp', 'platform_usage_metrics', ['timestamp'])
    else:
        # Table already exists, just create the indexes if they don't exist
        try:
            op.create_index('ix_platform_usage_metrics_id', 'platform_usage_metrics', ['id'])
        except:
            pass  # Index might already exist
        try:
            op.create_index('ix_platform_usage_metrics_user_id', 'platform_usage_metrics', ['user_id'])
        except:
            pass
        try:
            op.create_index('ix_platform_usage_metrics_tenant_id', 'platform_usage_metrics', ['tenant_id'])
        except:
            pass
        try:
            op.create_index('ix_platform_usage_metrics_metric_type', 'platform_usage_metrics', ['metric_type'])
        except:
            pass
        try:
            op.create_index('ix_platform_usage_metrics_timestamp', 'platform_usage_metrics', ['timestamp'])
        except:
            pass
    
    # Add indexes for founding member fields
    op.create_index('ix_users_is_founding_member', 'users', ['is_founding_member'])
    
    print("✅ ACO Integration migration completed successfully")


def downgrade():
    """
    Reverse ACO Integration database changes
    """
    
    # Drop platform_usage_metrics table
    op.drop_index('ix_platform_usage_metrics_timestamp', 'platform_usage_metrics')
    op.drop_index('ix_platform_usage_metrics_metric_type', 'platform_usage_metrics')
    op.drop_index('ix_platform_usage_metrics_tenant_id', 'platform_usage_metrics')
    op.drop_index('ix_platform_usage_metrics_user_id', 'platform_usage_metrics')
    op.drop_index('ix_platform_usage_metrics_id', 'platform_usage_metrics')
    op.drop_table('platform_usage_metrics')
    
    # Remove owner_id from tenants table
    op.drop_index('ix_tenants_owner_id', 'tenants')
    op.drop_constraint('fk_tenants_owner_id', 'tenants', type_='foreignkey')
    op.drop_column('tenants', 'owner_id')
    
    # Remove founding member fields from users table
    op.drop_index('ix_users_is_founding_member', 'users')
    op.drop_column('users', 'subscription_updated_at')
    op.drop_column('users', 'founding_member_monthly_price')
    op.drop_column('users', 'founding_member_discount_percent')
    op.drop_column('users', 'founding_member_enrolled_at')
    
    print("✅ ACO Integration migration rollback completed successfully")
"""Platform Owner Infrastructure

Revision ID: 001_platform_owner
Revises: 
Create Date: 2025-06-28 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001_platform_owner'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enhance users table with Platform Owner fields
    op.add_column('users', sa.Column('is_platform_owner', sa.Boolean(), default=False, nullable=False))
    op.add_column('users', sa.Column('platform_owner_level', sa.Integer(), default=0))
    op.add_column('users', sa.Column('subscription_tier', sa.String(), default='free'))
    op.add_column('users', sa.Column('subscription_status', sa.String(), default='active'))
    op.add_column('users', sa.Column('subscription_expires', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('is_founding_member', sa.Boolean(), default=False))
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), default=0))
    op.add_column('users', sa.Column('account_locked_until', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('password_changed_at', sa.DateTime(), default=sa.func.now()))
    op.add_column('users', sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    
    # Enhance tenants table with Platform Owner management
    op.add_column('tenants', sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('tenants', sa.Column('managed_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('tenants', sa.Column('current_users', sa.Integer(), default=0))
    op.add_column('tenants', sa.Column('current_storage_gb', sa.Float(), default=0.0))
    op.add_column('tenants', sa.Column('current_api_calls_monthly', sa.Integer(), default=0))
    op.add_column('tenants', sa.Column('last_activity', sa.DateTime(), default=sa.func.now()))
    op.add_column('tenants', sa.Column('billing_email', sa.String(255), nullable=True))
    
    # Create platform_roles table
    op.create_table('platform_roles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), unique=True, nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('can_create_tenants', sa.Boolean(), default=False),
        sa.Column('can_manage_all_tenants', sa.Boolean(), default=False),
        sa.Column('can_access_all_data', sa.Boolean(), default=False),
        sa.Column('can_modify_platform_settings', sa.Boolean(), default=False),
        sa.Column('can_view_platform_analytics', sa.Boolean(), default=False),
        sa.Column('can_manage_platform_users', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    
    # Create user_platform_roles table
    op.create_table('user_platform_roles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('platform_role_id', sa.Integer(), sa.ForeignKey('platform_roles.id'), nullable=False),
        sa.Column('assigned_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), default=sa.func.now())
    )
    
    # Create platform_usage_metrics table
    op.create_table('platform_usage_metrics',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('metric_type', sa.String(), nullable=False),
        sa.Column('metric_category', sa.String(), nullable=False),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('subscription_tier', sa.String(), nullable=True),
        sa.Column('feature_name', sa.String(), nullable=True),
        sa.Column('endpoint_path', sa.String(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), default=sa.func.now(), index=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True)
    )
    
    # Create platform_health_metrics table
    op.create_table('platform_health_metrics',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('current_value', sa.Float(), nullable=False),
        sa.Column('threshold_warning', sa.Float(), nullable=True),
        sa.Column('threshold_critical', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), default='healthy'),
        sa.Column('service_name', sa.String(), nullable=True),
        sa.Column('component_name', sa.String(), nullable=True),
        sa.Column('measured_at', sa.DateTime(), default=sa.func.now(), index=True)
    )
    
    # Create tenant_analytics_summary table
    op.create_table('tenant_analytics_summary',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('total_users', sa.Integer(), default=0),
        sa.Column('active_users_daily', sa.Integer(), default=0),
        sa.Column('active_users_weekly', sa.Integer(), default=0),
        sa.Column('active_users_monthly', sa.Integer(), default=0),
        sa.Column('total_api_calls', sa.Integer(), default=0),
        sa.Column('total_storage_gb', sa.Float(), default=0.0),
        sa.Column('total_features_used', sa.Integer(), default=0),
        sa.Column('avg_session_duration', sa.Float(), default=0.0),
        sa.Column('total_logins', sa.Integer(), default=0),
        sa.Column('feature_adoption_rate', sa.Float(), default=0.0),
        sa.Column('monthly_revenue', sa.Float(), default=0.0),
        sa.Column('lifetime_value', sa.Float(), default=0.0),
        sa.Column('summary_date', sa.Date(), default=sa.func.current_date(), index=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    # Drop new tables
    op.drop_table('tenant_analytics_summary')
    op.drop_table('platform_health_metrics')
    op.drop_table('platform_usage_metrics')
    op.drop_table('user_platform_roles')
    op.drop_table('platform_roles')
    
    # Remove columns from tenants
    op.drop_column('tenants', 'billing_email')
    op.drop_column('tenants', 'last_activity')
    op.drop_column('tenants', 'current_api_calls_monthly')
    op.drop_column('tenants', 'current_storage_gb')
    op.drop_column('tenants', 'current_users')
    op.drop_column('tenants', 'managed_by')
    op.drop_column('tenants', 'created_by')
    
    # Remove columns from users
    op.drop_column('users', 'created_by')
    op.drop_column('users', 'password_changed_at')
    op.drop_column('users', 'account_locked_until')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'is_founding_member')
    op.drop_column('users', 'subscription_expires')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'subscription_tier')
    op.drop_column('users', 'platform_owner_level')
    op.drop_column('users', 'is_platform_owner')
"""Platform Owner Infrastructure

Revision ID: 001_platform_owner_infra
Revises: 
Create Date: 2025-06-28 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001_platform_owner_infra'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Check existing columns to avoid duplicates
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_user_columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Enhance users table with Platform Owner fields - only add if they don't exist
    user_columns_to_add = [
        ('is_platform_owner', sa.Boolean(), False, False),
        ('platform_owner_level', sa.Integer(), 0, True),
        ('subscription_tier', sa.String(), 'free', True),
        ('subscription_status', sa.String(), 'active', True),
        ('subscription_expires', sa.DateTime(), None, True),
        ('is_founding_member', sa.Boolean(), False, True),
        ('last_login', sa.DateTime(), None, True),
        ('failed_login_attempts', sa.Integer(), 0, True),
        ('account_locked_until', sa.DateTime(), None, True),
        ('password_changed_at', sa.DateTime(), sa.func.now(), True),
        ('created_by', sa.Integer(), None, True),
    ]
    
    for col_name, col_type, default_val, nullable in user_columns_to_add:
        if col_name not in existing_user_columns:
            print(f"Adding column {col_name} to users table")
            try:
                if col_name == 'created_by':
                    op.add_column('users', sa.Column(col_name, col_type, sa.ForeignKey('users.id'), nullable=nullable, default=default_val))
                else:
                    op.add_column('users', sa.Column(col_name, col_type, nullable=nullable, default=default_val))
            except Exception as e:
                print(f"Warning: Could not add column {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists in users table, skipping")
    
    # Enhance tenants table with Platform Owner management - only add if they don't exist
    existing_tenant_columns = [col['name'] for col in inspector.get_columns('tenants')]
    tenant_columns_to_add = [
        ('created_by', sa.Integer(), None, True),
        ('managed_by', sa.Integer(), None, True),
        ('current_users', sa.Integer(), 0, True),
        ('current_storage_gb', sa.Float(), 0.0, True),
        ('current_api_calls_monthly', sa.Integer(), 0, True),
        ('last_activity', sa.DateTime(), sa.func.now(), True),
        ('billing_email', sa.String(255), None, True),
    ]
    
    for col_name, col_type, default_val, nullable in tenant_columns_to_add:
        if col_name not in existing_tenant_columns:
            print(f"Adding column {col_name} to tenants table")
            try:
                if col_name in ['created_by', 'managed_by']:
                    op.add_column('tenants', sa.Column(col_name, col_type, sa.ForeignKey('users.id'), nullable=nullable, default=default_val))
                else:
                    op.add_column('tenants', sa.Column(col_name, col_type, nullable=nullable, default=default_val))
            except Exception as e:
                print(f"Warning: Could not add column {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists in tenants table, skipping")
    
    # Create platform_roles table if it doesn't exist
    existing_tables = inspector.get_table_names()
    if 'platform_roles' not in existing_tables:
        print("Creating platform_roles table")
        try:
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
            print("✓ Created platform_roles table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("✓ platform_roles table already exists")
            else:
                print(f"✗ Error creating platform_roles table: {e}")
                raise  # Re-raise to abort transaction properly
    else:
        print("✓ platform_roles table already exists")
    
    # Create user_platform_roles table if it doesn't exist
    if 'user_platform_roles' not in existing_tables:
        print("Creating user_platform_roles table")
        try:
            op.create_table('user_platform_roles',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('platform_role_id', sa.Integer(), sa.ForeignKey('platform_roles.id'), nullable=False),
            sa.Column('assigned_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('assigned_at', sa.DateTime(), default=sa.func.now())
            )
            print("✓ Created user_platform_roles table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("✓ user_platform_roles table already exists")
            else:
                print(f"✗ Error creating user_platform_roles table: {e}")
                raise  # Re-raise to abort transaction properly
    else:
        print("✓ user_platform_roles table already exists")
    
    # Create platform_usage_metrics table if it doesn't exist
    if 'platform_usage_metrics' not in existing_tables:
        print("Creating platform_usage_metrics table")
        try:
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
            print("✓ Created platform_usage_metrics table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("✓ platform_usage_metrics table already exists")
            else:
                print(f"✗ Error creating platform_usage_metrics table: {e}")
                raise  # Re-raise to abort transaction properly
    else:
        print("✓ platform_usage_metrics table already exists")
    
    # Create platform_health_metrics table if it doesn't exist
    if 'platform_health_metrics' not in existing_tables:
        print("Creating platform_health_metrics table")
        try:
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
            print("✓ Created platform_health_metrics table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("✓ platform_health_metrics table already exists")
            else:
                print(f"✗ Error creating platform_health_metrics table: {e}")
                raise  # Re-raise to abort transaction properly
    else:
        print("✓ platform_health_metrics table already exists")
    
    # Create tenant_analytics_summary table if it doesn't exist
    if 'tenant_analytics_summary' not in existing_tables:
        print("Creating tenant_analytics_summary table")
        try:
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
            print("✓ Created tenant_analytics_summary table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("✓ tenant_analytics_summary table already exists")
            else:
                print(f"✗ Error creating tenant_analytics_summary table: {e}")
                raise  # Re-raise to abort transaction properly
    else:
        print("✓ tenant_analytics_summary table already exists")

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
"""Create base schema with all core tables

Revision ID: 6c5ca693e676
Revises: 
Create Date: 2025-07-12 22:04:50.660884

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6c5ca693e676'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create base schema with all core tables."""
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def table_exists(table_name):
        """Check if a table exists using database-agnostic SQLAlchemy inspector"""
        try:
            from sqlalchemy import inspect
            inspector = inspect(connection)
            return table_name in inspector.get_table_names()
        except Exception:
            # Fallback: try to query the table directly
            try:
                connection.execute(sa.text(f"SELECT 1 FROM {table_name} LIMIT 1"))
                return True
            except Exception:
                return False
    
    def create_table_safe(table_name, create_func):
        """Safely create a table, handling conflicts"""
        if not table_exists(table_name):
            try:
                create_func()
                print(f"✓ Created table: {table_name}")
            except ProgrammingError as e:
                if "already exists" in str(e).lower():
                    print(f"✓ Table {table_name} already exists")
                else:
                    raise
        else:
            print(f"✓ Table {table_name} already exists")
    
    def index_exists(index_name):
        """Check if an index exists using database-agnostic SQLAlchemy inspector"""
        try:
            from sqlalchemy import inspect
            inspector = inspect(connection)
            # Get all indexes for all tables
            for table_name in inspector.get_table_names():
                indexes = inspector.get_indexes(table_name)
                for index in indexes:
                    if index['name'] == index_name:
                        return True
            return False
        except Exception:
            return False
    
    def column_exists(table_name, column_name):
        """Check if a column exists in a table"""
        try:
            from sqlalchemy import inspect
            inspector = inspect(connection)
            if table_name in inspector.get_table_names():
                columns = inspector.get_columns(table_name)
                return any(col['name'] == column_name for col in columns)
            return False
        except Exception:
            return False
    
    def create_index_safe(index_name, table_name, columns, unique=False):
        """Safely create an index, handling conflicts and missing columns"""
        # Check if all columns exist
        for column in columns:
            if not column_exists(table_name, column):
                print(f"✓ Skipping index {index_name}: column '{column}' does not exist in table '{table_name}'")
                return
        
        if not index_exists(index_name):
            try:
                if unique:
                    op.create_index(index_name, table_name, columns, unique=True)
                else:
                    op.create_index(index_name, table_name, columns, unique=False)
                print(f"✓ Created index: {index_name}")
            except ProgrammingError as e:
                if "already exists" in str(e).lower() or "no such column" in str(e).lower():
                    print(f"✓ Index {index_name} already exists or column missing")
                else:
                    raise
        else:
            print(f"✓ Index {index_name} already exists")
    
    # Create tenants table first (referenced by users)
    def create_tenants():
        op.create_table('tenants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_uuid', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=False),
        sa.Column('subdomain', sa.String(length=100), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('branding', sa.JSON(), nullable=True),
        sa.Column('subscription_tier', sa.String(length=50), nullable=True),
        sa.Column('subscription_status', sa.String(length=50), nullable=True),
        sa.Column('subscription_expires', sa.DateTime(), nullable=True),
        sa.Column('billing_email', sa.String(length=255), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('managed_by', sa.Integer(), nullable=True),
        sa.Column('max_users', sa.Integer(), nullable=True),
        sa.Column('max_storage_gb', sa.Integer(), nullable=True),
        sa.Column('max_api_calls_monthly', sa.Integer(), nullable=True),
        sa.Column('current_users', sa.Integer(), nullable=True),
        sa.Column('current_storage_gb', sa.Float(), nullable=True),
        sa.Column('current_api_calls_monthly', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_trial', sa.Boolean(), nullable=True),
        sa.Column('trial_ends_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.Column('admin_email', sa.String(length=255), nullable=False),
        sa.Column('admin_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('tenants', create_tenants)
    
    if table_exists('tenants'):
        create_index_safe(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
        create_index_safe(op.f('ix_tenants_name'), 'tenants', ['name'], unique=False)
        create_index_safe(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)
        create_index_safe(op.f('ix_tenants_domain'), 'tenants', ['domain'], unique=True)
        create_index_safe(op.f('ix_tenants_subdomain'), 'tenants', ['subdomain'], unique=True)
        create_index_safe(op.f('ix_tenants_tenant_uuid'), 'tenants', ['tenant_uuid'], unique=True)

    # Create users table
    def create_users():
        op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_guest', sa.Boolean(), nullable=True),
        sa.Column('guest_expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_platform_owner', sa.Boolean(), nullable=False),
        sa.Column('platform_owner_level', sa.Integer(), nullable=True),
        sa.Column('subscription_tier', sa.String(), nullable=True),
        sa.Column('subscription_status', sa.String(), nullable=True),
        sa.Column('subscription_expires', sa.DateTime(), nullable=True),
        sa.Column('is_founding_member', sa.Boolean(), nullable=True),
        sa.Column('founding_member_enrolled_at', sa.DateTime(), nullable=True),
        sa.Column('founding_member_discount_percent', sa.Integer(), nullable=True),
        sa.Column('founding_member_monthly_price', sa.Float(), nullable=True),
        sa.Column('subscription_updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=True),
        sa.Column('account_locked_until', sa.DateTime(), nullable=True),
        sa.Column('password_changed_at', sa.DateTime(), nullable=True),
        sa.Column('email_verified', sa.Boolean(), nullable=True),
        sa.Column('email_verification_token', sa.String(), nullable=True),
        sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True),
        sa.Column('upgraded_from_guest', sa.Boolean(), nullable=True),
        sa.Column('upgrade_date', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=True),
        sa.Column('onboarding_data', sa.Text(), nullable=True),
        sa.Column('onboarding_step', sa.Integer(), nullable=True),
        sa.Column('detailed_bio', sa.Text(), nullable=True),
        sa.Column('contact_info', sa.Text(), nullable=True),
        sa.Column('skills_json', sa.Text(), nullable=True),
        sa.Column('kudos_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('users', create_users)
    
    if table_exists('users'):
        create_index_safe(op.f('ix_users_email'), 'users', ['email'], unique=True)
        create_index_safe(op.f('ix_users_id'), 'users', ['id'], unique=False)
        create_index_safe(op.f('ix_users_tenant_id'), 'users', ['tenant_id'], unique=False)
        create_index_safe(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create user_profiles table
    def create_user_profiles():
        op.create_table('user_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('learning_goals', sa.Text(), nullable=True),
        sa.Column('interests', sa.JSON(), nullable=True),
        sa.Column('mentorship_preferences', sa.JSON(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('linkedin_url', sa.String(length=255), nullable=True),
        sa.Column('github_url', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
    
    create_table_safe('user_profiles', create_user_profiles)
    
    if table_exists('user_profiles'):
        create_index_safe(op.f('ix_user_profiles_id'), 'user_profiles', ['id'], unique=False)

    # Create roles table
    def create_roles():
        op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('roles', create_roles)
    
    if table_exists('roles'):
        create_index_safe(op.f('ix_roles_id'), 'roles', ['id'], unique=False)
        create_index_safe(op.f('ix_roles_name'), 'roles', ['name'], unique=True)
        create_index_safe(op.f('ix_roles_tenant_id'), 'roles', ['tenant_id'], unique=False)

    # Create permissions table
    def create_permissions():
        op.create_table('permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('permissions', create_permissions)
    
    if table_exists('permissions'):
        create_index_safe(op.f('ix_permissions_id'), 'permissions', ['id'], unique=False)
        create_index_safe(op.f('ix_permissions_name'), 'permissions', ['name'], unique=True)

    # Create user_roles association table
    def create_user_roles():
        op.create_table('user_roles',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('user_id', 'role_id')
        )
    
    create_table_safe('user_roles', create_user_roles)

    # Create role_permissions association table
    def create_role_permissions():
        op.create_table('role_permissions',
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
            sa.PrimaryKeyConstraint('role_id', 'permission_id')
        )
    
    create_table_safe('role_permissions', create_role_permissions)

    # Create user_role_assignments table (enhanced UserRole model)
    def create_user_role_assignments():
        op.create_table('user_role_assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('assigned_by', sa.Integer(), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'role_id', 'tenant_id', name='unique_user_role_tenant')
        )
    
    create_table_safe('user_role_assignments', create_user_role_assignments)
    
    if table_exists('user_role_assignments'):
        create_index_safe(op.f('ix_user_role_assignments_id'), 'user_role_assignments', ['id'], unique=False)
        create_index_safe(op.f('ix_user_role_assignments_role_id'), 'user_role_assignments', ['role_id'], unique=False)
        create_index_safe(op.f('ix_user_role_assignments_tenant_id'), 'user_role_assignments', ['tenant_id'], unique=False)
        create_index_safe(op.f('ix_user_role_assignments_user_id'), 'user_role_assignments', ['user_id'], unique=False)

    # Create tasks table
    def create_tasks():
        op.create_table('tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('process_note_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=True),
        sa.Column('source_identifier', sa.String(length=255), nullable=True),
        sa.Column('priority_score', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('due_date_inferred', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('estimated_effort_hours', sa.Float(), nullable=True),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.Column('dependencies', sa.JSON(), nullable=True),
        sa.Column('assigned_resource_id', sa.Integer(), nullable=True),
        sa.Column('calendar_event_id', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['assigned_resource_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('tasks', create_tasks)
    
    if table_exists('tasks'):
        create_index_safe(op.f('ix_tasks_assigned_resource_id'), 'tasks', ['assigned_resource_id'], unique=False)
        create_index_safe(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
        create_index_safe(op.f('ix_tasks_process_note_id'), 'tasks', ['process_note_id'], unique=False)
        create_index_safe(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)

    # Create tenant_settings table
    def create_tenant_settings():
        op.create_table('tenant_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('value_type', sa.String(length=20), nullable=True),
        sa.Column('is_encrypted', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('tenant_settings', create_tenant_settings)
    
    if table_exists('tenant_settings'):
        create_index_safe(op.f('ix_tenant_settings_category'), 'tenant_settings', ['category'], unique=False)
        create_index_safe(op.f('ix_tenant_settings_id'), 'tenant_settings', ['id'], unique=False)
        create_index_safe(op.f('ix_tenant_settings_key'), 'tenant_settings', ['key'], unique=False)
        create_index_safe(op.f('ix_tenant_settings_tenant_id'), 'tenant_settings', ['tenant_id'], unique=False)

    # Create tenant_invitations table
    def create_tenant_invitations():
        op.create_table('tenant_invitations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('invited_by_user_id', sa.Integer(), nullable=False),
        sa.Column('invitation_token', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['invited_by_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('tenant_invitations', create_tenant_invitations)
    
    if table_exists('tenant_invitations'):
        create_index_safe(op.f('ix_tenant_invitations_email'), 'tenant_invitations', ['email'], unique=False)
        create_index_safe(op.f('ix_tenant_invitations_id'), 'tenant_invitations', ['id'], unique=False)
        create_index_safe(op.f('ix_tenant_invitations_invitation_token'), 'tenant_invitations', ['invitation_token'], unique=True)
        create_index_safe(op.f('ix_tenant_invitations_tenant_id'), 'tenant_invitations', ['tenant_id'], unique=False)

    # Create tenant_audit_logs table
    def create_tenant_audit_logs():
        op.create_table('tenant_audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=True),
        sa.Column('resource_id', sa.String(length=100), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    create_table_safe('tenant_audit_logs', create_tenant_audit_logs)
    
    if table_exists('tenant_audit_logs'):
        create_index_safe(op.f('ix_tenant_audit_logs_action'), 'tenant_audit_logs', ['action'], unique=False)
        create_index_safe(op.f('ix_tenant_audit_logs_created_at'), 'tenant_audit_logs', ['created_at'], unique=False)
        create_index_safe(op.f('ix_tenant_audit_logs_id'), 'tenant_audit_logs', ['id'], unique=False)
        create_index_safe(op.f('ix_tenant_audit_logs_tenant_id'), 'tenant_audit_logs', ['tenant_id'], unique=False)

    # Note: Foreign key constraints are already defined within table creation statements
    # SQLite doesn't support adding foreign key constraints after table creation
    print("✅ Base schema migration completed successfully")


def downgrade() -> None:
    """Downgrade schema by dropping all core tables."""
    
    # Drop tables in reverse dependency order
    op.drop_table('tenant_audit_logs')
    op.drop_table('tenant_invitations')
    op.drop_table('tenant_settings')
    op.drop_table('tasks')
    op.drop_table('user_role_assignments')
    op.drop_table('role_permissions')
    op.drop_table('user_roles')
    op.drop_table('permissions')
    op.drop_table('roles')
    op.drop_table('user_profiles')
    op.drop_table('users')
    op.drop_table('tenants')

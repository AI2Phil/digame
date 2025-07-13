"""Multi-tenancy tables

Revision ID: 20250523_multi_tenancy
Revises: manual_001_user_settings
Create Date: 2025-05-23 22:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250523_multi_tenancy'
down_revision = 'manual_001_user_settings'
branch_labels = None
depends_on = None


def upgrade():
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def table_exists(table_name):
        """Check if a table exists using raw SQL"""
        try:
            result = connection.execute(sa.text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = '{table_name}'
                );
            """))
            return result.scalar()
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
    
    # Create tenants table
    def create_tenants():
        op.create_table('tenants',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tenant_uuid', sa.String(length=36), nullable=True),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('slug', sa.String(length=100), nullable=False),
            sa.Column('domain', sa.String(length=255), nullable=True),
            sa.Column('subscription_tier', sa.String(length=50), nullable=True),
            sa.Column('max_users', sa.Integer(), nullable=True),
            sa.Column('storage_limit_gb', sa.Integer(), nullable=True),
            sa.Column('api_rate_limit', sa.Integer(), nullable=True),
            sa.Column('settings', sa.JSON(), nullable=True),
            sa.Column('branding', sa.JSON(), nullable=True),
            sa.Column('features', sa.JSON(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('is_trial', sa.Boolean(), nullable=True),
            sa.Column('trial_ends_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('admin_email', sa.String(length=255), nullable=False),
            sa.Column('admin_name', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=True),
            sa.Column('address', sa.Text(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
            op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'], unique=False)
            op.create_index(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)
            op.create_index(op.f('ix_tenants_domain'), 'tenants', ['domain'], unique=True)
            op.create_index(op.f('ix_tenants_tenant_uuid'), 'tenants', ['tenant_uuid'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenants', create_tenants)

    # Create tenant_settings table
    def create_tenant_settings():
        op.create_table('tenant_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tenant_id', sa.Integer(), nullable=False),
            sa.Column('category', sa.String(length=100), nullable=False),
            sa.Column('key', sa.String(length=100), nullable=False),
            sa.Column('value', sa.Text(), nullable=True),
            sa.Column('value_type', sa.String(length=20), nullable=True),
            sa.Column('is_encrypted', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenant_settings_id'), 'tenant_settings', ['id'], unique=False)
            op.create_index(op.f('ix_tenant_settings_tenant_id'), 'tenant_settings', ['tenant_id'], unique=False)
            op.create_index(op.f('ix_tenant_settings_category'), 'tenant_settings', ['category'], unique=False)
            op.create_index(op.f('ix_tenant_settings_key'), 'tenant_settings', ['key'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenant_settings', create_tenant_settings)

    # Create tenant_users table
    def create_tenant_users():
        op.create_table('tenant_users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tenant_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role', sa.String(length=50), nullable=True),
            sa.Column('permissions', sa.JSON(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('joined_at', sa.DateTime(), nullable=True),
            sa.Column('last_active_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenant_users_id'), 'tenant_users', ['id'], unique=False)
            op.create_index(op.f('ix_tenant_users_tenant_id'), 'tenant_users', ['tenant_id'], unique=False)
            op.create_index(op.f('ix_tenant_users_user_id'), 'tenant_users', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenant_users', create_tenant_users)

    # Create tenant_invitations table
    def create_tenant_invitations():
        op.create_table('tenant_invitations',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tenant_id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('role', sa.String(length=50), nullable=True),
            sa.Column('invited_by_user_id', sa.Integer(), nullable=False),
            sa.Column('invitation_token', sa.String(length=255), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('accepted_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenant_invitations_id'), 'tenant_invitations', ['id'], unique=False)
            op.create_index(op.f('ix_tenant_invitations_tenant_id'), 'tenant_invitations', ['tenant_id'], unique=False)
            op.create_index(op.f('ix_tenant_invitations_email'), 'tenant_invitations', ['email'], unique=False)
            op.create_index(op.f('ix_tenant_invitations_invitation_token'), 'tenant_invitations', ['invitation_token'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenant_invitations', create_tenant_invitations)

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
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenant_audit_logs_id'), 'tenant_audit_logs', ['id'], unique=False)
            op.create_index(op.f('ix_tenant_audit_logs_tenant_id'), 'tenant_audit_logs', ['tenant_id'], unique=False)
            op.create_index(op.f('ix_tenant_audit_logs_user_id'), 'tenant_audit_logs', ['user_id'], unique=False)
            op.create_index(op.f('ix_tenant_audit_logs_action'), 'tenant_audit_logs', ['action'], unique=False)
            op.create_index(op.f('ix_tenant_audit_logs_created_at'), 'tenant_audit_logs', ['created_at'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenant_audit_logs', create_tenant_audit_logs)

    # Add tenant_id column to existing users table to support multi-tenancy
    try:
        op.add_column('users', sa.Column('current_tenant_id', sa.Integer(), nullable=True))
        op.create_index(op.f('ix_users_current_tenant_id'), 'users', ['current_tenant_id'], unique=False)
        print("✓ Added current_tenant_id column to users table")
    except ProgrammingError as e:
        if "already exists" in str(e).lower():
            print("✓ current_tenant_id column already exists in users table")
        else:
            raise


def downgrade():
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def table_exists(table_name):
        """Check if a table exists using raw SQL"""
        try:
            result = connection.execute(sa.text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = '{table_name}'
                );
            """))
            return result.scalar()
        except Exception:
            # Fallback: try to query the table directly
            try:
                connection.execute(sa.text(f"SELECT 1 FROM {table_name} LIMIT 1"))
                return True
            except Exception:
                return False
    
    def drop_table_safe(table_name, drop_func):
        """Safely drop a table and its indexes"""
        if table_exists(table_name):
            try:
                drop_func()
                print(f"✓ Dropped table: {table_name}")
            except ProgrammingError as e:
                if "does not exist" in str(e).lower():
                    print(f"✓ Table {table_name} already dropped")
                else:
                    print(f"⚠ Warning dropping {table_name}: {e}")
        else:
            print(f"✓ Table {table_name} does not exist")

    # Remove tenant_id from users table
    try:
        op.drop_index(op.f('ix_users_current_tenant_id'), table_name='users')
        op.drop_column('users', 'current_tenant_id')
        print("✓ Removed current_tenant_id column from users table")
    except ProgrammingError as e:
        if "does not exist" in str(e).lower():
            print("✓ current_tenant_id column already removed from users table")
        else:
            print(f"⚠ Warning removing current_tenant_id: {e}")

    # Drop tenant_audit_logs table
    def drop_tenant_audit_logs():
        try:
            op.drop_index(op.f('ix_tenant_audit_logs_created_at'), table_name='tenant_audit_logs')
            op.drop_index(op.f('ix_tenant_audit_logs_action'), table_name='tenant_audit_logs')
            op.drop_index(op.f('ix_tenant_audit_logs_user_id'), table_name='tenant_audit_logs')
            op.drop_index(op.f('ix_tenant_audit_logs_tenant_id'), table_name='tenant_audit_logs')
            op.drop_index(op.f('ix_tenant_audit_logs_id'), table_name='tenant_audit_logs')
        except ProgrammingError:
            pass
        op.drop_table('tenant_audit_logs')
    
    drop_table_safe('tenant_audit_logs', drop_tenant_audit_logs)

    # Drop tenant_invitations table
    def drop_tenant_invitations():
        try:
            op.drop_index(op.f('ix_tenant_invitations_invitation_token'), table_name='tenant_invitations')
            op.drop_index(op.f('ix_tenant_invitations_email'), table_name='tenant_invitations')
            op.drop_index(op.f('ix_tenant_invitations_tenant_id'), table_name='tenant_invitations')
            op.drop_index(op.f('ix_tenant_invitations_id'), table_name='tenant_invitations')
        except ProgrammingError:
            pass
        op.drop_table('tenant_invitations')
    
    drop_table_safe('tenant_invitations', drop_tenant_invitations)

    # Drop tenant_users table
    def drop_tenant_users():
        try:
            op.drop_index(op.f('ix_tenant_users_user_id'), table_name='tenant_users')
            op.drop_index(op.f('ix_tenant_users_tenant_id'), table_name='tenant_users')
            op.drop_index(op.f('ix_tenant_users_id'), table_name='tenant_users')
        except ProgrammingError:
            pass
        op.drop_table('tenant_users')
    
    drop_table_safe('tenant_users', drop_tenant_users)

    # Drop tenant_settings table
    def drop_tenant_settings():
        try:
            op.drop_index(op.f('ix_tenant_settings_key'), table_name='tenant_settings')
            op.drop_index(op.f('ix_tenant_settings_category'), table_name='tenant_settings')
            op.drop_index(op.f('ix_tenant_settings_tenant_id'), table_name='tenant_settings')
            op.drop_index(op.f('ix_tenant_settings_id'), table_name='tenant_settings')
        except ProgrammingError:
            pass
        op.drop_table('tenant_settings')
    
    drop_table_safe('tenant_settings', drop_tenant_settings)

    # Drop tenants table
    def drop_tenants():
        try:
            op.drop_index(op.f('ix_tenants_tenant_uuid'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_domain'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_slug'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_name'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_id'), table_name='tenants')
        except ProgrammingError:
            pass
        op.drop_table('tenants')
    
    drop_table_safe('tenants', drop_tenants)
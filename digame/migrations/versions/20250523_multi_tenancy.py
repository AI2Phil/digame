"""Multi-tenancy tables

Revision ID: 20250523_multi_tenancy
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250523_multi_tenancy'
down_revision = '20250523_behavioral_models'
branch_labels = None
depends_on = None


def upgrade():
    # Create tenants table
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
    op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
    op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'], unique=False)
    op.create_index(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)
    op.create_index(op.f('ix_tenants_domain'), 'tenants', ['domain'], unique=True)
    op.create_index(op.f('ix_tenants_tenant_uuid'), 'tenants', ['tenant_uuid'], unique=True)

    # Create tenant_settings table
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
    op.create_index(op.f('ix_tenant_settings_id'), 'tenant_settings', ['id'], unique=False)
    op.create_index(op.f('ix_tenant_settings_tenant_id'), 'tenant_settings', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_tenant_settings_category'), 'tenant_settings', ['category'], unique=False)
    op.create_index(op.f('ix_tenant_settings_key'), 'tenant_settings', ['key'], unique=False)

    # Create tenant_users table
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
    op.create_index(op.f('ix_tenant_users_id'), 'tenant_users', ['id'], unique=False)
    op.create_index(op.f('ix_tenant_users_tenant_id'), 'tenant_users', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_tenant_users_user_id'), 'tenant_users', ['user_id'], unique=False)

    # Create tenant_invitations table
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
    op.create_index(op.f('ix_tenant_invitations_id'), 'tenant_invitations', ['id'], unique=False)
    op.create_index(op.f('ix_tenant_invitations_tenant_id'), 'tenant_invitations', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_tenant_invitations_email'), 'tenant_invitations', ['email'], unique=False)
    op.create_index(op.f('ix_tenant_invitations_invitation_token'), 'tenant_invitations', ['invitation_token'], unique=True)

    # Create tenant_audit_logs table
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
    op.create_index(op.f('ix_tenant_audit_logs_id'), 'tenant_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_tenant_audit_logs_tenant_id'), 'tenant_audit_logs', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_tenant_audit_logs_user_id'), 'tenant_audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_tenant_audit_logs_action'), 'tenant_audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_tenant_audit_logs_created_at'), 'tenant_audit_logs', ['created_at'], unique=False)

    # Add tenant_id column to existing users table to support multi-tenancy
    op.add_column('users', sa.Column('current_tenant_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_users_current_tenant_id'), 'users', ['current_tenant_id'], unique=False)


def downgrade():
    # Remove tenant_id from users table
    op.drop_index(op.f('ix_users_current_tenant_id'), table_name='users')
    op.drop_column('users', 'current_tenant_id')

    # Drop tenant_audit_logs table
    op.drop_index(op.f('ix_tenant_audit_logs_created_at'), table_name='tenant_audit_logs')
    op.drop_index(op.f('ix_tenant_audit_logs_action'), table_name='tenant_audit_logs')
    op.drop_index(op.f('ix_tenant_audit_logs_user_id'), table_name='tenant_audit_logs')
    op.drop_index(op.f('ix_tenant_audit_logs_tenant_id'), table_name='tenant_audit_logs')
    op.drop_index(op.f('ix_tenant_audit_logs_id'), table_name='tenant_audit_logs')
    op.drop_table('tenant_audit_logs')

    # Drop tenant_invitations table
    op.drop_index(op.f('ix_tenant_invitations_invitation_token'), table_name='tenant_invitations')
    op.drop_index(op.f('ix_tenant_invitations_email'), table_name='tenant_invitations')
    op.drop_index(op.f('ix_tenant_invitations_tenant_id'), table_name='tenant_invitations')
    op.drop_index(op.f('ix_tenant_invitations_id'), table_name='tenant_invitations')
    op.drop_table('tenant_invitations')

    # Drop tenant_users table
    op.drop_index(op.f('ix_tenant_users_user_id'), table_name='tenant_users')
    op.drop_index(op.f('ix_tenant_users_tenant_id'), table_name='tenant_users')
    op.drop_index(op.f('ix_tenant_users_id'), table_name='tenant_users')
    op.drop_table('tenant_users')

    # Drop tenant_settings table
    op.drop_index(op.f('ix_tenant_settings_key'), table_name='tenant_settings')
    op.drop_index(op.f('ix_tenant_settings_category'), table_name='tenant_settings')
    op.drop_index(op.f('ix_tenant_settings_tenant_id'), table_name='tenant_settings')
    op.drop_index(op.f('ix_tenant_settings_id'), table_name='tenant_settings')
    op.drop_table('tenant_settings')

    # Drop tenants table
    op.drop_index(op.f('ix_tenants_tenant_uuid'), table_name='tenants')
    op.drop_index(op.f('ix_tenants_domain'), table_name='tenants')
    op.drop_index(op.f('ix_tenants_slug'), table_name='tenants')
    op.drop_index(op.f('ix_tenants_name'), table_name='tenants')
    op.drop_index(op.f('ix_tenants_id'), table_name='tenants')
    op.drop_table('tenants')
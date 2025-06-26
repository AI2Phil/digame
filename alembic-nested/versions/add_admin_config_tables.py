"""Add admin configuration tables

Revision ID: add_admin_config_tables
Revises: 
Create Date: 2025-06-24 07:46:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_admin_config_tables'
down_revision = None  # This should be set to the latest revision
branch_labels = None
depends_on = None


def upgrade():
    # Create admin_api_key_configs table
    op.create_table('admin_api_key_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('service_name', sa.String(length=100), nullable=False),
        sa.Column('api_key', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('usage_limit_per_user', sa.Integer(), nullable=True),
        sa.Column('allowed_endpoints', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_api_key_configs_id'), 'admin_api_key_configs', ['id'], unique=False)
    op.create_index(op.f('ix_admin_api_key_configs_service_name'), 'admin_api_key_configs', ['service_name'], unique=True)

    # Create api_key_usage_logs table
    op.create_table('api_key_usage_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('service_name', sa.String(length=100), nullable=False),
        sa.Column('endpoint', sa.String(length=200), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('cost_estimate', sa.String(length=20), nullable=True),
        sa.Column('request_timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('response_status', sa.String(length=20), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_api_key_usage_logs_id'), 'api_key_usage_logs', ['id'], unique=False)
    op.create_index(op.f('ix_api_key_usage_logs_config_id'), 'api_key_usage_logs', ['config_id'], unique=False)
    op.create_index(op.f('ix_api_key_usage_logs_user_id'), 'api_key_usage_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_api_key_usage_logs_service_name'), 'api_key_usage_logs', ['service_name'], unique=False)

    # Create admin_system_configs table
    op.create_table('admin_system_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('config_key', sa.String(length=100), nullable=False),
        sa.Column('config_value', sa.Text(), nullable=False),
        sa.Column('config_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_sensitive', sa.Boolean(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_system_configs_id'), 'admin_system_configs', ['id'], unique=False)
    op.create_index(op.f('ix_admin_system_configs_config_key'), 'admin_system_configs', ['config_key'], unique=True)
    op.create_index(op.f('ix_admin_system_configs_category'), 'admin_system_configs', ['category'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_admin_system_configs_category'), table_name='admin_system_configs')
    op.drop_index(op.f('ix_admin_system_configs_config_key'), table_name='admin_system_configs')
    op.drop_index(op.f('ix_admin_system_configs_id'), table_name='admin_system_configs')
    op.drop_table('admin_system_configs')
    
    op.drop_index(op.f('ix_api_key_usage_logs_service_name'), table_name='api_key_usage_logs')
    op.drop_index(op.f('ix_api_key_usage_logs_user_id'), table_name='api_key_usage_logs')
    op.drop_index(op.f('ix_api_key_usage_logs_config_id'), table_name='api_key_usage_logs')
    op.drop_index(op.f('ix_api_key_usage_logs_id'), table_name='api_key_usage_logs')
    op.drop_table('api_key_usage_logs')
    
    op.drop_index(op.f('ix_admin_api_key_configs_service_name'), table_name='admin_api_key_configs')
    op.drop_index(op.f('ix_admin_api_key_configs_id'), table_name='admin_api_key_configs')
    op.drop_table('admin_api_key_configs')
"""Add user_profiles table and enhanced RBAC

Revision ID: add_user_profiles_and_enhanced_rbac
Revises: add_missing_user_columns
Create Date: 2025-01-12 11:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_profiles_rbac'
down_revision: Union[str, None] = 'add_user_cols'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add user_profiles table and enhanced RBAC tables."""
    
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_tables = inspector.get_table_names()
    
    # Create user_profiles table if it doesn't exist
    if 'user_profiles' not in existing_tables:
        print("Creating user_profiles table")
        op.create_table(
            'user_profiles',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('skills', sa.JSON(), nullable=True),
            sa.Column('learning_goals', sa.Text(), nullable=True),
            sa.Column('interests', sa.JSON(), nullable=True),
            sa.Column('mentorship_preferences', sa.JSON(), nullable=True),
            sa.Column('bio', sa.Text(), nullable=True),
            sa.Column('location', sa.String(255), nullable=True),
            sa.Column('linkedin_url', sa.String(255), nullable=True),
            sa.Column('github_url', sa.String(255), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index('ix_user_profiles_id', 'user_profiles', ['id'], unique=False)
        op.create_index('ix_user_profiles_user_id', 'user_profiles', ['user_id'], unique=True)
    else:
        print("user_profiles table already exists, skipping")
    
    # Create user_roles_enhanced table if it doesn't exist
    if 'user_roles_enhanced' not in existing_tables:
        print("Creating user_roles_enhanced table")
        op.create_table(
            'user_roles_enhanced',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role_id', sa.Integer(), nullable=False),
            sa.Column('tenant_id', sa.Integer(), nullable=True),
            sa.Column('assigned_by', sa.Integer(), nullable=True),
            sa.Column('assigned_at', sa.DateTime(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
            sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ),
            sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'role_id', 'tenant_id', name='unique_user_role_tenant')
        )
        op.create_index('ix_user_roles_enhanced_id', 'user_roles_enhanced', ['id'], unique=False)
        op.create_index('ix_user_roles_enhanced_user_id', 'user_roles_enhanced', ['user_id'], unique=False)
        op.create_index('ix_user_roles_enhanced_role_id', 'user_roles_enhanced', ['role_id'], unique=False)
        op.create_index('ix_user_roles_enhanced_tenant_id', 'user_roles_enhanced', ['tenant_id'], unique=False)
    else:
        print("user_roles_enhanced table already exists, skipping")
    
    # Add missing columns to roles table if needed
    existing_role_columns = [col['name'] for col in inspector.get_columns('roles')]
    if 'tenant_id' not in existing_role_columns:
        print("Adding tenant_id to roles table")
        op.add_column('roles', sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=True))
        op.create_index('ix_roles_tenant_id', 'roles', ['tenant_id'], unique=False)
    else:
        print("tenant_id already exists in roles table, skipping")


def downgrade() -> None:
    """Remove user_profiles table and enhanced RBAC tables."""
    
    # Drop indexes and tables in reverse order
    try:
        op.drop_index('ix_user_roles_enhanced_tenant_id', table_name='user_roles_enhanced')
        op.drop_index('ix_user_roles_enhanced_role_id', table_name='user_roles_enhanced')
        op.drop_index('ix_user_roles_enhanced_user_id', table_name='user_roles_enhanced')
        op.drop_index('ix_user_roles_enhanced_id', table_name='user_roles_enhanced')
        op.drop_table('user_roles_enhanced')
    except Exception:
        pass
    
    try:
        op.drop_index('ix_user_profiles_user_id', table_name='user_profiles')
        op.drop_index('ix_user_profiles_id', table_name='user_profiles')
        op.drop_table('user_profiles')
    except Exception:
        pass
    
    try:
        op.drop_index('ix_roles_tenant_id', table_name='roles')
        op.drop_column('roles', 'tenant_id')
    except Exception:
        pass
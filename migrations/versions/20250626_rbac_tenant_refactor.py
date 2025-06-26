"""RBAC Tenant Architecture Refactor

Revision ID: 20250626_rbac_tenant_refactor
Revises: add5a460dd15
Create Date: 2025-06-26 16:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250626_rbac_tenant_refactor'
down_revision = 'add5a460dd15'
branch_labels = None
depends_on = None


def upgrade():
    """
    Phase 1: RBAC Tenant Architecture Refactor
    - Add tenant_id to users and roles tables
    - Create enhanced user_roles_enhanced table
    - Migrate data from old user_roles table
    """
    
    # Add tenant_id to users table
    op.add_column('users', sa.Column('tenant_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_users_tenant_id'), 'users', ['tenant_id'], unique=False)
    op.create_foreign_key('fk_users_tenant_id', 'users', 'tenants', ['tenant_id'], ['id'])
    
    # Add tenant_id to roles table
    op.add_column('roles', sa.Column('tenant_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_roles_tenant_id'), 'roles', ['tenant_id'], unique=False)
    op.create_foreign_key('fk_roles_tenant_id', 'roles', 'tenants', ['tenant_id'], ['id'])
    
    # Create enhanced user_roles table
    op.create_table('user_roles_enhanced',
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
    op.create_index(op.f('ix_user_roles_enhanced_id'), 'user_roles_enhanced', ['id'], unique=False)
    op.create_index(op.f('ix_user_roles_enhanced_role_id'), 'user_roles_enhanced', ['role_id'], unique=False)
    op.create_index(op.f('ix_user_roles_enhanced_tenant_id'), 'user_roles_enhanced', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_user_roles_enhanced_user_id'), 'user_roles_enhanced', ['user_id'], unique=False)
    
    # Migrate data from old user_roles table to new enhanced table
    # This preserves existing role assignments
    op.execute("""
        INSERT INTO user_roles_enhanced (user_id, role_id, assigned_at, is_active)
        SELECT user_id, role_id, NOW(), TRUE
        FROM user_roles
    """)


def downgrade():
    """
    Rollback the RBAC tenant refactor changes
    """
    
    # Drop enhanced user_roles table
    op.drop_index(op.f('ix_user_roles_enhanced_user_id'), table_name='user_roles_enhanced')
    op.drop_index(op.f('ix_user_roles_enhanced_tenant_id'), table_name='user_roles_enhanced')
    op.drop_index(op.f('ix_user_roles_enhanced_role_id'), table_name='user_roles_enhanced')
    op.drop_index(op.f('ix_user_roles_enhanced_id'), table_name='user_roles_enhanced')
    op.drop_table('user_roles_enhanced')
    
    # Remove tenant_id from roles table
    op.drop_constraint('fk_roles_tenant_id', 'roles', type_='foreignkey')
    op.drop_index(op.f('ix_roles_tenant_id'), table_name='roles')
    op.drop_column('roles', 'tenant_id')
    
    # Remove tenant_id from users table
    op.drop_constraint('fk_users_tenant_id', 'users', type_='foreignkey')
    op.drop_index(op.f('ix_users_tenant_id'), table_name='users')
    op.drop_column('users', 'tenant_id')
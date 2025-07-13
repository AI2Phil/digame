"""Create initial schema with base tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-05-23 09:37:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to create initial base tables."""
    
    # Check if tables already exist to avoid conflicts
    from sqlalchemy import inspect
    from alembic import context
    
    connection = context.get_bind()
    inspector = inspect(connection)
    existing_tables = inspector.get_table_names()
    
    # Create users table if it doesn't exist
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('hashed_password', sa.String(), nullable=False),
            sa.Column('first_name', sa.String(), nullable=True),
            sa.Column('last_name', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('is_active', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
        op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create tenants table if it doesn't exist (needed for user_role_assignments)
    if 'tenants' not in existing_tables:
        op.create_table(
            'tenants',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
        op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'], unique=True)
        op.create_index(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)

    # Create roles table if it doesn't exist
    if 'roles' not in existing_tables:
        op.create_table(
            'roles',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('tenant_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_roles_id'), 'roles', ['id'], unique=False)
        op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)

    # Create permissions table if it doesn't exist
    if 'permissions' not in existing_tables:
        op.create_table(
            'permissions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_permissions_id'), 'permissions', ['id'], unique=False)
        op.create_index(op.f('ix_permissions_name'), 'permissions', ['name'], unique=True)

    # Create user_role_assignments table (not user_roles) if it doesn't exist
    if 'user_role_assignments' not in existing_tables:
        op.create_table(
            'user_role_assignments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role_id', sa.Integer(), nullable=False),
            sa.Column('tenant_id', sa.Integer(), nullable=True),
            sa.Column('assigned_at', sa.DateTime(), nullable=True),
            sa.Column('assigned_by', sa.Integer(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ),
            sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
            sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_role_assignments_id'), 'user_role_assignments', ['id'], unique=False)
        
        # Create unique constraint for user-role-tenant combination
        op.create_index('unique_user_role_tenant', 'user_role_assignments', ['user_id', 'role_id', 'tenant_id'], unique=True)

    # Create role_permissions association table
    op.create_table(
        'role_permissions',
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('role_id', 'permission_id')
    )

    # Create activities table
    op.create_table(
        'activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('app_name', sa.String(), nullable=True),
        sa.Column('window_title', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.Column('project_context', sa.String(), nullable=True),
        sa.Column('is_context_switch', sa.Boolean(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activities_id'), 'activities', ['id'], unique=False)
    op.create_index(op.f('ix_activities_user_id'), 'activities', ['user_id'], unique=False)
    op.create_index(op.f('ix_activities_timestamp'), 'activities', ['timestamp'], unique=False)

    # Create detected_anomalies table
    op.create_table(
        'detected_anomalies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('anomaly_type', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('detected_at', sa.DateTime(), nullable=False),
        sa.Column('activity_id', sa.Integer(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_detected_anomalies_id'), 'detected_anomalies', ['id'], unique=False)
    op.create_index(op.f('ix_detected_anomalies_user_id'), 'detected_anomalies', ['user_id'], unique=False)

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('estimated_duration', sa.Integer(), nullable=True),
        sa.Column('actual_duration', sa.Integer(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)

    # Create process_notes table
    op.create_table(
        'process_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('is_private', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_process_notes_id'), 'process_notes', ['id'], unique=False)
    op.create_index(op.f('ix_process_notes_user_id'), 'process_notes', ['user_id'], unique=False)

    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=True),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('progress', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema by removing all base tables."""
    
    # Check if tables exist before trying to drop them
    from sqlalchemy import inspect
    from alembic import context
    
    connection = context.get_bind()
    inspector = inspect(connection)
    existing_tables = inspector.get_table_names()
    
    # Drop tables in reverse order to handle foreign key constraints
    if 'jobs' in existing_tables:
        op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
        op.drop_table('jobs')
    
    if 'process_notes' in existing_tables:
        op.drop_index(op.f('ix_process_notes_user_id'), table_name='process_notes')
        op.drop_index(op.f('ix_process_notes_id'), table_name='process_notes')
        op.drop_table('process_notes')
    
    if 'tasks' in existing_tables:
        op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
        op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
        op.drop_table('tasks')
    
    if 'detected_anomalies' in existing_tables:
        op.drop_index(op.f('ix_detected_anomalies_user_id'), table_name='detected_anomalies')
        op.drop_index(op.f('ix_detected_anomalies_id'), table_name='detected_anomalies')
        op.drop_table('detected_anomalies')
    
    if 'activities' in existing_tables:
        op.drop_index(op.f('ix_activities_timestamp'), table_name='activities')
        op.drop_index(op.f('ix_activities_user_id'), table_name='activities')
        op.drop_index(op.f('ix_activities_id'), table_name='activities')
        op.drop_table('activities')
    
    if 'role_permissions' in existing_tables:
        op.drop_table('role_permissions')
    
    # Drop user_role_assignments (not user_roles)
    if 'user_role_assignments' in existing_tables:
        op.drop_index('unique_user_role_tenant', table_name='user_role_assignments')
        op.drop_index(op.f('ix_user_role_assignments_id'), table_name='user_role_assignments')
        op.drop_table('user_role_assignments')
    
    if 'permissions' in existing_tables:
        op.drop_index(op.f('ix_permissions_name'), table_name='permissions')
        op.drop_index(op.f('ix_permissions_id'), table_name='permissions')
        op.drop_table('permissions')
    
    if 'roles' in existing_tables:
        op.drop_index(op.f('ix_roles_name'), table_name='roles')
        op.drop_index(op.f('ix_roles_id'), table_name='roles')
        op.drop_table('roles')
    
    if 'tenants' in existing_tables:
        op.drop_index(op.f('ix_tenants_slug'), table_name='tenants')
        op.drop_index(op.f('ix_tenants_name'), table_name='tenants')
        op.drop_index(op.f('ix_tenants_id'), table_name='tenants')
        op.drop_table('tenants')
    
    if 'users' in existing_tables:
        op.drop_index(op.f('ix_users_email'), table_name='users')
        op.drop_index(op.f('ix_users_username'), table_name='users')
        op.drop_index(op.f('ix_users_id'), table_name='users')
        op.drop_table('users')
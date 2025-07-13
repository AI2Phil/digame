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
    
    # Create users table
    def create_users():
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
        try:
            op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
            op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
            op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('users', create_users)

    # Create tenants table
    def create_tenants():
        op.create_table(
            'tenants',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
            op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'], unique=True)
            op.create_index(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tenants', create_tenants)

    # Create roles table
    def create_roles():
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
        try:
            op.create_index(op.f('ix_roles_id'), 'roles', ['id'], unique=False)
            op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('roles', create_roles)

    # Create permissions table
    def create_permissions():
        op.create_table(
            'permissions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_permissions_id'), 'permissions', ['id'], unique=False)
            op.create_index(op.f('ix_permissions_name'), 'permissions', ['name'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('permissions', create_permissions)

    # Create user_role_assignments table
    def create_user_role_assignments():
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
        try:
            op.create_index(op.f('ix_user_role_assignments_id'), 'user_role_assignments', ['id'], unique=False)
            op.create_index('unique_user_role_tenant', 'user_role_assignments', ['user_id', 'role_id', 'tenant_id'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('user_role_assignments', create_user_role_assignments)

    # Create role_permissions association table
    def create_role_permissions():
        op.create_table(
            'role_permissions',
            sa.Column('role_id', sa.Integer(), nullable=False),
            sa.Column('permission_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
            sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
            sa.PrimaryKeyConstraint('role_id', 'permission_id')
        )
    
    create_table_safe('role_permissions', create_role_permissions)

    # Create activities table
    def create_activities():
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
        try:
            op.create_index(op.f('ix_activities_id'), 'activities', ['id'], unique=False)
            op.create_index(op.f('ix_activities_user_id'), 'activities', ['user_id'], unique=False)
            op.create_index(op.f('ix_activities_timestamp'), 'activities', ['timestamp'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('activities', create_activities)

    # Create detected_anomalies table
    def create_detected_anomalies():
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
        try:
            op.create_index(op.f('ix_detected_anomalies_id'), 'detected_anomalies', ['id'], unique=False)
            op.create_index(op.f('ix_detected_anomalies_user_id'), 'detected_anomalies', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('detected_anomalies', create_detected_anomalies)

    # Create tasks table
    def create_tasks():
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
        try:
            op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
            op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('tasks', create_tasks)

    # Create process_notes table
    def create_process_notes():
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
        try:
            op.create_index(op.f('ix_process_notes_id'), 'process_notes', ['id'], unique=False)
            op.create_index(op.f('ix_process_notes_user_id'), 'process_notes', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('process_notes', create_process_notes)

    # Create jobs table
    def create_jobs():
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
        try:
            op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('jobs', create_jobs)


def downgrade() -> None:
    """Downgrade schema by removing all base tables."""
    
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
    
    # Drop tables in reverse order to handle foreign key constraints
    def drop_jobs():
        try:
            op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
        except ProgrammingError:
            pass
        op.drop_table('jobs')
    
    drop_table_safe('jobs', drop_jobs)
    
    def drop_process_notes():
        try:
            op.drop_index(op.f('ix_process_notes_user_id'), table_name='process_notes')
            op.drop_index(op.f('ix_process_notes_id'), table_name='process_notes')
        except ProgrammingError:
            pass
        op.drop_table('process_notes')
    
    drop_table_safe('process_notes', drop_process_notes)
    
    def drop_tasks():
        try:
            op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
            op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
        except ProgrammingError:
            pass
        op.drop_table('tasks')
    
    drop_table_safe('tasks', drop_tasks)
    
    def drop_detected_anomalies():
        try:
            op.drop_index(op.f('ix_detected_anomalies_user_id'), table_name='detected_anomalies')
            op.drop_index(op.f('ix_detected_anomalies_id'), table_name='detected_anomalies')
        except ProgrammingError:
            pass
        op.drop_table('detected_anomalies')
    
    drop_table_safe('detected_anomalies', drop_detected_anomalies)
    
    def drop_activities():
        try:
            op.drop_index(op.f('ix_activities_timestamp'), table_name='activities')
            op.drop_index(op.f('ix_activities_user_id'), table_name='activities')
            op.drop_index(op.f('ix_activities_id'), table_name='activities')
        except ProgrammingError:
            pass
        op.drop_table('activities')
    
    drop_table_safe('activities', drop_activities)
    
    def drop_role_permissions():
        op.drop_table('role_permissions')
    
    drop_table_safe('role_permissions', drop_role_permissions)
    
    def drop_user_role_assignments():
        try:
            op.drop_index('unique_user_role_tenant', table_name='user_role_assignments')
            op.drop_index(op.f('ix_user_role_assignments_id'), table_name='user_role_assignments')
        except ProgrammingError:
            pass
        op.drop_table('user_role_assignments')
    
    drop_table_safe('user_role_assignments', drop_user_role_assignments)
    
    def drop_permissions():
        try:
            op.drop_index(op.f('ix_permissions_name'), table_name='permissions')
            op.drop_index(op.f('ix_permissions_id'), table_name='permissions')
        except ProgrammingError:
            pass
        op.drop_table('permissions')
    
    drop_table_safe('permissions', drop_permissions)
    
    def drop_roles():
        try:
            op.drop_index(op.f('ix_roles_name'), table_name='roles')
            op.drop_index(op.f('ix_roles_id'), table_name='roles')
        except ProgrammingError:
            pass
        op.drop_table('roles')
    
    drop_table_safe('roles', drop_roles)
    
    def drop_tenants():
        try:
            op.drop_index(op.f('ix_tenants_slug'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_name'), table_name='tenants')
            op.drop_index(op.f('ix_tenants_id'), table_name='tenants')
        except ProgrammingError:
            pass
        op.drop_table('tenants')
    
    drop_table_safe('tenants', drop_tenants)
    
    def drop_users():
        try:
            op.drop_index(op.f('ix_users_email'), table_name='users')
            op.drop_index(op.f('ix_users_username'), table_name='users')
            op.drop_index(op.f('ix_users_id'), table_name='users')
        except ProgrammingError:
            pass
        op.drop_table('users')
    
    drop_table_safe('users', drop_users)
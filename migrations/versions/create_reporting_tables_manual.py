"""create_reporting_tables_manual

Revision ID: create_reporting_tables_manual
Revises: 040ac82a5122
Create Date: 2025-06-23 12:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


def table_exists(table_name):
    """Check if a table exists in the database."""
    connection = op.get_bind()
    
    # Try PostgreSQL first (production)
    try:
        result = connection.execute(sa.text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = :table_name
            );
        """), {"table_name": table_name})
        return result.scalar()
    except Exception:
        # Fallback for SQLite or other databases
        try:
            result = connection.execute(sa.text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';"))
            return result.fetchone() is not None
        except Exception:
            # Final fallback - try to describe the table
            try:
                connection.execute(sa.text(f"SELECT 1 FROM {table_name} LIMIT 1;"))
                return True
            except Exception:
                return False


def index_exists(index_name, table_name):
    """Check if an index exists in the database."""
    connection = op.get_bind()
    
    # Try PostgreSQL first (production)
    try:
        result = connection.execute(sa.text("""
            SELECT EXISTS (
                SELECT FROM pg_indexes 
                WHERE schemaname = 'public' 
                AND tablename = :table_name 
                AND indexname = :index_name
            );
        """), {"table_name": table_name, "index_name": index_name})
        return result.scalar()
    except Exception:
        # Fallback for SQLite or other databases
        try:
            result = connection.execute(sa.text(f"SELECT name FROM sqlite_master WHERE type='index' AND name='{index_name}';"))
            return result.fetchone() is not None
        except Exception:
            return False


def create_table_safe(table_name, create_func):
    """Safely create a table only if it doesn't exist."""
    if table_exists(table_name):
        print(f"✓ Table {table_name} already exists")
        return False
    else:
        create_func()
        print(f"✓ Created table: {table_name}")
        return True


def create_index_safe(index_name, table_name, create_func):
    """Safely create an index only if it doesn't exist."""
    if index_exists(index_name, table_name):
        print(f"✓ Index {index_name} already exists")
        return False
    else:
        create_func()
        print(f"✓ Created index: {index_name}")
        return True


# revision identifiers, used by Alembic.
revision: str = 'create_reporting_tables_manual'
down_revision: Union[str, None] = '040ac82a5122'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create reports table first (required for foreign key references)
    create_table_safe('reports', lambda: op.create_table('reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('report_uuid', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('report_type', sa.String(length=50), nullable=False),
        sa.Column('data_source', sa.String(length=100), nullable=False),
        sa.Column('query_config', sa.JSON(), nullable=True),
        sa.Column('visualization_config', sa.JSON(), nullable=True),
        sa.Column('format_config', sa.JSON(), nullable=True),
        sa.Column('export_config', sa.JSON(), nullable=True),
        sa.Column('default_filters', sa.JSON(), nullable=True),
        sa.Column('parameter_schema', sa.JSON(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('allowed_roles', sa.JSON(), nullable=True),
        sa.Column('allowed_users', sa.JSON(), nullable=True),
        sa.Column('is_scheduled', sa.Boolean(), nullable=True),
        sa.Column('schedule_config', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by_user_id', sa.Integer(), nullable=False),
        sa.Column('last_generated_at', sa.DateTime(), nullable=True),
        sa.Column('generation_count', sa.Integer(), nullable=True),
        sa.Column('avg_generation_time_ms', sa.Float(), nullable=True),
        sa.Column('last_generation_time_ms', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    ))
    
    # Create indexes for reports table
    create_index_safe('ix_reports_category', 'reports', 
                     lambda: op.create_index(op.f('ix_reports_category'), 'reports', ['category'], unique=False))
    create_index_safe('ix_reports_id', 'reports', 
                     lambda: op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False))
    create_index_safe('ix_reports_report_uuid', 'reports', 
                     lambda: op.create_index(op.f('ix_reports_report_uuid'), 'reports', ['report_uuid'], unique=True))
    create_index_safe('ix_reports_tenant_id', 'reports', 
                     lambda: op.create_index(op.f('ix_reports_tenant_id'), 'reports', ['tenant_id'], unique=False))

    # Create report_definitions table
    create_table_safe('report_definitions', lambda: op.create_table('report_definitions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('definition_uuid', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('report_type', sa.String(length=100), nullable=True),
        sa.Column('content_blocks', sa.JSON(), nullable=False),
        sa.Column('global_filters', sa.JSON(), nullable=True),
        sa.Column('output_format', sa.String(length=50), nullable=True),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    ))
    
    # Create indexes for report_definitions table
    create_index_safe('ix_report_definitions_definition_uuid', 'report_definitions', 
                     lambda: op.create_index(op.f('ix_report_definitions_definition_uuid'), 'report_definitions', ['definition_uuid'], unique=True))
    create_index_safe('ix_report_definitions_id', 'report_definitions', 
                     lambda: op.create_index(op.f('ix_report_definitions_id'), 'report_definitions', ['id'], unique=False))
    create_index_safe('ix_report_definitions_report_type', 'report_definitions', 
                     lambda: op.create_index(op.f('ix_report_definitions_report_type'), 'report_definitions', ['report_type'], unique=False))
    create_index_safe('ix_report_definitions_tenant_id', 'report_definitions', 
                     lambda: op.create_index(op.f('ix_report_definitions_tenant_id'), 'report_definitions', ['tenant_id'], unique=False))
    create_index_safe('ix_report_definitions_user_id', 'report_definitions', 
                     lambda: op.create_index(op.f('ix_report_definitions_user_id'), 'report_definitions', ['user_id'], unique=False))

    # Create report_schedules table (now that reports table exists)
    create_table_safe('report_schedules', lambda: op.create_table('report_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=True),
        sa.Column('report_definition_id', sa.Integer(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('schedule_uuid', sa.String(length=36), nullable=True),
        sa.Column('schedule_type', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('cron_expression', sa.String(length=100), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('default_parameters', sa.JSON(), nullable=True),
        sa.Column('default_filters', sa.JSON(), nullable=True),
        sa.Column('output_formats', sa.JSON(), nullable=True),
        sa.Column('delivery_method', sa.String(length=50), nullable=True),
        sa.Column('delivery_config', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('next_run_at', sa.DateTime(), nullable=True),
        sa.Column('last_run_at', sa.DateTime(), nullable=True),
        sa.Column('last_run_status', sa.String(length=50), nullable=True),
        sa.Column('total_executions', sa.Integer(), nullable=True),
        sa.Column('successful_executions', sa.Integer(), nullable=True),
        sa.Column('failed_executions', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by_user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['report_definition_id'], ['report_definitions.id'], ),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    ))
    
    # Create indexes for report_schedules table
    create_index_safe('ix_report_schedules_id', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_id'), 'report_schedules', ['id'], unique=False))
    create_index_safe('ix_report_schedules_next_run_at', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_next_run_at'), 'report_schedules', ['next_run_at'], unique=False))
    create_index_safe('ix_report_schedules_report_definition_id', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_report_definition_id'), 'report_schedules', ['report_definition_id'], unique=False))
    create_index_safe('ix_report_schedules_report_id', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_report_id'), 'report_schedules', ['report_id'], unique=False))
    create_index_safe('ix_report_schedules_schedule_uuid', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_schedule_uuid'), 'report_schedules', ['schedule_uuid'], unique=True))
    create_index_safe('ix_report_schedules_tenant_id', 'report_schedules', 
                     lambda: op.create_index(op.f('ix_report_schedules_tenant_id'), 'report_schedules', ['tenant_id'], unique=False))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop report_schedules table first (has foreign keys to reports)
    op.drop_index(op.f('ix_report_schedules_tenant_id'), table_name='report_schedules')
    op.drop_index(op.f('ix_report_schedules_schedule_uuid'), table_name='report_schedules')
    op.drop_index(op.f('ix_report_schedules_report_id'), table_name='report_schedules')
    op.drop_index(op.f('ix_report_schedules_report_definition_id'), table_name='report_schedules')
    op.drop_index(op.f('ix_report_schedules_next_run_at'), table_name='report_schedules')
    op.drop_index(op.f('ix_report_schedules_id'), table_name='report_schedules')
    op.drop_table('report_schedules')
    
    # Drop report_definitions table
    op.drop_index(op.f('ix_report_definitions_user_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_tenant_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_report_type'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_definition_uuid'), table_name='report_definitions')
    op.drop_table('report_definitions')
    
    # Drop reports table last (referenced by report_schedules)
    op.drop_index(op.f('ix_reports_tenant_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_report_uuid'), table_name='reports')
    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_category'), table_name='reports')
    op.drop_table('reports')
"""create_reporting_tables_manual

Revision ID: create_reporting_tables_manual
Revises: 040ac82a5122
Create Date: 2025-06-23 12:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_reporting_tables_manual'
down_revision: Union[str, None] = '040ac82a5122'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create report_definitions table
    op.create_table('report_definitions',
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
    )
    op.create_index(op.f('ix_report_definitions_definition_uuid'), 'report_definitions', ['definition_uuid'], unique=True)
    op.create_index(op.f('ix_report_definitions_id'), 'report_definitions', ['id'], unique=False)
    op.create_index(op.f('ix_report_definitions_report_type'), 'report_definitions', ['report_type'], unique=False)
    op.create_index(op.f('ix_report_definitions_tenant_id'), 'report_definitions', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_report_definitions_user_id'), 'report_definitions', ['user_id'], unique=False)

    # Add new columns to report_schedules table if it exists
    # First check if the table exists, if not create it
    try:
        # Try to add columns to existing table
        op.add_column('report_schedules', sa.Column('report_definition_id', sa.Integer(), nullable=True))
        op.add_column('report_schedules', sa.Column('schedule_type', sa.String(length=50), nullable=False, server_default='report'))
        
        # Add foreign key constraint
        op.create_foreign_key('fk_report_schedules_report_definition_id', 'report_schedules', 'report_definitions', ['report_definition_id'], ['id'])
        op.create_index(op.f('ix_report_schedules_report_definition_id'), 'report_schedules', ['report_definition_id'], unique=False)
        
    except Exception:
        # If table doesn't exist, create it with all columns
        op.create_table('report_schedules',
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
        )
        op.create_index(op.f('ix_report_schedules_id'), 'report_schedules', ['id'], unique=False)
        op.create_index(op.f('ix_report_schedules_next_run_at'), 'report_schedules', ['next_run_at'], unique=False)
        op.create_index(op.f('ix_report_schedules_report_definition_id'), 'report_schedules', ['report_definition_id'], unique=False)
        op.create_index(op.f('ix_report_schedules_report_id'), 'report_schedules', ['report_id'], unique=False)
        op.create_index(op.f('ix_report_schedules_schedule_uuid'), 'report_schedules', ['schedule_uuid'], unique=True)
        op.create_index(op.f('ix_report_schedules_tenant_id'), 'report_schedules', ['tenant_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes and foreign keys first
    try:
        op.drop_constraint('fk_report_schedules_report_definition_id', 'report_schedules', type_='foreignkey')
        op.drop_index(op.f('ix_report_schedules_report_definition_id'), table_name='report_schedules')
        op.drop_column('report_schedules', 'schedule_type')
        op.drop_column('report_schedules', 'report_definition_id')
    except Exception:
        # If we created the whole table, drop it
        op.drop_table('report_schedules')
    
    # Drop report_definitions table
    op.drop_index(op.f('ix_report_definitions_user_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_tenant_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_report_type'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_id'), table_name='report_definitions')
    op.drop_index(op.f('ix_report_definitions_definition_uuid'), table_name='report_definitions')
    op.drop_table('report_definitions')
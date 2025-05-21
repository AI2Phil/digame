"""
Manually defined Alembic migration for the Task model.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func # For server_default=func.now()

# Placeholder revision identifiers.
revision = 'manual_add_tasks_table'
# Replace with the actual revision ID of the migrations that created 'users' and 'process_notes' tables.
# For simplicity, assuming a generic previous state.
down_revision = 'previous_migration_creating_users_and_process_notes' 
branch_labels = None
depends_on = None


def upgrade():
    """
    Creates the 'tasks' table in the database.
    """
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('process_note_id', sa.Integer(), nullable=True), # Optional link
        
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=True),
        sa.Column('source_identifier', sa.String(length=255), nullable=True),
        
        sa.Column('priority_score', sa.Float(), server_default=sa.text('0.5'), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='suggested', nullable=False),
        
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('due_date_inferred', sa.DateTime(), nullable=True),
        
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=func.now(), onupdate=func.now(), nullable=False),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_tasks_user_id_users'),
        sa.ForeignKeyConstraint(['process_note_id'], ['process_notes.id'], name='fk_tasks_process_note_id_process_notes')
    )
    
    # Create indexes explicitly
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    op.create_index(op.f('ix_tasks_process_note_id'), 'tasks', ['process_note_id'], unique=False)
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False) # Index on status is common

def downgrade():
    """
    Removes the 'tasks' table from the database.
    """
    op.drop_index(op.f('ix_tasks_status'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_process_note_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    
    op.drop_table('tasks')

# Notes on server_default for priority_score and status:
# - For Float priority_score: server_default=sa.text('0.5') is used.
# - For String status: server_default='suggested' is used directly.
# These ensure database-level defaults are set if the application doesn't provide them.
# The model defines `default=0.5` and `default='suggested'`, which are application-level defaults.
# For Alembic, `server_default` is the way to set DB defaults. Autogenerate would typically pick this up.

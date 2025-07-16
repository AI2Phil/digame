"""Add missing columns to process_notes table

Revision ID: add_process_notes_columns
Revises: 73851b7c9fc9
Create Date: 2025-01-16 04:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_process_notes_columns'
down_revision: Union[str, None] = '73851b7c9fc9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to process_notes table to match current model."""
    
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def column_exists(table_name, column_name):
        """Check if a column exists in a table"""
        try:
            result = connection.execute(sa.text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = '{table_name}'
                    AND column_name = '{column_name}'
                );
            """))
            return result.scalar()
        except Exception:
            return False
    
    def add_column_safe(table_name, column_name, column_def):
        """Safely add a column if it doesn't exist"""
        if not column_exists(table_name, column_name):
            try:
                op.add_column(table_name, column_def)
                print(f"✓ Added column: {table_name}.{column_name}")
            except ProgrammingError as e:
                if "already exists" in str(e).lower():
                    print(f"✓ Column {table_name}.{column_name} already exists")
                else:
                    raise
        else:
            print(f"✓ Column {table_name}.{column_name} already exists")
    
    def drop_column_safe(table_name, column_name):
        """Safely drop a column if it exists"""
        if column_exists(table_name, column_name):
            try:
                op.drop_column(table_name, column_name)
                print(f"✓ Dropped column: {table_name}.{column_name}")
            except ProgrammingError as e:
                if "does not exist" in str(e).lower():
                    print(f"✓ Column {table_name}.{column_name} already dropped")
                else:
                    raise
        else:
            print(f"✓ Column {table_name}.{column_name} does not exist")
    
    # Add new columns required by the ProcessNote model
    add_column_safe('process_notes', 'inferred_task_name', sa.Column('inferred_task_name', sa.String(), nullable=True))
    add_column_safe('process_notes', 'process_steps_description', sa.Column('process_steps_description', sa.Text(), nullable=True))
    add_column_safe('process_notes', 'source_activity_ids', sa.Column('source_activity_ids', sa.JSON(), nullable=True))
    add_column_safe('process_notes', 'occurrence_count', sa.Column('occurrence_count', sa.Integer(), nullable=False, server_default='1'))
    add_column_safe('process_notes', 'first_observed_at', sa.Column('first_observed_at', sa.DateTime(), nullable=True, server_default=sa.func.now()))
    add_column_safe('process_notes', 'last_observed_at', sa.Column('last_observed_at', sa.DateTime(), nullable=True, server_default=sa.func.now()))
    add_column_safe('process_notes', 'user_feedback', sa.Column('user_feedback', sa.String(), nullable=True))
    add_column_safe('process_notes', 'user_tags', sa.Column('user_tags', sa.JSON(), nullable=True))
    
    # Migrate data from old columns to new columns where possible
    try:
        # Copy title to inferred_task_name
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET inferred_task_name = title 
            WHERE inferred_task_name IS NULL AND title IS NOT NULL
        """))
        
        # Copy content to process_steps_description
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET process_steps_description = content 
            WHERE process_steps_description IS NULL AND content IS NOT NULL
        """))
        
        # Copy tags to user_tags
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET user_tags = tags 
            WHERE user_tags IS NULL AND tags IS NOT NULL
        """))
        
        print("✓ Migrated data from old columns to new columns")
    except Exception as e:
        print(f"⚠ Warning during data migration: {e}")
    
    # Drop old columns that are no longer needed
    drop_column_safe('process_notes', 'title')
    drop_column_safe('process_notes', 'content')
    drop_column_safe('process_notes', 'category')
    drop_column_safe('process_notes', 'tags')
    drop_column_safe('process_notes', 'is_private')


def downgrade() -> None:
    """Revert process_notes table to original structure."""
    
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def column_exists(table_name, column_name):
        """Check if a column exists in a table"""
        try:
            result = connection.execute(sa.text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = '{table_name}'
                    AND column_name = '{column_name}'
                );
            """))
            return result.scalar()
        except Exception:
            return False
    
    def add_column_safe(table_name, column_name, column_def):
        """Safely add a column if it doesn't exist"""
        if not column_exists(table_name, column_name):
            try:
                op.add_column(table_name, column_def)
                print(f"✓ Added column: {table_name}.{column_name}")
            except ProgrammingError as e:
                if "already exists" in str(e).lower():
                    print(f"✓ Column {table_name}.{column_name} already exists")
                else:
                    raise
        else:
            print(f"✓ Column {table_name}.{column_name} already exists")
    
    def drop_column_safe(table_name, column_name):
        """Safely drop a column if it exists"""
        if column_exists(table_name, column_name):
            try:
                op.drop_column(table_name, column_name)
                print(f"✓ Dropped column: {table_name}.{column_name}")
            except ProgrammingError as e:
                if "does not exist" in str(e).lower():
                    print(f"✓ Column {table_name}.{column_name} already dropped")
                else:
                    raise
        else:
            print(f"✓ Column {table_name}.{column_name} does not exist")
    
    # Add back original columns
    add_column_safe('process_notes', 'title', sa.Column('title', sa.String(), nullable=False, server_default=''))
    add_column_safe('process_notes', 'content', sa.Column('content', sa.Text(), nullable=False, server_default=''))
    add_column_safe('process_notes', 'category', sa.Column('category', sa.String(), nullable=True))
    add_column_safe('process_notes', 'tags', sa.Column('tags', sa.JSON(), nullable=True))
    add_column_safe('process_notes', 'is_private', sa.Column('is_private', sa.Boolean(), nullable=True))
    
    # Migrate data back where possible
    try:
        # Copy inferred_task_name to title
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET title = COALESCE(inferred_task_name, 'Untitled') 
            WHERE title = '' OR title IS NULL
        """))
        
        # Copy process_steps_description to content
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET content = COALESCE(process_steps_description, 'No description') 
            WHERE content = '' OR content IS NULL
        """))
        
        # Copy user_tags to tags
        connection.execute(sa.text("""
            UPDATE process_notes 
            SET tags = user_tags 
            WHERE tags IS NULL AND user_tags IS NOT NULL
        """))
        
        print("✓ Migrated data back to original columns")
    except Exception as e:
        print(f"⚠ Warning during data migration: {e}")
    
    # Drop new columns
    drop_column_safe('process_notes', 'inferred_task_name')
    drop_column_safe('process_notes', 'process_steps_description')
    drop_column_safe('process_notes', 'source_activity_ids')
    drop_column_safe('process_notes', 'occurrence_count')
    drop_column_safe('process_notes', 'first_observed_at')
    drop_column_safe('process_notes', 'last_observed_at')
    drop_column_safe('process_notes', 'user_feedback')
    drop_column_safe('process_notes', 'user_tags')
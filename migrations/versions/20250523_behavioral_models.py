"""Add behavioral model tables

Revision ID: 20250523_behavioral_models
Revises: 
Create Date: 2025-05-23 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20250523_behavioral_models'
down_revision: Union[str, None] = '001_initial_schema'  # Depends on the initial schema
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to add behavioral model tables."""
    
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
    
    # Create behavioral_models table
    def create_behavioral_models():
        op.create_table(
            'behavioral_models',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('version', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
            sa.Column('algorithm', sa.String(), nullable=False),
            sa.Column('parameters', sa.JSON(), nullable=False),
            sa.Column('silhouette_score', sa.Float(), nullable=True),
            sa.Column('num_clusters', sa.Integer(), nullable=True),
            sa.Column('model_data', sa.LargeBinary(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_behavioral_models_id'), 'behavioral_models', ['id'], unique=False)
            op.create_index(op.f('ix_behavioral_models_user_id'), 'behavioral_models', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('behavioral_models', create_behavioral_models)

    # Create behavioral_patterns table
    def create_behavioral_patterns():
        op.create_table(
            'behavioral_patterns',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('model_id', sa.Integer(), nullable=False),
            sa.Column('pattern_label', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
            sa.Column('size', sa.Integer(), nullable=False),
            sa.Column('centroid', sa.JSON(), nullable=True),
            sa.Column('representative_activities', sa.JSON(), nullable=True),
            sa.Column('temporal_distribution', sa.JSON(), nullable=True),
            sa.Column('activity_distribution', sa.JSON(), nullable=True),
            sa.Column('context_features', sa.JSON(), nullable=True),
            sa.ForeignKeyConstraint(['model_id'], ['behavioral_models.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_behavioral_patterns_id'), 'behavioral_patterns', ['id'], unique=False)
            op.create_index(op.f('ix_behavioral_patterns_model_id'), 'behavioral_patterns', ['model_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('behavioral_patterns', create_behavioral_patterns)


def downgrade() -> None:
    """Downgrade schema by removing behavioral model tables."""
    
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
    
    # Drop behavioral_patterns table
    def drop_behavioral_patterns():
        try:
            op.drop_index(op.f('ix_behavioral_patterns_model_id'), table_name='behavioral_patterns')
            op.drop_index(op.f('ix_behavioral_patterns_id'), table_name='behavioral_patterns')
        except ProgrammingError:
            pass
        op.drop_table('behavioral_patterns')
    
    drop_table_safe('behavioral_patterns', drop_behavioral_patterns)
    
    # Drop behavioral_models table
    def drop_behavioral_models():
        try:
            op.drop_index(op.f('ix_behavioral_models_user_id'), table_name='behavioral_models')
            op.drop_index(op.f('ix_behavioral_models_id'), table_name='behavioral_models')
        except ProgrammingError:
            pass
        op.drop_table('behavioral_models')
    
    drop_table_safe('behavioral_models', drop_behavioral_models)
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
down_revision: Union[str, None] = None  # Set to the previous migration if there is one
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to add behavioral model tables."""
    
    # Create behavioral_models table
    op.create_table(
        'behavioral_models',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('algorithm', sa.String(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=False),
        sa.Column('silhouette_score', sa.Float(), nullable=True),
        sa.Column('num_clusters', sa.Integer(), nullable=True),
        sa.Column('model_data', sa.LargeBinary(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_behavioral_models_id'), 'behavioral_models', ['id'], unique=False)
    op.create_index(op.f('ix_behavioral_models_user_id'), 'behavioral_models', ['user_id'], unique=False)

    # Create behavioral_patterns table
    op.create_table(
        'behavioral_patterns',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('model_id', sa.Integer(), nullable=False),
        sa.Column('pattern_label', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('centroid', sa.JSON(), nullable=True),
        sa.Column('representative_activities', sa.JSON(), nullable=True),
        sa.Column('temporal_distribution', sa.JSON(), nullable=True),
        sa.Column('activity_distribution', sa.JSON(), nullable=True),
        sa.Column('context_features', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['model_id'], ['behavioral_models.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_behavioral_patterns_id'), 'behavioral_patterns', ['id'], unique=False)
    op.create_index(op.f('ix_behavioral_patterns_model_id'), 'behavioral_patterns', ['model_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema by removing behavioral model tables."""
    
    # Drop behavioral_patterns table
    op.drop_index(op.f('ix_behavioral_patterns_model_id'), table_name='behavioral_patterns')
    op.drop_index(op.f('ix_behavioral_patterns_id'), table_name='behavioral_patterns')
    op.drop_table('behavioral_patterns')
    
    # Drop behavioral_models table
    op.drop_index(op.f('ix_behavioral_models_user_id'), table_name='behavioral_models')
    op.drop_index(op.f('ix_behavioral_models_id'), table_name='behavioral_models')
    op.drop_table('behavioral_models')
"""add_social_features_to_user_model

Revision ID: 1f8bb840e23e
Revises: 20250523_multi_tenancy
Create Date: 2025-06-19 22:18:48.951154

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
# sqlalchemy.JSON should be available via sa.JSON, no specific dialect import needed unless required by project setup.

# revision identifiers, used by Alembic.
revision: str = '1f8bb840e23e'
down_revision: Union[str, None] = '20250523_multi_tenancy'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('skills', sa.JSON(), nullable=False, server_default='[]'))
    op.add_column('users', sa.Column('learning_goals', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('interests', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('current_projects', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('is_seeking_mentor', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('is_offering_mentorship', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'is_offering_mentorship')
    op.drop_column('users', 'is_seeking_mentor')
    op.drop_column('users', 'current_projects')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'learning_goals')
    op.drop_column('users', 'skills')

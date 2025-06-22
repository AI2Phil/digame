"""create_notifications_table

Revision ID: bf48d656bca9
Revises: de5655c45622
Create Date: 2025-06-19 23:22:16.252359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf48d656bca9'
down_revision: Union[str, None] = 'de5655c45622'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False, index=True),
        sa.Column('user_id', sa.Integer(), nullable=False, index=True),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.false()), # Explicit server_default for boolean
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ) # Assumes 'users' table name for User model
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('notifications')

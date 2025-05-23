"""add_user_setting_table_manual

Revision ID: manual_001
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'manual_001'
down_revision: Union[str, None] = '20250523_behavioral_models' # From the last empty autogen script
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('api_keys', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_settings')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_settings_user_id_users')),
        sa.UniqueConstraint('user_id', name=op.f('uq_user_settings_user_id'))
    )
    # Explicitly create index for user_id, even if unique constraint might create one, for FK performance.
    # The unique=False here is standard practice for non-unique indexes; the unique constraint handles uniqueness.
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_settings_user_id'), table_name='user_settings')
    op.drop_table('user_settings')

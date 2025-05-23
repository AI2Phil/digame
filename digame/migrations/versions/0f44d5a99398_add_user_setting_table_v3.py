"""add_user_setting_table_v3

Revision ID: 0f44d5a99398
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:42:46.736631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f44d5a99398'
down_revision: Union[str, None] = '20250523_behavioral_models'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

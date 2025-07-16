"""merge heads for process notes schema

Revision ID: ccab17e6c564
Revises: 85031fea9235, add_process_notes_columns
Create Date: 2025-07-15 22:39:03.130279

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ccab17e6c564'
down_revision: Union[str, None] = ('85031fea9235', 'add_process_notes_columns')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

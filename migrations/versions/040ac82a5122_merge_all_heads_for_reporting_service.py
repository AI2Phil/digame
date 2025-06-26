"""merge_all_heads_for_reporting_service

Revision ID: 040ac82a5122
Revises: 57fc3ffd4476, 662a682a6173, 70f857b2e16f, 895e8a925f33, d14e45395782
Create Date: 2025-06-23 12:04:42.294797

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '040ac82a5122'
down_revision: Union[str, None] = ('57fc3ffd4476', '662a682a6173', '70f857b2e16f', '895e8a925f33', 'd14e45395782')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

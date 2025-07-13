"""merge_base_and_reconciliation_heads

Revision ID: 5ef430e6d7e2
Revises: 6c5ca693e676, 96ceab13c174
Create Date: 2025-07-12 22:10:11.247175

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5ef430e6d7e2'
down_revision: Union[str, None] = ('6c5ca693e676', '96ceab13c174')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

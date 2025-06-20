"""Merge multiple heads before creating notifications table

Revision ID: de5655c45622
Revises: 20250523_multi_tenancy, manual_001
Create Date: 2025-06-19 23:22:00.290070

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de5655c45622'
down_revision: Union[str, None] = ('20250523_multi_tenancy', 'manual_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

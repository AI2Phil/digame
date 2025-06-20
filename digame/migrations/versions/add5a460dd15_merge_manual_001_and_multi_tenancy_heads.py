"""merge_manual_001_and_multi_tenancy_heads

Revision ID: add5a460dd15
Revises: 20250523_multi_tenancy, manual_001
Create Date: 2025-06-20 00:39:23.470494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add5a460dd15'
down_revision: Union[str, None] = ('20250523_multi_tenancy', 'manual_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

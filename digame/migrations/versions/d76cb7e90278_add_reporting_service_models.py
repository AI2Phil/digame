"""Add reporting service models

Revision ID: d76cb7e90278
Revises: 20250622_team_collab
Create Date: 2025-06-22 21:53:18.893708

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd76cb7e90278'
down_revision: Union[str, None] = '20250622_team_collab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # This migration was auto-generated but all tables are already created by gamification migration
    # No additional tables needed for reporting service at this time
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # No tables were created in upgrade, so nothing to drop
    pass

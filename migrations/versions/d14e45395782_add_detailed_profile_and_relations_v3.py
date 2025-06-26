"""add_detailed_profile_and_relations_v3

Revision ID: d14e45395782
Revises: d53046c2a672
Create Date: 2025-06-19 20:18:55.220631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd14e45395782'
down_revision: Union[str, None] = 'd53046c2a672'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

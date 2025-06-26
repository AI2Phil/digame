"""add_full_workflow_automation_tables

Revision ID: 895e8a925f33
Revises: 20250523_multi_tenancy
Create Date: 2025-06-19 01:21:35.514863

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '895e8a925f33'
down_revision: Union[str, None] = '20250523_multi_tenancy'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

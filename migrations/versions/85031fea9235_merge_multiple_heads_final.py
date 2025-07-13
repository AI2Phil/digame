"""merge_multiple_heads_final

Revision ID: 85031fea9235
Revises: 73851b7c9fc9, add_user_name_columns
Create Date: 2025-07-13 13:31:37.268033

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85031fea9235'
down_revision: Union[str, None] = ('73851b7c9fc9', 'add_user_name_columns')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

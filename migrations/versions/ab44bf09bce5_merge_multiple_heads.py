"""merge_multiple_heads

Revision ID: ab44bf09bce5
Revises: 001_phase1_social_learning, 003_security_models, 20250626_rbac_tenant_refactor, add_profiles_rbac, create_reporting_tables_manual
Create Date: 2025-07-12 21:55:46.895606

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab44bf09bce5'
down_revision: Union[str, None] = ('001_phase1_social_learning', '003_security_models', '20250626_rbac_tenant_refactor', 'add_profiles_rbac', 'create_reporting_tables_manual')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

"""Expand alembic version column before other migrations

Revision ID: 000_expand_alembic
Revises: 001_initial_schema
Create Date: 2025-01-12 12:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '000_expand_alembic'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Expand alembic_version.version_num column to accommodate longer revision names."""
    
    print("Expanding alembic_version.version_num column to prevent truncation errors")
    
    # Use raw SQL for maximum PostgreSQL compatibility
    try:
        op.execute("""
            ALTER TABLE alembic_version 
            ALTER COLUMN version_num TYPE varchar(128)
        """)
        print("Successfully expanded alembic_version.version_num to varchar(128)")
    except Exception as e:
        print(f"Note: Could not expand alembic_version column (may not exist yet): {e}")
        # This is expected if alembic_version table doesn't exist yet
        pass


def downgrade() -> None:
    """Revert alembic_version.version_num column back to original size."""
    
    try:
        # Check if any version strings would be truncated
        connection = op.get_bind()
        result = connection.execute(sa.text("""
            SELECT COUNT(*) FROM alembic_version 
            WHERE LENGTH(version_num) > 32
        """))
        
        count = result.scalar() or 0
        if count > 0:
            print(f"Warning: {count} version strings are longer than 32 characters")
            print("Cannot safely downgrade column size")
            return
        
        op.execute("""
            ALTER TABLE alembic_version 
            ALTER COLUMN version_num TYPE varchar(32)
        """)
        print("Successfully reverted alembic_version.version_num to varchar(32)")
    except Exception as e:
        print(f"Note: Could not revert alembic_version column: {e}")
        pass
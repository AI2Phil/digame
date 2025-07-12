"""Expand alembic_version column size

Revision ID: expand_alembic_col
Revises: add_profiles_rbac
Create Date: 2025-01-12 12:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'expand_alembic_col'
down_revision: Union[str, None] = 'add_profiles_rbac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Expand alembic_version.version_num column to accommodate longer revision names."""
    
    # Check if alembic_version table exists and get current column info
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    if 'alembic_version' in inspector.get_table_names():
        print("Expanding alembic_version.version_num column from varchar(32) to varchar(128)")
        
        # Use raw SQL for better PostgreSQL compatibility
        op.execute("""
            ALTER TABLE alembic_version 
            ALTER COLUMN version_num TYPE varchar(128)
        """)
        
        print("Successfully expanded alembic_version.version_num column")
    else:
        print("alembic_version table not found, skipping column expansion")


def downgrade() -> None:
    """Revert alembic_version.version_num column back to original size."""
    
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    if 'alembic_version' in inspector.get_table_names():
        print("Reverting alembic_version.version_num column from varchar(128) to varchar(32)")
        
        # Check if any existing version strings are longer than 32 characters
        result = connection.execute(sa.text("""
            SELECT version_num FROM alembic_version 
            WHERE LENGTH(version_num) > 32
        """))
        
        long_versions = result.fetchall()
        if long_versions:
            print(f"Warning: Found {len(long_versions)} version strings longer than 32 characters:")
            for version in long_versions:
                print(f"  - {version[0]} ({len(version[0])} chars)")
            print("Cannot safely downgrade column size. Manual intervention required.")
            return
        
        # Safe to downgrade
        op.execute("""
            ALTER TABLE alembic_version 
            ALTER COLUMN version_num TYPE varchar(32)
        """)
        
        print("Successfully reverted alembic_version.version_num column")
    else:
        print("alembic_version table not found, skipping column reversion")
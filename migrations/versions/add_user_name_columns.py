"""Add first_name and last_name columns to users table

Revision ID: add_user_name_columns
Revises: 
Create Date: 2025-01-12 23:47:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_name_columns'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add first_name and last_name columns to users table if they don't exist"""
    # Check if columns exist before adding them
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Get existing columns
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Add first_name column if it doesn't exist
    if 'first_name' not in existing_columns:
        op.add_column('users', sa.Column('first_name', sa.String(), nullable=True))
    
    # Add last_name column if it doesn't exist
    if 'last_name' not in existing_columns:
        op.add_column('users', sa.Column('last_name', sa.String(), nullable=True))


def downgrade():
    """Remove first_name and last_name columns from users table"""
    # Check if columns exist before dropping them
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Get existing columns
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Drop columns if they exist
    if 'last_name' in existing_columns:
        op.drop_column('users', 'last_name')
    
    if 'first_name' in existing_columns:
        op.drop_column('users', 'first_name')
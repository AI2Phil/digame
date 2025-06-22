"""Add team collaboration tables

Revision ID: 20250622_add_team_collaboration_tables
Revises: 20250622_add_gamification_tables
Create Date: 2025-06-22 17:21:30.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '20250622_add_team_collaboration_tables'
down_revision = '20250622_gamification'
branch_labels = None
depends_on = None


def upgrade():
    # Create teams table
    op.create_table('teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teams_id'), 'teams', ['id'], unique=False)
    op.create_index(op.f('ix_teams_name'), 'teams', ['name'], unique=False)

    # Create team_members table
    op.create_table('team_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, default='member'),
        sa.Column('joined_at', sa.DateTime(), nullable=True),
        sa.Column('custom_attributes', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id', 'user_id', name='unique_team_user')
    )
    op.create_index(op.f('ix_team_members_id'), 'team_members', ['id'], unique=False)
    op.create_index(op.f('ix_team_members_team_id'), 'team_members', ['team_id'], unique=False)
    op.create_index(op.f('ix_team_members_user_id'), 'team_members', ['user_id'], unique=False)

    # Create team_performance_metrics table
    op.create_table('team_performance_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_value', sa.JSON(), nullable=False),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_team_performance_metrics_id'), 'team_performance_metrics', ['id'], unique=False)
    op.create_index(op.f('ix_team_performance_metrics_team_id'), 'team_performance_metrics', ['team_id'], unique=False)

    # Create team_skill_gaps table
    op.create_table('team_skill_gaps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('skill_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('identified_at', sa.DateTime(), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=True, default=0),
        sa.Column('suggested_development_plan', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_team_skill_gaps_id'), 'team_skill_gaps', ['id'], unique=False)
    op.create_index(op.f('ix_team_skill_gaps_team_id'), 'team_skill_gaps', ['team_id'], unique=False)
    op.create_index(op.f('ix_team_skill_gaps_skill_name'), 'team_skill_gaps', ['skill_name'], unique=False)

    # Create team_workflows table
    op.create_table('team_workflows',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('workflow_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('steps', sa.JSON(), nullable=True),
        sa.Column('is_optimized', sa.Integer(), nullable=True, default=0),
        sa.Column('optimization_suggestions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_team_workflows_id'), 'team_workflows', ['id'], unique=False)
    op.create_index(op.f('ix_team_workflows_team_id'), 'team_workflows', ['team_id'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_team_workflows_team_id'), table_name='team_workflows')
    op.drop_index(op.f('ix_team_workflows_id'), table_name='team_workflows')
    op.drop_table('team_workflows')
    
    op.drop_index(op.f('ix_team_skill_gaps_skill_name'), table_name='team_skill_gaps')
    op.drop_index(op.f('ix_team_skill_gaps_team_id'), table_name='team_skill_gaps')
    op.drop_index(op.f('ix_team_skill_gaps_id'), table_name='team_skill_gaps')
    op.drop_table('team_skill_gaps')
    
    op.drop_index(op.f('ix_team_performance_metrics_team_id'), table_name='team_performance_metrics')
    op.drop_index(op.f('ix_team_performance_metrics_id'), table_name='team_performance_metrics')
    op.drop_table('team_performance_metrics')
    
    op.drop_index(op.f('ix_team_members_user_id'), table_name='team_members')
    op.drop_index(op.f('ix_team_members_team_id'), table_name='team_members')
    op.drop_index(op.f('ix_team_members_id'), table_name='team_members')
    op.drop_table('team_members')
    
    op.drop_index(op.f('ix_teams_name'), table_name='teams')
    op.drop_index(op.f('ix_teams_id'), table_name='teams')
    op.drop_table('teams')
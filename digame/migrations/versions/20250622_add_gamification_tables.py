"""Add gamification tables

Revision ID: 20250622_gamification
Revises: manual_001_add_user_setting_table
Create Date: 2025-06-22 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250622_gamification'
down_revision = 'manual_001_add_user_setting_table'
branch_labels = None
depends_on = None


def upgrade():
    # Create achievements table
    op.create_table('achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('type', sa.Enum('GOAL_COMPLETION', 'STREAK', 'MILESTONE', 'SOCIAL', 'LEARNING', 'PRODUCTIVITY', 'PROFILE', 'ACTIVITY', name='achievementtype'), nullable=False),
        sa.Column('rarity', sa.Enum('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', name='achievementrarity'), nullable=True),
        sa.Column('criteria', sa.JSON(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('max_progress', sa.Integer(), nullable=True),
        sa.Column('is_repeatable', sa.Boolean(), nullable=True),
        sa.Column('is_hidden', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)

    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_id', sa.Integer(), nullable=False),
        sa.Column('current_progress', sa.Integer(), nullable=True),
        sa.Column('earned', sa.Boolean(), nullable=True),
        sa.Column('earned_at', sa.DateTime(), nullable=True),
        sa.Column('context_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'achievement_id', name='uq_user_achievement')
    )
    op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)

    # Create streaks table
    op.create_table('streaks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('streak_type', sa.String(length=50), nullable=False),
        sa.Column('current_count', sa.Integer(), nullable=True),
        sa.Column('longest_count', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('last_activity_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_streaks_id'), 'streaks', ['id'], unique=False)

    # Create milestones table
    op.create_table('milestones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('goal_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('reward_points', sa.Integer(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_milestones_id'), 'milestones', ['id'], unique=False)

    # Create user_points table
    op.create_table('user_points',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_points', sa.Integer(), nullable=True),
        sa.Column('achievement_points', sa.Integer(), nullable=True),
        sa.Column('goal_points', sa.Integer(), nullable=True),
        sa.Column('streak_points', sa.Integer(), nullable=True),
        sa.Column('social_points', sa.Integer(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('experience_points', sa.Integer(), nullable=True),
        sa.Column('points_to_next_level', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_points_id'), 'user_points', ['id'], unique=False)

    # Create badges table
    op.create_table('badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('rarity', sa.Enum('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', name='achievementrarity'), nullable=True),
        sa.Column('criteria', sa.JSON(), nullable=False),
        sa.Column('is_exclusive', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_badges_id'), 'badges', ['id'], unique=False)

    # Create user_badges table
    op.create_table('user_badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('badge_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(), nullable=True),
        sa.Column('is_displayed', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['badge_id'], ['badges.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'badge_id', name='uq_user_badge')
    )
    op.create_index(op.f('ix_user_badges_id'), 'user_badges', ['id'], unique=False)

    # Create leaderboard_entries table
    op.create_table('leaderboard_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('leaderboard_type', sa.String(length=50), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=False),
        sa.Column('period_end', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leaderboard_entries_id'), 'leaderboard_entries', ['id'], unique=False)

    # Create indexes for better performance
    op.create_index('ix_achievements_category', 'achievements', ['category'])
    op.create_index('ix_achievements_type', 'achievements', ['type'])
    op.create_index('ix_achievements_rarity', 'achievements', ['rarity'])
    op.create_index('ix_user_achievements_user_id', 'user_achievements', ['user_id'])
    op.create_index('ix_user_achievements_earned', 'user_achievements', ['earned'])
    op.create_index('ix_streaks_user_id', 'streaks', ['user_id'])
    op.create_index('ix_streaks_type', 'streaks', ['streak_type'])
    op.create_index('ix_streaks_active', 'streaks', ['is_active'])
    op.create_index('ix_user_points_user_id', 'user_points', ['user_id'])
    op.create_index('ix_user_points_total', 'user_points', ['total_points'])
    op.create_index('ix_user_points_level', 'user_points', ['level'])
    op.create_index('ix_leaderboard_type', 'leaderboard_entries', ['leaderboard_type'])
    op.create_index('ix_leaderboard_period', 'leaderboard_entries', ['period_start', 'period_end'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_leaderboard_period', table_name='leaderboard_entries')
    op.drop_index('ix_leaderboard_type', table_name='leaderboard_entries')
    op.drop_index('ix_user_points_level', table_name='user_points')
    op.drop_index('ix_user_points_total', table_name='user_points')
    op.drop_index('ix_user_points_user_id', table_name='user_points')
    op.drop_index('ix_streaks_active', table_name='streaks')
    op.drop_index('ix_streaks_type', table_name='streaks')
    op.drop_index('ix_streaks_user_id', table_name='streaks')
    op.drop_index('ix_user_achievements_earned', table_name='user_achievements')
    op.drop_index('ix_user_achievements_user_id', table_name='user_achievements')
    op.drop_index('ix_achievements_rarity', table_name='achievements')
    op.drop_index('ix_achievements_type', table_name='achievements')
    op.drop_index('ix_achievements_category', table_name='achievements')

    # Drop tables
    op.drop_index(op.f('ix_leaderboard_entries_id'), table_name='leaderboard_entries')
    op.drop_table('leaderboard_entries')
    op.drop_index(op.f('ix_user_badges_id'), table_name='user_badges')
    op.drop_table('user_badges')
    op.drop_index(op.f('ix_badges_id'), table_name='badges')
    op.drop_table('badges')
    op.drop_index(op.f('ix_user_points_id'), table_name='user_points')
    op.drop_table('user_points')
    op.drop_index(op.f('ix_milestones_id'), table_name='milestones')
    op.drop_table('milestones')
    op.drop_index(op.f('ix_streaks_id'), table_name='streaks')
    op.drop_table('streaks')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_table('user_achievements')
    op.drop_index(op.f('ix_achievements_id'), table_name='achievements')
    op.drop_table('achievements')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS achievementrarity')
    op.execute('DROP TYPE IF EXISTS achievementtype')
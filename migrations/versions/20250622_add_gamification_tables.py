"""Add gamification tables

Revision ID: 20250622_gamification
Revises: manual_001_user_settings
Create Date: 2025-06-22 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250622_gamification'
down_revision = 'manual_001_user_settings'
branch_labels = None
depends_on = None


def upgrade():
    from alembic import context
    from sqlalchemy.exc import ProgrammingError
    
    connection = context.get_bind()
    
    def table_exists(table_name):
        """Check if a table exists using raw SQL"""
        try:
            result = connection.execute(sa.text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = '{table_name}'
                );
            """))
            return result.scalar()
        except Exception:
            # Fallback: try to query the table directly
            try:
                connection.execute(sa.text(f"SELECT 1 FROM {table_name} LIMIT 1"))
                return True
            except Exception:
                return False
    
    def create_table_safe(table_name, create_func):
        """Safely create a table, handling conflicts"""
        if not table_exists(table_name):
            try:
                create_func()
                print(f"✓ Created table: {table_name}")
            except ProgrammingError as e:
                if "already exists" in str(e).lower():
                    print(f"✓ Table {table_name} already exists")
                else:
                    raise
        else:
            print(f"✓ Table {table_name} already exists")
    
    # Create achievements table
    def create_achievements():
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
        try:
            op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('achievements', create_achievements)

    # Create user_achievements table
    def create_user_achievements():
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
        try:
            op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('user_achievements', create_user_achievements)

    # Create streaks table
    def create_streaks():
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
        try:
            op.create_index(op.f('ix_streaks_id'), 'streaks', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('streaks', create_streaks)

    # Create milestones table
    def create_milestones():
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
        try:
            op.create_index(op.f('ix_milestones_id'), 'milestones', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('milestones', create_milestones)

    # Create user_points table
    def create_user_points():
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
        try:
            op.create_index(op.f('ix_user_points_id'), 'user_points', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('user_points', create_user_points)

    # Create badges table
    def create_badges():
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
        try:
            op.create_index(op.f('ix_badges_id'), 'badges', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('badges', create_badges)

    # Create user_badges table
    def create_user_badges():
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
        try:
            op.create_index(op.f('ix_user_badges_id'), 'user_badges', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('user_badges', create_user_badges)

    # Create leaderboard_entries table
    def create_leaderboard_entries():
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
        try:
            op.create_index(op.f('ix_leaderboard_entries_id'), 'leaderboard_entries', ['id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('leaderboard_entries', create_leaderboard_entries)

    # Create indexes for better performance
    try:
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
        print("✓ Created performance indexes")
    except ProgrammingError:
        print("✓ Performance indexes already exist")


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
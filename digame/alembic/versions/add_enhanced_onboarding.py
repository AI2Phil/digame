"""Add enhanced onboarding tables

Revision ID: add_enhanced_onboarding
Revises: 
Create Date: 2025-06-22 16:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_enhanced_onboarding'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create user_onboarding_progress table
    op.create_table('user_onboarding_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_step_id', sa.String(length=100), nullable=True, default='welcome'),
        sa.Column('completed_all', sa.Boolean(), nullable=True, default=False),
        sa.Column('completion_percentage', sa.Float(), nullable=True, default=0.0),
        sa.Column('completed_steps', sa.JSON(), nullable=True),
        sa.Column('step_data', sa.JSON(), nullable=True),
        sa.Column('preferences', sa.JSON(), nullable=True),
        sa.Column('onboarding_customizations', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_onboarding_progress_id'), 'user_onboarding_progress', ['id'], unique=False)
    op.create_index(op.f('ix_user_onboarding_progress_user_id'), 'user_onboarding_progress', ['user_id'], unique=False)

    # Create onboarding_analytics table
    op.create_table('onboarding_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('step_id', sa.String(length=100), nullable=False),
        sa.Column('step_name', sa.String(length=255), nullable=False),
        sa.Column('step_started_at', sa.DateTime(), nullable=True),
        sa.Column('step_completed_at', sa.DateTime(), nullable=True),
        sa.Column('time_spent_seconds', sa.Integer(), nullable=True),
        sa.Column('clicks_count', sa.Integer(), nullable=True, default=0),
        sa.Column('form_submissions', sa.Integer(), nullable=True, default=0),
        sa.Column('help_requests', sa.Integer(), nullable=True, default=0),
        sa.Column('skip_actions', sa.Integer(), nullable=True, default=0),
        sa.Column('completed_successfully', sa.Boolean(), nullable=True, default=False),
        sa.Column('completion_method', sa.String(length=50), nullable=True),
        sa.Column('interaction_data', sa.JSON(), nullable=True),
        sa.Column('errors_encountered', sa.JSON(), nullable=True),
        sa.Column('device_type', sa.String(length=50), nullable=True),
        sa.Column('browser_info', sa.String(length=255), nullable=True),
        sa.Column('screen_resolution', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_onboarding_analytics_id'), 'onboarding_analytics', ['id'], unique=False)
    op.create_index(op.f('ix_onboarding_analytics_user_id'), 'onboarding_analytics', ['user_id'], unique=False)
    op.create_index(op.f('ix_onboarding_analytics_step_id'), 'onboarding_analytics', ['step_id'], unique=False)

    # Create onboarding_metrics table
    op.create_table('onboarding_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=False),
        sa.Column('period_end', sa.DateTime(), nullable=False),
        sa.Column('period_type', sa.String(length=50), nullable=False),
        sa.Column('total_users_started', sa.Integer(), nullable=True, default=0),
        sa.Column('total_users_completed', sa.Integer(), nullable=True, default=0),
        sa.Column('completion_rate', sa.Float(), nullable=True, default=0.0),
        sa.Column('average_completion_time_minutes', sa.Float(), nullable=True),
        sa.Column('median_completion_time_minutes', sa.Float(), nullable=True),
        sa.Column('fastest_completion_minutes', sa.Float(), nullable=True),
        sa.Column('slowest_completion_minutes', sa.Float(), nullable=True),
        sa.Column('step_completion_rates', sa.JSON(), nullable=True),
        sa.Column('step_average_times', sa.JSON(), nullable=True),
        sa.Column('step_abandonment_rates', sa.JSON(), nullable=True),
        sa.Column('average_clicks_per_user', sa.Float(), nullable=True, default=0.0),
        sa.Column('average_help_requests', sa.Float(), nullable=True, default=0.0),
        sa.Column('skip_rate', sa.Float(), nullable=True, default=0.0),
        sa.Column('device_breakdown', sa.JSON(), nullable=True),
        sa.Column('browser_breakdown', sa.JSON(), nullable=True),
        sa.Column('error_rate', sa.Float(), nullable=True, default=0.0),
        sa.Column('user_satisfaction_score', sa.Float(), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_onboarding_metrics_id'), 'onboarding_metrics', ['id'], unique=False)
    op.create_index(op.f('ix_onboarding_metrics_period_start'), 'onboarding_metrics', ['period_start'], unique=False)
    op.create_index(op.f('ix_onboarding_metrics_period_end'), 'onboarding_metrics', ['period_end'], unique=False)

    # Create onboarding_feedback table
    op.create_table('onboarding_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('step_id', sa.String(length=100), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=True),
        sa.Column('ease_of_use', sa.Integer(), nullable=True),
        sa.Column('clarity', sa.Integer(), nullable=True),
        sa.Column('usefulness', sa.Integer(), nullable=True),
        sa.Column('suggested_improvements', sa.Text(), nullable=True),
        sa.Column('would_recommend', sa.Boolean(), nullable=True),
        sa.Column('feedback_type', sa.String(length=50), nullable=True, default='completion'),
        sa.Column('device_type', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_onboarding_feedback_id'), 'onboarding_feedback', ['id'], unique=False)
    op.create_index(op.f('ix_onboarding_feedback_user_id'), 'onboarding_feedback', ['user_id'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_onboarding_feedback_user_id'), table_name='onboarding_feedback')
    op.drop_index(op.f('ix_onboarding_feedback_id'), table_name='onboarding_feedback')
    op.drop_table('onboarding_feedback')
    
    op.drop_index(op.f('ix_onboarding_metrics_period_end'), table_name='onboarding_metrics')
    op.drop_index(op.f('ix_onboarding_metrics_period_start'), table_name='onboarding_metrics')
    op.drop_index(op.f('ix_onboarding_metrics_id'), table_name='onboarding_metrics')
    op.drop_table('onboarding_metrics')
    
    op.drop_index(op.f('ix_onboarding_analytics_step_id'), table_name='onboarding_analytics')
    op.drop_index(op.f('ix_onboarding_analytics_user_id'), table_name='onboarding_analytics')
    op.drop_index(op.f('ix_onboarding_analytics_id'), table_name='onboarding_analytics')
    op.drop_table('onboarding_analytics')
    
    op.drop_index(op.f('ix_user_onboarding_progress_user_id'), table_name='user_onboarding_progress')
    op.drop_index(op.f('ix_user_onboarding_progress_id'), table_name='user_onboarding_progress')
    op.drop_table('user_onboarding_progress')
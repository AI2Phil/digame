"""Phase 1: Social Networking and Learning Database Schema

Revision ID: 001_phase1_social_learning
Revises: 
Create Date: 2025-01-09 18:47:00.000000

This migration creates the foundational database schema for Phase 1 implementation:
- Social Networking tables (user connections, peer matching, social metrics)
- Learning & Development tables (courses, enrollments, progress tracking)
- Supporting tables for AI-powered features

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_phase1_social_learning'
down_revision = '002_aco_integration'
branch_labels = None
depends_on = None


def upgrade():
    # ========================================
    # SOCIAL NETWORKING TABLES
    # ========================================
    
    # User Connections Table
    op.create_table('user_connections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('connected_user_id', sa.Integer(), nullable=False),
        sa.Column('connection_type', sa.String(50), nullable=False, default='professional'),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        sa.Column('initiated_by', sa.Integer(), nullable=False),
        sa.Column('connected_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['connected_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['initiated_by'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'connected_user_id', name='unique_user_connection')
    )
    
    # Peer Matching Table
    op.create_table('peer_matches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('matched_user_id', sa.Integer(), nullable=False),
        sa.Column('compatibility_score', sa.Numeric(5, 2), nullable=False),
        sa.Column('match_factors', postgresql.JSONB(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='suggested'),
        sa.Column('viewed_at', sa.DateTime(), nullable=True),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['matched_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'matched_user_id', name='unique_peer_match')
    )
    
    # Social Metrics Table
    op.create_table('social_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_connections', sa.Integer(), nullable=False, default=0),
        sa.Column('active_mentorships', sa.Integer(), nullable=False, default=0),
        sa.Column('learning_partnerships', sa.Integer(), nullable=False, default=0),
        sa.Column('knowledge_shared', sa.Integer(), nullable=False, default=0),
        sa.Column('collaboration_score', sa.Integer(), nullable=False, default=0),
        sa.Column('network_growth_rate', sa.Numeric(5, 2), nullable=False, default=0.0),
        sa.Column('engagement_level', sa.String(20), nullable=False, default='low'),
        sa.Column('last_calculated', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', name='unique_user_social_metrics')
    )
    
    # User Skills Table (for peer matching)
    op.create_table('user_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skill_name', sa.String(100), nullable=False),
        sa.Column('proficiency_level', sa.String(20), nullable=False),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('is_seeking_mentorship', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_offering_mentorship', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'skill_name', name='unique_user_skill')
    )
    
    # ========================================
    # LEARNING & DEVELOPMENT TABLES
    # ========================================
    
    # Course Categories Table
    op.create_table('course_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_category_id', sa.Integer(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parent_category_id'], ['course_categories.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('name', name='unique_category_name')
    )
    
    # Courses Table
    op.create_table('courses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('short_description', sa.String(500), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('difficulty_level', sa.String(20), nullable=False, default='beginner'),
        sa.Column('duration_hours', sa.Integer(), nullable=True),
        sa.Column('estimated_completion_days', sa.Integer(), nullable=True),
        sa.Column('prerequisites', postgresql.JSONB(), nullable=True),
        sa.Column('learning_objectives', postgresql.JSONB(), nullable=True),
        sa.Column('skills_covered', postgresql.JSONB(), nullable=True),
        sa.Column('instructor_id', sa.Integer(), nullable=True),
        sa.Column('max_enrollments', sa.Integer(), nullable=True),
        sa.Column('current_enrollments', sa.Integer(), nullable=False, default=0),
        sa.Column('rating_average', sa.Numeric(3, 2), nullable=True),
        sa.Column('rating_count', sa.Integer(), nullable=False, default=0),
        sa.Column('is_published', sa.Boolean(), nullable=False, default=False),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['course_categories.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['instructor_id'], ['users.id'], ondelete='SET NULL')
    )
    
    # Course Enrollments Table
    op.create_table('course_enrollments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('progress_percentage', sa.Numeric(5, 2), nullable=False, default=0.0),
        sa.Column('status', sa.String(20), nullable=False, default='enrolled'),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=True),
        sa.Column('time_spent_minutes', sa.Integer(), nullable=False, default=0),
        sa.Column('enrolled_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'course_id', name='unique_user_course_enrollment')
    )
    
    # Learning Progress Table
    op.create_table('learning_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skill_name', sa.String(100), nullable=False),
        sa.Column('current_level', sa.String(20), nullable=False, default='beginner'),
        sa.Column('target_level', sa.String(20), nullable=True),
        sa.Column('progress_percentage', sa.Numeric(5, 2), nullable=False, default=0.0),
        sa.Column('courses_completed', sa.Integer(), nullable=False, default=0),
        sa.Column('total_study_hours', sa.Integer(), nullable=False, default=0),
        sa.Column('last_activity_at', sa.DateTime(), nullable=True),
        sa.Column('target_completion_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'skill_name', name='unique_user_skill_progress')
    )
    
    # Learning Recommendations Table (AI-powered)
    op.create_table('learning_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=True),
        sa.Column('skill_name', sa.String(100), nullable=True),
        sa.Column('recommendation_type', sa.String(50), nullable=False),
        sa.Column('recommendation_reason', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Numeric(3, 2), nullable=False),
        sa.Column('priority_score', sa.Integer(), nullable=False, default=1),
        sa.Column('is_viewed', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_accepted', sa.Boolean(), nullable=True),
        sa.Column('viewed_at', sa.DateTime(), nullable=True),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE')
    )
    
    # ========================================
    # INDEXES FOR PERFORMANCE
    # ========================================
    
    # Social Networking Indexes
    op.create_index('idx_user_connections_user_id', 'user_connections', ['user_id'])
    op.create_index('idx_user_connections_connected_user_id', 'user_connections', ['connected_user_id'])
    op.create_index('idx_user_connections_status', 'user_connections', ['status'])
    op.create_index('idx_peer_matches_user_id', 'peer_matches', ['user_id'])
    op.create_index('idx_peer_matches_compatibility_score', 'peer_matches', ['compatibility_score'])
    op.create_index('idx_user_skills_user_id', 'user_skills', ['user_id'])
    op.create_index('idx_user_skills_skill_name', 'user_skills', ['skill_name'])
    
    # Learning & Development Indexes
    op.create_index('idx_courses_category_id', 'courses', ['category_id'])
    op.create_index('idx_courses_difficulty_level', 'courses', ['difficulty_level'])
    op.create_index('idx_courses_is_published', 'courses', ['is_published'])
    op.create_index('idx_course_enrollments_user_id', 'course_enrollments', ['user_id'])
    op.create_index('idx_course_enrollments_course_id', 'course_enrollments', ['course_id'])
    op.create_index('idx_course_enrollments_status', 'course_enrollments', ['status'])
    op.create_index('idx_learning_progress_user_id', 'learning_progress', ['user_id'])
    op.create_index('idx_learning_progress_skill_name', 'learning_progress', ['skill_name'])
    op.create_index('idx_learning_recommendations_user_id', 'learning_recommendations', ['user_id'])
    op.create_index('idx_learning_recommendations_type', 'learning_recommendations', ['recommendation_type'])


def downgrade():
    # Drop indexes first
    op.drop_index('idx_learning_recommendations_type')
    op.drop_index('idx_learning_recommendations_user_id')
    op.drop_index('idx_learning_progress_skill_name')
    op.drop_index('idx_learning_progress_user_id')
    op.drop_index('idx_course_enrollments_status')
    op.drop_index('idx_course_enrollments_course_id')
    op.drop_index('idx_course_enrollments_user_id')
    op.drop_index('idx_courses_is_published')
    op.drop_index('idx_courses_difficulty_level')
    op.drop_index('idx_courses_category_id')
    op.drop_index('idx_user_skills_skill_name')
    op.drop_index('idx_user_skills_user_id')
    op.drop_index('idx_peer_matches_compatibility_score')
    op.drop_index('idx_peer_matches_user_id')
    op.drop_index('idx_user_connections_status')
    op.drop_index('idx_user_connections_connected_user_id')
    op.drop_index('idx_user_connections_user_id')
    
    # Drop tables in reverse order
    op.drop_table('learning_recommendations')
    op.drop_table('learning_progress')
    op.drop_table('course_enrollments')
    op.drop_table('courses')
    op.drop_table('course_categories')
    op.drop_table('user_skills')
    op.drop_table('social_metrics')
    op.drop_table('peer_matches')
    op.drop_table('user_connections')
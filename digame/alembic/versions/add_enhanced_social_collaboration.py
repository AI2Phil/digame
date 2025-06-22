"""Add enhanced social collaboration tables

Revision ID: add_enhanced_social_collaboration
Revises: previous_migration
Create Date: 2025-06-22 14:58:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_enhanced_social_collaboration'
down_revision = None  # Replace with actual previous revision
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    connection_status_enum = postgresql.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED', name='connectionstatus')
    connection_status_enum.create(op.get_bind())
    
    message_type_enum = postgresql.ENUM('TEXT', 'FILE', 'PROJECT_INVITE', 'MEETING_REQUEST', name='messagetype')
    message_type_enum.create(op.get_bind())
    
    project_status_enum = postgresql.ENUM('DRAFT', 'RECRUITING', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', name='projectstatus')
    project_status_enum.create(op.get_bind())
    
    application_status_enum = postgresql.ENUM('PENDING', 'ACCEPTED', 'REJECTED', name='applicationstatus')
    application_status_enum.create(op.get_bind())
    
    mentorship_status_enum = postgresql.ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', name='mentorshipstatus')
    mentorship_status_enum.create(op.get_bind())

    # Create peer_connections table
    op.create_table('peer_connections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('status', connection_status_enum, nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('requester_id', 'recipient_id', name='unique_connection_pair')
    )
    op.create_index(op.f('ix_peer_connections_id'), 'peer_connections', ['id'], unique=False)
    op.create_index(op.f('ix_peer_connections_recipient_id'), 'peer_connections', ['recipient_id'], unique=False)
    op.create_index(op.f('ix_peer_connections_requester_id'), 'peer_connections', ['requester_id'], unique=False)

    # Create peer_messages table
    op.create_table('peer_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('connection_id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('message_type', message_type_enum, nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['connection_id'], ['peer_connections.id'], ),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_peer_messages_connection_id'), 'peer_messages', ['connection_id'], unique=False)
    op.create_index(op.f('ix_peer_messages_id'), 'peer_messages', ['id'], unique=False)
    op.create_index(op.f('ix_peer_messages_sender_id'), 'peer_messages', ['sender_id'], unique=False)

    # Create collaboration_projects table
    op.create_table('collaboration_projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('status', project_status_enum, nullable=False),
        sa.Column('difficulty_level', sa.String(length=50), nullable=False),
        sa.Column('estimated_duration', sa.String(length=100), nullable=True),
        sa.Column('time_commitment', sa.String(length=100), nullable=True),
        sa.Column('max_team_size', sa.Integer(), nullable=False),
        sa.Column('repository_url', sa.String(length=500), nullable=True),
        sa.Column('project_url', sa.String(length=500), nullable=True),
        sa.Column('documentation_url', sa.String(length=500), nullable=True),
        sa.Column('progress_percentage', sa.Integer(), nullable=False),
        sa.Column('required_skills', sa.JSON(), nullable=True),
        sa.Column('optional_skills', sa.JSON(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('target_completion_date', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_collaboration_projects_id'), 'collaboration_projects', ['id'], unique=False)
    op.create_index(op.f('ix_collaboration_projects_owner_id'), 'collaboration_projects', ['owner_id'], unique=False)

    # Create project_members table
    op.create_table('project_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('skills_contributing', sa.JSON(), nullable=True),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['collaboration_projects.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='unique_project_member')
    )
    op.create_index(op.f('ix_project_members_id'), 'project_members', ['id'], unique=False)
    op.create_index(op.f('ix_project_members_project_id'), 'project_members', ['project_id'], unique=False)
    op.create_index(op.f('ix_project_members_user_id'), 'project_members', ['user_id'], unique=False)

    # Create project_applications table
    op.create_table('project_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('applicant_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('proposed_role', sa.String(length=100), nullable=True),
        sa.Column('relevant_skills', sa.JSON(), nullable=True),
        sa.Column('status', application_status_enum, nullable=False),
        sa.Column('applied_at', sa.DateTime(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['applicant_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['collaboration_projects.id'], ),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'applicant_id', name='unique_project_application')
    )
    op.create_index(op.f('ix_project_applications_applicant_id'), 'project_applications', ['applicant_id'], unique=False)
    op.create_index(op.f('ix_project_applications_id'), 'project_applications', ['id'], unique=False)
    op.create_index(op.f('ix_project_applications_project_id'), 'project_applications', ['project_id'], unique=False)

    # Create skill_endorsements table
    op.create_table('skill_endorsements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('endorser_id', sa.Integer(), nullable=False),
        sa.Column('endorsed_user_id', sa.Integer(), nullable=False),
        sa.Column('skill_name', sa.String(length=100), nullable=False),
        sa.Column('proficiency_level', sa.String(length=50), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['endorsed_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['endorser_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('endorser_id', 'endorsed_user_id', 'skill_name', name='unique_skill_endorsement')
    )
    op.create_index(op.f('ix_skill_endorsements_endorsed_user_id'), 'skill_endorsements', ['endorsed_user_id'], unique=False)
    op.create_index(op.f('ix_skill_endorsements_endorser_id'), 'skill_endorsements', ['endorser_id'], unique=False)
    op.create_index(op.f('ix_skill_endorsements_id'), 'skill_endorsements', ['id'], unique=False)

    # Create mentorship_connections table
    op.create_table('mentorship_connections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('mentee_id', sa.Integer(), nullable=False),
        sa.Column('status', mentorship_status_enum, nullable=False),
        sa.Column('goals', sa.Text(), nullable=True),
        sa.Column('duration_months', sa.Integer(), nullable=True),
        sa.Column('meeting_frequency', sa.String(length=100), nullable=True),
        sa.Column('focus_areas', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('ended_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['mentee_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['mentor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('mentor_id', 'mentee_id', name='unique_mentorship_pair')
    )
    op.create_index(op.f('ix_mentorship_connections_id'), 'mentorship_connections', ['id'], unique=False)
    op.create_index(op.f('ix_mentorship_connections_mentee_id'), 'mentorship_connections', ['mentee_id'], unique=False)
    op.create_index(op.f('ix_mentorship_connections_mentor_id'), 'mentorship_connections', ['mentor_id'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_table('mentorship_connections')
    op.drop_table('skill_endorsements')
    op.drop_table('project_applications')
    op.drop_table('project_members')
    op.drop_table('collaboration_projects')
    op.drop_table('peer_messages')
    op.drop_table('peer_connections')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS mentorshipstatus')
    op.execute('DROP TYPE IF EXISTS applicationstatus')
    op.execute('DROP TYPE IF EXISTS projectstatus')
    op.execute('DROP TYPE IF EXISTS messagetype')
    op.execute('DROP TYPE IF EXISTS connectionstatus')
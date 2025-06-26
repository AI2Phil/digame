"""Add security tables migration

This migration adds all the security-related tables for the Advanced Security Features.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_security_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create mfa_configs table
    op.create_table('mfa_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, default=False),
        sa.Column('backup_codes', sa.JSON(), nullable=True),
        sa.Column('totp_secret', sa.Text(), nullable=True),
        sa.Column('recovery_email', sa.String(length=255), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('preferred_method', sa.String(length=20), nullable=False, default='totp'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_mfa_configs_id'), 'mfa_configs', ['id'], unique=False)
    op.create_index(op.f('ix_mfa_configs_user_id'), 'mfa_configs', ['user_id'], unique=False)

    # Create security_audit_logs table
    op.create_table('security_audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('event_category', sa.String(length=30), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('resource_accessed', sa.String(length=255), nullable=True),
        sa.Column('action_taken', sa.String(length=100), nullable=True),
        sa.Column('result', sa.String(length=20), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_audit_logs_event_category'), 'security_audit_logs', ['event_category'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_event_type'), 'security_audit_logs', ['event_type'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_id'), 'security_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_ip_address'), 'security_audit_logs', ['ip_address'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_session_id'), 'security_audit_logs', ['session_id'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_severity'), 'security_audit_logs', ['severity'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_timestamp'), 'security_audit_logs', ['timestamp'], unique=False)
    op.create_index(op.f('ix_security_audit_logs_user_id'), 'security_audit_logs', ['user_id'], unique=False)

    # Create security_policies table
    op.create_table('security_policies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('policy_name', sa.String(length=100), nullable=False),
        sa.Column('policy_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('configuration', sa.JSON(), nullable=False),
        sa.Column('applies_to', sa.String(length=20), nullable=False, default='all'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('policy_name')
    )
    op.create_index(op.f('ix_security_policies_id'), 'security_policies', ['id'], unique=False)
    op.create_index(op.f('ix_security_policies_policy_name'), 'security_policies', ['policy_name'], unique=False)
    op.create_index(op.f('ix_security_policies_policy_type'), 'security_policies', ['policy_type'], unique=False)

    # Create threat_detections table
    op.create_table('threat_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('detection_type', sa.String(length=50), nullable=False),
        sa.Column('threat_level', sa.String(length=20), nullable=False),
        sa.Column('source_ip', sa.String(length=45), nullable=True),
        sa.Column('target_user_id', sa.Integer(), nullable=True),
        sa.Column('target_resource', sa.String(length=255), nullable=True),
        sa.Column('detection_rule', sa.String(length=100), nullable=False),
        sa.Column('confidence_score', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, default='active'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=True),
        sa.Column('mitigation_actions', sa.JSON(), nullable=True),
        sa.Column('detected_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['target_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_threat_detections_detected_at'), 'threat_detections', ['detected_at'], unique=False)
    op.create_index(op.f('ix_threat_detections_detection_type'), 'threat_detections', ['detection_type'], unique=False)
    op.create_index(op.f('ix_threat_detections_id'), 'threat_detections', ['id'], unique=False)
    op.create_index(op.f('ix_threat_detections_source_ip'), 'threat_detections', ['source_ip'], unique=False)
    op.create_index(op.f('ix_threat_detections_target_user_id'), 'threat_detections', ['target_user_id'], unique=False)
    op.create_index(op.f('ix_threat_detections_threat_level'), 'threat_detections', ['threat_level'], unique=False)

    # Create security_incidents table
    op.create_table('security_incidents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, default='open'),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('affected_users', sa.JSON(), nullable=True),
        sa.Column('affected_systems', sa.JSON(), nullable=True),
        sa.Column('timeline', sa.JSON(), nullable=True),
        sa.Column('response_actions', sa.JSON(), nullable=True),
        sa.Column('lessons_learned', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('incident_id')
    )
    op.create_index(op.f('ix_security_incidents_category'), 'security_incidents', ['category'], unique=False)
    op.create_index(op.f('ix_security_incidents_id'), 'security_incidents', ['id'], unique=False)
    op.create_index(op.f('ix_security_incidents_incident_id'), 'security_incidents', ['incident_id'], unique=False)
    op.create_index(op.f('ix_security_incidents_severity'), 'security_incidents', ['severity'], unique=False)
    op.create_index(op.f('ix_security_incidents_status'), 'security_incidents', ['status'], unique=False)

    # Create access_controls table
    op.create_table('access_controls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rule_name', sa.String(length=100), nullable=False),
        sa.Column('rule_type', sa.String(length=30), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('priority', sa.Integer(), nullable=False, default=100),
        sa.Column('conditions', sa.JSON(), nullable=False),
        sa.Column('actions', sa.JSON(), nullable=False),
        sa.Column('applies_to', sa.JSON(), nullable=True),
        sa.Column('exceptions', sa.JSON(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_access_controls_id'), 'access_controls', ['id'], unique=False)
    op.create_index(op.f('ix_access_controls_rule_name'), 'access_controls', ['rule_name'], unique=False)
    op.create_index(op.f('ix_access_controls_rule_type'), 'access_controls', ['rule_type'], unique=False)

    # Create security_metrics table
    op.create_table('security_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_type', sa.String(length=30), nullable=False),
        sa.Column('value', sa.String(length=50), nullable=False),
        sa.Column('unit', sa.String(length=20), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_metrics_id'), 'security_metrics', ['id'], unique=False)
    op.create_index(op.f('ix_security_metrics_metric_name'), 'security_metrics', ['metric_name'], unique=False)
    op.create_index(op.f('ix_security_metrics_metric_type'), 'security_metrics', ['metric_type'], unique=False)
    op.create_index(op.f('ix_security_metrics_timestamp'), 'security_metrics', ['timestamp'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_table('security_metrics')
    op.drop_table('access_controls')
    op.drop_table('security_incidents')
    op.drop_table('threat_detections')
    op.drop_table('security_policies')
    op.drop_table('security_audit_logs')
    op.drop_table('mfa_configs')
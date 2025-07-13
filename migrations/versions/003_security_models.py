"""Add security models for MFA and advanced authentication

Revision ID: 003_security_models
Revises: 002_notification_system
Create Date: 2025-06-28 19:47:44.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_security_models'
down_revision = '002_notification_system'
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
    
    # Create MFA devices table
    def create_mfa_devices():
        op.create_table('mfa_devices',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('device_type', sa.String(length=20), nullable=False),
            sa.Column('device_name', sa.String(length=100), nullable=False),
            sa.Column('secret_key', sa.String(length=255), nullable=True),
            sa.Column('phone_number', sa.String(length=20), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('is_verified', sa.Boolean(), nullable=True),
            sa.Column('backup_codes', sa.JSON(), nullable=True),
            sa.Column('use_count', sa.Integer(), nullable=True),
            sa.Column('last_used', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('activated_at', sa.DateTime(), nullable=True),
            sa.Column('disabled_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_mfa_devices_created_at'), 'mfa_devices', ['created_at'], unique=False)
            op.create_index(op.f('ix_mfa_devices_id'), 'mfa_devices', ['id'], unique=False)
            op.create_index(op.f('ix_mfa_devices_user_id'), 'mfa_devices', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('mfa_devices', create_mfa_devices)

    # Create security events table
    def create_security_events():
        op.create_table('security_events',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('event_type', sa.String(length=50), nullable=False),
            sa.Column('event_category', sa.String(length=30), nullable=True),
            sa.Column('severity', sa.String(length=20), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('details', sa.JSON(), nullable=True),
            sa.Column('ip_address', sa.String(length=45), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('request_path', sa.String(length=500), nullable=True),
            sa.Column('request_method', sa.String(length=10), nullable=True),
            sa.Column('status_code', sa.Integer(), nullable=True),
            sa.Column('response_time_ms', sa.Integer(), nullable=True),
            sa.Column('country', sa.String(length=2), nullable=True),
            sa.Column('city', sa.String(length=100), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_security_events_created_at'), 'security_events', ['created_at'], unique=False)
            op.create_index(op.f('ix_security_events_event_type'), 'security_events', ['event_type'], unique=False)
            op.create_index(op.f('ix_security_events_id'), 'security_events', ['id'], unique=False)
            op.create_index(op.f('ix_security_events_ip_address'), 'security_events', ['ip_address'], unique=False)
            op.create_index(op.f('ix_security_events_user_id'), 'security_events', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('security_events', create_security_events)

    # Create IP restrictions table
    def create_ip_restrictions():
        op.create_table('ip_restrictions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('ip_address', sa.String(length=45), nullable=False),
            sa.Column('ip_range', sa.String(length=50), nullable=True),
            sa.Column('description', sa.String(length=255), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('last_used', sa.DateTime(), nullable=True),
            sa.Column('use_count', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_ip_restrictions_id'), 'ip_restrictions', ['id'], unique=False)
            op.create_index(op.f('ix_ip_restrictions_ip_address'), 'ip_restrictions', ['ip_address'], unique=False)
            op.create_index(op.f('ix_ip_restrictions_user_id'), 'ip_restrictions', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('ip_restrictions', create_ip_restrictions)

    # Create security policies table
    def create_security_policies():
        op.create_table('security_policies',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('policy_name', sa.String(length=100), nullable=False),
            sa.Column('policy_type', sa.String(length=50), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('config', sa.JSON(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('is_default', sa.Boolean(), nullable=True),
            sa.Column('applies_to', sa.String(length=50), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('created_by', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_security_policies_id'), 'security_policies', ['id'], unique=False)
            op.create_index(op.f('ix_security_policies_policy_name'), 'security_policies', ['policy_name'], unique=True)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('security_policies', create_security_policies)

    # Create session tokens table
    def create_session_tokens():
        op.create_table('session_tokens',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(length=255), nullable=False),
            sa.Column('token_type', sa.String(length=20), nullable=True),
            sa.Column('session_id', sa.String(length=255), nullable=True),
            sa.Column('device_fingerprint', sa.String(length=255), nullable=True),
            sa.Column('ip_address', sa.String(length=45), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('is_revoked', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('last_used', sa.DateTime(), nullable=True),
            sa.Column('revoked_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_session_tokens_created_at'), 'session_tokens', ['created_at'], unique=False)
            op.create_index(op.f('ix_session_tokens_expires_at'), 'session_tokens', ['expires_at'], unique=False)
            op.create_index(op.f('ix_session_tokens_id'), 'session_tokens', ['id'], unique=False)
            op.create_index(op.f('ix_session_tokens_session_id'), 'session_tokens', ['session_id'], unique=False)
            op.create_index(op.f('ix_session_tokens_token_hash'), 'session_tokens', ['token_hash'], unique=True)
            op.create_index(op.f('ix_session_tokens_user_id'), 'session_tokens', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('session_tokens', create_session_tokens)

    # Create threat detections table
    def create_threat_detections():
        op.create_table('threat_detections',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('threat_type', sa.String(length=50), nullable=False),
            sa.Column('threat_level', sa.String(length=20), nullable=True),
            sa.Column('confidence_score', sa.Integer(), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('indicators', sa.JSON(), nullable=True),
            sa.Column('ip_address', sa.String(length=45), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('request_pattern', sa.JSON(), nullable=True),
            sa.Column('status', sa.String(length=20), nullable=True),
            sa.Column('is_blocked', sa.Boolean(), nullable=True),
            sa.Column('action_taken', sa.String(length=100), nullable=True),
            sa.Column('response_details', sa.JSON(), nullable=True),
            sa.Column('detected_at', sa.DateTime(), nullable=True),
            sa.Column('resolved_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_threat_detections_detected_at'), 'threat_detections', ['detected_at'], unique=False)
            op.create_index(op.f('ix_threat_detections_id'), 'threat_detections', ['id'], unique=False)
            op.create_index(op.f('ix_threat_detections_ip_address'), 'threat_detections', ['ip_address'], unique=False)
            op.create_index(op.f('ix_threat_detections_threat_type'), 'threat_detections', ['threat_type'], unique=False)
            op.create_index(op.f('ix_threat_detections_user_id'), 'threat_detections', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('threat_detections', create_threat_detections)

    # Create audit logs table
    def create_audit_logs():
        op.create_table('audit_logs',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('action', sa.String(length=100), nullable=False),
            sa.Column('resource_type', sa.String(length=50), nullable=True),
            sa.Column('resource_id', sa.String(length=100), nullable=True),
            sa.Column('old_values', sa.JSON(), nullable=True),
            sa.Column('new_values', sa.JSON(), nullable=True),
            sa.Column('changes', sa.JSON(), nullable=True),
            sa.Column('ip_address', sa.String(length=45), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('request_id', sa.String(length=255), nullable=True),
            sa.Column('compliance_tags', sa.JSON(), nullable=True),
            sa.Column('retention_period_days', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        try:
            op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
            op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
            op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
            op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
        except ProgrammingError:
            pass  # Indexes might already exist
    
    create_table_safe('audit_logs', create_audit_logs)


def downgrade():
    # Drop tables in reverse order
    op.drop_table('audit_logs')
    op.drop_table('threat_detections')
    op.drop_table('session_tokens')
    op.drop_table('security_policies')
    op.drop_table('ip_restrictions')
    op.drop_table('security_events')
    op.drop_table('mfa_devices')
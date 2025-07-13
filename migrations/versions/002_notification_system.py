"""Notification System Infrastructure

Revision ID: 002_notification_system
Revises: 001_platform_owner_infra
Create Date: 2025-06-28 19:24:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_notification_system'
down_revision = '001_platform_owner_infra'
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
    
    # Create the full notifications table
    def create_notifications():
        op.create_table('notifications',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('title', sa.String(255), nullable=False),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('notification_type', sa.Enum('security_alert', 'system_health', 'business_alert', 'revenue_alert', 'user_activity', 'tenant_activity', name='notificationtype'), nullable=False, index=True),
            sa.Column('priority', sa.Enum('low', 'medium', 'high', 'critical', name='notificationpriority'), default='medium', index=True),
            sa.Column('status', sa.Enum('pending', 'sent', 'read', 'dismissed', 'failed', name='notificationstatus'), default='pending', index=True),
            sa.Column('recipient_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=True, index=True),
            sa.Column('user_context_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('context_data', sa.JSON(), nullable=True),
            sa.Column('action_url', sa.String(500), nullable=True),
            sa.Column('action_text', sa.String(100), nullable=True),
            sa.Column('delivery_channels', sa.JSON(), default=['in_app']),
            sa.Column('email_sent', sa.Boolean(), default=False),
            sa.Column('email_sent_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), default=sa.func.now(), index=True),
            sa.Column('scheduled_for', sa.DateTime(), nullable=True, index=True),
            sa.Column('sent_at', sa.DateTime(), nullable=True),
            sa.Column('read_at', sa.DateTime(), nullable=True),
            sa.Column('dismissed_at', sa.DateTime(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=True)
        )
    
    create_table_safe('notifications', create_notifications)
    
    # Create notification_templates table
    def create_notification_templates():
        op.create_table('notification_templates',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('name', sa.String(100), unique=True, nullable=False, index=True),
            sa.Column('notification_type', sa.Enum('security_alert', 'system_health', 'business_alert', 'revenue_alert', 'user_activity', 'tenant_activity', name='notificationtype'), nullable=False, index=True),
            sa.Column('priority', sa.Enum('low', 'medium', 'high', 'critical', name='notificationpriority'), default='medium'),
            sa.Column('title_template', sa.String(255), nullable=False),
            sa.Column('message_template', sa.Text(), nullable=False),
            sa.Column('action_text_template', sa.String(100), nullable=True),
            sa.Column('action_url_template', sa.String(500), nullable=True),
            sa.Column('delivery_channels', sa.JSON(), default=['in_app']),
            sa.Column('is_active', sa.Boolean(), default=True),
            sa.Column('auto_dismiss_hours', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
            sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True)
        )
    
    create_table_safe('notification_templates', create_notification_templates)
    
    # Create notification_preferences table
    def create_notification_preferences():
        op.create_table('notification_preferences',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('security_alerts_enabled', sa.Boolean(), default=True),
            sa.Column('system_health_enabled', sa.Boolean(), default=True),
            sa.Column('business_alerts_enabled', sa.Boolean(), default=True),
            sa.Column('revenue_alerts_enabled', sa.Boolean(), default=True),
            sa.Column('user_activity_enabled', sa.Boolean(), default=False),
            sa.Column('tenant_activity_enabled', sa.Boolean(), default=True),
            sa.Column('in_app_enabled', sa.Boolean(), default=True),
            sa.Column('email_enabled', sa.Boolean(), default=True),
            sa.Column('email_address', sa.String(255), nullable=True),
            sa.Column('sms_enabled', sa.Boolean(), default=False),
            sa.Column('phone_number', sa.String(20), nullable=True),
            sa.Column('webhook_enabled', sa.Boolean(), default=False),
            sa.Column('webhook_url', sa.String(500), nullable=True),
            sa.Column('quiet_hours_start', sa.String(5), nullable=True),
            sa.Column('quiet_hours_end', sa.String(5), nullable=True),
            sa.Column('timezone', sa.String(50), default='UTC'),
            sa.Column('min_priority', sa.Enum('low', 'medium', 'high', 'critical', name='notificationpriority'), default='low'),
            sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now())
        )
    
    create_table_safe('notification_preferences', create_notification_preferences)
    
    # Create notification_logs table
    def create_notification_logs():
        op.create_table('notification_logs',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('notification_id', sa.Integer(), sa.ForeignKey('notifications.id'), nullable=False, index=True),
            sa.Column('channel', sa.String(20), nullable=False),
            sa.Column('status', sa.String(20), nullable=False),
            sa.Column('recipient_address', sa.String(255), nullable=True),
            sa.Column('provider', sa.String(50), nullable=True),
            sa.Column('provider_message_id', sa.String(255), nullable=True),
            sa.Column('error_code', sa.String(50), nullable=True),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.Column('attempted_at', sa.DateTime(), default=sa.func.now(), index=True),
            sa.Column('delivered_at', sa.DateTime(), nullable=True)
        )
    
    create_table_safe('notification_logs', create_notification_logs)
    
    # Create indexes for better performance
    try:
        op.create_index('idx_notifications_recipient_status', 'notifications', ['recipient_id', 'status'])
        op.create_index('idx_notifications_type_priority', 'notifications', ['notification_type', 'priority'])
        op.create_index('idx_notifications_created_at', 'notifications', ['created_at'])
        op.create_index('idx_notification_logs_notification_channel', 'notification_logs', ['notification_id', 'channel'])
        print("✓ Created performance indexes")
    except ProgrammingError:
        print("✓ Performance indexes already exist")

def downgrade():
    # Drop indexes
    op.drop_index('idx_notification_logs_notification_channel')
    op.drop_index('idx_notifications_created_at')
    op.drop_index('idx_notifications_type_priority')
    op.drop_index('idx_notifications_recipient_status')
    
    # Drop tables
    op.drop_table('notification_logs')
    op.drop_table('notification_preferences')
    op.drop_table('notification_templates')
    op.drop_table('notifications')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS notificationstatus')
    op.execute('DROP TYPE IF EXISTS notificationpriority')
    op.execute('DROP TYPE IF EXISTS notificationtype')
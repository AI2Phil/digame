"""Add Phase 4 WebSocket and PWA models

Revision ID: 20250629_1130_add_phase4_websocket_pwa_models
Revises: 20250704_0001_add_dashboard_and_model_enhancements
Create Date: 2025-06-29 11:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250629_1130_add_phase4_websocket_pwa_models'
down_revision = '20250704_0001_add_dashboard_and_model_enhancements'
branch_labels = None
depends_on = None


def upgrade():
    # WebSocket Connections table
    op.create_table('websocket_connections',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('connection_id', sa.String(length=255), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('connection_type', sa.String(length=50), nullable=False),
        sa.Column('endpoint', sa.String(length=255), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('connected_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_heartbeat', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('disconnected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('messages_sent', sa.Integer(), nullable=True),
        sa.Column('messages_received', sa.Integer(), nullable=True),
        sa.Column('bytes_sent', sa.Integer(), nullable=True),
        sa.Column('bytes_received', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_websocket_connections_connection_id'), 'websocket_connections', ['connection_id'], unique=True)
    op.create_index(op.f('ix_websocket_connections_user_id'), 'websocket_connections', ['user_id'], unique=False)

    # WebSocket Messages table
    op.create_table('websocket_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('connection_id', sa.String(length=255), nullable=False),
        sa.Column('message_type', sa.String(length=100), nullable=False),
        sa.Column('direction', sa.String(length=10), nullable=False),
        sa.Column('message_data', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('message_size', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['connection_id'], ['websocket_connections.connection_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_websocket_messages_connection_id'), 'websocket_messages', ['connection_id'], unique=False)
    op.create_index(op.f('ix_websocket_messages_message_type'), 'websocket_messages', ['message_type'], unique=False)

    # WebSocket Channels table
    op.create_table('websocket_channels',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('channel_name', sa.String(length=255), nullable=False),
        sa.Column('channel_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('max_subscribers', sa.Integer(), nullable=True),
        sa.Column('message_retention_hours', sa.Integer(), nullable=True),
        sa.Column('total_subscribers', sa.Integer(), nullable=True),
        sa.Column('total_messages', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_websocket_channels_channel_name'), 'websocket_channels', ['channel_name'], unique=True)

    # WebSocket Subscriptions table
    op.create_table('websocket_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('connection_id', sa.String(length=255), nullable=False),
        sa.Column('channel_name', sa.String(length=255), nullable=False),
        sa.Column('subscribed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('unsubscribed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('message_filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('priority_level', sa.String(length=20), nullable=True),
        sa.ForeignKeyConstraint(['channel_name'], ['websocket_channels.channel_name'], ),
        sa.ForeignKeyConstraint(['connection_id'], ['websocket_connections.connection_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_websocket_subscriptions_channel_name'), 'websocket_subscriptions', ['channel_name'], unique=False)
    op.create_index(op.f('ix_websocket_subscriptions_connection_id'), 'websocket_subscriptions', ['connection_id'], unique=False)

    # PWA Installations table
    op.create_table('pwa_installations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('installation_id', sa.String(length=255), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('browser', sa.String(length=50), nullable=False),
        sa.Column('device_type', sa.String(length=20), nullable=False),
        sa.Column('supports_offline', sa.Boolean(), nullable=True),
        sa.Column('supports_push', sa.Boolean(), nullable=True),
        sa.Column('supports_background_sync', sa.Boolean(), nullable=True),
        sa.Column('installed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('uninstalled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('total_sessions', sa.Integer(), nullable=True),
        sa.Column('total_offline_usage_minutes', sa.Integer(), nullable=True),
        sa.Column('push_notifications_enabled', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pwa_installations_installation_id'), 'pwa_installations', ['installation_id'], unique=True)
    op.create_index(op.f('ix_pwa_installations_user_id'), 'pwa_installations', ['user_id'], unique=False)

    # PWA Notifications table
    op.create_table('pwa_notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('installation_id', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=255), nullable=True),
        sa.Column('badge', sa.String(length=255), nullable=True),
        sa.Column('notification_type', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=True),
        sa.Column('require_interaction', sa.Boolean(), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dismissed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['installation_id'], ['pwa_installations.installation_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pwa_notifications_installation_id'), 'pwa_notifications', ['installation_id'], unique=False)
    op.create_index(op.f('ix_pwa_notifications_user_id'), 'pwa_notifications', ['user_id'], unique=False)

    # Offline Actions table
    op.create_table('offline_actions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('installation_id', sa.String(length=255), nullable=False),
        sa.Column('action_type', sa.String(length=100), nullable=False),
        sa.Column('endpoint', sa.String(length=255), nullable=False),
        sa.Column('http_method', sa.String(length=10), nullable=False),
        sa.Column('request_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_synced', sa.Boolean(), nullable=False),
        sa.Column('sync_attempts', sa.Integer(), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('max_retry_attempts', sa.Integer(), nullable=True),
        sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['installation_id'], ['pwa_installations.installation_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_offline_actions_user_id'), 'offline_actions', ['user_id'], unique=False)
    op.create_index(op.f('ix_offline_actions_installation_id'), 'offline_actions', ['installation_id'], unique=False)

    # Real-time Events table
    op.create_table('realtime_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_id', sa.String(length=255), nullable=False),
        sa.Column('event_data', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('event_timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('processed', sa.Boolean(), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('total_recipients', sa.Integer(), nullable=True),
        sa.Column('successful_deliveries', sa.Integer(), nullable=True),
        sa.Column('failed_deliveries', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_realtime_events_event_type'), 'realtime_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_realtime_events_source_id'), 'realtime_events', ['source_id'], unique=False)

    # Connection Statistics table
    op.create_table('connection_statistics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('hour', sa.Integer(), nullable=False),
        sa.Column('total_connections', sa.Integer(), nullable=True),
        sa.Column('peak_concurrent_connections', sa.Integer(), nullable=True),
        sa.Column('average_connection_duration_minutes', sa.Float(), nullable=True),
        sa.Column('total_messages_sent', sa.Integer(), nullable=True),
        sa.Column('total_messages_received', sa.Integer(), nullable=True),
        sa.Column('average_message_size_bytes', sa.Float(), nullable=True),
        sa.Column('average_response_time_ms', sa.Float(), nullable=True),
        sa.Column('error_rate_percentage', sa.Float(), nullable=True),
        sa.Column('reconnection_rate_percentage', sa.Float(), nullable=True),
        sa.Column('twin_connections', sa.Integer(), nullable=True),
        sa.Column('team_connections', sa.Integer(), nullable=True),
        sa.Column('platform_connections', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_connection_statistics_date'), 'connection_statistics', ['date'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_connection_statistics_date'), table_name='connection_statistics')
    op.drop_table('connection_statistics')
    
    op.drop_index(op.f('ix_realtime_events_source_id'), table_name='realtime_events')
    op.drop_index(op.f('ix_realtime_events_event_type'), table_name='realtime_events')
    op.drop_table('realtime_events')
    
    op.drop_index(op.f('ix_offline_actions_installation_id'), table_name='offline_actions')
    op.drop_index(op.f('ix_offline_actions_user_id'), table_name='offline_actions')
    op.drop_table('offline_actions')
    
    op.drop_index(op.f('ix_pwa_notifications_user_id'), table_name='pwa_notifications')
    op.drop_index(op.f('ix_pwa_notifications_installation_id'), table_name='pwa_notifications')
    op.drop_table('pwa_notifications')
    
    op.drop_index(op.f('ix_pwa_installations_user_id'), table_name='pwa_installations')
    op.drop_index(op.f('ix_pwa_installations_installation_id'), table_name='pwa_installations')
    op.drop_table('pwa_installations')
    
    op.drop_index(op.f('ix_websocket_subscriptions_connection_id'), table_name='websocket_subscriptions')
    op.drop_index(op.f('ix_websocket_subscriptions_channel_name'), table_name='websocket_subscriptions')
    op.drop_table('websocket_subscriptions')
    
    op.drop_index(op.f('ix_websocket_channels_channel_name'), table_name='websocket_channels')
    op.drop_table('websocket_channels')
    
    op.drop_index(op.f('ix_websocket_messages_message_type'), table_name='websocket_messages')
    op.drop_index(op.f('ix_websocket_messages_connection_id'), table_name='websocket_messages')
    op.drop_table('websocket_messages')
    
    op.drop_index(op.f('ix_websocket_connections_user_id'), table_name='websocket_connections')
    op.drop_index(op.f('ix_websocket_connections_connection_id'), table_name='websocket_connections')
    op.drop_table('websocket_connections')
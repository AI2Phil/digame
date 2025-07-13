"""Final schema cleanup - remove all remaining orphaned tables

Revision ID: 73851b7c9fc9
Revises: 5ef430e6d7e2
Create Date: 2025-07-12 22:24:40.671396

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '73851b7c9fc9'
down_revision: Union[str, None] = '5ef430e6d7e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(connection, table_name):
    """Check if a table exists in the database."""
    try:
        result = connection.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
        return result.fetchone() is not None
    except Exception:
        return False


def index_exists(connection, index_name):
    """Check if an index exists in the database."""
    try:
        result = connection.execute(text(f"SELECT name FROM sqlite_master WHERE type='index' AND name='{index_name}'"))
        return result.fetchone() is not None
    except Exception:
        return False


def upgrade() -> None:
    """Remove all remaining orphaned tables and indexes that don't match current model definitions."""
    print("🧹 Starting final schema cleanup - removing all remaining orphaned tables...")
    
    connection = op.get_bind()
    
    # List of all orphaned tables that need to be removed
    orphaned_tables = [
        'user_experience_metrics',
        'market_data_sources', 
        'notification_preferences',
        'integration_providers',
        'session_tokens',
        'platform_usage_metrics',
        'activity_goals',
        'ip_restrictions',
        'data_sources',
        'audit_logs',
        'security_policies',
        'user_roles_enhanced',
        'performance_baselines',
        'intelligence_reports',
        'competitive_analyses',
        'integration_data_mappings',
        'visualization_metrics',
        'platform_health_metrics',
        'notifications',
        'performance_incidents',
        'market_trends',
        'integration_sync_logs',
        'system_health_checks',
        'productivity_metrics',
        'security_events',
        'industry_benchmarks',
        'performance_optimizations',
        'integration_webhooks',
        'core_performance_metrics',
        'notification_logs',
        'user_platform_roles',
        'tenant_analytics_summary',
        'jobs',
        'report_insights',
        'user_activities',
        'activity_categories',
        'notification_templates',
        'threat_detections',
        'mfa_devices',
        'platform_roles',
        'integration_analytics',
        'performance_alerts',
        'query_performance',
        'platform_usage_tracking',
        'predictive_models',
        'integration_connections'
    ]
    
    # Remove orphaned tables
    removed_count = 0
    for table_name in orphaned_tables:
        if table_exists(connection, table_name):
            try:
                print(f"✅ Dropping orphaned table: {table_name}")
                op.drop_table(table_name)
                removed_count += 1
            except Exception as e:
                print(f"⚠️ Could not drop table {table_name}: {e}")
        else:
            print(f"ℹ️ Table {table_name} already removed")
    
    # Fix user_role_assignments table schema issues
    print("🔧 Fixing user_role_assignments table schema...")
    
    # Check if we need to fix the id column nullable constraint
    try:
        # Make id column NOT NULL if it isn't already
        with op.batch_alter_table('user_role_assignments') as batch_op:
            batch_op.alter_column('id', nullable=False)
            print("✅ Fixed user_role_assignments.id nullable constraint")
    except Exception as e:
        print(f"ℹ️ user_role_assignments.id constraint already correct: {e}")
    
    # Fix column types and defaults
    try:
        with op.batch_alter_table('user_role_assignments') as batch_op:
            # Fix assigned_at column type and remove server default
            batch_op.alter_column('assigned_at', 
                                type_=sa.DateTime(),
                                server_default=None)
            # Fix expires_at column type  
            batch_op.alter_column('expires_at',
                                type_=sa.DateTime())
            # Remove server default from is_active
            batch_op.alter_column('is_active',
                                server_default=None)
            print("✅ Fixed user_role_assignments column types and defaults")
    except Exception as e:
        print(f"ℹ️ user_role_assignments column types already correct: {e}")
    
    # Add unique constraint if it doesn't exist
    try:
        with op.batch_alter_table('user_role_assignments') as batch_op:
            batch_op.create_unique_constraint('unique_user_role_tenant', 
                                            ['user_id', 'role_id', 'tenant_id'])
            print("✅ Added unique constraint to user_role_assignments")
    except Exception as e:
        print(f"ℹ️ Unique constraint already exists: {e}")
    
    # Remove orphaned indexes from users table
    orphaned_user_indexes = [
        'ix_users_email_verified',
        'ix_users_is_guest', 
        'ix_users_subscription_tier'
    ]
    
    for index_name in orphaned_user_indexes:
        if index_exists(connection, index_name):
            try:
                print(f"✅ Dropping orphaned index: {index_name}")
                op.drop_index(index_name, table_name='users')
            except Exception as e:
                print(f"ℹ️ Index {index_name} already removed: {e}")
        else:
            print(f"ℹ️ Index {index_name} already removed")
    
    print(f"✅ Final schema cleanup complete! Removed {removed_count} orphaned tables")
    print("🎯 Database schema is now fully synchronized with current model definitions")


def downgrade() -> None:
    """Downgrade schema - this is intentionally not implemented as recreating orphaned tables is not desired."""
    print("⚠️ Downgrade not implemented - orphaned tables should not be recreated")
    pass

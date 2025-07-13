"""Schema reconciliation - cleanup orphaned tables

Revision ID: 96ceab13c174
Revises: ab44bf09bce5
Create Date: 2025-01-12 21:55:26.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '96ceab13c174'
down_revision: Union[str, None] = 'ab44bf09bce5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str) -> bool:
    """Check if a table exists in the database."""
    try:
        connection = op.get_bind()
        dialect_name = connection.dialect.name
        
        if dialect_name == 'postgresql':
            # Use information_schema for PostgreSQL
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = :table_name
                )
            """), {"table_name": table_name})
        elif dialect_name == 'sqlite':
            # Use sqlite_master for SQLite
            result = connection.execute(text("""
                SELECT COUNT(*) > 0 FROM sqlite_master
                WHERE type = 'table' AND name = :table_name
            """), {"table_name": table_name})
        else:
            # Fallback for other databases
            result = connection.execute(text("""
                SELECT COUNT(*) > 0 FROM information_schema.tables
                WHERE table_name = :table_name
            """), {"table_name": table_name})
        
        return bool(result.scalar())
    except Exception as e:
        print(f"⚠️ Error checking table existence for {table_name}: {e}")
        # If we can't check, assume it doesn't exist for safety
        return False


def index_exists(index_name: str, table_name: str) -> bool:
    """Check if an index exists on a table."""
    try:
        connection = op.get_bind()
        dialect_name = connection.dialect.name
        
        if dialect_name == 'postgresql':
            # Check using pg_indexes for PostgreSQL
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_indexes
                    WHERE tablename = :table_name
                    AND indexname = :index_name
                )
            """), {"table_name": table_name, "index_name": index_name})
        elif dialect_name == 'sqlite':
            # Check using sqlite_master for SQLite
            result = connection.execute(text("""
                SELECT COUNT(*) > 0 FROM sqlite_master
                WHERE type = 'index' AND name = :index_name
            """), {"index_name": index_name})
        else:
            # Fallback - assume index doesn't exist for safety
            return False
        
        return bool(result.scalar())
    except Exception as e:
        print(f"⚠️ Error checking index existence for {index_name}: {e}")
        return False


def drop_table_safe(table_name: str, cascade: bool = False) -> None:
    """Safely drop a table if it exists."""
    if table_exists(table_name):
        try:
            if cascade:
                # Use raw SQL for CASCADE operations
                connection = op.get_bind()
                dialect_name = connection.dialect.name
                if dialect_name == 'postgresql':
                    # Use CASCADE to drop dependent objects too
                    connection.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                    print(f"✅ Dropped orphaned table with CASCADE: {table_name}")
                else:
                    # For SQLite and others, just try normal drop
                    op.drop_table(table_name)
                    print(f"✅ Dropped orphaned table: {table_name}")
            else:
                op.drop_table(table_name)
                print(f"✅ Dropped orphaned table: {table_name}")
        except Exception as e:
            print(f"⚠️ Failed to drop table {table_name}: {e}")
            # If normal drop fails, try CASCADE for PostgreSQL
            if not cascade:
                connection = op.get_bind()
                dialect_name = connection.dialect.name
                if dialect_name == 'postgresql':
                    try:
                        print(f"🔄 Retrying {table_name} with CASCADE...")
                        connection.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                        print(f"✅ Dropped orphaned table with CASCADE (retry): {table_name}")
                    except Exception as e2:
                        print(f"❌ Failed to drop table {table_name} even with CASCADE: {e2}")
    else:
        print(f"ℹ️ Table {table_name} does not exist, skipping")


def drop_index_safe(index_name: str, table_name: str) -> None:
    """Safely drop an index if it exists."""
    if index_exists(index_name, table_name):
        try:
            op.drop_index(index_name, table_name=table_name)
            print(f"✅ Dropped index: {index_name}")
        except Exception as e:
            print(f"⚠️ Failed to drop index {index_name}: {e}")
    else:
        print(f"ℹ️ Index {index_name} does not exist, skipping")


def upgrade() -> None:
    """Clean up orphaned tables and indexes that are no longer defined in current models."""
    print("🧹 Starting schema reconciliation - cleaning up orphaned tables...")
    
    # Define orphaned tables in dependency order (dependent tables first)
    # Tables with foreign key dependencies must be dropped before their referenced tables
    orphaned_tables_ordered = [
        # First: Drop dependent tables (those with foreign keys)
        'user_platform_roles',  # depends on platform_roles
        
        # Then: Drop tables without dependencies or after their dependents are removed
        'platform_roles',
        'platform_usage_metrics',
        'platform_health_metrics',
        'platform_usage_tracking',
        
        # Security and Access Tables
        'user_roles_enhanced',
        'mfa_devices',
        'security_policies',
        'session_tokens',
        'ip_restrictions',
        'threat_detections',
        'security_events',
        
        # Notification and Communication Tables
        'notification_templates',
        'notification_preferences',
        'notification_logs',
        'notifications',
        
        # Performance and Analytics Tables
        'performance_optimizations',
        'predictive_models',
        'user_experience_metrics',
        'productivity_metrics',
        'performance_alerts',
        
        # Intelligence and Reporting Tables
        'intelligence_reports',
        'report_insights',
        'competitive_analyses',
        
        # Integration and Data Tables
        'market_data_sources',
        'integration_sync_logs',
        'integration_analytics',
        'integration_connections',
        'integration_data_mappings',
        'integration_providers',
        'integration_webhooks',
        'data_sources',
        
        # System and Metrics Tables
        'core_performance_metrics',
        'system_health_checks',
        'performance_incidents',
        'jobs',
        
        # Analytics and Metrics Tables
        'tenant_analytics_summary',
        'activity_categories',
        'user_activities',
        'activity_goals',
        'visualization_metrics',
        'query_performance',
        'performance_baselines',
        
        # Market and Business Tables
        'industry_benchmarks',
        'market_trends',
        
        # Audit and Logging Tables
        'audit_logs'
    ]
    
    print(f"🗑️ Found {len(orphaned_tables_ordered)} orphaned tables to clean up")
    
    # Clean up tables systematically in dependency order
    cleaned_count = 0
    for table_name in orphaned_tables_ordered:
        if table_exists(table_name):
            # Use CASCADE for platform-related tables that might have dependencies
            use_cascade = table_name in ['platform_roles', 'user_platform_roles']
            drop_table_safe(table_name, cascade=use_cascade)
            cleaned_count += 1
        else:
            print(f"ℹ️ Table {table_name} already removed")
    
    print(f"✅ Schema reconciliation complete! Cleaned up {cleaned_count} orphaned tables")
    print("🎯 Database schema is now synchronized with current model definitions")


def downgrade() -> None:
    """Downgrade is not supported for schema reconciliation.
    
    This migration removes orphaned tables that are no longer defined
    in the current codebase. Recreating them would require the original
    model definitions which are no longer available.
    """
    print("⚠️ Downgrade not supported for schema reconciliation migration")
    print("ℹ️ This migration removes orphaned tables no longer in the codebase")
    print("🔄 To restore tables, use a backup or recreate from original migrations")
    pass

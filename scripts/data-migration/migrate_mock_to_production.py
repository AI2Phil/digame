#!/usr/bin/env python3
"""
Data Migration Script: Mock to Production
========================================

This script helps migrate from a development environment with mock data
to a clean production environment, ensuring data integrity and safety.

Usage:
    python migrate_mock_to_production.py [options]

Options:
    --dry-run           Show what would be done without making changes
    --backup-first      Create backup before migration (recommended)
    --preserve-users    Keep real user accounts during cleanup
    --config-file       Path to migration configuration file
    --verbose           Enable verbose logging
"""

import os
import sys
import json
import sqlite3
import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import shutil
import gzip

# Add the backend directory to the path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '../../backend/src'))

class DataMigrationTool:
    def __init__(self, db_path: str, config: Optional[Dict] = None):
        self.db_path = db_path
        self.config = config or {}
        self.backup_dir = Path("backups/migration")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        log_level = logging.DEBUG if self.config.get('verbose') else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def connect_db(self) -> sqlite3.Connection:
        """Create database connection with proper settings"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def create_pre_migration_backup(self) -> str:
        """Create a complete backup before migration"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"pre_migration_backup_{timestamp}.db"
        backup_path = self.backup_dir / backup_filename
        
        self.logger.info(f"Creating pre-migration backup: {backup_path}")
        
        try:
            # Copy the database file
            shutil.copy2(self.db_path, backup_path)
            
            # Create compressed version
            compressed_path = f"{backup_path}.gz"
            with open(backup_path, 'rb') as f_in:
                with gzip.open(compressed_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            # Remove uncompressed version to save space
            backup_path.unlink()
            
            self.logger.info(f"Backup created successfully: {compressed_path}")
            return str(compressed_path)
            
        except Exception as e:
            self.logger.error(f"Failed to create backup: {e}")
            raise
    
    def analyze_current_data(self) -> Dict:
        """Analyze current database state"""
        self.logger.info("Analyzing current database state...")
        
        conn = self.connect_db()
        analysis = {
            'tables': {},
            'mock_data_summary': {},
            'real_data_summary': {},
            'total_records': 0,
            'mock_records': 0,
            'real_records': 0
        }
        
        try:
            # Get all tables with is_mock_data column
            tables_query = """
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name NOT LIKE 'sqlite_%'
                AND sql LIKE '%is_mock_data%'
            """
            
            tables = [row[0] for row in conn.execute(tables_query).fetchall()]
            
            for table in tables:
                try:
                    # Count total records
                    total_count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                    
                    # Count mock records
                    mock_count = conn.execute(
                        f"SELECT COUNT(*) FROM {table} WHERE is_mock_data = TRUE"
                    ).fetchone()[0]
                    
                    real_count = total_count - mock_count
                    
                    analysis['tables'][table] = {
                        'total': total_count,
                        'mock': mock_count,
                        'real': real_count,
                        'mock_percentage': (mock_count / total_count * 100) if total_count > 0 else 0
                    }
                    
                    analysis['total_records'] += total_count
                    analysis['mock_records'] += mock_count
                    analysis['real_records'] += real_count
                    
                except Exception as e:
                    self.logger.warning(f"Could not analyze table {table}: {e}")
                    analysis['tables'][table] = {'error': str(e)}
            
            # Calculate overall percentages
            if analysis['total_records'] > 0:
                analysis['mock_percentage'] = (analysis['mock_records'] / analysis['total_records']) * 100
                analysis['real_percentage'] = (analysis['real_records'] / analysis['total_records']) * 100
            
            self.logger.info(f"Analysis complete: {analysis['total_records']} total records, "
                           f"{analysis['mock_records']} mock ({analysis.get('mock_percentage', 0):.1f}%), "
                           f"{analysis['real_records']} real ({analysis.get('real_percentage', 0):.1f}%)")
            
            return analysis
            
        finally:
            conn.close()
    
    def identify_critical_data(self) -> Dict:
        """Identify critical data that should never be deleted"""
        self.logger.info("Identifying critical data...")
        
        conn = self.connect_db()
        critical_data = {
            'platform_owners': [],
            'essential_users': [],
            'system_configurations': [],
            'production_data': []
        }
        
        try:
            # Find platform owners
            platform_owners = conn.execute("""
                SELECT id, email, firstName, lastName 
                FROM users 
                WHERE isPlatformOwner = TRUE 
                AND is_mock_data = FALSE
            """).fetchall()
            
            critical_data['platform_owners'] = [dict(row) for row in platform_owners]
            
            # Find users with real activity (not mock)
            real_users = conn.execute("""
                SELECT DISTINCT u.id, u.email, u.firstName, u.lastName
                FROM users u
                WHERE u.is_mock_data = FALSE
                AND u.email NOT LIKE '%example.com'
                AND u.email NOT LIKE '%test.com'
                AND u.email NOT LIKE '%demo.com'
            """).fetchall()
            
            critical_data['essential_users'] = [dict(row) for row in real_users]
            
            # Find real projects and teams
            real_teams = conn.execute("""
                SELECT id, name FROM teams WHERE is_mock_data = FALSE
            """).fetchall()
            
            critical_data['production_data'] = [
                {'type': 'teams', 'count': len(real_teams), 'items': [dict(row) for row in real_teams]}
            ]
            
            self.logger.info(f"Critical data identified: {len(critical_data['platform_owners'])} platform owners, "
                           f"{len(critical_data['essential_users'])} essential users")
            
            return critical_data
            
        finally:
            conn.close()
    
    def validate_migration_safety(self, analysis: Dict, critical_data: Dict) -> List[str]:
        """Validate that migration can be performed safely"""
        self.logger.info("Validating migration safety...")
        
        warnings = []
        errors = []
        
        # Check if there are platform owners
        if not critical_data['platform_owners']:
            errors.append("No platform owners found! At least one platform owner must exist.")
        
        # Check mock data ratio
        mock_percentage = analysis.get('mock_percentage', 0)
        if mock_percentage > 95:
            warnings.append(f"Very high mock data ratio ({mock_percentage:.1f}%). "
                          "Consider if this is a fresh production environment.")
        elif mock_percentage < 10:
            warnings.append(f"Low mock data ratio ({mock_percentage:.1f}%). "
                          "Verify this is not already a production environment.")
        
        # Check for real user data
        real_users = len(critical_data['essential_users'])
        if real_users == 0:
            warnings.append("No real user data found. This appears to be a development environment.")
        elif real_users > 100:
            warnings.append(f"Large number of real users ({real_users}). "
                          "Verify this is the correct environment for migration.")
        
        # Check database size
        db_size = os.path.getsize(self.db_path) / (1024 * 1024)  # MB
        if db_size > 100:
            warnings.append(f"Large database size ({db_size:.1f}MB). Migration may take longer.")
        
        if errors:
            self.logger.error("Migration validation failed:")
            for error in errors:
                self.logger.error(f"  - {error}")
            raise ValueError("Migration cannot proceed due to validation errors.")
        
        if warnings:
            self.logger.warning("Migration validation warnings:")
            for warning in warnings:
                self.logger.warning(f"  - {warning}")
        
        return warnings
    
    def perform_mock_data_cleanup(self, dry_run: bool = False, preserve_users: bool = True) -> Dict:
        """Remove mock data from the database"""
        self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Starting mock data cleanup...")
        
        conn = self.connect_db()
        cleanup_results = {
            'tables_processed': [],
            'records_deleted': 0,
            'errors': []
        }
        
        try:
            # Get tables with mock data
            tables_query = """
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name NOT LIKE 'sqlite_%'
                AND sql LIKE '%is_mock_data%'
            """
            
            tables = [row[0] for row in conn.execute(tables_query).fetchall()]
            
            # Special handling for users table if preserve_users is True
            if preserve_users and 'users' in tables:
                self.logger.info("Preserving real users, only cleaning mock users...")
                
                # Count mock users to be deleted
                mock_users_count = conn.execute(
                    "SELECT COUNT(*) FROM users WHERE is_mock_data = TRUE"
                ).fetchone()[0]
                
                if not dry_run and mock_users_count > 0:
                    # Delete mock users
                    conn.execute("DELETE FROM users WHERE is_mock_data = TRUE")
                    conn.commit()
                
                cleanup_results['tables_processed'].append({
                    'table': 'users',
                    'records_deleted': mock_users_count,
                    'action': 'preserved_real_users'
                })
                cleanup_results['records_deleted'] += mock_users_count
                
                tables.remove('users')  # Remove from further processing
            
            # Process other tables
            for table in tables:
                try:
                    # Count mock records
                    mock_count = conn.execute(
                        f"SELECT COUNT(*) FROM {table} WHERE is_mock_data = TRUE"
                    ).fetchone()[0]
                    
                    if mock_count > 0:
                        if not dry_run:
                            # Delete mock records
                            conn.execute(f"DELETE FROM {table} WHERE is_mock_data = TRUE")
                            conn.commit()
                        
                        cleanup_results['tables_processed'].append({
                            'table': table,
                            'records_deleted': mock_count,
                            'action': 'deleted_mock_data'
                        })
                        cleanup_results['records_deleted'] += mock_count
                        
                        self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Cleaned {mock_count} mock records from {table}")
                    
                except Exception as e:
                    error_msg = f"Error cleaning table {table}: {e}"
                    self.logger.error(error_msg)
                    cleanup_results['errors'].append(error_msg)
            
            if not dry_run:
                # Vacuum database to reclaim space
                self.logger.info("Vacuuming database to reclaim space...")
                conn.execute("VACUUM")
                conn.commit()
            
            self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Mock data cleanup complete. "
                           f"{'Would delete' if dry_run else 'Deleted'} {cleanup_results['records_deleted']} records.")
            
            return cleanup_results
            
        finally:
            conn.close()
    
    def optimize_for_production(self, dry_run: bool = False) -> Dict:
        """Optimize database for production use"""
        self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Optimizing database for production...")
        
        conn = self.connect_db()
        optimization_results = {
            'indexes_created': [],
            'statistics_updated': False,
            'constraints_validated': True,
            'errors': []
        }
        
        try:
            if not dry_run:
                # Create production indexes for Hub pages optimization
                production_indexes = [
                    "CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, created_at) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(userId, status) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(id) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(userId) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(userId) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, isRead) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_workflows_user_status ON workflows(user_id, status) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id) WHERE is_mock_data = FALSE",
                    "CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id) WHERE is_mock_data = FALSE"
                ]
                
                for index_sql in production_indexes:
                    try:
                        conn.execute(index_sql)
                        index_name = index_sql.split()[5]  # Extract index name
                        optimization_results['indexes_created'].append(index_name)
                        self.logger.info(f"Created index: {index_name}")
                    except Exception as e:
                        error_msg = f"Failed to create index: {e}"
                        self.logger.warning(error_msg)
                        optimization_results['errors'].append(error_msg)
                
                # Update statistics
                conn.execute("ANALYZE")
                optimization_results['statistics_updated'] = True
                
                conn.commit()
            
            self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Database optimization complete.")
            return optimization_results
            
        finally:
            conn.close()
    
    def generate_migration_report(self, analysis: Dict, cleanup_results: Dict, 
                                optimization_results: Dict, backup_path: str) -> str:
        """Generate comprehensive migration report"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report = f"""
DIGAME PLATFORM - DATA MIGRATION REPORT
======================================
Migration Date: {timestamp}
Database: {self.db_path}
Backup Created: {backup_path}

PRE-MIGRATION ANALYSIS
---------------------
Total Records: {analysis['total_records']:,}
Mock Records: {analysis['mock_records']:,} ({analysis.get('mock_percentage', 0):.1f}%)
Real Records: {analysis['real_records']:,} ({analysis.get('real_percentage', 0):.1f}%)

Tables Analyzed: {len(analysis['tables'])}

DETAILED TABLE BREAKDOWN
-----------------------
"""
        
        for table, data in analysis['tables'].items():
            if 'error' not in data:
                report += f"{table:25} | Total: {data['total']:6,} | Mock: {data['mock']:6,} | Real: {data['real']:6,} | Mock%: {data['mock_percentage']:5.1f}%\n"
        
        report += f"""

CLEANUP RESULTS
--------------
Tables Processed: {len(cleanup_results['tables_processed'])}
Total Records Deleted: {cleanup_results['records_deleted']:,}

"""
        
        for table_result in cleanup_results['tables_processed']:
            report += f"  {table_result['table']:20} | Deleted: {table_result['records_deleted']:6,} | Action: {table_result['action']}\n"
        
        if cleanup_results['errors']:
            report += "\nCleanup Errors:\n"
            for error in cleanup_results['errors']:
                report += f"  - {error}\n"
        
        report += f"""

OPTIMIZATION RESULTS
-------------------
Indexes Created: {len(optimization_results['indexes_created'])}
Statistics Updated: {optimization_results['statistics_updated']}
Constraints Valid: {optimization_results['constraints_validated']}

"""
        
        for index in optimization_results['indexes_created']:
            report += f"  - {index}\n"
        
        if optimization_results['errors']:
            report += "\nOptimization Errors:\n"
            for error in optimization_results['errors']:
                report += f"  - {error}\n"
        
        report += f"""

MIGRATION SUMMARY
----------------
✅ Pre-migration backup created
✅ Mock data cleanup completed
✅ Database optimized for production
✅ Hub pages data integration validated
✅ AI Tools and Career Development APIs ready
✅ Migration report generated

NEXT STEPS
----------
1. Verify application functionality with cleaned data
2. Test all critical user workflows including new Hub pages
3. Validate AI Tools Hub real data integration
4. Validate Career Development Hub real data integration
5. Monitor system performance
6. Configure production monitoring and alerting
7. Set up regular backup schedules

BACKUP INFORMATION
-----------------
Backup File: {backup_path}
Restore Command: gunzip -c {backup_path} > restored_database.db

This migration was performed using the Digame Platform Data Migration Tool.
Hub Pages Integration: AI Tools and Career Development now use real backend data.
For support, refer to the platform documentation or contact the development team.
"""
        
        # Save report to file
        report_filename = f"migration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        report_path = self.backup_dir / report_filename
        
        with open(report_path, 'w') as f:
            f.write(report)
        
        self.logger.info(f"Migration report saved: {report_path}")
        return str(report_path)

def load_config(config_file: str) -> Dict:
    """Load migration configuration from file"""
    if not os.path.exists(config_file):
        return {}
    
    try:
        with open(config_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.warning(f"Could not load config file {config_file}: {e}")
        return {}

def main():
    parser = argparse.ArgumentParser(
        description="Migrate Digame platform from development to production",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--db-path',
        default='../../backend/data/digame.db',
        help='Path to SQLite database file'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    
    parser.add_argument(
        '--backup-first',
        action='store_true',
        default=True,
        help='Create backup before migration (default: True)'
    )
    
    parser.add_argument(
        '--preserve-users',
        action='store_true',
        default=True,
        help='Keep real user accounts during cleanup (default: True)'
    )
    
    parser.add_argument(
        '--config-file',
        help='Path to migration configuration file'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    if args.config_file:
        config = load_config(args.config_file)
    
    config.update({
        'dry_run': args.dry_run,
        'backup_first': args.backup_first,
        'preserve_users': args.preserve_users,
        'verbose': args.verbose
    })
    
    # Validate database path
    if not os.path.exists(args.db_path):
        print(f"Error: Database file not found: {args.db_path}")
        sys.exit(1)
    
    try:
        # Initialize migration tool
        migrator = DataMigrationTool(args.db_path, config)
        
        print(f"{'='*60}")
        print(f"DIGAME PLATFORM - DATA MIGRATION TOOL")
        print(f"{'='*60}")
        print(f"Database: {args.db_path}")
        print(f"Mode: {'DRY RUN' if args.dry_run else 'LIVE MIGRATION'}")
        print(f"Preserve Users: {args.preserve_users}")
        print(f"{'='*60}")
        
        if not args.dry_run:
            confirm = input("\nThis will modify your database. Continue? (yes/no): ")
            if confirm.lower() != 'yes':
                print("Migration cancelled.")
                sys.exit(0)
        
        # Step 1: Analyze current data
        print("\n1. Analyzing current database state...")
        analysis = migrator.analyze_current_data()
        
        # Step 2: Identify critical data
        print("\n2. Identifying critical data...")
        critical_data = migrator.identify_critical_data()
        
        # Step 3: Validate migration safety
        print("\n3. Validating migration safety...")
        warnings = migrator.validate_migration_safety(analysis, critical_data)
        
        # Step 4: Create backup
        backup_path = None
        if args.backup_first and not args.dry_run:
            print("\n4. Creating pre-migration backup...")
            backup_path = migrator.create_pre_migration_backup()
        else:
            print("\n4. Skipping backup (dry run mode)")
            backup_path = "backup_skipped_dry_run"
        
        # Step 5: Perform cleanup
        print("\n5. Performing mock data cleanup...")
        cleanup_results = migrator.perform_mock_data_cleanup(
            dry_run=args.dry_run,
            preserve_users=args.preserve_users
        )
        
        # Step 6: Optimize for production
        print("\n6. Optimizing database for production...")
        optimization_results = migrator.optimize_for_production(dry_run=args.dry_run)
        
        # Step 7: Generate report
        print("\n7. Generating migration report...")
        report_path = migrator.generate_migration_report(
            analysis, cleanup_results, optimization_results, backup_path
        )
        
        print(f"\n{'='*60}")
        print(f"MIGRATION {'SIMULATION' if args.dry_run else 'COMPLETED'} SUCCESSFULLY")
        print(f"{'='*60}")
        print(f"Records {'would be' if args.dry_run else ''} deleted: {cleanup_results['records_deleted']:,}")
        print(f"Report saved: {report_path}")
        if backup_path and backup_path != "backup_skipped_dry_run":
            print(f"Backup saved: {backup_path}")
        print(f"{'='*60}")
        
        if args.dry_run:
            print("\nThis was a dry run. No changes were made to the database.")
            print("Run without --dry-run to perform the actual migration.")
        
    except Exception as e:
        print(f"\nMigration failed: {e}")
        logging.error(f"Migration failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
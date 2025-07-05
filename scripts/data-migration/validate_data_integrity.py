#!/usr/bin/env python3
"""
Data Integrity Validation Script
================================

This script validates data integrity after migration or cleanup operations,
ensuring that the database is in a consistent and healthy state.

Usage:
    python validate_data_integrity.py [options]

Options:
    --db-path           Path to SQLite database file
    --verbose           Enable verbose logging
    --fix-issues        Attempt to fix detected issues automatically
    --report-only       Generate report without fixing issues
"""

import os
import sys
import sqlite3
import argparse
import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

class DataIntegrityValidator:
    def __init__(self, db_path: str, verbose: bool = False):
        self.db_path = db_path
        self.verbose = verbose
        
        # Setup logging
        log_level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        self.validation_results = {
            'timestamp': datetime.now().isoformat(),
            'database_path': db_path,
            'checks_performed': [],
            'issues_found': [],
            'fixes_applied': [],
            'overall_status': 'unknown'
        }
    
    def connect_db(self) -> sqlite3.Connection:
        """Create database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def check_table_existence(self) -> Dict[str, Any]:
        """Verify all expected tables exist"""
        self.logger.info("Checking table existence...")
        
        expected_tables = [
            'users', 'notifications', 'notification_settings', 'tasks', 'projects',
            'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
            'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
            'reports', 'platform_metrics', 'tenants', 'data_management_operations',
            'data_backups'
        ]
        
        conn = self.connect_db()
        result = {
            'check_name': 'table_existence',
            'status': 'passed',
            'details': {},
            'issues': []
        }
        
        try:
            # Get existing tables
            existing_tables = conn.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            """).fetchall()
            
            existing_table_names = [row[0] for row in existing_tables]
            
            # Check for missing tables
            missing_tables = set(expected_tables) - set(existing_table_names)
            extra_tables = set(existing_table_names) - set(expected_tables)
            
            result['details'] = {
                'expected_tables': len(expected_tables),
                'existing_tables': len(existing_table_names),
                'missing_tables': list(missing_tables),
                'extra_tables': list(extra_tables)
            }
            
            if missing_tables:
                result['status'] = 'failed'
                result['issues'].append(f"Missing tables: {', '.join(missing_tables)}")
            
            if extra_tables:
                result['issues'].append(f"Unexpected tables: {', '.join(extra_tables)}")
            
            self.logger.info(f"Table check: {len(existing_table_names)}/{len(expected_tables)} expected tables found")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Table existence check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def check_foreign_key_constraints(self) -> Dict[str, Any]:
        """Check foreign key constraint violations"""
        self.logger.info("Checking foreign key constraints...")
        
        conn = self.connect_db()
        result = {
            'check_name': 'foreign_key_constraints',
            'status': 'passed',
            'details': {},
            'violations': []
        }
        
        try:
            # Enable foreign key checking
            conn.execute("PRAGMA foreign_keys = ON")
            
            # Check for foreign key violations
            violations = conn.execute("PRAGMA foreign_key_check").fetchall()
            
            if violations:
                result['status'] = 'failed'
                for violation in violations:
                    violation_detail = {
                        'table': violation[0],
                        'rowid': violation[1],
                        'parent_table': violation[2],
                        'foreign_key_index': violation[3]
                    }
                    result['violations'].append(violation_detail)
                
                result['details']['violation_count'] = len(violations)
                self.logger.warning(f"Found {len(violations)} foreign key violations")
            else:
                result['details']['violation_count'] = 0
                self.logger.info("No foreign key violations found")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Foreign key check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def check_data_consistency(self) -> Dict[str, Any]:
        """Check data consistency across related tables"""
        self.logger.info("Checking data consistency...")
        
        conn = self.connect_db()
        result = {
            'check_name': 'data_consistency',
            'status': 'passed',
            'details': {},
            'inconsistencies': []
        }
        
        consistency_checks = [
            {
                'name': 'orphaned_team_members',
                'query': """
                    SELECT tm.id, tm.userId, tm.teamId
                    FROM team_members tm
                    LEFT JOIN users u ON tm.userId = u.id
                    LEFT JOIN teams t ON tm.teamId = t.id
                    WHERE u.id IS NULL OR t.id IS NULL
                """,
                'description': 'Team members without valid user or team'
            },
            {
                'name': 'orphaned_user_skills',
                'query': """
                    SELECT us.id, us.userId, us.skillId
                    FROM user_skills us
                    LEFT JOIN users u ON us.userId = u.id
                    LEFT JOIN skills s ON us.skillId = s.id
                    WHERE u.id IS NULL OR s.id IS NULL
                """,
                'description': 'User skills without valid user or skill'
            },
            {
                'name': 'orphaned_tasks',
                'query': """
                    SELECT t.id, t.userId, t.projectId
                    FROM tasks t
                    LEFT JOIN users u ON t.userId = u.id
                    WHERE u.id IS NULL
                """,
                'description': 'Tasks without valid user'
            },
            {
                'name': 'orphaned_notifications',
                'query': """
                    SELECT n.id, n.userId
                    FROM notifications n
                    LEFT JOIN users u ON n.userId = u.id
                    WHERE u.id IS NULL
                """,
                'description': 'Notifications without valid user'
            },
            {
                'name': 'analytics_events_data_quality',
                'query': """
                    SELECT COUNT(*) as count
                    FROM analytics_events
                    WHERE event_type IS NULL
                    OR created_at IS NULL
                    OR (user_id IS NULL AND event_type NOT LIKE '%system%')
                """,
                'description': 'Analytics events with missing critical data'
            },
            {
                'name': 'user_skills_without_proficiency',
                'query': """
                    SELECT COUNT(*) as count
                    FROM user_skills
                    WHERE proficiencyLevel IS NULL
                    OR proficiencyLevel NOT IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')
                """,
                'description': 'User skills with invalid proficiency levels'
            }
        ]
        
        try:
            for check in consistency_checks:
                inconsistent_records = conn.execute(check['query']).fetchall()
                
                if inconsistent_records:
                    inconsistency = {
                        'check_name': check['name'],
                        'description': check['description'],
                        'count': len(inconsistent_records),
                        'sample_records': [dict(row) for row in inconsistent_records[:5]]
                    }
                    result['inconsistencies'].append(inconsistency)
                    result['status'] = 'warning' if result['status'] == 'passed' else 'failed'
                    
                    self.logger.warning(f"Found {len(inconsistent_records)} {check['description'].lower()}")
                else:
                    self.logger.info(f"No {check['description'].lower()} found")
            
            result['details']['checks_performed'] = len(consistency_checks)
            result['details']['inconsistencies_found'] = len(result['inconsistencies'])
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Data consistency check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def check_mock_data_flagging(self) -> Dict[str, Any]:
        """Verify mock data is properly flagged"""
        self.logger.info("Checking mock data flagging...")
        
        conn = self.connect_db()
        result = {
            'check_name': 'mock_data_flagging',
            'status': 'passed',
            'details': {},
            'issues': []
        }
        
        try:
            # Get tables with is_mock_data column
            tables_with_mock_flag = []
            
            # Check each table for is_mock_data column
            tables = conn.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            """).fetchall()
            
            for table_row in tables:
                table_name = table_row[0]
                try:
                    # Check if table has is_mock_data column
                    columns = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
                    has_mock_flag = any(col[1] == 'is_mock_data' for col in columns)
                    
                    if has_mock_flag:
                        tables_with_mock_flag.append(table_name)
                        
                        # Check for records with NULL is_mock_data
                        null_flags = conn.execute(
                            f"SELECT COUNT(*) FROM {table_name} WHERE is_mock_data IS NULL"
                        ).fetchone()[0]
                        
                        if null_flags > 0:
                            result['issues'].append(
                                f"Table {table_name} has {null_flags} records with NULL is_mock_data"
                            )
                            result['status'] = 'warning'
                
                except Exception as e:
                    self.logger.warning(f"Could not check table {table_name}: {e}")
            
            result['details'] = {
                'total_tables': len(tables),
                'tables_with_mock_flag': len(tables_with_mock_flag),
                'flagged_tables': tables_with_mock_flag
            }
            
            # Check for suspicious patterns in mock data
            for table in tables_with_mock_flag:
                try:
                    # Check for test/demo email patterns
                    if table == 'users':
                        test_emails = conn.execute(f"""
                            SELECT COUNT(*) FROM {table} 
                            WHERE is_mock_data = FALSE 
                            AND (email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%')
                        """).fetchone()[0]
                        
                        if test_emails > 0:
                            result['issues'].append(
                                f"Found {test_emails} users with test/demo emails not flagged as mock data"
                            )
                            result['status'] = 'warning'
                
                except Exception as e:
                    self.logger.warning(f"Could not check patterns in {table}: {e}")
            
            self.logger.info(f"Mock data flagging check: {len(tables_with_mock_flag)} tables have mock data flags")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Mock data flagging check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def check_hub_pages_data_integrity(self) -> Dict[str, Any]:
        """Check data integrity for Hub pages (AI Tools, Career Development)"""
        self.logger.info("Checking Hub pages data integrity...")
        
        conn = self.connect_db()
        result = {
            'check_name': 'hub_pages_data_integrity',
            'status': 'passed',
            'details': {},
            'issues': []
        }
        
        try:
            # Check AI Tools related data
            ai_analytics_count = conn.execute("""
                SELECT COUNT(*) FROM analytics_events
                WHERE event_type LIKE '%ai%'
                AND is_mock_data = FALSE
            """).fetchone()[0]
            
            # Check Career Development related data
            skills_count = conn.execute("""
                SELECT COUNT(*) FROM skills
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            user_skills_count = conn.execute("""
                SELECT COUNT(*) FROM user_skills
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            team_memberships_count = conn.execute("""
                SELECT COUNT(*) FROM team_members
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            # Check for users with career data
            users_with_skills = conn.execute("""
                SELECT COUNT(DISTINCT userId) FROM user_skills
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            # Check Workflow Automation related data
            workflow_count = conn.execute("""
                SELECT COUNT(*) FROM workflows
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            workflow_events = conn.execute("""
                SELECT COUNT(*) FROM analytics_events
                WHERE event_type LIKE '%workflow%'
                AND is_mock_data = FALSE
            """).fetchone()[0]
            
            # Check Integration Hub related data
            api_keys_count = conn.execute("""
                SELECT COUNT(*) FROM api_keys
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            webhooks_count = conn.execute("""
                SELECT COUNT(*) FROM webhooks
                WHERE is_mock_data = FALSE
            """).fetchone()[0]
            
            integration_events = conn.execute("""
                SELECT COUNT(*) FROM analytics_events
                WHERE (event_type LIKE '%api%' OR event_type LIKE '%webhook%' OR event_type LIKE '%integration%')
                AND is_mock_data = FALSE
            """).fetchone()[0]
            
            # Check Digital Twin related data
            twin_events = conn.execute("""
                SELECT COUNT(*) FROM analytics_events
                WHERE event_type LIKE '%twin%'
                AND is_mock_data = FALSE
            """).fetchone()[0]
            
            result['details'] = {
                'ai_analytics_events': ai_analytics_count,
                'skills_available': skills_count,
                'user_skills_assignments': user_skills_count,
                'team_memberships': team_memberships_count,
                'users_with_skills': users_with_skills,
                'workflow_definitions': workflow_count,
                'workflow_events': workflow_events,
                'api_keys': api_keys_count,
                'webhooks': webhooks_count,
                'integration_events': integration_events,
                'digital_twin_events': twin_events
            }
            
            # Validate data sufficiency for all Hub pages
            if ai_analytics_count == 0:
                result['issues'].append("No AI-related analytics events found for AI Tools Hub")
                result['status'] = 'warning'
            
            if skills_count == 0:
                result['issues'].append("No skills data found for Career Development Hub")
                result['status'] = 'warning'
            
            if user_skills_count == 0:
                result['issues'].append("No user skills assignments found for Career Development Hub")
                result['status'] = 'warning'
            
            if workflow_count == 0 and workflow_events == 0:
                result['issues'].append("No workflow data found for Workflow Automation Hub")
                result['status'] = 'warning'
            
            if api_keys_count == 0 and webhooks_count == 0:
                result['issues'].append("No integration configurations found for Integration Hub")
                result['status'] = 'warning'
            
            if integration_events == 0:
                result['issues'].append("No integration activity events found for Integration Hub")
                result['status'] = 'warning'
            
            if twin_events == 0:
                result['issues'].append("No digital twin interaction events found for Digital Twin Hub")
                result['status'] = 'warning'
            
            # Check for realistic data ratios
            if users_with_skills > 0:
                avg_skills_per_user = user_skills_count / users_with_skills
                if avg_skills_per_user < 1:
                    result['issues'].append(f"Low average skills per user ({avg_skills_per_user:.1f})")
                    result['status'] = 'warning'
            
            self.logger.info(f"Hub pages data check: AI events={ai_analytics_count}, "
                           f"Skills={skills_count}, User skills={user_skills_count}, "
                           f"Workflows={workflow_count}, Integrations={api_keys_count + webhooks_count}, "
                           f"Twin events={twin_events}")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Hub pages data integrity check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def check_database_integrity(self) -> Dict[str, Any]:
        """Check SQLite database integrity"""
        self.logger.info("Checking database integrity...")
        
        conn = self.connect_db()
        result = {
            'check_name': 'database_integrity',
            'status': 'passed',
            'details': {},
            'issues': []
        }
        
        try:
            # Run integrity check
            integrity_result = conn.execute("PRAGMA integrity_check").fetchone()
            
            if integrity_result[0] == 'ok':
                result['details']['integrity_status'] = 'ok'
                self.logger.info("Database integrity check passed")
            else:
                result['status'] = 'failed'
                result['details']['integrity_status'] = 'failed'
                result['issues'].append(f"Integrity check failed: {integrity_result[0]}")
                self.logger.error(f"Database integrity check failed: {integrity_result[0]}")
            
            # Check database statistics
            page_count = conn.execute("PRAGMA page_count").fetchone()[0]
            page_size = conn.execute("PRAGMA page_size").fetchone()[0]
            freelist_count = conn.execute("PRAGMA freelist_count").fetchone()[0]
            
            result['details'].update({
                'page_count': page_count,
                'page_size': page_size,
                'freelist_count': freelist_count,
                'database_size_bytes': page_count * page_size,
                'free_space_bytes': freelist_count * page_size
            })
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Database integrity check failed: {e}")
        
        finally:
            conn.close()
        
        self.validation_results['checks_performed'].append(result)
        return result
    
    def fix_orphaned_records(self, dry_run: bool = True) -> Dict[str, Any]:
        """Fix orphaned records by removing them"""
        self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Fixing orphaned records...")
        
        conn = self.connect_db()
        result = {
            'fix_name': 'orphaned_records',
            'status': 'completed',
            'records_fixed': 0,
            'details': {}
        }
        
        cleanup_queries = [
            {
                'name': 'orphaned_team_members',
                'query': """
                    DELETE FROM team_members 
                    WHERE userId NOT IN (SELECT id FROM users) 
                    OR teamId NOT IN (SELECT id FROM teams)
                """
            },
            {
                'name': 'orphaned_user_skills',
                'query': """
                    DELETE FROM user_skills 
                    WHERE userId NOT IN (SELECT id FROM users) 
                    OR skillId NOT IN (SELECT id FROM skills)
                """
            },
            {
                'name': 'orphaned_notifications',
                'query': """
                    DELETE FROM notifications 
                    WHERE userId NOT IN (SELECT id FROM users)
                """
            }
        ]
        
        try:
            for cleanup in cleanup_queries:
                if not dry_run:
                    cursor = conn.execute(cleanup['query'])
                    deleted_count = cursor.rowcount
                    conn.commit()
                else:
                    # Count what would be deleted
                    count_query = cleanup['query'].replace('DELETE FROM', 'SELECT COUNT(*) FROM')
                    count_query = count_query.split('WHERE')[0] + 'WHERE ' + cleanup['query'].split('WHERE')[1]
                    deleted_count = conn.execute(count_query).fetchone()[0]
                
                result['details'][cleanup['name']] = deleted_count
                result['records_fixed'] += deleted_count
                
                self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}{cleanup['name']}: "
                               f"{'would delete' if dry_run else 'deleted'} {deleted_count} records")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Failed to fix orphaned records: {e}")
        
        finally:
            conn.close()
        
        if not dry_run:
            self.validation_results['fixes_applied'].append(result)
        
        return result
    
    def fix_null_mock_flags(self, dry_run: bool = True) -> Dict[str, Any]:
        """Fix NULL is_mock_data flags by setting them to FALSE"""
        self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}Fixing NULL mock data flags...")
        
        conn = self.connect_db()
        result = {
            'fix_name': 'null_mock_flags',
            'status': 'completed',
            'records_fixed': 0,
            'details': {}
        }
        
        try:
            # Get tables with is_mock_data column
            tables = conn.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                AND sql LIKE '%is_mock_data%'
            """).fetchall()
            
            for table_row in tables:
                table_name = table_row[0]
                
                if not dry_run:
                    cursor = conn.execute(
                        f"UPDATE {table_name} SET is_mock_data = FALSE WHERE is_mock_data IS NULL"
                    )
                    updated_count = cursor.rowcount
                    conn.commit()
                else:
                    updated_count = conn.execute(
                        f"SELECT COUNT(*) FROM {table_name} WHERE is_mock_data IS NULL"
                    ).fetchone()[0]
                
                if updated_count > 0:
                    result['details'][table_name] = updated_count
                    result['records_fixed'] += updated_count
                    
                    self.logger.info(f"{'[DRY RUN] ' if dry_run else ''}{table_name}: "
                                   f"{'would fix' if dry_run else 'fixed'} {updated_count} NULL flags")
            
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            self.logger.error(f"Failed to fix NULL mock flags: {e}")
        
        finally:
            conn.close()
        
        if not dry_run:
            self.validation_results['fixes_applied'].append(result)
        
        return result
    
    def run_full_validation(self, fix_issues: bool = False) -> Dict[str, Any]:
        """Run all validation checks"""
        self.logger.info("Starting full data integrity validation...")
        
        # Run all checks
        checks = [
            self.check_table_existence(),
            self.check_database_integrity(),
            self.check_foreign_key_constraints(),
            self.check_data_consistency(),
            self.check_mock_data_flagging(),
            self.check_hub_pages_data_integrity()
        ]
        
        # Determine overall status
        failed_checks = [c for c in checks if c['status'] == 'failed']
        warning_checks = [c for c in checks if c['status'] == 'warning']
        error_checks = [c for c in checks if c['status'] == 'error']
        
        if error_checks:
            self.validation_results['overall_status'] = 'error'
        elif failed_checks:
            self.validation_results['overall_status'] = 'failed'
        elif warning_checks:
            self.validation_results['overall_status'] = 'warning'
        else:
            self.validation_results['overall_status'] = 'passed'
        
        # Collect issues
        for check in checks:
            if 'issues' in check and check['issues']:
                self.validation_results['issues_found'].extend(check['issues'])
            if 'violations' in check and check['violations']:
                self.validation_results['issues_found'].extend([
                    f"Foreign key violation in {v['table']}" for v in check['violations']
                ])
            if 'inconsistencies' in check and check['inconsistencies']:
                self.validation_results['issues_found'].extend([
                    f"{i['description']}: {i['count']} records" for i in check['inconsistencies']
                ])
        
        # Apply fixes if requested
        if fix_issues and (failed_checks or warning_checks):
            self.logger.info("Attempting to fix detected issues...")
            
            # Fix orphaned records
            self.fix_orphaned_records(dry_run=False)
            
            # Fix NULL mock flags
            self.fix_null_mock_flags(dry_run=False)
        
        self.logger.info(f"Validation complete. Overall status: {self.validation_results['overall_status']}")
        return self.validation_results
    
    def generate_report(self, output_file: Optional[str] = None) -> str:
        """Generate validation report"""
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"data_integrity_report_{timestamp}.json"
        
        with open(output_file, 'w') as f:
            json.dump(self.validation_results, f, indent=2, default=str)
        
        self.logger.info(f"Validation report saved: {output_file}")
        return output_file

def main():
    parser = argparse.ArgumentParser(
        description="Validate data integrity for Digame platform database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--db-path',
        default='../../backend/data/digame.db',
        help='Path to SQLite database file'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    parser.add_argument(
        '--fix-issues',
        action='store_true',
        help='Attempt to fix detected issues automatically'
    )
    
    parser.add_argument(
        '--report-only',
        action='store_true',
        help='Generate report without fixing issues'
    )
    
    parser.add_argument(
        '--output-file',
        help='Output file for validation report'
    )
    
    args = parser.parse_args()
    
    # Validate database path
    if not os.path.exists(args.db_path):
        print(f"Error: Database file not found: {args.db_path}")
        sys.exit(1)
    
    try:
        # Initialize validator
        validator = DataIntegrityValidator(args.db_path, args.verbose)
        
        print(f"{'='*60}")
        print(f"DIGAME PLATFORM - DATA INTEGRITY VALIDATION")
        print(f"{'='*60}")
        print(f"Database: {args.db_path}")
        print(f"Fix Issues: {args.fix_issues and not args.report_only}")
        print(f"{'='*60}")
        
        # Run validation
        results = validator.run_full_validation(
            fix_issues=args.fix_issues and not args.report_only
        )
        
        # Generate report
        report_file = validator.generate_report(args.output_file)
        
        # Print summary
        print(f"\nVALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"Overall Status: {results['overall_status'].upper()}")
        print(f"Checks Performed: {len(results['checks_performed'])}")
        print(f"Issues Found: {len(results['issues_found'])}")
        print(f"Fixes Applied: {len(results['fixes_applied'])}")
        print(f"Report Saved: {report_file}")
        print(f"{'='*60}")
        
        if results['issues_found']:
            print(f"\nISSUES DETECTED:")
            for issue in results['issues_found']:
                print(f"  - {issue}")
        
        if results['fixes_applied']:
            print(f"\nFIXES APPLIED:")
            for fix in results['fixes_applied']:
                print(f"  - {fix['fix_name']}: {fix['records_fixed']} records")
        
        # Set exit code based on results
        if results['overall_status'] in ['error', 'failed']:
            sys.exit(1)
        elif results['overall_status'] == 'warning':
            sys.exit(2)
        else:
            sys.exit(0)
        
    except Exception as e:
        print(f"\nValidation failed: {e}")
        logging.error(f"Validation failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
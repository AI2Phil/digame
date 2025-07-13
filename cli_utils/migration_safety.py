#!/usr/bin/env python3
"""
CLI Migration Safety Utilities

This module provides safe migration utilities for CLI scripts to prevent
the same "relation already exists" and transaction abort issues we resolved
in the migration files.

Based on the comprehensive safety patterns implemented in the migration files.
"""

import subprocess
import time
import sys
import os
from pathlib import Path
from typing import Tuple, Optional, List, Dict, Any
import sqlalchemy as sa
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError, OperationalError


class MigrationSafetyError(Exception):
    """Custom exception for migration safety issues"""
    pass


class SafeMigrationRunner:
    """
    Safe migration runner that implements the same safety patterns
    used in our migration files to prevent conflicts.
    """
    
    def __init__(self, database_url: Optional[str] = None, timeout: int = 600):
        self.database_url = database_url
        self.timeout = timeout
        self.engine: Optional[Any] = None
        
        if database_url:
            try:
                self.engine = create_engine(database_url)
            except Exception as e:
                self.log(f"Warning: Could not create database engine: {e}", "WARNING")
    
    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message with timestamp."""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def run_command(self, cmd: str, cwd: Optional[str] = None) -> Tuple[str, str, int]:
        """Run a shell command with proper error handling."""
        try:
            self.log(f"Executing: {cmd}")
            result = subprocess.run(
                cmd, 
                shell=True, 
                cwd=cwd, 
                capture_output=True, 
                text=True,
                timeout=self.timeout,
                check=True
            )
            if result.stdout:
                self.log(f"Output: {result.stdout.strip()}")
            return result.stdout, result.stderr, 0
        except subprocess.TimeoutExpired:
            self.log(f"Command timed out after {self.timeout} seconds", "ERROR")
            return "", "Command timed out", 1
        except subprocess.CalledProcessError as e:
            self.log(f"Command failed with exit code {e.returncode}", "ERROR")
            if e.stdout:
                self.log(f"Stdout: {e.stdout}", "ERROR")
            if e.stderr:
                self.log(f"Stderr: {e.stderr}", "ERROR")
            return e.stdout, e.stderr, e.returncode
    
    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database."""
        if not self.engine:
            return False
            
        try:
            with self.engine.connect() as connection:
                # Try PostgreSQL first (production)
                try:
                    result = connection.execute(text("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = :table_name
                        );
                    """), {"table_name": table_name})
                    return result.scalar()
                except Exception:
                    # Fallback for SQLite or other databases
                    try:
                        result = connection.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';"))
                        return result.fetchone() is not None
                    except Exception:
                        # Final fallback - try to describe the table
                        try:
                            connection.execute(text(f"SELECT 1 FROM {table_name} LIMIT 1;"))
                            return True
                        except Exception:
                            return False
        except Exception as e:
            self.log(f"Error checking table existence: {e}", "WARNING")
            return False
    
    def check_database_health(self) -> Dict[str, Any]:
        """Check database connectivity and basic health."""
        health_status: Dict[str, Any] = {
            "connected": False,
            "alembic_table_exists": False,
            "current_revision": None,
            "head_revision": None,
            "pending_migrations": False,
            "errors": []
        }
        
        # Test basic connectivity
        try:
            if self.engine:
                with self.engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                    health_status["connected"] = True
                    self.log("✓ Database connection successful")
        except Exception as e:
            health_status["errors"].append(f"Database connection failed: {e}")
            self.log(f"✗ Database connection failed: {e}", "ERROR")
            return health_status
        
        # Check if alembic_version table exists
        health_status["alembic_table_exists"] = self.table_exists("alembic_version")
        
        # Check current migration status
        try:
            stdout, stderr, code = self.run_command("alembic current")
            if code == 0:
                current_revision = stdout.strip()
                health_status["current_revision"] = current_revision if current_revision != "None" else None
                self.log(f"✓ Current revision: {current_revision}")
            else:
                health_status["errors"].append(f"Failed to get current revision: {stderr}")
        except Exception as e:
            health_status["errors"].append(f"Error checking current revision: {e}")
        
        # Check head revision
        try:
            stdout, stderr, code = self.run_command("alembic heads")
            if code == 0:
                head_revision = stdout.strip()
                health_status["head_revision"] = head_revision
                self.log(f"✓ Head revision: {head_revision}")
                
                # Check if there are pending migrations
                if health_status["current_revision"] != head_revision:
                    health_status["pending_migrations"] = True
                    self.log("⚠ Pending migrations detected")
                else:
                    self.log("✓ Database is up to date")
            else:
                health_status["errors"].append(f"Failed to get head revision: {stderr}")
        except Exception as e:
            health_status["errors"].append(f"Error checking head revision: {e}")
        
        return health_status
    
    def safe_alembic_upgrade(self, target: str = "head", config_path: Optional[str] = None, 
                           force: bool = False, dry_run: bool = False) -> bool:
        """
        Safely run alembic upgrade with conflict handling.
        
        Args:
            target: Migration target (default: "head")
            config_path: Path to alembic.ini (optional)
            force: Force upgrade even if there are warnings
            dry_run: Only check what would be done, don't apply
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.log(f"Starting safe alembic upgrade to {target}")
        
        # Build alembic command
        alembic_cmd = "alembic"
        if config_path:
            alembic_cmd += f" -c {config_path}"
        
        # Step 1: Check database health
        health = self.check_database_health()
        if not health["connected"]:
            self.log("Database is not connected - aborting", "ERROR")
            return False
        
        if health["errors"] and not force:
            self.log("Database health check failed - use --force to proceed anyway", "ERROR")
            for error in health["errors"]:
                self.log(f"  - {error}", "ERROR")
            return False
        
        # Step 2: Check if upgrade is needed
        if not health["pending_migrations"] and target == "head":
            self.log("Database is already up to date")
            return True
        
        # Step 3: Dry run mode
        if dry_run:
            self.log("DRY RUN MODE - would upgrade from {} to {}".format(
                health["current_revision"] or "empty", 
                health["head_revision"] or target
            ))
            return True
        
        # Step 4: Pre-upgrade checks
        if not force and health["current_revision"]:
            self.log("Running pre-upgrade checks...")
            stdout, stderr, code = self.run_command(f"{alembic_cmd} check")
            if code != 0 and "Target database is not up to date" not in stderr:
                self.log("Pre-upgrade check failed - there may be conflicts", "WARNING")
                self.log("Use --force to apply migrations anyway", "WARNING")
                return False
        
        # Step 5: Apply migrations with enhanced error handling
        self.log(f"Applying migrations to {target}...")
        stdout, stderr, code = self.run_command(f"{alembic_cmd} upgrade {target}")
        
        if code != 0:
            self.log("Migration failed", "ERROR")
            
            # Check for specific error patterns we've seen
            if "already exists" in stderr.lower():
                self.log("Detected 'already exists' error - this suggests migration conflicts", "ERROR")
                self.log("This should have been prevented by our safety mechanisms", "ERROR")
                self.log("Please check if the migration files have proper safety wrappers", "ERROR")
            
            if "transaction is aborted" in stderr.lower():
                self.log("Detected transaction abort - this suggests a silent failure", "ERROR")
                self.log("Check for constraint violations or permission issues", "ERROR")
            
            return False
        
        # Step 6: Verify migration success
        self.log("Verifying migration success...")
        post_health = self.check_database_health()
        
        if target == "head" and post_health["pending_migrations"]:
            self.log("Migration verification failed - still have pending migrations", "ERROR")
            return False
        
        self.log("✓ Migration completed successfully")
        return True
    
    def safe_alembic_downgrade(self, target: str, config_path: Optional[str] = None, 
                             force: bool = False, dry_run: bool = False) -> bool:
        """
        Safely run alembic downgrade with conflict handling.
        
        Args:
            target: Migration target
            config_path: Path to alembic.ini (optional)
            force: Force downgrade even if there are warnings
            dry_run: Only check what would be done, don't apply
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.log(f"Starting safe alembic downgrade to {target}")
        
        # Build alembic command
        alembic_cmd = "alembic"
        if config_path:
            alembic_cmd += f" -c {config_path}"
        
        # Step 1: Check database health
        health = self.check_database_health()
        if not health["connected"]:
            self.log("Database is not connected - aborting", "ERROR")
            return False
        
        # Step 2: Dry run mode
        if dry_run:
            self.log(f"DRY RUN MODE - would downgrade from {health['current_revision']} to {target}")
            return True
        
        # Step 3: Safety check - don't allow downgrade to base without explicit force
        if target == "base" and not force:
            self.log("Downgrade to base requires --force flag for safety", "ERROR")
            return False
        
        # Step 4: Apply downgrade
        self.log(f"Applying downgrade to {target}...")
        stdout, stderr, code = self.run_command(f"{alembic_cmd} downgrade {target}")
        
        if code != 0:
            self.log("Downgrade failed", "ERROR")
            return False
        
        self.log("✓ Downgrade completed successfully")
        return True


def create_safe_migration_runner(database_url: Optional[str] = None, timeout: int = 600) -> SafeMigrationRunner:
    """Factory function to create a SafeMigrationRunner instance."""
    return SafeMigrationRunner(database_url=database_url, timeout=timeout)


def wait_for_database(max_attempts: int = 30, delay: int = 2, database_url: Optional[str] = None) -> bool:
    """
    Wait for the database to be available.
    
    Args:
        max_attempts: Maximum number of connection attempts
        delay: Delay between attempts in seconds
        database_url: Database URL (optional)
        
    Returns:
        bool: True if database is available, False otherwise
    """
    runner = create_safe_migration_runner(database_url=database_url)
    runner.log("Waiting for database to be available...")
    
    for attempt in range(max_attempts):
        try:
            health = runner.check_database_health()
            if health["connected"]:
                runner.log("Database is available")
                return True
            else:
                runner.log(f"Database not ready (attempt {attempt + 1}/{max_attempts})")
                time.sleep(delay)
        except Exception as e:
            runner.log(f"Database connection attempt failed: {e}")
            time.sleep(delay)
    
    runner.log("Database is not available after maximum attempts", "ERROR")
    return False


def get_database_url_from_env() -> Optional[str]:
    """Get database URL from environment variables."""
    # Try common environment variable names
    env_vars = [
        "DATABASE_URL",
        "SQLALCHEMY_DATABASE_URL", 
        "DB_URL",
        "POSTGRES_URL"
    ]
    
    for var in env_vars:
        url = os.getenv(var)
        if url:
            return url
    
    return None


# CLI-friendly functions for direct use in scripts
def safe_upgrade(target: str = "head", config_path: Optional[str] = None, 
                force: bool = False, dry_run: bool = False) -> bool:
    """CLI-friendly safe upgrade function."""
    database_url = get_database_url_from_env()
    runner = create_safe_migration_runner(database_url=database_url)
    return runner.safe_alembic_upgrade(target=target, config_path=config_path, 
                                     force=force, dry_run=dry_run)


def safe_downgrade(target: str, config_path: Optional[str] = None, 
                  force: bool = False, dry_run: bool = False) -> bool:
    """CLI-friendly safe downgrade function."""
    database_url = get_database_url_from_env()
    runner = create_safe_migration_runner(database_url=database_url)
    return runner.safe_alembic_downgrade(target=target, config_path=config_path, 
                                       force=force, dry_run=dry_run)


def check_migration_health() -> Dict[str, Any]:
    """CLI-friendly health check function."""
    database_url = get_database_url_from_env()
    runner = create_safe_migration_runner(database_url=database_url)
    return runner.check_database_health()
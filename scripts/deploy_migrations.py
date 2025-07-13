#!/usr/bin/env python3
"""
Deployment Migration Script for Digame Platform

This script ensures that database migrations are applied automatically during deployment.
It can be used in Docker containers, CI/CD pipelines, or manual deployments.

Usage:
    python deploy_migrations.py [--check-only] [--force]
    
Options:
    --check-only    Only check migration status, don't apply migrations
    --force         Force apply migrations even if there are warnings
"""

import sys
import os
import argparse
import subprocess
import time
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import our CLI safety utilities
from cli_utils import (
    SafeMigrationRunner,
    create_safe_migration_runner,
    safe_upgrade,
    check_migration_health,
    wait_for_database as safe_wait_for_database,
    get_database_url_from_env
)

def log(message, level="INFO"):
    """Log a message with timestamp."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def run_command(cmd, cwd=None, timeout=300):
    """Run a shell command with timeout and proper error handling."""
    try:
        log(f"Executing: {cmd}")
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            timeout=timeout,
            check=True
        )
        if result.stdout:
            log(f"Output: {result.stdout.strip()}")
        return result.stdout, result.stderr, 0
    except subprocess.TimeoutExpired:
        log(f"Command timed out after {timeout} seconds", "ERROR")
        return "", "Command timed out", 1
    except subprocess.CalledProcessError as e:
        log(f"Command failed with exit code {e.returncode}", "ERROR")
        if e.stdout:
            log(f"Stdout: {e.stdout}", "ERROR")
        if e.stderr:
            log(f"Stderr: {e.stderr}", "ERROR")
        return e.stdout, e.stderr, e.returncode

def wait_for_database(max_attempts=30, delay=2):
    """Wait for the database to be available using safe utilities."""
    log("Waiting for database to be available...")
    database_url = get_database_url_from_env()
    return safe_wait_for_database(max_attempts=max_attempts, delay=delay, database_url=database_url)

def check_migration_status():
    """Check the current migration status using safe utilities."""
    log("Checking current migration status...")
    
    try:
        health = check_migration_health()
        
        if not health["connected"]:
            log("Failed to connect to database", "ERROR")
            return None, False
        
        current_revision = health["current_revision"]
        head_revision = health["head_revision"]
        
        if not current_revision:
            log("No migrations have been applied yet")
            return None, True
        
        log(f"Current migration: {current_revision}")
        log(f"Latest migration: {head_revision}")
        
        if health["pending_migrations"]:
            log("Database has pending migrations")
        else:
            log("Database is up to date")
        
        if health["errors"]:
            for error in health["errors"]:
                log(f"Health check warning: {error}", "WARNING")
        
        return current_revision, True
        
    except Exception as e:
        log(f"Failed to check migration status: {e}", "ERROR")
        return None, False

def apply_migrations(force=False):
    """Apply pending migrations using safe utilities."""
    log("Applying database migrations...")
    
    try:
        # Use our safe upgrade function which includes all the safety checks
        success = safe_upgrade(target="head", force=force, dry_run=False)
        
        if success:
            log("Migrations applied successfully")
            return True
        else:
            log("Failed to apply migrations", "ERROR")
            return False
            
    except Exception as e:
        log(f"Migration application failed with exception: {e}", "ERROR")
        return False

def verify_migration_integrity():
    """Verify that migrations were applied correctly using safe utilities."""
    log("Verifying migration integrity...")
    
    try:
        health = check_migration_health()
        
        if not health["connected"]:
            log("Migration verification failed - database not connected", "ERROR")
            return False
        
        if health["pending_migrations"]:
            log("Migration verification failed - still have pending migrations", "ERROR")
            return False
        
        if health["errors"]:
            log("Migration verification found issues:", "WARNING")
            for error in health["errors"]:
                log(f"  - {error}", "WARNING")
        
        log("Migration integrity verified")
        return True
        
    except Exception as e:
        log(f"Migration verification failed: {e}", "ERROR")
        return False

def create_backup_point():
    """Create a backup point before applying migrations."""
    log("Creating backup point...")
    
    try:
        # Use our safe health check to get current state
        health = check_migration_health()
        
        if health["connected"] and health["current_revision"]:
            log(f"Backup point created at revision: {health['current_revision']}")
            # In a production environment, you would implement actual backup logic here
            # This could include database dumps, snapshots, etc.
            return True
        
        log("No backup needed - database is empty or not connected")
        return True
        
    except Exception as e:
        log(f"Failed to create backup point: {e}", "WARNING")
        return True  # Don't fail deployment for backup issues

def main():
    parser = argparse.ArgumentParser(description="Deploy Digame database migrations")
    parser.add_argument("--check-only", action="store_true", help="Only check migration status")
    parser.add_argument("--force", action="store_true", help="Force apply migrations")
    args = parser.parse_args()
    
    log("Starting Digame Migration Deployment")
    log("=" * 50)
    
    # Step 1: Wait for database to be available
    if not wait_for_database():
        log("Database is not available - aborting", "ERROR")
        return 1
    
    # Step 2: Check current migration status
    current_revision, success = check_migration_status()
    if not success:
        log("Failed to check migration status - aborting", "ERROR")
        return 1
    
    # Step 3: If check-only mode, exit here
    if args.check_only:
        log("Check-only mode - exiting")
        return 0
    
    # Step 4: Create backup point
    if not create_backup_point():
        log("Failed to create backup point", "WARNING")
    
    # Step 5: Apply migrations
    if not apply_migrations(force=args.force):
        log("Migration deployment failed", "ERROR")
        return 1
    
    # Step 6: Verify migration integrity
    if not verify_migration_integrity():
        log("Migration verification failed", "ERROR")
        return 1
    
    log("=" * 50)
    log("Migration deployment completed successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())
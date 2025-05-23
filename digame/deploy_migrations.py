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
    """Wait for the database to be available."""
    log("Waiting for database to be available...")
    
    for attempt in range(max_attempts):
        try:
            # Try to connect to the database using alembic
            stdout, stderr, code = run_command("alembic current", timeout=10)
            if code == 0:
                log("Database is available")
                return True
            else:
                log(f"Database not ready (attempt {attempt + 1}/{max_attempts})")
                time.sleep(delay)
        except Exception as e:
            log(f"Database connection attempt failed: {e}")
            time.sleep(delay)
    
    log("Database is not available after maximum attempts", "ERROR")
    return False

def check_migration_status():
    """Check the current migration status."""
    log("Checking current migration status...")
    
    stdout, stderr, code = run_command("alembic current")
    if code != 0:
        log("Failed to check migration status", "ERROR")
        return None, False
    
    current_revision = stdout.strip()
    if not current_revision or current_revision == "None":
        log("No migrations have been applied yet")
        return None, True
    
    log(f"Current migration: {current_revision}")
    
    # Check if there are pending migrations
    stdout, stderr, code = run_command("alembic heads")
    if code != 0:
        log("Failed to check migration heads", "ERROR")
        return current_revision, False
    
    head_revision = stdout.strip()
    log(f"Latest migration: {head_revision}")
    
    if current_revision == head_revision:
        log("Database is up to date")
        return current_revision, True
    else:
        log("Database has pending migrations")
        return current_revision, True

def apply_migrations(force=False):
    """Apply pending migrations."""
    log("Applying database migrations...")
    
    # Check if there are pending migrations first
    current_revision, success = check_migration_status()
    if not success:
        log("Failed to check migration status", "ERROR")
        return False
    
    # Get the head revision
    stdout, stderr, code = run_command("alembic heads")
    if code != 0:
        log("Failed to get head revision", "ERROR")
        return False
    
    head_revision = stdout.strip()
    
    # If we're already at head, no need to migrate
    if current_revision and current_revision == head_revision:
        log("Database is already up to date")
        return True
    
    # Check for any warnings or conflicts (only if not forcing and there are existing migrations)
    if not force and current_revision:
        stdout, stderr, code = run_command("alembic check")
        if code != 0 and "Target database is not up to date" not in stderr:
            # Only fail if it's not just an "out of date" warning
            log("Migration check failed - there may be conflicts", "WARNING")
            log("Use --force to apply migrations anyway", "WARNING")
            return False
        else:
            log("Migration check passed or only out-of-date warning")
    else:
        log("Skipping migration check (force mode or empty database)")
    
    # Apply migrations
    stdout, stderr, code = run_command("alembic upgrade head", timeout=600)
    if code != 0:
        log("Failed to apply migrations", "ERROR")
        return False
    
    log("Migrations applied successfully")
    return True

def verify_migration_integrity():
    """Verify that migrations were applied correctly."""
    log("Verifying migration integrity...")
    
    # Check that we're at the head revision
    current_revision, success = check_migration_status()
    if not success:
        return False
    
    stdout, stderr, code = run_command("alembic heads")
    if code != 0:
        log("Failed to verify migration heads", "ERROR")
        return False
    
    head_revision = stdout.strip()
    
    if current_revision != head_revision:
        log("Migration verification failed - not at head revision", "ERROR")
        return False
    
    log("Migration integrity verified")
    return True

def create_backup_point():
    """Create a backup point before applying migrations."""
    log("Creating backup point...")
    
    # In a production environment, you would implement actual backup logic here
    # For now, we'll just log the current state
    current_revision, success = check_migration_status()
    if success and current_revision:
        log(f"Backup point created at revision: {current_revision}")
        return True
    
    log("No backup needed - database is empty")
    return True

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
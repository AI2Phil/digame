#!/usr/bin/env python3
"""
Production Backup Script for Digame Platform
Automated backup with retention policy and verification
"""

import os
import sys
import subprocess
import time
import json
import gzip
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
import logging

class ProductionBackup:
    def __init__(self):
        self.backup_dir = Path(os.getenv("BACKUP_DIR", "backups/production"))
        self.retention_days = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
        self.max_backups = int(os.getenv("MAX_BACKUPS", "50"))
        
        # Database settings
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = os.getenv("DB_PORT", "5432")
        self.db_name = os.getenv("DB_NAME", "digame_prod")
        self.db_user = os.getenv("DB_USER", "digame_user")
        self.db_password = os.getenv("DB_PASSWORD", "")
        
        # Backup settings
        self.compress_backups = os.getenv("COMPRESS_BACKUPS", "true").lower() == "true"
        self.verify_backups = os.getenv("VERIFY_BACKUPS", "true").lower() == "true"
        
        # Setup logging
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.backup_dir / 'backup.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def run_command(self, cmd, timeout=3600):
        """Run shell command with logging"""
        self.logger.info(f"Executing: {cmd}")
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=timeout
            )
            if result.returncode == 0:
                self.logger.info("Command succeeded")
                return True, result.stdout
            else:
                self.logger.error(f"Command failed: {result.stderr}")
                return False, result.stderr
        except subprocess.TimeoutExpired:
            self.logger.error(f"Command timed out after {timeout} seconds")
            return False, "Timeout"
        except Exception as e:
            self.logger.error(f"Command error: {e}")
            return False, str(e)
    
    def backup_postgresql(self):
        """Backup PostgreSQL database"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_dir / f"postgresql_{timestamp}.sql"
        
        self.logger.info("Starting PostgreSQL backup...")
        
        # Set password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = self.db_password
        
        # Create pg_dump command
        cmd = f"pg_dump -h {self.db_host} -p {self.db_port} -U {self.db_user} -d {self.db_name} > {backup_file}"
        
        success, output = self.run_command(cmd)
        
        if success:
            # Compress if enabled
            if self.compress_backups:
                compressed_file = f"{backup_file}.gz"
                with open(backup_file, 'rb') as f_in:
                    with gzip.open(compressed_file, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                
                # Remove uncompressed file
                backup_file.unlink()
                backup_file = Path(compressed_file)
            
            # Get file size
            file_size = backup_file.stat().st_size / (1024 * 1024)  # MB
            
            self.logger.info(f"PostgreSQL backup completed: {backup_file} ({file_size:.1f}MB)")
            return True, str(backup_file)
        else:
            self.logger.error(f"PostgreSQL backup failed: {output}")
            return False, output
    
    def backup_sqlite(self):
        """Backup SQLite database"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        
        # Check for SQLite databases
        sqlite_files = [
            "digame.db",
            "backend/data/digame.db"
        ]
        
        backups_created = []
        
        for sqlite_file in sqlite_files:
            if os.path.exists(sqlite_file):
                backup_file = self.backup_dir / f"sqlite_{Path(sqlite_file).stem}_{timestamp}.db"
                
                self.logger.info(f"Backing up SQLite: {sqlite_file}")
                
                try:
                    # Copy SQLite file
                    shutil.copy2(sqlite_file, backup_file)
                    
                    # Compress if enabled
                    if self.compress_backups:
                        compressed_file = f"{backup_file}.gz"
                        with open(backup_file, 'rb') as f_in:
                            with gzip.open(compressed_file, 'wb') as f_out:
                                shutil.copyfileobj(f_in, f_out)
                        
                        backup_file.unlink()
                        backup_file = Path(compressed_file)
                    
                    file_size = backup_file.stat().st_size / (1024 * 1024)  # MB
                    self.logger.info(f"SQLite backup completed: {backup_file} ({file_size:.1f}MB)")
                    backups_created.append(str(backup_file))
                    
                except Exception as e:
                    self.logger.error(f"SQLite backup failed for {sqlite_file}: {e}")
        
        return len(backups_created) > 0, backups_created
    
    def backup_application_files(self):
        """Backup critical application files"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_dir / f"app_files_{timestamp}.tar.gz"
        
        self.logger.info("Backing up application files...")
        
        # Files and directories to backup
        backup_items = [
            "app/",
            "scripts/",
            "docs/",
            "requirements.txt",
            "docker-compose.prod.yml",
            ".env.production",
            "nginx.conf",
            "alembic.ini"
        ]
        
        # Filter existing items
        existing_items = [item for item in backup_items if os.path.exists(item)]
        
        if not existing_items:
            self.logger.warning("No application files found to backup")
            return False, "No files found"
        
        # Create tar command
        items_str = " ".join(existing_items)
        cmd = f"tar -czf {backup_file} {items_str}"
        
        success, output = self.run_command(cmd)
        
        if success:
            file_size = backup_file.stat().st_size / (1024 * 1024)  # MB
            self.logger.info(f"Application files backup completed: {backup_file} ({file_size:.1f}MB)")
            return True, str(backup_file)
        else:
            self.logger.error(f"Application files backup failed: {output}")
            return False, output
    
    def verify_backup(self, backup_file):
        """Verify backup integrity"""
        if not self.verify_backups:
            return True
        
        self.logger.info(f"Verifying backup: {backup_file}")
        
        backup_path = Path(backup_file)
        
        # Check file exists and has size
        if not backup_path.exists():
            self.logger.error(f"Backup file not found: {backup_file}")
            return False
        
        file_size = backup_path.stat().st_size
        if file_size == 0:
            self.logger.error(f"Backup file is empty: {backup_file}")
            return False
        
        # Verify compressed files
        if backup_file.endswith('.gz'):
            try:
                with gzip.open(backup_file, 'rb') as f:
                    # Try to read first 1KB
                    f.read(1024)
                self.logger.info("Compressed backup verification passed")
                return True
            except Exception as e:
                self.logger.error(f"Compressed backup verification failed: {e}")
                return False
        
        # Verify SQL files
        elif backup_file.endswith('.sql'):
            try:
                with open(backup_file, 'r') as f:
                    content = f.read(1024)
                    if 'PostgreSQL database dump' in content or 'CREATE' in content:
                        self.logger.info("SQL backup verification passed")
                        return True
                    else:
                        self.logger.error("SQL backup verification failed: Invalid content")
                        return False
            except Exception as e:
                self.logger.error(f"SQL backup verification failed: {e}")
                return False
        
        # Verify tar files
        elif backup_file.endswith('.tar.gz'):
            cmd = f"tar -tzf {backup_file} > /dev/null"
            success, _ = self.run_command(cmd)
            if success:
                self.logger.info("Tar backup verification passed")
                return True
            else:
                self.logger.error("Tar backup verification failed")
                return False
        
        self.logger.info("Backup verification passed (basic check)")
        return True
    
    def cleanup_old_backups(self):
        """Remove old backups based on retention policy"""
        self.logger.info("Cleaning up old backups...")
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=self.retention_days)
        
        # Get all backup files
        backup_files = []
        for pattern in ["*.sql", "*.sql.gz", "*.db", "*.db.gz", "*.tar.gz"]:
            backup_files.extend(self.backup_dir.glob(pattern))
        
        # Sort by modification time
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        deleted_count = 0
        
        # Remove files older than retention period
        for backup_file in backup_files:
            file_time = datetime.fromtimestamp(backup_file.stat().st_mtime, tz=timezone.utc)
            
            if file_time < cutoff_date:
                try:
                    backup_file.unlink()
                    self.logger.info(f"Deleted old backup: {backup_file}")
                    deleted_count += 1
                except Exception as e:
                    self.logger.error(f"Failed to delete {backup_file}: {e}")
        
        # Also enforce max backup count
        remaining_files = [f for f in backup_files if f.exists()]
        remaining_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        if len(remaining_files) > self.max_backups:
            files_to_delete = remaining_files[self.max_backups:]
            for backup_file in files_to_delete:
                try:
                    backup_file.unlink()
                    self.logger.info(f"Deleted excess backup: {backup_file}")
                    deleted_count += 1
                except Exception as e:
                    self.logger.error(f"Failed to delete {backup_file}: {e}")
        
        self.logger.info(f"Cleanup completed: {deleted_count} files deleted")
        return deleted_count
    
    def create_backup_manifest(self, backups):
        """Create backup manifest with metadata"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        manifest_file = self.backup_dir / f"manifest_{timestamp}.json"
        
        manifest = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "backup_type": "production",
            "retention_days": self.retention_days,
            "backups": []
        }
        
        for backup_file in backups:
            if os.path.exists(backup_file):
                backup_path = Path(backup_file)
                manifest["backups"].append({
                    "file": backup_file,
                    "size_bytes": backup_path.stat().st_size,
                    "size_mb": round(backup_path.stat().st_size / (1024 * 1024), 2),
                    "created": datetime.fromtimestamp(backup_path.stat().st_ctime, tz=timezone.utc).isoformat(),
                    "type": self.get_backup_type(backup_file),
                    "verified": self.verify_backup(backup_file)
                })
        
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        self.logger.info(f"Backup manifest created: {manifest_file}")
        return str(manifest_file)
    
    def get_backup_type(self, backup_file):
        """Determine backup type from filename"""
        if "postgresql" in backup_file:
            return "postgresql"
        elif "sqlite" in backup_file:
            return "sqlite"
        elif "app_files" in backup_file:
            return "application_files"
        else:
            return "unknown"
    
    def run_backup(self):
        """Run complete backup process"""
        self.logger.info("Starting production backup process...")
        
        start_time = datetime.now(timezone.utc)
        backups_created = []
        
        try:
            # Backup PostgreSQL if available
            if self.db_password:
                success, result = self.backup_postgresql()
                if success:
                    backups_created.append(result)
            
            # Backup SQLite databases
            success, results = self.backup_sqlite()
            if success:
                backups_created.extend(results)
            
            # Backup application files
            success, result = self.backup_application_files()
            if success:
                backups_created.append(result)
            
            # Create manifest
            if backups_created:
                manifest_file = self.create_backup_manifest(backups_created)
                backups_created.append(manifest_file)
            
            # Cleanup old backups
            deleted_count = self.cleanup_old_backups()
            
            end_time = datetime.now(timezone.utc)
            duration = (end_time - start_time).total_seconds()
            
            self.logger.info(f"Backup process completed in {duration:.1f} seconds")
            self.logger.info(f"Created {len(backups_created)} backup files")
            self.logger.info(f"Deleted {deleted_count} old backup files")
            
            return True, backups_created
            
        except Exception as e:
            self.logger.error(f"Backup process failed: {e}")
            return False, str(e)

def main():
    """Main backup function"""
    backup = ProductionBackup()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--cleanup-only":
        # Only run cleanup
        print("Running backup cleanup only...")
        deleted_count = backup.cleanup_old_backups()
        print(f"Deleted {deleted_count} old backup files")
        return 0
    
    print("🔄 Starting Digame Platform Production Backup")
    print("=" * 50)
    
    success, result = backup.run_backup()
    
    if success:
        print(f"✅ Backup completed successfully!")
        print(f"Created {len(result)} backup files:")
        for backup_file in result:
            print(f"  - {backup_file}")
        return 0
    else:
        print(f"❌ Backup failed: {result}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
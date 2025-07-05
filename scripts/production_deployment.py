#!/usr/bin/env python3
"""
Production Deployment Script for Digame Platform
Comprehensive production deployment with health checks and rollback capability
"""

import os
import sys
import subprocess
import time
import json
import requests
from datetime import datetime, timezone
from pathlib import Path

class ProductionDeployment:
    def __init__(self):
        self.deployment_id = f"deploy_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        self.log_file = f"deployment_{self.deployment_id}.log"
        self.rollback_data = {}
        
    def log(self, message, level="INFO"):
        """Log deployment messages"""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        log_entry = f"[{timestamp}] {level}: {message}"
        print(log_entry)
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")
    
    def run_command(self, cmd, timeout=300):
        """Run shell command with logging"""
        self.log(f"Executing: {cmd}")
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=timeout
            )
            if result.returncode == 0:
                self.log(f"Command succeeded: {result.stdout.strip()}")
                return True, result.stdout
            else:
                self.log(f"Command failed: {result.stderr.strip()}", "ERROR")
                return False, result.stderr
        except subprocess.TimeoutExpired:
            self.log(f"Command timed out after {timeout} seconds", "ERROR")
            return False, "Timeout"
        except Exception as e:
            self.log(f"Command error: {e}", "ERROR")
            return False, str(e)
    
    def check_prerequisites(self):
        """Check deployment prerequisites"""
        self.log("Checking deployment prerequisites...")
        
        checks = [
            ("Docker", "docker --version"),
            ("Docker Compose", "docker-compose --version"),
            ("Git", "git --version"),
            ("Python", "python3 --version"),
        ]
        
        for name, cmd in checks:
            success, output = self.run_command(cmd)
            if not success:
                self.log(f"Missing prerequisite: {name}", "ERROR")
                return False
            self.log(f"{name}: {output.strip()}")
        
        # Check environment variables
        required_env = ["DB_PASSWORD", "SECRET_KEY", "DOMAIN"]
        missing_env = [var for var in required_env if not os.getenv(var)]
        
        if missing_env:
            self.log(f"Missing environment variables: {missing_env}", "ERROR")
            return False
        
        self.log("All prerequisites satisfied")
        return True
    
    def backup_current_state(self):
        """Create backup of current state"""
        self.log("Creating backup of current state...")
        
        backup_dir = f"backups/pre_deployment_{self.deployment_id}"
        os.makedirs(backup_dir, exist_ok=True)
        
        # Backup database
        if os.path.exists("backend/data/digame.db"):
            success, _ = self.run_command(f"cp backend/data/digame.db {backup_dir}/")
            if not success:
                return False
        
        # Backup configuration files
        config_files = [
            "docker-compose.prod.yml",
            ".env.production",
            "nginx.conf"
        ]
        
        for config_file in config_files:
            if os.path.exists(config_file):
                self.run_command(f"cp {config_file} {backup_dir}/")
        
        self.rollback_data["backup_dir"] = backup_dir
        self.log(f"Backup created in {backup_dir}")
        return True
    
    def deploy_infrastructure(self):
        """Deploy production infrastructure"""
        self.log("Deploying production infrastructure...")
        
        # Pull latest images
        success, _ = self.run_command("docker-compose -f docker-compose.prod.yml pull")
        if not success:
            return False
        
        # Deploy services
        success, _ = self.run_command(
            "docker-compose -f docker-compose.prod.yml up -d --remove-orphans"
        )
        if not success:
            return False
        
        self.log("Infrastructure deployment completed")
        return True
    
    def run_database_migrations(self):
        """Run database migrations"""
        self.log("Running database migrations...")
        
        # Wait for database to be ready
        self.log("Waiting for database to be ready...")
        time.sleep(30)
        
        # Run migrations
        success, _ = self.run_command(
            "docker-compose -f docker-compose.prod.yml exec -T backend python scripts/deploy_migrations.py"
        )
        if not success:
            return False
        
        self.log("Database migrations completed")
        return True
    
    def health_check(self, max_attempts=10, delay=30):
        """Perform comprehensive health checks"""
        self.log("Performing health checks...")
        
        health_endpoints = [
            "http://localhost/health",
            "http://localhost/health/database",
            "http://localhost/health/cache",
            "http://localhost/api/health"
        ]
        
        for attempt in range(max_attempts):
            self.log(f"Health check attempt {attempt + 1}/{max_attempts}")
            
            all_healthy = True
            for endpoint in health_endpoints:
                try:
                    response = requests.get(endpoint, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("status") in ["healthy", "operational"]:
                            self.log(f"✅ {endpoint}: Healthy")
                        else:
                            self.log(f"❌ {endpoint}: Unhealthy - {data}", "WARNING")
                            all_healthy = False
                    else:
                        self.log(f"❌ {endpoint}: HTTP {response.status_code}", "WARNING")
                        all_healthy = False
                except Exception as e:
                    self.log(f"❌ {endpoint}: {e}", "WARNING")
                    all_healthy = False
            
            if all_healthy:
                self.log("All health checks passed")
                return True
            
            if attempt < max_attempts - 1:
                self.log(f"Waiting {delay} seconds before retry...")
                time.sleep(delay)
        
        self.log("Health checks failed after maximum attempts", "ERROR")
        return False
    
    def verify_ssl_certificates(self):
        """Verify SSL certificates are working"""
        self.log("Verifying SSL certificates...")
        
        domain = os.getenv("DOMAIN")
        if not domain:
            self.log("No domain configured, skipping SSL verification")
            return True
        
        try:
            response = requests.get(f"https://{domain}/health", timeout=10, verify=True)
            if response.status_code == 200:
                self.log("SSL certificates verified successfully")
                return True
            else:
                self.log(f"SSL verification failed: HTTP {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"SSL verification error: {e}", "ERROR")
            return False
    
    def performance_test(self):
        """Run basic performance tests"""
        self.log("Running performance tests...")
        
        test_endpoints = [
            "http://localhost/",
            "http://localhost/health",
            "http://localhost/api/health"
        ]
        
        for endpoint in test_endpoints:
            try:
                start_time = time.time()
                response = requests.get(endpoint, timeout=10)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000
                
                if response.status_code == 200 and response_time < 1000:
                    self.log(f"✅ {endpoint}: {response_time:.0f}ms")
                else:
                    self.log(f"⚠️ {endpoint}: {response_time:.0f}ms (slow)", "WARNING")
            except Exception as e:
                self.log(f"❌ {endpoint}: {e}", "ERROR")
        
        self.log("Performance tests completed")
        return True
    
    def rollback_deployment(self):
        """Rollback deployment to previous state"""
        self.log("Rolling back deployment...", "WARNING")
        
        # Stop current services
        self.run_command("docker-compose -f docker-compose.prod.yml down")
        
        # Restore backup if available
        backup_dir = self.rollback_data.get("backup_dir")
        if backup_dir and os.path.exists(backup_dir):
            if os.path.exists(f"{backup_dir}/digame.db"):
                self.run_command(f"cp {backup_dir}/digame.db backend/data/")
            
            for config_file in ["docker-compose.prod.yml", ".env.production", "nginx.conf"]:
                if os.path.exists(f"{backup_dir}/{config_file}"):
                    self.run_command(f"cp {backup_dir}/{config_file} .")
        
        self.log("Rollback completed", "WARNING")
    
    def cleanup_old_deployments(self):
        """Clean up old deployment artifacts"""
        self.log("Cleaning up old deployments...")
        
        # Remove old Docker images
        self.run_command("docker image prune -f")
        
        # Remove old backup files (keep last 5)
        self.run_command("find backups/ -name 'pre_deployment_*' -type d | sort -r | tail -n +6 | xargs rm -rf")
        
        self.log("Cleanup completed")
    
    def deploy(self):
        """Main deployment process"""
        self.log(f"Starting production deployment: {self.deployment_id}")
        
        try:
            # Pre-deployment checks
            if not self.check_prerequisites():
                raise Exception("Prerequisites check failed")
            
            if not self.backup_current_state():
                raise Exception("Backup creation failed")
            
            # Deployment
            if not self.deploy_infrastructure():
                raise Exception("Infrastructure deployment failed")
            
            if not self.run_database_migrations():
                raise Exception("Database migration failed")
            
            # Post-deployment verification
            if not self.health_check():
                raise Exception("Health checks failed")
            
            if not self.verify_ssl_certificates():
                self.log("SSL verification failed, but continuing...", "WARNING")
            
            if not self.performance_test():
                self.log("Performance tests had issues, but continuing...", "WARNING")
            
            # Cleanup
            self.cleanup_old_deployments()
            
            self.log(f"🎉 Deployment {self.deployment_id} completed successfully!")
            self.log("Production system is now live and operational")
            
            return True
            
        except Exception as e:
            self.log(f"Deployment failed: {e}", "ERROR")
            self.log("Initiating rollback...", "ERROR")
            self.rollback_deployment()
            return False

def main():
    """Main deployment function"""
    deployment = ProductionDeployment()
    
    print("🚀 Digame Platform - Production Deployment")
    print("=" * 50)
    
    # Confirmation prompt
    confirm = input("This will deploy to production. Continue? (yes/no): ")
    if confirm.lower() != "yes":
        print("Deployment cancelled.")
        return 1
    
    success = deployment.deploy()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
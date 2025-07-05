#!/usr/bin/env python3
"""
Production Health Monitoring Script for Digame Platform
Continuous monitoring with alerting and automatic recovery
"""

import os
import sys
import time
import json
import requests
import smtplib
from datetime import datetime, timezone
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import logging

class ProductionHealthMonitor:
    def __init__(self):
        self.base_url = os.getenv("MONITOR_BASE_URL", "http://localhost")
        self.alert_email = os.getenv("ALERT_EMAIL", "admin@digame.com")
        self.smtp_server = os.getenv("SMTP_SERVER", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        self.check_interval = int(os.getenv("CHECK_INTERVAL", "60"))  # seconds
        self.alert_threshold = int(os.getenv("ALERT_THRESHOLD", "3"))  # failed checks
        
        self.failed_checks = {}
        self.last_alert_time = {}
        self.alert_cooldown = 300  # 5 minutes
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('production_health.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def check_endpoint(self, endpoint, timeout=10):
        """Check a single endpoint"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = requests.get(url, timeout=timeout)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("status", "unknown")
                
                if status in ["healthy", "operational"]:
                    return True, f"OK - {status}"
                else:
                    return False, f"Unhealthy - {status}"
            else:
                return False, f"HTTP {response.status_code}"
                
        except requests.exceptions.Timeout:
            return False, "Timeout"
        except requests.exceptions.ConnectionError:
            return False, "Connection Error"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def check_database_health(self):
        """Check database health"""
        return self.check_endpoint("/health/database")
    
    def check_api_health(self):
        """Check API health"""
        return self.check_endpoint("/health")
    
    def check_cache_health(self):
        """Check cache health"""
        return self.check_endpoint("/health/cache")
    
    def check_performance_metrics(self):
        """Check performance metrics"""
        success, message = self.check_endpoint("/health/performance")
        
        if success:
            try:
                response = requests.get(f"{self.base_url}/health/performance", timeout=10)
                data = response.json()
                
                # Check response times
                avg_response_time = data.get("average_response_time", 0)
                if avg_response_time > 1000:  # > 1 second
                    return False, f"Slow response time: {avg_response_time}ms"
                
                # Check memory usage
                memory_usage = data.get("memory_usage_percent", 0)
                if memory_usage > 90:
                    return False, f"High memory usage: {memory_usage}%"
                
                return True, "Performance OK"
                
            except Exception as e:
                return False, f"Performance check error: {e}"
        
        return success, message
    
    def check_ssl_certificate(self):
        """Check SSL certificate validity"""
        if not self.base_url.startswith("https://"):
            return True, "HTTP only - SSL not configured"
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10, verify=True)
            if response.status_code == 200:
                return True, "SSL certificate valid"
            else:
                return False, f"SSL check failed: HTTP {response.status_code}"
        except requests.exceptions.SSLError:
            return False, "SSL certificate invalid or expired"
        except Exception as e:
            return False, f"SSL check error: {e}"
    
    def send_alert(self, check_name, status, message):
        """Send alert email"""
        current_time = datetime.now(timezone.utc)
        
        # Check cooldown
        last_alert = self.last_alert_time.get(check_name)
        if last_alert and (current_time - last_alert).seconds < self.alert_cooldown:
            return
        
        try:
            subject = f"🚨 Digame Platform Alert: {check_name} {status}"
            
            body = f"""
Digame Platform Health Alert

Check: {check_name}
Status: {status}
Message: {message}
Time: {current_time.strftime('%Y-%m-%d %H:%M:%S UTC')}

Please investigate immediately.

---
Digame Platform Monitoring System
"""
            
            msg = MimeMultipart()
            msg['From'] = self.smtp_user or "monitor@digame.com"
            msg['To'] = self.alert_email
            msg['Subject'] = subject
            
            msg.attach(MimeText(body, 'plain'))
            
            if self.smtp_user and self.smtp_password:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                server.quit()
                
                self.logger.info(f"Alert sent for {check_name}")
                self.last_alert_time[check_name] = current_time
            else:
                self.logger.warning(f"SMTP not configured - Alert would be sent: {subject}")
                
        except Exception as e:
            self.logger.error(f"Failed to send alert: {e}")
    
    def attempt_recovery(self, check_name):
        """Attempt automatic recovery"""
        self.logger.info(f"Attempting recovery for {check_name}")
        
        recovery_actions = {
            "database": self.recover_database,
            "api": self.recover_api,
            "cache": self.recover_cache,
            "performance": self.recover_performance
        }
        
        recovery_func = recovery_actions.get(check_name)
        if recovery_func:
            try:
                success = recovery_func()
                if success:
                    self.logger.info(f"Recovery successful for {check_name}")
                    return True
                else:
                    self.logger.error(f"Recovery failed for {check_name}")
                    return False
            except Exception as e:
                self.logger.error(f"Recovery error for {check_name}: {e}")
                return False
        
        return False
    
    def recover_database(self):
        """Attempt database recovery"""
        # Restart database container
        os.system("docker-compose -f docker-compose.prod.yml restart db")
        time.sleep(30)
        return True
    
    def recover_api(self):
        """Attempt API recovery"""
        # Restart backend container
        os.system("docker-compose -f docker-compose.prod.yml restart backend")
        time.sleep(30)
        return True
    
    def recover_cache(self):
        """Attempt cache recovery"""
        # Restart Redis container
        os.system("docker-compose -f docker-compose.prod.yml restart redis")
        time.sleep(10)
        return True
    
    def recover_performance(self):
        """Attempt performance recovery"""
        # Clear cache and restart services
        os.system("docker-compose -f docker-compose.prod.yml restart redis backend")
        time.sleep(30)
        return True
    
    def run_health_checks(self):
        """Run all health checks"""
        checks = {
            "database": self.check_database_health,
            "api": self.check_api_health,
            "cache": self.check_cache_health,
            "performance": self.check_performance_metrics,
            "ssl": self.check_ssl_certificate
        }
        
        results = {}
        
        for check_name, check_func in checks.items():
            try:
                success, message = check_func()
                results[check_name] = {"success": success, "message": message}
                
                if success:
                    # Reset failed count on success
                    if check_name in self.failed_checks:
                        self.failed_checks[check_name] = 0
                    self.logger.info(f"✅ {check_name}: {message}")
                else:
                    # Increment failed count
                    self.failed_checks[check_name] = self.failed_checks.get(check_name, 0) + 1
                    self.logger.warning(f"❌ {check_name}: {message}")
                    
                    # Check if we should alert
                    if self.failed_checks[check_name] >= self.alert_threshold:
                        self.send_alert(check_name, "FAILED", message)
                        
                        # Attempt recovery for critical services
                        if check_name in ["database", "api"]:
                            recovery_success = self.attempt_recovery(check_name)
                            if recovery_success:
                                self.failed_checks[check_name] = 0
                
            except Exception as e:
                self.logger.error(f"Check {check_name} failed with exception: {e}")
                results[check_name] = {"success": False, "message": f"Exception: {e}"}
        
        return results
    
    def generate_status_report(self, results):
        """Generate status report"""
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        
        healthy_count = sum(1 for r in results.values() if r["success"])
        total_count = len(results)
        
        status = "HEALTHY" if healthy_count == total_count else "DEGRADED" if healthy_count > 0 else "CRITICAL"
        
        report = {
            "timestamp": timestamp,
            "overall_status": status,
            "healthy_services": healthy_count,
            "total_services": total_count,
            "checks": results
        }
        
        # Save to file
        with open("health_status.json", "w") as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def monitor_continuously(self):
        """Run continuous monitoring"""
        self.logger.info("Starting continuous health monitoring...")
        self.logger.info(f"Check interval: {self.check_interval} seconds")
        self.logger.info(f"Alert threshold: {self.alert_threshold} failed checks")
        
        try:
            while True:
                self.logger.info("Running health checks...")
                
                results = self.run_health_checks()
                report = self.generate_status_report(results)
                
                self.logger.info(f"Overall status: {report['overall_status']} "
                               f"({report['healthy_services']}/{report['total_services']} healthy)")
                
                time.sleep(self.check_interval)
                
        except KeyboardInterrupt:
            self.logger.info("Monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Monitoring error: {e}")
            raise

def main():
    """Main monitoring function"""
    monitor = ProductionHealthMonitor()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Run checks once
        print("Running health checks once...")
        results = monitor.run_health_checks()
        report = monitor.generate_status_report(results)
        
        print(f"\nOverall Status: {report['overall_status']}")
        print(f"Healthy Services: {report['healthy_services']}/{report['total_services']}")
        
        for check_name, result in results.items():
            status = "✅" if result["success"] else "❌"
            print(f"{status} {check_name}: {result['message']}")
        
        return 0 if report['overall_status'] == 'HEALTHY' else 1
    else:
        # Run continuous monitoring
        monitor.monitor_continuously()
        return 0

if __name__ == "__main__":
    sys.exit(main())
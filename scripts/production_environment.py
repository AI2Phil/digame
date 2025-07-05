#!/usr/bin/env python3
"""
Production Environment Configuration and Setup for Digame Platform
Handles environment validation, configuration, and initialization
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone
import logging

class ProductionEnvironment:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.env_file = self.project_root / ".env.production"
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Required environment variables
        self.required_vars = {
            "DATABASE_URL": "PostgreSQL connection string",
            "SECRET_KEY": "Application secret key",
            "JWT_SECRET_KEY": "JWT signing key",
            "REDIS_URL": "Redis connection string",
            "SMTP_SERVER": "Email server configuration",
            "DOMAIN_NAME": "Production domain name",
            "SSL_CERT_PATH": "SSL certificate path",
            "SSL_KEY_PATH": "SSL private key path"
        }
        
        # Optional environment variables with defaults
        self.optional_vars = {
            "DEBUG": "false",
            "LOG_LEVEL": "INFO",
            "MAX_WORKERS": "4",
            "BACKUP_RETENTION_DAYS": "30",
            "SESSION_TIMEOUT": "3600",
            "RATE_LIMIT_PER_MINUTE": "60",
            "CORS_ORIGINS": "*",
            "TIMEZONE": "UTC"
        }
    
    def validate_environment(self):
        """Validate production environment configuration"""
        self.logger.info("Validating production environment...")
        
        errors = []
        warnings = []
        
        # Check required variables
        for var, description in self.required_vars.items():
            value = os.getenv(var)
            if not value:
                errors.append(f"Missing required environment variable: {var} ({description})")
            else:
                # Validate specific variables
                if var == "DATABASE_URL" and not self.validate_database_url(value):
                    errors.append(f"Invalid DATABASE_URL format: {var}")
                elif var == "REDIS_URL" and not self.validate_redis_url(value):
                    errors.append(f"Invalid REDIS_URL format: {var}")
                elif var in ["SECRET_KEY", "JWT_SECRET_KEY"] and len(value) < 32:
                    warnings.append(f"Security warning: {var} should be at least 32 characters")
        
        # Check optional variables and set defaults
        for var, default in self.optional_vars.items():
            if not os.getenv(var):
                os.environ[var] = default
                self.logger.info(f"Set default value for {var}: {default}")
        
        # Validate file paths
        ssl_cert = os.getenv("SSL_CERT_PATH")
        ssl_key = os.getenv("SSL_KEY_PATH")
        
        if ssl_cert and not Path(ssl_cert).exists():
            errors.append(f"SSL certificate file not found: {ssl_cert}")
        
        if ssl_key and not Path(ssl_key).exists():
            errors.append(f"SSL private key file not found: {ssl_key}")
        
        # Check system requirements
        system_errors = self.check_system_requirements()
        errors.extend(system_errors)
        
        # Report results
        if errors:
            self.logger.error("Environment validation failed:")
            for error in errors:
                self.logger.error(f"  ❌ {error}")
            return False, errors
        
        if warnings:
            self.logger.warning("Environment validation warnings:")
            for warning in warnings:
                self.logger.warning(f"  ⚠️  {warning}")
        
        self.logger.info("✅ Environment validation passed")
        return True, []
    
    def validate_database_url(self, url):
        """Validate database URL format"""
        return url.startswith(("postgresql://", "postgres://", "sqlite:///"))
    
    def validate_redis_url(self, url):
        """Validate Redis URL format"""
        return url.startswith("redis://") or url.startswith("rediss://")
    
    def check_system_requirements(self):
        """Check system requirements for production"""
        errors = []
        
        # Check Python version
        if sys.version_info < (3, 8):
            errors.append("Python 3.8 or higher is required for production")
        
        # Check available disk space
        try:
            disk_usage = subprocess.run(
                ["df", "-h", "."], capture_output=True, text=True
            )
            if disk_usage.returncode == 0:
                lines = disk_usage.stdout.strip().split('\n')
                if len(lines) > 1:
                    usage_line = lines[1].split()
                    if len(usage_line) >= 5:
                        usage_percent = usage_line[4].rstrip('%')
                        if int(usage_percent) > 90:
                            errors.append(f"Disk usage is {usage_percent}% - consider freeing space")
        except Exception:
            pass  # Skip disk check if df command fails
        
        # Check memory
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
                for line in meminfo.split('\n'):
                    if line.startswith('MemAvailable:'):
                        mem_kb = int(line.split()[1])
                        mem_gb = mem_kb / 1024 / 1024
                        if mem_gb < 1:
                            errors.append(f"Low available memory: {mem_gb:.1f}GB (recommend 2GB+)")
                        break
        except Exception:
            pass  # Skip memory check if /proc/meminfo not available
        
        return errors
    
    def create_production_config(self):
        """Create production configuration files"""
        self.logger.info("Creating production configuration files...")
        
        # Create nginx configuration
        nginx_config = self.create_nginx_config()
        nginx_path = self.project_root / "nginx.prod.conf"
        with open(nginx_path, 'w') as f:
            f.write(nginx_config)
        self.logger.info(f"Created nginx configuration: {nginx_path}")
        
        # Create systemd service file
        systemd_config = self.create_systemd_config()
        systemd_path = self.project_root / "digame.service"
        with open(systemd_path, 'w') as f:
            f.write(systemd_config)
        self.logger.info(f"Created systemd service: {systemd_path}")
        
        # Create Docker Compose production file
        docker_config = self.create_docker_compose_config()
        docker_path = self.project_root / "docker-compose.prod.yml"
        with open(docker_path, 'w') as f:
            f.write(docker_config)
        self.logger.info(f"Created Docker Compose config: {docker_path}")
        
        # Create environment template
        env_template = self.create_env_template()
        env_template_path = self.project_root / ".env.production.template"
        with open(env_template_path, 'w') as f:
            f.write(env_template)
        self.logger.info(f"Created environment template: {env_template_path}")
    
    def create_nginx_config(self):
        """Create nginx configuration for production"""
        domain = os.getenv("DOMAIN_NAME", "digame.example.com")
        ssl_cert = os.getenv("SSL_CERT_PATH", "/etc/ssl/certs/digame.crt")
        ssl_key = os.getenv("SSL_KEY_PATH", "/etc/ssl/private/digame.key")
        
        return f"""# Nginx configuration for Digame Platform Production
server {{
    listen 80;
    server_name {domain};
    return 301 https://$server_name$request_uri;
}}

server {{
    listen 443 ssl http2;
    server_name {domain};
    
    # SSL Configuration
    ssl_certificate {ssl_cert};
    ssl_certificate_key {ssl_key};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Main Application
    location / {{
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }}
    
    # API Rate Limiting
    location /api/ {{
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
    
    # Login Rate Limiting
    location /auth/login {{
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
    
    # Static Files
    location /static/ {{
        alias /var/www/digame/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}
    
    # Health Check
    location /health {{
        access_log off;
        proxy_pass http://127.0.0.1:8000;
    }}
}}"""
    
    def create_systemd_config(self):
        """Create systemd service configuration"""
        user = os.getenv("USER", "digame")
        project_path = str(self.project_root)
        
        return f"""[Unit]
Description=Digame Platform Production Server
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=exec
User={user}
Group={user}
WorkingDirectory={project_path}
Environment=PATH={project_path}/venv/bin
ExecStart={project_path}/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=digame

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths={project_path}

# Resource Limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target"""
    
    def create_docker_compose_config(self):
        """Create Docker Compose production configuration"""
        return """version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=${DB_NAME:-digame}
      - POSTGRES_USER=${DB_USER:-digame}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-digame}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf
      - ${SSL_CERT_PATH}:/etc/ssl/certs/digame.crt
      - ${SSL_KEY_PATH}:/etc/ssl/private/digame.key
      - ./static:/var/www/digame/static
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:"""
    
    def create_env_template(self):
        """Create environment template file"""
        template = "# Digame Platform Production Environment Configuration\n"
        template += f"# Generated on {datetime.now(timezone.utc).isoformat()}\n\n"
        
        template += "# Required Variables\n"
        for var, description in self.required_vars.items():
            template += f"{var}=  # {description}\n"
        
        template += "\n# Optional Variables (with defaults)\n"
        for var, default in self.optional_vars.items():
            template += f"{var}={default}  # Default value\n"
        
        template += "\n# Additional Production Settings\n"
        template += "ENVIRONMENT=production\n"
        template += "PYTHONPATH=/app\n"
        template += "TZ=UTC\n"
        
        return template
    
    def setup_logging(self):
        """Setup production logging configuration"""
        logs_dir = self.project_root / "logs"
        logs_dir.mkdir(exist_ok=True)
        
        logging_config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "detailed": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
                },
                "simple": {
                    "format": "%(levelname)s - %(message)s"
                }
            },
            "handlers": {
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": str(logs_dir / "digame.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "formatter": "detailed"
                },
                "error_file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": str(logs_dir / "error.log"),
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "formatter": "detailed",
                    "level": "ERROR"
                },
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "simple"
                }
            },
            "loggers": {
                "": {
                    "handlers": ["file", "error_file", "console"],
                    "level": os.getenv("LOG_LEVEL", "INFO"),
                    "propagate": False
                }
            }
        }
        
        config_path = self.project_root / "logging.prod.json"
        with open(config_path, 'w') as f:
            json.dump(logging_config, f, indent=2)
        
        self.logger.info(f"Created logging configuration: {config_path}")
        return str(config_path)

def main():
    """Main environment setup function"""
    env = ProductionEnvironment()
    
    print("🔧 Digame Platform Production Environment Setup")
    print("=" * 50)
    
    # Validate environment
    valid, errors = env.validate_environment()
    
    if not valid:
        print("❌ Environment validation failed:")
        for error in errors:
            print(f"  • {error}")
        print("\nPlease fix the above issues before proceeding.")
        return 1
    
    # Create configuration files
    try:
        env.create_production_config()
        env.setup_logging()
        
        print("✅ Production environment setup completed successfully!")
        print("\nNext steps:")
        print("1. Review and customize the generated configuration files")
        print("2. Set up SSL certificates")
        print("3. Configure your production environment variables")
        print("4. Run the deployment script")
        
        return 0
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
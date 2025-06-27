#!/bin/bash

# Digame Platform Production Deployment Script
# Version: 1.0.0
# Date: June 26, 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV=${1:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs backups nginx/ssl monitoring/grafana/{dashboards,datasources}
    success "Directories created"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required environment variables are set
    if [[ -z "$DB_PASSWORD" ]]; then
        error "DB_PASSWORD environment variable is not set"
    fi
    
    if [[ -z "$SECRET_KEY" ]]; then
        error "SECRET_KEY environment variable is not set"
    fi
    
    if [[ -z "$JWT_SECRET_KEY" ]]; then
        error "JWT_SECRET_KEY environment variable is not set"
    fi
    
    success "Prerequisites check passed"
}

# Backup existing data
backup_data() {
    log "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if container exists
    if docker ps -a --format 'table {{.Names}}' | grep -q digame-db; then
        log "Backing up database..."
        docker exec digame-db pg_dump -U digame_user digame_prod | gzip > "$BACKUP_DIR/database.sql.gz"
        success "Database backup created"
    fi
    
    # Backup configuration files
    if [[ -f ".env.production" ]]; then
        cp .env.production "$BACKUP_DIR/"
    fi
    
    # Backup SSL certificates
    if [[ -d "nginx/ssl" ]]; then
        cp -r nginx/ssl "$BACKUP_DIR/"
    fi
    
    success "Backup completed: $BACKUP_DIR"
}

# Build and test images
build_images() {
    log "Building Docker images..."
    
    # Build frontend
    log "Building frontend image..."
    docker build -f frontend/Dockerfile.prod -t digame-frontend:latest ./frontend
    
    # Build backend (assuming Dockerfile.prod exists in root)
    if [[ -f "Dockerfile.prod" ]]; then
        log "Building backend image..."
        docker build -f Dockerfile.prod -t digame-backend:latest .
    fi
    
    success "Docker images built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Frontend tests
    if [[ -d "frontend" ]]; then
        log "Running frontend tests..."
        cd frontend
        npm test -- --watchAll=false --coverage
        cd ..
        success "Frontend tests passed"
    fi
    
    # Backend tests (if pytest is available)
    if [[ -f "requirements.txt" ]] && command -v python &> /dev/null; then
        log "Running backend tests..."
        python -m pytest --cov=app tests/
        success "Backend tests passed"
    fi
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Stop existing services
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "Stopping existing services..."
        docker-compose -f docker-compose.prod.yml down
    fi
    
    # Start new services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Services deployed"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if curl -f http://localhost:8000/health &> /dev/null; then
            success "Backend is healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Services failed to become healthy within timeout"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Check frontend health
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Frontend is healthy"
    else
        warning "Frontend health check failed, but continuing..."
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (adjust command based on your migration system)
    if docker exec digame-backend alembic upgrade head &> /dev/null; then
        success "Database migrations completed"
    else
        warning "Migration command not found or failed"
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if all containers are running
    local containers=("digame-frontend" "digame-backend" "digame-db" "digame-redis" "digame-nginx")
    
    for container in "${containers[@]}"; do
        if docker ps --format 'table {{.Names}}' | grep -q "$container"; then
            success "$container is running"
        else
            error "$container is not running"
        fi
    done
    
    # Check service endpoints
    local endpoints=(
        "http://localhost:8000/health:Backend API"
        "http://localhost:3000:Frontend"
        "http://localhost:80/health:Nginx"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint name <<< "$endpoint_info"
        if curl -f "$endpoint" &> /dev/null; then
            success "$name endpoint is accessible"
        else
            warning "$name endpoint is not accessible"
        fi
    done
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'digame-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'digame-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['db:5432']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
    
    # Create Grafana datasource configuration
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    success "Monitoring configuration created"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    log "Generating SSL certificates..."
    
    mkdir -p nginx/ssl
    
    # Generate self-signed certificates for development
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/app.digame.com.key \
        -out nginx/ssl/app.digame.com.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=app.digame.com"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/api.digame.com.key \
        -out nginx/ssl/api.digame.com.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=api.digame.com"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/default.key \
        -out nginx/ssl/default.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    success "SSL certificates generated"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove old images
    docker image prune -f
    
    # Remove old volumes (be careful with this in production)
    if [[ "$DEPLOYMENT_ENV" != "production" ]]; then
        docker volume prune -f
    fi
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Digame Platform deployment..."
    log "Environment: $DEPLOYMENT_ENV"
    
    create_directories
    check_prerequisites
    
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        backup_data
    fi
    
    generate_ssl_certificates
    setup_monitoring
    build_images
    
    if [[ "$DEPLOYMENT_ENV" != "production" ]]; then
        run_tests
    fi
    
    deploy_services
    run_migrations
    wait_for_health
    verify_deployment
    
    if [[ "$DEPLOYMENT_ENV" != "production" ]]; then
        cleanup
    fi
    
    success "Deployment completed successfully!"
    log "Access the application at:"
    log "  Frontend: http://localhost:3000"
    log "  Backend API: http://localhost:8000"
    log "  API Docs: http://localhost:8000/docs"
    log "  Grafana: http://localhost:3001"
    log "  Prometheus: http://localhost:9090"
    log ""
    log "Logs are available at: $LOG_FILE"
    log "Backup created at: $BACKUP_DIR"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
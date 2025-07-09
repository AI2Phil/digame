#!/bin/bash

# Digame Platform - Environment Deployment Script
# Comprehensive deployment automation for staging and production environments

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_ROOT/logs/deployment_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Help function
show_help() {
    cat << EOF
Digame Platform Deployment Script

Usage: $0 [OPTIONS] ENVIRONMENT

ENVIRONMENT:
    staging     Deploy to staging environment
    production  Deploy to production environment

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose output
    -d, --dry-run          Show what would be done without executing
    -f, --force            Force deployment without confirmation
    -b, --backup           Create backup before deployment
    -r, --rollback         Rollback to previous version
    -t, --test             Run tests after deployment
    -m, --migrate          Run database migrations
    -s, --seed             Seed database with initial data

Examples:
    $0 staging                          # Deploy to staging
    $0 production --backup --test       # Deploy to production with backup and tests
    $0 staging --dry-run               # Show staging deployment plan
    $0 production --rollback           # Rollback production deployment

EOF
}

# Parse command line arguments
ENVIRONMENT=""
VERBOSE=false
DRY_RUN=false
FORCE=false
BACKUP=false
ROLLBACK=false
RUN_TESTS=false
MIGRATE=false
SEED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -b|--backup)
            BACKUP=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -t|--test)
            RUN_TESTS=true
            shift
            ;;
        -m|--migrate)
            MIGRATE=true
            shift
            ;;
        -s|--seed)
            SEED=true
            shift
            ;;
        staging|production)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    error "Environment must be specified (staging or production)"
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    error "Environment must be 'staging' or 'production'"
fi

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Start deployment
log "🚀 Starting Digame Platform deployment to $ENVIRONMENT"
log "📁 Project root: $PROJECT_ROOT"
log "📝 Log file: $LOG_FILE"

# Pre-deployment checks
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
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
    
    # Check if environment file exists
    ENV_FILE="$PROJECT_ROOT/environments/${ENVIRONMENT}.env"
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
    fi
    
    # Check if production environment file exists
    PROD_ENV_FILE="$PROJECT_ROOT/.env.production"
    if [[ "$ENVIRONMENT" == "production" && ! -f "$PROD_ENV_FILE" ]]; then
        error "Production environment file not found: $PROD_ENV_FILE"
    fi
    
    success "Prerequisites check passed"
}

# Environment setup
setup_environment() {
    log "⚙️  Setting up $ENVIRONMENT environment..."
    
    # Copy environment file
    ENV_FILE="$PROJECT_ROOT/environments/${ENVIRONMENT}.env"
    TARGET_ENV="$PROJECT_ROOT/.env"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would copy $ENV_FILE to $TARGET_ENV"
    else
        cp "$ENV_FILE" "$TARGET_ENV"
        log "Environment file copied: $ENV_FILE -> $TARGET_ENV"
    fi
    
    # Validate environment variables
    log "🔍 Validating environment variables..."
    
    # Check for CHANGE_ME_ values
    if grep -q "CHANGE_ME_" "$ENV_FILE"; then
        warning "Environment file contains CHANGE_ME_ placeholders"
        if [[ "$ENVIRONMENT" == "production" && "$FORCE" != "true" ]]; then
            error "Production deployment requires all CHANGE_ME_ values to be updated"
        fi
    fi
    
    success "Environment setup completed"
}

# Backup function
create_backup() {
    if [[ "$BACKUP" != "true" ]]; then
        return 0
    fi
    
    log "💾 Creating backup..."
    
    BACKUP_DIR="$PROJECT_ROOT/backups/${ENVIRONMENT}_${TIMESTAMP}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would create backup in $BACKUP_DIR"
        return 0
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        log "Backing up database..."
        docker-compose exec -T postgres pg_dump -U digame_user digame_prod > "$BACKUP_DIR/database_backup.sql"
    fi
    
    # Backup configuration files
    cp -r "$PROJECT_ROOT"/{.env*,docker-compose*.yml} "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup uploaded files
    if [[ -d "$PROJECT_ROOT/uploads" ]]; then
        cp -r "$PROJECT_ROOT/uploads" "$BACKUP_DIR/"
    fi
    
    success "Backup created: $BACKUP_DIR"
}

# Database migration
run_migrations() {
    if [[ "$MIGRATE" != "true" ]]; then
        return 0
    fi
    
    log "🗄️  Running database migrations..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would run database migrations"
        return 0
    fi
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    docker-compose exec backend python -c "
import time
import psycopg2
import os

for i in range(30):
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.close()
        print('Database is ready')
        break
    except:
        print(f'Waiting for database... ({i+1}/30)')
        time.sleep(2)
else:
    raise Exception('Database not ready after 60 seconds')
"
    
    # Run migrations
    docker-compose exec backend python -m alembic upgrade head
    
    success "Database migrations completed"
}

# Database seeding
seed_database() {
    if [[ "$SEED" != "true" ]]; then
        return 0
    fi
    
    log "🌱 Seeding database..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would seed database"
        return 0
    fi
    
    # Run seeding script
    docker-compose exec backend python -m app.seeds.seed_all
    
    success "Database seeding completed"
}

# Deploy application
deploy_application() {
    log "🚀 Deploying application..."
    
    COMPOSE_FILE="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        COMPOSE_FILE="docker-compose.production.yml"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would run: docker-compose -f $COMPOSE_FILE up -d"
        return 0
    fi
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "unhealthy\|Exit"; then
        error "Some services are not healthy"
    fi
    
    success "Application deployment completed"
}

# Run tests
run_tests() {
    if [[ "$RUN_TESTS" != "true" ]]; then
        return 0
    fi
    
    log "🧪 Running tests..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would run tests"
        return 0
    fi
    
    # Run API tests
    log "Running API tests..."
    cd "$PROJECT_ROOT/tests/api"
    python run_tests.py
    
    # Run frontend integration tests
    log "Running frontend integration tests..."
    cd "$PROJECT_ROOT/tests/frontend"
    npm test
    
    # Run security validation
    log "Running security validation..."
    cd "$PROJECT_ROOT/security"
    python security-validation-framework.py
    
    success "All tests passed"
}

# Rollback function
rollback_deployment() {
    if [[ "$ROLLBACK" != "true" ]]; then
        return 0
    fi
    
    log "🔄 Rolling back deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would rollback deployment"
        return 0
    fi
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$PROJECT_ROOT/backups" | head -n1)
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for rollback"
    fi
    
    BACKUP_DIR="$PROJECT_ROOT/backups/$LATEST_BACKUP"
    log "Rolling back to: $BACKUP_DIR"
    
    # Stop current services
    docker-compose down
    
    # Restore configuration
    cp "$BACKUP_DIR"/.env* "$PROJECT_ROOT/"
    
    # Restore database
    if [[ -f "$BACKUP_DIR/database_backup.sql" ]]; then
        docker-compose up -d postgres
        sleep 10
        docker-compose exec -T postgres psql -U digame_user -d digame_prod < "$BACKUP_DIR/database_backup.sql"
    fi
    
    # Restart services
    docker-compose up -d
    
    success "Rollback completed"
}

# Post-deployment validation
validate_deployment() {
    log "✅ Validating deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would validate deployment"
        return 0
    fi
    
    # Check service health
    log "Checking service health..."
    
    # Wait for services to stabilize
    sleep 15
    
    # Check backend health
    if ! curl -f http://localhost:8001/health &> /dev/null; then
        warning "Backend health check failed"
    else
        success "Backend is healthy"
    fi
    
    # Check frontend health
    if ! curl -f http://localhost:3000/health &> /dev/null; then
        warning "Frontend health check failed"
    else
        success "Frontend is healthy"
    fi
    
    # Check database connectivity
    if docker-compose exec backend python -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.close()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
" &> /dev/null; then
        success "Database is accessible"
    else
        warning "Database connectivity check failed"
    fi
    
    success "Deployment validation completed"
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would clean up temporary files"
        return 0
    fi
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove old logs (keep last 30 days)
    find "$PROJECT_ROOT/logs" -name "deployment_*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Remove old backups (keep last 10)
    if [[ -d "$PROJECT_ROOT/backups" ]]; then
        ls -t "$PROJECT_ROOT/backups" | tail -n +11 | xargs -r rm -rf
    fi
    
    success "Cleanup completed"
}

# Confirmation prompt
confirm_deployment() {
    if [[ "$FORCE" == "true" || "$DRY_RUN" == "true" ]]; then
        return 0
    fi
    
    echo
    echo -e "${YELLOW}⚠️  You are about to deploy to ${ENVIRONMENT} environment${NC}"
    echo -e "${YELLOW}   This will update the running application${NC}"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
}

# Main deployment flow
main() {
    log "🎯 Deployment configuration:"
    log "   Environment: $ENVIRONMENT"
    log "   Dry run: $DRY_RUN"
    log "   Force: $FORCE"
    log "   Backup: $BACKUP"
    log "   Rollback: $ROLLBACK"
    log "   Run tests: $RUN_TESTS"
    log "   Migrate: $MIGRATE"
    log "   Seed: $SEED"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Execute deployment steps
    check_prerequisites
    
    if [[ "$ROLLBACK" == "true" ]]; then
        rollback_deployment
    else
        confirm_deployment
        setup_environment
        create_backup
        deploy_application
        run_migrations
        seed_database
        validate_deployment
        run_tests
    fi
    
    cleanup
    
    success "🎉 Deployment to $ENVIRONMENT completed successfully!"
    log "📊 Deployment summary:"
    log "   Started: $(date -d @$(($(date +%s) - SECONDS)) +'%Y-%m-%d %H:%M:%S')"
    log "   Completed: $(date +'%Y-%m-%d %H:%M:%S')"
    log "   Duration: ${SECONDS}s"
    log "   Log file: $LOG_FILE"
}

# Trap errors and cleanup
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"
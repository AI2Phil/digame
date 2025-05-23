#!/bin/bash
set -e

# Digame Application Entrypoint Script
# This script handles database migrations and application startup

echo "🚀 Starting Digame Application"
echo "================================"

# Function to log messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to wait for database
wait_for_db() {
    log "⏳ Waiting for database to be ready..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if python3 -c "
import sys
sys.path.insert(0, '/app')
from digame.app.db import engine
try:
    engine.connect()
    print('Database connection successful')
    sys.exit(0)
except Exception as e:
    print(f'Database connection failed: {e}')
    sys.exit(1)
" 2>/dev/null; then
            log "✅ Database is ready"
            return 0
        fi
        
        log "⏳ Database not ready (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "❌ Database is not available after $max_attempts attempts"
    return 1
}

# Function to run migrations
run_migrations() {
    log "🔄 Running database migrations..."
    
    cd /app/digame
    
    # Check if migrations need to be applied
    if python3 deploy_migrations.py --check-only; then
        log "📊 Checking for pending migrations..."
        
        # Apply migrations
        if python3 deploy_migrations.py; then
            log "✅ Migrations completed successfully"
        else
            log "❌ Migration failed"
            return 1
        fi
    else
        log "❌ Migration check failed"
        return 1
    fi
}

# Function to start the application
start_application() {
    log "🌟 Starting Digame API server..."
    
    cd /app
    
    # Start the FastAPI application
    exec uvicorn digame.app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 1 \
        --log-level info \
        --access-log \
        --reload
}

# Main execution flow
main() {
    # Parse command line arguments
    case "${1:-}" in
        "migrate-only")
            log "🔄 Running migrations only..."
            wait_for_db
            run_migrations
            log "✅ Migration-only mode completed"
            ;;
        "dev")
            log "🛠️ Starting in development mode..."
            wait_for_db
            run_migrations
            start_application
            ;;
        "prod")
            log "🏭 Starting in production mode..."
            wait_for_db
            run_migrations
            start_application
            ;;
        "sleep")
            log "😴 Starting in sleep mode for development..."
            exec sleep infinity
            ;;
        *)
            log "🔧 Starting with default configuration..."
            wait_for_db
            run_migrations
            start_application
            ;;
    esac
}

# Handle signals gracefully
trap 'log "🛑 Received shutdown signal"; exit 0' SIGTERM SIGINT

# Run main function
main "$@"
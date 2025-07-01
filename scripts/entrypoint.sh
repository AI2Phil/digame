#!/bin/bash
set -e

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    while ! nc -z db 5432; do
        sleep 1
    done
    echo "Database is ready!"
}

# Function to run migrations
run_migrations() {
    echo "Skipping database migrations for now..."
    # cd /app/digame
    # python -m alembic upgrade head || echo "Migration failed, continuing..."
}

# Function to start development server
start_dev() {
    echo "Starting development server..."
    cd /app/digame
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

# Function to start production server
start_prod() {
    echo "Starting production server..."
    cd /app/digame
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
}

# Main execution logic
case "$1" in
    "dev")
        wait_for_db
        run_migrations
        start_dev
        ;;
    "prod")
        wait_for_db
        run_migrations
        start_prod
        ;;
    "migrate")
        wait_for_db
        run_migrations
        ;;
    "sleep")
        echo "Container is running in sleep mode for development..."
        sleep infinity
        ;;
    *)
        echo "Usage: $0 {dev|prod|migrate|sleep}"
        echo "Running default command: $@"
        exec "$@"
        ;;
esac
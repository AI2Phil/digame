#!/bin/bash

# Health Check Scripts for CI/CD Pipeline
# Based on recommendations from CI_CD_PIPELINE_ANALYSIS.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Function to wait for service with timeout
wait_for_service() {
    local url=$1
    local timeout=${2:-60}
    local service_name=$3
    
    print_status "INFO" "Waiting for $service_name at $url (timeout: ${timeout}s)"
    
    local count=0
    while [ $count -lt $timeout ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_status "SUCCESS" "$service_name is ready"
            return 0
        fi
        sleep 2
        count=$((count + 2))
    done
    
    print_status "ERROR" "$service_name failed to start within ${timeout}s"
    return 1
}

# Function to check database connectivity
check_database() {
    local db_url=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/test_db"}
    
    print_status "INFO" "Checking database connectivity..."
    
    if command -v pg_isready > /dev/null 2>&1; then
        if pg_isready -d "$db_url" > /dev/null 2>&1; then
            print_status "SUCCESS" "PostgreSQL database is ready"
            return 0
        else
            print_status "ERROR" "PostgreSQL database is not ready"
            return 1
        fi
    else
        print_status "WARNING" "pg_isready not available, skipping database check"
        return 0
    fi
}

# Function to check Redis connectivity
check_redis() {
    local redis_host=${REDIS_HOST:-"localhost"}
    local redis_port=${REDIS_PORT:-"6379"}
    
    print_status "INFO" "Checking Redis connectivity..."
    
    if command -v redis-cli > /dev/null 2>&1; then
        if redis-cli -h "$redis_host" -p "$redis_port" ping > /dev/null 2>&1; then
            print_status "SUCCESS" "Redis is ready"
            return 0
        else
            print_status "ERROR" "Redis is not ready"
            return 1
        fi
    else
        print_status "WARNING" "redis-cli not available, skipping Redis check"
        return 0
    fi
}

# Function to check backend API health
check_backend_api() {
    local api_url=${API_BASE_URL:-"http://localhost:8000"}
    
    print_status "INFO" "Checking backend API health..."
    
    # Wait for backend to be ready
    if wait_for_service "$api_url/health" 60 "Backend API"; then
        # Check specific endpoints
        local endpoints=(
            "/health"
            "/api/workflow-automation/health"
            "/advanced-analytics/health"
        )
        
        for endpoint in "${endpoints[@]}"; do
            if curl -f -s "$api_url$endpoint" > /dev/null 2>&1; then
                print_status "SUCCESS" "Backend endpoint $endpoint is healthy"
            else
                print_status "WARNING" "Backend endpoint $endpoint may not be available"
            fi
        done
        return 0
    else
        return 1
    fi
}

# Function to check frontend server
check_frontend() {
    local frontend_url=${BASE_URL:-"http://localhost:3000"}
    
    print_status "INFO" "Checking frontend server..."
    
    if wait_for_service "$frontend_url" 60 "Frontend server"; then
        # Check if frontend serves content
        local response=$(curl -s "$frontend_url" | head -c 100)
        if [[ -n "$response" ]]; then
            print_status "SUCCESS" "Frontend is serving content"
            return 0
        else
            print_status "ERROR" "Frontend is not serving content"
            return 1
        fi
    else
        return 1
    fi
}

# Function to run comprehensive health check
run_health_check() {
    print_status "INFO" "Starting comprehensive health check..."
    
    local failed_checks=0
    
    # Check database
    if ! check_database; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check Redis
    if ! check_redis; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check backend API
    if ! check_backend_api; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check frontend
    if ! check_frontend; then
        failed_checks=$((failed_checks + 1))
    fi
    
    if [ $failed_checks -eq 0 ]; then
        print_status "SUCCESS" "All health checks passed!"
        return 0
    else
        print_status "ERROR" "$failed_checks health check(s) failed"
        return 1
    fi
}

# Function to setup test data
setup_test_data() {
    print_status "INFO" "Setting up test data..."
    
    # Check if test data setup script exists
    if [ -f "scripts/seed_test_data.py" ]; then
        python scripts/seed_test_data.py
        print_status "SUCCESS" "Test data setup completed"
    else
        print_status "WARNING" "Test data setup script not found, skipping"
    fi
}

# Function to capture logs on failure
capture_logs() {
    print_status "INFO" "Capturing logs for debugging..."
    
    local log_dir="logs/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$log_dir"
    
    # Capture Docker logs if available
    if command -v docker > /dev/null 2>&1; then
        docker logs backend-container > "$log_dir/backend.log" 2>&1 || true
        docker logs frontend-container > "$log_dir/frontend.log" 2>&1 || true
    fi
    
    # Capture system logs
    if [ -f "/var/log/nginx/error.log" ]; then
        cp /var/log/nginx/error.log "$log_dir/" || true
    fi
    
    # Capture application logs
    if [ -d "logs" ]; then
        cp -r logs/* "$log_dir/" || true
    fi
    
    print_status "SUCCESS" "Logs captured in $log_dir"
}

# Main execution
main() {
    case "${1:-health}" in
        "health")
            run_health_check
            ;;
        "database")
            check_database
            ;;
        "redis")
            check_redis
            ;;
        "backend")
            check_backend_api
            ;;
        "frontend")
            check_frontend
            ;;
        "setup-data")
            setup_test_data
            ;;
        "capture-logs")
            capture_logs
            ;;
        "wait-backend")
            wait_for_service "${API_BASE_URL:-http://localhost:8000}/health" 120 "Backend API"
            ;;
        "wait-frontend")
            wait_for_service "${BASE_URL:-http://localhost:3000}" 120 "Frontend server"
            ;;
        *)
            echo "Usage: $0 {health|database|redis|backend|frontend|setup-data|capture-logs|wait-backend|wait-frontend}"
            echo ""
            echo "Commands:"
            echo "  health        - Run comprehensive health check"
            echo "  database      - Check database connectivity"
            echo "  redis         - Check Redis connectivity"
            echo "  backend       - Check backend API health"
            echo "  frontend      - Check frontend server"
            echo "  setup-data    - Setup test data"
            echo "  capture-logs  - Capture logs for debugging"
            echo "  wait-backend  - Wait for backend to be ready"
            echo "  wait-frontend - Wait for frontend to be ready"
            exit 1
            ;;
    esac
}

main "$@"
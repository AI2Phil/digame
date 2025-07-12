#!/bin/bash

# Performance Testing Deployment Script
# This script orchestrates the deployment of backend, frontend, and Locust services
# for comprehensive Core Web Vitals performance testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.performance.yml"
PROJECT_NAME="digame-performance"
BACKEND_HEALTH_URL="http://localhost:8000/health"
FRONTEND_HEALTH_URL="http://localhost:3000/api/health"
LOCUST_UI_URL="http://localhost:8089"

# Docker Compose command detection
DOCKER_COMPOSE_CMD=""

# Function to detect Docker Compose command
detect_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        print_error "Neither 'docker-compose' nor 'docker compose' is available"
        exit 1
    fi
    print_status "Using Docker Compose command: $DOCKER_COMPOSE_CMD"
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is healthy
check_service_health() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Checking $service_name health at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to become healthy after $((max_attempts * 2)) seconds"
    return 1
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to become healthy..."
    
    # Wait for backend
    if ! check_service_health "$BACKEND_HEALTH_URL" "Backend"; then
        print_error "Backend service failed to start properly"
        return 1
    fi
    
    # Wait for frontend
    if ! check_service_health "$FRONTEND_HEALTH_URL" "Frontend"; then
        print_error "Frontend service failed to start properly"
        return 1
    fi
    
    print_success "All services are healthy and ready for testing!"
}

# Function to start performance testing environment
start_performance_env() {
    print_status "Starting performance testing environment..."
    
    # Create performance reports directory
    mkdir -p performance-reports
    
    # Start the services
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d backend frontend
    
    # Wait for services to be ready
    if wait_for_services; then
        print_success "Performance testing environment is ready!"
        print_status "Backend: $BACKEND_HEALTH_URL"
        print_status "Frontend: $FRONTEND_HEALTH_URL"
    else
        print_error "Failed to start performance testing environment"
        return 1
    fi
}

# Function to run full-stack performance tests
run_fullstack_tests() {
    print_status "Starting full-stack performance tests with Locust..."
    
    # Start Locust master and workers
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d locust-master locust-worker
    
    print_success "Locust performance testing started!"
    print_status "Locust Web UI: $LOCUST_UI_URL"
    print_status "You can monitor the tests in real-time at the Web UI"
    
    # Wait for user input to stop tests
    echo ""
    print_warning "Press Enter to stop the performance tests..."
    read -r
    
    # Stop Locust services
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop locust-master locust-worker
    print_success "Performance tests stopped"
}

# Function to run frontend-only tests
run_frontend_tests() {
    print_status "Starting frontend-only performance tests..."
    
    # Start frontend-only Locust testing
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile frontend-only up -d locust-frontend
    
    print_success "Frontend performance testing started!"
    print_status "Locust Web UI: http://localhost:8090"
    
    # Wait for user input to stop tests
    echo ""
    print_warning "Press Enter to stop the frontend tests..."
    read -r
    
    # Stop frontend testing
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop locust-frontend
    print_success "Frontend tests stopped"
}

# Function to run headless performance tests
run_headless_tests() {
    local users=${1:-100}
    local spawn_rate=${2:-10}
    local run_time=${3:-300s}
    
    print_status "Running headless performance tests..."
    print_status "Users: $users, Spawn Rate: $spawn_rate, Duration: $run_time"
    
    # Run headless Locust test
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" run --rm locust-master \
        locust -f /app/tests/performance/locustfile.py \
        --headless \
        --users "$users" \
        --spawn-rate "$spawn_rate" \
        --run-time "$run_time" \
        --host http://backend:8000 \
        --html /app/reports/performance-report-$(date +%Y%m%d-%H%M%S).html \
        --csv /app/reports/performance-data-$(date +%Y%m%d-%H%M%S)
    
    print_success "Headless performance tests completed!"
    print_status "Reports saved to performance-reports/ directory"
}

# Function to start monitoring
start_monitoring() {
    print_status "Starting performance monitoring (Prometheus + Grafana)..."
    
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile monitoring up -d prometheus grafana
    
    print_success "Monitoring started!"
    print_status "Prometheus: http://localhost:9090"
    print_status "Grafana: http://localhost:3001 (admin/admin)"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all performance testing services..."
    
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    
    print_success "All services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up performance testing environment..."
    
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans
    
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    local service=${1:-}
    
    if [ -n "$service" ]; then
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$service"
    else
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Performance testing environment status:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
}

# Main menu
show_menu() {
    echo ""
    echo "=== Digame Performance Testing Menu ==="
    echo "1. Start Performance Environment (Backend + Frontend)"
    echo "2. Run Full-Stack Performance Tests (Interactive)"
    echo "3. Run Frontend-Only Tests (Interactive)"
    echo "4. Run Headless Performance Tests"
    echo "5. Start Monitoring (Prometheus + Grafana)"
    echo "6. Show Service Status"
    echo "7. Show Logs"
    echo "8. Stop All Services"
    echo "9. Cleanup (Stop + Remove Volumes)"
    echo "0. Exit"
    echo ""
}

# Main script logic
main() {
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Detect Docker Compose command
    detect_docker_compose
    
    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    # Handle command line arguments
    case "${1:-menu}" in
        "start")
            start_performance_env
            ;;
        "test")
            start_performance_env && run_fullstack_tests
            ;;
        "frontend")
            start_performance_env && run_frontend_tests
            ;;
        "headless")
            start_performance_env && run_headless_tests "${2:-100}" "${3:-10}" "${4:-300s}"
            ;;
        "monitoring")
            start_monitoring
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "stop")
            stop_all
            ;;
        "cleanup")
            cleanup
            ;;
        "menu"|*)
            while true; do
                show_menu
                read -p "Select an option (0-9): " choice
                
                case $choice in
                    1)
                        start_performance_env
                        ;;
                    2)
                        start_performance_env && run_fullstack_tests
                        ;;
                    3)
                        start_performance_env && run_frontend_tests
                        ;;
                    4)
                        echo ""
                        read -p "Number of users (default: 100): " users
                        read -p "Spawn rate (default: 10): " spawn_rate
                        read -p "Run time (default: 300s): " run_time
                        start_performance_env && run_headless_tests "${users:-100}" "${spawn_rate:-10}" "${run_time:-300s}"
                        ;;
                    5)
                        start_monitoring
                        ;;
                    6)
                        show_status
                        ;;
                    7)
                        echo ""
                        read -p "Service name (leave empty for all): " service
                        show_logs "$service"
                        ;;
                    8)
                        stop_all
                        ;;
                    9)
                        cleanup
                        ;;
                    0)
                        print_success "Goodbye!"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid option. Please try again."
                        ;;
                esac
                
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"
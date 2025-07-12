#!/bin/bash

# System Monitoring Script for Digame Platform
# Monitors Docker containers, services, and system resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3001"
BACKEND_URL="http://localhost:8001"
BACKEND_HEALTH_URL="$BACKEND_URL/health"

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

# Function to check service health
check_service_health() {
    local url=$1
    local service_name=$2
    local timeout=${3:-5}
    
    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        print_success "$service_name is healthy"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Function to check backend health with details
check_backend_health() {
    print_status "Checking backend health..."
    
    if response=$(curl -s --max-time 10 "$BACKEND_HEALTH_URL" 2>/dev/null); then
        status=$(echo "$response" | jq -r '.status' 2>/dev/null || echo "unknown")
        version=$(echo "$response" | jq -r '.version' 2>/dev/null || echo "unknown")
        uptime=$(echo "$response" | jq -r '.uptime' 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ]; then
            print_success "Backend is healthy (v$version, uptime: ${uptime}s)"
            return 0
        else
            print_warning "Backend status: $status"
            return 1
        fi
    else
        print_error "Backend health check failed"
        return 1
    fi
}

# Function to check frontend health
check_frontend_health() {
    print_status "Checking frontend health..."
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$FRONTEND_URL" 2>/dev/null); then
        if [ "$http_code" = "200" ]; then
            print_success "Frontend is responding (HTTP $http_code)"
            return 0
        else
            print_warning "Frontend returned HTTP $http_code"
            return 1
        fi
    else
        print_error "Frontend is not responding"
        return 1
    fi
}

# Function to check Docker containers
check_docker_containers() {
    print_status "Checking Docker containers..."
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running"
        return 1
    fi
    
    # Check container status
    containers=$(docker-compose ps --format json 2>/dev/null | jq -r '.Name + " " + .State' 2>/dev/null || echo "")
    
    if [ -z "$containers" ]; then
        print_warning "No containers found or docker-compose not available"
        return 1
    fi
    
    echo "$containers" | while read -r name state; do
        if [ "$state" = "running" ]; then
            print_success "Container $name is running"
        else
            print_error "Container $name is $state"
        fi
    done
}

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check disk usage
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        print_error "Disk usage is critical: ${disk_usage}%"
    elif [ "$disk_usage" -gt 80 ]; then
        print_warning "Disk usage is high: ${disk_usage}%"
    else
        print_success "Disk usage is normal: ${disk_usage}%"
    fi
    
    # Check memory usage
    if command -v free >/dev/null 2>&1; then
        mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$mem_usage" -gt 90 ]; then
            print_error "Memory usage is critical: ${mem_usage}%"
        elif [ "$mem_usage" -gt 80 ]; then
            print_warning "Memory usage is high: ${mem_usage}%"
        else
            print_success "Memory usage is normal: ${mem_usage}%"
        fi
    fi
    
    # Check Docker storage
    if docker info >/dev/null 2>&1; then
        docker_size=$(docker system df --format "{{.Size}}" 2>/dev/null | head -1 || echo "unknown")
        print_status "Docker storage usage: $docker_size"
    fi
}

# Function to check network connectivity
check_network() {
    print_status "Checking network connectivity..."
    
    # Check if services can communicate
    if docker exec digame-frontend-1 curl -s --max-time 5 "$BACKEND_URL/health" >/dev/null 2>&1; then
        print_success "Frontend can reach backend"
    else
        print_warning "Frontend cannot reach backend"
    fi
}

# Function to run performance tests
run_quick_performance_test() {
    print_status "Running quick performance test..."
    
    # Test backend response time
    backend_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$BACKEND_HEALTH_URL" 2>/dev/null || echo "timeout")
    if [ "$backend_time" != "timeout" ]; then
        backend_ms=$(echo "$backend_time * 1000" | bc 2>/dev/null || echo "unknown")
        if [ "$backend_ms" != "unknown" ] && [ "$(echo "$backend_ms < 1000" | bc 2>/dev/null)" = "1" ]; then
            print_success "Backend response time: ${backend_ms}ms"
        else
            print_warning "Backend response time: ${backend_ms}ms (slow)"
        fi
    else
        print_error "Backend response timeout"
    fi
    
    # Test frontend response time
    frontend_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$FRONTEND_URL" 2>/dev/null || echo "timeout")
    if [ "$frontend_time" != "timeout" ]; then
        frontend_ms=$(echo "$frontend_time * 1000" | bc 2>/dev/null || echo "unknown")
        if [ "$frontend_ms" != "unknown" ] && [ "$(echo "$frontend_ms < 2000" | bc 2>/dev/null)" = "1" ]; then
            print_success "Frontend response time: ${frontend_ms}ms"
        else
            print_warning "Frontend response time: ${frontend_ms}ms (slow)"
        fi
    else
        print_error "Frontend response timeout"
    fi
}

# Function to show summary
show_summary() {
    echo ""
    echo "=== System Status Summary ==="
    echo ""
    
    # Service URLs
    print_status "Service URLs:"
    echo "  Frontend: $FRONTEND_URL"
    echo "  Backend:  $BACKEND_URL"
    echo "  Health:   $BACKEND_HEALTH_URL"
    echo ""
    
    # Quick status check
    backend_ok=0
    frontend_ok=0
    
    if curl -s --max-time 5 "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
        backend_ok=1
    fi
    
    if curl -s --max-time 5 "$FRONTEND_URL" >/dev/null 2>&1; then
        frontend_ok=1
    fi
    
    if [ $backend_ok -eq 1 ] && [ $frontend_ok -eq 1 ]; then
        print_success "All services are operational"
    else
        print_error "Some services are not responding"
    fi
    
    echo ""
}

# Function to watch services continuously
watch_services() {
    print_status "Starting continuous monitoring (Ctrl+C to stop)..."
    
    while true; do
        clear
        echo "=== Digame Platform Monitor - $(date) ==="
        echo ""
        
        check_backend_health
        check_frontend_health
        check_docker_containers
        check_system_resources
        
        echo ""
        print_status "Next check in 30 seconds..."
        sleep 30
    done
}

# Main menu
show_menu() {
    echo ""
    echo "=== Digame Platform Monitor ==="
    echo "1. Full health check"
    echo "2. Check services only"
    echo "3. Check Docker containers"
    echo "4. Check system resources"
    echo "5. Run performance test"
    echo "6. Show summary"
    echo "7. Watch services (continuous)"
    echo "8. Exit"
    echo ""
}

# Main script logic
main() {
    # Handle command line arguments
    case "${1:-menu}" in
        "health")
            check_backend_health
            check_frontend_health
            ;;
        "services")
            check_backend_health
            check_frontend_health
            check_docker_containers
            ;;
        "docker")
            check_docker_containers
            ;;
        "resources")
            check_system_resources
            ;;
        "performance")
            run_quick_performance_test
            ;;
        "summary")
            show_summary
            ;;
        "watch")
            watch_services
            ;;
        "full")
            check_backend_health
            check_frontend_health
            check_docker_containers
            check_system_resources
            check_network
            run_quick_performance_test
            show_summary
            ;;
        "menu"|*)
            while true; do
                show_menu
                read -p "Select an option (1-8): " choice
                
                case $choice in
                    1)
                        check_backend_health
                        check_frontend_health
                        check_docker_containers
                        check_system_resources
                        check_network
                        run_quick_performance_test
                        ;;
                    2)
                        check_backend_health
                        check_frontend_health
                        ;;
                    3)
                        check_docker_containers
                        ;;
                    4)
                        check_system_resources
                        ;;
                    5)
                        run_quick_performance_test
                        ;;
                    6)
                        show_summary
                        ;;
                    7)
                        watch_services
                        ;;
                    8)
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
#!/bin/bash

# Docker Storage Cleanup and Optimization Script
# This script provides automated Docker cleanup with safety checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to show current Docker usage
show_docker_usage() {
    print_status "Current Docker storage usage:"
    docker system df
    echo ""
}

# Function to show disk usage
show_disk_usage() {
    print_status "Current disk usage:"
    df -h | grep -E "(Filesystem|/dev/)"
    echo ""
}

# Function to perform safe cleanup
safe_cleanup() {
    print_status "Performing safe Docker cleanup..."
    
    # Remove stopped containers
    print_status "Removing stopped containers..."
    docker container prune -f
    
    # Remove unused networks
    print_status "Removing unused networks..."
    docker network prune -f
    
    # Remove unused images (keep recent ones)
    print_status "Removing unused images older than 24 hours..."
    docker image prune -a --filter "until=24h" -f
    
    # Remove unused build cache
    print_status "Removing unused build cache..."
    docker builder prune -f
    
    print_success "Safe cleanup completed!"
}

# Function to perform aggressive cleanup
aggressive_cleanup() {
    print_warning "Performing aggressive Docker cleanup..."
    print_warning "This will remove ALL unused Docker data!"
    
    # Ask for confirmation
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled."
        return 0
    fi
    
    # Full system prune
    print_status "Removing all unused Docker data..."
    docker system prune -a --volumes -f
    
    print_success "Aggressive cleanup completed!"
}

# Function to clean up volumes only
cleanup_volumes() {
    print_status "Cleaning up unused Docker volumes..."
    
    # Show current volumes
    print_status "Current volumes:"
    docker volume ls
    echo ""
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Volume cleanup completed!"
}

# Function to optimize current containers
optimize_containers() {
    print_status "Optimizing running containers..."
    
    # Show current containers
    print_status "Current containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"
    echo ""
    
    # Restart containers to free memory
    print_status "Restarting containers to optimize memory usage..."
    docker-compose restart
    
    print_success "Container optimization completed!"
}

# Function to show cleanup recommendations
show_recommendations() {
    print_status "Docker Storage Optimization Recommendations:"
    echo ""
    
    # Check for large images
    print_status "Largest Docker images:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
    echo ""
    
    # Check for old containers
    print_status "Container status:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}"
    echo ""
    
    # Recommendations
    echo "💡 Optimization Tips:"
    echo "  • Run 'safe_cleanup' weekly to maintain clean environment"
    echo "  • Use multi-stage builds to reduce image sizes"
    echo "  • Remove development dependencies in production images"
    echo "  • Use .dockerignore to exclude unnecessary files"
    echo "  • Consider using Alpine-based images for smaller footprint"
    echo ""
}

# Function to monitor Docker usage
monitor_usage() {
    print_status "Docker Usage Monitoring:"
    echo ""
    
    # Current usage
    show_docker_usage
    show_disk_usage
    
    # Check for potential issues
    TOTAL_SIZE=$(docker system df --format "{{.TotalCount}}" | head -1)
    if [ -z "$TOTAL_SIZE" ]; then
        TOTAL_SIZE=0
    fi
    
    # Warning thresholds
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 80 ]; then
        print_warning "Disk usage is above 80% - consider cleanup!"
    fi
    
    # Show reclaimable space
    print_status "Reclaimable Docker space:"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "=== Docker Storage Cleanup & Optimization ==="
    echo "1. Show current usage"
    echo "2. Safe cleanup (recommended)"
    echo "3. Cleanup volumes only"
    echo "4. Optimize containers"
    echo "5. Show recommendations"
    echo "6. Monitor usage"
    echo "7. Aggressive cleanup (removes ALL unused data)"
    echo "8. Exit"
    echo ""
}

# Main script logic
main() {
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or not accessible"
        exit 1
    fi
    
    # Handle command line arguments
    case "${1:-menu}" in
        "usage")
            show_docker_usage
            show_disk_usage
            ;;
        "safe")
            show_docker_usage
            safe_cleanup
            show_docker_usage
            ;;
        "aggressive")
            show_docker_usage
            aggressive_cleanup
            show_docker_usage
            ;;
        "volumes")
            cleanup_volumes
            ;;
        "optimize")
            optimize_containers
            ;;
        "monitor")
            monitor_usage
            ;;
        "recommendations")
            show_recommendations
            ;;
        "menu"|*)
            while true; do
                show_menu
                read -p "Select an option (1-8): " choice
                
                case $choice in
                    1)
                        show_docker_usage
                        show_disk_usage
                        ;;
                    2)
                        show_docker_usage
                        safe_cleanup
                        show_docker_usage
                        ;;
                    3)
                        cleanup_volumes
                        ;;
                    4)
                        optimize_containers
                        ;;
                    5)
                        show_recommendations
                        ;;
                    6)
                        monitor_usage
                        ;;
                    7)
                        show_docker_usage
                        aggressive_cleanup
                        show_docker_usage
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
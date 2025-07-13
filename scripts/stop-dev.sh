#!/bin/bash

# Digame Development Environment Stop Script
# This script stops both backend and frontend services

set -e  # Exit on any error

echo "🛑 Stopping Digame Development Environment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    print_status "Stopping processes on port $port"
    
    # Kill processes using the port
    if check_port $port; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 2
            
            # Check if processes are still running
            if check_port $port; then
                print_warning "Some processes on port $port may still be running"
            else
                print_success "Stopped processes on port $port"
            fi
        fi
    else
        print_success "No processes running on port $port"
    fi
}

# Stop backend service
print_status "Stopping backend service..."
if [ -f .backend-pid ]; then
    local backend_pid=$(cat .backend-pid)
    if ps -p $backend_pid > /dev/null 2>&1; then
        kill $backend_pid 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p $backend_pid > /dev/null 2>&1; then
            kill -9 $backend_pid 2>/dev/null || true
        fi
        print_success "Backend service stopped (PID: $backend_pid)"
    else
        print_warning "Backend process not found (PID: $backend_pid)"
    fi
    rm -f .backend-pid
else
    print_warning "Backend PID file not found"
fi

# Stop frontend service
print_status "Stopping frontend service..."
if [ -f .frontend-pid ]; then
    local frontend_pid=$(cat .frontend-pid)
    if ps -p $frontend_pid > /dev/null 2>&1; then
        kill $frontend_pid 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p $frontend_pid > /dev/null 2>&1; then
            kill -9 $frontend_pid 2>/dev/null || true
        fi
        print_success "Frontend service stopped (PID: $frontend_pid)"
    else
        print_warning "Frontend process not found (PID: $frontend_pid)"
    fi
    rm -f .frontend-pid
else
    print_warning "Frontend PID file not found"
fi

# Kill any remaining processes on our ports
kill_port_processes 8000
kill_port_processes 3001

# Clean up log files
print_status "Cleaning up log files..."
if [ -f backend.log ]; then
    rm -f backend.log
    print_success "Removed backend.log"
fi

if [ -f frontend.log ]; then
    rm -f frontend.log
    print_success "Removed frontend.log"
fi

# Kill any remaining uvicorn or npm processes
print_status "Cleaning up any remaining processes..."

# Kill uvicorn processes
pkill -f "uvicorn.*main:app" 2>/dev/null || true

# Kill npm/node processes related to our project
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

print_success "Development environment stopped successfully"

echo ""
echo "🏁 All services have been stopped"
echo "================================="
echo ""
echo "To restart the development environment, run:"
echo "   ./scripts/start-dev.sh"
echo ""
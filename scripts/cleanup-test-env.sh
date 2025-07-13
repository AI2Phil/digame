#!/bin/bash

# Digame Test Environment Cleanup Script
# Cleans up test environment and removes test data

set -e  # Exit on any error

echo "🧹 Cleaning up Digame Test Environment"
echo "======================================"

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
    
    if check_port $port; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 1
            
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

# Step 1: Stop test backend service
print_status "Stopping test backend service..."
if [ -f .test-backend-pid ]; then
    local backend_pid=$(cat .test-backend-pid)
    if ps -p $backend_pid > /dev/null 2>&1; then
        kill $backend_pid 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p $backend_pid > /dev/null 2>&1; then
            kill -9 $backend_pid 2>/dev/null || true
        fi
        print_success "Test backend service stopped (PID: $backend_pid)"
    else
        print_warning "Test backend process not found (PID: $backend_pid)"
    fi
    rm -f .test-backend-pid
else
    print_warning "Test backend PID file not found"
fi

# Step 2: Stop test frontend service
print_status "Stopping test frontend service..."
if [ -f .test-frontend-pid ]; then
    local frontend_pid=$(cat .test-frontend-pid)
    if ps -p $frontend_pid > /dev/null 2>&1; then
        kill $frontend_pid 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p $frontend_pid > /dev/null 2>&1; then
            kill -9 $frontend_pid 2>/dev/null || true
        fi
        print_success "Test frontend service stopped (PID: $frontend_pid)"
    else
        print_warning "Test frontend process not found (PID: $frontend_pid)"
    fi
    rm -f .test-frontend-pid
else
    print_warning "Test frontend PID file not found"
fi

# Step 3: Kill any remaining processes on test ports
kill_port_processes 8000
kill_port_processes 3001

# Step 4: Clean up test files
print_status "Cleaning up test files..."

# Remove test database
if [ -f test.db ]; then
    rm -f test.db
    print_success "Removed test database"
fi

# Remove test environment file
if [ -f .env.test ]; then
    rm -f .env.test
    print_success "Removed test environment file"
fi

# Remove test logs
if [ -f test-backend.log ]; then
    rm -f test-backend.log
    print_success "Removed test backend log"
fi

if [ -f test-frontend.log ]; then
    rm -f test-frontend.log
    print_success "Removed test frontend log"
fi

# Remove test data directory if empty
if [ -d test-data ]; then
    if [ -z "$(ls -A test-data)" ]; then
        rmdir test-data
        print_success "Removed empty test-data directory"
    else
        print_warning "test-data directory not empty, keeping it"
    fi
fi

# Step 5: Clean up any remaining test processes
print_status "Cleaning up any remaining test processes..."

# Kill any uvicorn test processes
pkill -f "uvicorn.*main:app.*8000" 2>/dev/null || true

# Kill any npm/node test processes
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# Step 6: Clean up Playwright test artifacts
print_status "Cleaning up Playwright test artifacts..."

if [ -d "frontend/test-results" ]; then
    rm -rf frontend/test-results
    print_success "Removed Playwright test results"
fi

if [ -d "frontend/playwright-report" ]; then
    rm -rf frontend/playwright-report
    print_success "Removed Playwright HTML report"
fi

# Clean up any .test-backend-pid files that might be left in frontend directory
if [ -f "frontend/.test-backend-pid" ]; then
    rm -f frontend/.test-backend-pid
    print_success "Removed frontend test backend PID file"
fi

# Step 7: Reset environment variables
print_status "Resetting environment variables..."
unset NODE_ENV
unset TESTING
unset DATABASE_URL
unset TEST_DATABASE_URL
print_success "Environment variables reset"

print_success "Test environment cleanup completed successfully"

echo ""
echo "🏁 Test Environment Cleaned Up"
echo "=============================="
echo ""
echo "✅ All test processes stopped"
echo "✅ Test database removed"
echo "✅ Test logs cleaned up"
echo "✅ Test artifacts removed"
echo ""
echo "To set up test environment again, run:"
echo "   ./scripts/setup-test-env.sh"
echo ""
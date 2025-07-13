#!/bin/bash

# Digame Development Environment Startup Script
# This script starts both backend and frontend services with proper health checks

set -e  # Exit on any error

echo "🚀 Starting Digame Development Environment"
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
    print_warning "Killing existing processes on port $port"
    
    # Kill processes using the port
    if check_port $port; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to start..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $max_attempts seconds"
    return 1
}

# Cleanup function
cleanup() {
    print_warning "Cleaning up processes..."
    
    # Kill backend if PID file exists
    if [ -f .backend-pid ]; then
        local backend_pid=$(cat .backend-pid)
        if ps -p $backend_pid > /dev/null 2>&1; then
            kill $backend_pid 2>/dev/null || true
        fi
        rm -f .backend-pid
    fi
    
    # Kill frontend if PID file exists
    if [ -f .frontend-pid ]; then
        local frontend_pid=$(cat .frontend-pid)
        if ps -p $frontend_pid > /dev/null 2>&1; then
            kill $frontend_pid 2>/dev/null || true
        fi
        rm -f .frontend-pid
    fi
    
    # Kill any remaining processes on our ports
    kill_port_processes 8000
    kill_port_processes 3001
    
    print_success "Cleanup completed"
}

# Set up trap for cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Clean up any existing processes
print_status "Cleaning up existing processes..."
cleanup

# Step 2: Check prerequisites
print_status "Checking prerequisites..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Step 3: Start Backend (Python FastAPI)
print_status "Starting backend server..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    print_error "main.py not found. Please run this script from the project root directory."
    exit 1
fi

# Install Python dependencies if needed
if [ ! -d "venv" ] && [ ! -f ".venv/bin/activate" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

# Install/update Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1 || print_warning "Some Python dependencies may have failed to install"

# Start backend
print_status "Launching backend on port 8000..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend-pid

# Wait for backend to start
if wait_for_service "http://localhost:8000/health" "Backend"; then
    print_success "Backend started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check backend.log for details."
    exit 1
fi

# Step 4: Start Frontend (Next.js)
print_status "Starting frontend server..."

# Navigate to frontend directory
cd frontend

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
fi

# Start frontend
print_status "Launching frontend on port 3001..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend-pid

# Go back to root directory
cd ..

# Wait for frontend to start
if wait_for_service "http://localhost:3001" "Frontend"; then
    print_success "Frontend started successfully (PID: $FRONTEND_PID)"
else
    print_error "Frontend failed to start. Check frontend.log for details."
    exit 1
fi

# Step 5: Verify integration
print_status "Verifying service integration..."

# Test backend health
if curl -s -f "http://localhost:8000/health" > /dev/null; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Test backend API
if curl -s -f "http://localhost:8000/api/health" > /dev/null; then
    print_success "Backend API health check passed"
else
    print_error "Backend API health check failed"
fi

# Test security dashboard endpoint
if curl -s -f "http://localhost:8000/api/security/dashboard" > /dev/null; then
    print_success "Security dashboard endpoint accessible"
else
    print_warning "Security dashboard endpoint may not be accessible"
fi

# Test CORS
print_status "Testing CORS configuration..."
CORS_TEST=$(curl -s -H "Origin: http://localhost:3001" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:8000/api/health" -w "%{http_code}" -o /dev/null)
if [ "$CORS_TEST" = "200" ]; then
    print_success "CORS configuration working"
else
    print_warning "CORS may need configuration (HTTP $CORS_TEST)"
fi

# Step 6: Display summary
echo ""
echo "🎉 Development Environment Ready!"
echo "================================="
echo ""
echo "📍 Services:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔍 Health Checks:"
echo "   Backend Health: http://localhost:8000/health"
echo "   API Health:     http://localhost:8000/api/health"
echo "   Security Dashboard: http://localhost:8000/api/security/dashboard"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   ./scripts/stop-dev.sh"
echo "   or press Ctrl+C"
echo ""

# Keep script running to maintain services
print_status "Services are running. Press Ctrl+C to stop..."

# Wait for user interrupt
while true; do
    sleep 1
done
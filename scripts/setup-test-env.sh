#!/bin/bash

# Digame Test Environment Setup Script
# Sets up isolated test environment with test database and services

set -e  # Exit on any error

echo "🧪 Setting up Digame Test Environment"
echo "====================================="

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
    print_warning "Cleaning up processes on port $port"
    
    if check_port $port; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 1
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
cleanup_test_env() {
    print_status "Cleaning up existing test environment..."
    
    # Kill any existing test processes
    kill_port_processes 8000
    kill_port_processes 3001
    
    # Remove test PID files
    rm -f .test-backend-pid
    rm -f .test-frontend-pid
    
    # Remove test logs
    rm -f test-backend.log
    rm -f test-frontend.log
    
    print_success "Test environment cleaned up"
}

# Set up trap for cleanup on script exit
trap cleanup_test_env EXIT INT TERM

# Step 1: Clean up any existing test environment
cleanup_test_env

# Step 2: Set up test environment variables
print_status "Setting up test environment variables..."

# Create test environment file
cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test
TESTING=true

# Database Configuration
DATABASE_URL=sqlite:///./test.db
TEST_DATABASE_URL=sqlite:///./test.db

# API Configuration
API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_ENVIRONMENT=test
NEXT_PUBLIC_LOG_LEVEL=debug

# Disable external services in tests
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_SENTRY_ENABLED=false

# Test-specific settings
PLAYWRIGHT_BASE_URL=http://localhost:3001
BASE_URL=http://localhost:3001
EOF

print_success "Test environment variables configured"

# Step 3: Set up test database
print_status "Setting up test database..."

# Create test database directory if it doesn't exist
mkdir -p test-data

# Initialize test database (SQLite for simplicity)
if [ -f "test.db" ]; then
    rm -f test.db
    print_status "Removed existing test database"
fi

# Create a minimal test database
python3 -c "
import sqlite3
import os

# Create test database
conn = sqlite3.connect('test.db')
cursor = conn.cursor()

# Create basic tables for testing
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
''')

# Insert test data
cursor.execute('''
    INSERT OR REPLACE INTO users (id, username, email) 
    VALUES (1, 'testuser', 'test@example.com')
''')

conn.commit()
conn.close()
print('Test database initialized successfully')
" 2>/dev/null || print_warning "Could not initialize test database (Python/SQLite may not be available)"

print_success "Test database setup completed"

# Step 4: Start backend with test configuration
print_status "Starting backend with test configuration..."

# Set test environment variables
export NODE_ENV=test
export TESTING=true
export DATABASE_URL=sqlite:///./test.db

# Start backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > test-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .test-backend-pid

# Wait for backend to start
if wait_for_service "http://localhost:8000/health" "Test Backend"; then
    print_success "Test backend started successfully (PID: $BACKEND_PID)"
else
    print_error "Test backend failed to start. Check test-backend.log for details."
    exit 1
fi

# Step 5: Verify backend endpoints
print_status "Verifying backend endpoints..."

# Test health endpoint
if curl -s -f "http://localhost:8000/health" > /dev/null; then
    print_success "Backend health endpoint working"
else
    print_error "Backend health endpoint failed"
fi

# Test API health endpoint
if curl -s -f "http://localhost:8000/api/health" > /dev/null; then
    print_success "API health endpoint working"
else
    print_error "API health endpoint failed"
fi

# Test security dashboard endpoint
if curl -s -f "http://localhost:8000/api/security/dashboard" > /dev/null; then
    print_success "Security dashboard endpoint working"
else
    print_warning "Security dashboard endpoint may need configuration"
fi

# Step 6: Test CORS configuration
print_status "Testing CORS configuration..."
CORS_TEST=$(curl -s -H "Origin: http://localhost:3001" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:8000/api/health" -w "%{http_code}" -o /dev/null)
if [ "$CORS_TEST" = "200" ]; then
    print_success "CORS configuration working"
else
    print_warning "CORS may need configuration (HTTP $CORS_TEST)"
fi

# Step 7: Start frontend (optional, for full integration tests)
if [ "$1" = "--with-frontend" ]; then
    print_status "Starting frontend for integration testing..."
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    # Start frontend
    npm run dev > ../test-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.test-frontend-pid
    
    cd ..
    
    # Wait for frontend to start
    if wait_for_service "http://localhost:3001" "Test Frontend"; then
        print_success "Test frontend started successfully (PID: $FRONTEND_PID)"
    else
        print_error "Test frontend failed to start. Check test-frontend.log for details."
        exit 1
    fi
fi

# Step 8: Display test environment summary
echo ""
echo "🎯 Test Environment Ready!"
echo "=========================="
echo ""
echo "📍 Services:"
echo "   Backend:  http://localhost:8000"
if [ "$1" = "--with-frontend" ]; then
echo "   Frontend: http://localhost:3001"
fi
echo ""
echo "🔍 Health Checks:"
echo "   Backend Health: http://localhost:8000/health"
echo "   API Health:     http://localhost:8000/api/health"
echo "   Security Dashboard: http://localhost:8000/api/security/dashboard"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f test-backend.log"
if [ "$1" = "--with-frontend" ]; then
echo "   Frontend: tail -f test-frontend.log"
fi
echo ""
echo "🗄️  Database:"
echo "   Test DB: ./test.db (SQLite)"
echo ""
echo "🧪 Run Tests:"
echo "   E2E Tests: cd frontend && npm run test:e2e"
echo "   Unit Tests: cd frontend && npm run test"
echo ""
echo "🛑 Cleanup:"
echo "   ./scripts/cleanup-test-env.sh"
echo ""

print_success "Test environment setup completed successfully!"

# Keep script running if requested
if [ "$1" = "--keep-running" ] || [ "$2" = "--keep-running" ]; then
    print_status "Test environment is running. Press Ctrl+C to stop..."
    while true; do
        sleep 1
    done
fi
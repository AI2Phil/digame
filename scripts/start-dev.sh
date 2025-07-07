#!/bin/bash

echo "🚀 Starting Digame Platform Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo ""
echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "🎯 Choose startup option:"
echo "1) Node.js Backend Only (Recommended - Complete Test Zone)"
echo "2) Python FastAPI Backend Only"
echo "3) Both Backends (Dual Mode)"
echo "4) Frontend Only"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🟢 Starting with Node.js Backend (Port 8001)"
        echo "✅ Complete Test Zone functionality"
        echo "✅ Authentication & Platform Owner features"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "🟡 Starting with Python FastAPI Backend (Port 8002)"
        echo "⚠️  Test Zone endpoints need implementation"
        echo ""
        npm run dev:backend-python &
        npm run dev:frontend &
        wait
        ;;
    3)
        echo ""
        echo "🔵 Starting Both Backends"
        echo "📍 Node.js Backend: http://localhost:8001"
        echo "📍 Python Backend: http://localhost:8002"
        echo "📍 Frontend: http://localhost:3001"
        echo ""
        npm run dev:dual-backend
        ;;
    4)
        echo ""
        echo "🟠 Starting Frontend Only"
        echo "⚠️  No backend - limited functionality"
        echo ""
        npm run dev:frontend
        ;;
    *)
        echo "❌ Invalid choice. Starting default (Node.js Backend)..."
        npm run dev
        ;;
esac
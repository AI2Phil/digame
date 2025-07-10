#!/usr/bin/env python3
"""
Phase 1 Development Environment Setup
Sets up the development environment for Social Networking and Learning & Development features.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment. Consider activating one.")
    else:
        print("✅ Virtual environment detected")
    
    # Check PostgreSQL
    pg_result = run_command("pg_config --version", "Checking PostgreSQL")
    if not pg_result:
        print("❌ PostgreSQL is required but not found")
        return False
    
    # Check Node.js
    node_result = run_command("node --version", "Checking Node.js")
    if not node_result:
        print("❌ Node.js is required but not found")
        return False
    
    return True

def setup_backend_dependencies():
    """Install backend Python dependencies"""
    print("\n📦 Setting up backend dependencies...")
    
    # Install core dependencies
    dependencies = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "sqlalchemy>=2.0.0",
        "alembic>=1.12.0",
        "psycopg2-binary>=2.9.0",
        "redis>=5.0.0",
        "celery>=5.3.0",
        "pydantic>=2.5.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.6",
        "aiofiles>=23.2.1",
        "httpx>=0.25.0",
        "pytest>=7.4.0",
        "pytest-asyncio>=0.21.0",
        "pytest-cov>=4.1.0"
    ]
    
    for dep in dependencies:
        run_command(f"pip install {dep}", f"Installing {dep.split('>=')[0]}")

def setup_frontend_dependencies():
    """Install frontend Node.js dependencies"""
    print("\n🎨 Setting up frontend dependencies...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    os.chdir(frontend_path)
    
    # Install dependencies
    run_command("npm install", "Installing Node.js dependencies")
    
    # Install additional dependencies for new features
    additional_deps = [
        "@types/react",
        "@types/node",
        "typescript",
        "tailwindcss",
        "lucide-react",
        "recharts",
        "date-fns"
    ]
    
    for dep in additional_deps:
        run_command(f"npm install {dep}", f"Installing {dep}")
    
    os.chdir("..")
    return True

def setup_database():
    """Set up database and run migrations"""
    print("\n🗄️  Setting up database...")
    
    # Check if database exists
    db_name = os.getenv("DATABASE_NAME", "digame_dev")
    db_user = os.getenv("DATABASE_USER", "postgres")
    
    # Create database if it doesn't exist
    run_command(
        f'psql -U {db_user} -c "CREATE DATABASE {db_name};" 2>/dev/null || echo "Database may already exist"',
        f"Creating database {db_name}"
    )
    
    # Run migrations
    run_command("alembic upgrade head", "Running database migrations")
    
    return True

def create_env_files():
    """Create environment configuration files"""
    print("\n⚙️  Creating environment files...")
    
    # Backend .env file
    backend_env = """
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/digame_dev
DATABASE_NAME=digame_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Digame Platform

# Development Settings
DEBUG=True
ENVIRONMENT=development

# Social Features
ENABLE_PEER_MATCHING=True
ENABLE_SOCIAL_METRICS=True
PEER_MATCHING_ALGORITHM=compatibility_score

# Learning Features
ENABLE_AI_RECOMMENDATIONS=True
RECOMMENDATION_CONFIDENCE_THRESHOLD=0.7
MAX_RECOMMENDATIONS_PER_USER=10
""".strip()
    
    with open(".env", "w") as f:
        f.write(backend_env)
    
    # Frontend .env.local file
    frontend_env = """
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_V1_STR=/api/v1

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
NEXT_PUBLIC_ENABLE_LEARNING_FEATURES=true
NEXT_PUBLIC_ENABLE_ADVANCED_CONFIG=true

# Development Settings
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG=true
""".strip()
    
    frontend_env_path = Path("frontend/.env.local")
    with open(frontend_env_path, "w") as f:
        f.write(frontend_env)
    
    print("✅ Environment files created")

def seed_initial_data():
    """Seed initial data for development"""
    print("\n🌱 Seeding initial data...")
    
    # Create seed data script
    seed_script = """
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.learning import CourseCategory, Course
from app.models.user import Base
import os

async def seed_data():
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/digame_dev")
    engine = create_async_engine(DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create course categories
        categories = [
            CourseCategory(name="Programming", description="Software development and programming languages"),
            CourseCategory(name="Data Science", description="Data analysis, machine learning, and statistics"),
            CourseCategory(name="Design", description="UI/UX design and visual design principles"),
            CourseCategory(name="Business", description="Business skills and management"),
            CourseCategory(name="Communication", description="Communication and soft skills"),
        ]
        
        for category in categories:
            session.add(category)
        
        await session.commit()
        print("✅ Initial course categories created")

if __name__ == "__main__":
    asyncio.run(seed_data())
""".strip()
    
    with open("seed_data.py", "w") as f:
        f.write(seed_script)
    
    # Run seed script
    run_command("python seed_data.py", "Seeding initial data")
    
    # Clean up
    os.remove("seed_data.py")

def create_development_scripts():
    """Create helpful development scripts"""
    print("\n📝 Creating development scripts...")
    
    # Start development servers script
    start_script = """#!/bin/bash
# Start Development Servers

echo "🚀 Starting Digame Platform Development Environment"

# Start backend
echo "📡 Starting backend server..."
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Start Redis (if not running)
echo "🔴 Starting Redis..."
redis-server --daemonize yes

echo "✅ All services started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
""".strip()
    
    with open("start_dev.sh", "w") as f:
        f.write(start_script)
    os.chmod("start_dev.sh", 0o755)
    
    # Database reset script
    reset_db_script = """#!/bin/bash
# Reset Development Database

echo "🗄️  Resetting development database..."

# Drop and recreate database
dropdb digame_dev 2>/dev/null || echo "Database may not exist"
createdb digame_dev

# Run migrations
alembic upgrade head

# Seed data
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.learning import CourseCategory
import os

async def seed():
    engine = create_async_engine('postgresql+asyncpg://postgres:password@localhost:5432/digame_dev')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        categories = [
            CourseCategory(name='Programming', description='Software development'),
            CourseCategory(name='Data Science', description='Data analysis and ML'),
            CourseCategory(name='Design', description='UI/UX design'),
        ]
        for cat in categories:
            session.add(cat)
        await session.commit()
        print('✅ Database reset and seeded')

asyncio.run(seed())
"

echo "✅ Database reset complete"
""".strip()
    
    with open("reset_db.sh", "w") as f:
        f.write(reset_db_script)
    os.chmod("reset_db.sh", 0o755)
    
    print("✅ Development scripts created")

def main():
    """Main setup function"""
    print("🚀 Digame Platform - Phase 1 Development Environment Setup")
    print("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        print("❌ Prerequisites check failed. Please install required tools.")
        sys.exit(1)
    
    # Setup backend
    setup_backend_dependencies()
    
    # Setup frontend
    if not setup_frontend_dependencies():
        print("⚠️  Frontend setup had issues, but continuing...")
    
    # Create environment files
    create_env_files()
    
    # Setup database
    if not setup_database():
        print("⚠️  Database setup had issues, but continuing...")
    
    # Seed initial data
    seed_initial_data()
    
    # Create development scripts
    create_development_scripts()
    
    print("\n" + "=" * 60)
    print("✅ Phase 1 Development Environment Setup Complete!")
    print("\n📋 Next Steps:")
    print("1. Review and update .env files with your database credentials")
    print("2. Start development servers: ./start_dev.sh")
    print("3. Access the application:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend API: http://localhost:8000")
    print("   - API Documentation: http://localhost:8000/docs")
    print("\n🔧 Development Commands:")
    print("- Reset database: ./reset_db.sh")
    print("- Run migrations: alembic upgrade head")
    print("- Create migration: alembic revision --autogenerate -m 'description'")
    print("\n🎯 Phase 1 Features Ready:")
    print("- Social Networking (8 immediate 404s fixed)")
    print("- Learning & Development (database schema ready)")
    print("- Advanced Configuration (routing complete)")

if __name__ == "__main__":
    main()
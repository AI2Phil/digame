# Docker User Guide for Digame Platform

## Overview

The Digame Digital Professional Twin Platform uses Docker Compose to orchestrate multiple services including backend (FastAPI), frontend (Next.js), PostgreSQL database, and Redis cache. This comprehensive setup provides a complete intelligent platform with advanced caching, analytics, and AI-powered features.

## Backend Architecture Overview

### Dual Backend Structure

The Digame platform has two distinct backend implementations:

1. **Docker Backend** (`/app/main.py`): Python FastAPI application
   - Production-ready FastAPI server with comprehensive features
   - Advanced analytics, ML capabilities, and enterprise features
   - Authentication & authorization with JWT and RBAC
   - Digital twin functionality and platform owner management
   - Multi-tenant architecture support
   - 100+ API endpoints with OpenAPI documentation

2. **Development Backend** (`/backend/src/`): Node.js Express application
   - Development-focused backend with intelligent cache features
   - Advanced cache warming strategies and AI-powered predictions
   - Multi-layer caching system with Redis integration
   - Professional CLI tools for cache and database management
   - Real-time analytics and performance monitoring

**Important Note**: The Docker setup runs the Python FastAPI backend (`/app/main.py`), while the intelligent cache features we've implemented are in the Node.js backend (`/backend/src/`). Both backends provide different capabilities and can be used depending on your development needs.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### Initial Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd digame
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Default Admin Credentials
- **Email:** `admin@digame.com`
- **Password:** `admin123`
- ⚠️ **IMPORTANT:** Change this password in production!

## Service Architecture

### Services Overview
- **Backend** (`digame_backend`): FastAPI application on port 8000
- **Frontend** (`digame_frontend`): Next.js application on port 3000
- **Database** (`digame_db`): PostgreSQL 15 on port 5432
- **Cache** (`digame_redis`): Redis 7-alpine on port 6379

### Intelligent Cache System with Redis

The Docker stack includes a comprehensive intelligent caching system powered by Redis:

#### Redis Cache Features
- **High-Performance Caching**: Redis 7-alpine with AOF persistence
- **Multi-Layer Architecture**: Memory and Redis caching layers
- **Data Persistence**: Automatic data backup with append-only file
- **Scalable Storage**: Volume-mounted for persistent cache data

#### Cache Capabilities
- **Intelligent Cache Management**: AI-powered cache predictions
- **Advanced Warming Strategies**: 6 priority-based warming algorithms
- **Smart Invalidation**: Cascade effects and pattern-based clearing
- **Auto-Optimization**: Performance-based tuning and analytics
- **Real-Time Monitoring**: Cache hit rates and performance metrics

#### PostgreSQL Database Integration
- **Persistent Storage**: PostgreSQL 13-alpine with data volumes
- **Advanced Schema**: Extended database with intelligent cache metadata
- **Query Optimization**: Database-driven cache warming strategies
- **Performance Tracking**: Query execution time monitoring

### Network Configuration
All services communicate via the `digame_network` Docker network, enabling secure inter-service communication and optimal cache performance.

## Common Commands

### Development Workflow

```bash
# Start all services in background
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend

# Rebuild and restart services
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Database Management

```bash
# Create database tables
docker-compose exec backend python scripts/create_tables.py

# Access PostgreSQL directly
docker-compose exec db psql -U digame_user -d digame_db

# Run database migrations (if available)
docker-compose exec backend alembic upgrade head
```

### Service-Specific Commands

```bash
# Execute commands in backend container
docker-compose exec backend bash
docker-compose exec backend python -c "print('Hello from backend')"

# Execute commands in frontend container
docker-compose exec frontend bash
docker-compose exec frontend npm run build

# View container status
docker-compose ps
```

## Docker Stack API Testing

### Comprehensive curl Commands

Use these curl commands to test and demonstrate the full Docker stack capabilities:

#### 1. Health Check Endpoints
```bash
# Basic health check
curl -s http://localhost:8000/health | jq .

# Root endpoint with i18n support
curl -s http://localhost:8000/ | jq .

# Frontend health (if available)
curl -s http://localhost:3000/api/health 2>/dev/null || echo "Frontend health endpoint not available"
```

#### 2. API Documentation Access
```bash
# Access OpenAPI documentation
curl -s http://localhost:8000/docs

# Get OpenAPI schema
curl -s http://localhost:8000/openapi.json | jq '.info'

# List all available endpoints
curl -s http://localhost:8000/openapi.json | jq '.paths | keys' | head -20
```

#### 3. Advanced Analytics Endpoints
```bash
# Note: These endpoints require authentication
# Advanced analytics health (requires auth)
curl -s http://localhost:8000/advanced-analytics/health

# Anomaly detection (requires auth)
curl -s http://localhost:8000/advanced-analytics/anomaly-detection

# Performance metrics (requires auth)
curl -s http://localhost:8000/advanced-analytics/performance-metrics

# ML models status (requires auth)
curl -s http://localhost:8000/advanced-analytics/ml-models-status
```

#### 4. Authentication Testing
```bash
# Register new user (if endpoint available)
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Login user (if endpoint available)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

#### 5. Database Connectivity Testing
```bash
# Test database connection through backend
docker-compose exec backend python -c "
from app.db import get_db
try:
    db = next(get_db())
    print('✅ Database connection successful')
    db.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"

# Direct PostgreSQL connection test
docker-compose exec db pg_isready -U digame_user -d digame_db
```

#### 6. Redis Cache Testing
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Check Redis info
docker-compose exec redis redis-cli info server

# Test cache operations
docker-compose exec redis redis-cli set test_key "Hello Redis"
docker-compose exec redis redis-cli get test_key
docker-compose exec redis redis-cli del test_key
```

#### 7. Service Discovery Testing
```bash
# Test inter-service communication
docker-compose exec backend curl -s http://frontend:3000/ || echo "Frontend not accessible from backend"
docker-compose exec frontend curl -s http://backend:8000/health || echo "Backend not accessible from frontend"

# Test database connectivity from backend
docker-compose exec backend nc -zv db 5432

# Test Redis connectivity from backend
docker-compose exec backend nc -zv redis 6379
```

#### 8. Performance and Monitoring
```bash
# Check container resource usage
docker stats --no-stream

# View service logs in real-time
docker-compose logs -f --tail=10 backend

# Check container health
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

#### 9. Platform Owner Features Testing
```bash
# Platform management endpoints (require Platform Owner auth)
curl -s http://localhost:8000/api/v1/platform/stats

# Platform analytics (require Platform Owner auth)
curl -s http://localhost:8000/platform-analytics/overview

# Admin endpoints (require admin auth)
curl -s http://localhost:8000/admin/system/stats
```

#### 10. Digital Twin and AI Features
```bash
# Digital twin endpoints (require auth)
curl -s http://localhost:8000/digital-twin/health

# Intelligence endpoints (require auth)
curl -s http://localhost:8000/intelligence/patterns

# Simulation endpoints (require auth)
curl -s http://localhost:8000/simulation/status
```

### Expected Responses

#### Successful Health Check
```json
{
  "status": "healthy",
  "service": "digame-api",
  "version": "1.0.0",
  "timestamp": "2025-07-03T19:43:52.062978+00:00"
}
```

#### Authentication Required Response
```json
{
  "detail": "Not authenticated"
}
```

#### Service Not Found Response
```json
{
  "detail": "Resource not found: /endpoint/path",
  "status_code": 404
}
```

## Environment Configuration

### Backend Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT token secret
- `ENVIRONMENT`: Development/production mode

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:8000)

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
**Error:** `Port already in use`
**Solution:** 
```bash
# Check what's using the port
lsof -i :3000  # or :8000, :5432, :6379

# Stop conflicting services or change ports in docker-compose.yml
```

#### 2. Database Connection Issues
**Error:** `Connection refused` or `Authentication failed`
**Solution:**
```bash
# Restart database service
docker-compose restart db

# Check database logs
docker-compose logs db

# Verify database is ready
docker-compose exec db pg_isready -U digame_user
```

#### 3. Frontend-Backend Connectivity
**Error:** `Network Error` or `CORS issues`
**Solution:**
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check frontend environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Restart frontend service
docker-compose restart frontend
```

#### 4. Missing Database Tables
**Error:** `relation "permissions" does not exist`
**Solution:**
```bash
# Create database tables
docker-compose exec backend python scripts/create_tables.py

# Restart backend to reinitialize
docker-compose restart backend
```

### Container Health Checks

```bash
# Check all container status
docker-compose ps

# Inspect specific container
docker inspect digame_backend

# View container resource usage
docker stats
```

## Security Considerations

### Development vs Production

#### Development (Current Setup)
- Default admin credentials
- Debug mode enabled
- Exposed database ports
- Basic security headers

#### Production Recommendations
1. **Change default passwords**
2. **Use environment-specific secrets**
3. **Enable HTTPS/TLS**
4. **Restrict database access**
5. **Update base images regularly**
6. **Implement proper logging**

### Image Security

Current vulnerability status:
- **0 Critical, 3 High, 0 Medium, 30 Low vulnerabilities**
- High vulnerabilities are in docker-language-server (development tool)

#### Security Hardening Steps

1. **Update base images:**
   ```dockerfile
   FROM python:3.11-slim-bullseye  # Use specific, updated base
   ```

2. **Scan for vulnerabilities:**
   ```bash
   # Install trivy
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy image digame_backend

   # Or use grype
   grype digame_backend
   ```

3. **Minimize attack surface:**
   ```dockerfile
   # Use non-root user
   USER app
   
   # Remove unnecessary packages
   RUN apt-get update && apt-get install -y --no-install-recommends \
       package-name && \
       apt-get clean && rm -rf /var/lib/apt/lists/*
   ```

## Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Volume Optimization
```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

## Monitoring and Logging

### Log Management
```bash
# Configure log rotation
docker-compose logs --tail=100 -f backend

# Export logs
docker-compose logs backend > backend.log
```

### Health Monitoring
```bash
# Check service health
docker-compose exec backend curl http://localhost:8000/health
docker-compose exec frontend curl http://localhost:3000/api/health
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U digame_user digame_db > backup.sql

# Restore backup
docker-compose exec -T db psql -U digame_user digame_db < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v digame_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Development Tips

### Hot Reloading
- Frontend: Automatically reloads on file changes
- Backend: Restart required for code changes

### Debugging
```bash
# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View real-time logs
docker-compose logs -f --tail=50 backend
```

### Testing
```bash
# Run backend tests
docker-compose exec backend python -m pytest

# Run frontend tests
docker-compose exec frontend npm test
```

## Support

### Getting Help
1. Check logs: `docker-compose logs [service-name]`
2. Verify service status: `docker-compose ps`
3. Test connectivity: `curl http://localhost:8000/health`
4. Review this documentation
5. Check GitHub issues or create new ones

### Useful Resources
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Intelligent Cache System (Node.js Backend)

### Overview

While the Docker stack runs the Python FastAPI backend, the project also includes a comprehensive intelligent cache system implemented in the Node.js backend (`/backend/src/`). This system showcases advanced caching capabilities that can be integrated into future Docker deployments.

### Intelligent Cache Features

#### 1. AI-Powered Cache Management
- **Predictive Caching**: Machine learning algorithms predict cache needs
- **Usage Pattern Learning**: Analyzes user behavior for optimal caching
- **Smart Invalidation**: Intelligent cache clearing with cascade effects
- **Auto-Optimization**: Performance-based cache tuning

#### 2. Advanced Cache Warming Strategies
- **Priority-Based Warming**: 6 different warming algorithms
- **Database-Driven Warming**: Real query execution for cache population
- **Scheduled Warming**: Automated cache warming at optimal times
- **Performance Metrics**: Success rate tracking and optimization

#### 3. Multi-Layer Caching Architecture
- **Memory Layer**: Fast in-memory caching for immediate access
- **Redis Layer**: Persistent distributed caching
- **Database Integration**: Seamless integration with PostgreSQL
- **Cache Analytics**: Real-time monitoring and insights

#### 4. Professional CLI Tools
- **Cache Management**: 9 comprehensive CLI commands
- **Database Operations**: Advanced database management tools
- **Analytics Reporting**: Performance metrics and health monitoring
- **Strategy Execution**: Manual and automated cache operations

### CLI Commands (Node.js Backend)

```bash
# Intelligent Cache Management
npm run cache:health          # Check cache system health
npm run cache:analytics       # View cache analytics
npm run cache:warm           # Execute cache warming
npm run cache:optimize       # Run auto-optimization
npm run cache:patterns       # Analyze usage patterns
npm run cache:strategies     # List warming strategies
npm run cache:invalidate     # Smart cache invalidation
npm run cache:monitor        # Real-time monitoring
npm run cache:test          # Test cache operations

# Database Management
npm run db:health           # Database health check
npm run db:migrate          # Run database migrations
npm run db:seed            # Seed database with sample data
npm run db:backup          # Create database backup
npm run db:restore         # Restore database backup
npm run db:analyze         # Analyze database performance
npm run db:optimize        # Optimize database queries
npm run db:monitor         # Monitor database metrics
npm run db:test           # Test database operations
```

### Integration with Docker

To integrate the intelligent cache system with the Docker stack:

1. **Hybrid Approach**: Run both backends simultaneously
   ```bash
   # Start Docker stack (Python backend)
   docker-compose up -d
   
   # Start Node.js backend with intelligent cache
   cd backend && npm start
   ```

2. **Cache Service Integration**: The Redis instance in Docker can be used by the Node.js cache system
   ```bash
   # Configure Node.js backend to use Docker Redis
   export REDIS_URL=redis://localhost:6379
   ```

3. **Database Sharing**: Both backends can share the PostgreSQL database
   ```bash
   # Configure Node.js backend to use Docker PostgreSQL
   export DATABASE_URL=postgresql://digame_user:digame_password@localhost:5433/digame_db
   ```

### Future Enhancements

The intelligent cache system demonstrates advanced capabilities that can be integrated into the Python FastAPI backend:

- **Cache Middleware**: FastAPI middleware for automatic caching
- **ML Integration**: Machine learning models for cache prediction
- **Analytics Dashboard**: Web-based cache monitoring interface
- **API Endpoints**: RESTful APIs for cache management
- **Real-time Updates**: WebSocket-based cache monitoring

This dual-backend approach showcases both production-ready enterprise features (Python FastAPI) and cutting-edge intelligent caching capabilities (Node.js), providing a comprehensive platform for digital professional development.
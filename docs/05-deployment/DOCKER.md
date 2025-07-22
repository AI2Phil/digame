# Docker User Guide for Digame Platform

## Overview

The Digame Digital Professional Twin Platform uses Docker Compose to orchestrate multiple services including backend (FastAPI), frontend (Next.js), PostgreSQL database, and Redis cache. This comprehensive setup provides a complete intelligent platform with advanced caching, analytics, and AI-powered features.


## Intro
When running Docker Compose, you need to use the **mapped port** on your local machine. 
Looking at your [`docker-compose.yml`](docker-compose.yml:8), the frontend service maps port 3000 inside the container to port **3001** on your host machine:


The URL `http://4823c8a27310:3000` won't work in your browser because `4823c8a27310` is the Docker container's internal hostname, which is only accessible from within the Docker network.

```yaml
frontend:
  ports:
    - "3001:3000"  # Host port 3001 -> Container port 3000
```

**To access your frontend application, use:**
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8001

The Docker Compose output shows:
- `Local: http://4823c8a27310:3000` ← This is the internal container URL (won't work in browser)
- `Network: http://172.18.0.3:3000` ← This is the internal Docker network IP (won't work in browser)

**The correct URLs for your browser are:**
- **Frontend Web App**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **Backend Health Check**: http://localhost:8001/health

Try opening http://localhost:3001 in your browser - that should display your frontend application correctly!



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

## Performance Testing Infrastructure

### Overview

The Digame platform includes a comprehensive performance testing infrastructure built with Locust, Docker Compose orchestration, and automated CI/CD integration. This system provides distributed load testing, Core Web Vitals monitoring, and automated performance validation.

### Performance Testing Architecture

#### Services Overview
- **Backend Service** (`digame-backend-perf`): FastAPI application on port 8000
- **Frontend Service** (`digame-frontend-perf`): Next.js application on port 3000
- **Locust Master** (`locust-master`): Load testing coordinator on port 8089
- **Locust Workers** (`locust-worker-1`, `locust-worker-2`): Distributed test execution
- **Prometheus** (`prometheus`): Metrics collection on port 9090
- **Grafana** (`grafana`): Performance dashboards on port 3001

#### Docker Compose Configuration

The performance testing uses [`docker-compose.performance.yml`](docker-compose.performance.yml:1) for complete service orchestration:

```yaml
# Key features:
- Health checks for all services
- Proper service dependencies
- Docker networking with digame-perf-network
- Volume persistence for monitoring data
- Environment-based configuration
```

### Docker Compose Compatibility

#### Modern Docker Compose Syntax

The infrastructure supports both legacy and modern Docker Compose installations:

**Legacy (docker-compose):**
```bash
docker-compose -f docker-compose.performance.yml up -d
```

**Modern (docker compose):**
```bash
docker compose -f docker-compose.performance.yml up -d
```

#### Automatic Command Detection

The [`scripts/run-performance-tests.sh`](scripts/run-performance-tests.sh:1) script automatically detects available Docker Compose commands:

```bash
# Automatic detection logic
if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' found"
    exit 1
fi
```

### Performance Testing Usage

#### Interactive Deployment

Use the interactive script for guided deployment:

```bash
./scripts/run-performance-tests.sh
```

**Menu Options:**
1. **Deploy Full Stack** - Complete infrastructure with monitoring
2. **Deploy Frontend Only** - Lightweight frontend-only testing
3. **View Service Status** - Check running services
4. **View Logs** - Real-time log monitoring
5. **Stop Services** - Clean shutdown
6. **Performance Report** - Generate test results

#### Direct Docker Compose

For direct control over the infrastructure:

```bash
# Start all services
docker compose -f docker-compose.performance.yml up -d

# Check service health
docker compose -f docker-compose.performance.yml ps

# View logs
docker compose -f docker-compose.performance.yml logs -f

# Stop services
docker compose -f docker-compose.performance.yml down
```

#### Service Access Points

- **Locust Web UI**: http://localhost:8089
- **Prometheus Metrics**: http://localhost:9090
- **Grafana Dashboards**: http://localhost:3001 (admin/admin)
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000

### Health Check System

#### Service Health Validation

All services include comprehensive health checks:

```bash
# Backend health check
curl -s http://localhost:8000/health | jq .

# Frontend health check  
curl -s http://localhost:3000/api/health | jq .

# Locust master health
curl -s http://localhost:8089/stats/requests | jq .
```

#### Health Check Endpoints

**Backend Health Response:**
```json
{
  "status": "healthy",
  "service": "digame-api",
  "version": "1.0.0",
  "timestamp": "2025-07-12T13:06:00.000Z"
}
```

**Frontend Health Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-12T13:06:00.000Z",
  "uptime": 120.5
}
```

### Performance Testing Configurations

#### Full-Stack Testing

Tests both frontend and backend services with realistic user scenarios:

```python
# tests/performance/locustfile.py
class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # User authentication and setup
        
    @task(3)
    def view_homepage(self):
        # Frontend page load testing
        
    @task(2)
    def api_health_check(self):
        # Backend API testing
```

#### Frontend-Only Testing

Lightweight testing focused on frontend performance:

```python
# tests/performance/frontend-only.py
class FrontendUser(HttpUser):
    wait_time = between(1, 2)
    
    @task
    def load_pages(self):
        # Core Web Vitals testing
        # Page load performance
        # Resource loading optimization
```

### CI/CD Integration

#### GitHub Actions Workflow

Automated performance testing in CI/CD pipeline:

```yaml
# .github/workflows/performance-testing.yml
name: Performance Testing
on: [push, pull_request]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Performance Tests
        run: |
          docker compose -f docker-compose.performance.yml up -d
          # Wait for services and run tests
```

#### Performance Thresholds

Automated validation with configurable thresholds:

```bash
# Default thresholds
MAX_RESPONSE_TIME=2000ms
MIN_SUCCESS_RATE=95%
MAX_ERROR_RATE=5%
```

### Build Optimization

#### Docker Build Context Optimization

Reduced build context size from 125MB+ to 3.21MB:

```dockerfile
# frontend/.dockerignore
node_modules/
.next/
.git/
*.log
coverage/
.nyc_output/
```

#### Multi-Stage Builds

Optimized Docker images for production:

```dockerfile
# Frontend Dockerfile
FROM node:22-alpine AS deps
# Install dependencies

FROM node:22-alpine AS builder  
# Build application

FROM node:22-alpine AS runner
# Production runtime
```

### Monitoring and Analytics

#### Prometheus Metrics Collection

Comprehensive metrics collection:

```yaml
# tests/performance/prometheus.yml
scrape_configs:
  - job_name: 'locust'
    static_configs:
      - targets: ['locust-master:8089']
  - job_name: 'backend'
    static_configs:
      - targets: ['digame-backend-perf:8000']
```

#### Grafana Dashboards

Pre-configured dashboards for:
- **Load Testing Metrics**: Request rates, response times, error rates
- **System Performance**: CPU, memory, network usage
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Service Health**: Uptime, availability, error tracking

### Troubleshooting Performance Testing

#### Common Issues and Solutions

**1. Docker Compose Command Not Found**
```bash
# Error: docker-compose: command not found
# Solution: Use modern Docker Compose syntax
docker compose -f docker-compose.performance.yml up -d
```

**2. Service Connection Refused**
```bash
# Error: ConnectionRefusedError
# Solution: Verify service health and networking
docker compose -f docker-compose.performance.yml ps
curl http://localhost:8000/health
```

**3. Build Context Too Large**
```bash
# Error: Build context size exceeds limits
# Solution: Verify .dockerignore is properly configured
ls -la frontend/.dockerignore
```

**4. Port Conflicts**
```bash
# Error: Port already in use
# Solution: Check for conflicting services
lsof -i :8089  # Locust
lsof -i :9090  # Prometheus
lsof -i :3001  # Grafana
```

#### Performance Testing Validation

```bash
# Validate complete infrastructure
./scripts/run-performance-tests.sh

# Check service status
docker compose -f docker-compose.performance.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Monitor real-time metrics
docker compose -f docker-compose.performance.yml logs -f locust-master

# Generate performance report
curl -s http://localhost:8089/stats/requests | jq '.stats[] | {name: .name, requests: .num_requests, failures: .num_failures, avg_response_time: .avg_response_time}'
```

### Performance Testing Best Practices

#### Load Testing Strategy

1. **Baseline Testing**: Establish performance baselines
2. **Stress Testing**: Identify breaking points
3. **Spike Testing**: Validate sudden load handling
4. **Volume Testing**: Test with realistic data volumes
5. **Endurance Testing**: Long-running stability tests

#### Monitoring Strategy

1. **Real-time Monitoring**: Live performance dashboards
2. **Alerting**: Automated threshold notifications
3. **Historical Analysis**: Performance trend tracking
4. **Capacity Planning**: Resource utilization forecasting
5. **Performance Budgets**: Automated performance validation

This performance testing infrastructure provides enterprise-grade load testing capabilities with comprehensive monitoring, automated CI/CD integration, and modern Docker Compose compatibility for the Digame platform.
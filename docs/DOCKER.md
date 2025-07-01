# Docker User Guide for Digame Platform

## Overview

The Digame Digital Professional Twin Platform uses Docker Compose to orchestrate multiple services including backend (FastAPI), frontend (Next.js), PostgreSQL database, and Redis cache.

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

### Network Configuration
All services communicate via the `digame_network` Docker network, enabling secure inter-service communication.

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
docker-compose exec backend python create_tables.py

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
docker-compose exec backend python create_tables.py

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
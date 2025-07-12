# Performance Testing with Locust

This directory contains Locust performance testing configurations for validating Core Web Vitals optimizations in the Digame platform.

## Overview

The performance tests are designed to validate:
- **Largest Contentful Paint (LCP)** optimization
- **First Input Delay (FID)** responsiveness
- **Cumulative Layout Shift (CLS)** prevention
- **First Contentful Paint (FCP)** optimization
- **Time to First Byte (TTFB)** optimization

## Test Scenarios

### User Classes

1. **DigameUser** - Standard user behavior simulation
2. **MobileUser** - Mobile-specific testing with slower connections
3. **PerformanceTestUser** - Focused Core Web Vitals validation
4. **Load Variants** - Light, Medium, Heavy, Mobile, and Performance loads

## Running Tests

### Prerequisites

1. **Install Locust**:
   ```bash
   pip install locust==2.17.0
   ```

2. **Ensure Target Service is Running**:
   - For frontend-only testing: `npm run dev` (port 3000)
   - For full-stack testing: Backend on port 8000, Frontend on port 3000

### Local Development Testing

#### Frontend Only (Next.js on port 3000)
```bash
# Start frontend
cd frontend && npm run dev

# Run performance tests against frontend
locust -f tests/performance/locustfile.py --headless -u 50 -r 5 -t 60s --host http://localhost:3000
```

#### Full Stack Testing (Backend + Frontend)
```bash
# Start backend (FastAPI on port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start frontend (Next.js on port 3000)
cd frontend && npm run dev

# Run tests against backend
locust -f tests/performance/locustfile.py --headless -u 100 -r 10 -t 300s --host http://localhost:8000
```

### Docker Environment Testing

#### Using Docker Compose
```bash
# Start services with docker-compose
docker-compose up -d

# Run tests against containerized services
locust -f tests/performance/locustfile.py --headless -u 100 -r 10 -t 300s --host http://backend:8000
```

#### Individual Docker Containers
```bash
# Build and run backend container
docker build -f Dockerfile.prod -t digame-backend .
docker run -p 8000:8000 digame-backend

# Build and run frontend container
docker build -f frontend/Dockerfile.prod -t digame-frontend frontend/
docker run -p 3000:3000 digame-frontend

# Run tests
locust -f tests/performance/locustfile.py --headless -u 100 -r 10 -t 300s --host http://localhost:8000
```

### CI/CD Pipeline Testing

For GitHub Actions or other CI environments:

```yaml
# Example GitHub Actions step
- name: Run Performance Tests
  run: |
    # Start services in background
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Run performance tests
    locust -f tests/performance/locustfile.py \
      --headless \
      -u 100 \
      -r 10 \
      -t 300s \
      --host http://backend:8000 \
      --html performance-report.html
    
    # Stop services
    docker-compose down
```

## Test Parameters

### Load Testing Parameters

| Parameter | Description | Recommended Values |
|-----------|-------------|-------------------|
| `-u, --users` | Number of concurrent users | 50-500 |
| `-r, --spawn-rate` | Users spawned per second | 5-20 |
| `-t, --run-time` | Test duration | 60s-600s |
| `--host` | Target host URL | http://localhost:3000 or http://localhost:8000 |

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | ≤ 800ms | 800ms - 1.8s | > 1.8s |

## Troubleshooting

### Common Issues

#### Connection Refused Errors
```
ConnectionRefusedError(111, 'Connection refused')
```

**Causes & Solutions:**
1. **Target service not running**: Start your backend/frontend service
2. **Wrong host/port**: Verify the `--host` parameter matches your service
3. **Docker networking**: Use service names instead of localhost in containers
4. **Firewall/network issues**: Check network connectivity

#### Service Discovery in Docker
```bash
# Check running containers
docker ps

# Check container networks
docker network ls
docker network inspect <network_name>

# Test connectivity between containers
docker exec -it <container_name> curl http://backend:8000/health
```

#### Health Check Verification
```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend availability
curl http://localhost:3000

# Test with verbose output
curl -v http://localhost:8000/api/user/profile
```

### Performance Optimization Validation

The tests automatically validate:
- Response times under load
- Error rates during peak usage
- Resource utilization patterns
- Core Web Vitals metrics under stress

### Reporting

Locust generates detailed reports including:
- Request statistics
- Response time distributions
- Failure analysis
- Performance trends over time

Access the web UI at `http://localhost:8089` when running Locust interactively.

## Integration with CI/CD

The performance tests are designed to integrate with:
- GitHub Actions workflows
- Docker-based deployments
- Kubernetes environments
- Monitoring and alerting systems

Results can be exported in various formats for integration with performance monitoring tools.
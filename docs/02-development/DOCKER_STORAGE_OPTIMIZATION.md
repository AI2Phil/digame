# Docker Storage Optimization and Disk Space Management

## Issue Summary

Docker builds are failing due to insufficient disk space during image export/import operations, specifically when processing large GPU-related binaries like `libcufft.so.11`.

## Problem Analysis

### Root Cause
- **Disk Space Exhaustion**: Docker layer storage volume is full
- **Large Binary Files**: GPU/CUDA libraries (3GB+) consuming excessive space
- **Build Process Failure**: Occurs during image export/import phase
- **Not a Code Issue**: This is a host system/CI environment infrastructure problem

### Symptoms
```
Error during Docker build: No space left on device
Failed processing: libcufft.so.11 (large GPU binary)
Docker layer size: 3GB+
Build fails at export/import stage
```

## Immediate Solutions

### ✅ 1. Emergency Disk Space Cleanup

**Quick Docker Cleanup:**
```bash
# Remove all unused Docker data (CAUTION: This removes everything unused)
docker system prune -a --volumes -f

# Check disk usage
df -h

# Check Docker-specific usage
docker system df
```

**Selective Cleanup (Safer):**
```bash
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f
```

### ✅ 2. Docker Image Size Optimization

**Multi-Stage Build Optimization:**
```dockerfile
# Use multi-stage builds to reduce final image size
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Copy only necessary files from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Remove unnecessary packages
RUN apt-get autoremove -y && apt-get clean
```

**Lightweight Base Image Options:**
```dockerfile
# Option 1: Slim variant (recommended)
FROM python:3.11-slim

# Option 2: Alpine (ultra-minimal, but potential musl/glibc issues)
FROM python:3.11-alpine

# Option 3: Distroless (Google's minimal images)
FROM gcr.io/distroless/python3-debian11
```

### ✅ 3. Remove GPU Dependencies (If Not Required)

**Check if GPU libraries are necessary:**
```dockerfile
# Before: Heavy GPU dependencies
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# After: CPU-only versions (much smaller)
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**Requirements.txt optimization:**
```txt
# Remove GPU-specific packages if not needed:
# tensorflow-gpu  # Remove if GPU not required
# torch[cuda]     # Use torch[cpu] instead
# cupy-cuda11x    # Remove if not using CUDA

# Use CPU versions:
tensorflow-cpu>=2.13.0
torch>=2.0.0+cpu
```

## CI/CD Environment Solutions

### ✅ GitHub Actions Optimization

**Disk Space Management:**
```yaml
name: Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Free Disk Space
      run: |
        # Remove unnecessary packages
        sudo apt-get remove -y '^dotnet-.*'
        sudo apt-get remove -y '^llvm-.*'
        sudo apt-get remove -y 'php.*'
        sudo apt-get autoremove -y
        sudo apt-get clean
        
        # Clean Docker
        docker system prune -a -f
        
        # Check available space
        df -h
    
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      with:
        driver-opts: |
          image=moby/buildkit:latest
          network=host
    
    - name: Build with cache
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile
        push: false
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64
```

**Cache Strategy:**
```yaml
    - name: Cache Docker layers
      uses: actions/cache@v3
      with:
        path: /tmp/.buildx-cache
        key: ${{ runner.os }}-buildx-${{ github.sha }}
        restore-keys: |
          ${{ runner.os }}-buildx-
    
    - name: Cache node_modules
      uses: actions/cache@v3
      with:
        path: frontend/node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('frontend/package-lock.json') }}
```

### ✅ Alternative CI Solutions

**For Large Builds:**
1. **Self-hosted runners** with larger disk quotas
2. **BuildKit remote builders** for distributed builds
3. **Registry caching** to avoid rebuilding layers
4. **Staged deployments** with smaller, focused images

## Docker Build Optimization Strategies

### ✅ 1. .dockerignore Optimization

**Create/Update `.dockerignore`:**
```dockerignore
# Development files
node_modules/
npm-debug.log*
.git/
.gitignore
README.md
Dockerfile*
.dockerignore

# Test files
test/
tests/
*.test.js
coverage/

# Documentation
docs/
*.md

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Large unnecessary files
*.log
*.tmp
*.cache
```

### ✅ 2. Layer Optimization

**Combine RUN commands:**
```dockerfile
# Before: Multiple layers
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip
RUN apt-get clean

# After: Single layer
RUN apt-get update && \
    apt-get install -y python3 pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

**Use --no-cache for pip:**
```dockerfile
# Prevents pip cache from being stored in image
RUN pip install --no-cache-dir -r requirements.txt
```

### ✅ 3. Build Context Optimization

**Minimize build context:**
```bash
# Check build context size
docker build --no-cache --progress=plain .

# Use specific context
docker build -f Dockerfile.prod --context ./app .
```

## Monitoring and Prevention

### ✅ Regular Maintenance

**Weekly Cleanup Script:**
```bash
#!/bin/bash
# docker-cleanup.sh

echo "Starting Docker cleanup..."

# Remove stopped containers
docker container prune -f

# Remove unused images (keep last 24h)
docker image prune -a --filter "until=24h" -f

# Remove unused volumes
docker volume prune -f

# Show remaining usage
echo "Remaining Docker usage:"
docker system df

echo "Disk usage:"
df -h
```

**Automated Monitoring:**
```bash
# Add to crontab for weekly execution
0 2 * * 0 /path/to/docker-cleanup.sh
```

### ✅ Build Size Monitoring

**Check image sizes:**
```bash
# List images by size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k3 -h

# Analyze specific image layers
docker history <image-name>

# Use dive tool for detailed analysis
dive <image-name>
```

## Emergency Recovery

### ✅ If Build Completely Fails

**Immediate Actions:**
1. **Stop all containers:** `docker stop $(docker ps -aq)`
2. **Remove all containers:** `docker rm $(docker ps -aq)`
3. **Remove all images:** `docker rmi $(docker images -q) -f`
4. **Clean system:** `docker system prune -a --volumes -f`
5. **Restart Docker daemon:** `sudo systemctl restart docker`

**Alternative Build Approach:**
```bash
# Build with reduced parallelism
docker build --memory=2g --cpus=1 .

# Build without cache
docker build --no-cache .

# Build specific stage only
docker build --target=production .
```

## Best Practices Summary

### ✅ Image Design
- Use multi-stage builds
- Choose appropriate base images
- Minimize layers and combine RUN commands
- Remove unnecessary files in same layer

### ✅ Dependency Management
- Use CPU-only versions when possible
- Pin specific versions to avoid surprises
- Remove dev dependencies in production

### ✅ CI/CD Integration
- Implement cache strategies
- Monitor disk usage
- Use cleanup steps
- Consider self-hosted runners for large builds

### ✅ Monitoring
- Regular cleanup schedules
- Size monitoring and alerts
- Build time optimization
- Resource usage tracking

This comprehensive approach ensures sustainable Docker builds while maintaining functionality and preventing future disk space issues.
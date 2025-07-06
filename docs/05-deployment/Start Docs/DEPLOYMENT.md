# Digital Twin Platform - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Digital Twin Platform to production using Kubernetes orchestration with enterprise-grade monitoring, security, and scalability features.

## Prerequisites

### System Requirements
- Kubernetes cluster (v1.24+)
- kubectl configured with cluster access
- Helm 3.x installed
- Docker registry access
- SSL certificates for domains
- Minimum 16GB RAM, 8 CPU cores per node

### Required Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## Configuration

### 1. Environment Variables

Create a `.env.production` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@postgresql-service:5432/digital_twin_platform
REDIS_URL=redis://redis-service:6379

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# External Services
OPENAI_API_KEY=your-openai-api-key
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=your-smtp-password

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=your-grafana-password

# Domain Configuration
API_DOMAIN=api.digitaltwin.example.com
APP_DOMAIN=app.digitaltwin.example.com
GRAFANA_DOMAIN=grafana.digitaltwin.example.com
```

### 2. SSL Certificates

Obtain SSL certificates for your domains:

```bash
# Using Let's Encrypt with certbot
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
  -d api.digitaltwin.example.com \
  -d app.digitaltwin.example.com \
  -d grafana.digitaltwin.example.com

# Create Kubernetes secrets
kubectl create secret tls digital-twin-tls \
  --cert=/etc/letsencrypt/live/digitaltwin.example.com/fullchain.pem \
  --key=/etc/letsencrypt/live/digitaltwin.example.com/privkey.pem \
  -n digital-twin-platform
```

## Deployment Steps

### 1. Build and Push Docker Images

```bash
# Set your Docker registry
export DOCKER_REGISTRY="your-registry.com"
export IMAGE_TAG="1.0.0"

# Build API image
docker build -t ${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG} -f Dockerfile.api .
docker push ${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG}

# Build frontend image
docker build -t ${DOCKER_REGISTRY}/digital-twin-frontend:${IMAGE_TAG} -f Dockerfile.frontend .
docker push ${DOCKER_REGISTRY}/digital-twin-frontend:${IMAGE_TAG}
```

### 2. Update Kubernetes Manifests

Update image references in deployment files:

```bash
# Update API deployment
sed -i "s|digital-twin-platform/api:1.0.0|${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG}|g" k8s/digital-twin-api-deployment.yaml

# Update frontend deployment
sed -i "s|digital-twin-platform/frontend:1.0.0|${DOCKER_REGISTRY}/digital-twin-frontend:${IMAGE_TAG}|g" k8s/ingress.yaml
```

### 3. Deploy to Kubernetes

Run the automated deployment script:

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

Or deploy manually:

```bash
# Create namespace and apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/security.yaml
kubectl apply -f k8s/configmaps.yaml

# Deploy databases
kubectl apply -f k8s/database-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgresql -n digital-twin-platform --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n digital-twin-platform --timeout=300s

# Deploy monitoring stack
kubectl apply -f k8s/monitoring-stack.yaml

# Wait for monitoring to be ready
kubectl wait --for=condition=ready pod -l app=prometheus -n digital-twin-platform --timeout=300s

# Deploy main application
kubectl apply -f k8s/digital-twin-api-deployment.yaml

# Deploy ingress and frontend
kubectl apply -f k8s/ingress.yaml
```

### 4. Database Migration

Run database migrations:

```bash
# Get API pod name
API_POD=$(kubectl get pods -n digital-twin-platform -l app=digital-twin-api -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -n digital-twin-platform ${API_POD} -- alembic upgrade head
```

### 5. Verify Deployment

Check all components are running:

```bash
# Check pod status
kubectl get pods -n digital-twin-platform

# Check services
kubectl get services -n digital-twin-platform

# Check ingress
kubectl get ingress -n digital-twin-platform

# Check logs
kubectl logs -n digital-twin-platform -l app=digital-twin-api --tail=50
```

## Monitoring and Observability

### Accessing Monitoring Dashboards

#### Prometheus
```bash
# Port forward to access Prometheus
kubectl port-forward -n digital-twin-platform svc/prometheus-service 9090:9090

# Access at http://localhost:9090
```

#### Grafana
```bash
# Port forward to access Grafana
kubectl port-forward -n digital-twin-platform svc/grafana-service 3000:3000

# Access at http://localhost:3000
# Default credentials: admin / your-grafana-password
```

### Key Metrics to Monitor

1. **Application Metrics**
   - API response times
   - Request rates
   - Error rates
   - Active WebSocket connections

2. **Infrastructure Metrics**
   - CPU and memory usage
   - Pod restart counts
   - Network traffic
   - Storage utilization

3. **Database Metrics**
   - Connection pool usage
   - Query performance
   - Replication lag
   - Storage usage

### Alerting Rules

The deployment includes pre-configured alerting rules for:

- High API error rates (>5%)
- High response times (>2s)
- Pod restart loops
- High memory usage (>80%)
- Database connection issues
- SSL certificate expiration

## Security Configuration

### Network Policies

The deployment includes network policies that:
- Restrict pod-to-pod communication
- Allow only necessary ingress traffic
- Block egress to external networks (except allowed services)

### RBAC Configuration

Role-based access control is configured with:
- Service accounts for each component
- Minimal required permissions
- Cluster roles for monitoring access

### Secrets Management

Sensitive data is stored in Kubernetes secrets:
- Database credentials
- API keys
- SSL certificates
- JWT secrets

## Scaling and Performance

### Horizontal Pod Autoscaling

The deployment includes HPA configurations:

```yaml
# API autoscaling
minReplicas: 3
maxReplicas: 10
targetCPUUtilization: 70%
targetMemoryUtilization: 80%

# Frontend autoscaling
minReplicas: 2
maxReplicas: 6
targetCPUUtilization: 60%
```

### Performance Tuning

#### Database Optimization
```sql
-- PostgreSQL configuration
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 200
```

#### Redis Configuration
```conf
# Redis configuration
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Backup and Disaster Recovery

### Database Backups

Automated daily backups are configured:

```bash
# Manual backup
kubectl exec -n digital-twin-platform postgresql-0 -- pg_dump -U user digital_twin_platform > backup.sql

# Restore from backup
kubectl exec -i -n digital-twin-platform postgresql-0 -- psql -U user digital_twin_platform < backup.sql
```

### Persistent Volume Snapshots

Configure volume snapshots for data protection:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgresql-snapshot
spec:
  source:
    persistentVolumeClaimName: postgresql-storage
```

## Troubleshooting

### Common Issues

#### 1. Pod Startup Failures
```bash
# Check pod events
kubectl describe pod <pod-name> -n digital-twin-platform

# Check logs
kubectl logs <pod-name> -n digital-twin-platform --previous
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
kubectl exec -n digital-twin-platform <api-pod> -- pg_isready -h postgresql-service -p 5432

# Check database logs
kubectl logs -n digital-twin-platform postgresql-0
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
kubectl get secret digital-twin-tls -n digital-twin-platform -o yaml

# Verify certificate expiration
openssl x509 -in cert.pem -text -noout | grep "Not After"
```

#### 4. High Memory Usage
```bash
# Check memory usage by pod
kubectl top pods -n digital-twin-platform

# Check resource limits
kubectl describe pod <pod-name> -n digital-twin-platform | grep -A 5 "Limits"
```

### Log Analysis

#### Centralized Logging
```bash
# View all application logs
kubectl logs -n digital-twin-platform -l app=digital-twin-api --tail=100 -f

# Filter error logs
kubectl logs -n digital-twin-platform -l app=digital-twin-api | grep ERROR

# Export logs for analysis
kubectl logs -n digital-twin-platform -l app=digital-twin-api --since=1h > app-logs.txt
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review monitoring dashboards
   - Check for security updates
   - Verify backup integrity

2. **Monthly**
   - Update container images
   - Review resource usage
   - Clean up old logs

3. **Quarterly**
   - Security audit
   - Performance review
   - Disaster recovery testing

### Update Procedures

#### Rolling Updates
```bash
# Update API deployment
kubectl set image deployment/digital-twin-api-deployment \
  digital-twin-api=${DOCKER_REGISTRY}/digital-twin-api:${NEW_TAG} \
  -n digital-twin-platform

# Monitor rollout
kubectl rollout status deployment/digital-twin-api-deployment -n digital-twin-platform

# Rollback if needed
kubectl rollout undo deployment/digital-twin-api-deployment -n digital-twin-platform
```

## Support and Documentation

### Health Checks

The platform includes comprehensive health checks:

- **API Health**: `GET /health`
- **Database Health**: `GET /health/db`
- **Redis Health**: `GET /health/cache`
- **WebSocket Health**: `GET /health/ws`

### API Documentation

Access the interactive API documentation:
- Swagger UI: `https://api.digitaltwin.example.com/docs`
- ReDoc: `https://api.digitaltwin.example.com/redoc`

### Support Contacts

For production support:
- **Technical Issues**: tech-support@example.com
- **Security Issues**: security@example.com
- **Emergency**: +1-555-SUPPORT

---

## Conclusion

This deployment guide provides a comprehensive approach to deploying the Digital Twin Platform in a production environment with enterprise-grade features including monitoring, security, scalability, and disaster recovery capabilities.

The platform is now ready for production use with:
- ✅ Kubernetes orchestration
- ✅ Comprehensive monitoring
- ✅ Enterprise security
- ✅ High availability
- ✅ Automated scaling
- ✅ Backup and recovery
- ✅ Performance optimization

For additional support or customization requirements, please refer to the technical documentation or contact the support team.
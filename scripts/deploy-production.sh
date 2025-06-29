#!/bin/bash

# Digital Twin Platform - Production Deployment Script
# Phase 5: Production Deployment with Kubernetes Orchestration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="digital-twin-platform"
KUBECTL_CONTEXT="production"
DOCKER_REGISTRY="your-registry.com"
IMAGE_TAG="1.0.0"

echo -e "${BLUE}🚀 Digital Twin Platform - Production Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed${NC}"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ helm is not installed${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Set kubectl context
echo -e "${YELLOW}🔧 Setting kubectl context to ${KUBECTL_CONTEXT}...${NC}"
kubectl config use-context ${KUBECTL_CONTEXT}

# Build and push Docker images
echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"

# Build API image
echo -e "${BLUE}Building digital-twin-api image...${NC}"
docker build -t ${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG} -f Dockerfile.api .
docker push ${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG}

# Build frontend image
echo -e "${BLUE}Building digital-twin-frontend image...${NC}"
docker build -t ${DOCKER_REGISTRY}/digital-twin-frontend:${IMAGE_TAG} -f Dockerfile.frontend .
docker push ${DOCKER_REGISTRY}/digital-twin-frontend:${IMAGE_TAG}

echo -e "${GREEN}✅ Docker images built and pushed${NC}"

# Create namespace and apply configurations
echo -e "${YELLOW}🏗️  Creating namespace and applying configurations...${NC}"

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/security.yaml
kubectl apply -f k8s/configmaps.yaml

echo -e "${GREEN}✅ Namespace and configurations applied${NC}"

# Deploy database and cache
echo -e "${YELLOW}💾 Deploying database and cache...${NC}"

kubectl apply -f k8s/database-deployment.yaml

# Wait for database to be ready
echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgresql -n ${NAMESPACE} --timeout=300s

echo -e "${BLUE}Waiting for Redis to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s

echo -e "${GREEN}✅ Database and cache deployed${NC}"

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"

kubectl run migration-job --image=${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG} \
  --restart=Never \
  --rm -i \
  --env="DATABASE_URL=$(kubectl get secret digital-twin-secrets -n ${NAMESPACE} -o jsonpath='{.data.database-url}' | base64 -d)" \
  --command -- alembic upgrade head

echo -e "${GREEN}✅ Database migrations completed${NC}"

# Deploy monitoring stack
echo -e "${YELLOW}📊 Deploying monitoring stack...${NC}"

kubectl apply -f k8s/monitoring-stack.yaml

# Wait for monitoring to be ready
echo -e "${BLUE}Waiting for Prometheus to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=prometheus -n ${NAMESPACE} --timeout=300s

echo -e "${BLUE}Waiting for Grafana to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=grafana -n ${NAMESPACE} --timeout=300s

echo -e "${GREEN}✅ Monitoring stack deployed${NC}"

# Deploy main application
echo -e "${YELLOW}🚀 Deploying main application...${NC}"

# Update image tags in deployment
sed -i "s|digital-twin-platform/api:1.0.0|${DOCKER_REGISTRY}/digital-twin-api:${IMAGE_TAG}|g" k8s/digital-twin-api-deployment.yaml

kubectl apply -f k8s/digital-twin-api-deployment.yaml

# Wait for API to be ready
echo -e "${BLUE}Waiting for Digital Twin API to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=digital-twin-api -n ${NAMESPACE} --timeout=300s

echo -e "${GREEN}✅ Main application deployed${NC}"

# Deploy ingress and frontend
echo -e "${YELLOW}🌐 Deploying ingress and frontend...${NC}"

kubectl apply -f k8s/ingress.yaml

# Wait for frontend to be ready
echo -e "${BLUE}Waiting for frontend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=digital-twin-frontend -n ${NAMESPACE} --timeout=300s

echo -e "${GREEN}✅ Ingress and frontend deployed${NC}"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check all pods are running
echo -e "${BLUE}Checking pod status...${NC}"
kubectl get pods -n ${NAMESPACE}

# Check services
echo -e "${BLUE}Checking services...${NC}"
kubectl get services -n ${NAMESPACE}

# Check ingress
echo -e "${BLUE}Checking ingress...${NC}"
kubectl get ingress -n ${NAMESPACE}

# Health checks
echo -e "${BLUE}Running health checks...${NC}"

# API health check
API_POD=$(kubectl get pods -n ${NAMESPACE} -l app=digital-twin-api -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ${NAMESPACE} ${API_POD} -- curl -f http://localhost:8000/health || {
    echo -e "${RED}❌ API health check failed${NC}"
    exit 1
}

# Database health check
DB_POD=$(kubectl get pods -n ${NAMESPACE} -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ${NAMESPACE} ${DB_POD} -- pg_isready || {
    echo -e "${RED}❌ Database health check failed${NC}"
    exit 1
}

# Redis health check
REDIS_POD=$(kubectl get pods -n ${NAMESPACE} -l app=redis -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ${NAMESPACE} ${REDIS_POD} -- redis-cli ping || {
    echo -e "${RED}❌ Redis health check failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ All health checks passed${NC}"

# Display access information
echo -e "${YELLOW}📋 Deployment Summary${NC}"
echo -e "${YELLOW}===================${NC}"

INGRESS_IP=$(kubectl get ingress digital-twin-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo -e "${GREEN}🎉 Digital Twin Platform deployed successfully!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  API: https://api.digitaltwin.example.com"
echo -e "  App: https://app.digitaltwin.example.com"
echo -e "  Grafana: https://grafana.digitaltwin.example.com"
echo ""
echo -e "${BLUE}Monitoring:${NC}"
echo -e "  Prometheus: kubectl port-forward -n ${NAMESPACE} svc/prometheus-service 9090:9090"
echo -e "  Grafana: kubectl port-forward -n ${NAMESPACE} svc/grafana-service 3000:3000"
echo ""
echo -e "${BLUE}Database Access:${NC}"
echo -e "  PostgreSQL: kubectl port-forward -n ${NAMESPACE} svc/postgresql-service 5432:5432"
echo -e "  Redis: kubectl port-forward -n ${NAMESPACE} svc/redis-service 6379:6379"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  API Logs: kubectl logs -n ${NAMESPACE} -l app=digital-twin-api -f"
echo -e "  All Logs: kubectl logs -n ${NAMESPACE} --all-containers=true -f"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "  1. Update DNS records to point to ${INGRESS_IP}"
echo -e "  2. Configure SSL certificates"
echo -e "  3. Set up backup procedures"
echo -e "  4. Configure monitoring alerts"
echo -e "  5. Review security settings"
echo ""
echo -e "${GREEN}🚀 Production deployment completed successfully!${NC}"
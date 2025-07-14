# 🛠️ Digame Platform CLI User Guide (v2.0)

Welcome to the **Digame Platform CLI Tools** - comprehensive command-line interfaces for database management, intelligent caching, CI/CD operations, and system administration with enhanced production-ready capabilities.

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Database CLI](#-database-cli)
- [Intelligent Cache CLI](#-intelligent-cache-cli)
- [CI/CD Integration CLI](#-cicd-integration-cli)
- [Production Operations CLI](#-production-operations-cli)
- [Quick Reference](#-quick-reference)
- [Advanced Usage](#-advanced-usage)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

## 🎯 Overview

The Digame platform provides four powerful CLI tool categories:

1. **Database CLI** (`npm run db:*`) - Database management, migration, and health monitoring
2. **Intelligent Cache CLI** (`npm run icache:*`) - Advanced caching operations and analytics
3. **CI/CD Integration CLI** (`npm run ci:*`) - Pipeline validation, deployment, and environment management
4. **Production Operations CLI** (`npm run prod:*`) - Production deployment, monitoring, and maintenance

All tools are designed for developers, system administrators, DevOps teams, and production environments managing Digame platform deployments.

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 22.x or higher *(Updated from 18.x)*
- **npm**: 10.0 or higher
- **Python**: 3.11.x *(Downgraded from 3.13 for compatibility)*
- **Docker**: 24.x or higher *(for containerized operations)*
- **Kubernetes CLI** (kubectl): Latest version *(for K8s deployments)*
- **Working Directory**: Must be in `/backend` directory

### Enhanced Environment Setup
```bash
# Navigate to backend directory
cd digame/backend

# Verify Node.js version compatibility
node --version  # Should show v22.x.x

# Verify Python version compatibility
python --version  # Should show 3.11.x

# Ensure dependencies are installed with zero vulnerabilities
npm ci  # Uses npm ci for production reliability

# Verify CLI tools are available
npm run db:help
npm run icache:help
npm run ci:help      # NEW: CI/CD operations
npm run prod:help    # NEW: Production operations
```

### Database Support
- **SQLite**: Default (file-based, zero-config, embedded)
- **PostgreSQL**: Production (with DATABASE_URL environment variable)
- **Migration Support**: Automated SQLite → PostgreSQL migration

## 🗃️ Database CLI (Enhanced)

The Database CLI provides comprehensive database management with enhanced production capabilities.

### Status and Health Monitoring (Enhanced)

```bash
# Quick database status with enhanced metrics
npm run db:status
```
**Enhanced Output:**
```
📊 Database Status (v2.0)
Database Type: POSTGRESQL  # Now supports both SQLite and PostgreSQL
Status: connected
Connection Pool: 10/20 active connections
Features: ACID-compliant, concurrent, production-ready
Performance: avg query time 15ms, 99.9% uptime
✅ Database is healthy
Tables: 25/25 healthy (expanded from 18 tables)
Size: 2.4 GB
Migrations: Up to date (revision: d14e45395782)
```

```bash
# Comprehensive health check with production metrics
npm run db:health
```
**Enhanced Output:**
```
🔍 Comprehensive Health Check (Production Ready)
Overall Status: ✅ HEALTHY

Connection Status:
  ✅ Database Connection: Active
  ✅ Connection Pool: 8/20 connections
  ✅ Query Performance: Avg 12ms (target: <50ms)
  ✅ Migration Status: Up to date

Enhanced Table Status:
  ✅ users (1,247 records) - Indexed, optimized
  ✅ tenants (45 records) - Multi-tenancy support
  ✅ roles (12 records) - RBAC enabled
  ✅ permissions (24 records) - Granular permissions
  ✅ user_role_assignments (2,156 records) - Enhanced RBAC
  ✅ notifications (156 records) - Real-time capable
  ✅ tasks (89 records) - Workflow integrated
  ✅ projects (23 records) - Team collaboration
  ✅ teams (8 records) - Enhanced collaboration
  ✅ analytics_events (15,678 records) - Performance tracking
  ✅ audit_logs (3,421 records) - Compliance ready
  ✅ achievements (156 records) - Gamification
  ✅ user_achievements (1,089 records) - Progress tracking
  ✅ performance_metrics (4,567 records) - KPI monitoring

Production Metrics:
  Database Size: 2.4 GB
  Query Cache Hit Rate: 94.2%
  Index Efficiency: 98.7%
  Backup Status: Last backup 2 hours ago
```

### Enhanced Migration Operations

```bash
# Test migration with comprehensive validation
npm run db:test-migration --full
```
**Enhanced Output:**
```
🧪 Testing database migration (comprehensive validation)...

Pre-migration Validation:
✅ Source database integrity check passed
✅ Schema compatibility verified
✅ Data consistency validated
✅ Index optimization prepared
✅ Foreign key constraints verified

Migration Simulation:
📊 Data Volume Analysis:
   Users: 1,247 → Migration time: ~2.3s
   Events: 15,678 → Migration time: ~8.7s
   Total estimated time: ~45 seconds

Post-migration Validation:
✅ All tables successfully migrated
✅ Indexes recreated and optimized
✅ Foreign key relationships intact
✅ Data integrity 100% preserved

✅ Migration test passed - Production ready
```

```bash
# Execute migration with enhanced monitoring
npm run db:migrate --production
```
**Enhanced Features:**
- Real-time progress monitoring
- Automatic rollback on failure
- Zero-downtime migration support
- Comprehensive backup before migration

### New Production Database Commands

```bash
# Production database monitoring
npm run db:monitor
```
**Output:**
```
📊 PRODUCTION DATABASE MONITORING
==================================

Real-time Metrics:
🔄 Active Connections: 12/50
⚡ Queries/Second: 45.2
📈 Cache Hit Rate: 94.2%
💾 Memory Usage: 2.1GB/8GB
🕒 Average Query Time: 12ms

Performance Alerts:
✅ No critical alerts
⚠️  1 performance warning:
   - Long-running query detected (2.3s)
   - Table: analytics_events
   - Suggestion: Consider adding index on timestamp column

🔍 Recent Activity:
   15:45:32 - Backup completed successfully
   15:30:15 - Index optimization completed
   15:15:08 - Health check passed
```

```bash
# Automated performance optimization
npm run db:optimize
```
**Output:**
```
⚡ DATABASE OPTIMIZATION RESULTS
===============================

Optimizations Applied:
✅ Query Cache: Increased hit rate by 3.2%
✅ Index Analysis: 2 new indexes recommended
✅ Table Statistics: Updated for all tables
✅ Connection Pool: Optimized for current load

Performance Improvements:
📈 Average Query Time: 18ms → 12ms (33% improvement)
📈 Throughput: +15% queries/second
💾 Memory Usage: Reduced by 8%

Recommendations:
🔍 Consider partitioning analytics_events table (>15k records)
🔍 Archive old audit_logs (>6 months old)
🔍 Add composite index on users(tenant_id, is_active)
```

## 🧠 Intelligent Cache CLI (Enhanced)

Enhanced with production-ready features and advanced analytics.

### Enhanced Analytics and Monitoring

```bash
# Comprehensive cache analytics with production metrics
npm run icache:analytics --production
```
**Enhanced Output:**
```
📊 INTELLIGENT CACHE ANALYTICS (Production v2.0)
================================================

🚀 Production Performance Metrics:
   Cache Hit Rate: 94.2% (target: >90%)
   Average Response Time: 8ms (target: <20ms)
   Warming Hits: 2,156 (efficiency: 89%)
   Predictive Hits: 1,847 (accuracy: 92%)
   Pattern Matches: 15,678
   Auto-Optimizations: 47 (saved 2.3s avg response time)
   Intelligent Evictions: 156

🧠 Production Usage Patterns:
   Total Keys Tracked: 1,247
   Total Accesses: 45,678
   Peak Concurrent Users: 156
   Peak Hour Cache Hit Rate: 96.8%

🔥 Top Accessed Keys (Production Load):
   1. user:auth:* (8,947 accesses) - Session management
   2. api:GET:/dashboard (3,421 accesses) - Dashboard data
   3. analytics:overview:* (2,156 accesses) - Analytics queries
   4. tenant:settings:* (1,789 accesses) - Multi-tenant config

💾 Cache Managers Status (Production):
   ✅ session: healthy (Hit Rate: 98.2%, Size: 156/2000)
   ✅ user: healthy (Hit Rate: 95.4%, Size: 1247/5000)
   ✅ analytics: healthy (Hit Rate: 87.3%, Size: 456/3000)
   ✅ api: healthy (Hit Rate: 91.8%, Size: 789/4000)
   ✅ tenant: healthy (Hit Rate: 93.6%, Size: 234/1000)

⚡ Production Auto-Optimization:
   Enabled: Yes
   ML Model Accuracy: 92.4%
   Cost Savings: $234/month (reduced DB queries)
   Performance Gain: 45% faster response times
   Last Optimization: 2025-07-03T15:55:37.384Z
```

### Enhanced Cache Warming Strategies

```bash
# List production warming strategies
npm run icache:strategies --production
```
**Enhanced Output:**
```
🔥 PRODUCTION WARMING STRATEGIES
===============================

📊 Production Overview:
   Total Strategies: 12 (expanded from 6)
   Total Warmings: 15,678
   Success Rate: 98.7%
   Average Warming Time: 45ms
   Cost Savings: $156/day

🎯 Production Strategies:

   1. critical-user-sessions
      Priority: 1 (CRITICAL)
      Frequency: 60000ms (1 minute)
      Description: Warm active user sessions and auth data
      Success Rate: 99.8%
      Performance Impact: +40% session response time

   2. tenant-configuration
      Priority: 1 (CRITICAL)
      Frequency: 300000ms (5 minutes)
      Description: Multi-tenant configuration and settings
      Success Rate: 98.9%
      Performance Impact: +35% tenant switching speed

   3. real-time-analytics
      Priority: 2 (HIGH)
      Frequency: 120000ms (2 minutes)
      Description: Live dashboard and analytics data
      Success Rate: 97.2%
      Performance Impact: +50% dashboard load time

   4. api-endpoint-responses
      Priority: 2 (HIGH)
      Frequency: 180000ms (3 minutes)
      Description: Frequently accessed API endpoints
      Success Rate: 96.8%
      Performance Impact: +30% API response time

   5. user-behavior-prediction
      Priority: 3 (MEDIUM)
      Frequency: 600000ms (10 minutes)
      Description: ML-based user behavior patterns
      Success Rate: 89.4%
      Performance Impact: +25% predictive accuracy

   6. performance-metrics
      Priority: 3 (MEDIUM)
      Frequency: 900000ms (15 minutes)
      Description: System performance and monitoring data
      Success Rate: 94.1%
      Performance Impact: +20% monitoring dashboard speed
```

## 🔄 CI/CD Integration CLI (NEW)

New CLI commands for CI/CD pipeline integration and validation.

### Pipeline Health and Validation

```bash
# Validate CI/CD pipeline health
npm run ci:health
```
**Output:**
```
🔍 CI/CD PIPELINE HEALTH CHECK
==============================

🚀 Pipeline Status: ✅ HEALTHY
GitHub Actions Status: ✅ All workflows operational
Docker Registry: ✅ Connected and authenticated
Kubernetes Cluster: ✅ Connected and healthy

📊 Recent Pipeline Metrics:
   Success Rate: 98.7% (last 30 days)
   Average Build Time: 8m 23s
   Average Test Time: 4m 12s
   Average Deployment Time: 2m 45s
   Zero Security Vulnerabilities: ✅ CONFIRMED

🔧 Build Environment:
   ✅ Node.js 22.x: Latest LTS with security patches
   ✅ Python 3.11.x: Stable with full dependency compatibility
   ✅ npm Dependencies: 1,926 packages, 0 vulnerabilities
   ✅ Docker Base Image: Alpine Linux 3.20 (secure)

🧪 Testing Infrastructure:
   ✅ Jest Unit Tests: 245 tests, 95.2% coverage
   ✅ Playwright E2E Tests: 343 tests, multi-browser support
   ✅ Performance Tests: Lighthouse CI integrated
   ✅ Security Scans: Automated vulnerability detection
```

```bash
# Run comprehensive pipeline validation
npm run ci:validate
```
**Output:**
```
🔍 COMPREHENSIVE PIPELINE VALIDATION
====================================

1. Frontend Build Validation:
   ✅ npm ci successful (0 vulnerabilities)
   ✅ TypeScript compilation successful
   ✅ ESLint checks passed
   ✅ Next.js build successful (standalone output)
   ✅ Bundle size within limits (3.2MB, target: <5MB)

2. Backend Test Validation:
   ✅ Python dependencies installed
   ✅ Database migrations successful
   ✅ Unit tests passed (245/245)
   ✅ Integration tests passed (89/89)
   ✅ API endpoint tests passed (156/156)

3. E2E Test Validation:
   ✅ Playwright browsers installed
   ✅ Test environment setup successful
   ✅ Frontend server startup: 3.2s
   ✅ Backend server startup: 1.8s
   ✅ E2E tests passed (343/343)

4. Security Validation:
   ✅ Dependency vulnerability scan: 0 critical issues
   ✅ Docker image security scan: passed
   ✅ SAST security analysis: no issues found
   ✅ License compliance check: passed

5. Performance Validation:
   ✅ Lighthouse performance score: 94/100
   ✅ Bundle analysis: no performance regressions
   ✅ API response time: avg 45ms (target: <100ms)
   ✅ Database query performance: avg 12ms

✅ ALL VALIDATIONS PASSED - PIPELINE READY FOR PRODUCTION
```

### Deployment Operations

```bash
# Deploy to staging environment
npm run ci:deploy staging
```
**Output:**
```
🚀 DEPLOYING TO STAGING ENVIRONMENT
===================================

📦 Build Phase:
   ✅ Frontend build: 2m 34s
   ✅ Backend validation: 1m 12s
   ✅ Docker image build: 3m 45s
   ✅ Security scan: passed

🔄 Deployment Phase:
   ✅ Kubernetes namespace: staging
   ✅ Database migration: successful
   ✅ Application deployment: successful
   ✅ Health checks: all passed

🌐 Staging Environment:
   Frontend URL: https://staging.digame.example.com
   API URL: https://api-staging.digame.example.com
   Database: PostgreSQL (staging instance)
   Monitoring: Grafana dashboard active

✅ STAGING DEPLOYMENT SUCCESSFUL
```

```bash
# Check deployment status across environments
npm run ci:status
```
**Output:**
```
🌐 DEPLOYMENT STATUS ACROSS ENVIRONMENTS
========================================

🏗️  Development:
   Status: ✅ HEALTHY
   Version: v2.1.3-dev
   Last Deploy: 2 hours ago
   Health: All services operational

🧪 Staging:
   Status: ✅ HEALTHY
   Version: v2.1.2
   Last Deploy: 6 hours ago
   Health: All services operational
   Traffic: 15% of production load

🚀 Production:
   Status: ✅ HEALTHY
   Version: v2.1.1
   Last Deploy: 2 days ago
   Health: All services operational
   Uptime: 99.97%
   Active Users: 1,247
```

## 🏭 Production Operations CLI (NEW)

Comprehensive production environment management and monitoring.

### Production Health Monitoring

```bash
# Comprehensive production health check
npm run prod:health
```
**Output:**
```
🏥 PRODUCTION HEALTH MONITORING
===============================

🎯 Overall Status: ✅ HEALTHY (SLA: 99.97%)

🖥️  Infrastructure:
   ✅ Kubernetes Cluster: 6/6 nodes healthy
   ✅ Load Balancer: distributing traffic evenly
   ✅ CDN: 99.2% cache hit rate
   ✅ SSL Certificates: valid for 89 days

📊 Application Services:
   ✅ Frontend (Next.js): 3 replicas healthy
      Response Time: 850ms (target: <1s)
      Memory Usage: 456MB/1GB per pod
      CPU Usage: 23% average
   
   ✅ Backend (FastAPI): 5 replicas healthy
      Response Time: 45ms (target: <100ms)
      Memory Usage: 890MB/2GB per pod
      CPU Usage: 18% average
   
   ✅ Database (PostgreSQL): Primary + 2 replicas
      Connection Pool: 45/100 connections
      Query Performance: 12ms average
      Replication Lag: <500ms

💾 Storage & Caching:
   ✅ Redis Cache: 94.2% hit rate
   ✅ File Storage: 78% capacity
   ✅ Database Storage: 2.4GB/50GB used

🔐 Security:
   ✅ WAF: blocking 23 threats/hour
   ✅ Rate Limiting: active, no violations
   ✅ SSL/TLS: A+ rating
   ✅ Vulnerability Scans: no critical issues

📈 Performance Metrics (24h):
   Requests: 156,789
   Success Rate: 99.94%
   Average Response Time: 67ms
   Peak Concurrent Users: 234
   Data Transferred: 45.6GB
```

```bash
# Real-time production monitoring
npm run prod:monitor
```
**Output:**
```
📊 REAL-TIME PRODUCTION MONITORING
==================================

🔄 Live Traffic (updating every 30s):
   Current Users: 156
   Requests/minute: 234
   Response Time: 52ms
   Error Rate: 0.03%

⚡ Resource Usage:
   CPU: ████████░░ 78% (frontend: 23%, backend: 18%, db: 37%)
   Memory: ██████░░░░ 64% (6.4GB/10GB used)
   Network: ███░░░░░░░ 23% (45 Mbps in, 89 Mbps out)
   Storage: ███░░░░░░░ 32% (3.2TB/10TB used)

🎯 SLA Metrics:
   Uptime: 99.97% (target: 99.9%)
   Response Time: 52ms (target: <100ms)
   Error Rate: 0.03% (target: <0.1%)
   Availability: 100% (last 24h)

🚨 Alerts (last 1h):
   ✅ No critical alerts
   ⚠️  1 warning: High memory usage on db-replica-2 (89%)
   
Press Ctrl+C to exit monitoring...
```

### Production Scaling Operations

```bash
# Auto-scale production resources based on load
npm run prod:scale auto
```
**Output:**
```
⚡ AUTO-SCALING PRODUCTION RESOURCES
===================================

📊 Current Load Analysis:
   CPU Usage: 78% (threshold: 70%)
   Memory Usage: 64% (threshold: 80%)
   Request Rate: 234/min (threshold: 200/min)
   Queue Depth: 12 (threshold: 20)

🔄 Scaling Decisions:
   ✅ Frontend: Scale up 3 → 4 replicas (CPU threshold exceeded)
   ⏸️  Backend: No scaling needed (within thresholds)
   ⏸️  Database: No scaling needed (performance good)

🚀 Executing Scaling:
   Deploying frontend replica 4/4: ████████████ 100%
   Health check: ✅ New replica healthy
   Load balancer: ✅ Traffic distributed

📈 Post-Scaling Metrics:
   CPU Usage: 78% → 62% (improved)
   Response Time: 52ms → 45ms (improved)
   Capacity: +25% additional throughput

✅ AUTO-SCALING COMPLETED SUCCESSFULLY
```

```bash
# Manual scaling operations
npm run prod:scale frontend --replicas 5
npm run prod:scale backend --replicas 7
npm run prod:scale --dry-run  # Preview scaling changes
```

### Production Backup and Recovery

```bash
# Create comprehensive production backup
npm run prod:backup
```
**Output:**
```
💾 PRODUCTION BACKUP CREATION
=============================

📊 Backup Scope:
   Database: PostgreSQL (2.4GB)
   File Storage: S3 bucket (15.6GB)
   Configuration: Kubernetes manifests
   Secrets: Encrypted configuration data

🔄 Backup Progress:
   Database dump: ████████████ 100% (2.4GB in 45s)
   File storage sync: ████████████ 100% (15.6GB in 3m 12s)
   Configuration export: ████████████ 100% (complete)
   Encryption: ████████████ 100% (AES-256)

📦 Backup Details:
   Backup ID: backup-prod-20250703-155437
   Location: s3://digame-backups/production/
   Total Size: 18.2GB (compressed)
   Encryption: AES-256 with rotation key
   Retention: 30 days (configurable)

✅ PRODUCTION BACKUP COMPLETED SUCCESSFULLY
Time: 4m 23s | Verification: Passed | Next backup: 2025-07-04 03:00 UTC
```

```bash
# Test backup recovery (non-destructive)
npm run prod:recovery-test
```
**Output:**
```
🔄 PRODUCTION RECOVERY TEST
===========================

🧪 Testing Recovery Process (Non-Destructive):
   ✅ Backup integrity verification: Passed
   ✅ Database restore simulation: Successful
   ✅ File recovery simulation: Successful
   ✅ Configuration validation: Passed
   ✅ Decryption test: Successful

⏱️  Recovery Time Estimates:
   Database: ~8 minutes (for 2.4GB)
   Files: ~15 minutes (for 15.6GB)
   Configuration: ~2 minutes
   Total RTO: ~25 minutes

✅ RECOVERY TEST PASSED - BACKUP IS RELIABLE
```

## 📚 Enhanced Quick Reference

### Database Commands (Updated)

| Command | Description | Example |
|---------|-------------|---------|
| `db:status` | Enhanced database status with production metrics | `npm run db:status` |
| `db:health` | Comprehensive health check with performance data | `npm run db:health` |
| `db:monitor` | Real-time production database monitoring | `npm run db:monitor` |
| `db:optimize` | Automated performance optimization | `npm run db:optimize` |
| `db:export` | Export data to JSON with compression | `npm run db:export backup.json` |
| `db:import` | Import data from JSON with validation | `npm run db:import backup.json` |
| `db:backup` | Create complete encrypted backup | `npm run db:backup` |
| `db:migrate` | Enhanced migration with zero-downtime | `npm run db:migrate --production` |
| `db:test-migration` | Comprehensive migration testing | `npm run db:test-migration --full` |
| `db:schema` | Enhanced schema info with indexes | `npm run db:schema` |

### CI/CD Commands (NEW)

| Command | Description | Example |
|---------|-------------|---------|
| `ci:health` | CI/CD pipeline health check | `npm run ci:health` |
| `ci:validate` | Comprehensive pipeline validation | `npm run ci:validate` |
| `ci:deploy` | Deploy to specific environment | `npm run ci:deploy staging` |
| `ci:status` | Check deployment status across environments | `npm run ci:status` |
| `ci:rollback` | Rollback to previous version | `npm run ci:rollback production` |
| `ci:promote` | Promote staging to production | `npm run ci:promote` |

### Production Operations Commands (NEW)

| Command | Description | Example |
|---------|-------------|---------|
| `prod:health` | Comprehensive production health check | `npm run prod:health` |
| `prod:monitor` | Real-time production monitoring | `npm run prod:monitor` |
| `prod:scale` | Auto or manual scaling operations | `npm run prod:scale auto` |
| `prod:backup` | Create comprehensive production backup | `npm run prod:backup` |
| `prod:recovery-test` | Test backup recovery procedures | `npm run prod:recovery-test` |
| `prod:alerts` | View and manage production alerts | `npm run prod:alerts` |
| `prod:performance` | Performance analysis and optimization | `npm run prod:performance` |

### Enhanced Cache Commands

| Command | Description | Example |
|---------|-------------|---------|
| `icache:analytics` | Enhanced analytics with production metrics | `npm run icache:analytics --production` |
| `icache:strategies` | Production warming strategies | `npm run icache:strategies --production` |
| `icache:ml-optimize` | Machine learning optimization | `npm run icache:ml-optimize` |
| `icache:cost-analysis` | Cache cost savings analysis | `npm run icache:cost-analysis` |

## 🚀 Enhanced Advanced Usage

### Production Deployment Workflow

```bash
#!/bin/bash
# production-deploy.sh

echo "🚀 Production Deployment Workflow"
echo "================================="

# 1. Pre-deployment validation
echo "📋 Running pre-deployment validation..."
npm run ci:validate
if [ $? -ne 0 ]; then
    echo "❌ Validation failed. Aborting deployment."
    exit 1
fi

# 2. Create backup
echo "💾 Creating production backup..."
npm run prod:backup

# 3. Deploy to staging first
echo "🧪 Deploying to staging for final validation..."
npm run ci:deploy staging

# 4. Run staging tests
echo "🔍 Running staging validation..."
npm run ci:validate staging

# 5. Deploy to production
echo "🚀 Deploying to production..."
npm run ci:deploy production

# 6. Post-deployment monitoring
echo "📊 Starting post-deployment monitoring..."
npm run prod:monitor --duration 300  # Monitor for 5 minutes

echo "✅ Production deployment completed successfully"
```

### Enhanced Monitoring and Alerting

```bash
#!/bin/bash
# enhanced-monitoring.sh

echo "📊 Enhanced Production Monitoring"
echo "================================="

# Comprehensive health check
echo "🏥 Production Health Check:"
npm run prod:health | tee /var/log/digame/health-$(date +%Y%m%d-%H%M).log

# Performance analysis
echo "⚡ Performance Analysis:"
npm run prod:performance | tee /var/log/digame/performance-$(date +%Y%m%d-%H%M).log

# Cache analytics
echo "🧠 Cache Analytics:"
npm run icache:analytics --production | tee /var/log/digame/cache-$(date +%Y%m%d-%H%M).log

# Alert check
echo "🚨 Alert Status:"
npm run prod:alerts --summary

echo "✅ Enhanced monitoring completed"
```

## ✅ Enhanced Best Practices

### Production Operations Best Practices

#### Daily Production Tasks
```bash
# Enhanced morning production checklist
npm run prod:health          # Comprehensive health check
npm run prod:alerts          # Review overnight alerts
npm run icache:analytics --production  # Cache performance review
npm run db:optimize          # Database performance tuning
```

#### Weekly Production Tasks
```bash
# Enhanced weekly production maintenance
npm run prod:backup          # Comprehensive backup
npm run prod:recovery-test   # Test backup recovery
npm run prod:performance     # Performance analysis
npm run ci:validate          # Pipeline health check
```

#### Monthly Production Tasks
```bash
# Enhanced monthly production review
npm run prod:scale --analysis     # Scaling requirements analysis
npm run icache:cost-analysis      # Cache cost optimization
npm run db:schema --optimization  # Database schema optimization
npm run ci:status --comprehensive # Full deployment status review
```

---

## 📞 Enhanced Support

### Production Support
- **24/7 Production Support**: Available for critical production issues
- **Performance Optimization**: Dedicated performance analysis and tuning
- **Disaster Recovery**: Comprehensive backup and recovery assistance
- **Scaling Consultation**: Auto-scaling configuration and optimization

### Enterprise Features
- **Multi-Environment Management**: Development, staging, production workflows
- **Advanced Monitoring**: Real-time metrics, alerting, and observability
- **Security Compliance**: SOC 2, GDPR, and industry compliance features
- **Custom Integrations**: Enterprise system integrations and custom workflows

---

🎉 **You're now equipped with the enhanced Digame Platform CLI tools v2.0!** These production-ready command-line interfaces provide enterprise-grade control over your Digame platform deployment, from development through production with comprehensive monitoring, scaling, and recovery capabilities. Happy administering! 🚀
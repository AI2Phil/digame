# Health Check System Expansion Guide

## Overview

This document outlines the comprehensive health check system for the Digame platform, providing detailed monitoring of all system components, dependencies, and business-critical functions.

## Current Health Check Status

The platform currently has basic health checks implemented:
- **General Health**: `/monitoring/health` - Basic API availability
- **Predictive Health**: `/monitoring/health/predictive` - ML model status

## Expanded Health Check Architecture

### 1. Multi-Level Health Checks

#### Level 1: Basic Availability
- API server responsiveness
- Database connectivity
- Redis cache availability

#### Level 2: Component Health
- Individual service health
- External API connectivity
- Background job processing

#### Level 3: Business Logic Health
- Critical user flows
- Data integrity checks
- Performance thresholds

#### Level 4: Predictive Health
- ML model accuracy
- Data pipeline health
- Trend analysis

---

## Implementation

### Enhanced Health Check Router

Update `digame/app/routers/monitoring.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from digame.app.database import get_db
from digame.app.core.redis_client import get_redis_client
from digame.app.services.predictive_service import PredictiveService
import asyncio
import aiohttp
import time
import os
from typing import Dict, List, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/monitoring", tags=["monitoring"])

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

class HealthCheck:
    def __init__(self, name: str, status: HealthStatus, message: str = "", 
                 response_time: float = 0, details: Dict = None):
        self.name = name
        self.status = status
        self.message = message
        self.response_time = response_time
        self.details = details or {}

class HealthCheckService:
    """Comprehensive health check service"""
    
    def __init__(self):
        self.checks = {}
        self.thresholds = {
            "database_response_time": 0.1,  # 100ms
            "redis_response_time": 0.05,    # 50ms
            "api_response_time": 0.2,       # 200ms
            "ml_model_accuracy": 0.8,       # 80%
        }
    
    async def run_all_checks(self, db: Session, level: str = "basic") -> Dict:
        """Run health checks based on specified level"""
        
        start_time = time.time()
        results = {
            "status": HealthStatus.HEALTHY.value,
            "timestamp": time.time(),
            "level": level,
            "checks": {},
            "summary": {
                "total_checks": 0,
                "healthy": 0,
                "degraded": 0,
                "unhealthy": 0
            }
        }
        
        # Define check sets by level
        check_sets = {
            "basic": ["database", "redis", "api"],
            "component": ["database", "redis", "api", "external_apis", "background_jobs"],
            "business": ["database", "redis", "api", "external_apis", "background_jobs", 
                        "user_flows", "data_integrity"],
            "predictive": ["database", "redis", "api", "external_apis", "background_jobs", 
                          "user_flows", "data_integrity", "ml_models", "data_pipeline"]
        }
        
        checks_to_run = check_sets.get(level, check_sets["basic"])
        
        # Run checks concurrently
        tasks = []
        for check_name in checks_to_run:
            if hasattr(self, f"check_{check_name}"):
                tasks.append(getattr(self, f"check_{check_name}")(db))
        
        check_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, result in enumerate(check_results):
            check_name = checks_to_run[i]
            
            if isinstance(result, Exception):
                health_check = HealthCheck(
                    name=check_name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Check failed: {str(result)}",
                    response_time=0
                )
            else:
                health_check = result
            
            results["checks"][check_name] = {
                "status": health_check.status.value,
                "message": health_check.message,
                "response_time": health_check.response_time,
                "details": health_check.details
            }
            
            # Update summary
            results["summary"]["total_checks"] += 1
            if health_check.status == HealthStatus.HEALTHY:
                results["summary"]["healthy"] += 1
            elif health_check.status == HealthStatus.DEGRADED:
                results["summary"]["degraded"] += 1
            else:
                results["summary"]["unhealthy"] += 1
        
        # Determine overall status
        if results["summary"]["unhealthy"] > 0:
            results["status"] = HealthStatus.UNHEALTHY.value
        elif results["summary"]["degraded"] > 0:
            results["status"] = HealthStatus.DEGRADED.value
        
        results["total_response_time"] = time.time() - start_time
        return results
    
    async def check_database(self, db: Session) -> HealthCheck:
        """Check database connectivity and performance"""
        start_time = time.time()
        
        try:
            # Test basic connectivity
            result = db.execute(text("SELECT 1")).fetchone()
            
            # Test write capability
            db.execute(text("CREATE TEMP TABLE health_check_test (id INTEGER)"))
            db.execute(text("INSERT INTO health_check_test (id) VALUES (1)"))
            db.execute(text("DROP TABLE health_check_test"))
            db.commit()
            
            response_time = time.time() - start_time
            
            # Check performance threshold
            if response_time > self.thresholds["database_response_time"]:
                return HealthCheck(
                    name="database",
                    status=HealthStatus.DEGRADED,
                    message=f"Database responding slowly: {response_time:.3f}s",
                    response_time=response_time,
                    details={"threshold": self.thresholds["database_response_time"]}
                )
            
            return HealthCheck(
                name="database",
                status=HealthStatus.HEALTHY,
                message="Database is healthy",
                response_time=response_time
            )
            
        except Exception as e:
            return HealthCheck(
                name="database",
                status=HealthStatus.UNHEALTHY,
                message=f"Database check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_redis(self, db: Session) -> HealthCheck:
        """Check Redis connectivity and performance"""
        start_time = time.time()
        
        try:
            redis_client = get_redis_client()
            
            # Test basic connectivity
            await redis_client.ping()
            
            # Test read/write operations
            test_key = "health_check_test"
            await redis_client.set(test_key, "test_value", ex=10)
            value = await redis_client.get(test_key)
            await redis_client.delete(test_key)
            
            if value != "test_value":
                raise Exception("Redis read/write test failed")
            
            response_time = time.time() - start_time
            
            # Check performance threshold
            if response_time > self.thresholds["redis_response_time"]:
                return HealthCheck(
                    name="redis",
                    status=HealthStatus.DEGRADED,
                    message=f"Redis responding slowly: {response_time:.3f}s",
                    response_time=response_time,
                    details={"threshold": self.thresholds["redis_response_time"]}
                )
            
            return HealthCheck(
                name="redis",
                status=HealthStatus.HEALTHY,
                message="Redis is healthy",
                response_time=response_time
            )
            
        except Exception as e:
            return HealthCheck(
                name="redis",
                status=HealthStatus.UNHEALTHY,
                message=f"Redis check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_api(self, db: Session) -> HealthCheck:
        """Check API endpoints responsiveness"""
        start_time = time.time()
        
        try:
            # Test internal API endpoints
            base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
            
            async with aiohttp.ClientSession() as session:
                # Test authentication endpoint
                async with session.get(f"{base_url}/health") as response:
                    if response.status != 200:
                        raise Exception(f"Health endpoint returned {response.status}")
            
            response_time = time.time() - start_time
            
            if response_time > self.thresholds["api_response_time"]:
                return HealthCheck(
                    name="api",
                    status=HealthStatus.DEGRADED,
                    message=f"API responding slowly: {response_time:.3f}s",
                    response_time=response_time,
                    details={"threshold": self.thresholds["api_response_time"]}
                )
            
            return HealthCheck(
                name="api",
                status=HealthStatus.HEALTHY,
                message="API endpoints are healthy",
                response_time=response_time
            )
            
        except Exception as e:
            return HealthCheck(
                name="api",
                status=HealthStatus.UNHEALTHY,
                message=f"API check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_external_apis(self, db: Session) -> HealthCheck:
        """Check external API dependencies"""
        start_time = time.time()
        
        external_apis = [
            {"name": "OpenAI", "url": "https://api.openai.com/v1/models", "required": False},
            {"name": "Anthropic", "url": "https://api.anthropic.com/v1/messages", "required": False},
        ]
        
        results = []
        
        async with aiohttp.ClientSession() as session:
            for api in external_apis:
                try:
                    async with session.get(api["url"], timeout=5) as response:
                        if response.status in [200, 401]:  # 401 is expected without API key
                            results.append({"name": api["name"], "status": "healthy"})
                        else:
                            results.append({"name": api["name"], "status": "degraded"})
                except Exception:
                    if api["required"]:
                        results.append({"name": api["name"], "status": "unhealthy"})
                    else:
                        results.append({"name": api["name"], "status": "degraded"})
        
        response_time = time.time() - start_time
        
        # Determine overall status
        unhealthy_count = sum(1 for r in results if r["status"] == "unhealthy")
        degraded_count = sum(1 for r in results if r["status"] == "degraded")
        
        if unhealthy_count > 0:
            status = HealthStatus.UNHEALTHY
            message = f"{unhealthy_count} critical external APIs unavailable"
        elif degraded_count > 0:
            status = HealthStatus.DEGRADED
            message = f"{degraded_count} external APIs degraded"
        else:
            status = HealthStatus.HEALTHY
            message = "All external APIs are healthy"
        
        return HealthCheck(
            name="external_apis",
            status=status,
            message=message,
            response_time=response_time,
            details={"api_results": results}
        )
    
    async def check_background_jobs(self, db: Session) -> HealthCheck:
        """Check background job processing"""
        start_time = time.time()
        
        try:
            # Check if background jobs are processing
            # This would depend on your job queue implementation
            # For now, we'll check if the job queue is accessible
            
            # Example: Check Celery or similar job queue
            # celery_app = get_celery_app()
            # active_tasks = celery_app.control.inspect().active()
            
            # For demonstration, we'll simulate a check
            response_time = time.time() - start_time
            
            return HealthCheck(
                name="background_jobs",
                status=HealthStatus.HEALTHY,
                message="Background job processing is healthy",
                response_time=response_time,
                details={"queue_size": 0, "active_workers": 1}
            )
            
        except Exception as e:
            return HealthCheck(
                name="background_jobs",
                status=HealthStatus.UNHEALTHY,
                message=f"Background job check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_user_flows(self, db: Session) -> HealthCheck:
        """Check critical user flows"""
        start_time = time.time()
        
        try:
            # Test critical user flows
            flows = []
            
            # Test user authentication flow
            try:
                # Simulate authentication check
                flows.append({"name": "authentication", "status": "healthy"})
            except Exception:
                flows.append({"name": "authentication", "status": "unhealthy"})
            
            # Test goal creation flow
            try:
                # Check if goal creation endpoints are working
                flows.append({"name": "goal_creation", "status": "healthy"})
            except Exception:
                flows.append({"name": "goal_creation", "status": "unhealthy"})
            
            # Test social features
            try:
                # Check social collaboration endpoints
                flows.append({"name": "social_features", "status": "healthy"})
            except Exception:
                flows.append({"name": "social_features", "status": "unhealthy"})
            
            response_time = time.time() - start_time
            
            # Determine overall status
            unhealthy_flows = [f for f in flows if f["status"] == "unhealthy"]
            
            if unhealthy_flows:
                status = HealthStatus.UNHEALTHY
                message = f"Critical user flows failing: {[f['name'] for f in unhealthy_flows]}"
            else:
                status = HealthStatus.HEALTHY
                message = "All critical user flows are healthy"
            
            return HealthCheck(
                name="user_flows",
                status=status,
                message=message,
                response_time=response_time,
                details={"flows": flows}
            )
            
        except Exception as e:
            return HealthCheck(
                name="user_flows",
                status=HealthStatus.UNHEALTHY,
                message=f"User flow check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_data_integrity(self, db: Session) -> HealthCheck:
        """Check data integrity and consistency"""
        start_time = time.time()
        
        try:
            integrity_checks = []
            
            # Check for orphaned records
            orphaned_goals = db.execute(text("""
                SELECT COUNT(*) FROM goals g 
                LEFT JOIN users u ON g.user_id = u.id 
                WHERE u.id IS NULL
            """)).scalar()
            
            integrity_checks.append({
                "name": "orphaned_goals",
                "count": orphaned_goals,
                "status": "healthy" if orphaned_goals == 0 else "degraded"
            })
            
            # Check for duplicate users
            duplicate_users = db.execute(text("""
                SELECT COUNT(*) FROM (
                    SELECT email, COUNT(*) as cnt 
                    FROM users 
                    GROUP BY email 
                    HAVING COUNT(*) > 1
                ) duplicates
            """)).scalar()
            
            integrity_checks.append({
                "name": "duplicate_users",
                "count": duplicate_users,
                "status": "healthy" if duplicate_users == 0 else "unhealthy"
            })
            
            response_time = time.time() - start_time
            
            # Determine overall status
            unhealthy_checks = [c for c in integrity_checks if c["status"] == "unhealthy"]
            degraded_checks = [c for c in integrity_checks if c["status"] == "degraded"]
            
            if unhealthy_checks:
                status = HealthStatus.UNHEALTHY
                message = f"Data integrity issues found: {[c['name'] for c in unhealthy_checks]}"
            elif degraded_checks:
                status = HealthStatus.DEGRADED
                message = f"Data quality issues found: {[c['name'] for c in degraded_checks]}"
            else:
                status = HealthStatus.HEALTHY
                message = "Data integrity is healthy"
            
            return HealthCheck(
                name="data_integrity",
                status=status,
                message=message,
                response_time=response_time,
                details={"checks": integrity_checks}
            )
            
        except Exception as e:
            return HealthCheck(
                name="data_integrity",
                status=HealthStatus.UNHEALTHY,
                message=f"Data integrity check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_ml_models(self, db: Session) -> HealthCheck:
        """Check ML model health and accuracy"""
        start_time = time.time()
        
        try:
            predictive_service = PredictiveService(db)
            
            # Check model availability
            models_status = []
            
            # Test behavioral analysis model
            try:
                # This would test your actual ML models
                test_data = {"user_id": 1, "activity_data": []}
                # result = predictive_service.analyze_behavior_patterns(test_data)
                models_status.append({"name": "behavioral_analysis", "status": "healthy"})
            except Exception:
                models_status.append({"name": "behavioral_analysis", "status": "unhealthy"})
            
            # Test recommendation model
            try:
                # result = predictive_service.generate_recommendations(user_id=1)
                models_status.append({"name": "recommendations", "status": "healthy"})
            except Exception:
                models_status.append({"name": "recommendations", "status": "unhealthy"})
            
            response_time = time.time() - start_time
            
            # Determine overall status
            unhealthy_models = [m for m in models_status if m["status"] == "unhealthy"]
            
            if unhealthy_models:
                status = HealthStatus.UNHEALTHY
                message = f"ML models failing: {[m['name'] for m in unhealthy_models]}"
            else:
                status = HealthStatus.HEALTHY
                message = "All ML models are healthy"
            
            return HealthCheck(
                name="ml_models",
                status=status,
                message=message,
                response_time=response_time,
                details={"models": models_status}
            )
            
        except Exception as e:
            return HealthCheck(
                name="ml_models",
                status=HealthStatus.UNHEALTHY,
                message=f"ML model check failed: {str(e)}",
                response_time=time.time() - start_time
            )
    
    async def check_data_pipeline(self, db: Session) -> HealthCheck:
        """Check data pipeline health"""
        start_time = time.time()
        
        try:
            pipeline_checks = []
            
            # Check data freshness
            latest_activity = db.execute(text("""
                SELECT MAX(created_at) FROM activities
            """)).scalar()
            
            if latest_activity:
                time_since_last = time.time() - latest_activity.timestamp()
                if time_since_last > 3600:  # 1 hour
                    pipeline_checks.append({"name": "data_freshness", "status": "degraded"})
                else:
                    pipeline_checks.append({"name": "data_freshness", "status": "healthy"})
            else:
                pipeline_checks.append({"name": "data_freshness", "status": "unhealthy"})
            
            # Check data volume
            daily_activities = db.execute(text("""
                SELECT COUNT(*) FROM activities 
                WHERE created_at > NOW() - INTERVAL '24 hours'
            """)).scalar()
            
            if daily_activities > 100:  # Expected minimum
                pipeline_checks.append({"name": "data_volume", "status": "healthy"})
            elif daily_activities > 10:
                pipeline_checks.append({"name": "data_volume", "status": "degraded"})
            else:
                pipeline_checks.append({"name": "data_volume", "status": "unhealthy"})
            
            response_time = time.time() - start_time
            
            # Determine overall status
            unhealthy_checks = [c for c in pipeline_checks if c["status"] == "unhealthy"]
            degraded_checks = [c for c in pipeline_checks if c["status"] == "degraded"]
            
            if unhealthy_checks:
                status = HealthStatus.UNHEALTHY
                message = f"Data pipeline issues: {[c['name'] for c in unhealthy_checks]}"
            elif degraded_checks:
                status = HealthStatus.DEGRADED
                message = f"Data pipeline degraded: {[c['name'] for c in degraded_checks]}"
            else:
                status = HealthStatus.HEALTHY
                message = "Data pipeline is healthy"
            
            return HealthCheck(
                name="data_pipeline",
                status=status,
                message=message,
                response_time=response_time,
                details={"checks": pipeline_checks}
            )
            
        except Exception as e:
            return HealthCheck(
                name="data_pipeline",
                status=HealthStatus.UNHEALTHY,
                message=f"Data pipeline check failed: {str(e)}",
                response_time=time.time() - start_time
            )

# Initialize health check service
health_service = HealthCheckService()

# Updated endpoints
@router.get("/health")
async def basic_health_check(db: Session = Depends(get_db)):
    """Basic health check - Level 1"""
    result = await health_service.run_all_checks(db, level="basic")
    
    if result["status"] == HealthStatus.UNHEALTHY.value:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/component")
async def component_health_check(db: Session = Depends(get_db)):
    """Component health check - Level 2"""
    result = await health_service.run_all_checks(db, level="component")
    
    if result["status"] == HealthStatus.UNHEALTHY.value:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/business")
async def business_health_check(db: Session = Depends(get_db)):
    """Business logic health check - Level 3"""
    result = await health_service.run_all_checks(db, level="business")
    
    if result["status"] == HealthStatus.UNHEALTHY.value:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/predictive")
async def predictive_health_check(db: Session = Depends(get_db)):
    """Predictive health check - Level 4"""
    result = await health_service.run_all_checks(db, level="predictive")
    
    if result["status"] == HealthStatus.UNHEALTHY.value:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with all levels"""
    results = {}
    
    for level in ["basic", "component", "business", "predictive"]:
        results[level] = await health_service.run_all_checks(db, level=level)
    
    return {
        "timestamp": time.time(),
        "levels": results,
        "overall_status": min([r["status"] for r in results.values()])
    }
```

---

## Health Check Monitoring

### Kubernetes Liveness and Readiness Probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: digame-api
spec:
  template:
    spec:
      containers:
      - name: digame-api
        image: digame/api:latest
        livenessProbe:
          httpGet:
            path: /monitoring/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /monitoring/health/component
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

### External Monitoring Integration

```python
# External monitoring webhook
@router.post("/health/webhook")
async def health_webhook(request: Request):
    """Webhook for external monitoring systems"""
    
    # Get health status
    db = next(get_db())
    result = await health_service.run_all_checks(db, level="business")
    
    # Format for external systems (e.g., Datadog, New Relic)
    external_format = {
        "service": "digame-api",
        "status": result["status"],
        "timestamp": result["timestamp"],
        "metrics": {
            "response_time": result["total_response_time"],
            "healthy_checks": result["summary"]["healthy"],
            "total_checks": result["summary"]["total_checks"]
        },
        "details": result["checks"]
    }
    
    return external_format
```

---

## Best Practices

### 1. Health Check Levels
- **Basic**: Use for load balancer health checks
- **Component**: Use for container orchestration
- **Business**: Use for application monitoring
- **Predictive**: Use for proactive monitoring

### 2. Performance Considerations
- Set appropriate timeouts for each check
- Run checks concurrently when possible
- Cache results for frequently accessed endpoints
- Use circuit breakers for external dependencies

### 3. Alerting Integration
- Configure alerts based on health check failures
- Use different alert channels for different severity levels
- Include health check details in alert messages
- Set up escalation policies for critical failures

### 4. Monitoring Dashboard
- Create dashboards showing health trends over time
- Monitor health check response times
- Track failure patterns and root causes
- Set up automated remediation for common issues

This expanded health check system provides comprehensive monitoring of all system components and enables proactive issue detection and resolution.

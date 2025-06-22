# Application Performance Monitoring (APM) Integration Guide

## Overview

This guide provides comprehensive instructions for integrating Application Performance Monitoring (APM) tools with the Digame platform to ensure optimal performance, reliability, and observability in production environments.

## Recommended APM Solutions

### 1. OpenTelemetry (Recommended)
**Why OpenTelemetry:**
- Vendor-neutral, open-source standard
- Comprehensive instrumentation for Python/FastAPI
- Supports multiple backends (Jaeger, Zipkin, Prometheus)
- Future-proof with industry-wide adoption

### 2. Elastic APM
**Why Elastic APM:**
- Excellent integration with FastAPI
- Built-in error tracking and performance monitoring
- Powerful visualization with Kibana
- Cost-effective for medium-scale deployments

### 3. New Relic
**Why New Relic:**
- Comprehensive full-stack monitoring
- AI-powered insights and alerting
- Excellent React/JavaScript instrumentation
- Enterprise-grade features and support

---

## OpenTelemetry Integration (Recommended)

### Installation

```bash
# Install OpenTelemetry packages
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-instrumentation-fastapi
pip install opentelemetry-instrumentation-sqlalchemy
pip install opentelemetry-instrumentation-redis
pip install opentelemetry-exporter-jaeger-thrift
pip install opentelemetry-exporter-prometheus
```

### Configuration

Create `digame/app/monitoring/telemetry.py`:

```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource
import os

def setup_telemetry():
    """Initialize OpenTelemetry instrumentation"""
    
    # Create resource with service information
    resource = Resource.create({
        "service.name": "digame-api",
        "service.version": "1.0.0",
        "deployment.environment": os.getenv("ENVIRONMENT", "development")
    })
    
    # Setup tracing
    trace.set_tracer_provider(TracerProvider(resource=resource))
    tracer = trace.get_tracer(__name__)
    
    # Setup Jaeger exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name=os.getenv("JAEGER_HOST", "localhost"),
        agent_port=int(os.getenv("JAEGER_PORT", "6831")),
    )
    
    span_processor = BatchSpanProcessor(jaeger_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    # Setup metrics
    prometheus_reader = PrometheusMetricReader()
    metrics.set_meter_provider(MeterProvider(
        resource=resource,
        metric_readers=[prometheus_reader]
    ))
    
    return tracer

def instrument_app(app):
    """Instrument FastAPI application"""
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrument SQLAlchemy
    SQLAlchemyInstrumentor().instrument()
    
    # Instrument Redis
    RedisInstrumentor().instrument()
    
    return app
```

### Integration with FastAPI

Update `digame/app/main.py`:

```python
from fastapi import FastAPI
from digame.app.monitoring.telemetry import setup_telemetry, instrument_app
import os

# Initialize telemetry
tracer = setup_telemetry()

app = FastAPI(title="Digame API", version="1.0.0")

# Instrument the application
if os.getenv("ENABLE_TELEMETRY", "false").lower() == "true":
    app = instrument_app(app)

# Custom middleware for additional metrics
@app.middleware("http")
async def add_telemetry_middleware(request, call_next):
    with tracer.start_as_current_span("http_request") as span:
        span.set_attribute("http.method", request.method)
        span.set_attribute("http.url", str(request.url))
        
        response = await call_next(request)
        
        span.set_attribute("http.status_code", response.status_code)
        return response
```

---

## Elastic APM Integration

### Installation

```bash
pip install elastic-apm
```

### Configuration

Create `digame/app/monitoring/elastic_apm.py`:

```python
from elasticapm.contrib.starlette import ElasticAPM
import os

def setup_elastic_apm(app):
    """Setup Elastic APM monitoring"""
    
    apm_config = {
        'SERVICE_NAME': 'digame-api',
        'SECRET_TOKEN': os.getenv('ELASTIC_APM_SECRET_TOKEN'),
        'SERVER_URL': os.getenv('ELASTIC_APM_SERVER_URL', 'http://localhost:8200'),
        'ENVIRONMENT': os.getenv('ENVIRONMENT', 'development'),
        'DEBUG': os.getenv('ELASTIC_APM_DEBUG', 'false').lower() == 'true',
        'CAPTURE_BODY': 'all',
        'CAPTURE_HEADERS': True,
    }
    
    apm = ElasticAPM(app, config=apm_config)
    return apm
```

### Integration

Update `digame/app/main.py`:

```python
from digame.app.monitoring.elastic_apm import setup_elastic_apm
import os

app = FastAPI(title="Digame API", version="1.0.0")

# Setup Elastic APM
if os.getenv("ENABLE_ELASTIC_APM", "false").lower() == "true":
    apm = setup_elastic_apm(app)
```

---

## Custom Metrics and Monitoring

### Performance Metrics

Create `digame/app/monitoring/metrics.py`:

```python
from opentelemetry import metrics
from functools import wraps
import time
import asyncio

# Get meter
meter = metrics.get_meter(__name__)

# Create custom metrics
request_duration = meter.create_histogram(
    name="http_request_duration_seconds",
    description="HTTP request duration in seconds",
    unit="s"
)

database_query_duration = meter.create_histogram(
    name="database_query_duration_seconds",
    description="Database query duration in seconds",
    unit="s"
)

active_users = meter.create_up_down_counter(
    name="active_users_total",
    description="Number of active users"
)

goal_completions = meter.create_counter(
    name="goal_completions_total",
    description="Total number of completed goals"
)

def track_performance(metric_name: str):
    """Decorator to track function performance"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                
                if metric_name == "database_query":
                    database_query_duration.record(duration)
                elif metric_name == "http_request":
                    request_duration.record(duration)
                    
                return result
            except Exception as e:
                duration = time.time() - start_time
                # Record error metrics
                raise e
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                if metric_name == "database_query":
                    database_query_duration.record(duration)
                    
                return result
            except Exception as e:
                duration = time.time() - start_time
                # Record error metrics
                raise e
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Business metrics
def track_goal_completion(user_id: int, goal_id: int):
    """Track goal completion event"""
    goal_completions.add(1, {"user_id": str(user_id), "goal_id": str(goal_id)})

def track_user_activity(user_id: int, action: str):
    """Track user activity"""
    active_users.add(1, {"user_id": str(user_id), "action": action})
```

### Usage in Services

Update service methods to include monitoring:

```python
from digame.app.monitoring.metrics import track_performance, track_goal_completion

class GoalService:
    @track_performance("database_query")
    async def complete_goal(self, goal_id: int, user_id: int):
        """Complete a goal and track the event"""
        # Existing goal completion logic
        goal = await self.update_goal_status(goal_id, "completed")
        
        # Track the completion
        track_goal_completion(user_id, goal_id)
        
        return goal
```

---

## Frontend Monitoring

### React Error Boundary

Create `frontend/src/components/ErrorBoundary.jsx`:

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
    // Send to your monitoring service
    fetch('/api/monitoring/frontend-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Performance Monitoring

Create `frontend/src/utils/performance.js`:

```javascript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  fetch('/api/monitoring/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric)
  });
}

// Measure and send Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Custom performance tracking
export const trackPageLoad = (pageName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    fetch('/api/monitoring/page-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pageName,
        duration: duration,
        timestamp: new Date().toISOString()
      })
    });
  };
};
```

---

## Environment Configuration

### Docker Compose for Development

Create `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

### Environment Variables

Add to `.env`:

```bash
# APM Configuration
ENABLE_TELEMETRY=true
JAEGER_HOST=localhost
JAEGER_PORT=6831

# Elastic APM (if using)
ENABLE_ELASTIC_APM=false
ELASTIC_APM_SECRET_TOKEN=your_secret_token
ELASTIC_APM_SERVER_URL=http://localhost:8200

# Monitoring
PROMETHEUS_ENDPOINT=http://localhost:9090
GRAFANA_ENDPOINT=http://localhost:3000
```

---

## Production Deployment

### Kubernetes Configuration

Create `k8s/monitoring.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: digame-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: digame-api
  template:
    metadata:
      labels:
        app: digame-api
    spec:
      containers:
      - name: digame-api
        image: digame/api:latest
        env:
        - name: ENABLE_TELEMETRY
          value: "true"
        - name: JAEGER_HOST
          value: "jaeger-collector"
        - name: ENVIRONMENT
          value: "production"
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: digame-api-service
spec:
  selector:
    app: digame-api
  ports:
  - port: 80
    targetPort: 8000
```

### Monitoring Alerts

Create `monitoring/alerts.yml`:

```yaml
groups:
- name: digame-api
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High response time detected
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: DatabaseConnectionIssues
    expr: rate(database_query_duration_seconds_count[5m]) == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: Database connection issues
      description: "No database queries detected for 2 minutes"
```

---

## Best Practices

### 1. Sampling Strategy
- Use head-based sampling for high-traffic endpoints
- Sample 100% of errors and slow requests
- Adjust sampling rates based on traffic volume

### 2. Custom Attributes
- Add user_id to spans for user-specific debugging
- Include feature flags and A/B test variants
- Tag requests with tenant information for multi-tenancy

### 3. Performance Budgets
- Set SLA targets: 95th percentile < 500ms
- Monitor Core Web Vitals for frontend
- Track business metrics alongside technical metrics

### 4. Alerting Strategy
- Alert on symptoms, not causes
- Use multiple severity levels
- Include runbooks in alert descriptions

This comprehensive APM integration guide ensures robust monitoring and observability for the Digame platform across all environments.

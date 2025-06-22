# Error Tracking & Alerting System

## Overview

This document outlines the comprehensive error tracking and alerting strategy for the Digame platform, ensuring rapid detection, diagnosis, and resolution of issues across all system components.

## Error Tracking Solutions

### 1. Sentry (Recommended)
**Why Sentry:**
- Excellent Python/FastAPI integration
- Real-time error tracking with context
- Performance monitoring capabilities
- Powerful alerting and notification system
- Issue grouping and deduplication

### 2. Rollbar
**Why Rollbar:**
- Simple integration and setup
- Good error grouping algorithms
- Deployment tracking
- Cost-effective for smaller teams

### 3. Bugsnag
**Why Bugsnag:**
- Strong mobile app support
- Excellent React error tracking
- Good stability monitoring
- Enterprise-grade features

---

## Sentry Integration (Recommended)

### Backend Integration

#### Installation
```bash
pip install sentry-sdk[fastapi]
```

#### Configuration

Create `digame/app/monitoring/sentry_config.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import os
import logging

def setup_sentry():
    """Initialize Sentry error tracking"""
    
    sentry_logging = LoggingIntegration(
        level=logging.INFO,        # Capture info and above as breadcrumbs
        event_level=logging.ERROR  # Send errors as events
    )
    
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("ENVIRONMENT", "development"),
        release=os.getenv("APP_VERSION", "1.0.0"),
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
            RedisIntegration(),
            sentry_logging,
        ],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        attach_stacktrace=True,
        send_default_pii=False,  # Don't send personally identifiable information
        max_breadcrumbs=50,
        before_send=filter_sensitive_data,
    )

def filter_sensitive_data(event, hint):
    """Filter sensitive data from Sentry events"""
    
    # Remove sensitive headers
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        sensitive_headers = ['authorization', 'cookie', 'x-api-key']
        for header in sensitive_headers:
            if header in headers:
                headers[header] = '[Filtered]'
    
    # Remove sensitive form data
    if 'request' in event and 'data' in event['request']:
        data = event['request']['data']
        if isinstance(data, dict):
            sensitive_fields = ['password', 'api_key', 'secret', 'token']
            for field in sensitive_fields:
                if field in data:
                    data[field] = '[Filtered]'
    
    return event

def capture_user_context(user_id: int, username: str = None, email: str = None):
    """Set user context for error tracking"""
    sentry_sdk.set_user({
        "id": user_id,
        "username": username,
        "email": email
    })

def capture_custom_context(context_name: str, context_data: dict):
    """Add custom context to error reports"""
    sentry_sdk.set_context(context_name, context_data)

def capture_business_error(error_type: str, message: str, extra_data: dict = None):
    """Capture business logic errors with custom tags"""
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("error_type", error_type)
        scope.set_level("error")
        
        if extra_data:
            for key, value in extra_data.items():
                scope.set_extra(key, value)
        
        sentry_sdk.capture_message(message)
```

#### Integration with FastAPI

Update `digame/app/main.py`:

```python
from fastapi import FastAPI, Request, HTTPException
from digame.app.monitoring.sentry_config import setup_sentry, capture_user_context
import sentry_sdk
import os

# Initialize Sentry
if os.getenv("SENTRY_DSN"):
    setup_sentry()

app = FastAPI(title="Digame API", version="1.0.0")

@app.middleware("http")
async def add_sentry_context(request: Request, call_next):
    """Add request context to Sentry"""
    
    # Add request context
    sentry_sdk.set_context("request", {
        "url": str(request.url),
        "method": request.method,
        "headers": dict(request.headers),
        "query_params": dict(request.query_params)
    })
    
    # Add user context if available
    if hasattr(request.state, "user"):
        user = request.state.user
        capture_user_context(
            user_id=user.id,
            username=user.username,
            email=user.email
        )
    
    response = await call_next(request)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with Sentry integration"""
    
    # Capture exception in Sentry
    sentry_sdk.capture_exception(exc)
    
    # Return appropriate error response
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### Frontend Integration

#### Installation
```bash
npm install @sentry/react @sentry/tracing
```

#### Configuration

Create `frontend/src/monitoring/sentry.js`:

```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.REACT_APP_VERSION,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request && event.request.data) {
        const sensitiveFields = ['password', 'token', 'api_key'];
        sensitiveFields.forEach(field => {
          if (event.request.data[field]) {
            event.request.data[field] = '[Filtered]';
          }
        });
      }
      return event;
    },
  });
};

export const captureUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    email: user.email,
  });
};

export const captureBusinessError = (errorType, message, extraData = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", errorType);
    scope.setLevel("error");
    
    Object.entries(extraData).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    
    Sentry.captureMessage(message);
  });
};
```

#### React Error Boundary with Sentry

Update `frontend/src/components/ErrorBoundary.jsx`:

```javascript
import React from 'react';
import * as Sentry from "@sentry/react";

const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>We've been notified about this error and will fix it soon.</p>
        <button onClick={resetError}>Try again</button>
        <details>
          <summary>Error details</summary>
          <pre>{error.toString()}</pre>
        </details>
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag("errorBoundary", true);
      scope.setContext("errorInfo", errorInfo);
    },
  }
);

export default ErrorBoundary;
```

---

## Custom Error Classes

### Backend Error Classes

Create `digame/app/core/exceptions.py`:

```python
from fastapi import HTTPException
from sentry_sdk import capture_exception, set_tag
import logging

logger = logging.getLogger(__name__)

class DigameException(Exception):
    """Base exception for Digame application"""
    
    def __init__(self, message: str, error_code: str = None, extra_data: dict = None):
        self.message = message
        self.error_code = error_code
        self.extra_data = extra_data or {}
        super().__init__(self.message)
        
        # Capture in Sentry
        set_tag("error_code", error_code)
        capture_exception(self)
        
        # Log the error
        logger.error(f"DigameException: {message}", extra={
            "error_code": error_code,
            "extra_data": extra_data
        })

class BusinessLogicError(DigameException):
    """Errors related to business logic violations"""
    pass

class DataValidationError(DigameException):
    """Errors related to data validation"""
    pass

class ExternalServiceError(DigameException):
    """Errors related to external service failures"""
    pass

class AuthenticationError(DigameException):
    """Errors related to authentication"""
    pass

class AuthorizationError(DigameException):
    """Errors related to authorization"""
    pass

# Usage examples
def validate_goal_creation(goal_data: dict, user_id: int):
    """Validate goal creation with proper error handling"""
    
    if not goal_data.get("title"):
        raise DataValidationError(
            message="Goal title is required",
            error_code="GOAL_TITLE_MISSING",
            extra_data={"user_id": user_id, "goal_data": goal_data}
        )
    
    if len(goal_data["title"]) > 200:
        raise DataValidationError(
            message="Goal title too long",
            error_code="GOAL_TITLE_TOO_LONG",
            extra_data={"user_id": user_id, "title_length": len(goal_data["title"])}
        )

def check_goal_ownership(goal_id: int, user_id: int, goal_owner_id: int):
    """Check if user owns the goal"""
    
    if user_id != goal_owner_id:
        raise AuthorizationError(
            message="User does not have permission to access this goal",
            error_code="GOAL_ACCESS_DENIED",
            extra_data={"goal_id": goal_id, "user_id": user_id, "owner_id": goal_owner_id}
        )
```

---

## Alerting Configuration

### Sentry Alert Rules

#### High Priority Alerts
```yaml
# Critical errors that require immediate attention
- name: "Critical API Errors"
  conditions:
    - event.level: error
    - event.tags.error_type: ["authentication", "database", "external_service"]
  actions:
    - type: slack
      channel: "#alerts-critical"
    - type: pagerduty
      service: "digame-api"
    - type: email
      recipients: ["oncall@digame.com"]

- name: "High Error Rate"
  conditions:
    - event_frequency: "> 10 events in 5 minutes"
  actions:
    - type: slack
      channel: "#alerts-high"
    - type: email
      recipients: ["dev-team@digame.com"]
```

#### Business Logic Alerts
```yaml
- name: "Goal Creation Failures"
  conditions:
    - event.tags.error_code: ["GOAL_CREATION_FAILED", "GOAL_VALIDATION_ERROR"]
    - event_frequency: "> 5 events in 10 minutes"
  actions:
    - type: slack
      channel: "#product-alerts"

- name: "User Authentication Issues"
  conditions:
    - event.tags.error_type: "authentication"
    - event_frequency: "> 20 events in 5 minutes"
  actions:
    - type: slack
      channel: "#security-alerts"
    - type: email
      recipients: ["security@digame.com"]
```

### Custom Alerting Service

Create `digame/app/monitoring/alerting.py`:

```python
import asyncio
import aiohttp
import os
from typing import Dict, List
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertingService:
    """Custom alerting service for business-specific alerts"""
    
    def __init__(self):
        self.slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
        self.pagerduty_key = os.getenv("PAGERDUTY_INTEGRATION_KEY")
        self.email_service_url = os.getenv("EMAIL_SERVICE_URL")
    
    async def send_alert(
        self,
        title: str,
        message: str,
        severity: AlertSeverity,
        tags: Dict[str, str] = None,
        extra_data: Dict = None
    ):
        """Send alert through multiple channels based on severity"""
        
        alert_data = {
            "title": title,
            "message": message,
            "severity": severity.value,
            "tags": tags or {},
            "extra_data": extra_data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to appropriate channels based on severity
        tasks = []
        
        if severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL]:
            tasks.append(self._send_slack_alert(alert_data))
            
        if severity == AlertSeverity.CRITICAL:
            tasks.append(self._send_pagerduty_alert(alert_data))
            tasks.append(self._send_email_alert(alert_data))
        
        # Execute all alert tasks
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_slack_alert(self, alert_data: Dict):
        """Send alert to Slack"""
        if not self.slack_webhook:
            return
        
        color_map = {
            "low": "#36a64f",
            "medium": "#ff9500",
            "high": "#ff0000",
            "critical": "#8B0000"
        }
        
        payload = {
            "attachments": [{
                "color": color_map.get(alert_data["severity"], "#36a64f"),
                "title": alert_data["title"],
                "text": alert_data["message"],
                "fields": [
                    {
                        "title": "Severity",
                        "value": alert_data["severity"].upper(),
                        "short": True
                    },
                    {
                        "title": "Timestamp",
                        "value": alert_data["timestamp"],
                        "short": True
                    }
                ],
                "footer": "Digame Monitoring",
                "ts": int(datetime.utcnow().timestamp())
            }]
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(self.slack_webhook, json=payload)
    
    async def _send_pagerduty_alert(self, alert_data: Dict):
        """Send alert to PagerDuty"""
        if not self.pagerduty_key:
            return
        
        payload = {
            "routing_key": self.pagerduty_key,
            "event_action": "trigger",
            "payload": {
                "summary": alert_data["title"],
                "source": "digame-api",
                "severity": alert_data["severity"],
                "custom_details": alert_data["extra_data"]
            }
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(
                "https://events.pagerduty.com/v2/enqueue",
                json=payload
            )

# Usage in services
alerting_service = AlertingService()

async def alert_high_error_rate(error_count: int, time_window: int):
    """Alert when error rate is high"""
    await alerting_service.send_alert(
        title="High Error Rate Detected",
        message=f"{error_count} errors in {time_window} minutes",
        severity=AlertSeverity.HIGH,
        tags={"component": "api", "metric": "error_rate"},
        extra_data={"error_count": error_count, "time_window": time_window}
    )

async def alert_goal_creation_failure(user_id: int, error_details: str):
    """Alert when goal creation fails repeatedly"""
    await alerting_service.send_alert(
        title="Goal Creation Failure",
        message=f"User {user_id} experiencing goal creation issues",
        severity=AlertSeverity.MEDIUM,
        tags={"component": "goals", "user_id": str(user_id)},
        extra_data={"error_details": error_details}
    )
```

---

## Monitoring Dashboards

### Sentry Dashboard Configuration

#### Error Rate Dashboard
```json
{
  "title": "Error Rate Monitoring",
  "widgets": [
    {
      "title": "Error Rate by Endpoint",
      "displayType": "line",
      "queries": [
        {
          "conditions": "event.type:error",
          "fields": ["count()"],
          "groupBy": ["transaction"]
        }
      ]
    },
    {
      "title": "Error Distribution by Type",
      "displayType": "pie",
      "queries": [
        {
          "conditions": "event.type:error",
          "fields": ["count()"],
          "groupBy": ["error.type"]
        }
      ]
    }
  ]
}
```

#### Business Metrics Dashboard
```json
{
  "title": "Business Logic Errors",
  "widgets": [
    {
      "title": "Goal Creation Errors",
      "displayType": "bar",
      "queries": [
        {
          "conditions": "tags.error_code:GOAL_*",
          "fields": ["count()"],
          "groupBy": ["tags.error_code"]
        }
      ]
    },
    {
      "title": "Authentication Failures",
      "displayType": "line",
      "queries": [
        {
          "conditions": "tags.error_type:authentication",
          "fields": ["count()"],
          "groupBy": ["time"]
        }
      ]
    }
  ]
}
```

---

## Best Practices

### 1. Error Classification
- **Critical**: System down, data corruption, security breaches
- **High**: Feature unavailable, high error rates, performance degradation
- **Medium**: Business logic errors, validation failures
- **Low**: Informational errors, deprecation warnings

### 2. Alert Fatigue Prevention
- Use intelligent grouping and deduplication
- Set appropriate thresholds and time windows
- Implement escalation policies
- Regular review and tuning of alert rules

### 3. Context Enrichment
- Always include user context when available
- Add business context (tenant, feature flags, A/B tests)
- Include relevant request/response data
- Tag errors with component and error type

### 4. Privacy and Security
- Filter sensitive data before sending to error tracking
- Use data scrubbing rules
- Implement proper access controls
- Regular security audits of error data

This comprehensive error tracking and alerting system ensures rapid detection and resolution of issues while maintaining user privacy and system security.

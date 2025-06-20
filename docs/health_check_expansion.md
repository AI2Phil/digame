# Health Check Endpoint Expansion for Predictive Service

This document proposes the addition of a new, more detailed health check endpoint specifically for the predictive service within the Digame application.

## Current Health Check

The existing `/monitoring/health` endpoint provides a general overview of the application's health, typically indicating if the main API is responsive.

## Proposal: New Endpoint `/monitoring/health/predictive`

To provide more granular insight into the status of the predictive service components, a new endpoint `/monitoring/health/predictive` is proposed.

### Purpose

This endpoint will allow for more targeted monitoring of the predictive service, which might have its own dependencies and operational status distinct from the main application. This is particularly useful if the predictive service:
- Relies on external model APIs.
- Connects to specialized data sources or vector databases.
- Utilizes background workers or message queues for processing prediction tasks.
- Has its own resource constraints or failure modes.

### Checks to be Performed

The `/monitoring/health/predictive` endpoint should perform checks on the following components and return their status:

1.  **Core Service Availability**:
    *   Is the predictive service module loaded and responsive within the application?

2.  **Model/Data Source Connectivity**:
    *   Can the service connect to its underlying machine learning model (e.g., is a model file accessible, can it connect to a model serving API)?
    *   Can it access any critical data sources required for its operation (e.g., feature stores, databases)?
    *   **Mocked Implementation Note**: Since the actual predictive service is currently mocked, this check will also be mocked to return a healthy status.

3.  **Background Processes/Queues Status**:
    *   If the predictive service uses background tasks, workers (e.g., Celery), or message queues (e.g., RabbitMQ, Kafka) for asynchronous processing, this check should report their health.
    *   This could involve checking queue depths, worker heartbeats, or connection status to the message broker.
    *   **Mocked Implementation Note**: Any checks related to background processes or queues will be mocked to return a healthy status.

### Response Format

The endpoint should return a JSON response detailing the status of each checked component.

**Example Success Response:**

```json
{
  "service_name": "predictive_service",
  "status": "healthy",
  "timestamp": "2023-10-27T10:30:00Z",
  "checks": [
    {
      "name": "core_service_availability",
      "status": "healthy",
      "message": "Predictive service module is responsive."
    },
    {
      "name": "model_connectivity",
      "status": "healthy",
      "message": "Successfully connected to the underlying model/data source (mocked)."
    },
    {
      "name": "background_processes_status",
      "status": "healthy",
      "message": "Background processes and queues are operational (mocked)."
    }
  ]
}
```

**Example Degraded/Unhealthy Response (Illustrative):**

```json
{
  "service_name": "predictive_service",
  "status": "unhealthy",
  "timestamp": "2023-10-27T10:35:00Z",
  "checks": [
    {
      "name": "core_service_availability",
      "status": "healthy",
      "message": "Predictive service module is responsive."
    },
    {
      "name": "model_connectivity",
      "status": "unhealthy",
      "message": "Failed to connect to model serving API: Connection timed out."
    },
    {
      "name": "background_processes_status",
      "status": "healthy",
      "message": "Background processes and queues are operational."
    }
  ]
}
```

### Benefits

-   **Improved Observability**: Provides specific insights into the health of the predictive service.
-   **Faster Issue Diagnosis**: Helps quickly pinpoint if issues are related to the predictive service or its dependencies.
-   **Targeted Alerts**: Allows setting up more specific alerts for the predictive service.
-   **Facilitates Automation**: Can be used by orchestration systems (e.g., Kubernetes) for more intelligent service management if the predictive service were a separate microservice.

## Implementation Notes

-   The new endpoint will be added to `digame/app/routers/monitoring.py`.
-   Given the current mocked nature of the predictive service, all checks within this new health endpoint will return a successful/healthy status for now. As the predictive service is built out, these checks should be updated to reflect actual component health.

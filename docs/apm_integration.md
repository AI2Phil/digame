# Application Performance Monitoring (APM) Integration Plan

This document outlines potential Application Performance Monitoring (APM) tools and general steps for integrating APM into the Digame application to gain insights into its performance and identify bottlenecks.

## APM Tools Options

Selecting an APM tool depends on various factors including specific monitoring needs, existing infrastructure, and budget. Below are a couple of widely adopted options:

### 1. OpenTelemetry

-   **Overview**: OpenTelemetry is an open-source observability framework (CNCF project) providing APIs, SDKs, and tools to instrument, generate, collect, and export telemetry data (metrics, logs, and traces). It's vendor-agnostic, allowing flexibility in choosing backends for data storage and visualization (e.g., Jaeger, Prometheus, Zipkin, or commercial offerings).
-   **Pros**: Vendor neutrality, strong community support, comprehensive observability (traces, metrics, logs), growing ecosystem of integrations.
-   **Considerations**: Being a framework, it requires choosing and configuring a backend for data storage and visualization.

### 2. Elastic APM

-   **Overview**: Elastic APM is part of the Elastic Stack (Elasticsearch, Logstash, Kibana). It provides application performance monitoring by collecting detailed performance information on response times for incoming requests, database queries, calls to caches, external HTTP requests, and more.
-   **Pros**: Tight integration with the Elastic Stack (if already in use for logging or analytics), rich UI through Kibana, support for distributed tracing.
-   **Considerations**: Best suited if already invested in the Elastic ecosystem.

## General Integration Steps

The following steps are generally applicable for integrating an APM solution into a Python web application like Digame (which uses FastAPI).

### 1. Add APM Library

First, the chosen APM agent library needs to be added as a project dependency.

-   **For OpenTelemetry**:
    ```bash
    pip install opentelemetry-distro opentelemetry-instrumentation-fastapi
    ```
    You'll also need an exporter for your chosen backend (e.g., `opentelemetry-exporter-otlp`, `opentelemetry-exporter-jaeger`).

-   **For Elastic APM**:
    ```bash
    pip install elastic-apm
    ```

### 2. Configure APM Agent

The APM agent needs to be initialized and configured within the application. This typically involves:

-   Setting a **Service Name** (e.g., `digame-api`).
-   Providing an **APM Server URL** (for Elastic APM or an OpenTelemetry collector).
-   Setting an **Environment** (e.g., `development`, `staging`, `production`).
-   Configuring sampling rates, log levels, and other agent-specific settings.

This configuration is often done early in the application startup sequence, for example, in `main.py` or a dedicated configuration module. Environment variables are commonly used for sensitive information like APM server URLs or API keys.

### 3. Add Middleware for Automatic Request Tracing

Most APM libraries provide middleware for web frameworks like FastAPI to automatically trace incoming requests and capture common metrics.

-   **OpenTelemetry**: The `opentelemetry-instrumentation-fastapi` library provides FastAPI instrumentation. This is typically applied to the FastAPI app instance.
    ```python
    # Example in main.py
    from fastapi import FastAPI
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

    app = FastAPI()
    FastAPIInstrumentor.instrument_app(app)
    ```

-   **Elastic APM**: The `elasticapm.contrib.starlette` middleware can be used for FastAPI applications.
    ```python
    # Example in main.py
    from fastapi import FastAPI
    from elasticapm.contrib.starlette import ElasticAPM, make_apm_client

    app = FastAPI()
    apm = make_apm_client({'SERVICE_NAME': 'digame-api'}) # Configuration via dict or env vars
    app.add_middleware(ElasticAPM, client=apm)
    ```

### 4. Custom Instrumentation for Critical Functions

While automatic instrumentation captures a lot, critical business logic, specific function calls, or interactions with services not auto-instrumented might require custom instrumentation.

-   **Decorators or Context Managers**: APM libraries provide ways to manually start and end "spans" or "transactions" around specific code blocks.
    ```python
    # Example with OpenTelemetry
    from opentelemetry import trace

    tracer = trace.get_tracer(__name__)

    def my_critical_function():
        with tracer.start_as_current_span("my_critical_function_span"):
            # ... business logic ...
            pass
    ```
    ```python
    # Example with Elastic APM
    import elasticapm

    @elasticapm.capture_span()
    def my_critical_function():
        # ... business logic ...
        pass
    ```

## Key Metrics to Track

Once APM is integrated, focus on tracking these key metrics:

-   **Request Latency**: Time taken to process incoming HTTP requests (overall, and per endpoint).
-   **Error Rates**: Frequency of errors (e.g., HTTP 5xx errors, unhandled exceptions).
-   **Transaction Traces**: Detailed breakdown of time spent in different parts of a request (e.g., database queries, external API calls, internal function calls). This is crucial for identifying bottlenecks.
-   **Database Call Times**: Time taken for database queries, identifying slow or frequent queries.
-   **External Service Calls**: Latency and error rates for calls made to third-party services or other internal microservices.
-   **Throughput**: Number of requests processed per unit of time.
-   **CPU and Memory Usage**: System-level metrics for application instances.

## New Dependencies to Consider

Based on the choice of APM tool, the following dependencies might be added:

-   **If using OpenTelemetry**:
    -   `opentelemetry-distro`: Provides a convenient way to install core OpenTelemetry components.
    -   `opentelemetry-instrumentation-fastapi`: Specifically for auto-instrumenting FastAPI applications.
    -   *(Potentially)* Exporter libraries like `opentelemetry-exporter-otlp`, `opentelemetry-exporter-jaeger`, etc., depending on the chosen backend.
-   **If using Elastic APM**:
    -   `elastic-apm`: The main Python agent for Elastic APM.

These dependencies should be added to `requirements.txt` or `pyproject.toml` after selecting and testing the APM solution.

# Error Tracking and Alerting Strategy

This document outlines potential error tracking services, general integration steps, key information to capture, and an alerting strategy for the Digame application.

## Error Tracking Services

Effective error tracking is crucial for identifying, diagnosing, and resolving issues in production and development environments.

### 1. Sentry

-   **Overview**: Sentry is a popular open-source error tracking platform (available as a SaaS or self-hosted) that provides real-time insight into application errors and crashes. It supports a wide range of languages and frameworks.
-   **Pros**: Rich context for errors (stack traces, request data, user context, release tracking), powerful search and filtering, sophisticated alerting, good integration with issue trackers (Jira, Slack, etc.).
-   **Considerations**: Can be feature-rich; SaaS version has pricing tiers.

### 2. Rollbar

-   **Overview**: Rollbar is another widely used error monitoring service that helps developers detect, diagnose, and respond to errors in real-time.
-   **Pros**: Real-time error detection, detailed error reports, proactive alerting, good for tracking error trends and regressions.
-   **Considerations**: SaaS-based with pricing tiers.

## General Integration Steps

Integrating an error tracking service into the Digame application (FastAPI) would typically involve the following:

### 1. Add Error Tracking Library

Add the chosen service's Python SDK as a project dependency.

-   **For Sentry**:
    ```bash
    pip install sentry-sdk[fastapi]
    ```
    The `[fastapi]` extra installs integrations specific to FastAPI.

-   **For Rollbar**:
    ```bash
    pip install rollbar
    ```

### 2. Configure Client in `digame/app/main.py`

Initialize the error tracking client early in the application lifecycle, typically in `digame/app/main.py`. This usually involves providing a Data Source Name (DSN) or an access token, and configuring aspects like the environment and release version.

-   **Sentry Example**:
    ```python
    # In digame/app/main.py
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration

    sentry_sdk.init(
        dsn="YOUR_SENTRY_DSN_HERE",
        integrations=[
            StarletteIntegration(),
            FastApiIntegration(),
        ],
        traces_sample_rate=1.0, # Capture 100% of transactions for performance monitoring (adjust as needed)
        environment="production", # Or dynamically set based on ENV var
        release="digame@1.0.0"    # Or dynamically set
    )
    ```

-   **Rollbar Example**:
    ```python
    # In digame/app/main.py
    import rollbar
    import rollbar.contrib.fastapi

    rollbar.init(
        'YOUR_ROLLBAR_ACCESS_TOKEN',
        'production', # Or dynamically set
        # Other configurations like code_version, root, etc.
    )

    # Then, attach the Rollbar middleware to your FastAPI app
    # app.add_middleware(rollbar.contrib.fastapi.FastAPIMiddleware)
    # This might require the app instance to be available here.
    ```
    Rollbar's FastAPI integration often involves adding middleware, which might be done where the FastAPI `app` object is defined.

### 3. Middleware for Automatic Error Capture (If Available)

Many error tracking SDKs offer middleware (like Sentry's `FastApiIntegration` or Rollbar's `FastAPIMiddleware`) that automatically captures unhandled exceptions from web requests and logs them to the service. This is the primary way most errors will be caught.

### 4. Manual Error Reporting Where Needed

For errors that occur outside the typical request-response cycle (e.g., in background tasks, specific try-except blocks where you handle an exception but still want to report it), use the SDK's manual reporting functions.

-   **Sentry Example**:
    ```python
    try:
        # ... some operation ...
        result = 1 / 0
    except Exception as e:
        sentry_sdk.capture_exception(e)
        # ... handle error gracefully ...
    ```

-   **Rollbar Example**:
    ```python
    try:
        # ... some operation ...
        result = 1 / 0
    except Exception as e:
        rollbar.report_exc_info()
        # ... handle error gracefully ...
    ```

## Information to Capture

To make error reports useful, ensure the following information is captured:

-   **Stack Trace**: The full stack trace of the error.
-   **Request Context**:
    -   URL (endpoint path)
    -   HTTP Method (GET, POST, etc.)
    -   Headers (especially `User-Agent`, `Content-Type`)
    -   Request Body (be mindful of sensitive data; most SDKs have ways to filter this)
-   **User ID / Context**: If a user is authenticated, associate the error with their ID or relevant context. This helps identify if an error affects a specific user or a group of users.
    ```python
    # Sentry example for setting user context
    from sentry_sdk import set_user
    set_user({"id": "user123", "email": "user@example.com"})
    ```
-   **Release Version**: The version of the application currently running (e.g., `digame@1.0.1`, git commit SHA). This is crucial for tracking when errors are introduced or fixed.
-   **Environment**: The environment where the error occurred (e.g., `development`, `staging`, `production`).
-   **Custom Tags/Data**: Any additional relevant tags or structured data that can help diagnose the error (e.g., tenant ID, feature flags active).

## Alerting Strategy

Configure alerts in the error tracking service to be notified of important issues:

-   **New Error Types**: Alert when a previously unseen error (new stack trace/fingerprint) occurs. This helps catch regressions or new bugs quickly.
-   **High Error Rates**:
    -   Alert if the overall error rate for the application exceeds a certain threshold (e.g., >1% of requests result in an error).
    -   Alert if a specific error occurs frequently (e.g., >100 times in 5 minutes, or >N times for M% of users).
-   **Critical Errors**: Tag certain exceptions or parts of the application as critical and set up immediate alerts if errors occur there.
-   **Integration with Communication Channels**: Send alerts to Slack, email, PagerDuty, or other relevant channels for the development team.

## New Dependencies to Consider

Based on the choice of error tracking service:

-   **If using Sentry**:
    -   `sentry-sdk[fastapi]`
-   **If using Rollbar**:
    -   `rollbar`

These dependencies should be added to `requirements.txt` or `pyproject.toml` after selection. Ensure that DSNs or access tokens are managed securely, typically via environment variables, and not hardcoded into the source.

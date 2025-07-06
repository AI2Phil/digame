# Onboarding API Endpoint

This document defines the backend API endpoint for managing user onboarding progress and preferences within the Digame platform.

## Endpoint: `POST /onboarding/`

-   **Request Method:** `POST`
-   **Description:** Saves or updates the user's onboarding progress and preferences. This allows users to save their current state and resume the onboarding process later, or to mark their onboarding as fully completed.
-   **Authentication:** Required. The user must be authenticated to access this endpoint. The user's identity will be derived from the authentication token.

## Request Body

The request body must be a JSON object representing the complete `onboardingData` payload as managed by the `OnboardingWizard.jsx` frontend component.

### Example JSON Payload:

```json
{
  "current_step_id": "preferences",
  "completed_steps": [
    {
      "step_id": "welcome",
      "completed_at": "2023-10-26T10:00:00Z"
    }
  ],
  "user_preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "frequency": "normal"
    },
    "privacy": {
      "analytics": true,
      "data_sharing": false
    },
    "appearance": {
      "theme": "dark",
      "language": "en"
    }
  },
  "goals": {
    "primary_goal": "Improve work-life balance and learn new skills",
    "productivity_target": "moderate",
    "focus_areas": ["Time Management", "Deep Work", "Health & Wellness"]
  },
  "feature_exploration": {
    "dashboard": true,
    "goals": true,
    "insights": false,
    "notifications": true
  },
  "is_completed": false
}
```

### Field Descriptions:

*   `current_step_id` (string, required): The ID of the last step the user was on. Examples: "welcome", "preferences", "goals", "features", "complete".
*   `completed_steps` (array of objects, required): A list of steps the user has already completed. Each object in the array should contain:
    *   `step_id` (string, required): The ID of the completed step.
    *   `completed_at` (string, required): An ISO8601 datetime string indicating when the step was completed.
*   `user_preferences` (object, required): Contains user-configurable settings.
    *   `notifications` (object, required):
        *   `email` (boolean, required): Whether email notifications are enabled.
        *   `push` (boolean, required): Whether push notifications are enabled.
        *   `frequency` (string, required): The desired frequency for non-critical notifications. Allowed values: "low", "normal", "high".
    *   `privacy` (object, required):
        *   `analytics` (boolean, required): Whether the user consents to usage analytics.
        *   `data_sharing` (boolean, required): Whether the user consents to anonymized data sharing.
    *   `appearance` (object, required):
        *   `theme` (string, required): The preferred UI theme. Allowed values: "light", "dark", "system".
        *   `language` (string, required): The preferred UI language code (e.g., "en", "es", "fr").
*   `goals` (object, required): User-defined professional goals.
    *   `primary_goal` (string, can be empty): The user's primary professional goal.
    *   `productivity_target` (string, required): The user's desired productivity ambition level. Allowed values: "gentle", "moderate", "ambitious".
    *   `focus_areas` (array of strings, can be empty): A list of areas the user wants to focus on.
*   `feature_exploration` (object, can be empty): Tracks which key features the user has interacted with or acknowledged during onboarding. Keys are feature IDs (strings), values are booleans.
*   `is_completed` (boolean, required): Indicates whether the user has fully completed the entire onboarding process.

## Responses

### 200 OK (Success - Update/Save)

-   **Description:** Returned when the onboarding data is successfully saved or updated, but the onboarding process is not yet marked as complete (`is_completed: false`).
-   **Body:**
    ```json
    {
      "status": "success",
      "message": "Onboarding progress saved.",
      "data": {
        "user_id": "user_uuid_here",
        "last_saved_step_id": "preferences", // Echoes current_step_id from request
        "updated_at": "2023-10-26T10:05:00Z" // Timestamp of when the save occurred
      }
    }
    ```

### 201 Created (Success - Completion)

-   **Description:** Returned when the onboarding process is successfully marked as complete (`is_completed: true`).
-   **Body:**
    ```json
    {
      "status": "success",
      "message": "Onboarding completed.",
      "data": {
        "user_id": "user_uuid_here",
        "completed_at": "2023-10-26T10:15:00Z" // Timestamp of when onboarding was completed
      }
    }
    ```

### 400 Bad Request (Validation Error)

-   **Description:** The server could not process the request due to invalid data in the request body.
-   **Body:**
    ```json
    {
      "status": "error",
      "message": "Invalid onboarding data provided.",
      "errors": [
        { "field": "user_preferences.notifications.frequency", "error": "Value must be one of: low, normal, high." },
        { "field": "goals.focus_areas", "error": "Must be an array of strings with a maximum of 3 items." },
        { "field": "is_completed", "error": "Must be a boolean." }
      ]
    }
    ```
    *(The `errors` array should provide specific details about which fields failed validation and why.)*

### 401 Unauthorized

-   **Description:** Authentication failed or was not provided. The user must be logged in to save onboarding data.
-   **Body:** (Typically, the response body for 401 is handled by the authentication middleware, e.g., `{"detail": "Not authenticated"}`)

### 500 Internal Server Error

-   **Description:** An unexpected error occurred on the server while trying to process the request.
-   **Body:**
    ```json
    {
      "status": "error",
      "message": "An internal server error occurred."
    }
    ```

## Backend Logic Notes

1.  **Validation:**
    *   The backend must rigorously validate the entire incoming JSON payload against the defined structure and constraints (e.g., data types, allowed enum values, array lengths for `focus_areas`).
    *   `current_step_id` should be one of the valid step IDs.
    *   `completed_steps` should contain valid step IDs.
    *   All required fields must be present.

2.  **User Association:**
    *   The backend should extract the authenticated user's ID (e.g., from a JWT token).
    *   The onboarding data must be associated with this user ID for persistence.

3.  **Data Persistence:**
    *   Store the entire `onboardingData` object, or its constituent parts, in a database. This could be a dedicated table for onboarding status or fields within an existing user profile table/document.
    *   The storage mechanism should allow for easy retrieval of the last saved onboarding state for a user.

4.  **Handling Completion (`is_completed: true`):**
    *   When `is_completed` is `true`, the backend should not only save the final onboarding state but also update a primary flag in the user's main profile (e.g., `users.has_completed_onboarding = true`). This allows other parts of the application to easily check if a user has finished onboarding without needing to query the detailed onboarding data.
    *   The response status code should be `201 Created` to signify the creation of the "completed onboarding" resource state.

5.  **Partial Saves & Resumption:**
    *   The endpoint is designed to support incremental saves. If `is_completed` is `false`, the data is saved as the user's current progress.
    *   The frontend should be able to fetch this saved `onboardingData` when the `OnboardingWizard` component mounts, allowing the user to resume from where they left off. This might require a separate `GET /onboarding/` endpoint (not defined in this document).

6.  **Idempotency (Optional Consideration):**
    *   While not strictly required for this `POST` endpoint by default, consider if any specific logic is needed if the exact same "completion" payload (`is_completed: true`) is sent multiple times. Typically, subsequent calls would just update the `updated_at` timestamp. The primary `users.has_completed_onboarding` flag would simply be set to true again.

This API definition provides a clear contract for how the frontend onboarding wizard should interact with the backend to save user progress and preferences.
